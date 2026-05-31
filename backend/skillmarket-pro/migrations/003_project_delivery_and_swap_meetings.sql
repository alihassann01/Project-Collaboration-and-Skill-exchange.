ALTER TABLE projects
    MODIFY status ENUM('open','in_progress','delivered','reviewing','revision_requested','completed','closed') DEFAULT 'open';

ALTER TABLE projects
    ADD COLUMN IF NOT EXISTS delivery_file_path VARCHAR(500) NULL,
    ADD COLUMN IF NOT EXISTS delivery_original_name VARCHAR(255) NULL,
    ADD COLUMN IF NOT EXISTS delivered_at TIMESTAMP NULL,
    ADD COLUMN IF NOT EXISTS reviewed_at TIMESTAMP NULL,
    ADD COLUMN IF NOT EXISTS revision_note TEXT NULL;

ALTER TABLE swap_requests
    ADD COLUMN IF NOT EXISTS meeting_link VARCHAR(500) NULL;
