# SkillMarket Pro

SkillMarket Pro is a project collaboration and skill-exchange platform for students and employers. Students can apply for paid projects, deliver work, exchange skills with other users, message each other, receive notifications, and manage project delivery/payment workflows.

## Features

- Student, employer, and admin roles
- Public home/about/project workflow/skill swap pages
- Project posting, applications, approval, delivery, review, and revision flow
- Manual project payment workflow for Pakistan:
  - Easypaisa
  - JazzCash
  - Other Pakistani bank account
  - Receipt upload
  - Student confirmation or dispute
- Skill swap listings and meeting links
- Messaging and notifications
- Profile editing with avatar upload
- Admin dashboard, user management, project management, and reports

## Tech Stack

- Frontend: React, Vite, Tailwind CSS
- Backend: PHP REST API
- Database: MySQL/MariaDB
- Local server: XAMPP

## Project Structure

```text
backend/skillmarket-pro/   PHP API, database schema, migrations, storage
frontend/                  React/Vite frontend
```

## Backend Setup

1. Copy `backend/skillmarket-pro` into your XAMPP `htdocs` directory.

   Example:

   ```text
   C:/xampp/htdocs/skillmarket-pro
   ```

2. Create a MySQL database named:

   ```text
   skillmarket
   ```

3. Import:

   ```text
   backend/skillmarket-pro/database/schema.sql
   ```

4. Copy or edit:

   ```text
   backend/skillmarket-pro/.env
   ```

5. Start Apache and MySQL from XAMPP.

6. API base URL:

   ```text
   http://localhost/skillmarket-pro/api
   ```

## Frontend Setup

```bash
cd frontend
npm install
npm run dev
```

Open:

```text
http://localhost:5173
```

The Vite proxy forwards frontend API calls from `/api` to:

```text
http://localhost/skillmarket-pro/api
```

## Build

```bash
cd frontend
npm run build
```

## Important Notes

- Do not commit `.env`, `storage/`, `frontend/dist/`, or `node_modules/`.
- Uploaded project deliveries are stored in backend storage.
- Uploaded payment receipts are stored in backend storage.
- Payment details are project-specific and become locked after the student confirms them.
