# SkillMarket — Core PHP Conversion

Exact 1:1 replica of the original Laravel application, converted to plain PHP with **zero frameworks**.

---

## Requirements

- PHP 8.1+ (uses `match`, `readonly`, `named arguments`)
- MySQL 5.7+ or MariaDB 10.3+
- Apache with `mod_rewrite` enabled (or Nginx — see below)
- No Composer. No dependencies.

---

## Setup Instructions

### 1. Place the project files

Copy the entire `skillmarket-php/` folder into your web server root (e.g. `htdocs/`, `www/`, or `/var/www/html/`).

### 2. Create the database

```sql
CREATE DATABASE skillmarket CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
```

Then import the schema and seed data:

```bash
mysql -u root -p skillmarket < database/schema.sql
```

### 3. Configure the app

Open `config.php` and update:

```php
define('DB_HOST', 'localhost');   // Your MySQL host
define('DB_NAME', 'skillmarket'); // Your database name
define('DB_USER', 'root');        // Your MySQL username
define('DB_PASS', '');            // Your MySQL password

// Set BASE_URL to where the app lives — NO trailing slash
// Examples:
//   define('BASE_URL', '');                              // root: http://localhost/
//   define('BASE_URL', '/skillmarket-php');              // subfolder: http://localhost/skillmarket-php/
//   define('BASE_URL', 'https://yourdomain.com');        // production domain
define('BASE_URL', '');
```

### 4. Enable Apache mod_rewrite

Make sure `AllowOverride All` is set for your vhost directory so `.htaccess` is respected.

```apache
<Directory "/path/to/skillmarket-php">
    AllowOverride All
</Directory>
```

### 5. Create the storage directory

```bash
mkdir -p skillmarket-php/storage/avatars
chmod -R 755 skillmarket-php/storage
```

### 6. Visit the app

Open your browser and navigate to the URL you configured in `BASE_URL`.

---

## Demo Accounts

All demo accounts use the password: **`password`**

| Role     | Email                      |
|----------|----------------------------|
| Student  | ali@student.com            |
| Employer | employer@techcorp.com      |
| Admin    | admin@skillmarket.com      |

---

## Nginx Configuration (alternative to Apache)

```nginx
server {
    listen 80;
    server_name yourdomain.com;
    root /var/www/html/skillmarket-php;
    index index.php;

    location / {
        try_files $uri $uri/ /index.php?$query_string;
    }

    location ~ \.php$ {
        include fastcgi_params;
        fastcgi_pass unix:/run/php/php8.1-fpm.sock;
        fastcgi_param SCRIPT_FILENAME $document_root$fastcgi_script_name;
    }

    location /storage {
        alias /var/www/html/skillmarket-php/storage;
    }
}
```

---

## Project Structure

```
skillmarket-php/
├── index.php              # Front controller & route definitions
├── config.php             # DB config, BASE_URL, route name map
├── .htaccess              # Apache rewrite rules
│
├── core/
│   ├── DB.php             # PDO wrapper (query, paginate, insert…)
│   ├── Auth.php           # Session-based authentication
│   ├── Paginator.php      # Pagination with link renderer
│   ├── Router.php         # Pattern-matching router
│   └── helpers.php        # e(), route(), flash(), validate(), abort()…
│
├── controllers/
│   ├── AuthController.php
│   ├── DashboardController.php
│   ├── ProjectController.php
│   ├── ApplicationController.php
│   ├── SkillSwapController.php
│   ├── MessageController.php
│   ├── NotificationController.php
│   ├── ProfileController.php
│   ├── RatingController.php
│   └── AdminController.php
│
├── views/
│   ├── layouts/           # app.php, sidebar.php, topbar.php
│   ├── auth/              # login.php, register.php
│   ├── dashboard/         # index.php
│   ├── projects/          # index, show, create, edit, manage
│   ├── applications/      # my.php, review.php
│   ├── skillswap/         # index.php
│   ├── messages/          # index.php, show.php
│   ├── notifications/     # index.php
│   ├── profile/           # show.php, edit.php
│   └── admin/             # dashboard, users, projects, reports
│
├── css/app.css            # Original CSS (unchanged)
├── js/app.js              # Original JS (unchanged)
├── storage/avatars/       # Uploaded avatar images
└── database/schema.sql    # Full DB schema + seed data
```

---

## Laravel → Core PHP Mapping

| Laravel                  | Core PHP Equivalent                          |
|--------------------------|----------------------------------------------|
| `Eloquent` ORM           | `DB::query()`, `DB::queryOne()`, raw SQL     |
| `Auth::user()`           | `Auth::user()` (session-based)               |
| `Route::get()`           | `$router->add('GET', …)` in `index.php`      |
| `@extends / @yield`      | `view()` + layout via `include`              |
| `{{ $var }}`             | `<?= e($var) ?>`                             |
| `{!! $html !!}`          | `<?= $html ?>` (trusted HTML only)           |
| `redirect()->back()`     | `back()`                                     |
| `redirect()->route()`    | `redirect(route('name'))`                    |
| `session('key')`         | `flash('key')` / `$_SESSION['key']`          |
| `$request->validate()`   | `validate([…])` — auto-redirects on failure  |
| `abort(403)`             | `abort(403, 'message')`                      |
| `Paginator::links()`     | `$paginator->links()` — renders HTML         |
| `@csrf`                  | `<?= csrf_field() ?>`                        |
| `@method('PUT')`         | `<input name="_method" value="PUT">`         |
| `middleware('role:...')` | `requireRole('student', 'employer')`         |
| Blade `@if` / `@foreach` | Plain `<?php if …` / `foreach …`            |
| `Str::limit()`           | `strLimit($str, $len)`                       |
| `diffForHumans()`        | `diffForHumans($datestring)`                 |
| `json_encode/decode`     | `json_encode()` / `json_decode()`            |
| `Storage::disk()->store` | `move_uploaded_file()` to `storage/`         |
| `Hash::make()`           | `password_hash(…, PASSWORD_BCRYPT)`          |
| `Hash::check()`          | `password_verify()`                          |
