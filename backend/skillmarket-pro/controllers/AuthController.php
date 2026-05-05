<?php

class AuthController
{
    // ──────────────────────────────────────────────────────────────────────────
    // POST /api/auth/register
    // ──────────────────────────────────────────────────────────────────────────
    public static function register(): never
    {
        $body = json_decode(file_get_contents('php://input'), true) ?? [];

        $name     = trim($body['name']     ?? '');
        $email    = trim($body['email']    ?? '');
        $password = $body['password']      ?? '';
        $role     = $body['role']          ?? '';

        $errors = [];

        if ($name === '' || mb_strlen($name) > 120) {
            $errors['name'] = 'A valid name is required (max 120 chars).';
        }
        if (!filter_var($email, FILTER_VALIDATE_EMAIL)) {
            $errors['email'] = 'A valid email address is required.';
        }
        if (!in_array($role, ['student', 'employer'], true)) {
            $errors['role'] = 'Role must be "student" or "employer".';
        }
        if (mb_strlen($password) < 8) {
            $errors['password'] = 'Password must be at least 8 characters.';
        }

        if (empty($errors)) {
            $exists = DB::scalar('SELECT COUNT(*) FROM users WHERE email = ?', [$email]);
            if ($exists) {
                $errors['email'] = 'This email is already registered.';
            }
        }

        if (!empty($errors)) {
            Response::error('Validation failed.', 422, $errors);
        }

        $id = DB::insert(
            'INSERT INTO users (name, email, password, role, is_active, created_at, updated_at)
             VALUES (?, ?, ?, ?, 1, NOW(), NOW())',
            [$name, $email, password_hash($password, PASSWORD_BCRYPT), $role]
        );

        $user = DB::queryOne('SELECT * FROM users WHERE id = ?', [$id]);
        Auth::decodeUser($user);
        Auth::login($user);

        Response::success(
            ['id' => $user->id, 'name' => $user->name, 'email' => $user->email, 'role' => $user->role],
            'Registration successful. Welcome to SkillMarket!',
            201
        );
    }

    // ──────────────────────────────────────────────────────────────────────────
    // POST /api/auth/login
    // ──────────────────────────────────────────────────────────────────────────
    public static function login(): never
    {
        $body = json_decode(file_get_contents('php://input'), true) ?? [];

        $email    = trim($body['email']    ?? '');
        $password = $body['password']      ?? '';

        $errors = [];
        if (!filter_var($email, FILTER_VALIDATE_EMAIL)) {
            $errors['email'] = 'A valid email address is required.';
        }
        if ($password === '') {
            $errors['password'] = 'Password is required.';
        }

        if (!empty($errors)) {
            Response::error('Validation failed.', 422, $errors);
        }

        if (!Auth::attempt($email, $password)) {
            Response::error('These credentials do not match our records.', 401);
        }

        $user = Auth::user();

        Response::success(
            ['id' => $user->id, 'name' => $user->name, 'email' => $user->email, 'role' => $user->role],
            'Login successful.'
        );
    }

    // ──────────────────────────────────────────────────────────────────────────
    // POST /api/auth/logout
    // ──────────────────────────────────────────────────────────────────────────
    public static function logout(): never
    {
        Auth::logout();
        Response::success([], 'Logged out successfully.');
    }

    // ──────────────────────────────────────────────────────────────────────────
    // GET /api/auth/me
    // ──────────────────────────────────────────────────────────────────────────
    public static function me(): never
    {
        if (!Auth::check()) {
            Response::error('Unauthenticated. Please log in.', 401);
        }

        $user = Auth::user();

        Response::success([
            'id'    => $user->id,
            'name'  => $user->name,
            'email' => $user->email,
            'role'  => $user->role,
            'bio'   => $user->bio ?? null,
        ]);
    }
}
