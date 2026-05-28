-- ============================================================
-- TaskTrack — PostgreSQL Database Schema
-- ============================================================
-- This file defines the full relational schema for the TaskTrack
-- project management application. It is designed for Supabase 
-- Postgres and uses raw SQL (no ORM).
--
-- Run this file once to bootstrap the database:
--   psql $DATABASE_URL -f schema.sql
-- ============================================================


-- ────────────────────────────────────────────────────────────
-- 0. EXTENSIONS
-- ────────────────────────────────────────────────────────────
-- uuid-ossp gives us uuid_generate_v4() for primary keys.
-- Supabase enables this by default, but we keep it explicit.
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";


-- ────────────────────────────────────────────────────────────
-- 1. ENUM TYPES
-- ────────────────────────────────────────────────────────────
-- Using Postgres enums enforces valid values at the DB level,
-- which is stronger than a CHECK constraint on a VARCHAR.

-- System-wide user role (Admin can manage projects & users,
-- Member can only work on tasks assigned to them).
CREATE TYPE user_role AS ENUM ('admin', 'member');

-- Task lifecycle stages — matches the Kanban columns in the UI.
CREATE TYPE task_status AS ENUM ('todo', 'in_progress', 'done');

-- Task urgency levels — shown as colored arrows in the UI.
CREATE TYPE task_priority AS ENUM ('Critical', 'Urgent', 'Required');


-- ────────────────────────────────────────────────────────────
-- 2. USERS TABLE
-- ────────────────────────────────────────────────────────────
-- Stores every registered user. Passwords are stored as bcrypt
-- hashes (handled in the application layer).
--
-- Frontend references: USERS array in mockData.js
-- Fields like initials, avatar_color are used by the Avatar
-- component; job_title, phone, location, timezone, bio are
-- used by the ProfileScreen.
-- ────────────────────────────────────────────────────────────
CREATE TABLE users (
    id            UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name          VARCHAR(100)  NOT NULL,
    email         VARCHAR(255)  NOT NULL UNIQUE,
    password_hash VARCHAR(255)  NOT NULL,
    role          user_role     NOT NULL DEFAULT 'member',

    -- Profile / display fields
    initials      VARCHAR(5),                          -- e.g. "AM" — auto-derived from name if null
    avatar_color  VARCHAR(7)    DEFAULT '#6366F1',     -- hex color for the avatar circle
    job_title     VARCHAR(100),                        -- e.g. "Product Designer"
    phone         VARCHAR(20),
    location      VARCHAR(100),
    timezone      VARCHAR(50)   DEFAULT 'Asia/Kolkata',
    bio           VARCHAR(240),

    -- Timestamps
    created_at    TIMESTAMPTZ   NOT NULL DEFAULT NOW(),
    updated_at    TIMESTAMPTZ   NOT NULL DEFAULT NOW()
);

-- Fast lookup by email (used on every login)
CREATE INDEX idx_users_email ON users (email);


-- ────────────────────────────────────────────────────────────
-- 3. PROJECTS TABLE
-- ────────────────────────────────────────────────────────────
-- Each project has an owner (the admin who created it),
-- a short key used as a prefix for task IDs (e.g. "WEB"),
-- and a color used in the UI for the project badge.
--
-- Frontend references: PROJECTS array in mockData.js,
-- ProjectsDirectory screen, ProjectScreen board.
-- ────────────────────────────────────────────────────────────
CREATE TABLE projects (
    id            UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name          VARCHAR(150)  NOT NULL,
    key           VARCHAR(10)   NOT NULL UNIQUE,       -- short code like "WEB", "MOB"
    description   TEXT,
    color         VARCHAR(7)    DEFAULT '#3730E0',     -- hex color for project badge
    owner_id      UUID          NOT NULL REFERENCES users(id) ON DELETE CASCADE,

    -- Timestamps
    created_at    TIMESTAMPTZ   NOT NULL DEFAULT NOW(),
    updated_at    TIMESTAMPTZ   NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_projects_owner ON projects (owner_id);


-- ────────────────────────────────────────────────────────────
-- 4. PROJECT_MEMBERS (Join Table)
-- ────────────────────────────────────────────────────────────
-- Many-to-many relationship between users and projects.
-- A user can be a member of multiple projects; a project can
-- have multiple members. The project owner is implicitly a
-- member but we also insert a row for them for consistent
-- querying.
--
-- Frontend references: project.members array in mockData.js,
-- AvatarStack on project cards, "Add member" button on
-- ProjectScreen.
-- ────────────────────────────────────────────────────────────
CREATE TABLE project_members (
    id            UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    project_id    UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
    user_id       UUID NOT NULL REFERENCES users(id)    ON DELETE CASCADE,
    joined_at     TIMESTAMPTZ NOT NULL DEFAULT NOW(),

    -- Prevent duplicate memberships
    UNIQUE (project_id, user_id)
);

CREATE INDEX idx_pm_project ON project_members (project_id);
CREATE INDEX idx_pm_user    ON project_members (user_id);


-- ────────────────────────────────────────────────────────────
-- 5. TASKS TABLE
-- ────────────────────────────────────────────────────────────
-- The core entity. Every task belongs to exactly one project
-- and is optionally assigned to one user.
--
-- `key` is a human-readable identifier like "WEB-12" that is
-- auto-generated (project.key + a per-project counter).
--
-- `labels` is stored as a Postgres TEXT[] array, which maps
-- directly to the labels badges on the Kanban cards.
--
-- Frontend references: TASKS array in mockData.js, KanbanBoard,
-- TaskCard, TaskModal, MyTasksScreen, Dashboard priority list.
-- ────────────────────────────────────────────────────────────
CREATE TABLE tasks (
    id            UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    key           VARCHAR(20)   NOT NULL UNIQUE,        -- e.g. "WEB-12"
    title         VARCHAR(255)  NOT NULL,
    description   TEXT,
    status        task_status   NOT NULL DEFAULT 'todo',
    priority      task_priority NOT NULL DEFAULT 'Urgent',
    due_date      DATE,
    labels        TEXT[]        DEFAULT '{}',            -- e.g. {"design","frontend"}

    -- Relationships
    project_id    UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
    assignee_id   UUID          REFERENCES users(id)    ON DELETE SET NULL,
    reporter_id   UUID          REFERENCES users(id)    ON DELETE SET NULL,

    -- Timestamps
    created_at    TIMESTAMPTZ   NOT NULL DEFAULT NOW(),
    updated_at    TIMESTAMPTZ   NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_tasks_project  ON tasks (project_id);
CREATE INDEX idx_tasks_assignee ON tasks (assignee_id);
CREATE INDEX idx_tasks_status   ON tasks (status);
CREATE INDEX idx_tasks_due      ON tasks (due_date);


-- ────────────────────────────────────────────────────────────
-- 6. TASK_COUNTER (Per-Project Auto-Increment for Task Keys)
-- ────────────────────────────────────────────────────────────
-- Instead of relying on a global sequence, we maintain a
-- counter per project so that task keys are contiguous within
-- each project (WEB-1, WEB-2, …, MOB-1, MOB-2, …).
-- ────────────────────────────────────────────────────────────
CREATE TABLE task_counters (
    project_id    UUID PRIMARY KEY REFERENCES projects(id) ON DELETE CASCADE,
    last_number   INT NOT NULL DEFAULT 0
);


-- ────────────────────────────────────────────────────────────
-- 7. ACTIVITY LOG TABLE
-- ────────────────────────────────────────────────────────────
-- Records every meaningful change on a task: status updates,
-- reassignments, comments, etc. Displayed in the Activity
-- section of the TaskModal and on the Dashboard's
-- "Recent activity" card.
--
-- `action` stores the type of event (e.g. 'status_change',
-- 'comment', 'assignee_change', 'created', 'deleted').
-- `details` is a flexible JSONB column to hold extra data
-- (e.g. { "from": "todo", "to": "in_progress" }).
--
-- Frontend references: ACTIVITY array in mockData.js,
-- activity__item in TaskModal, ActivityItem on Dashboard.
-- ────────────────────────────────────────────────────────────
CREATE TABLE activity_log (
    id            UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    task_id       UUID NOT NULL REFERENCES tasks(id) ON DELETE CASCADE,
    user_id       UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    action        VARCHAR(50)  NOT NULL,               -- 'comment', 'status_change', etc.
    content       TEXT,                                 -- comment body or human-readable summary
    details       JSONB        DEFAULT '{}',            -- structured metadata
    created_at    TIMESTAMPTZ  NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_activity_task    ON activity_log (task_id);
CREATE INDEX idx_activity_user    ON activity_log (user_id);
CREATE INDEX idx_activity_created ON activity_log (created_at DESC);


-- ────────────────────────────────────────────────────────────
-- 8. REFRESH TOKENS TABLE
-- ────────────────────────────────────────────────────────────
-- Stores server-side refresh tokens so they can be invalidated
-- on logout or suspicious activity. One row per active session.
-- ────────────────────────────────────────────────────────────
CREATE TABLE refresh_tokens (
    id         UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id    UUID        NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    token      TEXT        NOT NULL UNIQUE,
    expires_at TIMESTAMPTZ NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_refresh_tokens_user  ON refresh_tokens (user_id);
CREATE INDEX idx_refresh_tokens_token ON refresh_tokens (token);


-- ────────────────────────────────────────────────────────────
-- 9. HELPER FUNCTION: AUTO-UPDATE updated_at
-- ────────────────────────────────────────────────────────────
-- This trigger function automatically sets `updated_at` to
-- NOW() whenever a row is updated, so the application layer
-- doesn't need to manually pass timestamps.
-- ────────────────────────────────────────────────────────────
CREATE OR REPLACE FUNCTION trigger_set_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Attach the trigger to every table with an updated_at column
CREATE TRIGGER set_users_updated_at
    BEFORE UPDATE ON users
    FOR EACH ROW EXECUTE FUNCTION trigger_set_updated_at();

CREATE TRIGGER set_projects_updated_at
    BEFORE UPDATE ON projects
    FOR EACH ROW EXECUTE FUNCTION trigger_set_updated_at();

CREATE TRIGGER set_tasks_updated_at
    BEFORE UPDATE ON tasks
    FOR EACH ROW EXECUTE FUNCTION trigger_set_updated_at();
