# Evolution of Todo - Detailed Tasks (Phase II-V)

**Project**: Evolution of Todo
**Document**: Extended task breakdown for Phase II through Phase V
**Parent Document**: `TASKS.md`
**Version**: 1.0.0
**Created**: 2025-12-25

---

## PHASE II: FULL-STACK WEB APPLICATION (Detailed)

### Task II-2.1: Write API Endpoints Specification

**ID:** II-2.1
**Duration:** 90 minutes
**Depends on:** Task II-1.2
**Priority:** High
**Spec Reference:** `SPECIFICATION.md` Phase II - API Endpoints

**Description:**
Create comprehensive specification for all REST API endpoints including authentication and task management.

**What to do:**
1. Create `specs/api/rest-endpoints.md`
2. Document authentication endpoints:
   - POST /api/v1/auth/register
     - Request: {email, password, name}
     - Response: {user_id, email, name, token}
     - Errors: 409 (email exists), 422 (validation failed)
   - POST /api/v1/auth/login
     - Request: {email, password}
     - Response: {user_id, email, name, token}
     - Errors: 401 (invalid credentials)
3. Document all 6 task endpoints with full details:
   - GET /api/v1/{user_id}/tasks (list all)
   - POST /api/v1/{user_id}/tasks (create)
   - GET /api/v1/{user_id}/tasks/{id} (get one)
   - PUT /api/v1/{user_id}/tasks/{id} (update)
   - DELETE /api/v1/{user_id}/tasks/{id} (delete)
   - PATCH /api/v1/{user_id}/tasks/{id}/complete (toggle)
4. For each endpoint, specify:
   - HTTP method and path
   - Request body (if applicable)
   - Response body
   - Status codes (200, 201, 401, 403, 404, 422)
   - Error responses (use standardized format from error-codes.md)
5. Document JWT token flow:
   - Token in Authorization header: `Bearer <token>`
   - Token expiration (7 days)
   - user_id validation (must match token)

**Acceptance Criteria:**
- [ ] All 8 endpoints documented (2 auth + 6 task)
- [ ] Request/response examples provided for each
- [ ] Error responses use standardized format from error-codes.md
- [ ] JWT authentication flow documented
- [ ] Status codes specified correctly
- [ ] user_id validation rules documented

**Output:**
- `specs/api/rest-endpoints.md` with complete API specification

**Example:**
```markdown
### POST /api/v1/auth/register

**Description:** Register new user account

**Request:**
```json
{
  "email": "user@example.com",
  "password": "SecurePass123",
  "name": "John Doe"
}
```

**Response (201 Created):**
```json
{
  "user_id": "usr_abc123",
  "email": "user@example.com",
  "name": "John Doe",
  "token": "eyJhbGc..."
}
```

**Errors:**
- 409 Conflict: `{"error": {"code": "AUTH_EMAIL_EXISTS", "message": "Email already registered"}}`
- 422 Unprocessable: `{"error": {"code": "AUTH_INVALID_PASSWORD", "message": "Password must be 8+ characters"}}`
```

---

### Task II-2.2: Implement Authentication with Better Auth

**ID:** II-2.2
**Duration:** 120 minutes
**Depends on:** Task II-2.1
**Priority:** High
**Spec Reference:** `specs/api/rest-endpoints.md`, `specs/technical/error-codes.md`, `CONSTITUTION.md` Section XIII

**Description:**
Implement user authentication using Better Auth with JWT tokens following the authentication strategy in CONSTITUTION.md.

**What to do:**
1. Install Better Auth for FastAPI:
   ```bash
   uv add better-auth-fastapi
   ```
2. Configure Better Auth in `src/config.py`:
   - Set JWT secret from environment (BETTER_AUTH_SECRET)
   - Set token expiration (7 days = 604800 seconds)
   - Configure password requirements (8+ chars, mixed case, number)
3. Create `src/auth.py`:
   - Password hashing functions
   - JWT token generation
   - JWT token verification
4. Create `src/routes/auth.py`:
   - POST /api/v1/auth/register endpoint
   - POST /api/v1/auth/login endpoint
5. Implement JWT middleware in `src/middleware/auth.py`:
   - Extract token from Authorization header
   - Verify token signature and expiration
   - Extract user_id from token payload
   - Attach user to request context
6. Create error handler middleware in `src/middleware/errors.py`:
   - Catch exceptions
   - Return standardized error format
7. Test with Postman/Insomnia:
   - Register new user → receive token
   - Login with credentials → receive token
   - Use token in subsequent requests
8. Document iterations in PHR

**Acceptance Criteria:**
- [ ] User can register with email/password
- [ ] Password hashed automatically (never stored plain text)
- [ ] Password validation enforced (8+ chars, mixed case, number)
- [ ] User can login and receive JWT token
- [ ] Token expires after 7 days (604800 seconds)
- [ ] Token payload contains user_id in 'sub' field
- [ ] JWT middleware extracts user_id from valid tokens
- [ ] Invalid/expired tokens return 401 with error code AUTH_TOKEN_INVALID
- [ ] Duplicate email returns 409 with AUTH_EMAIL_EXISTS
- [ ] Invalid credentials return 401 with AUTH_INVALID_CREDENTIALS

**Output:**
- `backend/src/config.py`
- `backend/src/auth.py`
- `backend/src/routes/auth.py`
- `backend/src/middleware/auth.py`
- `backend/src/middleware/errors.py`
- Updated `backend/src/main.py` (register routers and middleware)
- PHR in `history/prompts/phase-2/`

**Notes:**
- Follow CONSTITUTION.md Section XIII for authentication architecture
- Use environment variables for secrets (never hardcode)
- Test token expiration by setting short expiration temporarily

---

### Task II-2.3: Implement Task CRUD Endpoints

**ID:** II-2.3
**Duration:** 150 minutes
**Depends on:** Task II-2.2
**Priority:** High
**Spec Reference:** `specs/api/rest-endpoints.md`, `specs/technical/error-codes.md`

**Description:**
Implement all 6 task management endpoints with JWT authentication and user isolation.

**What to do:**
1. Create `backend/src/routes/tasks.py`
2. Implement GET /api/v1/{user_id}/tasks:
   - Verify JWT token
   - Verify user_id in URL matches token
   - Query tasks filtered by user_id
   - Return array of tasks with timestamps (ISO 8601 with Z)
3. Implement POST /api/v1/{user_id}/tasks:
   - Verify authentication
   - Validate title (1-200 chars) and description (max 1000)
   - Create task with user_id, auto-generate timestamps
   - Return created task (201)
4. Implement GET /api/v1/{user_id}/tasks/{id}:
   - Verify authentication
   - Query task by ID and user_id
   - Return 404 if not found or belongs to different user
5. Implement PUT /api/v1/{user_id}/tasks/{id}:
   - Verify authentication
   - Validate updated fields
   - Update task, set updated_at to current UTC time
   - Return updated task
6. Implement DELETE /api/v1/{user_id}/tasks/{id}:
   - Verify authentication
   - Hard delete task (per CONSTITUTION.md)
   - Return 204 No Content
7. Implement PATCH /api/v1/{user_id}/tasks/{id}/complete:
   - Verify authentication
   - Toggle completed status
   - Update updated_at timestamp
   - Return updated task
8. Add dependency injection for authentication (get_current_user)
9. Implement error handling for all endpoints
10. Test all endpoints with Postman (valid and invalid scenarios)

**Acceptance Criteria:**
- [ ] All 6 task endpoints implemented
- [ ] JWT authentication required on all endpoints
- [ ] User can only access own tasks (filtered by user_id)
- [ ] Mismatched user_id in URL vs token returns 403 FORBIDDEN
- [ ] Task not found returns 404 with TASK_NOT_FOUND error code
- [ ] Task belonging to another user returns 404 (not 403, to avoid leaking existence)
- [ ] All errors use standardized format from error-codes.md
- [ ] created_at auto-generated on creation (UTC)
- [ ] updated_at auto-updated on modification (UTC)
- [ ] Timestamps serialized as ISO 8601 with Z suffix
- [ ] Validation errors return 422 with appropriate error codes

**Output:**
- `backend/src/routes/tasks.py`
- Updated `backend/src/middleware/errors.py` (if needed)
- Updated `backend/src/main.py` (register tasks router)
- PHR in `history/prompts/phase-2/`

**Notes:**
- User isolation is CRITICAL - always filter by user_id from token, not URL
- Return 404 for unauthorized access (don't reveal task exists for other users)
- Follow specs/technical/timezone-handling.md for timestamp serialization

---

### Task II-3.1: Initialize Next.js Frontend

**ID:** II-3.1
**Duration:** 60 minutes
**Depends on:** Task II-2.3
**Priority:** High
**Spec Reference:** `SPECIFICATION.md` Phase II - Technology Stack, `CONSTITUTION.md` Section II

**Description:**
Set up Next.js 16+ frontend with App Router, TypeScript, and Tailwind CSS following CONSTITUTION.md requirements.

**What to do:**
1. Navigate to `/frontend` folder
2. Run create-next-app:
   ```bash
   npx create-next-app@latest . --app --typescript --tailwind --eslint
   ```
3. Verify configuration:
   - App Router enabled (not Pages Router)
   - TypeScript configured
   - Tailwind CSS working
   - ESLint configured
4. Install additional dependencies:
   ```bash
   npm install better-auth axios date-fns
   ```
5. Create folder structure:
   ```
   /src
     /app (Next.js pages)
     /components (React components)
     /lib (utilities and API client)
     /types (TypeScript types)
   ```
6. Create `src/lib/config.ts`:
   - Export API_URL from environment (NEXT_PUBLIC_API_URL)
   - Export auth configuration
7. Create `.env.example`:
   ```
   NEXT_PUBLIC_API_URL=http://localhost:8000
   NEXT_PUBLIC_BETTER_AUTH_URL=http://localhost:3000
   ```
8. Test dev server:
   ```bash
   npm run dev
   ```
9. Verify localhost:3000 loads

**Acceptance Criteria:**
- [ ] Next.js 16+ installed with App Router
- [ ] TypeScript configured (strict mode enabled)
- [ ] Tailwind CSS working (test with utility classes)
- [ ] Additional dependencies installed
- [ ] Folder structure created
- [ ] Environment variables template created
- [ ] Config file exports API_URL from environment
- [ ] Dev server runs on localhost:3000
- [ ] No build errors or warnings

**Output:**
- `frontend/package.json`
- `frontend/next.config.js`
- `frontend/tsconfig.json`
- `frontend/tailwind.config.js`
- `frontend/.env.example`
- `frontend/src/lib/config.ts`
- Folder structure

**Notes:**
- MUST use App Router (not Pages Router per CONSTITUTION.md)
- NEXT_PUBLIC_ prefix required for client-side environment variables
- Verify strict TypeScript mode enabled in tsconfig.json

---

### Task II-3.2: Setup Better Auth and API Client

**ID:** II-3.2
**Duration:** 120 minutes
**Depends on:** Task II-3.1
**Priority:** High
**Spec Reference:** `specs/api/rest-endpoints.md`, `CONSTITUTION.md` Section XIII

**Description:**
Implement authentication flow and API client for communication with backend.

**What to do:**
1. Install Better Auth client:
   ```bash
   npm install better-auth
   ```
2. Configure Better Auth in `src/lib/auth.ts`:
   - Configure auth provider
   - Setup token storage (localStorage)
   - Create login function
   - Create register function
   - Create logout function
   - Create getToken function
3. Create login page `src/app/login/page.tsx`:
   - Email and password inputs
   - Form validation
   - Call backend /api/v1/auth/login
   - Store JWT token on success
   - Redirect to dashboard
   - Display errors
4. Create register page `src/app/register/page.tsx`:
   - Email, password, name inputs
   - Password requirements displayed
   - Form validation
   - Call backend /api/v1/auth/register
   - Store JWT token on success
   - Redirect to dashboard
5. Create API client in `src/lib/api.ts`:
   - axios instance with baseURL
   - Request interceptor (add Authorization header from token)
   - Response interceptor (handle errors)
   - Methods for all task endpoints:
     - getTasks(userId)
     - createTask(userId, data)
     - getTask(userId, taskId)
     - updateTask(userId, taskId, data)
     - deleteTask(userId, taskId)
     - toggleComplete(userId, taskId)
6. Create TypeScript types in `src/types/task.ts`:
   - Task interface
   - User interface
   - API response types
7. Test auth flow:
   - Register new account
   - Login with credentials
   - Verify token stored in localStorage
   - Verify token included in API requests

**Acceptance Criteria:**
- [ ] User can register and see success message
- [ ] User can login and JWT token stored in localStorage
- [ ] Logout clears token and redirects to login
- [ ] API client automatically adds Authorization header to all requests
- [ ] API client handles errors and shows user-friendly messages
- [ ] All task methods defined in API client
- [ ] TypeScript types defined for Task and User
- [ ] Forms have client-side validation
- [ ] Loading states shown during API calls
- [ ] Error messages displayed clearly

**Output:**
- `frontend/src/lib/auth.ts`
- `frontend/src/app/login/page.tsx`
- `frontend/src/app/register/page.tsx`
- `frontend/src/lib/api.ts`
- `frontend/src/types/task.ts`
- PHR in `history/prompts/phase-2/`

**Notes:**
- Store token in localStorage (per CONSTITUTION.md authentication strategy)
- Handle 401 errors by redirecting to login
- Show loading spinners during auth operations

---

### Task II-3.3: Build Task Management UI Components

**ID:** II-3.3
**Duration:** 180 minutes
**Depends on:** Task II-3.2
**Priority:** High
**Spec Reference:** `SPECIFICATION.md` Phase II - UI Components

**Description:**
Create all UI components for task management with responsive design and Tailwind CSS styling.

**What to do:**
1. Create `specs/ui/components.md`:
   - TaskList component spec
   - AddTaskForm component spec
   - TaskItem component spec
   - DeleteConfirmModal component spec
2. Build TaskList component (`src/components/TaskList.tsx`):
   - Accepts tasks array prop
   - Maps over tasks to render TaskItem components
   - Shows "No tasks yet" when empty
   - Loading state (skeleton or spinner)
3. Build AddTaskForm component (`src/components/AddTaskForm.tsx`):
   - Title input (required, max 200 chars)
   - Description textarea (optional, max 1000 chars)
   - Submit button
   - Form validation
   - Calls onAdd callback with task data
   - Clears form on success
   - Shows character count
4. Build TaskItem component (`src/components/TaskItem.tsx`):
   - Displays task title, description, completion status
   - Checkbox for toggle completion (calls onToggle)
   - Edit button (inline edit or modal)
   - Delete button (calls onDelete after confirmation)
   - Completed tasks have strikethrough styling
   - Timestamps displayed (created, updated)
5. Build DeleteConfirmModal component (`src/components/DeleteConfirmModal.tsx`):
   - Modal overlay
   - Confirmation message "Delete this task?"
   - Cancel and Confirm buttons
   - Calls onConfirm or onCancel callbacks
6. Style all components with Tailwind CSS:
   - Consistent spacing and colors
   - Hover states
   - Focus states (accessibility)
7. Make responsive:
   - Test on mobile (320px+)
   - Adjust layout for small screens
8. Add loading states and error messages

**Acceptance Criteria:**
- [ ] TaskList displays all user tasks with completion status
- [ ] AddTaskForm validates input (title 1-200 chars, description max 1000)
- [ ] AddTaskForm shows character count (e.g., "42/200")
- [ ] TaskItem shows checkbox for toggle, edit button, delete button
- [ ] TaskItem displays timestamps in user-friendly format
- [ ] Completed tasks have visual distinction (strikethrough, different color)
- [ ] Delete confirmation modal appears before deletion
- [ ] All components mobile responsive (320px+)
- [ ] Loading spinner shows during API calls
- [ ] Error messages display clearly (toast or inline)
- [ ] All components use Tailwind CSS (no inline styles)

**Output:**
- `specs/ui/components.md`
- `frontend/src/components/TaskList.tsx`
- `frontend/src/components/AddTaskForm.tsx`
- `frontend/src/components/TaskItem.tsx`
- `frontend/src/components/DeleteConfirmModal.tsx`
- PHR in `history/prompts/phase-2/`

**Notes:**
- Use Server Components by default, Client Components only when needed (forms, interactive)
- Format timestamps with date-fns library
- Consider accessibility (keyboard navigation, ARIA labels)

---

### Task II-3.4: Build Dashboard Page

**ID:** II-3.4
**Duration:** 90 minutes
**Depends on:** Task II-3.3
**Priority:** High
**Spec Reference:** `SPECIFICATION.md` Phase II - UI

**Description:**
Create main dashboard page that composes all components and handles authentication.

**What to do:**
1. Create `src/app/dashboard/page.tsx`:
   - Check for JWT token (redirect to /login if missing)
   - Fetch tasks on page load
   - Pass tasks to TaskList component
   - Handle AddTaskForm submission (call API, update UI)
   - Handle task toggle (call API, update UI)
   - Handle task delete (show modal, call API, update UI)
   - Handle task edit (inline or modal, call API, update UI)
2. Implement optimistic UI updates:
   - Update UI immediately on action
   - Revert if API call fails
3. Add loading state (show during initial fetch)
4. Add error state (show if API fails)
5. Extract user_id from JWT token
6. Update `src/app/page.tsx`:
   - Redirect to /dashboard if authenticated
   - Redirect to /login if not authenticated
7. Test complete flow:
   - Login → Dashboard
   - Create task → appears in list
   - Toggle task → status updates
   - Edit task → changes saved
   - Delete task → removed from list

**Acceptance Criteria:**
- [ ] Dashboard only accessible with valid token
- [ ] Redirects to /login if not authenticated
- [ ] Tasks load on mount
- [ ] Can create new task and see it immediately (optimistic update)
- [ ] Can toggle task completion and see update
- [ ] Can edit task (title, description) inline or in modal
- [ ] Can delete task with confirmation modal
- [ ] Loading state shows while fetching
- [ ] Error state shows if API fails (with retry option)
- [ ] Optimistic updates revert on API failure
- [ ] Page refreshes maintain authentication state

**Output:**
- `frontend/src/app/dashboard/page.tsx`
- Updated `frontend/src/app/page.tsx`
- PHR in `history/prompts/phase-2/`

**Notes:**
- Decode JWT token to get user_id (use jose library)
- Handle token expiration (redirect to login on 401)
- Consider using React state management (useState, useReducer)

---

### Task II-4.1: Integration, Testing and Environment Setup

**ID:** II-4.1
**Duration:** 120 minutes
**Depends on:** Task II-3.4
**Priority:** High
**Spec Reference:** `TECHNICAL-PLAN.md` Testing Strategy Phase II

**Description:**
Configure CORS, environment variables, and perform comprehensive integration testing.

**What to do:**
1. Configure CORS in backend (`src/main.py`):
   - Allow frontend origin (from environment variable)
   - Allow credentials
   - Allow Authorization header
   - Test OPTIONS requests work
2. Setup environment variables:
   - Create `frontend/.env.local` with backend URL
   - Create `backend/.env` with database URL and secrets
   - Verify both .env files in .gitignore
   - Update .env.example files
3. Test complete user flow:
   - Register new account
   - Verify user created in database
   - Login with credentials
   - Verify token received and stored
   - Create 5 tasks
   - Verify tasks in database
   - Update tasks (title, description)
   - Verify updates in database
   - Toggle completion
   - Verify status changes
   - Delete tasks
   - Verify deleted from database
4. Test on mobile viewport:
   - Resize browser to 375px width
   - Test all features work
   - Verify responsive layout
5. Test error scenarios:
   - Invalid token → redirects to login
   - Expired token → redirects to login
   - Network error → shows error message
   - Validation error → shows field-specific error
6. Fix any bugs discovered
7. Document test results:
   - Create test report with pass/fail for each scenario
   - Screenshot critical flows
8. Measure performance:
   - Page load time (<2s target)
   - API response times (<500ms target)

**Acceptance Criteria:**
- [ ] No CORS errors in browser console
- [ ] Complete registration → login → CRUD flow works
- [ ] Mobile responsive (tested on 375px viewport)
- [ ] All features work on mobile
- [ ] Error messages user-friendly (not technical)
- [ ] No console errors during normal operation
- [ ] Performance acceptable (page load <2s, API <500ms)
- [ ] Test results documented with pass/fail
- [ ] Screenshots of critical flows captured
- [ ] All bugs fixed

**Output:**
- Updated `backend/src/main.py` (CORS config)
- `frontend/.env.local`
- `backend/.env`
- Updated `frontend/.env.example`
- Updated `backend/.env.example`
- `tests/phase2-integration-test-results.md`
- Screenshots in `tests/screenshots/phase2/`

**Notes:**
- Use browser DevTools Network tab to measure API response times
- Use Lighthouse to measure page load performance
- Test both Chrome and Firefox for compatibility

---

### Task II-4.2: Deploy Backend and Frontend

**ID:** II-4.2
**Duration:** 120 minutes
**Depends on:** Task II-4.1
**Priority:** High
**Spec Reference:** Submission Requirements, `CONSTITUTION.md` Section V

**Description:**
Deploy backend and frontend to production environments.

**What to do:**
1. Deploy backend:
   - Choose platform (Render, Railway, Fly.io, or DigitalOcean App Platform)
   - Create account and new project
   - Connect GitHub repository
   - Configure build command: `cd backend && uv sync && uv run alembic upgrade head`
   - Configure start command: `cd backend && uv run uvicorn src.main:app --host 0.0.0.0 --port $PORT`
   - Set environment variables:
     - DATABASE_URL (Neon connection string)
     - BETTER_AUTH_SECRET (generate with openssl rand -hex 32)
     - BETTER_AUTH_URL (frontend production URL)
     - ENVIRONMENT=production
     - LOG_LEVEL=WARNING
   - Deploy
   - Test health endpoint: GET https://your-backend.com/health
2. Deploy frontend to Vercel:
   - Create Vercel account
   - Push code to GitHub
   - Import repository to Vercel
   - Configure build settings:
     - Framework: Next.js
     - Root directory: frontend
   - Set environment variables:
     - NEXT_PUBLIC_API_URL (backend production URL)
     - NEXT_PUBLIC_BETTER_AUTH_URL (frontend production URL)
   - Deploy
   - Test in production
3. Update backend CORS to allow production frontend origin
4. Test complete flow in production:
   - Register account
   - Login
   - Create, update, delete tasks
   - Logout
5. Update README with deployment URLs

**Acceptance Criteria:**
- [ ] Backend accessible at public URL
- [ ] Backend health endpoint returns 200 OK
- [ ] Database migrations applied in production
- [ ] All environment variables configured correctly
- [ ] Frontend deployed on Vercel
- [ ] Frontend can communicate with backend (CORS working)
- [ ] Complete auth + CRUD flow works in production
- [ ] HTTPS enabled on both frontend and backend
- [ ] README updated with both production URLs
- [ ] No secrets committed to repository

**Output:**
- Backend deployment config (e.g., `render.yaml` or `Dockerfile`)
- Frontend deployment config (if needed)
- Updated `README.md` with production URLs
- PHR in `history/prompts/phase-2/`

**Notes:**
- Use different DATABASE_URL for production (separate from development)
- Generate new BETTER_AUTH_SECRET for production (never reuse development secret)
- Monitor deployment logs for errors

---

### Task II-4.3: Complete Documentation and Demo

**ID:** II-4.3
**Duration:** 90 minutes
**Depends on:** Task II-4.2
**Priority:** High
**Spec Reference:** Submission Requirements, `CONSTITUTION.md` Section VI

**Description:**
Create comprehensive documentation and demo video for Phase II submission.

**What to do:**
1. Update `README.md`:
   - Add Phase II features section
   - Update technology stack (Next.js, FastAPI, PostgreSQL, Better Auth)
   - Add local setup instructions:
     - Backend setup (UV, database, migrations, run)
     - Frontend setup (npm install, env vars, run)
   - Add deployment instructions (or link to deployment guide)
   - Document environment variables (reference .env.example)
   - Add API documentation link (specs/api/rest-endpoints.md)
   - Add production URLs
2. Verify all specs reflect implementation:
   - Review specs/api/rest-endpoints.md
   - Review specs/database/schema.md
   - Review specs/ui/components.md
   - Update if implementation differs
3. Record demo video (max 90 seconds):
   - Show production deployment
   - Register new account
   - Create multiple tasks
   - Update task
   - Toggle task completion
   - Delete task
   - Show mobile responsive design (resize browser)
   - Mention spec-driven development workflow
   - Add narration or text overlays
   - Record in HD (1080p)
4. Verify all files committed:
   - Check git status
   - Verify .env files NOT committed (only .env.example)
   - Commit any uncommitted files
5. Create git tag `phase-2-complete`
6. Push to GitHub with tags

**Acceptance Criteria:**
- [ ] README complete with Phase II information
- [ ] Setup instructions tested and accurate (follow your own instructions)
- [ ] All specs reflect actual implementation
- [ ] Demo video under 90 seconds
- [ ] Demo shows all Phase II features (auth, CRUD, responsive)
- [ ] Demo shows responsive design (mobile viewport)
- [ ] Demo mentions spec-driven development
- [ ] Video quality HD (1080p)
- [ ] All specs and code committed
- [ ] .env files NOT committed (verified)
- [ ] Git tag `phase-2-complete` created and pushed

**Output:**
- Updated `README.md`
- Updated specs (if needed)
- `demo-phase2.mp4` (under 90 seconds)
- Git commit with tag `phase-2-complete`

**Notes:**
- Demo video critical for submission - make it professional
- Show production deployment, not localhost
- Use OBS, QuickTime, or similar screen recording software

---

## PHASE III: AI CHATBOT (Detailed)

### Task III-1.1: MCP Tools and Conversation Schema Specification

**ID:** III-1.1
**Duration:** 90 minutes
**Depends on:** Phase II Complete
**Priority:** High
**Spec Reference:** `SPECIFICATION.md` Phase III - MCP Tools

**Description:**
Create comprehensive specification for MCP tools and conversation persistence schema.

**What to do:**
1. Create `specs/api/mcp-tools.md`:
   - Document tool structure and naming conventions
   - Specify standardized response format:
     ```json
     {
       "success": true/false,
       "data": {...} OR "error": {...},
       "metadata": {"timestamp": "...", "tool": "..."}
     }
     ```
   - Document all 5 MCP tools in detail:

     **add_task:**
     - Parameters: user_id (str), title (str), description (str, optional)
     - Returns: {task_id, title, description, completed, created_at}
     - Errors: TASK_TITLE_INVALID, TASK_DESCRIPTION_TOO_LONG

     **list_tasks:**
     - Parameters: user_id (str), status (str, optional: "all"/"pending"/"completed")
     - Returns: Array of tasks
     - Errors: INVALID_STATUS_FILTER

     **complete_task:**
     - Parameters: user_id (str), task_id (int)
     - Returns: {task_id, completed, updated_at}
     - Errors: TASK_NOT_FOUND, TASK_UNAUTHORIZED

     **delete_task:**
     - Parameters: user_id (str), task_id (int)
     - Returns: {task_id, deleted: true}
     - Errors: TASK_NOT_FOUND, TASK_UNAUTHORIZED

     **update_task:**
     - Parameters: user_id (str), task_id (int), title (str, optional), description (str, optional)
     - Returns: {task_id, title, description, updated_at}
     - Errors: TASK_NOT_FOUND, TASK_UNAUTHORIZED, TASK_TITLE_INVALID

   - Provide examples for success and error cases
   - Document user_id validation (always first parameter)

2. Update `specs/database/schema.md`:
   - Add conversations table:
     ```sql
     CREATE TABLE conversations (
       id SERIAL PRIMARY KEY,
       user_id VARCHAR(255) REFERENCES users(id),
       title VARCHAR(255),
       created_at TIMESTAMP DEFAULT (NOW() AT TIME ZONE 'UTC'),
       updated_at TIMESTAMP DEFAULT (NOW() AT TIME ZONE 'UTC')
     );
     ```
   - Add messages table:
     ```sql
     CREATE TABLE messages (
       id SERIAL PRIMARY KEY,
       conversation_id INTEGER REFERENCES conversations(id) ON DELETE CASCADE,
       role VARCHAR(20) NOT NULL CHECK (role IN ('user', 'assistant')),
       content TEXT NOT NULL,
       tool_calls JSONB,
       created_at TIMESTAMP DEFAULT (NOW() AT TIME ZONE 'UTC')
     );
     ```
   - Document indexes (conversation_id, user_id, created_at)
   - Document foreign keys and cascading deletes

**Acceptance Criteria:**
- [ ] All 5 MCP tools documented with complete specifications
- [ ] Parameters defined for each tool (user_id always first)
- [ ] Response format standardized (success, data/error, metadata)
- [ ] Examples provided for each tool (success and error cases)
- [ ] Conversation schema added to database spec
- [ ] Messages table includes role field (user/assistant)
- [ ] tool_calls field defined for storing MCP tool invocations
- [ ] Foreign keys and indexes documented

**Output:**
- `specs/api/mcp-tools.md` (complete specification)
- Updated `specs/database/schema.md`

---

*[Continue with remaining Phase III, IV, and V tasks following same detailed structure...]*

---

## PHASE IV: LOCAL KUBERNETES (Outline)

**Total Duration:** 10-14 hours
**Tasks:** ~12 tasks

### Task Outline:
1. IV-1.1: Containerization Specification (Docker strategy, multi-stage builds)
2. IV-1.2: Create Backend Dockerfile
3. IV-1.3: Create Frontend Dockerfile
4. IV-2.1: Helm Chart Specification
5. IV-2.2: Create Backend Helm Chart
6. IV-2.3: Create Frontend Helm Chart
7. IV-2.4: Create Database Configuration (connection to Neon from K8s)
8. IV-3.1: Minikube Setup and Testing
9. IV-3.2: Deploy to Minikube
10. IV-3.3: Configure Ingress
11. IV-4.1: Integration Testing on Kubernetes
12. IV-4.2: Documentation and Demo

---

## PHASE V: CLOUD DEPLOYMENT (Outline)

**Total Duration:** 18-24 hours
**Tasks:** ~18 tasks

### Task Outline:
1. V-1.1: Advanced Features Specification (priorities, tags, due dates, reminders)
2. V-1.2: Database Migration for Advanced Features
3. V-1.3: Implement Priority System
4. V-1.4: Implement Tags System
5. V-1.5: Implement Due Dates and Reminders
6. V-2.1: Event-Driven Architecture Specification
7. V-2.2: Setup Kafka/Redpanda
8. V-2.3: Implement Event Producers
9. V-2.4: Implement Event Consumers
10. V-3.1: Dapr Integration Specification
11. V-3.2: Configure Dapr Pub/Sub
12. V-3.3: Configure Dapr State API
13. V-3.4: Configure Dapr Jobs API (reminders)
14. V-4.1: Cloud Platform Setup (DigitalOcean DOKS or GKE)
15. V-4.2: Deploy to Cloud Kubernetes
16. V-4.3: Configure Monitoring (Prometheus/Grafana)
17. V-5.1: CI/CD Pipeline Setup (GitHub Actions)
18. V-5.2: Final Testing, Documentation, and Demo

---

**Version:** 1.0.0
**Last Updated:** 2025-12-25
**Total Tasks (Phase II-V):** ~50 tasks
**Estimated Time (Phase II-V):** 52-72 hours
