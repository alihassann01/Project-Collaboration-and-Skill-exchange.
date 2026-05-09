<?php
declare(strict_types=1);

// ─── CORS Headers (must be first, before any output) ─────────────────────────
header('Access-Control-Allow-Origin: ' . (defined('CORS_ORIGIN') ? CORS_ORIGIN : 'http://localhost:5173'));
header('Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type, Authorization, X-Requested-With');
header('Access-Control-Allow-Credentials: true');

// Handle OPTIONS preflight immediately
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit;
}

// ─── Bootstrap ────────────────────────────────────────────────────────────────
require_once __DIR__ . '/config.php';
require_once __DIR__ . '/core/DB.php';
require_once __DIR__ . '/core/Auth.php';
require_once __DIR__ . '/core/Paginator.php';
require_once __DIR__ . '/core/helpers.php';
require_once __DIR__ . '/core/Router.php';
require_once __DIR__ . '/core/Response.php';

// Controllers
require_once __DIR__ . '/controllers/AuthController.php';
require_once __DIR__ . '/controllers/DashboardController.php';
require_once __DIR__ . '/controllers/ProjectController.php';
require_once __DIR__ . '/controllers/ApplicationController.php';
require_once __DIR__ . '/controllers/SkillSwapController.php';
require_once __DIR__ . '/controllers/MessageController.php';
require_once __DIR__ . '/controllers/NotificationController.php';
require_once __DIR__ . '/controllers/ProfileController.php';
require_once __DIR__ . '/controllers/RatingController.php';
require_once __DIR__ . '/controllers/AdminController.php';

session_start();
DB::connect();

$router = new Router();

// ─── Auth Routes ──────────────────────────────────────────────────────────────
$router->add('POST', '/api/auth/register', fn() => AuthController::register());
$router->add('POST', '/api/auth/login',    fn() => AuthController::login());
$router->add('POST', '/api/auth/logout',   fn() => AuthController::logout());
$router->add('GET',  '/api/auth/me',       fn() => AuthController::me());

// ─── Dashboard ────────────────────────────────────────────────────────────────
$router->add('GET', '/api/dashboard', fn() => (new DashboardController)->index());

// ─── Projects ─────────────────────────────────────────────────────────────────
$router->add('GET',    '/api/projects',           fn()    => (new ProjectController)->index());
$router->add('POST',   '/api/projects',           fn()    => (new ProjectController)->store());
$router->add('GET',    '/api/projects/{id}',      fn($p)  => (new ProjectController)->show((int)$p['id']));
$router->add('PUT',    '/api/projects/{id}',      fn($p)  => (new ProjectController)->update((int)$p['id']));
$router->add('DELETE', '/api/projects/{id}',      fn($p)  => (new ProjectController)->destroy((int)$p['id']));
$router->add('GET',    '/api/employer/projects',  fn()    => (new ProjectController)->myProjects());

// ─── Applications ─────────────────────────────────────────────────────────────
$router->add('POST', '/api/projects/{id}/apply',        fn($p)  => (new ApplicationController)->store((int)$p['id']));
$router->add('GET',  '/api/my-applications',            fn()    => (new ApplicationController)->myApplications());
$router->add('GET',  '/api/projects/{id}/applications', fn($p)  => (new ApplicationController)->projectApplications((int)$p['id']));
$router->add('PUT',   '/api/applications/{id}/status',   fn($p)  => (new ApplicationController)->updateStatus((int)$p['id']));
$router->add('PATCH', '/api/applications/{id}/withdraw',  fn($p)  => (new ApplicationController)->withdraw((int)$p['id']));

// ─── Skill Swap ───────────────────────────────────────────────────────────────
$router->add('GET',    '/api/skill-swap',                        fn()   => (new SkillSwapController)->index());
$router->add('POST',   '/api/skill-swap',                        fn()   => (new SkillSwapController)->store());
$router->add('POST',   '/api/skill-swap/{id}/request',           fn($p) => (new SkillSwapController)->sendRequest((int)$p['id']));
$router->add('PATCH',  '/api/skill-swap/requests/{id}/respond',  fn($p) => (new SkillSwapController)->respondRequest((int)$p['id']));
$router->add('PATCH',  '/api/skill-swap/{id}/toggle',            fn($p) => (new SkillSwapController)->toggle((int)$p['id']));
$router->add('DELETE', '/api/skill-swap/{id}',                   fn($p) => (new SkillSwapController)->destroy((int)$p['id']));

// ─── Messages ─────────────────────────────────────────────────────────────────
$router->add('GET',  '/api/messages',              fn()   => (new MessageController)->index());
$router->add('GET',  '/api/messages/unread-count', fn()   => (new MessageController)->unreadCount());
$router->add('GET',  '/api/messages/{id}',         fn($p) => (new MessageController)->show((int)$p['id']));
$router->add('POST', '/api/messages/start',        fn()   => (new MessageController)->startConversation());
$router->add('POST', '/api/messages/{id}',         fn($p) => (new MessageController)->send((int)$p['id']));

// ─── Notifications ────────────────────────────────────────────────────────────
$router->add('GET',  '/api/notifications',                fn()   => (new NotificationController)->index());
$router->add('GET',  '/api/notifications/unread-count',   fn()   => (new NotificationController)->unreadCount());
$router->add('POST', '/api/notifications/mark-all-read',  fn()   => (new NotificationController)->markAllRead());
$router->add('POST', '/api/notifications/{id}/read',      fn($p) => (new NotificationController)->markRead((int)$p['id']));

// ─── Profile ──────────────────────────────────────────────────────────────────
$router->add('GET',   '/api/profile',      fn()   => (new ProfileController)->edit());
$router->add('PATCH', '/api/profile',      fn()   => (new ProfileController)->update());
$router->add('GET',   '/api/profile/{id}', fn($p) => (new ProfileController)->show((int)$p['id']));

// ─── Ratings ──────────────────────────────────────────────────────────────────
$router->add('GET',  '/api/ratings/{userId}',
    fn($p) => (new RatingController)->getUserRatings((int)$p['userId']));
$router->add('POST', '/api/ratings/{userId}/{projectId}',
    fn($p) => (new RatingController)->store((int)$p['userId'], (int)$p['projectId']));

// ─── Admin ────────────────────────────────────────────────────────────────────
$router->add('GET',    '/api/admin',                       fn()   => AdminController::dashboard());
$router->add('GET',    '/api/admin/users',                 fn()   => AdminController::users());
$router->add('PATCH',  '/api/admin/users/{id}/toggle',     fn($p) => AdminController::toggleUser((int)$p['id']));
$router->add('DELETE', '/api/admin/users/{id}',            fn($p) => AdminController::deleteUser((int)$p['id']));
$router->add('GET',    '/api/admin/projects',              fn()   => AdminController::projects());
$router->add('PATCH',  '/api/admin/projects/{id}/close',   fn($p) => AdminController::closeProject((int)$p['id']));
$router->add('PATCH',  '/api/admin/projects/{id}/reopen',  fn($p) => AdminController::reopenProject((int)$p['id']));
$router->add('DELETE', '/api/admin/projects/{id}',         fn($p) => AdminController::deleteProject((int)$p['id']));
$router->add('GET',    '/api/admin/reports',               fn()   => AdminController::reports());

// ─── Dispatch ─────────────────────────────────────────────────────────────────
$method = strtoupper($_SERVER['REQUEST_METHOD'] ?? 'GET');
$uri    = parse_url($_SERVER['REQUEST_URI'] ?? '/', PHP_URL_PATH);

// Strip BASE_URL prefix if set
$base = rtrim(BASE_URL, '/');
if ($base && str_starts_with($uri, $base)) {
    $uri = substr($uri, strlen($base));
}
if ($uri === '' || $uri === null) $uri = '/';

$router->dispatch($method, $uri);
