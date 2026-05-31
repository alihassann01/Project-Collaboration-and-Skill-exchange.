-- Migration: Make ratings.project_id nullable for skill-swap ratings (no project involved).
-- Run once against the skillmarket database on existing installs.
-- Fresh installs using schema.sql already have this column nullable.

-- Step 1: Drop all possible FK constraint names on project_id.
ALTER TABLE ratings DROP FOREIGN KEY IF EXISTS ratings_ibfk_3;
ALTER TABLE ratings DROP FOREIGN KEY IF EXISTS fk_ratings_project;
ALTER TABLE ratings DROP FOREIGN KEY IF EXISTS ratings_project_id_foreign;

-- Step 2: Make column nullable (NULL = swap rating, no project).
ALTER TABLE ratings MODIFY COLUMN project_id BIGINT UNSIGNED NULL DEFAULT NULL;

-- Step 3: Re-add FK with SET NULL so deleting a project nullifies ratings
--         rather than blocking the delete or cascade-deleting history.
ALTER TABLE ratings
    ADD CONSTRAINT fk_ratings_project
    FOREIGN KEY (project_id) REFERENCES projects(id) ON DELETE SET NULL;

-- Note on uniqueness:
-- MySQL's UNIQUE KEY on (from_user_id, to_user_id, project_id) treats two NULLs
-- as distinct rows, so two swap ratings between the same pair could slip through
-- at the DB level during a race. The app-layer duplicate check in RatingController
-- handles this. For full protection, consider a sentinel value or a separate table.
