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
        $this->ensureDeliverySchema();
        $this->ensurePaymentSchema();

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

        // Only count views from non-owners; session flag deduplicates repeat visits.
        $isOwner = Auth::check() && (int)Auth::id() === (int)$project->employer_id;
        $sessionKey = 'viewed_project_' . $id;
        if (!$isOwner && empty($_SESSION[$sessionKey])) {
            DB::execute('UPDATE projects SET views = views + 1 WHERE id = ?', [$id]);
            $project->views = ($project->views ?? 0) + 1;
            $_SESSION[$sessionKey] = true;
        }
        $project->skills_required = json_decode($project->skills_required ?? '[]', true) ?? [];
        $this->attachPaymentContext($project);

        $project->already_applied = false;
        $project->my_application_id = null;
        $project->my_application_status = null;
        $project->my_meeting_link = null;
        if (Auth::check() && Auth::user()->role === 'student') {
            $app = DB::queryOne(
                'SELECT id, status, meeting_link FROM applications WHERE project_id = ? AND student_id = ?',
                [$id, Auth::id()]
            );
            if ($app) {
                $project->already_applied = $app->status !== 'withdrawn';
                $project->my_application_id = (int)$app->id;
                $project->my_application_status = $app->status;
                $project->my_meeting_link = $app->meeting_link;
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
        $status          = array_key_exists('status', $body) ? trim($body['status']) : $project->status;
        $budget_min      = isset($body['budget_min']) && $body['budget_min'] !== '' ? (int)$body['budget_min'] : $project->budget_min;
        $budget_max      = isset($body['budget_max']) && $body['budget_max'] !== '' ? (int)$body['budget_max'] : $project->budget_max;
        $type_val        = in_array($body['type'] ?? '', ['remote','onsite','hybrid'], true) ? $body['type'] : $project->type;
        $duration        = in_array($body['duration'] ?? '', ['less_1_month','1_3_months','3_6_months','ongoing'], true) ? $body['duration'] : $project->duration;

        if (array_key_exists('status', $body) && !in_array($status, ['open', 'closed'], true)) {
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
        $this->ensureDeliverySchema();

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

    // ──────────────────────────────────────────────────────────────────────────
    // PATCH /api/projects/{id}/complete  (employer only, must own)
    // ──────────────────────────────────────────────────────────────────────────
    public function complete(int $id): never
    {
        $this->ensureDeliverySchema();

        $user    = $this->requireEmployer();
        $project = $this->findOwnedProject($id, $user->id);

        if ($project->status !== 'in_progress') {
            Response::error('Only in-progress projects can be marked as completed.', 409);
        }

        DB::execute(
            'UPDATE projects SET status = "completed", updated_at = NOW() WHERE id = ?',
            [$id]
        );

        // Notify the hired student that project is completed
        notifyProjectCompleted($id);

        // Also notify employer (self-confirmation)
        createNotification(
            (int)$user->id,
            'project_completed',
            'Project Marked Complete',
            "You have marked \"{$project->title}\" as completed. You can now rate the student.",
            '/my-projects'
        );

        $project = DB::queryOne('SELECT * FROM projects WHERE id = ?', [$id]);
        $project->skills_required = json_decode($project->skills_required ?? '[]', true) ?? [];
        Response::success($project, 'Project marked as completed successfully.');
    }

    // ─── Private helpers ──────────────────────────────────────────────────────

    public function deliver(int $id): never
    {
        $this->ensureDeliverySchema();

        $user = $this->requireStudent();
        $project = DB::queryOne('SELECT * FROM projects WHERE id = ?', [$id]);
        if (!$project) {
            Response::error('Project not found.', 404);
        }

        if ((int)($project->hired_student_id ?? 0) !== (int)$user->id) {
            Response::error('Only the hired student can deliver this project.', 403);
        }

        if (!in_array($project->status, ['in_progress', 'revision_requested'], true)) {
            Response::error('This project is not ready for delivery right now.', 409);
        }

        if (!empty($project->deadline) && strtotime($project->deadline . ' 23:59:59') < time()) {
            Response::error('The delivery deadline has passed.', 409);
        }

        if (empty($_FILES['delivery_file']) || !is_uploaded_file($_FILES['delivery_file']['tmp_name'])) {
            Response::error('Please attach a ZIP file.', 422, ['delivery_file' => 'ZIP file is required.']);
        }

        $file = $_FILES['delivery_file'];
        if (($file['error'] ?? UPLOAD_ERR_OK) !== UPLOAD_ERR_OK) {
            Response::error('Upload failed. Please try again.', 422);
        }

        $originalName = basename($file['name'] ?? 'delivery.zip');
        if (strtolower(pathinfo($originalName, PATHINFO_EXTENSION)) !== 'zip') {
            Response::error('Only ZIP files are allowed.', 422, ['delivery_file' => 'Attach a .zip file.']);
        }

        if (($file['size'] ?? 0) > 100 * 1024 * 1024) {
            Response::error('The ZIP file must be 100MB or smaller.', 422);
        }

        $deliveryDir = STORAGE . '/deliveries';
        if (!is_dir($deliveryDir)) {
            mkdir($deliveryDir, 0775, true);
        }

        if (!empty($project->delivery_file_path)) {
            $oldPath = STORAGE . '/' . ltrim($project->delivery_file_path, '/\\');
            if (is_file($oldPath)) {
                @unlink($oldPath);
            }
        }

        $safeName = preg_replace('/[^A-Za-z0-9._-]/', '_', $originalName);
        $storedName = $id . '_' . time() . '_' . bin2hex(random_bytes(4)) . '_' . $safeName;
        $relativePath = 'deliveries/' . $storedName;
        $targetPath = $deliveryDir . '/' . $storedName;

        if (!move_uploaded_file($file['tmp_name'], $targetPath)) {
            Response::error('Could not save the uploaded file.', 500);
        }

        DB::execute(
            'UPDATE projects
             SET status = "delivered",
                 delivery_file_path = ?,
                 delivery_original_name = ?,
                 delivered_at = NOW(),
                 reviewed_at = NULL,
                 revision_note = NULL,
                 updated_at = NOW()
             WHERE id = ?',
            [$relativePath, $originalName, $id]
        );

        createNotification(
            (int)$project->employer_id,
            'project_delivery',
            'Project Delivered',
            "\"{$project->title}\" has been delivered by {$user->name}.",
            '/projects/' . $id
        );

        $project = DB::queryOne('SELECT * FROM projects WHERE id = ?', [$id]);
        $project->skills_required = json_decode($project->skills_required ?? '[]', true) ?? [];
        Response::success($project, 'Project delivered successfully.');
    }

    public function downloadDelivery(int $id): never
    {
        $this->ensureDeliverySchema();

        if (!Auth::check()) {
            Response::error('Unauthenticated. Please log in.', 401);
        }

        $user = Auth::user();
        $project = DB::queryOne('SELECT * FROM projects WHERE id = ?', [$id]);
        if (!$project || empty($project->delivery_file_path)) {
            Response::error('Delivery file not found.', 404);
        }

        $isEmployer = $user->role === 'employer' && (int)$project->employer_id === (int)$user->id;
        $isStudent = $user->role === 'student' && (int)($project->hired_student_id ?? 0) === (int)$user->id;
        if (!$isEmployer && !$isStudent) {
            Response::error('You do not have permission to download this delivery.', 403);
        }

        $filePath = STORAGE . '/' . ltrim($project->delivery_file_path, '/\\');
        if (!is_file($filePath)) {
            Response::error('Delivery file not found on server.', 404);
        }

        $downloadName = $project->delivery_original_name ?: ('project-' . $id . '-delivery.zip');
        header('Content-Type: application/zip');
        header('Content-Length: ' . filesize($filePath));
        header('Content-Disposition: attachment; filename="' . str_replace('"', '', $downloadName) . '"');
        readfile($filePath);
        exit;
    }

    public function startReview(int $id): never
    {
        $this->ensureDeliverySchema();

        $user = $this->requireEmployer();
        $project = $this->findOwnedProject($id, $user->id);

        if ($project->status !== 'delivered') {
            Response::error('Only delivered projects can be moved to review.', 409);
        }

        DB::execute(
            'UPDATE projects SET status = "reviewing", reviewed_at = NOW(), updated_at = NOW() WHERE id = ?',
            [$id]
        );

        if (!empty($project->hired_student_id)) {
            createNotification(
                (int)$project->hired_student_id,
                'project_reviewing',
                'Project Under Review',
                "\"{$project->title}\" is now being reviewed by the employer.",
                '/projects/' . $id
            );
        }

        $project = DB::queryOne('SELECT * FROM projects WHERE id = ?', [$id]);
        $project->skills_required = json_decode($project->skills_required ?? '[]', true) ?? [];
        Response::success($project, 'Project moved to review.');
    }

    public function deliveryDecision(int $id): never
    {
        $this->ensureDeliverySchema();

        $user = $this->requireEmployer();
        $project = $this->findOwnedProject($id, $user->id);

        if (!in_array($project->status, ['reviewing', 'delivered'], true)) {
            Response::error('Only delivered or reviewing projects can be approved or sent back.', 409);
        }

        $body = json_decode(file_get_contents('php://input'), true) ?? [];
        $decision = trim($body['decision'] ?? '');
        $note = trim($body['note'] ?? '');

        if (!in_array($decision, ['approved', 'rejected'], true)) {
            Response::error('Decision must be "approved" or "rejected".', 422);
        }

        if ($decision === 'approved') {
            DB::execute(
                'UPDATE projects SET status = "completed", completed_at = NOW(), reviewed_at = NOW(), updated_at = NOW() WHERE id = ?',
                [$id]
            );

            if (!empty($project->hired_student_id)) {
                createNotification(
                    (int)$project->hired_student_id,
                    'project_approved',
                    'Project Approved',
                    "Your delivery for \"{$project->title}\" has been approved. Add your payment details so the employer can pay you.",
                    '/projects/' . $id
                );
            }
        } else {
            DB::execute(
                'UPDATE projects SET status = "revision_requested", revision_note = ?, reviewed_at = NOW(), updated_at = NOW() WHERE id = ?',
                [$note ?: null, $id]
            );

            if (!empty($project->hired_student_id)) {
                createNotification(
                    (int)$project->hired_student_id,
                    'project_revision',
                    'Project Needs Changes',
                    "The employer requested changes for \"{$project->title}\". Please upload a revised ZIP.",
                    '/projects/' . $id
                );
            }
        }

        $project = DB::queryOne('SELECT * FROM projects WHERE id = ?', [$id]);
        $project->skills_required = json_decode($project->skills_required ?? '[]', true) ?? [];
        Response::success($project, $decision === 'approved' ? 'Project approved.' : 'Revision requested.');
    }

    public function savePaymentDetails(int $id): never
    {
        $this->ensurePaymentSchema();

        $user = $this->requireStudent();
        $project = DB::queryOne('SELECT * FROM projects WHERE id = ?', [$id]);
        if (!$project) {
            Response::error('Project not found.', 404);
        }
        if ((int)($project->hired_student_id ?? 0) !== (int)$user->id) {
            Response::error('Only the hired student can add payment details.', 403);
        }
        if ($project->status !== 'completed') {
            Response::error('Payment details can be added after the employer approves the delivery.', 409);
        }

        $body = json_decode(file_get_contents('php://input'), true) ?? [];
        $method = trim((string)($body['method'] ?? ''));
        $accountTitle = trim((string)($body['account_title'] ?? ''));
        $phoneNumber = trim((string)($body['phone_number'] ?? ''));
        $bankName = trim((string)($body['bank_name'] ?? ''));
        $accountNumber = trim((string)($body['account_number'] ?? ''));
        $iban = strtoupper(trim((string)($body['iban'] ?? '')));

        if (!in_array($method, ['easypaisa', 'jazzcash', 'bank'], true)) {
            Response::error('Select Easypaisa, JazzCash, or bank transfer.', 422);
        }
        if ($accountTitle === '') {
            Response::error('Account title is required.', 422);
        }
        if (in_array($method, ['easypaisa', 'jazzcash'], true) && $phoneNumber === '') {
            Response::error('Phone number is required for Easypaisa and JazzCash.', 422);
        }
        if ($method === 'bank' && ($bankName === '' || ($accountNumber === '' && $iban === ''))) {
            Response::error('Bank name and account number or IBAN are required for bank payments.', 422);
        }

        $existing = DB::queryOne('SELECT id FROM project_payment_details WHERE project_id = ?', [$id]);
        if ($existing) {
            Response::error('Payment details are already saved and cannot be changed for this project.', 409);
        }

        DB::execute(
            'INSERT INTO project_payment_details
             (project_id, student_id, method, account_title, phone_number, bank_name, account_number, iban, created_at, updated_at)
             VALUES (?, ?, ?, ?, ?, ?, ?, ?, NOW(), NOW())',
            [$id, $user->id, $method, $accountTitle, $phoneNumber ?: null, $bankName ?: null, $accountNumber ?: null, $iban ?: null]
        );

        createNotification(
            (int)$project->employer_id,
            'project_payment_details',
            'Payment Details Added',
            "{$user->name} added payment details for \"{$project->title}\". You can now pay the student.",
            '/projects/' . $id
        );

        Response::success(['payment_details' => $this->paymentDetailsForProject($id)], 'Payment details saved.');
    }

    public function submitPayment(int $id): never
    {
        $this->ensurePaymentSchema();

        $user = $this->requireEmployer();
        $project = $this->findOwnedProject($id, $user->id);

        if (empty($project->hired_student_id)) {
            Response::error('Assign a student before submitting payment.', 409);
        }

        if ($project->status !== 'completed') {
            Response::error('Payment can only be submitted after approving the delivery.', 409);
        }

        $paymentDetails = $this->paymentDetailsForProject($id);
        if (!$paymentDetails) {
            Response::error('Student has not added payment details yet.', 409);
        }

        $amount = (float)($_POST['amount'] ?? 0);
        $method = trim((string)($_POST['method'] ?? ''));
        $transactionReference = trim((string)($_POST['transaction_reference'] ?? ''));
        $note = trim((string)($_POST['note'] ?? ''));
        $bankName = $paymentDetails->bank_name ?? null;
        $accountTitle = $paymentDetails->account_title ?? null;
        $accountNumber = $paymentDetails->account_number ?? null;
        $iban = $paymentDetails->iban ?? null;
        $phoneNumber = $paymentDetails->phone_number ?? null;

        if ($amount <= 0) {
            Response::error('Payment amount is required.', 422, ['amount' => 'Enter a valid amount.']);
        }
        if ($method !== $paymentDetails->method) {
            Response::error('Payment method must match the details added by the student.', 422, ['method' => 'Method mismatch.']);
        }
        if ($transactionReference === '') {
            Response::error('Transaction reference is required.', 422, ['transaction_reference' => 'Reference is required.']);
        }
        if (empty($_FILES['receipt_file']) || !is_uploaded_file($_FILES['receipt_file']['tmp_name'])) {
            Response::error('Please attach a payment receipt or screenshot.', 422, ['receipt_file' => 'Receipt is required.']);
        }

        $file = $_FILES['receipt_file'];
        if (($file['error'] ?? UPLOAD_ERR_OK) !== UPLOAD_ERR_OK) {
            Response::error('Receipt upload failed. Please try again.', 422);
        }
        if (($file['size'] ?? 0) > 10 * 1024 * 1024) {
            Response::error('Receipt file must be 10MB or smaller.', 422);
        }

        $originalName = basename($file['name'] ?? 'payment-receipt');
        $extension = strtolower(pathinfo($originalName, PATHINFO_EXTENSION));
        $allowedExtensions = ['jpg', 'jpeg', 'png', 'webp', 'pdf'];
        if (!in_array($extension, $allowedExtensions, true)) {
            Response::error('Receipt must be JPG, PNG, WebP, or PDF.', 422);
        }

        $receiptDir = STORAGE . '/payment_receipts';
        if (!is_dir($receiptDir)) {
            mkdir($receiptDir, 0775, true);
        }

        $safeName = preg_replace('/[^A-Za-z0-9._-]/', '_', $originalName);
        $storedName = $id . '_' . time() . '_' . bin2hex(random_bytes(4)) . '_' . $safeName;
        $relativePath = 'payment_receipts/' . $storedName;
        $targetPath = $receiptDir . '/' . $storedName;

        if (!move_uploaded_file($file['tmp_name'], $targetPath)) {
            Response::error('Could not save the payment receipt.', 500);
        }

        $paymentId = DB::insert(
            'INSERT INTO project_payments
             (project_id, employer_id, student_id, amount, method, bank_name, account_title, account_number, iban,
              phone_number, transaction_reference, receipt_path, receipt_original_name, note, status, submitted_at, created_at, updated_at)
             VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, "submitted", NOW(), NOW(), NOW())',
            [
                $id,
                $user->id,
                $project->hired_student_id,
                $amount,
                $method,
                $bankName ?: null,
                $accountTitle ?: null,
                $accountNumber ?: null,
                $iban ?: null,
                $phoneNumber ?: null,
                $transactionReference,
                $relativePath,
                $originalName,
                $note ?: null,
            ]
        );

        createNotification(
            (int)$project->hired_student_id,
            'project_payment',
            'Payment Submitted',
            "Payment for \"{$project->title}\" was submitted by {$user->name}. Please confirm once received.",
            '/projects/' . $id
        );

        Response::success(['payment' => $this->paymentById($paymentId)], 'Payment submitted for student confirmation.', 201);
    }

    public function downloadPaymentReceipt(int $id, int $paymentId): never
    {
        $this->ensurePaymentSchema();

        if (!Auth::check()) {
            Response::error('Unauthenticated. Please log in.', 401);
        }

        $user = Auth::user();
        $payment = $this->paymentById($paymentId);
        if (!$payment || (int)$payment->project_id !== $id) {
            Response::error('Payment receipt not found.', 404);
        }

        $isEmployer = $user->role === 'employer' && (int)$payment->employer_id === (int)$user->id;
        $isStudent = $user->role === 'student' && (int)$payment->student_id === (int)$user->id;
        $isAdmin = $user->role === 'admin';
        if (!$isEmployer && !$isStudent && !$isAdmin) {
            Response::error('You do not have permission to download this receipt.', 403);
        }

        $filePath = STORAGE . '/' . ltrim($payment->receipt_path ?? '', '/\\');
        if (!is_file($filePath)) {
            Response::error('Receipt file not found on server.', 404);
        }

        $downloadName = $payment->receipt_original_name ?: ('project-' . $id . '-payment-receipt');
        $extension = strtolower(pathinfo($downloadName, PATHINFO_EXTENSION));
        $contentType = $extension === 'pdf' ? 'application/pdf' : 'image/' . ($extension === 'jpg' ? 'jpeg' : $extension);
        header('Content-Type: ' . $contentType);
        header('Content-Length: ' . filesize($filePath));
        header('Content-Disposition: attachment; filename="' . str_replace('"', '', $downloadName) . '"');
        readfile($filePath);
        exit;
    }

    public function confirmPayment(int $id, int $paymentId): never
    {
        $this->ensurePaymentSchema();

        $user = $this->requireStudent();
        $payment = $this->paymentById($paymentId);
        if (!$payment || (int)$payment->project_id !== $id || (int)$payment->student_id !== (int)$user->id) {
            Response::error('Payment not found.', 404);
        }
        if ($payment->status !== 'submitted') {
            Response::error('Only submitted payments can be confirmed.', 409);
        }

        DB::execute(
            'UPDATE project_payments SET status = "confirmed", confirmed_at = NOW(), updated_at = NOW() WHERE id = ?',
            [$paymentId]
        );

        $project = DB::queryOne('SELECT title FROM projects WHERE id = ?', [$id]);
        createNotification(
            (int)$payment->employer_id,
            'project_payment',
            'Payment Confirmed',
            "{$user->name} confirmed receiving payment for \"{$project->title}\".",
            '/projects/' . $id
        );

        Response::success(['payment' => $this->paymentById($paymentId)], 'Payment confirmed.');
    }

    public function disputePayment(int $id, int $paymentId): never
    {
        $this->ensurePaymentSchema();

        $user = $this->requireStudent();
        $payment = $this->paymentById($paymentId);
        if (!$payment || (int)$payment->project_id !== $id || (int)$payment->student_id !== (int)$user->id) {
            Response::error('Payment not found.', 404);
        }
        if ($payment->status !== 'submitted') {
            Response::error('Only submitted payments can be disputed.', 409);
        }

        $body = json_decode(file_get_contents('php://input'), true) ?? [];
        $note = trim((string)($body['note'] ?? ''));

        DB::execute(
            'UPDATE project_payments SET status = "disputed", dispute_note = ?, disputed_at = NOW(), updated_at = NOW() WHERE id = ?',
            [$note ?: null, $paymentId]
        );

        $project = DB::queryOne('SELECT title FROM projects WHERE id = ?', [$id]);
        createNotification(
            (int)$payment->employer_id,
            'project_payment',
            'Payment Disputed',
            "{$user->name} reported an issue with payment for \"{$project->title}\".",
            '/projects/' . $id
        );

        Response::success(['payment' => $this->paymentById($paymentId)], 'Payment marked as disputed.');
    }

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

    private function attachPaymentContext(object $project): void
    {
        $project->latest_payment = null;
        $project->payment_details = null;

        if (!Auth::check()) return;

        $user = Auth::user();
        $isEmployer = $user->role === 'employer' && (int)$project->employer_id === (int)$user->id;
        $isStudent = $user->role === 'student' && (int)($project->hired_student_id ?? 0) === (int)$user->id;
        $isAdmin = $user->role === 'admin';

        if (!$isEmployer && !$isStudent && !$isAdmin) return;

        $project->latest_payment = DB::queryOne(
            'SELECT id, project_id, employer_id, student_id, amount, method, bank_name, account_title, account_number,
                    iban, phone_number, transaction_reference, receipt_original_name, note, status, dispute_note,
                    submitted_at, confirmed_at, disputed_at, created_at
             FROM project_payments
             WHERE project_id = ?
             ORDER BY created_at DESC, id DESC
             LIMIT 1',
            [$project->id]
        );

        $project->payment_details = $this->paymentDetailsForProject((int)$project->id);
    }

    private function paymentById(int $paymentId): ?object
    {
        return DB::queryOne(
            'SELECT id, project_id, employer_id, student_id, amount, method, bank_name, account_title, account_number,
                    iban, phone_number, transaction_reference, receipt_path, receipt_original_name, note, status,
                    dispute_note, submitted_at, confirmed_at, disputed_at, created_at
             FROM project_payments WHERE id = ?',
            [$paymentId]
        );
    }

    private function paymentDetailsForProject(int $projectId): ?object
    {
        return DB::queryOne(
            'SELECT id, project_id, student_id, method, account_title, phone_number, bank_name, account_number, iban, created_at, updated_at
             FROM project_payment_details
             WHERE project_id = ?',
            [$projectId]
        );
    }

    private function ensurePaymentSchema(): void
    {
        static $done = false;
        if ($done) return;

        DB::execute(
            "CREATE TABLE IF NOT EXISTS project_payment_details (
                id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
                project_id BIGINT UNSIGNED NOT NULL,
                student_id BIGINT UNSIGNED NOT NULL,
                method ENUM('easypaisa','jazzcash','bank') NOT NULL,
                account_title VARCHAR(255) NOT NULL,
                phone_number VARCHAR(50) NULL,
                bank_name VARCHAR(255) NULL,
                account_number VARCHAR(100) NULL,
                iban VARCHAR(100) NULL,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
                UNIQUE KEY unique_project_payment_details (project_id),
                FOREIGN KEY (project_id) REFERENCES projects(id) ON DELETE CASCADE,
                FOREIGN KEY (student_id) REFERENCES users(id) ON DELETE CASCADE
            )"
        );

        DB::execute(
            "CREATE TABLE IF NOT EXISTS project_payments (
                id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
                project_id BIGINT UNSIGNED NOT NULL,
                employer_id BIGINT UNSIGNED NOT NULL,
                student_id BIGINT UNSIGNED NOT NULL,
                amount DECIMAL(10,2) NOT NULL,
                method ENUM('easypaisa','jazzcash','bank') NOT NULL,
                bank_name VARCHAR(255) NULL,
                account_title VARCHAR(255) NULL,
                account_number VARCHAR(100) NULL,
                iban VARCHAR(100) NULL,
                phone_number VARCHAR(50) NULL,
                transaction_reference VARCHAR(255) NOT NULL,
                receipt_path VARCHAR(500) NOT NULL,
                receipt_original_name VARCHAR(255) NULL,
                note TEXT NULL,
                status ENUM('submitted','confirmed','disputed') DEFAULT 'submitted',
                dispute_note TEXT NULL,
                submitted_at TIMESTAMP NULL,
                confirmed_at TIMESTAMP NULL,
                disputed_at TIMESTAMP NULL,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
                INDEX idx_project_payments_project (project_id),
                INDEX idx_project_payments_student (student_id),
                FOREIGN KEY (project_id) REFERENCES projects(id) ON DELETE CASCADE,
                FOREIGN KEY (employer_id) REFERENCES users(id) ON DELETE CASCADE,
                FOREIGN KEY (student_id) REFERENCES users(id) ON DELETE CASCADE
            )"
        );

        $done = true;
    }

    private function ensureDeliverySchema(): void
    {
        static $done = false;
        if ($done) return;

        $status = DB::queryOne(
            "SELECT COLUMN_TYPE FROM INFORMATION_SCHEMA.COLUMNS
             WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'projects' AND COLUMN_NAME = 'status'"
        );
        if ($status && !str_contains($status->COLUMN_TYPE, 'delivered')) {
            DB::execute(
                "ALTER TABLE projects
                 MODIFY status ENUM('open','in_progress','delivered','reviewing','revision_requested','completed','closed') DEFAULT 'open'"
            );
        }

        $columns = [
            'delivery_file_path' => 'VARCHAR(500) NULL',
            'delivery_original_name' => 'VARCHAR(255) NULL',
            'delivered_at' => 'TIMESTAMP NULL',
            'reviewed_at' => 'TIMESTAMP NULL',
            'revision_note' => 'TEXT NULL',
        ];

        foreach ($columns as $name => $definition) {
            $exists = DB::queryOne(
                "SELECT COLUMN_NAME FROM INFORMATION_SCHEMA.COLUMNS
                 WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'projects' AND COLUMN_NAME = ?",
                [$name]
            );
            if (!$exists) {
                DB::execute("ALTER TABLE projects ADD COLUMN {$name} {$definition}");
            }
        }

        $done = true;
    }
}
