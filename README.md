# SkillMarket Pro

Two separate folders:
- /backend  → PHP REST API (runs on XAMPP/localhost)
- /frontend → React app (runs with npm)

## Setup Instructions

### Backend (PHP)
1. Copy the entire `backend/` folder into your XAMPP htdocs:
   → C:/xampp/htdocs/skillmarket-pro/
2. Open phpMyAdmin → create a database called `skillmarket`
3. Import `backend/database/schema.sql`
4. Edit `backend/config.php` and set your DB credentials
5. Make sure Apache is running in XAMPP

### Frontend (React)
1. Open terminal in the `frontend/` folder
2. Run: npm install
3. Run: npm run dev
4. Open: http://localhost:5173

### How they connect
The frontend calls the PHP backend via Vite proxy.
The proxy is set in `frontend/vite.config.js`:
  /api → http://localhost/skillmarket-pro/api
So both must run at the same time.
