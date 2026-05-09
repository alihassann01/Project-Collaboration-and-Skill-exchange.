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

    private function normalizeUrl(?string $url): ?string
    {
        if (!$url) return null;
        if (preg_match('/^https?:\/\//', $url)) return $url;
        return 'https://' . $url;
    }
}
