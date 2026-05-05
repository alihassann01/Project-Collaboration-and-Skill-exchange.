-- SkillMarket Pro — Full Schema
-- Run this to set up the database from scratch.
-- Password for all demo accounts: password

CREATE TABLE IF NOT EXISTS users (
    id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    email_verified_at TIMESTAMP NULL,
    password VARCHAR(255) NOT NULL,
    role ENUM('student','employer','admin') DEFAULT 'student',
    bio TEXT NULL,
    avatar VARCHAR(255) NULL,
    location VARCHAR(255) NULL,
    website VARCHAR(255) NULL,
    phone VARCHAR(50) NULL,
    headline VARCHAR(255) NULL,
    portfolio JSON NULL,
    experience JSON NULL,
    skills_can_teach VARCHAR(500) NULL,
    skills_want_to_learn VARCHAR(500) NULL,
    availability ENUM('available','busy','unavailable') DEFAULT 'available',
    hourly_rate DECIMAL(8,2) NULL,
    is_active TINYINT(1) DEFAULT 1,
    remember_token VARCHAR(100) NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS skills (
    id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(255) UNIQUE NOT NULL,
    category VARCHAR(255) NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS user_skills (
    id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    user_id BIGINT UNSIGNED NOT NULL,
    skill_name VARCHAR(255) NOT NULL,
    proficiency ENUM('beginner','intermediate','expert') DEFAULT 'intermediate',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE KEY unique_user_skill (user_id, skill_name),
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS projects (
    id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    employer_id BIGINT UNSIGNED NOT NULL,
    title VARCHAR(255) NOT NULL,
    description TEXT NOT NULL,
    skills_required JSON NULL,
    budget_min DECIMAL(10,2) NULL,
    budget_max DECIMAL(10,2) NULL,
    deadline DATE NULL,
    type ENUM('remote','onsite','hybrid') DEFAULT 'remote',
    duration ENUM('less_1_month','1_3_months','3_6_months','ongoing') DEFAULT '1_3_months',
    status ENUM('open','in_progress','completed','closed') DEFAULT 'open',
    hired_student_id BIGINT UNSIGNED NULL,
    completed_at TIMESTAMP NULL,
    views INT DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (employer_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (hired_student_id) REFERENCES users(id) ON DELETE SET NULL
);

CREATE TABLE IF NOT EXISTS applications (
    id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    project_id BIGINT UNSIGNED NOT NULL,
    student_id BIGINT UNSIGNED NOT NULL,
    cover_letter TEXT NOT NULL,
    portfolio_url VARCHAR(255) NULL,
    proposed_budget DECIMAL(10,2) NULL,
    status ENUM('pending','approved','rejected','withdrawn') DEFAULT 'pending',
    employer_note TEXT NULL,
    accepted_at TIMESTAMP NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    UNIQUE KEY unique_application (project_id, student_id),
    FOREIGN KEY (project_id) REFERENCES projects(id) ON DELETE CASCADE,
    FOREIGN KEY (student_id) REFERENCES users(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS project_milestones (
    id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    project_id BIGINT UNSIGNED NOT NULL,
    title VARCHAR(255) NOT NULL,
    description TEXT NULL,
    due_date DATE NULL,
    status ENUM('pending','in_progress','completed') DEFAULT 'pending',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (project_id) REFERENCES projects(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS skill_swaps (
    id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    user_id BIGINT UNSIGNED NOT NULL,
    teach_skill VARCHAR(255) NOT NULL,
    learn_skill VARCHAR(255) NOT NULL,
    description TEXT NULL,
    status ENUM('active','inactive') DEFAULT 'active',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS swap_requests (
    id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    from_user_id BIGINT UNSIGNED NOT NULL,
    to_user_id BIGINT UNSIGNED NOT NULL,
    swap_id BIGINT UNSIGNED NOT NULL,
    message TEXT NULL,
    status ENUM('pending','accepted','rejected') DEFAULT 'pending',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (from_user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (to_user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (swap_id) REFERENCES skill_swaps(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS conversations (
    id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    user_one_id BIGINT UNSIGNED NOT NULL,
    user_two_id BIGINT UNSIGNED NOT NULL,
    last_message_at TIMESTAMP NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    UNIQUE KEY unique_conversation (user_one_id, user_two_id),
    FOREIGN KEY (user_one_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (user_two_id) REFERENCES users(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS messages (
    id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    conversation_id BIGINT UNSIGNED NOT NULL,
    sender_id BIGINT UNSIGNED NOT NULL,
    body TEXT NOT NULL,
    is_read TINYINT(1) DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (conversation_id) REFERENCES conversations(id) ON DELETE CASCADE,
    FOREIGN KEY (sender_id) REFERENCES users(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS ratings (
    id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    from_user_id BIGINT UNSIGNED NOT NULL,
    to_user_id BIGINT UNSIGNED NOT NULL,
    project_id BIGINT UNSIGNED NOT NULL,
    score TINYINT UNSIGNED NOT NULL,
    review TEXT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE KEY unique_rating (from_user_id, to_user_id, project_id),
    FOREIGN KEY (from_user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (to_user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (project_id) REFERENCES projects(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS notifications (
    id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    user_id BIGINT UNSIGNED NOT NULL,
    type VARCHAR(100) NOT NULL,
    title VARCHAR(255) NOT NULL,
    body TEXT NOT NULL,
    link VARCHAR(500) NULL,
    is_read TINYINT(1) DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS activity_log (
    id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    user_id BIGINT UNSIGNED NOT NULL,
    type VARCHAR(100) NOT NULL,
    description VARCHAR(500) NOT NULL,
    entity_type VARCHAR(100) NULL,
    entity_id BIGINT UNSIGNED NULL,
    meta JSON NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS reports (
    id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    reporter_id BIGINT UNSIGNED NOT NULL,
    reportable_type VARCHAR(100) NOT NULL,
    reportable_id BIGINT UNSIGNED NOT NULL,
    reason VARCHAR(500) NOT NULL,
    details TEXT NULL,
    status ENUM('pending','reviewed','dismissed') DEFAULT 'pending',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (reporter_id) REFERENCES users(id) ON DELETE CASCADE
);

-- ─── Demo Seed Data ────────────────────────────────────────────────────────────
INSERT INTO users (name, email, password, role, bio, headline, location, website, is_active, availability) VALUES
('Admin', 'admin@skillmarket.com', '$2y$12$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'admin', NULL, 'Platform Administrator', NULL, NULL, 1, 'available'),
('TechCorp Pvt Ltd', 'employer@techcorp.com', '$2y$12$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'employer', 'We build scalable software solutions for Pakistan and the Gulf region. Founded 2018, 50+ projects delivered.', 'Software Agency · Lahore', 'Lahore, Pakistan', 'https://techcorp.pk', 1, 'available'),
('Ali Hassan', 'ali@student.com', '$2y$12$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'student', 'Final year CS student at UET Faisalabad. I love building fast, clean web applications with React and PHP.', 'Full-Stack Developer · Open to Work', 'Faisalabad, Pakistan', NULL, 1, 'available'),
('Sara Khan', 'sara@student.com', '$2y$12$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'student', 'Python and ML enthusiast. Working on NLP research at FAST-NUCES.', 'ML Engineer · Python Expert', 'Karachi, Pakistan', NULL, 1, 'available');

INSERT INTO user_skills (user_id, skill_name, proficiency) VALUES
(3, 'PHP', 'expert'), (3, 'React', 'intermediate'), (3, 'MySQL', 'intermediate'), (3, 'JavaScript', 'expert'), (3, 'Tailwind CSS', 'intermediate'),
(4, 'Python', 'expert'), (4, 'Machine Learning', 'intermediate'), (4, 'TensorFlow', 'intermediate'), (4, 'Data Analysis', 'expert'), (4, 'Django', 'beginner');

INSERT INTO projects (employer_id, title, description, skills_required, budget_min, budget_max, deadline, type, duration, status, views) VALUES
(2, 'E-commerce Platform Development', 'We need a full-stack developer to build a scalable e-commerce platform with product listings, cart, checkout, and admin panel. The platform should handle 10k+ concurrent users and integrate with JazzCash and Easypaisa.', '["PHP","React","MySQL","JavaScript","REST API"]', 30000, 80000, DATE_ADD(NOW(), INTERVAL 60 DAY), 'remote', '3_6_months', 'open', 47),
(2, 'Data Pipeline & ML Dashboard', 'Build an automated data pipeline that ingests CSV/Excel files, runs preprocessing, and outputs predictions via a trained ML model. Dashboard should visualize results with charts.', '["Python","Machine Learning","Django","Data Analysis","PostgreSQL"]', 20000, 50000, DATE_ADD(NOW(), INTERVAL 45 DAY), 'remote', '1_3_months', 'open', 23),
(2, 'Mobile App UI — React Native', 'Design and implement a React Native app for our logistics tracking product. Figma designs are ready. You will convert them into pixel-perfect components with smooth animations.', '["React","JavaScript","Tailwind CSS","REST API"]', 15000, 35000, DATE_ADD(NOW(), INTERVAL 30 DAY), 'remote', '1_3_months', 'open', 31);

INSERT INTO skill_swaps (user_id, teach_skill, learn_skill, description, status) VALUES
(3, 'PHP', 'Python', 'I can teach you modern PHP (8.x, OOP, MVC). I want to learn Python for scripting and automation.', 'active'),
(3, 'JavaScript', 'Machine Learning', 'Deep JS knowledge including ES6+, async/await. Looking to explore ML fundamentals.', 'active'),
(4, 'Python', 'PHP', 'Expert Python developer. Want to learn PHP for freelance web projects.', 'active'),
(4, 'Data Analysis', 'React', 'Can teach Pandas, NumPy, visualization. Want to learn React for data dashboards.', 'active');

-- ─── Session 6 Expanded Seed Data ─────────────────────────────────────────

-- New users: IDs 5, 6, 7
INSERT INTO users (id, name, email, password, role, bio, headline, location, website, is_active, availability) VALUES
(5, 'Zara Ahmed',    'zara@student.com',      '$2y$12$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'student',  'Computer Science student at NUST Islamabad. Passionate about Python, Django, and backend development.', 'Python Developer · Open to Work', 'Islamabad, Pakistan', NULL, 1, 'available'),
(6, 'DevStudio PK',  'employer@devstudio.pk', '$2y$12$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'employer', 'Creative digital studio based in Karachi. Specialising in web apps, dashboards, and AI integrations.', 'Digital Studio · Karachi', 'Karachi, Pakistan', 'https://devstudio.pk', 1, 'available'),
(7, 'Hassan Raza',   'hassan@student.com',    '$2y$12$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'student',  'React and Node.js developer from Lahore. Loves building modern full-stack applications.', 'MERN Stack Developer · Freelancing', 'Lahore, Pakistan', NULL, 1, 'available');

-- New user skills
INSERT INTO user_skills (user_id, skill_name, proficiency) VALUES
(5, 'Python', 'expert'), (5, 'Django', 'intermediate'), (5, 'PostgreSQL', 'intermediate'),
(7, 'React', 'expert'), (7, 'Node.js', 'intermediate'), (7, 'JavaScript', 'expert'), (7, 'MongoDB', 'intermediate');

-- New projects: IDs 4–8
INSERT INTO projects (id, employer_id, title, description, skills_required, budget_min, budget_max, deadline, type, duration, status, views) VALUES
(4, 6, 'React Dashboard for Analytics Tool',   'Build an interactive analytics dashboard with charts, filters, and real-time data. Must be responsive and support dark mode. Figma designs provided.', '["React","JavaScript","CSS"]', 20000, 45000, DATE_ADD(NOW(), INTERVAL 40 DAY),  'remote', '1_3_months',   'open', 18),
(5, 2, 'WordPress to Laravel Migration',       'Migrate an existing WordPress e-commerce site to a custom Laravel application. All data must be preserved and the new app should be faster and more maintainable.', '["PHP","Laravel","MySQL"]', 25000, 60000, DATE_ADD(NOW(), INTERVAL 50 DAY),  'remote', '3_6_months',   'open', 12),
(6, 6, 'AI Chatbot Integration',               'Integrate an AI chatbot into our customer support portal using the OpenAI API and Django backend. The bot should handle FAQs and escalate complex issues to humans.', '["Python","OpenAI API","Django"]', 18000, 40000, DATE_ADD(NOW(), INTERVAL 35 DAY),  'remote', '1_3_months',   'open', 29),
(7, 2, 'Mobile-First Portfolio Website',       'Design and develop a mobile-first personal portfolio website for our brand ambassador. Pixel-perfect implementation of provided Figma designs required.', '["HTML","CSS","JavaScript","React"]', 8000,  20000, DATE_ADD(NOW(), INTERVAL 20 DAY),  'remote', 'less_1_month', 'closed', 55),
(8, 6, 'Database Optimization Consultant',     'Audit and optimize slow queries across our production MySQL and PostgreSQL databases. Deliver a written report of findings plus implementation of top fixes.', '["MySQL","PostgreSQL","Query Optimization"]', 15000, 35000, DATE_ADD(NOW(), INTERVAL 25 DAY),  'remote', '1_3_months',   'open', 8);

-- New skill swap listings: IDs 5–8
INSERT INTO skill_swaps (id, user_id, teach_skill, learn_skill, description, status) VALUES
(5, 5, 'Python',   'React',    'I can teach Python fundamentals and scripting. Want to learn React for frontend projects.', 'active'),
(6, 5, 'Django',   'Node.js',  'Experienced with Django REST Framework. Looking to expand into Node.js for APIs.', 'active'),
(7, 7, 'React',    'Python',   'Expert React developer. Interested in learning Python for data projects and automation.', 'active'),
(8, 7, 'Node.js',  'Laravel',  'Can teach Node.js and Express. Want to learn Laravel for freelance PHP work.', 'active');

-- Applications
INSERT INTO applications (project_id, student_id, cover_letter, status) VALUES
(1, 3, 'I am a final-year CS student with strong PHP and React experience. I have built several e-commerce projects and can deliver a scalable, well-tested platform on time.', 'pending'),
(4, 3, 'I have built multiple React dashboards with Recharts and Chart.js. I am confident I can deliver the analytics tool you need with clean, maintainable code.', 'approved'),
(2, 4, 'As a Python and ML specialist I have built data pipelines with Pandas and Scikit-learn. I can implement the preprocessing pipeline and ML model dashboard you described.', 'pending'),
(6, 7, 'I have integrated the OpenAI API in two past projects and have solid Django experience. I can build the chatbot and escalation logic within the deadline.', 'rejected');

-- Swap requests
-- Ali (3) sent request to Sara's "Python → PHP" listing (id=3, to_user=4)
INSERT INTO swap_requests (from_user_id, to_user_id, swap_id, status) VALUES
(3, 4, 3, 'pending'),
-- Sara (4) sent request to Ali's "PHP → Python" listing (id=1, to_user=3)
(4, 3, 1, 'accepted');

-- Rating: Ali rated TechCorp 5 stars on e-commerce project
INSERT INTO ratings (from_user_id, to_user_id, project_id, score, review) VALUES
(3, 2, 1, 5, 'Great employer — clear requirements, prompt communication, and fair payment. Highly recommend working with TechCorp.');

-- ─── Demo seed data (Session 8) ─────────────────────────────────────────────

-- Demo conversations
INSERT INTO conversations (id, user_one_id, user_two_id, last_message_at) VALUES
(1, 3, 4, NOW()),
(2, 3, 7, DATE_SUB(NOW(), INTERVAL 1 DAY));

-- Demo messages (user IDs: Ali=3, Sara=4, Hassan=7)
INSERT INTO messages (conversation_id, sender_id, body, is_read, created_at) VALUES
(1, 4, 'Hey Ali! I reviewed your application for the Data Pipeline project. Looks promising!', 1, DATE_SUB(NOW(), INTERVAL 2 DAY)),
(1, 3, 'Thanks Sara! I have worked on 3 similar projects. Happy to share more details.', 1, DATE_SUB(NOW(), INTERVAL 2 DAY)),
(1, 4, 'Great. Can you start next week?', 1, DATE_SUB(NOW(), INTERVAL 1 DAY)),
(1, 3, 'Absolutely, I am available from Monday.', 0, DATE_SUB(NOW(), INTERVAL 23 HOUR)),
(2, 7, 'Hi Ali! Accepted your skill swap. When can we start the React sessions?', 1, DATE_SUB(NOW(), INTERVAL 3 DAY)),
(2, 3, 'I am free evenings after 7PM and weekends. Google Meet works for me.', 1, DATE_SUB(NOW(), INTERVAL 3 DAY)),
(2, 7, 'Perfect. Saturday 7PM it is!', 0, DATE_SUB(NOW(), INTERVAL 1 DAY));

-- Demo notifications (for user Ali = id 3)
INSERT INTO notifications (user_id, type, title, body, link, is_read, created_at) VALUES
(3, 'application',  'Application Approved',             'Your application for React Dashboard has been approved!',        '/my-applications', 0, DATE_SUB(NOW(), INTERVAL 2 HOUR)),
(3, 'message',      'New message from Sara Khan',       'Sara Khan: Can you start next week?',                            '/messages/1',      0, DATE_SUB(NOW(), INTERVAL 1 DAY)),
(3, 'swap_request', 'Swap Request Accepted',            'Hassan Raza accepted your skill swap request.',                  '/skill-swap',      1, DATE_SUB(NOW(), INTERVAL 3 DAY)),
(3, 'project',      'New project matching your skills', 'New React project posted: AI Chatbot Integration',              '/projects',        1, DATE_SUB(NOW(), INTERVAL 4 DAY)),
(4, 'application',  'New Application Received',         'Ali Hassan applied to your Data Science Pipeline project.',      '/my-projects',     0, DATE_SUB(NOW(), INTERVAL 1 HOUR)),
(7, 'message',      'New message from Ali Hassan',      'Ali Hassan: I am free evenings after 7PM.',                     '/messages/2',      0, DATE_SUB(NOW(), INTERVAL 3 DAY));

-- Demo ratings
INSERT INTO ratings (from_user_id, to_user_id, project_id, score, review, created_at) VALUES
(3, 1, 1, 5, 'Excellent employer! Clear requirements, fast feedback, and fair payment.', DATE_SUB(NOW(), INTERVAL 10 DAY)),
(1, 3, 1, 4, 'Ali delivered clean code on time. Would hire again.', DATE_SUB(NOW(), INTERVAL 9 DAY));

-- ─── Patch: Add skills columns (for existing installs) ──────────────────────
ALTER TABLE users ADD COLUMN IF NOT EXISTS skills_can_teach VARCHAR(500) NULL AFTER experience;
ALTER TABLE users ADD COLUMN IF NOT EXISTS skills_want_to_learn VARCHAR(500) NULL AFTER skills_can_teach;

-- Seed skills for demo users
UPDATE users SET skills_can_teach = 'PHP, JavaScript, React, MySQL', skills_want_to_learn = 'Python, Machine Learning' WHERE id = 3;
UPDATE users SET skills_can_teach = 'Python, Data Analysis, TensorFlow', skills_want_to_learn = 'PHP, React' WHERE id = 4;
UPDATE users SET skills_can_teach = 'Python, Django', skills_want_to_learn = 'React, Node.js' WHERE id = 5;
UPDATE users SET skills_can_teach = 'React, Node.js, JavaScript', skills_want_to_learn = 'Python, Laravel' WHERE id = 7;
