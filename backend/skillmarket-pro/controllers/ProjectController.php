<?php

class ProjectController
{
    // ──────────────────────────────────────────────────────────────────────────
    // GET /api/projects
    // Public – paginated list with optional filters
    // ──────────────────────────────────────────────────────────────────────────
    public function index(): never
    {
        $page    = max(1, (int)($_GET['page']     ?? 1));
        $perPage = max(1, (int)($_GET['per_page'] ?? 10));
        $status  = $_GET['status'] ?? '';
        $skill   = trim($_GET['skill']   ?? '');
        $search  = trim($_GET['search']  ?? '');

        $where  = ['1=1'];
        $params = [];

        if ($status !== '') {
            $where[]  = 'p.status = ?';
            $params[] = $status;
        }
        if ($skill !== '') {
            $where[]  = 'p.skills_required LIKE ?';
            $params[] = "%{$skill}%";
        }
        if ($search !== '') {
            $where[]  = '(p.title LIKE ? OR p.description LIKE ?)';
            $params[] = "%{$search}%";
            $params[] = "%{$search}%";
        }

        // Bug 9: Hide projects where student already has an approved application
        if (Auth::check() && Auth::user()->role === 'student') {
            $studentId = Auth::id();
            $where[] = "p.id NOT IN (
                SELECT a.project_id FROM applications a
                WHERE a.student_id = ? AND a.status = 'approved'
            )";
            $params[] = $studentId;
        }

        $whereStr = implode(' AND ', $where);
        $total    = (int)DB::scalar(
            "SELECT COUNT(*) FROM projects p WHERE {$whereStr}",
            $params
        );

        // Sort handling
        $sort = trim($_GET['sort'] ?? '');
        $orderBy = match ($sort) {
            'oldest'      => 'p.created_at ASC',
            'budget_high' => 'p.budget_max DESC, p.created_at DESC',
            'deadline'    => 'p.deadline ASC',
            default       => 'p.created_at DESC',
        };

        $offset = ($page - 1) * $perPage;
        $rows   = DB::query(
            "SELECT p.*,
                    u.name AS employer_name,
                    (SELECT COUNT(*) FROM applications a WHERE a.project_id = p.id) AS application_count
             FROM projects p
             JOIN users u ON u.id = p.employer_id
             WHERE {$whereStr}
             ORDER BY {$orderBy}
             LIMIT {$perPage} OFFSET {$offset}",
            $params
        );

        foreach ($rows as $row) {
            $row->skills_required = json_decode($row->skills_required ?? '[]', true) ?? [];
        }

        Response::success([
            'data'         => $rows,
            'total'        => $total,
            'page'         => $page,
            'per_page'     => $perPage,
            'last_page'    => max(1, (int)ceil($total / $perPage)),
        ]);
    }

    // ──────────────────────────────────────────────────────────────────────────
    // GET /api/projects/{id}
    // ──────────────────────────────────────────────────────────────────────────
    public function show(int $id): never
    {
        $project = DB::queryOne(
            "SELECT p.*,
                    u.name AS employer_name, u.email AS employer_email,
                    (SELECT COUNT(*) FROM applications a WHERE a.project_id = p.id) AS application_count
             FROM projects p
             JOIN users u ON u.id = p.employer_id
             WHERE p.id = ?",
            [$id]
        );

        if (!$project) {
            Response::error('Project not found.', 404);
        }

        DB::execute('UPDATE projects SET views = views + 1 WHERE id = ?', [$id]);
        $project->views = ($project->views ?? 0) + 1;
        $project->skills_required = json_decode($project->skills_required ?? '[]', true) ?? [];

        $project->already_applied = false;
$project->my_application_status = null;
if (Auth::check() && Auth::user()->role === 'student') {
    $app = DB::queryOne(
        'SELECT id, status FROM applications WHERE project_id = ? AND student_id = ?',
        [$id, Auth::id()]
    );
    if ($app) {
        $project->already_applied = true;
        $project->my_application_status = $app->status;
    }
}

        Response::success($project);
    }

    // ──────────────────────────────────────────────────────────────────────────
    // POST /api/projects  (employer only)
    // ──────────────────────────────────────────────────────────────────────────
    public function store(): never
    {
        $user = $this->requireEmployer();

        $body = json_decode(file_get_contents('php://input'), true) ?? [];

        $errors = [];
        $title           = trim($body['title']           ?? '');
        $description     = trim($body['description']     ?? '');
        $skills_required = $body['skills_required']      ?? '';
        $deadline        = trim($body['deadline']        ?? '');

        if ($title === '')       $errors['title']           = 'Title is required.';
        if ($description === '') $errors['description']     = 'Description is required.';
        if (empty($skills_required)) $errors['skills_required'] = 'Skills required field is required.';
        if ($deadline === '')    $errors['deadline']        = 'Deadline is required.';

        if (!empty($errors)) {
            Response::error('Validation failed.', 422, $errors);
        }

        // Accept array or comma-string; store as JSON
        if (is_array($skills_required)) {
            $skillsJson = json_encode($skills_required);
        } else {
            $arr = array_filter(array_map('trim', explode(',', $skills_required)));
            $skillsJson = json_encode(array_values($arr));
        }

        $budget_min = isset($body['budget_min']) && $body['budget_min'] !== '' ? (int)$body['budget_min'] : null;
        $budget_max = isset($body['budget_max']) && $body['budget_max'] !== '' ? (int)$body['budget_max'] : null;
        $type_val   = in_array($body['type'] ?? '', ['remote','onsite','hybrid'], true) ? $body['type'] : null;
        $duration   = in_array($body['duration'] ?? '', ['less_1_month','1_3_months','3_6_months','ongoing'], true) ? $body['duration'] : null;

        $id = DB::insert(
            'INSERT INTO projects (employer_id, title, description, skills_required, status, deadline, budget_min, budget_max, type, duration, created_at)
             VALUES (?, ?, ?, ?, "open", ?, ?, ?, ?, ?, NOW())',
            [$user->id, $title, $description, $skillsJson, $deadline, $budget_min, $budget_max, $type_val, $duration]
        );

        $project = DB::queryOne('SELECT * FROM projects WHERE id = ?', [$id]);
        $project->skills_required = json_decode($project->skills_required ?? '[]', true) ?? [];
        Response::success($project, 'Project created successfully.', 201);
    }

    // ──────────────────────────────────────────────────────────────────────────
    // PUT /api/projects/{id}  (employer only, must own)
    // ──────────────────────────────────────────────────────────────────────────
    public function update(int $id): never
    {
        $user    = $this->requireEmployer();
        $project = $this->findOwnedProject($id, $user->id);

        $body = json_decode(file_get_contents('php://input'), true) ?? [];

        $title           = trim($body['title']           ?? $project->title);
        $description     = trim($body['description']     ?? $project->description);
        $skills_required = $body['skills_required']      ?? $project->skills_required;
        $deadline        = trim($body['deadline']        ?? $project->deadline);
        $status          = trim($body['status']          ?? $project->status);
        $budget_min      = isset($body['budget_min']) && $body['budget_min'] !== '' ? (int)$body['budget_min'] : $project->budget_min;
        $budget_max      = isset($body['budget_max']) && $body['budget_max'] !== '' ? (int)$body['budget_max'] : $project->budget_max;
        $type_val        = in_array($body['type'] ?? '', ['remote','onsite','hybrid'], true) ? $body['type'] : $project->type;
        $duration        = in_array($body['duration'] ?? '', ['less_1_month','1_3_months','3_6_months','ongoing'], true) ? $body['duration'] : $project->duration;

        if (!in_array($status, ['open', 'closed'], true)) {
            Response::error('Status must be "open" or "closed".', 422);
        }

        if (is_array($skills_required)) {
            $skillsJson = json_encode($skills_required);
        } else {
            $arr = array_filter(array_map('trim', explode(',', $skills_required)));
            $skillsJson = json_encode(array_values($arr));
        }

        DB::execute(
            'UPDATE projects SET title=?, description=?, skills_required=?, deadline=?, status=?, budget_min=?, budget_max=?, type=?, duration=? WHERE id=?',
            [$title, $description, $skillsJson, $deadline, $status, $budget_min, $budget_max, $type_val, $duration, $id]
        );

        $project = DB::queryOne('SELECT * FROM projects WHERE id = ?', [$id]);
        $project->skills_required = json_decode($project->skills_required ?? '[]', true) ?? [];
        Response::success($project, 'Project updated successfully.');
    }

    // ──────────────────────────────────────────────────────────────────────────
    // DELETE /api/projects/{id}  (employer only, must own)
    // ──────────────────────────────────────────────────────────────────────────
    public function destroy(int $id): never
    {
        $user = $this->requireEmployer();
        $this->findOwnedProject($id, $user->id);

        DB::execute('DELETE FROM projects WHERE id = ?', [$id]);
        Response::success([], 'Project deleted successfully.');
    }

    // ──────────────────────────────────────────────────────────────────────────
    // GET /api/employer/projects  (employer only)
    // ──────────────────────────────────────────────────────────────────────────
    public function myProjects(): never
    {
        $user = $this->requireEmployer();

        $projects = DB::query(
            "SELECT p.*,
                    (SELECT COUNT(*) FROM applications a WHERE a.project_id = p.id) AS application_count
             FROM projects p
             WHERE p.employer_id = ?
             ORDER BY p.created_at DESC",
            [$user->id]
        );

        foreach ($projects as $row) {
            $row->skills_required = json_decode($row->skills_required ?? '[]', true) ?? [];
        }

        Response::success($projects);
    }

    // ─── Private helpers ──────────────────────────────────────────────────────

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

    private function findOwnedProject(int $id, int $employerId): object
    {
        $project = DB::queryOne('SELECT * FROM projects WHERE id = ?', [$id]);
        if (!$project) {
            Response::error('Project not found.', 404);
        }
        if ((int)$project->employer_id !== $employerId) {
            Response::error('You do not own this project.', 403);
        }
        return $project;
    }
}
