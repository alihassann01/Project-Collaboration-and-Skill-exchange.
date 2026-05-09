<?php

class AdminController
{
    private static function requireAdmin(): bool
    {
        if (!Auth::check() || Auth::user()->role !== 'admin') {
            Response::error('Forbidden.', 403);
            return false;
        }
        return true;
    }

    // GET /api/admin
    public static function dashboard(): void
    {
        if (!self::requireAdmin()) return;

        $stats = [
            'total_users'        => (int) DB::scalar('SELECT COUNT(*) FROM users'),
            'total_students'     => (int) DB::scalar('SELECT COUNT(*) FROM users WHERE role = "student"'),
            'total_employers'    => (int) DB::scalar('SELECT COUNT(*) FROM users WHERE role = "employer"'),
            'total_projects'     => (int) DB::scalar('SELECT COUNT(*) FROM projects'),
            'open_projects'      => (int) DB::scalar('SELECT COUNT(*) FROM projects WHERE status = "open"'),
            'total_applications' => (int) DB::scalar('SELECT COUNT(*) FROM applications'),
        ];

        $recentUsers = DB::query(
            'SELECT id, name, email, role, created_at FROM users ORDER BY created_at DESC LIMIT 5'
        );

        $recentProjects = DB::query(
            'SELECT p.id, p.title, u.name AS employer_name, p.status, p.created_at
             FROM projects p
             JOIN users u ON p.employer_id = u.id
             ORDER BY p.created_at DESC LIMIT 5'
        );

        Response::success([
            'stats'           => $stats,
            'recent_users'    => $recentUsers,
            'recent_projects' => $recentProjects,
        ]);
    }

    // GET /api/admin/users
    public static function users(): void
    {
        if (!self::requireAdmin()) return;

        $page    = max(1, (int)($_GET['page']     ?? 1));
        $perPage = max(1, min(100, (int)($_GET['per_page'] ?? 20)));
        $search  = trim($_GET['search'] ?? '');

        $where  = ['1=1'];
        $params = [];
        if ($search !== '') {
            $where[]  = '(name LIKE ? OR email LIKE ?)';
            $params[] = "%{$search}%";
            $params[] = "%{$search}%";
        }
        $whereStr = implode(' AND ', $where);

        $total = (int) DB::scalar("SELECT COUNT(*) FROM users WHERE {$whereStr}", $params);
        $offset = ($page - 1) * $perPage;

        $users = DB::query(
            "SELECT id, name, email, role, is_active, created_at FROM users WHERE {$whereStr} ORDER BY created_at DESC LIMIT {$perPage} OFFSET {$offset}",
            $params
        );

        Response::success([
            'users'      => $users,
            'total'      => $total,
            'page'       => $page,
            'per_page'   => $perPage,
            'last_page'  => max(1, (int) ceil($total / $perPage)),
        ]);
    }

    // PATCH /api/admin/users/{id}/toggle
    public static function toggleUser(int $id): void
    {
        if (!self::requireAdmin()) return;

        $user = DB::queryOne('SELECT * FROM users WHERE id = ?', [$id]);
        if (!$user) { Response::error('User not found.', 404); return; }
        if ($user->role === 'admin') { Response::error('Cannot modify admin accounts.', 403); return; }

        $newActive = $user->is_active ? 0 : 1;
        DB::execute('UPDATE users SET is_active = ?, updated_at = NOW() WHERE id = ?', [$newActive, $id]);

        $updated = DB::queryOne('SELECT id, name, email, role, is_active, created_at FROM users WHERE id = ?', [$id]);
        Response::success(['user' => $updated], $newActive ? 'User activated.' : 'User suspended.');
    }

    // DELETE /api/admin/users/{id}
    public static function deleteUser(int $id): void
    {
        if (!self::requireAdmin()) return;

        $user = DB::queryOne('SELECT * FROM users WHERE id = ?', [$id]);
        if (!$user) { Response::error('User not found.', 404); return; }
        if ($user->role === 'admin') { Response::error('Cannot delete admin accounts.', 403); return; }

        DB::execute('DELETE FROM users WHERE id = ?', [$id]);
        Response::success([], 'User deleted.');
    }

    // GET /api/admin/projects
    public static function projects(): void
    {
        if (!self::requireAdmin()) return;

        $page    = max(1, (int)($_GET['page']     ?? 1));
        $perPage = max(1, min(100, (int)($_GET['per_page'] ?? 20)));
        $search  = trim($_GET['search'] ?? '');

        $where  = ['1=1'];
        $params = [];
        if ($search !== '') {
            $where[]  = '(p.title LIKE ? OR u.name LIKE ?)';
            $params[] = "%{$search}%";
            $params[] = "%{$search}%";
        }
        $whereStr = implode(' AND ', $where);

        $total = (int) DB::scalar(
            "SELECT COUNT(*) FROM projects p JOIN users u ON p.employer_id = u.id WHERE {$whereStr}",
            $params
        );
        $offset = ($page - 1) * $perPage;

        $projects = DB::query(
            "SELECT p.id, p.title, p.employer_id, u.name AS employer_name, p.status, p.created_at,
                    (SELECT COUNT(*) FROM applications WHERE project_id = p.id) AS applications_count
             FROM projects p
             JOIN users u ON p.employer_id = u.id
             WHERE {$whereStr}
             ORDER BY p.created_at DESC
             LIMIT {$perPage} OFFSET {$offset}",
            $params
        );

        Response::success([
            'projects'   => $projects,
            'total'      => $total,
            'page'       => $page,
            'per_page'   => $perPage,
            'last_page'  => max(1, (int) ceil($total / $perPage)),
        ]);
    }

    // PATCH /api/admin/projects/{id}/close
    public static function closeProject(int $id): void
    {
        if (!self::requireAdmin()) return;

        $project = DB::queryOne('SELECT * FROM projects WHERE id = ?', [$id]);
        if (!$project) { Response::error('Project not found.', 404); return; }

        DB::execute('UPDATE projects SET status = "closed", updated_at = NOW() WHERE id = ?', [$id]);

        $updated = DB::queryOne(
            'SELECT p.id, p.title, u.name AS employer_name, p.status, p.created_at,
                    (SELECT COUNT(*) FROM applications WHERE project_id = p.id) AS applications_count
             FROM projects p JOIN users u ON p.employer_id = u.id WHERE p.id = ?',
            [$id]
        );
        Response::success(['project' => $updated], 'Project closed.');
    }

    // DELETE /api/admin/projects/{id}
    public static function deleteProject(int $id): void
    {
        if (!self::requireAdmin()) return;

        $project = DB::queryOne('SELECT * FROM projects WHERE id = ?', [$id]);
        if (!$project) { Response::error('Project not found.', 404); return; }

        DB::execute('DELETE FROM projects WHERE id = ?', [$id]);
        Response::success([], 'Project deleted.');
    }

    // PATCH /api/admin/projects/{id}/reopen
    public static function reopenProject(int $id): void
    {
        if (!self::requireAdmin()) return;

        $project = DB::queryOne('SELECT * FROM projects WHERE id = ?', [$id]);
        if (!$project) { Response::error('Project not found.', 404); return; }

        DB::execute('UPDATE projects SET status = "open", updated_at = NOW() WHERE id = ?', [$id]);

        $updated = DB::queryOne(
            'SELECT p.id, p.title, u.name AS employer_name, p.status, p.created_at,
                    (SELECT COUNT(*) FROM applications WHERE project_id = p.id) AS applications_count
             FROM projects p JOIN users u ON p.employer_id = u.id WHERE p.id = ?',
            [$id]
        );
        Response::success(['project' => $updated], 'Project reopened.');
    }

    // GET /api/admin/reports
    public static function reports(): void
    {
        if (!self::requireAdmin()) return;

        $appsByStatus = DB::query('SELECT status, COUNT(*) AS count FROM applications GROUP BY status');

        $topProjects = DB::query(
            'SELECT p.id, p.title, u.name AS employer_name,
                    COUNT(a.id) AS applications_count
             FROM projects p
             JOIN users u ON p.employer_id = u.id
             LEFT JOIN applications a ON a.project_id = p.id
             GROUP BY p.id
             ORDER BY applications_count DESC
             LIMIT 5'
        );

        $newUsersLast30 = (int) DB::scalar(
            'SELECT COUNT(*) FROM users WHERE created_at >= DATE_SUB(NOW(), INTERVAL 30 DAY)'
        );

        $skillSwapTotal = (int) DB::scalar('SELECT COUNT(*) FROM skill_swaps');

        Response::success([
            'applications_by_status' => $appsByStatus,
            'top_projects'           => $topProjects,
            'new_users_last_30_days' => $newUsersLast30,
            'skill_swap_total'       => $skillSwapTotal,
        ]);
    }
}
