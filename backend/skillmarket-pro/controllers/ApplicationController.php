<?php

class ApplicationController
{
    // ──────────────────────────────────────────────────────────────────────────
    // POST /api/projects/{id}/apply  (student only)
    // ──────────────────────────────────────────────────────────────────────────
    public function store(int $projectId): never
    {
        $user = $this->requireStudent();

        // Validate project exists and is open
        $project = DB::queryOne('SELECT * FROM projects WHERE id = ?', [$projectId]);
        if (!$project) {
            Response::error('Project not found.', 404);
        }
        if ($project->status !== 'open') {
            Response::error('This project is no longer accepting applications.', 409);
        }

        // Check duplicate application
        $existing = DB::queryOne(
            'SELECT id FROM applications WHERE project_id = ? AND student_id = ?',
            [$projectId, $user->id]
        );
        if ($existing) {
            Response::error('You have already applied to this project.', 409);
        }

        $body        = json_decode(file_get_contents('php://input'), true) ?? [];
        $coverLetter = trim($body['cover_letter'] ?? '');

        if ($coverLetter === '') {
            Response::error('Validation failed.', 422, ['cover_letter' => 'Cover letter is required.']);
        }

        $id = DB::insert(
            'INSERT INTO applications (project_id, student_id, cover_letter, status, created_at)
             VALUES (?, ?, ?, "pending", NOW())',
            [$projectId, $user->id, $coverLetter]
        );

        // Notify the employer about the new application
        createNotification(
            (int)$project->employer_id,
            'application',
            'New Application Received',
            "{$user->name} applied to your project: {$project->title}",
            '/my-projects'
        );

        $application = DB::queryOne('SELECT * FROM applications WHERE id = ?', [$id]);
        Response::success($application, 'Application submitted successfully.', 201);
    }

    // ──────────────────────────────────────────────────────────────────────────
    // GET /api/my-applications  (student only)
    // ──────────────────────────────────────────────────────────────────────────
    public function myApplications(): never
    {
        $user = $this->requireStudent();

        $applications = DB::query(
            "SELECT a.*,
                    p.title AS project_title, p.status AS project_status,
                    p.skills_required, p.deadline,
                    u.id AS employer_id, u.name AS employer_name
             FROM applications a
             JOIN projects p ON p.id = a.project_id
             JOIN users u ON u.id = p.employer_id
             WHERE a.student_id = ?
             ORDER BY a.created_at DESC",
            [$user->id]
        );

        Response::success($applications);
    }

    // ──────────────────────────────────────────────────────────────────────────
    // GET /api/projects/{id}/applications  (employer only, must own project)
    // ──────────────────────────────────────────────────────────────────────────
    public function projectApplications(int $projectId): never
    {
        $user = $this->requireEmployer();

        $project = DB::queryOne('SELECT * FROM projects WHERE id = ?', [$projectId]);
        if (!$project) {
            Response::error('Project not found.', 404);
        }
        if ((int)$project->employer_id !== (int)$user->id) {
            Response::error('You do not own this project.', 403);
        }

        $applications = DB::query(
            "SELECT a.*,
                    u.name AS student_name, u.email AS student_email,
                    u.bio AS student_bio
             FROM applications a
             JOIN users u ON u.id = a.student_id
             WHERE a.project_id = ?
             ORDER BY a.created_at DESC",
            [$projectId]
        );

        Response::success($applications);
    }

    // ──────────────────────────────────────────────────────────────────────────
    // PUT /api/applications/{id}/status  (employer only)
    // ──────────────────────────────────────────────────────────────────────────
    public function updateStatus(int $id): never
    {
        $user = $this->requireEmployer();

        $application = DB::queryOne('SELECT * FROM applications WHERE id = ?', [$id]);
        if (!$application) {
            Response::error('Application not found.', 404);
        }

        // Confirm the employer owns the project this application belongs to
        $project = DB::queryOne('SELECT * FROM projects WHERE id = ?', [$application->project_id]);
        if (!$project || (int)$project->employer_id !== (int)$user->id) {
            Response::error('You do not have permission to update this application.', 403);
        }

        $body   = json_decode(file_get_contents('php://input'), true) ?? [];
        $status = trim($body['status'] ?? '');

        if (!in_array($status, ['approved', 'rejected'], true)) {
            Response::error('Validation failed.', 422, ['status' => 'Status must be "approved" or "rejected".']);
        }

        DB::execute('UPDATE applications SET status = ? WHERE id = ?', [$status, $id]);

        // Fetch student info for notifications
        $student = DB::queryOne('SELECT * FROM users WHERE id = ?', [$application->student_id]);

        if ($status === 'approved') {
            // Update project to in_progress and assign the hired student
            DB::execute(
                'UPDATE projects SET status = "in_progress", hired_student_id = ?, accepted_at = NOW(), updated_at = NOW() WHERE id = ?',
                [$application->student_id, $project->id]
            );

            // Notify the student that their application was approved
            createNotification(
                (int)$application->student_id,
                'application',
                'Application Approved!',
                "Congratulations! Your application for \"{$project->title}\" has been approved. You can start working now.",
                '/my-applications'
            );

            // Notify the employer (self-confirmation)
            $studentName = $student ? $student->name : 'A student';
            createNotification(
                (int)$user->id,
                'application',
                'Student Assigned',
                "You have assigned {$studentName} to \"{$project->title}\". Project is now in progress.",
                '/my-projects'
            );
        } elseif ($status === 'rejected') {
            // Notify the student about the rejection
            createNotification(
                (int)$application->student_id,
                'application',
                'Application Update',
                "Thank you for applying to \"{$project->title}\". Unfortunately, this position has been filled. Keep applying!",
                '/my-applications'
            );
        }

        $application = DB::queryOne('SELECT * FROM applications WHERE id = ?', [$id]);
        Response::success($application, 'Application status updated.');
    }

    // ──────────────────────────────────────────────────────────────────────────
    // PATCH /api/applications/{id}/withdraw  (student only)
    // ──────────────────────────────────────────────────────────────────────────
    public function withdraw(int $id): never
    {
        $user = $this->requireStudent();

        $application = DB::queryOne('SELECT * FROM applications WHERE id = ?', [$id]);
        if (!$application) {
            Response::error('Application not found.', 404);
        }

        if ((int)$application->student_id !== (int)$user->id) {
            Response::error('You do not own this application.', 403);
        }

        if ($application->status !== 'pending') {
            Response::error('Only pending applications can be withdrawn.', 409);
        }

        DB::execute('UPDATE applications SET status = ?, updated_at = NOW() WHERE id = ?', ['withdrawn', $id]);

        $application = DB::queryOne('SELECT * FROM applications WHERE id = ?', [$id]);
        Response::success($application, 'Application withdrawn.');
    }

    // ─── Private helpers ──────────────────────────────────────────────────────

    private function requireStudent(): object
    {
        if (!Auth::check()) {
            Response::error('Unauthenticated. Please log in.', 401);
        }
        $user = Auth::user();
        if ($user->role !== 'student') {
            Response::error('Only students can perform this action.', 403);
        }
        return $user;
    }

    private function requireEmployer(): object
    {
        if (!Auth::check()) {
            Response::error('Unauthenticated. Please log in.', 401);
        }
        $user = Auth::user();
        if ($user->role !== 'employer') {
            Response::error('Only employers can perform this action.', 403);
        }
        return $user;
    }
}
