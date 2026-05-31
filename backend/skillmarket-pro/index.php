<?php
declare(strict_types=1);

// ─── Bootstrap (must load config FIRST so CORS_ORIGIN is available) ──────────
require_once __DIR__ . '/config.php';
require_once __DIR__ . '/core/DB.php';
require_once __DIR__ . '/core/Auth.php';
require_once __DIR__ . '/core/Paginator.php';
require_once __DIR__ . '/core/helpers.php';
require_once __DIR__ . '/core/Router.php';
require_once __DIR__ . '/core/Response.php';
require_once __DIR__ . '/core/RateLimiter.php';

// ─── CORS Headers (after config loads so CORS_ORIGIN is defined) ─────────────
header('Access-Control-Allow-Origin: ' . (defined('CORS_ORIGIN') ? CORS_ORIGIN : 'http://localhost:5173'));
header('Access-Control-Allow-Methods: GET, POST, PUT, PATCH, DELETE, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type, Authorization, X-Requested-With');
header('Access-Control-Allow-Credentials: true');

// Handle OPTIONS preflight immediately
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit;
}

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

// Fix 4: Explicitly set secure cookie attributes so the app controls its own
// security posture regardless of server php.ini configuration.
session_start([
    'cookie_httponly' => true,
    'cookie_secure'   => !empty($_SERVER['HTTPS']),
    'cookie_samesite' => 'Lax',
]);
$router = new Router();

// ─── Auth Routes ──────────────────────────────────────────────────────────────
$router->add('POST', '/api/auth/register', fn() => AuthController::register());
$router->add('POST', '/api/auth/login',    fn() => AuthController::login());
$router->add('POST', '/api/auth/logout',   fn() => AuthController::logout());
$router->add('GET',  '/api/auth/me',       fn() => AuthController::me());
$router->add('POST', '/api/auth/forgot-password', fn() => AuthController::forgotPassword());
$router->add('POST', '/api/auth/reset-password',  fn() => AuthController::resetPassword());

// ─── Dashboard ────────────────────────────────────────────────────────────────
$router->add('GET', '/api/dashboard', fn() => (new DashboardController)->index());

// ─── Projects ─────────────────────────────────────────────────────────────────
$router->add('GET',    '/api/projects',           fn()    => (new ProjectController)->index());
$router->add('POST',   '/api/projects',           fn()    => (new ProjectController)->store());
$router->add('GET',    '/api/projects/{id}',      fn($p)  => (new ProjectController)->show((int)$p['id']));
$router->add('PUT',    '/api/projects/{id}',      fn($p)  => (new ProjectController)->update((int)$p['id']));
$router->add('PATCH',  '/api/projects/{id}/complete', fn($p) => (new ProjectController)->complete((int)$p['id']));
$router->add('POST',   '/api/projects/{id}/deliver', fn($p) => (new ProjectController)->deliver((int)$p['id']));
$router->add('GET',    '/api/projects/{id}/delivery/download', fn($p) => (new ProjectController)->downloadDelivery((int)$p['id']));
$router->add('PATCH',  '/api/projects/{id}/reviewing', fn($p) => (new ProjectController)->startReview((int)$p['id']));
$router->add('PATCH',  '/api/projects/{id}/delivery-decision', fn($p) => (new ProjectController)->deliveryDecision((int)$p['id']));
$router->add('PUT',    '/api/projects/{id}/payment-details', fn($p) => (new ProjectController)->savePaymentDetails((int)$p['id']));
$router->add('POST',   '/api/projects/{id}/payments', fn($p) => (new ProjectController)->submitPayment((int)$p['id']));
$router->add('GET',    '/api/projects/{id}/payments/{payment_id}/receipt', fn($p) => (new ProjectController)->downloadPaymentReceipt((int)$p['id'], (int)$p['payment_id']));
$router->add('PATCH',  '/api/projects/{id}/payments/{payment_id}/confirm', fn($p) => (new ProjectController)->confirmPayment((int)$p['id'], (int)$p['payment_id']));
$router->add('PATCH',  '/api/projects/{id}/payments/{payment_id}/dispute', fn($p) => (new ProjectController)->disputePayment((int)$p['id'], (int)$p['payment_id']));
$router->add('DELETE', '/api/projects/{id}',      fn($p)  => (new ProjectController)->destroy((int)$p['id']));
$router->add('GET',    '/api/employer/projects',  fn()    => (new ProjectController)->myProjects());

// ─── Applications ─────────────────────────────────────────────────────────────
$router->add('POST', '/api/projects/{id}/apply',        fn($p)  => (new ApplicationController)->store((int)$p['id']));
$router->add('GET',  '/api/my-applications',            fn()    => (new ApplicationController)->myApplications());
$router->add('GET',  '/api/projects/{id}/applications', fn($p)  => (new ApplicationController)->projectApplications((int)$p['id']));
$router->add('PUT',   '/api/applications/{id}/status',   fn($p)  => (new ApplicationController)->updateStatus((int)$p['id']));
$router->add('PATCH', '/api/applications/{id}/meeting',  fn($p)  => (new ApplicationController)->updateMeeting((int)$p['id']));
$router->add('PATCH', '/api/applications/{id}/withdraw',  fn($p)  => (new ApplicationController)->withdraw((int)$p['id']));

// ─── Skill Swap ───────────────────────────────────────────────────────────────
$router->add('GET',    '/api/skill-swap',                        fn()   => (new SkillSwapController)->index());
$router->add('POST',   '/api/skill-swap',                        fn()   => (new SkillSwapController)->store());
$router->add('POST',   '/api/skill-swap/{id}/request',           fn($p) => (new SkillSwapController)->sendRequest((int)$p['id']));
$router->add('PATCH',  '/api/skill-swap/requests/{id}/respond',  fn($p) => (new SkillSwapController)->respondRequest((int)$p['id']));
$router->add('PATCH',  '/api/skill-swap/requests/{id}/meeting',  fn($p) => (new SkillSwapController)->updateMeeting((int)$p['id']));
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
// Avatar upload route MUST come BEFORE the generic profile routes
// because it uses $_FILES (multipart), not php://input (JSON)
$router->add('POST',  '/api/profile/avatar', fn()   => (new ProfileController)->uploadAvatar());
$router->add('GET',   '/api/profile',        fn()   => (new ProfileController)->edit());
$router->add('PATCH', '/api/profile',        fn()   => (new ProfileController)->update());
$router->add('GET',   '/api/profile/{id}',   fn($p) => (new ProfileController)->show((int)$p['id']));

// ─── Ratings ──────────────────────────────────────────────────────────────────
$router->add('GET',  '/api/ratings/{user_id}',
    fn($p) => (new RatingController)->getUserRatings((int)$p['user_id']));
// Fix 1: Swap ratings have no project — route passes null for projectId
$router->add('POST', '/api/ratings/{user_id}/{project_id}',
    fn($p) => (new RatingController)->store((int)$p['user_id'], (int)$p['project_id']));
$router->add('POST', '/api/ratings/{user_id}',
    fn($p) => (new RatingController)->store((int)$p['user_id'], null));

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
