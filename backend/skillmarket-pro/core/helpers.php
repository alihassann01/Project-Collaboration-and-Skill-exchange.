<?php
// ─── Output Escaping ─────────────────────────────────────────────────────────
function e(?string $v): string
{
    return htmlspecialchars((string)($v ?? ''), ENT_QUOTES | ENT_SUBSTITUTE, 'UTF-8');
}

// ─── URL Helpers ─────────────────────────────────────────────────────────────
function url(string $path = '/'): string
{
    return BASE_URL . '/' . ltrim($path, '/');
}

function asset(string $path): string
{
    return BASE_URL . '/' . ltrim($path, '/');
}

/**
 * Generate a URL by route name.
 * Supports single param (object with ->id or scalar) or named array of params.
 */
function route(string $name, mixed $param = null, mixed $param2 = null): string
{
    $map  = ROUTE_MAP;
    $path = $map[$name] ?? '/';

    if ($param !== null) {
        if (is_array($param)) {
            foreach ($param as $k => $v) {
                $path = str_replace('{' . $k . '}', $v, $path);
            }
        } elseif (is_object($param)) {
            $path = preg_replace('/\{[^}]+\}/', $param->id, $path, 1);
        } else {
            $path = preg_replace('/\{[^}]+\}/', $param, $path, 1);
        }
    }

    if ($param2 !== null) {
        $id2 = is_object($param2) ? $param2->id : $param2;
        $path = preg_replace('/\{[^}]+\}/', $id2, $path, 1);
    }

    return BASE_URL . $path;
}

// ─── Session / Flash ─────────────────────────────────────────────────────────
function flash(string $key, ?string $value = null): ?string
{
    if ($value !== null) {
        $_SESSION['_flash'][$key] = $value;
        return null;
    }
    $v = $_SESSION['_flash'][$key] ?? null;
    unset($_SESSION['_flash'][$key]);
    return $v;
}

function session(string $key, mixed $default = null): mixed
{
    return $_SESSION[$key] ?? $default;
}

// ─── Old Input ───────────────────────────────────────────────────────────────
function old(string $key, string $default = ''): string
{
    return $_SESSION['_old'][$key] ?? $_POST[$key] ?? $default;
}

function flashOldInput(): void
{
    $_SESSION['_old'] = $_POST;
}

function clearOldInput(): void
{
    unset($_SESSION['_old']);
}

// ─── Errors ──────────────────────────────────────────────────────────────────
function flashErrors(array $errors): void
{
    $_SESSION['_errors'] = $errors;
}

function getErrors(): array
{
    $e = $_SESSION['_errors'] ?? [];
    unset($_SESSION['_errors']);
    return $e;
}

function firstError(): string
{
    $errors = $_SESSION['_errors'] ?? [];
    return reset($errors) ?: '';
}

// ─── CSRF ────────────────────────────────────────────────────────────────────
function csrf_token(): string
{
    if (empty($_SESSION['_csrf'])) {
        $_SESSION['_csrf'] = bin2hex(random_bytes(32));
    }
    return $_SESSION['_csrf'];
}

function csrf_field(): string
{
    return '<input type="hidden" name="_token" value="' . csrf_token() . '">';
}

function verifyCsrf(): void
{
    $token = $_POST['_token'] ?? $_SERVER['HTTP_X_CSRF_TOKEN'] ?? '';
    if (!hash_equals(csrf_token(), $token)) {
        abort(419, 'CSRF token mismatch.');
    }
}

// ─── Redirect ────────────────────────────────────────────────────────────────
function redirect(string $path): never
{
    header('Location: ' . (str_starts_with($path, 'http') ? $path : BASE_URL . $path));
    exit;
}

function back(): never
{
    $ref = $_SERVER['HTTP_REFERER'] ?? BASE_URL . '/dashboard';
    header('Location: ' . $ref);
    exit;
}

function redirectBack(string $successKey = '', string $successMsg = ''): never
{
    if ($successKey && $successMsg) flash($successKey, $successMsg);
    back();
}

// ─── Abort ───────────────────────────────────────────────────────────────────
function abort(int $code, string $message = ''): never
{
    http_response_code($code);
    $messages = [
        400 => 'Bad Request',
        403 => 'Forbidden',
        404 => 'Not Found',
        419 => 'Page Expired',
        500 => 'Internal Server Error',
    ];
    $title = $messages[$code] ?? 'Error';
    if (!$message) $message = $title;
    echo "<!DOCTYPE html><html><head><title>{$code} {$title}</title>
<link href=\"https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;600;700&display=swap\" rel=\"stylesheet\">
<style>body{font-family:'Plus Jakarta Sans',sans-serif;display:flex;align-items:center;justify-content:center;min-height:100vh;margin:0;background:#f8fafc}
.box{text-align:center;padding:40px}.code{font-size:72px;font-weight:800;color:#f97316;margin:0}.msg{font-size:20px;color:#374151;margin:8px 0 24px}
a{display:inline-block;padding:10px 24px;background:#f97316;color:#fff;border-radius:8px;text-decoration:none;font-weight:600}</style>
</head><body><div class=\"box\"><div class=\"code\">{$code}</div>
<div class=\"msg\">" . htmlspecialchars($message) . "</div>
<a href=\"" . BASE_URL . "/dashboard\">Go to Dashboard</a></div></body></html>";
    exit;
}

function abortIf(bool $condition, int $code = 403, string $message = ''): void
{
    if ($condition) abort($code, $message);
}

function abortUnless(bool $condition, int $code = 403, string $message = ''): void
{
    if (!$condition) abort($code, $message);
}

// ─── View System ─────────────────────────────────────────────────────────────
/**
 * Render a view file.
 * @param string $name     dot-notation path e.g. 'dashboard.index'
 * @param array  $data     variables to extract
 * @param bool   $layout   whether to wrap in layouts/app.php
 */
function view(string $name, array $data = [], bool $layout = true): void
{
    extract($data);

    // Capture errors/flash so views can use them
    $__errors  = getErrors();
    $__success = flash('success');
    $__error   = flash('error');

    $__file = VIEWS . '/' . str_replace('.', '/', $name) . '.php';
    if (!file_exists($__file)) abort(500, "View not found: {$name}");

    if (!$layout) {
        require $__file;
        return;
    }

    // Capture content
    ob_start();
    require $__file;
    $__content = ob_get_clean();

    // Capture pushed scripts
    $__scripts = $GLOBALS['__pushed_scripts'] ?? '';
    $GLOBALS['__pushed_scripts'] = '';

    require VIEWS . '/layouts/app.php';
}

function pushScript(string $html): void
{
    $GLOBALS['__pushed_scripts'] = ($GLOBALS['__pushed_scripts'] ?? '') . $html;
}

// ─── Date / Time ─────────────────────────────────────────────────────────────
function diffForHumans(?string $datetime): string
{
    if (!$datetime) return '';
    $diff = time() - strtotime($datetime);
    if ($diff < 60)       return 'just now';
    if ($diff < 3600)     return floor($diff / 60) . ' minutes ago';
    if ($diff < 86400)    return floor($diff / 3600) . ' hours ago';
    if ($diff < 604800)   return floor($diff / 86400) . ' days ago';
    if ($diff < 2592000)  return floor($diff / 604800) . ' weeks ago';
    if ($diff < 31536000) return floor($diff / 2592000) . ' months ago';
    return floor($diff / 31536000) . ' years ago';
}

function formatDate(?string $date, string $format = 'd M Y'): string
{
    if (!$date) return '';
    return date($format, strtotime($date));
}

// ─── String Helpers ───────────────────────────────────────────────────────────
function strLimit(?string $str, int $limit = 100, string $end = '...'): string
{
    $str = (string)($str ?? '');
    return mb_strlen($str) <= $limit ? $str : mb_substr($str, 0, $limit) . $end;
}

function classBasename(string $class): string
{
    return basename(str_replace('\\', '/', $class));
}

// ─── Request Helpers ─────────────────────────────────────────────────────────
function request(string $key, string $default = ''): string
{
    return $_GET[$key] ?? $_POST[$key] ?? $default;
}

function requestHas(string ...$keys): bool
{
    foreach ($keys as $k) {
        if (isset($_GET[$k]) || isset($_POST[$k])) return true;
    }
    return false;
}

/** Return the current path without query string */
function currentPath(): string
{
    return strtok($_SERVER['REQUEST_URI'] ?? '/', '?');
}

/** Remove BASE_URL prefix from currentPath */
function currentRoute(): string
{
    $path = currentPath();
    $base = rtrim(BASE_URL, '/');
    if ($base && str_starts_with($path, $base)) {
        $path = substr($path, strlen($base));
    }
    return $path ?: '/';
}

function routeIs(string $pattern): bool
{
    $current = currentRoute();
    // Convert wildcard * to regex
    $regex = '#^' . str_replace('\*', '.*', preg_quote($pattern, '#')) . '$#';
    return (bool)preg_match($regex, $current);
}

// ─── User Helpers ─────────────────────────────────────────────────────────────
function avatarUrl(?object $user): string
{
    if (!$user) return '';
    if (!empty($user->avatar)) {
        return BASE_URL . '/storage/' . $user->avatar;
    }
    $initials = urlencode(mb_substr($user->name ?? 'U', 0, 2));
    return "https://ui-avatars.com/api/?name={$initials}&background=f97316&color=fff&size=128";
}

function averageRating(int $userId): float
{
    $avg = DB::scalar('SELECT AVG(score) FROM ratings WHERE to_user_id = ?', [$userId]);
    return round((float)($avg ?? 0), 1);
}

function unreadNotifCount(int $userId): int
{
    return (int)DB::scalar(
        'SELECT COUNT(*) FROM notifications WHERE user_id = ? AND is_read = 0',
        [$userId]
    );
}

function userSkills(int $userId): array
{
    return DB::query('SELECT * FROM user_skills WHERE user_id = ? ORDER BY id', [$userId]);
}

// ─── Project Helpers ─────────────────────────────────────────────────────────
function budgetRange(?object $project): string
{
    if ($project->budget_min && $project->budget_max) {
        return 'PKR ' . number_format($project->budget_min) . ' – ' . number_format($project->budget_max);
    }
    if ($project->budget_min) return 'PKR ' . number_format($project->budget_min) . '+';
    return 'Budget negotiable';
}

function durationLabel(string $duration): string
{
    return match($duration) {
        'less_1_month' => '< 1 Month',
        '1_3_months'   => '1–3 Months',
        '3_6_months'   => '3–6 Months',
        'ongoing'      => 'Ongoing',
        default        => ucfirst($duration),
    };
}

function projectSkills(?string $skillsJson): array
{
    if (!$skillsJson) return [];
    $decoded = json_decode($skillsJson, true);
    return is_array($decoded) ? $decoded : [];
}

// ─── Status Badges ────────────────────────────────────────────────────────────
function statusBadge(string $status): string
{
    $map = [
        'approved'  => '<span class="badge badge-green">Approved</span>',
        'rejected'  => '<span class="badge badge-red">Rejected</span>',
        'withdrawn' => '<span class="badge badge-gray">Withdrawn</span>',
        'pending'   => '<span class="badge badge-amber">Pending</span>',
    ];
    return $map[$status] ?? '<span class="badge badge-gray">' . ucfirst($status) . '</span>';
}

function starsHtml(int $score): string
{
    $html = '';
    for ($i = 1; $i <= 5; $i++) {
        $filled = $i <= $score ? '#f97316' : '#d1d5db';
        $html  .= "<svg width='14' height='14' viewBox='0 0 24 24' fill='{$filled}'>"
                . "<polygon points='12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2'/></svg>";
    }
    return $html;
}

// ─── Validation ───────────────────────────────────────────────────────────────
function validate(array $rules): array
{
    $errors = [];
    $data   = [];

    foreach ($rules as $field => $rule) {
        $value  = $_POST[$field] ?? null;
        $ruleArr = is_string($rule) ? explode('|', $rule) : $rule;

        foreach ($ruleArr as $r) {
            [$rName, $rArg] = array_pad(explode(':', $r, 2), 2, null);

            switch ($rName) {
                case 'required':
                    if ($value === null || $value === '') {
                        $errors[$field] = ucfirst(str_replace('_', ' ', $field)) . ' is required.';
                    }
                    break;
                case 'string':
                    break; // just cast
                case 'email':
                    if ($value && !filter_var($value, FILTER_VALIDATE_EMAIL)) {
                        $errors[$field] = 'Invalid email address.';
                    }
                    break;
                case 'min':
                    if ($value !== null && mb_strlen((string)$value) < (int)$rArg) {
                        $errors[$field] = ucfirst(str_replace('_', ' ', $field)) . " must be at least {$rArg} characters.";
                    }
                    break;
                case 'max':
                    if ($value !== null && mb_strlen((string)$value) > (int)$rArg) {
                        $errors[$field] = ucfirst(str_replace('_', ' ', $field)) . " may not exceed {$rArg} characters.";
                    }
                    break;
                case 'numeric':
                    if ($value !== null && $value !== '' && !is_numeric($value)) {
                        $errors[$field] = ucfirst(str_replace('_', ' ', $field)) . ' must be a number.';
                    }
                    break;
                case 'integer':
                    if ($value !== null && $value !== '' && !ctype_digit((string)$value)) {
                        $errors[$field] = ucfirst(str_replace('_', ' ', $field)) . ' must be an integer.';
                    }
                    break;
                case 'in':
                    $allowed = explode(',', $rArg ?? '');
                    if ($value !== null && $value !== '' && !in_array($value, $allowed, true)) {
                        $errors[$field] = 'Invalid value for ' . str_replace('_', ' ', $field) . '.';
                    }
                    break;
                case 'nullable':
                    if ($value === '') $value = null;
                    break;
                case 'url':
                    if ($value && !filter_var($value, FILTER_VALIDATE_URL)) {
                        $errors[$field] = ucfirst(str_replace('_', ' ', $field)) . ' must be a valid URL.';
                    }
                    break;
                case 'confirmed':
                    $conf = $_POST[$field . '_confirmation'] ?? '';
                    if ($value !== $conf) {
                        $errors[$field] = ucfirst(str_replace('_', ' ', $field)) . ' confirmation does not match.';
                    }
                    break;
                case 'date':
                    if ($value && !strtotime($value)) {
                        $errors[$field] = ucfirst(str_replace('_', ' ', $field)) . ' must be a valid date.';
                    }
                    break;
                case 'unique':
                    // format: unique:table,column
                    [$table, $col] = array_pad(explode(',', $rArg ?? ''), 2, $field);
                    if ($value) {
                        $exists = DB::scalar("SELECT COUNT(*) FROM `$table` WHERE `$col` = ?", [$value]);
                        if ($exists > 0) {
                            $errors[$field] = ucfirst(str_replace('_', ' ', $field)) . ' is already taken.';
                        }
                    }
                    break;
                case 'image':
                    if (isset($_FILES[$field]) && $_FILES[$field]['error'] === UPLOAD_ERR_OK) {
                        $allowed = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
                        if (!in_array($_FILES[$field]['type'], $allowed)) {
                            $errors[$field] = 'File must be an image.';
                        }
                    }
                    break;
                case 'array':
                    if ($value !== null && !is_array($value)) {
                        $errors[$field] = ucfirst(str_replace('_', ' ', $field)) . ' must be an array.';
                    }
                    break;
            }
        }

        if (!isset($errors[$field])) {
            $data[$field] = $value;
        }
    }

    if (!empty($errors)) {
        flashOldInput();
        flashErrors($errors);
        back();
    }

    clearOldInput();
    return $data;
}

// ─── Notifications ────────────────────────────────────────────────────────────
function createNotification(int $userId, string $type, string $title, string $body, ?string $link = null): void
{
    try {
        DB::execute(
            'INSERT INTO notifications (user_id, type, title, body, link, is_read, created_at) VALUES (?, ?, ?, ?, ?, 0, NOW())',
            [$userId, $type, $title, $body, $link]
        );
    } catch (\Exception $e) {
        error_log('Notification insert failed: ' . $e->getMessage());
    }
}

// ─── Conversation Helper ──────────────────────────────────────────────────────
function findOrCreateConversation(int $userA, int $userB): object
{
    [$one, $two] = $userA < $userB ? [$userA, $userB] : [$userB, $userA];

    $conv = DB::queryOne(
        'SELECT * FROM conversations WHERE user_one_id = ? AND user_two_id = ?',
        [$one, $two]
    );

    if (!$conv) {
        $id   = DB::insert(
            'INSERT INTO conversations (user_one_id, user_two_id, last_message_at, created_at, updated_at) VALUES (?,?,NOW(),NOW(),NOW())',
            [$one, $two]
        );
        $conv = DB::queryOne('SELECT * FROM conversations WHERE id = ?', [$id]);
    }

    return $conv;
}

// ─── Auth Guards ─────────────────────────────────────────────────────────────
function requireAuth(): object
{
    if (!Auth::check()) {
        Response::error('Unauthenticated. Please log in.', 401);
    }
    $user = Auth::user();
    if (!$user->is_active) {
        Auth::logout();
        Response::error('Your account has been suspended. Contact support.', 403);
    }
    return $user;
}

function requireRole(string ...$roles): object
{
    $user = requireAuth();
    if (!in_array($user->role, $roles, true)) {
        // Fix 9: Return 403 Forbidden (not 401) when user is authenticated but lacks the required role.
        // 401 triggers the frontend Axios interceptor to redirect to login, which is incorrect here.
        Response::error('Forbidden. Required role: ' . implode(' or ', $roles), 403);
    }
    return $user;
}

function requireGuest(): void
{
    if (Auth::check()) redirect('/dashboard');
}

// ─── Public page view (uses public layout) ────────────────────────────────────
function publicView(string $name, array $data = []): void
{
    extract($data);
    $__file = VIEWS . '/public/' . str_replace('.', '/', $name) . '.php';
    if (!file_exists($__file)) abort(500, "Public view not found: {$name}");
    ob_start();
    require $__file;
    $__pageContent = ob_get_clean();
    require VIEWS . '/public/layout.php';
}

// ─── Skill Matching ───────────────────────────────────────────────────────────
function skillMatchScore(array $userSkills, array $requiredSkills): int
{
    if (empty($requiredSkills)) return 0;
    $userLower = array_map('strtolower', $userSkills);
    $reqLower  = array_map('strtolower', $requiredSkills);
    $matched   = 0;
    foreach ($reqLower as $r) {
        foreach ($userLower as $u) {
            if ($u === $r || str_contains($u, $r) || str_contains($r, $u)) {
                $matched++;
                break;
            }
        }
    }
    return (int)round(($matched / count($reqLower)) * 100);
}

function matchChipHtml(int $score): string
{
    if ($score >= 70) return "<span class=\"match-chip high\">⚡ {$score}% match</span>";
    if ($score >= 40) return "<span class=\"match-chip medium\">≈ {$score}% match</span>";
    if ($score > 0)   return "<span class=\"match-chip low\">{$score}% match</span>";
    return '';
}

function recommendedProjects(int $userId, int $limit = 5): array
{
    $userSkillRows = DB::query('SELECT skill_name FROM user_skills WHERE user_id = ?', [$userId]);
    $userSkills    = array_column($userSkillRows, 'skill_name');

    $appliedIds = array_column(
        DB::query('SELECT project_id FROM applications WHERE student_id = ?', [$userId]),
        'project_id'
    );

    $projects = DB::query(
        'SELECT p.*, u.name AS employer_name, u.avatar AS employer_avatar
         FROM projects p JOIN users u ON p.employer_id = u.id
         WHERE p.status = "open" ORDER BY p.created_at DESC LIMIT 60'
    );

    $scored = [];
    foreach ($projects as $p) {
        if (in_array($p->id, $appliedIds)) continue;
        $required = projectSkills($p->skills_required);
        $score    = skillMatchScore($userSkills, $required);
        $p->match_score = $score;
        $scored[] = $p;
    }
    usort($scored, fn($a,$b) => $b->match_score - $a->match_score);
    return array_slice($scored, 0, $limit);
}

function recommendedStudents(array $requiredSkills, int $limit = 5): array
{
    // Fix 7: Single query with JOIN + GROUP_CONCAT replaces the N+1 loop
    // that was firing one extra query per student (up to 61 queries total).
    $students = DB::query(
        "SELECT u.*,
                COALESCE(AVG(r.score),0) AS avg_rating,
                GROUP_CONCAT(DISTINCT us.skill_name SEPARATOR ',') AS skill_list
         FROM users u
         LEFT JOIN ratings r ON r.to_user_id = u.id
         LEFT JOIN user_skills us ON us.user_id = u.id
         WHERE u.role = 'student' AND u.is_active = 1
         GROUP BY u.id
         ORDER BY avg_rating DESC LIMIT 60"
    );
    $scored = [];
    foreach ($students as $s) {
        $skills = $s->skill_list ? array_filter(array_map('trim', explode(',', $s->skill_list))) : [];
        $s->match_score = skillMatchScore($skills, $requiredSkills);
        $s->skills = $skills;
        unset($s->skill_list);
        $scored[] = $s;
    }
    usort($scored, fn($a,$b) => $b->match_score - $a->match_score);
    return array_slice($scored, 0, $limit);
}

function swapMatches(int $userId, int $limit = 10): array
{
    $mySwaps = DB::query(
        'SELECT * FROM skill_swaps WHERE user_id = ? AND status = "active"', [$userId]
    );
    if (empty($mySwaps)) return [];

    $myTeach = array_map('strtolower', array_column($mySwaps, 'teach_skill'));
    $myLearn = array_map('strtolower', array_column($mySwaps, 'learn_skill'));

    $others = DB::query(
        'SELECT ss.*, u.name AS user_name, u.avatar AS user_avatar, u.headline AS user_headline
         FROM skill_swaps ss JOIN users u ON ss.user_id = u.id
         WHERE ss.user_id != ? AND ss.status = "active"
         ORDER BY ss.created_at DESC LIMIT 100',
        [$userId]
    );

    $matches = [];
    foreach ($others as $swap) {
        $theirTeach = strtolower($swap->teach_skill);
        $theirLearn = strtolower($swap->learn_skill);
        $score = 0;
        // They teach what I want to learn → +50
        foreach ($myLearn as $ml) {
            if ($theirTeach === $ml || str_contains($theirTeach, $ml) || str_contains($ml, $theirTeach)) { $score += 50; break; }
        }
        // They want what I can teach → +50
        foreach ($myTeach as $mt) {
            if ($theirLearn === $mt || str_contains($theirLearn, $mt) || str_contains($mt, $theirLearn)) { $score += 50; break; }
        }
        $swap->match_score = $score;
        $matches[] = $swap;
    }
    usort($matches, fn($a,$b) => $b->match_score - $a->match_score);
    return array_slice($matches, 0, $limit);
}

// ─── Activity Log ─────────────────────────────────────────────────────────────
function logActivity(int $userId, string $type, string $description, ?string $entityType = null, ?int $entityId = null, array $meta = []): void
{
    DB::execute(
        'INSERT INTO activity_log (user_id, type, description, entity_type, entity_id, meta, created_at)
         VALUES (?, ?, ?, ?, ?, ?, NOW())',
        [$userId, $type, $description, $entityType, $entityId, $meta ? json_encode($meta) : null]
    );
}

function activityIcon(string $type): string
{
    $icons = [
        'application'  => ['bg' => 'var(--blue-soft)',   'color' => 'var(--blue)',   'svg' => '<path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/>'],
        'approval'     => ['bg' => 'var(--green-soft)',  'color' => 'var(--green)',  'svg' => '<polyline points="20 6 9 17 4 12"/>'],
        'project'      => ['bg' => 'var(--brand-light)', 'color' => 'var(--brand)',  'svg' => '<rect x="2" y="7" width="20" height="14" rx="2"/><path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16"/>'],
        'message'      => ['bg' => 'var(--purple-soft)', 'color' => 'var(--purple)', 'svg' => '<path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>'],
        'rating'       => ['bg' => 'var(--amber-soft)',  'color' => 'var(--amber)',  'svg' => '<polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/>'],
        'swap'         => ['bg' => 'var(--teal-soft)',   'color' => 'var(--teal)',   'svg' => '<polyline points="17 1 21 5 17 9"/><path d="M3 11V9a4 4 0 0 1 4-4h14"/><polyline points="7 23 3 19 7 15"/><path d="M21 13v2a4 4 0 0 1-4 4H3"/>'],
        'completed'    => ['bg' => 'var(--green-soft)',  'color' => 'var(--green)',  'svg' => '<circle cx="12" cy="12" r="10"/><polyline points="20 6 9 17 4 12"/>'],
    ];
    $icon = $icons[$type] ?? ['bg' => 'var(--surface-2)', 'color' => 'var(--ink-5)', 'svg' => '<circle cx="12" cy="12" r="10"/>'];
    return "<div class=\"activity-icon\" style=\"background:{$icon['bg']};color:{$icon['color']}\">"
         . "<svg width=\"14\" height=\"14\" fill=\"none\" viewBox=\"0 0 24 24\" stroke=\"currentColor\" stroke-width=\"2\">{$icon['svg']}</svg>"
         . "</div>";
}

// ─── Project Status Badge ─────────────────────────────────────────────────────
function projectStatusBadge(string $status): string
{
    return match($status) {
        'open'        => '<span class="badge badge-green"><span class="badge-dot"></span>Open</span>',
        'in_progress' => '<span class="badge badge-blue"><span class="badge-dot"></span>In Progress</span>',
        'completed'   => '<span class="badge badge-purple"><span class="badge-dot"></span>Completed</span>',
        'closed'      => '<span class="badge badge-gray">Closed</span>',
        default       => '<span class="badge badge-gray">' . ucfirst($status) . '</span>',
    };
}

function unreadMessageCount(int $userId): int
{
    return (int)DB::scalar(
        'SELECT COUNT(*) FROM messages m
         JOIN conversations c ON m.conversation_id = c.id
         WHERE m.sender_id != ? AND m.is_read = 0
           AND (c.user_one_id = ? OR c.user_two_id = ?)',
        [$userId, $userId, $userId]
    );
}

// ─── Notify students when a new project matches their skills ──────────────────
function notifyNewProject(int $projectId): void
{
    $project = DB::queryOne('SELECT * FROM projects WHERE id = ?', [$projectId]);
    if (!$project) return;
    $required = projectSkills($project->skills_required);
    if (empty($required)) return;

    $students = DB::query(
        'SELECT DISTINCT u.id FROM users u
         JOIN user_skills us ON us.user_id = u.id
         WHERE u.role = "student" AND u.is_active = 1
           AND LOWER(us.skill_name) IN (' .
            implode(',', array_fill(0, count($required), '?')) .
         ')',
        array_map('strtolower', $required)
    );

    foreach ($students as $s) {
        if ($s->id === $project->employer_id) continue;
        DB::execute(
            'INSERT INTO notifications (user_id, type, title, body, link, is_read, created_at)
             VALUES (?, "new_project", "New Project Match! 🎯", ?, ?, 0, NOW())',
            [
                $s->id,
                'A new project matching your skills was posted: ' . $project->title,
                '/projects/' . $projectId,
            ]
        );
    }
}

// ─── Notify when project completed ────────────────────────────────────────────
function notifyProjectCompleted(int $projectId): void
{
    $project = DB::queryOne('SELECT * FROM projects WHERE id = ?', [$projectId]);
    if (!$project) return;

    if ($project->hired_student_id) {
        DB::execute(
            'INSERT INTO notifications (user_id, type, title, body, link, is_read, created_at)
             VALUES (?, "project_completed", "Project Completed! 🎉", ?, ?, 0, NOW())',
            [
                $project->hired_student_id,
                'The project "' . $project->title . '" has been marked as completed.',
                '/projects/' . $projectId,
            ]
        );
    }
}

// ─── Validate request fields ─────────────────────────────────────────────────
function validateRequest(array $rules): ?array
{
    $errors = [];
    $data   = [];
    foreach ($rules as $field => $ruleStr) {
        $value = trim($_POST[$field] ?? '');
        foreach (explode('|', $ruleStr) as $rule) {
            [$r, $arg] = array_pad(explode(':', $rule, 2), 2, null);
            if ($r === 'required' && $value === '') {
                $errors[$field] = ucfirst(str_replace('_', ' ', $field)) . ' is required.';
                break;
            }
            if ($r === 'min' && strlen($value) < (int)$arg) {
                $errors[$field] = ucfirst(str_replace('_', ' ', $field)) . " must be at least {$arg} characters.";
                break;
            }
        }
        $data[$field] = $value;
    }
    if (!empty($errors)) {
        foreach ($errors as $e) flash('error', $e);
        $ref = $_SERVER['HTTP_REFERER'] ?? '/dashboard';
        redirect(str_replace(BASE_URL, '', $ref));
        return null;
    }
    return $data;
}
