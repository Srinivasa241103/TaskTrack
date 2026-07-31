# TaskTrack — Team Task Manager

A collaborative team task management web app. Users sign up, create projects, invite
members, assign tasks, and track progress on a Kanban board — a simplified Trello/Asana.


---

## Tech stack

| Layer | Technology |
|-------|------------|
| Frontend | React 19 + Vite, plain CSS (no UI framework), Fetch-based API client, lightweight History-API routing |
| Backend | Node.js + Express 4 (ES modules) |
| Database | PostgreSQL (raw SQL via `pg`, no ORM) |
| Auth | JWT access + refresh tokens, `bcrypt` password hashing, stored in `httpOnly` cookies |
| Deployment | Railway (single monorepo service — the backend serves the built frontend in production) |

---

## Test logins

Three accounts to explore the app. All use the same password:

| Role in demo | Email | Password |
|--------------|-------|----------|
| Project Admin (creator/owner) | `aarav.sharma@example.com` | `Password@123` |
| Member | `diya.patel@example.com` | `Password@123` |
| Member | `rohan.mehta@example.com` | `Password@123` |

> Roles are **per project**: whoever creates a project becomes its Admin. Log in as
> `aarav.sharma@example.com` to see the admin view (add/remove members, create/delete
> tasks). The others are members on that project and can update only tasks assigned to them.
>
> Running locally with a fresh database? These accounts won't exist yet — create them
> from the **Sign up** screen (any name/email + an 8+ char password), or seed your own.

---

## Navigating the app

| URL | Screen | What you can do |
|-----|--------|-----------------|
| `/` → `/dashboard` | **Dashboard** | Total tasks, tasks by status, tasks per user, overdue count, your priority tasks, active projects |
| `/projects` | **Projects** | See every project you belong to; create a new project (you become its admin) |
| `/projects/:id` | **Project board** | Kanban board (drag cards between To Do → In Progress → Done) or list view; open the **Members** panel; create tasks |
| `/mytasks` | **My Tasks** | Tasks assigned to you, grouped by Overdue / This week / Later / Done |
| `/account` | **Account** | Your name, email, role, and logout |

Key interactions:
- **Create a project** → Projects → *New project* (name + a short uppercase key like `WEB`).
- **Add/remove members** → open a project → *Members* (admin only).
- **Create a task** → *Create task* (top bar or project board): title, description, due date, priority, assignee.
- **Update status** → drag a card on the board, or change it in the task modal. Status is
  **forward-only**: To Do → In Progress → Done (it can't move backward).
- **Members vs admins**: a member can only update the *status* of tasks assigned to them; the
  project admin manages everything in their project.

---

## Project structure

```
.
├── package.json          # monorepo scripts (install all, build frontend, start backend)
├── backend/              # Express API
│   ├── index.js          # entry — starts the server
│   ├── app.js            # express app, routes, prod static serving of frontend/dist
│   └── src/
│       ├── routes/  controllers/  services/  models/  middlewares/  utils/
│       └── config/
│           ├── dbConfig.js   # pg pool
│           └── schema.sql    # full database schema (run once)
└── frontend/             # React + Vite app
    └── src/  (screens/, components/, services/api.js, ...)
```

Additional reference docs in the repo root: `database_schema_docs.md`, `projects_api_docs.md`,
`tasks_api_docs.md`.

---

## Local setup

**Prerequisites:** Node.js 18+, a PostgreSQL database.

1. **Clone**
   ```bash
   git clone <repo-url> && cd Assignment
   ```

2. **Create the database schema** (run once against your Postgres instance):
   ```bash
   psql "<your-postgres-connection-string>" -f backend/src/config/schema.sql
   ```

3. **Configure backend environment** — create `backend/.env` (see [Environment variables](#environment-variables)).

4. **Install dependencies** (from the repo root):
   ```bash
   npm run install:all      # installs both backend and frontend
   ```

5. **Run the backend** (port 3000):
   ```bash
   cd backend && npm run dev
   ```

6. **Run the frontend** (port 5173) in a second terminal:
   ```bash
   cd frontend && npm run dev
   ```
   Vite proxies `/api` → `http://localhost:3000`, so the frontend talks to your local API.

7. Open **http://localhost:5173** and sign up.

---

## Deployment (Railway)

The app deploys as a **single Railway service**. In production the Express server serves the
built React app, so one URL hosts both the API (`/api/v1/...`) and the SPA.

1. **Provision a PostgreSQL database** on Railway and apply the schema once:
   ```bash
   psql "$DB_CONNECTION_STRING" -f backend/src/config/schema.sql
   ```
2. **Create a service from this repo.** Railway uses the root `package.json`:
   - **Build:** `npm run build` → installs backend + frontend deps and builds the frontend (`frontend/dist`).
   - **Start:** `npm start` → runs the backend, which serves `frontend/dist` and the API.
3. **Set the environment variables** (below). Set `NODE_ENV=production` so static serving is enabled.
4. Deploy. The public Railway URL serves the whole app.

---

## Environment variables

Set these in `backend/.env` locally and in the Railway service settings in production.

| Variable | Required | Description |
|----------|----------|-------------|
| `DB_CONNECTION_STRING` | yes* | Full Postgres connection string. *Alternatively provide the discrete vars below.* |
| `DB_HOST`, `DB_PORT`, `DB_NAME`, `DB_USER`, `DB_PASSWORD` | yes* | Used only if `DB_CONNECTION_STRING` is not set. |
| `JWT_ACCESS_SECRET` | yes | Secret for signing short-lived access tokens. |
| `JWT_REFRESH_SECRET` | yes | Secret for signing refresh tokens. |
| `JWT_ACCESS_TOKEN_EXPIRES_IN` | no | Access token lifetime (default `1d`). |
| `JWT_REFRESH_TOKEN_EXPIRES_IN` | no | Refresh token lifetime (default `7d`). |
| `CLIENT_URL` | no | Allowed CORS origin (default `http://localhost:5173`). |
| `NODE_ENV` | prod | Set to `production` on Railway to enable static serving + secure cookies. |
| `PORT` | no | Server port (default `3000`; Railway sets this automatically). |

---

## Database schema & relations

PostgreSQL with UUID primary keys. Three enums enforce valid values at the DB level:
`user_role` (`admin`, `member`), `task_status` (`todo`, `in_progress`, `done`),
`task_priority` (`Critical`, `Urgent`, `Required`).

**Tables**

- **users** — registered users (`name`, `email`, `password_hash`, `role`, display fields).
- **projects** — `owner_id → users.id` (the creator/admin), plus `name`, unique `key`, `color`.
- **project_members** — join table linking `project_id → projects.id` and `user_id → users.id`
  (`UNIQUE(project_id, user_id)`). This is the many-to-many between users and projects.
- **tasks** — `project_id → projects.id`, `assignee_id → users.id` (nullable),
  `reporter_id → users.id` (creator); plus `title`, `description`, `status`, `priority`, `due_date`, unique `key`.
- **task_counters** — `project_id → projects.id`; per-project counter so task keys are
  contiguous within a project (e.g. `WEB-1`, `WEB-2`).
- **activity_log** — `task_id → tasks.id`, `user_id → users.id`; records task events
  (status changes, reassignments) for history.
- **refresh_tokens** — `user_id → users.id`; server-side refresh tokens so sessions can be revoked on logout.

**Relationships at a glance**

```
users ─┬─< project_members >─── projects        (many-to-many membership)
       ├──────── owns ────────> projects.owner_id   (one owner/admin per project)
       ├──────── assigned ────> tasks.assignee_id
       └──────── reported ────> tasks.reporter_id

projects ──< tasks                 (a project has many tasks)
projects ──1 task_counters         (one counter per project)
tasks    ──< activity_log
users    ──< refresh_tokens
```

All foreign keys use `ON DELETE CASCADE`, so deleting a project removes its members, tasks,
counters, and the tasks' activity.

---

## API overview

All endpoints are prefixed with `/api/v1`. Protected routes require a valid auth cookie
(set automatically on login/signup). Authorization (admin vs member) is enforced server-side.

| Method | Endpoint | Purpose |
|--------|----------|---------|
| POST | `/auth/register` | Sign up (name, email, password) |
| POST | `/auth/login` | Log in |
| GET | `/projects` | Projects the user belongs to |
| POST | `/projects` | Create a project (creator becomes admin) |
| POST | `/projects/:id/members` | Add a member (admin only) |
| DELETE | `/projects/:id/member` | Remove a member (admin only) |
| GET | `/tasks` | Tasks across the user's projects (supports filters) |
| POST | `/tasks` | Create a task (project admin) |
| PUT | `/tasks/:id` | Update a task (status is forward-only; members limited to status of their own tasks) |
| DELETE | `/tasks/:id` | Delete a task (project admin) |
| GET | `/users` | List users (for assignment) |
| GET | `/dashboard` | Aggregated metrics: total, by status, per user, overdue |

See `projects_api_docs.md` and `tasks_api_docs.md` for request/response details.

---

## Notes for reviewers

- Authentication uses `httpOnly` cookies; tokens are never exposed to JS. Refresh tokens are
  stored server-side and silently rotated.
- Roles are **per project** (not global): the project creator is that project's admin.
- Task status follows a one-way flow: **To Do → In Progress → Done**.
- The frontend is a single-page app; deep links (e.g. `/projects/<id>`) work because the
  backend falls back to `index.html` for non-API routes in production.
