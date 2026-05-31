<?php
class Auth
{
    private static ?object $user = null;

    public static function user(): ?object
    {
        if (self::$user !== null) return self::$user;
        if (empty($_SESSION['user_id'])) return null;

        $u = DB::queryOne('SELECT * FROM users WHERE id = ?', [$_SESSION['user_id']]);
        if (!$u) { self::logout(); return null; }

        // Fix 2: Immediately reject banned users and destroy their session,
        // even if they were banned after their session was created.
        if (!(bool)$u->is_active) {
            self::logout();
            return null;
        }

        self::decodeUser($u);
        self::$user = $u;
        return $u;
    }

    public static function id(): ?int
    {
        return isset($_SESSION['user_id']) ? (int)$_SESSION['user_id'] : null;
    }

    /**
     * Fix 2: check() now delegates to user() so it verifies
     * the user still exists AND is still active in the database.
     * The result is cached in self::$user for the rest of the request.
     */
    public static function check(): bool
    {
        return self::user() !== null;
    }

    public static function login(object $user): void
    {
        session_regenerate_id(true);
        $_SESSION['user_id'] = $user->id;
        self::$user = null; // force reload
    }

    public static function logout(): void
    {
        $_SESSION = [];
        if (ini_get('session.use_cookies')) {
            $p = session_get_cookie_params();
            setcookie(session_name(), '', time() - 42000,
                $p['path'], $p['domain'], $p['secure'], $p['httponly']);
        }
        session_destroy();
        self::$user = null;
    }

    public static function attempt(string $email, string $password): bool
    {
        $user = DB::queryOne('SELECT * FROM users WHERE email = ?', [$email]);
        if ($user && password_verify($password, $user->password)) {
            if (!(bool)$user->is_active) return false;
            self::decodeUser($user);
            self::login($user);
            return true;
        }
        return false;
    }

    /** Decode JSON fields and add computed helpers on a user object */
    public static function decodeUser(object $u): void
    {
        $u->portfolio  = $u->portfolio  ? json_decode($u->portfolio, true)  : [];
        $u->experience = $u->experience ? json_decode($u->experience, true) : [];
        $u->is_active  = (bool)$u->is_active;
    }

    public static function flush(): void
    {
        self::$user = null;
    }
}
