<?php
// ─── Load .env file ──────────────────────────────────────────────────────────
$envFile = __DIR__ . '/.env';
if (file_exists($envFile)) {
    $lines = file($envFile, FILE_IGNORE_NEW_LINES | FILE_SKIP_EMPTY_LINES);
    foreach ($lines as $line) {
        $line = trim($line);
        if ($line === '' || str_starts_with($line, '#')) continue;
        if (str_contains($line, '=')) {
            [$key, $val] = explode('=', $line, 2);
            $key = trim($key);
            $val = trim($val);
            if (!array_key_exists($key, $_ENV)) {
                putenv("{$key}={$val}");
                $_ENV[$key] = $val;
            }
        }
    }
}

// ─── Database Configuration ─────────────────────────────────────────────────
define('DB_HOST',    getenv('DB_HOST')    ?: 'localhost');
define('DB_NAME',    getenv('DB_NAME')    ?: 'skillmarket');
define('DB_USER',    getenv('DB_USER')    ?: 'root');
define('DB_PASS',    getenv('DB_PASS')    !== false ? getenv('DB_PASS') : '');
define('DB_CHARSET', 'utf8mb4');

// ─── CORS ────────────────────────────────────────────────────────────────────
define('CORS_ORIGIN', getenv('CORS_ORIGIN') ?: 'http://localhost:5173');

// ─── App Configuration ──────────────────────────────────────────────────────
// AUTO-DETECT BASE_URL — works whether app is at root (/) or in a subfolder.
// Manual override: comment out the 2 lines below and uncomment the define().
// Examples:
//   define('BASE_URL', '');                        // root: http://localhost/
//   define('BASE_URL', '/skillmarket-pro');        // subfolder: localhost/skillmarket-pro
$_scriptDir = dirname($_SERVER['SCRIPT_NAME'] ?? '/');
define('BASE_URL', rtrim($_scriptDir === '/' ? '' : $_scriptDir, '/'));

// Absolute path to the app root (auto-detected)
define('APP_PATH', __DIR__);
define('VIEWS',    APP_PATH . '/views');
define('STORAGE',  APP_PATH . '/storage');

// ─── Route → URL name map (used by route() helper) ──────────────────────────
define('ROUTE_MAP', [
    'home'                      => '/',
    'login'                     => '/login',
    'register'                  => '/register',
    'logout'                    => '/logout',
    'dashboard'                 => '/dashboard',
    'profile.show'              => '/profile/{id}',
    'profile.edit'              => '/profile',
    'profile.update'            => '/profile',
    'profile.skills'            => '/profile/skills',
    'profile.password'          => '/profile/password',
    'projects.index'            => '/projects',
    'projects.show'             => '/projects/{id}',
    'projects.create'           => '/projects/create',
    'projects.store'            => '/projects',
    'projects.edit'             => '/projects/{id}/edit',
    'projects.update'           => '/projects/{id}',
    'projects.destroy'          => '/projects/{id}',
    'employer.projects'         => '/my-projects',
    'applications.store'        => '/projects/{id}/apply',
    'applications.my'           => '/my-applications',
    'applications.withdraw'     => '/applications/{id}/withdraw',
    'applications.review'       => '/projects/{id}/applicants',
    'applications.updateStatus' => '/applications/{id}/status',
    'skillswap.index'           => '/skill-swap',
    'skillswap.store'           => '/skill-swap',
    'skillswap.destroy'         => '/skill-swap/{id}',
    'skillswap.toggle'          => '/skill-swap/{id}/toggle',
    'skillswap.request'         => '/skill-swap/{id}/request',
    'skillswap.respond'         => '/skill-swap/requests/{id}/respond',
    'messages.index'            => '/messages',
    'messages.show'             => '/messages/{id}',
    'messages.send'             => '/messages/{id}',
    'messages.start'            => '/messages/start',
    'notifications.index'       => '/notifications',
    'notifications.markAllRead' => '/notifications/mark-all-read',
    'notifications.markRead'    => '/notifications/{id}/read',
    'ratings.store'             => '/ratings/{userId}/{projectId}',
    'admin.dashboard'           => '/admin',
    'admin.users'               => '/admin/users',
    'admin.users.toggle'        => '/admin/users/{id}/toggle',
    'admin.users.delete'        => '/admin/users/{id}',
    'admin.projects'            => '/admin/projects',
    'admin.projects.close'      => '/admin/projects/{id}/close',
    'admin.projects.delete'     => '/admin/projects/{id}',
    'admin.reports'             => '/admin/reports',
    'admin.reports.update'      => '/admin/reports/{id}',
]);
