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
    // Fix 3: IP-based rate limiting — 5 failed attempts per IP, 15-minute lockout.
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

        // ── Rate limiting ────────────────────────────────────────────────────
        $ip           = $_SERVER['REMOTE_ADDR'] ?? '0.0.0.0';
        $rateLimitKey = 'login:' . $ip;
        $maxAttempts  = 5;
        $decayMinutes = 15;

        if (RateLimiter::tooManyAttempts($rateLimitKey, $maxAttempts, $decayMinutes)) {
            $retryAfter = RateLimiter::availableIn($rateLimitKey, $decayMinutes);
            $minutes    = max(1, (int)ceil($retryAfter / 60));
            Response::error(
                "Too many login attempts. Please try again in {$minutes} minute(s).",
                429
            );
        }

        if (!Auth::attempt($email, $password)) {
            RateLimiter::hit($rateLimitKey, $decayMinutes);
            Response::error('These credentials do not match our records.', 401);
        }

        // Successful login — clear the rate-limit counter for this IP
        RateLimiter::clear($rateLimitKey);

        $user = Auth::user();

        Response::success(
            ['id' => $user->id, 'name' => $user->name, 'email' => $user->email, 'role' => $user->role],
            'Login successful.'
        );
    }

    // ──────────────────────────────────────────────────────────────────────────
    // POST /api/auth/logout
    // ──────────────────────────────────────────────────────────────────────────
    public static function forgotPassword(): never
    {
        $body = json_decode(file_get_contents('php://input'), true) ?? [];
        $email = trim($body['email'] ?? '');

        if (!filter_var($email, FILTER_VALIDATE_EMAIL)) {
            Response::error('Validation failed.', 422, ['email' => 'Enter a valid email address.']);
        }

        $user = DB::queryOne('SELECT id, email FROM users WHERE email = ? AND is_active = 1', [$email]);
        if (!$user) {
            Response::error('This email does not exist in the database.', 404, ['email' => 'No account found with this email address.']);
        }

        DB::execute('UPDATE password_resets SET used_at = NOW() WHERE user_id = ? AND used_at IS NULL', [$user->id]);

        $token = bin2hex(random_bytes(32));
        DB::insert(
            'INSERT INTO password_resets (user_id, token_hash, expires_at, created_at)
             VALUES (?, ?, DATE_ADD(NOW(), INTERVAL 30 MINUTE), NOW())',
            [$user->id, hash('sha256', $token)]
        );

        $origin = $_SERVER['HTTP_ORIGIN'] ?? 'http://localhost:5173';
        $resetUrl = rtrim($origin, '/') . '/reset-password?token=' . urlencode($token) . '&email=' . urlencode($user->email);

        Response::success([
            'reset_url' => $resetUrl,
            'expires_in_minutes' => 30,
        ], 'Reset link generated. Use it within 30 minutes.');
    }

    public static function resetPassword(): never
    {
        $body = json_decode(file_get_contents('php://input'), true) ?? [];

        $email = trim($body['email'] ?? '');
        $token = trim($body['token'] ?? '');
        $password = $body['password'] ?? '';
        $confirmation = $body['password_confirmation'] ?? '';

        $errors = [];
        if (!filter_var($email, FILTER_VALIDATE_EMAIL)) $errors['email'] = 'Enter a valid email address.';
        if ($token === '') $errors['token'] = 'Reset token is required.';
        if (mb_strlen($password) < 8) $errors['password'] = 'Password must be at least 8 characters.';
        if ($password !== $confirmation) $errors['password_confirmation'] = 'Passwords do not match.';
        if (!empty($errors)) Response::error('Validation failed.', 422, $errors);

        $user = DB::queryOne('SELECT id FROM users WHERE email = ?', [$email]);
        if (!$user) Response::error('Invalid or expired reset link.', 422);

        $reset = DB::queryOne(
            'SELECT id FROM password_resets
             WHERE user_id = ? AND token_hash = ? AND used_at IS NULL AND expires_at > NOW()
             ORDER BY id DESC LIMIT 1',
            [$user->id, hash('sha256', $token)]
        );
        if (!$reset) Response::error('Invalid or expired reset link.', 422);

        DB::execute(
            'UPDATE users SET password = ?, updated_at = NOW() WHERE id = ?',
            [password_hash($password, PASSWORD_BCRYPT), $user->id]
        );
        DB::execute('UPDATE password_resets SET used_at = NOW() WHERE id = ?', [$reset->id]);

        Response::success([], 'Password reset successfully. You can sign in now.');
    }

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
            'id'     => $user->id,
            'name'   => $user->name,
            'email'  => $user->email,
            'role'   => $user->role,
            'bio'    => $user->bio    ?? null,
            'avatar' => $user->avatar ?? null,
        ]);
    }
}
