# SPECIFICATION.md
# Todo Application - Complete Feature Specification

## Project Overview
**Application Name:** Evolution of Todo
**Type:** AI-Native Task Management System
**Development Method:** Spec-Driven Development with Claude Code
**Target Users:** Individual users seeking intelligent task management with natural language interaction

---

## Phase I: Console Application Specification

### Target Audience
Individual developers and power users comfortable with command-line interfaces who need basic task management without GUI overhead.

### Focus
In-memory task management with CRUD operations via Python console interface, serving as the foundational data model for all future phases.

### Success Criteria
- User can add tasks with title and optional description
- User can view all tasks with completion status
- User can update task details (title/description)
- User can delete tasks by ID
- User can mark tasks as complete/incomplete
- All operations work without external dependencies
- Data persists only during program runtime

### Constraints
- **Language:** Python 3.13+ only
- **Storage:** In-memory only (lists/dictionaries)
- **Package Manager:** UV for dependency management
- **Development:** All code generated via Claude Code + Spec-Kit Plus
- **No manual coding:** Specifications refined until correct output
- **Input method:** Command-line menu system
- **Output format:** Formatted console text

### Not Building (Phase I)
- Persistent storage (database or files)
- User authentication
- Web interface
- Priority levels or tags
- Due dates or reminders
- Search or filter functionality
- Multi-user support

### Required Features

#### Feature 1: Add Task
**User Story:** As a user, I can create a new task with a title and optional description.

**Acceptance Criteria:**
- Title is required (1-200 characters)
- Description is optional (max 1000 characters)
- System generates unique task ID automatically
- Task defaults to incomplete status
- User receives confirmation with task ID

**Example Interaction:**
```
> Add Task
Enter title: Buy groceries
Enter description (optional): Milk, eggs, bread
✓ Task #1 created: "Buy groceries"
```

#### Feature 2: View Task List
**User Story:** As a user, I can view all my tasks with their status.

**Acceptance Criteria:**
- Display all tasks with ID, title, and status
- Show completion status clearly (✓ or ☐)
- Empty list shows "No tasks yet"
- Tasks displayed in order of creation

**Example Output:**
```
Your Tasks:
[1] ☐ Buy groceries
[2] ✓ Call mom
[3] ☐ Finish report
```

#### Feature 3: Update Task
**User Story:** As a user, I can modify existing task details.

**Acceptance Criteria:**
- User selects task by ID
- Can update title and/or description
- Leaving field blank keeps existing value
- Invalid ID shows error message
- User receives confirmation of update

**Example Interaction:**
```
> Update Task
Enter task ID: 1
New title (press Enter to keep current): Buy groceries and fruits
New description: Milk, eggs, bread, apples, oranges
✓ Task #1 updated
```

#### Feature 4: Delete Task
**User Story:** As a user, I can remove tasks I no longer need.

**Acceptance Criteria:**
- User selects task by ID
- Confirmation prompt before deletion
- Task removed from list permanently
- Invalid ID shows error message

**Example Interaction:**
```
> Delete Task
Enter task ID: 2
Confirm delete "Call mom"? (y/n): y
✓ Task #2 deleted
```

#### Feature 5: Mark as Complete
**User Story:** As a user, I can toggle task completion status.

**Acceptance Criteria:**
- User selects task by ID
- Status toggles between complete/incomplete
- Visual indicator updates immediately
- Invalid ID shows error message

**Example Interaction:**
```
> Toggle Complete
Enter task ID: 1
✓ Task #1 marked as complete
```

---

## Phase II: Full-Stack Web Application Specification

### Target Audience
Multi-user environment where individuals need persistent task management accessible from any browser, with secure personal task lists.

### Focus
Transform console app into responsive web application with RESTful API, persistent database storage, and user authentication.

### Success Criteria
- Multiple users can register and maintain separate task lists
- Tasks persist across sessions and browser restarts
- Frontend provides modern, responsive UI
- API secured with JWT authentication
- All Phase I features available via web interface
- User can access from any device with browser

### Constraints
- **Frontend:** Next.js 16+ with App Router only
- **Backend:** Python FastAPI with async/await
- **Database:** Neon Serverless PostgreSQL
- **ORM:** SQLModel for type-safe queries
- **Authentication:** Better Auth with JWT tokens
- **Deployment:** Frontend on Vercel, backend on cloud platform
- **API Design:** RESTful with user_id in URL path
- **No sessions:** Stateless authentication only

### Not Building (Phase II)
- Real-time collaboration features
- Task sharing between users
- Recurring tasks
- Due dates or reminders
- Priorities or tags
- AI chatbot interface
- Mobile native apps

### Required Features

#### Feature 1: User Authentication
**User Story:** As a user, I can sign up and sign in to access my personal task list.

**Password Requirements:**
- Minimum length: 8 characters
- Maximum length: 128 characters
- Must contain: at least one lowercase, one uppercase, one number
- Special characters: Optional but recommended
- Common passwords: Blocked (using top 10,000 common passwords list)
- Password strength indicator: Displayed on registration form

**Acceptance Criteria:**
- User can register with email and password
- Password hashed before storage (Better Auth handles this automatically)
- User receives JWT token on successful login
- Token expires after 7 days
- Invalid credentials show clear error message
- All API requests require valid token

**JWT Token:**
- Expiration: 7 days (604800 seconds)
- Storage: localStorage on frontend
- Transmission: `Authorization: Bearer <token>` header
- Refresh: NOT SUPPORTED - user must re-login after expiration
- Format: Standard JWT with HS256 algorithm

**Multiple Devices:**
- User can be logged in on multiple devices simultaneously
- Each device has its own JWT token
- Logout only clears local token (server doesn't track sessions)

**Password Reset:**
- NOT IMPLEMENTED in Phase II-IV (optional Phase V bonus feature)
- Users must remember password or create new account

**Email Verification:**
- NOT REQUIRED - users can use app immediately after registration

**Social Login:**
- NOT SUPPORTED - email/password only

**API Endpoints:**
- `POST /api/v1/auth/register` - Create new user account
- `POST /api/v1/auth/login` - Authenticate and receive JWT
- `POST /api/v1/auth/logout` - Client-side token deletion (no server call needed)

#### Feature 2: Task CRUD via REST API
**User Story:** As a user, I can manage my tasks through API calls secured by my authentication token.

**Acceptance Criteria:**
- All endpoints require `Authorization: Bearer <token>` header
- User can only access their own tasks
- Invalid/expired token returns 401 Unauthorized
- Mismatched user_id returns 403 Forbidden

**API Endpoints:**
```
GET    /api/v1/{user_id}/tasks                 - List all user's tasks
POST   /api/v1/{user_id}/tasks                 - Create new task
GET    /api/v1/{user_id}/tasks/{id}            - Get specific task
PUT    /api/v1/{user_id}/tasks/{id}            - Update task
DELETE /api/v1/{user_id}/tasks/{id}            - Delete task
PATCH  /api/v1/{user_id}/tasks/{id}/complete   - Toggle completion
```

**Request/Response Examples:**

Create Task:
```json
POST /api/user123/tasks
{
  "title": "Buy groceries",
  "description": "Milk, eggs, bread"
}

Response 201:
{
  "id": 1,
  "user_id": "user123",
  "title": "Buy groceries",
  "description": "Milk, eggs, bread",
  "completed": false,
  "created_at": "2024-12-25T10:00:00Z",
  "updated_at": "2024-12-25T10:00:00Z"
}
```

#### Feature 3: Responsive Web Interface
**User Story:** As a user, I can manage tasks through an intuitive web UI that works on desktop and mobile.

**Acceptance Criteria:**
- Clean, modern design using Tailwind CSS
- Mobile-responsive (works on 320px+ screens)
- Task list updates without full page reload
- Add task form with inline validation
- Click task to edit inline
- Delete button with confirmation modal
- Checkbox to toggle completion
- Loading states during API calls
- Error messages displayed clearly

**UI Components Required:**
- Login/Register forms
- Task list view
- Add task form
- Edit task inline form
- Delete confirmation modal
- Loading spinner
- Error toast notifications

#### Feature 4: Database Persistence
**User Story:** As a user, my tasks are saved permanently and survive server restarts.

**Acceptance Criteria:**
- All tasks stored in PostgreSQL via Neon
- User data isolated (queries filtered by user_id)
- Created/updated timestamps automatic
- Database indexes on user_id and completed fields
- Graceful handling of database connection errors

**Database Schema:**
```sql
CREATE TABLE users (
  id VARCHAR(255) PRIMARY KEY,
  email VARCHAR(255) UNIQUE NOT NULL,
  name VARCHAR(255),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE tasks (
  id SERIAL PRIMARY KEY,
  user_id VARCHAR(255) REFERENCES users(id),
  title VARCHAR(200) NOT NULL,
  description TEXT,
  completed BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_tasks_user_id ON tasks(user_id);
CREATE INDEX idx_tasks_completed ON tasks(completed);
```

**Migration Strategy:**
- Tool: Alembic (Python)
- Location: `/backend/alembic/versions/`
- Command: `alembic upgrade head` to apply all migrations
- Rollback: `alembic downgrade -1` to undo last migration
- All migrations must include both `upgrade()` and `downgrade()` functions
- Test migrations on development database before production

**Deletion Policy:**
- Hard delete only (no soft delete for simplicity)
- Tasks deleted permanently when user deletes them
- Cascade deletes for related records
- No automatic data retention or archival

---

## Phase III: AI Chatbot Specification

### Target Audience
Users who prefer natural language interaction over traditional UI, seeking conversational task management with AI assistance.

### Focus
Conversational interface using OpenAI Agents SDK with MCP server architecture, enabling task management through chat while maintaining stateless backend architecture.

### Success Criteria
- User can manage tasks via natural language commands
- AI agent correctly interprets intent and calls appropriate MCP tools
- Conversation context persists across sessions via database
- Server remains stateless (restarts don't lose context)
- Chat history retrievable for each conversation
- AI provides helpful confirmations and error handling

### Constraints
- **Frontend:** OpenAI ChatKit (hosted version with domain allowlist)
- **AI Framework:** OpenAI Agents SDK
- **MCP Server:** Official MCP SDK (Python)
- **Architecture:** Stateless - all state in Neon database
- **Chat Endpoint:** Single POST endpoint handling all interactions
- **MCP Tools:** Must accept user_id as first parameter
- **No custom UI:** Use ChatKit as-is unless explicitly needed

### Not Building (Phase III)
- Voice input (bonus feature only)
- Multi-turn planning (complex task breakdowns)
- Proactive reminders (Phase V feature)
- Task sharing or collaboration
- Custom chat UI components
- Streaming responses (use default ChatKit behavior)

### Required Features

#### Feature 1: Conversational Task Management
**User Story:** As a user, I can create, view, update, and delete tasks by chatting with an AI assistant.

**Acceptance Criteria:**
- User types natural language commands
- AI correctly identifies intent (add/list/complete/delete/update)
- AI calls appropriate MCP tool(s)
- AI confirms action in friendly language
- AI handles ambiguous requests by asking clarification
- AI gracefully handles errors

**Example Conversations:**

Create Task:
```
User: Add a task to buy groceries
AI: ✓ I've added "Buy groceries" to your task list (Task #1)

User: I need to remember to call mom
AI: ✓ Created task "Call mom" (Task #2)
```

List Tasks:
```
User: What's on my list?
AI: You have 2 tasks:
1. ☐ Buy groceries
2. ☐ Call mom

User: Show me completed tasks
AI: You have 1 completed task:
✓ Finish report
```

Complete Task:
```
User: Mark task 1 as done
AI: ✓ Marked "Buy groceries" as complete

User: I finished calling mom
AI: ✓ Marked "Call mom" as complete (Task #2)
```

Delete Task:
```
User: Delete the groceries task
AI: ✓ Deleted task "Buy groceries"

User: Remove task 2
AI: ✓ Deleted "Call mom" (Task #2)
```

Update Task:
```
User: Change task 1 to "Buy groceries and fruits"
AI: ✓ Updated task #1 to "Buy groceries and fruits"
```

#### Feature 2: MCP Tools for Task Operations
**User Story:** As a developer, I have MCP tools that expose task operations to the AI agent in a standardized way.

**Acceptance Criteria:**
- Each tool accepts user_id as first parameter
- Tools return structured JSON responses
- Tools handle errors gracefully
- Tools are stateless (no in-memory caching)
- Tool schemas documented in specs

**Required MCP Tools:**

1. **add_task**
```python
Parameters:
- user_id: string (required)
- title: string (required, 1-200 chars)
- description: string (optional, max 1000 chars)

Returns:
{
  "task_id": 1,
  "status": "created",
  "title": "Buy groceries"
}
```

2. **list_tasks**
```python
Parameters:
- user_id: string (required)
- status: string (optional: "all"|"pending"|"completed")

Returns:
[
  {"id": 1, "title": "Buy groceries", "completed": false},
  {"id": 2, "title": "Call mom", "completed": true}
]
```

3. **complete_task**
```python
Parameters:
- user_id: string (required)
- task_id: integer (required)

Returns:
{
  "task_id": 1,
  "status": "completed",
  "title": "Buy groceries"
}
```

4. **delete_task**
```python
Parameters:
- user_id: string (required)
- task_id: integer (required)

Returns:
{
  "task_id": 1,
  "status": "deleted",
  "title": "Buy groceries"
}
```

5. **update_task**
```python
Parameters:
- user_id: string (required)
- task_id: integer (required)
- title: string (optional)
- description: string (optional)

Returns:
{
  "task_id": 1,
  "status": "updated",
  "title": "Buy groceries and fruits"
}
```

**Standardized MCP Tool Response Format:**

All MCP tools must return responses in this standardized format:

Success Response:
```json
{
  "success": true,
  "data": {
    "task_id": 123,
    "title": "Buy groceries",
    "completed": false,
    "created_at": "2024-12-25T10:00:00Z"
  },
  "metadata": {
    "timestamp": "2024-12-25T10:00:00Z",
    "tool": "add_task",
    "user_id": "user_abc"
  }
}
```

Error Response:
```json
{
  "success": false,
  "error": {
    "code": "TASK_NOT_FOUND",
    "message": "Task with ID 123 does not exist",
    "details": {
      "task_id": 123,
      "user_id": "user_abc"
    }
  },
  "metadata": {
    "timestamp": "2024-12-25T10:00:00Z",
    "tool": "complete_task"
  }
}
```

**Error Codes for MCP Tools:**
- `TASK_NOT_FOUND` - Task ID doesn't exist
- `TASK_UNAUTHORIZED` - Task belongs to different user
- `VALIDATION_ERROR` - Input validation failed
- `MCP_TOOL_ERROR` - Unexpected error during tool execution

#### Feature 3: Persistent Conversation History
**User Story:** As a user, my chat history is saved and I can resume conversations after closing the browser.

**Acceptance Criteria:**
- All messages stored in database
- User can start new conversation or continue existing
- Conversation history loaded on each request
- No in-memory conversation state on server
- Conversation list retrievable by user

**Database Schema Addition:**
```sql
CREATE TABLE conversations (
  id SERIAL PRIMARY KEY,
  user_id VARCHAR(255) REFERENCES users(id),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE messages (
  id SERIAL PRIMARY KEY,
  conversation_id INTEGER REFERENCES conversations(id),
  user_id VARCHAR(255) REFERENCES users(id),
  role VARCHAR(20) NOT NULL, -- 'user' or 'assistant'
  content TEXT NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_messages_conversation ON messages(conversation_id);
```

#### Feature 4: Stateless Chat Endpoint
**User Story:** As a system, the chat server can restart without losing conversation context.

**Acceptance Criteria:**
- Single endpoint: `POST /api/{user_id}/chat`
- Endpoint loads history from database
- Endpoint runs agent with MCP tools
- Endpoint saves new messages to database
- Endpoint returns immediately after saving
- No session state maintained in memory

**API Flow:**
```
1. Receive: POST /api/user123/chat
   Body: {
     "conversation_id": 5,  // or null for new
     "message": "Add task to buy groceries"
   }

2. Load conversation history from database
3. Build message array: [...history, new_user_message]
4. Save user message to database
5. Run OpenAI Agent with MCP tools
6. Agent calls add_task MCP tool
7. Save assistant response to database
8. Return: {
     "conversation_id": 5,
     "response": "✓ I've added 'Buy groceries' to your task list",
     "tool_calls": ["add_task"]
   }
```

---

## Phase IV: Local Kubernetes Deployment Specification

### Target Audience
DevOps engineers and developers learning cloud-native deployment, needing local Kubernetes environment for testing before cloud deployment.

### Focus
Containerize all services and deploy to local Minikube cluster using Helm charts, with AI-assisted operations via kubectl-ai and kagent.

### Success Criteria
- All services containerized with health checks
- Helm charts deploy entire stack with single command
- Services communicate within cluster
- Database accessible from backend pods
- Frontend accessible via ingress or NodePort
- kubectl-ai can diagnose and fix common issues
- Documentation allows fresh Minikube deployment in <30 minutes

### Constraints
- **Orchestration:** Minikube only (no Docker Compose)
- **Package Manager:** Helm 3+ for all deployments
- **Container Tool:** Docker Desktop with Gordon AI if available
- **AIOps:** kubectl-ai and/or kagent for operations
- **No external dependencies:** All services self-contained in cluster
- **WSL2 required:** Windows users must use WSL2 Ubuntu

### Not Building (Phase IV)
- Production-grade monitoring (Prometheus/Grafana)
- Auto-scaling policies (Phase V)
- Multiple environments (dev/staging/prod)
- CI/CD pipelines (Phase V)
- Service mesh (Istio/Linkerd)
- External load balancers

### Required Features

#### Feature 1: Containerized Services
**User Story:** As a deployer, all application components are available as Docker images.

**Acceptance Criteria:**
- Frontend image builds successfully
- Backend image builds successfully
- Images use multi-stage builds (optimized size)
- Images run as non-root user
- Health check endpoints implemented
- Environment variables externalized
- No secrets in images

**Dockerfile Requirements:**

Frontend:
```dockerfile
# Multi-stage build
# Stage 1: Build
# Stage 2: Production with nginx or Node.js
# Non-root user (UID 1000+)
# Health check on /health endpoint
# Size < 200MB
```

Backend:
```dockerfile
# Multi-stage build
# Stage 1: Install dependencies
# Stage 2: Production with minimal base
# Non-root user (UID 1000+)
# Health check on /health endpoint
# Size < 150MB
```

#### Feature 2: Helm Chart Deployment
**User Story:** As a deployer, I can install the entire application with a single Helm command.

**Acceptance Criteria:**
- Chart includes frontend, backend, and database
- ConfigMaps for non-sensitive configuration
- Secrets for API keys and credentials
- Services for internal communication
- Ingress or NodePort for external access
- Resource requests/limits defined
- Chart customizable via values.yaml

**Helm Chart Structure:**
```
todo-chart/
├── Chart.yaml
├── values.yaml
├── templates/
│   ├── frontend-deployment.yaml
│   ├── frontend-service.yaml
│   ├── backend-deployment.yaml
│   ├── backend-service.yaml
│   ├── configmap.yaml
│   ├── secrets.yaml
│   └── ingress.yaml
```

**Deployment Command:**
```bash
helm install todo-app ./todo-chart \
  --set backend.image.tag=v1.0.0 \
  --set frontend.image.tag=v1.0.0 \
  --set database.url=postgresql://...
```

#### Feature 3: Health Checks and Readiness
**User Story:** As Kubernetes, I can determine when services are healthy and ready to receive traffic.

**Acceptance Criteria:**
- All pods have liveness probes
- All pods have readiness probes
- Backend `/health` returns 200 when database connected
- Frontend `/health` returns 200 when serving
- Probes configured with appropriate delays and timeouts

**Example Probe Configuration:**
```yaml
livenessProbe:
  httpGet:
    path: /health
    port: 8000
  initialDelaySeconds: 10
  periodSeconds: 30

readinessProbe:
  httpGet:
    path: /health
    port: 8000
  initialDelaySeconds: 5
  periodSeconds: 10
```

#### Feature 4: AI-Assisted Operations
**User Story:** As an operator, I can use kubectl-ai and kagent to diagnose and fix issues.

**Acceptance Criteria:**
- kubectl-ai installed and configured
- Can query cluster state in natural language
- Can diagnose pod failures
- Can suggest fixes for common problems
- Commands documented in README

**Example AI Operations:**
```bash
# Diagnose issues
kubectl-ai "why is the backend pod failing?"
kubectl-ai "check if database is reachable"

# Scale services
kubectl-ai "scale backend to 3 replicas"

# Analyze cluster
kagent "analyze cluster health"
kagent "optimize resource allocation"
```

---

## Phase V: Advanced Cloud Deployment Specification

### Target Audience
Production environment operators requiring enterprise-grade deployment with event-driven architecture, advanced features, and cloud-native best practices.

### Focus
Deploy to managed Kubernetes (AKS/GKE/DOKS) with Kafka event streaming, Dapr runtime, recurring tasks, due dates, reminders, priorities, tags, search, and filter capabilities.

### Success Criteria
- Application deployed to cloud Kubernetes cluster
- Kafka handles all event streaming
- Dapr manages pub/sub, state, jobs, and secrets
- Recurring tasks auto-generate on completion
- Reminders trigger at exact scheduled times
- Users can prioritize, tag, search, and filter tasks
- CI/CD pipeline automates deployments
- System handles 100+ concurrent users

### Constraints
- **Cloud Platform:** DigitalOcean DOKS, Google GKE, or Azure AKS
- **Event Streaming:** Kafka (Redpanda Cloud or Strimzi in-cluster)
- **Runtime:** Dapr with full capabilities (Pub/Sub, State, Jobs, Secrets, Service Invocation)
- **CI/CD:** GitHub Actions only
- **Monitoring:** Basic health checks minimum (advanced monitoring optional)
- **No vendor lock-in:** Dapr abstracts cloud-specific services

### Not Building (Phase V)
- Mobile native applications
- Real-time collaborative editing
- Video/audio attachments
- Calendar integration (bonus feature)
- Email notifications (bonus feature)
- Multi-tenancy (separate databases per organization)

### Required Features

#### Feature 1: Priorities and Tags
**User Story:** As a user, I can assign priority levels and tags to organize my tasks.

**Acceptance Criteria:**
- Tasks have optional priority (high/medium/low)
- Tasks can have multiple tags (work, home, personal, etc.)
- User can filter by priority
- User can filter by tag(s)
- Chat interface understands priority/tag commands
- API endpoints support priority/tag operations

**Database Schema Updates:**
```sql
ALTER TABLE tasks ADD COLUMN priority VARCHAR(20) DEFAULT 'medium';
-- Allowed values: 'high', 'medium', 'low'

CREATE TABLE tags (
  id SERIAL PRIMARY KEY,
  name VARCHAR(50) UNIQUE NOT NULL
);

CREATE TABLE task_tags (
  task_id INTEGER REFERENCES tasks(id) ON DELETE CASCADE,
  tag_id INTEGER REFERENCES tags(id) ON DELETE CASCADE,
  PRIMARY KEY (task_id, tag_id)
);
```

**Example Chat Commands:**
```
User: Add high priority task to prepare presentation
AI: ✓ Created high priority task "Prepare presentation"

User: Tag task 1 with work and urgent
AI: ✓ Tagged "Buy groceries" with work, urgent
```

#### Feature 2: Due Dates and Reminders
**User Story:** As a user, I can set due dates on tasks and receive reminders at specified times.

**Acceptance Criteria:**
- Tasks have optional due_date field (datetime)
- Tasks have optional remind_at field (datetime)
- User can set due date in natural language ("tomorrow at 3pm")
- Reminders scheduled via Dapr Jobs API (not polling)
- Notification service consumes reminder events from Kafka
- Browser notifications (if permission granted)

**Database Schema Updates:**
```sql
ALTER TABLE tasks ADD COLUMN due_date TIMESTAMP;
ALTER TABLE tasks ADD COLUMN remind_at TIMESTAMP;

CREATE INDEX idx_tasks_due_date ON tasks(due_date);
CREATE INDEX idx_tasks_remind_at ON tasks(remind_at);
```

**Example Chat Commands:**
```
User: Remind me tomorrow at 9am to call dentist
AI: ✓ Created task "Call dentist" with reminder for tomorrow at 9:00 AM

User: Set due date for task 1 to Friday
AI: ✓ Set due date for "Buy groceries" to Friday, Dec 27 at 5:00 PM
```

**Dapr Jobs API Integration:**
```python
# Schedule reminder
await httpx.post(
    f"http://localhost:3500/v1.0-alpha1/jobs/reminder-task-{task_id}",
    json={
        "dueTime": remind_at.isoformat(),
        "data": {
            "task_id": task_id,
            "user_id": user_id,
            "type": "reminder"
        }
    }
)

# Handle callback
@app.post("/api/jobs/trigger")
async def handle_job_trigger(request: Request):
    job_data = await request.json()
    if job_data["data"]["type"] == "reminder":
        # Publish to notification service
        await publish_event("reminders", job_data["data"])
    return {"status": "SUCCESS"}
```

#### Feature 3: Recurring Tasks
**User Story:** As a user, I can create tasks that automatically regenerate on a schedule (daily, weekly, monthly).

**Acceptance Criteria:**
- Tasks have optional recurrence pattern field
- Supported patterns: daily, weekly, monthly, custom cron
- When recurring task marked complete, new instance created
- Recurrence handled via Kafka event → consumer creates next instance
- User can modify or cancel recurrence

**Database Schema Updates:**
```sql
ALTER TABLE tasks ADD COLUMN recurrence_pattern VARCHAR(100);
-- Examples: "daily", "weekly", "monthly", "0 9 * * 1" (cron)
ALTER TABLE tasks ADD COLUMN is_recurring BOOLEAN DEFAULT FALSE;
```

**Event-Driven Architecture:**
```
User marks task complete
    ↓
FastAPI publishes "task.completed" event to Kafka
    ↓
Recurring Task Service consumes event
    ↓
If task.is_recurring == true:
    Parse recurrence_pattern
    Calculate next_due_date
    Create new task with same title/tags/priority
    Set new due_date
```

**Example Chat Commands:**
```
User: Create a weekly task to review finances every Monday
AI: ✓ Created recurring task "Review finances" (every Monday at 9:00 AM)

User: Make task 5 repeat daily
AI: ✓ Set "Exercise" to repeat daily
```

#### Feature 4: Search and Filter
**User Story:** As a user, I can search tasks by keyword and filter by status, priority, tag, or due date.

**Acceptance Criteria:**
- Search by keyword in title or description
- Filter by completion status (all/pending/completed)
- Filter by priority (high/medium/low)
- Filter by tag (single or multiple tags)
- Filter by due date range
- Combine multiple filters (AND logic)
- Results sorted by user preference

**API Endpoint:**
```
GET /api/{user_id}/tasks?search=groceries
GET /api/{user_id}/tasks?status=pending&priority=high
GET /api/{user_id}/tasks?tags=work,urgent
GET /api/{user_id}/tasks?due_after=2024-12-25&due_before=2024-12-31
GET /api/{user_id}/tasks?sort=due_date&order=asc
```

**Example Chat Commands:**
```
User: Show me all high priority work tasks
AI: Found 3 high priority work tasks:
1. ☐ Prepare presentation (due Friday)
2. ☐ Review contract (due tomorrow)
3. ☐ Submit report (overdue)

User: Search for tasks about groceries
AI: Found 1 task matching "groceries":
1. ☐ Buy groceries and fruits
```

#### Feature 5: Event-Driven Architecture with Kafka
**User Story:** As a system, all task state changes publish events that independent services can consume.

**Acceptance Criteria:**
- All CRUD operations publish events to Kafka
- Event schema versioned and documented
- Consumers are idempotent (safe to replay)
- Dead letter queue for failed events
- Event retention: 7 days minimum

**Kafka Topics:**
```yaml
task-events:
  Description: All task CRUD operations
  Schema:
    event_type: created|updated|completed|deleted
    task_id: integer
    user_id: string
    task_data: object
    timestamp: datetime

reminders:
  Description: Reminder notifications
  Schema:
    task_id: integer
    user_id: string
    title: string
    due_at: datetime
    remind_at: datetime

task-updates:
  Description: Real-time task updates for multi-client sync
  Schema:
    operation: add|update|delete|complete
    task_id: integer
    user_id: string
    task_data: object
```

**Event Flow Example:**
```
User completes task via chat
    ↓
MCP tool updates database
    ↓
FastAPI publishes "task.completed" event
    ↓
Kafka distributes to:
    - Recurring Task Service (creates next instance if recurring)
    - Audit Service (logs action)
    - WebSocket Service (notifies all connected clients)
```

#### Feature 6: Dapr Integration
**User Story:** As a system, infrastructure concerns (pub/sub, state, secrets) are abstracted by Dapr.

**Acceptance Criteria:**
- All Kafka interactions via Dapr Pub/Sub component
- Conversation state accessed via Dapr State API
- Reminders scheduled via Dapr Jobs API
- Secrets retrieved via Dapr Secrets API
- Service-to-service calls via Dapr Service Invocation
- All Dapr components configured as YAML

**Dapr Components:**

Pub/Sub:
```yaml
apiVersion: dapr.io/v1alpha1
kind: Component
metadata:
  name: kafka-pubsub
spec:
  type: pubsub.kafka
  version: v1
  metadata:
    - name: brokers
      value: "kafka:9092"
    - name: consumerGroup
      value: "todo-service"
```

State Store:
```yaml
apiVersion: dapr.io/v1alpha1
kind: Component
metadata:
  name: statestore
spec:
  type: state.postgresql
  version: v1
  metadata:
    - name: connectionString
      value: "host=neon.db user=... dbname=todo"
```

Secrets:
```yaml
apiVersion: dapr.io/v1alpha1
kind: Component
metadata:
  name: kubernetes-secrets
spec:
  type: secretstores.kubernetes
  version: v1
```

#### Feature 7: Cloud Deployment
**User Story:** As a deployer, the application runs on managed Kubernetes with auto-scaling and monitoring.

**Acceptance Criteria:**
- Deployed to DigitalOcean DOKS, GKE, or AKS
- Helm chart deploys entire stack
- Horizontal Pod Autoscaler (HPA) configured
- Resource requests/limits tuned for production
- Ingress with TLS/SSL certificates
- Database backups configured
- Health checks and monitoring endpoints

**Deployment Requirements:**
```yaml
# HPA configuration
apiVersion: autoscaling/v2
kind: HorizontalPodAutoscaler
metadata:
  name: backend-hpa
spec:
  scaleTargetRef:
    apiVersion: apps/v1
    kind: Deployment
    name: backend
  minReplicas: 2
  maxReplicas: 10
  metrics:
    - type: Resource
      resource:
        name: cpu
        target:
          type: Utilization
          averageUtilization: 70
```

#### Feature 8: CI/CD Pipeline
**User Story:** As a developer, code pushed to main branch automatically builds, tests, and deploys to production.

**Acceptance Criteria:**
- GitHub Actions workflow on push to main
- Builds Docker images with version tags
- Pushes images to container registry
- Updates Helm chart with new image tags
- Deploys to Kubernetes cluster
- Rollback capability if deployment fails
- Notifications on success/failure

**GitHub Actions Workflow:**
```yaml
name: Deploy to Production

on:
  push:
    branches: [main]

jobs:
  build-and-deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - name: Build images
      - name: Push to registry
      - name: Deploy with Helm
      - name: Verify deployment
```

---

## Performance Requirements (All Phases)

### Response Times
✅ **Task CRUD operations:** < 500ms
✅ **Chat responses (with AI):** < 3 seconds
✅ **Page load (frontend):** < 2 seconds
✅ **Search queries:** < 200ms

### Scalability
✅ **Support 1000+ tasks per user**
✅ **Handle 100+ concurrent users**
✅ **Database queries use indexes and pagination**
✅ **Frontend implements virtual scrolling for 100+ tasks**

### Reliability
✅ **99% uptime in production**
✅ **Graceful degradation if AI service unavailable**
✅ **Database connection pooling and retry logic**
✅ **Circuit breakers on external API calls**

---

## Security Requirements (All Phases)

### Authentication & Authorization
✅ **All API endpoints require valid JWT token**
✅ **Tokens expire after 7 days**
✅ **User can only access their own data**
✅ **Failed auth attempts logged**

### Data Protection
✅ **Passwords hashed with bcrypt or better**
✅ **SQL injection prevented via ORM parameterization**
✅ **XSS prevented via React auto-escaping**
✅ **CORS configured to allow only frontend domain**
✅ **No secrets in code or images**

### Infrastructure Security
✅ **Containers run as non-root users**
✅ **Secrets stored in Kubernetes Secrets or Dapr**
✅ **TLS/SSL on all external endpoints**
✅ **Network policies isolate services**

---

## Documentation Requirements (All Phases)

### Required Documentation
✅ **README.md - Setup, deployment, and usage instructions**
✅ **CONSTITUTION.md - Project principles and standards**
✅ **AGENTS.md - AI agent workflow and behavior**
✅ **CLAUDE.md - Claude Code integration instructions**
✅ **API.md - Complete API endpoint documentation**
✅ **.env.example - Environment variable templates**

### Code Documentation
✅ **Each file references spec section in header comment**
✅ **Complex functions have docstrings explaining WHY**
✅ **API endpoints documented with OpenAPI annotations**
✅ **Database migrations include rollback steps**

---

## Success Metrics

### Phase I Success
- Console app runs without errors
- All 5 basic features functional
- Spec files document all features
- Claude Code generated all code

### Phase II Success
- Multi-user web app deployed
- Authentication working securely
- Database persistence reliable
- API follows REST conventions

### Phase III Success
- Natural language commands work
- MCP tools correctly invoked
- Conversations persist across sessions
- Stateless architecture verified

### Phase IV Success
- Minikube deployment succeeds
- All services healthy in cluster
- kubectl-ai can diagnose issues
- Documentation enables fresh deployment

### Phase V Success
- Cloud deployment live and stable
- Event-driven architecture functional
- Recurring tasks auto-generate
- Reminders trigger on schedule
- Advanced features all working
- CI/CD pipeline operational

---

**This specification serves as the single source of truth for all development decisions. Code that conflicts with this spec must be regenerated.**
