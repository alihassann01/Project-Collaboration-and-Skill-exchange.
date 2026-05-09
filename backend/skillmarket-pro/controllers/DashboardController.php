<?php

class DashboardController
{
    // ──────────────────────────────────────────────────────────────────────────
    // GET /api/dashboard  (any authenticated user, role-specific response)
    // ──────────────────────────────────────────────────────────────────────────
    public function index(): never
    {
        if (!Auth::check()) {
            Response::error('Unauthenticated. Please log in.', 401);
        }

        $user = Auth::user();

        $data = match ($user->role) {
            'student'  => $this->studentStats($user->id),
            'employer' => $this->employerStats($user->id),
            'admin'    => $this->adminStats(),
            default    => Response::error('Unknown role.', 403),
        };

        Response::success($data);
    }

    // ─── Role-specific stat builders ─────────────────────────────────────────

    private function studentStats(int $userId): array
    {
        $myApplicationsCount = (int)DB::scalar(
            'SELECT COUNT(*) FROM applications WHERE student_id = ?', [$userId]
        );
        $approvedCount = (int)DB::scalar(
            'SELECT COUNT(*) FROM applications WHERE student_id = ? AND status = "approved"', [$userId]
        );
        $pendingCount = (int)DB::scalar(
            'SELECT COUNT(*) FROM applications WHERE student_id = ? AND status = "pending"', [$userId]
        );
        $openProjectsCount = (int)DB::scalar(
            'SELECT COUNT(*) FROM projects WHERE status = "open"'
        );

        $recentApplications = DB::query(
            "SELECT a.*, a.created_at AS applied_at,
                    p.title AS project_title, p.status AS project_status,
                    u.id AS employer_id, u.name AS employer_name
             FROM applications a
             JOIN projects p ON p.id = a.project_id
             JOIN users u ON u.id = p.employer_id
             WHERE a.student_id = ?
             ORDER BY a.created_at DESC
             LIMIT 5",
            [$userId]
        );

        return [
            'my_applications_count' => $myApplicationsCount,
            'approved_count'        => $approvedCount,
            'pending_count'         => $pendingCount,
            'open_projects_count'   => $openProjectsCount,
            'recent_applications'   => $recentApplications,
        ];
    }

    private function employerStats(int $userId): array
    {
        $myProjectsCount = (int)DB::scalar(
            'SELECT COUNT(*) FROM projects WHERE employer_id = ?', [$userId]
        );
        $totalApplications = (int)DB::scalar(
            'SELECT COUNT(*) FROM applications a
             JOIN projects p ON p.id = a.project_id
             WHERE p.employer_id = ?',
            [$userId]
        );
        $pendingApplications = (int)DB::scalar(
            'SELECT COUNT(*) FROM applications a
             JOIN projects p ON p.id = a.project_id
             WHERE p.employer_id = ? AND a.status = "pending"',
            [$userId]
        );

        $recentProjects = DB::query(
            "SELECT p.*,
                    (SELECT COUNT(*) FROM applications a WHERE a.project_id = p.id) AS application_count
             FROM projects p
             WHERE p.employer_id = ?
             ORDER BY p.created_at DESC
             LIMIT 5",
            [$userId]
        );

        return [
            'my_projects_count'   => $myProjectsCount,
            'total_applications'  => $totalApplications,
            'pending_applications'=> $pendingApplications,
            'recent_projects'     => $recentProjects,
        ];
    }

    private function adminStats(): array
    {
        $totalUsers     = (int)DB::scalar('SELECT COUNT(*) FROM users');
        $totalStudents  = (int)DB::scalar('SELECT COUNT(*) FROM users WHERE role = "student"');
        $totalEmployers = (int)DB::scalar('SELECT COUNT(*) FROM users WHERE role = "employer"');
        $totalProjects  = (int)DB::scalar('SELECT COUNT(*) FROM projects');
        $openProjects   = (int)DB::scalar('SELECT COUNT(*) FROM projects WHERE status = "open"');
        $totalApplications = (int)DB::scalar('SELECT COUNT(*) FROM applications');

        return [
            'total_users'        => $totalUsers,
            'total_students'     => $totalStudents,
            'total_employers'    => $totalEmployers,
            'total_projects'     => $totalProjects,
            'open_projects'      => $openProjects,
            'total_applications' => $totalApplications,
        ];
    }
}
