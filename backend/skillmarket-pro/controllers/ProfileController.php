<?php

class ProfileController
{
    // GET /api/profile
    public function edit(): void
    {
        if (!Auth::check()) { Response::error('Unauthenticated.', 401); return; }

        $user = DB::queryOne(
            'SELECT id, name, email, role, bio, headline, location, website, avatar,
                    availability, skills_can_teach, skills_want_to_learn, created_at
             FROM users WHERE id = ?',
            [Auth::id()]
        );

        Response::success(['user' => $user]);
    }

    // GET /api/profile/{id}
    public function show(int $id): void
    {
        if (!Auth::check()) { Response::error('Unauthenticated.', 401); return; }

        $user = DB::queryOne(
            'SELECT id, name, email, role, bio, headline, location, website, avatar,
                    availability, skills_can_teach, skills_want_to_learn, created_at
             FROM users WHERE id = ?',
            [$id]
        );

        if (!$user) {
            Response::error('User not found.', 404);
            return;
        }
        $this->attachSkillSwapSkills($user);

        Response::success(['user' => $user]);
    }

    // PATCH /api/profile
    public function update(): void
    {
        if (!Auth::check()) { Response::error('Unauthenticated.', 401); return; }

        $input = json_decode(file_get_contents('php://input'), true) ?? [];

        $name = trim($input['name'] ?? '');
        if (!$name) {
            Response::error('Name is required.', 422);
            return;
        }

        $updates = [
            'name'                 => $name,
            'headline'             => trim($input['headline'] ?? '') ?: null,
            'bio'                  => trim($input['bio'] ?? '') ?: null,
            'location'             => trim($input['location'] ?? '') ?: null,
            'website'              => $this->normalizeUrl(trim($input['website'] ?? '') ?: null),
            'availability'         => $input['availability'] ?? null,
            'skills_can_teach'     => trim($input['skills_can_teach'] ?? '') ?: null,
            'skills_want_to_learn' => trim($input['skills_want_to_learn'] ?? '') ?: null,
        ];

        // Password change
        $newPass = $input['new_password'] ?? '';
        $newPassConfirm = $input['new_password_confirmation'] ?? '';
        if (!empty($newPass)) {
            // Require current password verification
            $currentPass = $input['current_password'] ?? '';
            if (empty($currentPass)) {
                Response::error('Current password is required.', 422);
                return;
            }
            $currentUser = DB::queryOne('SELECT password FROM users WHERE id = ?', [Auth::id()]);
            if (!$currentUser || !password_verify($currentPass, $currentUser->password)) {
                Response::error('Current password is incorrect.', 422);
                return;
            }
            if ($newPass !== $newPassConfirm) {
                Response::error('Passwords do not match.', 422);
                return;
            }
            if (strlen($newPass) < 8) {
                Response::error('Password must be at least 8 characters.', 422);
                return;
            }
            $updates['password'] = password_hash($newPass, PASSWORD_DEFAULT);
        }

        $sets   = implode(', ', array_map(fn($k) => "{$k} = ?", array_keys($updates)));
        $values = array_values($updates);
        $values[] = Auth::id();
        DB::execute("UPDATE users SET {$sets}, updated_at = NOW() WHERE id = ?", $values);

        $updatedUser = DB::queryOne(
            'SELECT id, name, email, role, bio, headline, location, website, avatar,
                    availability, skills_can_teach, skills_want_to_learn, created_at
             FROM users WHERE id = ?',
            [Auth::id()]
        );

        Response::success(['user' => $updatedUser], 'Profile updated.');
    }

    // POST /api/profile/avatar
    public function uploadAvatar(): void
    {
        if (!Auth::check()) {
            Response::error('Unauthenticated.', 401);
            return;
        }

        // Validate file exists
        if (!isset($_FILES['avatar']) || $_FILES['avatar']['error'] !== UPLOAD_ERR_OK) {
            $errorMsg = 'No file uploaded.';
            if (isset($_FILES['avatar'])) {
                $errorMsg = match ($_FILES['avatar']['error']) {
                    UPLOAD_ERR_INI_SIZE, UPLOAD_ERR_FORM_SIZE => 'File is too large.',
                    UPLOAD_ERR_PARTIAL    => 'File was only partially uploaded.',
                    UPLOAD_ERR_NO_FILE    => 'No file was uploaded.',
                    UPLOAD_ERR_NO_TMP_DIR => 'Server configuration error.',
                    UPLOAD_ERR_CANT_WRITE => 'Failed to write file to disk.',
                    default               => 'Unknown upload error.',
                };
            }
            Response::error($errorMsg, 422);
            return;
        }

        $file = $_FILES['avatar'];

        // Validate file size (max 2MB)
        $maxSize = 2 * 1024 * 1024; // 2MB
        if ($file['size'] > $maxSize) {
            Response::error('File size must not exceed 2MB.', 422);
            return;
        }

        // Validate MIME type using finfo (server-side, not user-controlled)
        $finfo = new finfo(FILEINFO_MIME_TYPE);
        $mimeType = $finfo->file($file['tmp_name']);
        $allowedMimes = [
            'image/jpeg' => 'jpg',
            'image/png'  => 'png',
            'image/webp' => 'webp',
            'image/gif'  => 'gif',
        ];

        if (!isset($allowedMimes[$mimeType])) {
            Response::error('Invalid file type. Allowed: JPEG, PNG, WebP, GIF.', 422);
            return;
        }

        $ext = $allowedMimes[$mimeType];

        // Ensure storage directory exists
        $avatarDir = APP_PATH . '/storage/avatars';
        if (!is_dir($avatarDir)) {
            if (!mkdir($avatarDir, 0755, true)) {
                Response::error('Failed to create storage directory.', 500);
                return;
            }
        }

        // Fetch current user to delete old avatar file
        $currentUser = DB::queryOne(
            'SELECT avatar FROM users WHERE id = ?',
            [Auth::id()]
        );

        if ($currentUser && !empty($currentUser->avatar)) {
            $oldFile = APP_PATH . '/storage/' . $currentUser->avatar;
            if (file_exists($oldFile) && is_file($oldFile)) {
                @unlink($oldFile);
            }
        }

        // Generate unique filename: {userId}_{timestamp}.{ext}
        $filename = Auth::id() . '_' . time() . '.' . $ext;
        $destination = $avatarDir . '/' . $filename;

        // Move uploaded file
        if (!move_uploaded_file($file['tmp_name'], $destination)) {
            Response::error('Failed to save uploaded file.', 500);
            return;
        }

        // Update database — store relative path
        $relativePath = 'avatars/' . $filename;
        DB::execute(
            'UPDATE users SET avatar = ?, updated_at = NOW() WHERE id = ?',
            [$relativePath, Auth::id()]
        );

        // Return updated user
        $updatedUser = DB::queryOne(
            'SELECT id, name, email, role, bio, headline, location, website, avatar,
                    availability, skills_can_teach, skills_want_to_learn, created_at
             FROM users WHERE id = ?',
            [Auth::id()]
        );

        Response::success(['user' => $updatedUser], 'Photo updated!');
    }

    private function normalizeUrl(?string $url): ?string
    {
        if (!$url) return null;
        if (preg_match('/^https?:\/\//', $url)) return $url;
        return 'https://' . $url;
    }

    private function attachSkillSwapSkills(?object $user): void
    {
        if (!$user) return;

        $listings = DB::query(
            'SELECT teach_skill, learn_skill
             FROM skill_swaps
             WHERE user_id = ? AND status = "active"
             ORDER BY created_at DESC',
            [$user->id]
        );

        $teach = $this->csvToList($user->skills_can_teach ?? null);
        $learn = $this->csvToList($user->skills_want_to_learn ?? null);

        foreach ($listings as $listing) {
            $teach[] = trim($listing->teach_skill ?? '');
            $learn[] = trim($listing->learn_skill ?? '');
        }

        $user->skills_can_teach = implode(', ', $this->uniqueNonEmpty($teach));
        $user->skills_want_to_learn = implode(', ', $this->uniqueNonEmpty($learn));
    }

    private function csvToList(?string $value): array
    {
        if (!$value) return [];
        return array_map('trim', explode(',', $value));
    }

    private function uniqueNonEmpty(array $values): array
    {
        $seen = [];
        $result = [];

        foreach ($values as $value) {
            $value = trim((string)$value);
            if ($value === '') continue;

            $key = mb_strtolower($value);
            if (isset($seen[$key])) continue;

            $seen[$key] = true;
            $result[] = $value;
        }

        return $result;
    }
}
