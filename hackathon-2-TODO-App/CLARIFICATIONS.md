# CLARIFICATIONS.md
# Todo Application - Specification Clarifications

**Date**: 2025-12-25
**Purpose**: Resolve ambiguities and fill gaps in SPECIFICATION.md before Phase II planning
**Status**: Pending User Approval

---

## 1. AMBIGUOUS TERMS - RESOLVED

### Phase I - Console App ✅ (Already Implemented)

#### "Formatted Console Text"
**Clarification**: Simple text formatting with Unicode characters
- **Format**: `[ID] STATUS TITLE` (e.g., `[1] ☐ Buy groceries`)
- **No color coding** (keep it simple, cross-platform compatible)
- **No borders or tables** (just line-by-line output)
- **Already implemented** in Phase I as specified

#### "Command-line Menu System"
**Clarification**: Numbered menu with user input
- **Numbered options** (1-6) as implemented
- **User types number** and presses Enter
- **Not text commands** like "add task X" (that's Phase III chatbot)
- **Already implemented** correctly

#### "Unique Task ID"
**Clarification**: Sequential integers starting at 1
- **Sequential integers**: 1, 2, 3, 4...
- **Auto-incrementing**: Each new task gets next available ID
- **No reuse after deletion**: If task #3 deleted, next task is still #4 (not #3)
- **Not UUIDs**: Too verbose for console display
- **Already implemented** correctly

---

### Phase II - Full-Stack Web

#### "Modern, Responsive UI"
**Decision**: Mobile-first with standard breakpoints

```css
/* Tailwind CSS default breakpoints */
sm: 640px   /* Small tablets */
md: 768px   /* Tablets */
lg: 1024px  /* Laptops */
xl: 1280px  /* Desktops */
2xl: 1536px /* Large desktops */
```

**Mobile-first approach**:
- Base styles for 320px+ (mobile)
- Progressive enhancement for larger screens
- Touch-friendly targets (min 44px tap areas)

#### "Clean, Modern Design"
**Decision**: Tailwind CSS with shadcn/ui components

**Rationale**:
- **Tailwind CSS**: Utility-first, highly customizable, excellent DX
- **shadcn/ui**: Accessible, copy-paste components, no package bloat
- **No full design system** (Material/Chakra): Keeps bundle size small
- **Custom branding**: Easy to customize Tailwind theme

**Visual style**:
- Clean, minimal interface
- Subtle shadows and borders
- Good contrast ratios (WCAG AA minimum)
- Consistent spacing scale (4px, 8px, 16px, 24px, 32px)

#### "Inline Validation"
**Decision**: Real-time validation on blur + submit

**Validation triggers**:
- **On blur**: Validate when user leaves input field
- **On submit**: Validate entire form before submission
- **Not on keystroke**: Too aggressive, poor UX for typing

**Validation rules**:
- Title: 1-200 chars (show counter at 180+ chars)
- Description: Max 1000 chars (show counter at 900+ chars)
- Display error below field in red text
- Clear error when user starts typing again

#### "Loading States During API Calls"
**Decision**: Combination based on context

| Context | Loading State |
|---------|---------------|
| Form submission | Spinner in submit button + disabled state |
| Initial page load | Skeleton screens for task list |
| Deleting task | Spinner on delete button |
| Toggling complete | Optimistic update (instant feedback) |
| Search/filter | Small spinner in search box |

**No full-page spinners** - keep context visible

---

### Phase III - AI Chatbot

#### "Friendly Language"
**Decision**: Casual, helpful tone with selective emoji use

**Tone characteristics**:
- **Casual but professional**: "I've added..." not "Task has been added"
- **Emoji usage**: ✓ for success, ✗ for errors, 📋 for lists
- **No excessive emoji**: Max 1-2 per response
- **Positive framing**: "Let me help you with that" not "I cannot do that"

**Examples**:
```
Good: "✓ I've added 'Buy groceries' to your task list (Task #1)"
Bad:  "Task #1 has been successfully created with title 'Buy groceries'"

Good: "You have 3 tasks: ..."
Bad:  "📋 Here are your tasks 📝 Total: 3 tasks! 🎉"
```

#### "Handles Ambiguous Requests"
**Decision**: 2 clarification attempts, then suggest alternatives

**Flow**:
1. **First attempt**: Ask specific clarifying question
2. **Second attempt**: Offer multiple-choice options
3. **After 2 attempts**: Suggest breaking down request or trying different phrasing

**Example**:
```
User: "Update the groceries"
Agent: "Which task would you like to update? You have:
       1. Buy groceries (Task #1)
       2. Put away groceries (Task #5)"

User: "The first one"
Agent: "What would you like to update about 'Buy groceries'?
       - Title
       - Description
       - Mark as complete"

User: "Make it done"
Agent: "✓ Marked 'Buy groceries' as complete (Task #1)"
```

#### "Natural Language"
**Decision**: Support both casual phrasing and command-like syntax

**Supported patterns**:
- **Casual**: "I need to buy groceries tomorrow"
- **Command-like**: "add task: Buy groceries"
- **Imperative**: "Create a task for buying groceries"
- **Questions**: "Can you add a task to buy groceries?"

**All should work** - agent extracts intent regardless of phrasing

---

### Phase V - Advanced Features

#### "Daily, Weekly, Monthly" Recurrence
**Decision**: User-configurable time, defaults to 9:00 AM local time

**Recurrence time options**:
- **Default**: 9:00 AM in user's local timezone
- **User can specify**: "daily at 3pm", "weekly on Monday at 8am"
- **Natural language parsing**: "every morning at 7" → 7:00 AM daily

**Storage**: Store in UTC, display in user's timezone

#### "Browser Notifications"
**Decision**: Desktop notifications (requires permission)

**Notification behavior**:
- **Request permission** on first reminder setup
- **Desktop notifications**: Work even when tab not focused (if permission granted)
- **In-app fallback**: If permission denied, show in-app notification badge
- **Sound**: Optional (user preference)

**Implementation**: Service Worker for push notifications

#### "High/Medium/Low Priority"
**Decision**: Affects sorting AND visual display

**Visual indicators**:
- **High**: Red dot, bold title
- **Medium**: Yellow dot, normal title (default)
- **Low**: Gray dot, lighter text

**Sorting logic**:
- Default sort: Priority (high → medium → low), then due date
- User can change sort: Due date, creation date, alphabetical, custom

---

## 2. MISSING ASSUMPTIONS - DEFINED

### Authentication & Security

#### Password Requirements
**Decision**: Minimum 8 characters, encourage strong passwords

```
Minimum requirements:
- Length: 8+ characters
- No complexity requirements (research shows they reduce security)
- Check against common passwords list (top 10,000)
- Show password strength indicator (weak/medium/strong)
- Allow passphrases (e.g., "correct horse battery staple")
```

**Rationale**: NIST guidelines recommend length over complexity

#### JWT Token Refresh Strategy
**Decision**: Single long-lived token (7 days), no refresh token

```
Token strategy:
- Access token expires: 7 days
- No refresh token (simplicity over security for this project)
- User must re-login after 7 days
- "Remember me" option: Extends to 30 days
```

**Future enhancement** (out of scope): Refresh token pattern for production

#### Session Management
**Decision**: Allow multiple concurrent sessions

```
Multi-device behavior:
- User can be logged in on multiple devices simultaneously
- Each device has its own JWT token
- Logout on one device doesn't affect others
- "Logout all devices" option in settings (optional feature)
```

#### Rate Limiting
**Decision**: Per-user rate limits with generous defaults

```
Rate limits (per user):
- API requests: 100 requests/minute
- Task creation: 10 tasks/minute
- Chat messages: 20 messages/minute
- Authentication: 5 login attempts/hour (per IP)

Response: 429 Too Many Requests with Retry-After header
```

#### Account Recovery
**Decision**: OUT OF SCOPE for initial implementation

```
Phase II-IV: No password reset (MVP focus)
Phase V or bonus: Add "Forgot Password" email flow
```

Users must remember password or create new account (acceptable for hackathon/learning project)

---

### Database

#### Soft Delete vs Hard Delete
**Decision**: Hard delete (permanent removal)

```
Deletion behavior:
- DELETE FROM tasks WHERE id = X
- No "deleted_at" column
- No archival system
- User can't undo deletion (show confirmation first)
```

**Rationale**: Simpler implementation, no GDPR concerns for learning project

**Future enhancement**: Soft deletes with 30-day retention

#### Data Retention Policy
**Decision**: No automatic deletion (keep indefinitely)

```
Retention:
- Tasks: Keep until user manually deletes
- Conversations: Keep indefinitely (or until user deletes)
- User accounts: Keep until user requests deletion
- Audit logs: Not implemented in this project
```

#### Database Migration Strategy
**Decision**: ORM auto-migrations with manual review

```
Migration workflow:
- SQLModel/Alembic auto-generates migrations
- Developer reviews migration before applying
- Up and down migrations always provided
- Test migrations on dev database first
- Store migrations in version control
```

#### Backup Frequency
**Decision**: Rely on Neon's automatic backups

```
Backup strategy:
- Neon provides automatic backups (no manual setup)
- Point-in-time recovery available (Neon feature)
- No custom backup implementation needed
```

**For self-hosted PostgreSQL** (Phase IV Minikube):
- Daily backups at 2:00 AM UTC
- Retain last 7 days

#### Maximum Task Limit Per User
**Decision**: 10,000 tasks per user (soft limit with warning)

```
Task limits:
- Soft limit: 10,000 tasks (show warning at 9,000)
- Hard limit: None initially (could add later)
- Rationale: Prevent abuse while allowing power users
```

---

### User Experience

#### Default Sort Order
**Decision**: Creation date descending (newest first)

```
Default sort: Most recently created tasks at top
Alternative sorts: Due date, priority, alphabetical, custom order
User can change default in settings (Phase V feature)
```

#### Empty State Messaging
**Decision**: Friendly prompt with action button

```
Empty state for new user:
┌─────────────────────────────────────┐
│  📋 No tasks yet                     │
│  Get started by adding your first   │
│  task to stay organized!            │
│                                     │
│  [+ Add Your First Task]            │
└─────────────────────────────────────┘

Empty state after deleting all tasks:
┌─────────────────────────────────────┐
│  ✨ All done!                        │
│  You've completed all your tasks.   │
│                                     │
│  [+ Add Task]                       │
└─────────────────────────────────────┘
```

#### Error Message Style
**Decision**: User-friendly messages, technical details in console (dev mode)

```
User-facing errors:
- "Title cannot be empty. Please enter a task title."
- "Something went wrong. Please try again."

Developer console (development mode only):
- Full stack trace
- Request/response details
- Database query errors

Production: Never expose technical details to users
```

#### Undo Functionality
**Decision**: OUT OF SCOPE (show confirmation instead)

```
No undo/redo functionality in any phase
Use confirmation prompts for destructive actions:
- Delete task: "Are you sure you want to delete 'X'?"
- Delete all completed: "Delete all X completed tasks?"
```

**Future enhancement**: Toast notification with "Undo" button for 5 seconds

#### Confirmation Prompts
**Decision**: Confirm all destructive actions

```
Require confirmation for:
- Delete task
- Delete all completed tasks
- Clear all tasks
- Delete account

No confirmation for:
- Toggle complete/incomplete
- Update task
- Add task
```

---

### Deployment

#### Docker Registry
**Decision**: GitHub Container Registry (ghcr.io)

```
Registry: ghcr.io/yourusername/evolution-of-todo
Images:
- ghcr.io/yourusername/evolution-of-todo/frontend:v1.0.0
- ghcr.io/yourusername/evolution-of-todo/backend:v1.0.0

Rationale:
- Free for public repositories
- Integrated with GitHub Actions
- Good for learning/portfolio projects
```

**Alternative** (if private): Docker Hub free tier

#### Image Versioning Strategy
**Decision**: Semantic versioning + Git SHA

```
Tagging strategy:
- Semantic version: v1.0.0, v1.1.0, v2.0.0
- Git SHA: abc123f (for traceability)
- Environment tag: latest, staging, production

Example:
ghcr.io/user/todo-backend:v1.0.0
ghcr.io/user/todo-backend:abc123f
ghcr.io/user/todo-backend:latest
```

#### Environment Naming
**Decision**: Two environments (dev/prod)

```
Environments:
- development (local laptop)
- production (cloud deployment)

No staging environment (keep it simple for learning project)
```

#### Database Connection Pooling
**Decision**: SQLAlchemy default pool with custom limits

```python
# SQLAlchemy pool configuration
pool_size=5          # Max connections in pool
max_overflow=10      # Additional connections when pool full
pool_timeout=30      # Seconds to wait for connection
pool_recycle=3600    # Recycle connections after 1 hour
```

#### SSL/TLS Certificate Management
**Decision**: Automatic certificates per platform

```
Platform-specific:
- Vercel (frontend): Automatic SSL (built-in)
- Cloud provider: Use provider's automatic SSL (e.g., DigitalOcean managed certs)
- Kubernetes: cert-manager with Let's Encrypt

No manual certificate management needed
```

---

### AI Agent Behavior

#### OpenAI Model Selection
**Decision**: GPT-4-turbo (configurable via environment variable)

```
Default model: gpt-4-turbo (cost-effective, fast)
Environment variable: OPENAI_MODEL=gpt-4-turbo
Alternative: gpt-4 (more capable, higher cost)
Fallback: gpt-3.5-turbo (if budget constrained)
```

#### Token Limits Per Chat Request
**Decision**: 4,000 tokens max (includes history + new message + response)

```
Token management:
- Max conversation history: Last 10 messages (summarize older)
- Max single message: 1,000 tokens
- Reserve for response: 1,000 tokens
- Total context: ~4,000 tokens

If exceeded: Truncate oldest messages, keep system prompt
```

#### Fallback Behavior (OpenAI API Unavailable)
**Decision**: Graceful degradation with clear error message

```
If OpenAI API unavailable:
1. Show user-friendly error: "AI assistant temporarily unavailable"
2. Suggest alternative: "Use the task list view to manage tasks"
3. Log error for debugging
4. Allow user to retry after 30 seconds
5. No automatic retries (avoid cost escalation)
```

#### Cost Control
**Decision**: Per-user daily limits with warnings

```
Cost limits (per user per day):
- Max chat messages: 100 messages/day
- Max tokens: 100,000 tokens/day
- Warning at 80%: "You've used 80 of 100 daily messages"
- Hard stop at 100%: "Daily limit reached. Resets in X hours."

Admin can adjust limits via environment variables
```

#### Multi-language Support
**Decision**: English only for MVP (Phase II-IV)

```
Phase II-IV: English only
Phase V or bonus: Add Urdu support
  - AI agent prompt in English
  - User input can be Urdu
  - Agent responses in Urdu (if requested)
  - UI remains English (i18n out of scope)
```

---

## 3. INCOMPLETE REQUIREMENTS - COMPLETED

### Phase I - Console App ✅

#### Exit/Quit Mechanism
**Already implemented**: Menu option #6 "Exit"

#### Input Validation Error Handling
**Already implemented**: Show error, re-prompt for input

#### Menu Navigation
**Already implemented**: Returns to main menu after each operation

#### Data Persistence
**Clarification**: Explicitly none - data lost on exit (as specified)

---

### Phase II - Full-Stack Web

#### Pagination Strategy
**Decision**: Infinite scroll with virtual scrolling

```
Implementation:
- Load initial 50 tasks
- On scroll to bottom, load next 50
- Use virtual scrolling library (react-window) for 1000+ tasks
- Show "Loading more..." spinner while fetching
- "Back to top" button appears after scrolling down
```

**Alternative** (if simpler): Load all tasks (acceptable for <1000 tasks per user)

#### Form Validation Rules

**Title validation**:
```javascript
// After trimming whitespace
minLength: 1 character
maxLength: 200 characters
allowedChars: Any Unicode characters
disallowedChars: None (allow emoji, special chars)
```

**Description validation**:
```javascript
maxLength: 1000 characters
allowedChars: Any Unicode characters
```

**HTML/script tag handling**:
```javascript
// React auto-escapes, but also sanitize on backend
Backend: Strip HTML tags with bleach or html.escape
Frontend: React escapes by default (no dangerouslySetInnerHTML)
```

**SQL injection prevention**:
```python
# SQLModel/SQLAlchemy parameterized queries (automatic)
# Never use raw SQL with user input
```

#### API Error Response Format
**Decision**: Consistent JSON structure

```json
// Success response (200, 201)
{
  "id": 1,
  "title": "Buy groceries",
  "completed": false,
  "created_at": "2024-12-25T10:00:00Z"
}

// Error response (400, 401, 404, 500)
{
  "error": {
    "message": "Task not found",
    "code": "TASK_NOT_FOUND",
    "status": 404,
    "details": null  // Only in development mode
  }
}

// Development mode adds:
"details": {
  "stack_trace": "...",
  "request_id": "abc123"
}
```

**Error codes**:
```
VALIDATION_ERROR (400)
UNAUTHORIZED (401)
FORBIDDEN (403)
NOT_FOUND (404)
RATE_LIMIT_EXCEEDED (429)
INTERNAL_ERROR (500)
```

#### Token Storage on Frontend
**Decision**: httpOnly cookies (most secure)

```javascript
// Backend sets cookie
Set-Cookie: auth_token=xyz; HttpOnly; Secure; SameSite=Strict; Max-Age=604800

// Frontend can't access token (XSS protection)
// Browser automatically sends cookie with requests

Alternative (if httpOnly not feasible): localStorage with XSS mitigation
```

#### CORS Configuration
**Decision**: Specific origin, credentials included

```python
# FastAPI CORS middleware
allow_origins=["https://yourdomain.com"]  # Production
allow_origins=["http://localhost:3000"]   # Development
allow_credentials=True  # For cookies
allow_methods=["GET", "POST", "PUT", "DELETE", "PATCH"]
allow_headers=["Content-Type", "Authorization"]
```

---

### Phase III - AI Chatbot

#### MCP Tool Error Handling

**Task not found**:
```json
{
  "error": "Task not found",
  "task_id": 999,
  "user_id": "user123"
}
```

**User ID mismatch**:
```json
{
  "error": "Forbidden: Task belongs to different user",
  "task_id": 5
}
```

**Network/database errors**:
```json
{
  "error": "Database connection failed",
  "retry_after": 5  // seconds
}
```

**Agent behavior**: Convert errors to user-friendly messages
```
Error: "Task not found"
Agent: "I couldn't find task #999. You have 3 tasks: [1, 2, 3]"
```

#### Conversation Timeout
**Decision**: No automatic timeout (keep conversations indefinitely)

```
Conversation retention:
- Keep all conversations until user manually deletes
- No inactivity timeout
- User can delete old conversations from list
```

#### Maximum Conversation Length
**Decision**: 100 messages, then suggest new conversation

```
Conversation limits:
- Max messages: 100 (50 user + 50 assistant)
- At 90 messages: Warn "Conversation is getting long. Start new?"
- At 100 messages: Force new conversation
- Old conversation archived (still accessible)
```

#### Tool Call Logging
**Decision**: Log to database with 30-day retention

```sql
CREATE TABLE tool_calls (
  id SERIAL PRIMARY KEY,
  conversation_id INTEGER,
  user_id VARCHAR(255),
  tool_name VARCHAR(100),
  parameters JSON,
  result JSON,
  error TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Retention: Delete logs older than 30 days
DELETE FROM tool_calls WHERE created_at < NOW() - INTERVAL '30 days';
```

#### Multiple Tool Calls in Single Turn
**Decision**: Allowed and presented as numbered list

```
User: "Add tasks to buy groceries and call mom"

Agent calls:
1. add_task("Buy groceries")
2. add_task("Call mom")

Agent response:
"✓ I've added 2 tasks:
1. Buy groceries (Task #1)
2. Call mom (Task #2)"
```

---

### Phase IV - Local Kubernetes

#### Minikube Resource Requirements
**Decision**: Minimum 4GB RAM, 2 CPUs

```
Minimum system requirements:
- RAM: 4GB allocated to Minikube
- CPU: 2 cores
- Disk: 20GB free space
- OS: WSL2 Ubuntu (Windows), macOS, Linux

Recommended:
- RAM: 8GB
- CPU: 4 cores
- Disk: 40GB SSD
```

#### Docker Image Naming Convention
**Decision**: Descriptive names with semantic versioning

```
Naming convention:
todo-frontend:v1.0.0
todo-backend:v1.0.0
todo-frontend:latest

Local development:
todo-frontend:dev
todo-backend:dev

Full path for registry:
ghcr.io/username/todo-frontend:v1.0.0
```

#### Helm Chart Testing Strategy
**Decision**: helm lint + dry-run + test deployment

```bash
# 1. Lint chart
helm lint ./todo-chart

# 2. Dry run (validate without deploying)
helm install todo-app ./todo-chart --dry-run --debug

# 3. Deploy to test namespace
helm install todo-app ./todo-chart -n test

# 4. Verify deployment
kubectl get pods -n test
helm test todo-app -n test

# 5. Clean up
helm uninstall todo-app -n test
```

#### kubectl-ai Setup
**Decision**: OpenAI provider (configurable)

```bash
# Install kubectl-ai
brew install kubectl-ai  # or download binary

# Configure OpenAI
export OPENAI_API_KEY=sk-...
kubectl ai config set provider openai

# Alternative: Local model (if OpenAI unavailable)
kubectl ai config set provider local
```

#### Database Deployment (Minikube)
**Decision**: Use external Neon (simplifies local setup)

```
Minikube environment:
- Backend connects to Neon PostgreSQL (external)
- No PostgreSQL deployment in Minikube
- Simpler setup, no database management

Rationale:
- Neon free tier sufficient for testing
- Avoids PostgreSQL StatefulSet complexity
- Faster local development iteration
```

**Alternative** (if offline development needed): PostgreSQL Helm chart

---

### Phase V - Cloud Deployment

#### Kafka Topic Partitioning
**Decision**: 3 partitions per topic (balanced approach)

```
Topic configurations:
task-events: 3 partitions
reminders: 3 partitions
task-updates: 3 partitions

Rationale:
- 3 partitions = up to 3 concurrent consumers
- Sufficient for 100 concurrent users
- Can increase later if needed
```

#### Consumer Group Naming
**Decision**: Descriptive names with service prefix

```
Consumer groups:
todo-backend-task-events
todo-recurring-service-task-events
todo-notification-service-reminders
todo-websocket-service-task-updates
```

#### Kafka Retention Policy
**Decision**: 7 days OR 1GB per partition (whichever first)

```
Retention config:
retention.ms = 604800000  # 7 days
retention.bytes = 1073741824  # 1GB per partition

Total: 3 partitions × 1GB = 3GB max per topic
```

#### Dapr Sidecar Resource Allocation
**Decision**: Minimal resources, scale with app

```yaml
# Dapr sidecar resources
requests:
  cpu: 100m
  memory: 128Mi
limits:
  cpu: 500m
  memory: 512Mi
```

#### Monitoring Requirements
**Decision**: Basic metrics with free tier tools

```
Metrics to collect (via Kubernetes metrics-server):
- CPU usage per pod
- Memory usage per pod
- Request rate (via API middleware)
- Error rate (4xx, 5xx responses)
- Response time (p50, p95, p99)

Tools:
- Kubernetes Dashboard (built-in)
- kubectl top (built-in)
- Optional: Grafana + Prometheus (if time permits)

Alerting: Manual monitoring initially (no automated alerts for MVP)
```

#### Auto-Scaling Triggers
**Decision**: CPU-based HPA with conservative settings

```yaml
# HPA configuration
metrics:
  - type: Resource
    resource:
      name: cpu
      target:
        type: Utilization
        averageUtilization: 70  # Scale at 70% CPU

behavior:
  scaleDown:
    stabilizationWindowSeconds: 300  # Wait 5 min before scaling down
  scaleUp:
    stabilizationWindowSeconds: 60   # Wait 1 min before scaling up

min/max replicas:
  Frontend: 2-5 replicas
  Backend: 2-10 replicas
  Notification service: 1-3 replicas
```

#### Disaster Recovery
**Decision**: Basic backup strategy (not enterprise-grade)

```
Backup frequency:
- Database: Neon automatic backups (daily)
- Kafka: Not backed up (ephemeral event stream)
- User uploads: Not applicable (no file uploads)

Recovery objectives:
- RTO (Recovery Time): 4 hours (manual recovery)
- RPO (Recovery Point): 24 hours (daily backups)

Rationale: Learning project, not production system
```

---

### Recurring Tasks

#### Deleting Recurring Tasks
**Decision**: Delete current instance only (user chooses)

```
Deletion options:
- "Delete this task only" (default)
- "Delete this and all future tasks"
- "Stop recurrence but keep this task"

Implementation:
- Show confirmation modal with 3 radio buttons
- User selects preferred option
- Backend executes accordingly
```

#### Modifying Recurrence Pattern
**Decision**: Yes, can modify after creation

```
Modification options:
- Change recurrence pattern (daily → weekly)
- Change recurrence time (9am → 3pm)
- Disable recurrence (keep current task)

Implementation:
- Edit task modal has "Recurrence" section
- Changes apply to future instances only
- Current task remains unchanged
```

#### Completing Recurring Tasks
**Decision**: Only current instance marked complete

```
Completion behavior:
- User completes task #5 (daily recurring)
- Task #5 marked complete
- New task #25 created for tomorrow
- Old completed task remains in "completed" filter
```

#### Overdue Recurring Tasks
**Decision**: Next instance generates on original schedule

```
Scenario:
- Daily task due yesterday (missed)
- User completes it today
- Next instance: Tomorrow (original schedule continues)

Rationale: Don't shift schedule due to delays
```

---

### Reminders

#### Notification Delivery Method
**Decision**: Desktop push notifications (primary)

```
Notification flow:
1. User grants permission (browser prompt)
2. Service Worker registered
3. At remind_at time, send push notification
4. If tab closed: Desktop notification shows
5. If tab open: In-app toast + desktop notification

Fallback (permission denied):
- In-app notification badge only
- Shows when user opens app
```

**Email notifications**: OUT OF SCOPE (no email service integration)

#### Reminder Timing Precision
**Decision**: Within 1 minute of remind_at time

```
Precision:
- Dapr Jobs API triggers within 60 seconds
- Acceptable: 9:00:00 AM - 9:00:59 AM
- Not guaranteed to be exact second

Rationale: Dapr Jobs scheduling granularity
```

#### Multiple Reminders Per Task
**Decision**: Single reminder per task

```
Limitation:
- Each task has 0 or 1 reminder
- User can update reminder time
- Deleting task deletes reminder

Future enhancement: Multiple reminders per task
```

#### Snooze Functionality
**Decision**: OUT OF SCOPE for MVP

```
Phase II-IV: No snooze
Phase V or bonus: Add "Snooze 10 minutes" button in notification

Workaround: User can update reminder time manually
```

#### User Offline When Reminder Triggers
**Decision**: Notification persists until user comes online

```
Offline behavior:
- Push notification queued by browser
- Delivered when user comes online
- Notification shows in system tray
- User sees it when they check computer

Limitation: Only works if browser/OS supports persistent notifications
```

---

### Search & Filter

#### Search Algorithm
**Decision**: Case-insensitive partial match with ranking

```sql
-- PostgreSQL full-text search
SELECT * FROM tasks
WHERE
  user_id = $1
  AND (
    title ILIKE '%' || $2 || '%'
    OR description ILIKE '%' || $2 || '%'
  )
ORDER BY
  CASE WHEN title ILIKE $2 || '%' THEN 1 ELSE 2 END,  -- Prefer prefix match
  created_at DESC
```

**Not fuzzy search** (keeps it simple, no Elasticsearch needed)

#### Case Sensitivity
**Decision**: Case-insensitive search

```
Search for "GROCERIES" matches:
- "Buy groceries"
- "GROCERIES LIST"
- "groceries"
```

#### Search Scope
**Decision**: Both title and description by default

```
Search behavior:
- Default: Search title + description
- User can filter: "in:title groceries" (future enhancement)
- Highlights matching text in results (optional)
```

#### Multiple Tag Filter Logic
**Decision**: AND logic (all tags must match)

```
Filter: tags=work,urgent
Matches: Tasks with BOTH "work" AND "urgent" tags
Doesn't match: Tasks with only "work" or only "urgent"

Alternative filter: tags_any=work,urgent (future enhancement)
Matches: Tasks with "work" OR "urgent"
```

#### Date Range Filter
**Decision**: Inclusive boundaries

```
Filter: due_after=2024-12-25&due_before=2024-12-31
Includes: Tasks due on Dec 25 through Dec 31 (inclusive)

Start: 2024-12-25 00:00:00
End:   2024-12-31 23:59:59
```

#### Performance Optimization
**Decision**: Database indexes + pagination

```sql
-- Indexes for search performance
CREATE INDEX idx_tasks_title_trgm ON tasks USING gin(title gin_trgm_ops);
CREATE INDEX idx_tasks_desc_trgm ON tasks USING gin(description gin_trgm_ops);
CREATE INDEX idx_tasks_user_created ON tasks(user_id, created_at DESC);

-- Pagination in API
LIMIT 50 OFFSET 0  -- First page
LIMIT 50 OFFSET 50  -- Second page
```

**No full-text search engine** (PostgreSQL sufficient for 10,000 tasks/user)

---

## 4. SCOPE CONFLICTS - RESOLVED

### Cloud Provider Choice
**Decision**: Primary documentation for DigitalOcean DOKS

```
Primary: DigitalOcean DOKS (simplest, good docs)
Alternative guides: GKE, AKS (separate markdown files)

Rationale:
- DigitalOcean: Simple UI, affordable, good for learners
- GKE/AKS: Available if user prefers
```

### Kafka vs Managed Services
**Decision**: Redpanda Cloud (managed, free tier)

```
Preferred: Redpanda Cloud
- Free tier available
- Kafka-compatible API
- Simpler setup than Strimzi

Alternative: Strimzi (if self-hosted required)
- More complex
- Requires Kubernetes resources
- Good for learning Kafka internals
```

### Development vs Production
**Decision**: Environment variable detection

```python
# Environment detection
ENV = os.getenv("ENVIRONMENT", "development")

if ENV == "production":
    DEBUG = False
    LOG_LEVEL = "WARNING"
    SHOW_STACK_TRACE = False
else:
    DEBUG = True
    LOG_LEVEL = "DEBUG"
    SHOW_STACK_TRACE = True
```

### Feature Prioritization
**Decision**: Core features required, advanced features optional

```
Required for "success":
- Phase I: All 5 features ✅
- Phase II: Auth, CRUD API, basic UI
- Phase III: Basic chat, 5 MCP tools
- Phase IV: Containerization, Helm deployment
- Phase V: Kafka events, Dapr integration

Optional (nice-to-have):
- Recurring tasks (can defer)
- Reminders (can defer)
- Advanced search (basic search sufficient)
- Priorities (can add later)

Deferrable if time-limited: Recurring tasks, reminders, advanced filters
```

### AI Agent Capabilities
**Decision**: Notification UI is allowed customization

```
Allowed customizations:
- Notification toast component (in-app)
- Browser notification content/format
- Notification badge icon

Not allowed:
- Custom chat UI layout (must use ChatKit)
- Custom message bubbles (use ChatKit defaults)

Rationale: Notifications are outside chat UI, thus customizable
```

### Stateless Architecture
**Decision**: Clarify Dapr State vs Database State

```
Database state (persistent):
- Tasks, users, conversations (PostgreSQL)
- Long-term storage, survives restarts

Dapr State (ephemeral cache):
- Conversation context (recent messages)
- User preferences (settings)
- Temporary data (caching)

WebSocket connections:
- Connection itself is stateful (TCP)
- Connection state stored in Dapr State Store
- On pod restart, client reconnects (idempotent)

Reconciliation: Stateless means "no in-memory state", Dapr State is distributed and persistent
```

### Bonus Features
**Decision**: Follow spec-driven process for bonus features

```
Bonus features (+200 points each):
- Multi-language (Urdu) support
- Voice command input

Must follow same process:
1. Write specification (specs/bonus/urdu-support.md)
2. Create implementation plan
3. Generate code with Claude Code
4. Document in PHR

Not experimental: Still follows constitution and SDD principles
```

---

## 5. CRITICAL GAPS - DECISIONS MADE

### Authentication Flow Details

#### Password Reset
**Decision**: OUT OF SCOPE for Phase II-IV

```
Phase II-IV: No password reset
Phase V or bonus: Add email-based password reset

User must remember password or create new account
```

#### Email Verification
**Decision**: OUT OF SCOPE (no email required)

```
Registration flow:
1. User enters email + password
2. Account created immediately (no verification)
3. User can log in right away

Rationale: Simplifies MVP, no email service needed
```

#### Social Login
**Decision**: OUT OF SCOPE (email/password only)

```
Phase II-IV: Email + password only
Phase V or bonus: Add OAuth (Google, GitHub)
```

---

### Error Handling Strategy

**Consistent error format** (defined earlier in section 3)

**Error codes**:
```
VALIDATION_ERROR (400)
UNAUTHORIZED (401)
FORBIDDEN (403)
NOT_FOUND (404)
RATE_LIMIT_EXCEEDED (429)
INTERNAL_ERROR (500)
DATABASE_ERROR (503)
```

---

### Database Schema Evolution

**Migration strategy** (defined earlier):
- Alembic auto-migrations with manual review
- Up/down migrations required
- Test in dev before production

**Phase transitions**:
```
Phase II → III:
- Add conversations table
- Add messages table

Phase III → V:
- Add priority column
- Add tags table
- Add task_tags join table
- Add due_date, remind_at columns
- Add recurrence_pattern column
```

---

### Environment Configuration

**`.env.example`**:
```bash
# Application
ENVIRONMENT=development  # development | production
DEBUG=true
SECRET_KEY=change-me-in-production

# Database
DATABASE_URL=postgresql://user:pass@host:5432/dbname

# Authentication
JWT_SECRET=change-me-in-production
JWT_EXPIRATION_DAYS=7

# OpenAI (Phase III+)
OPENAI_API_KEY=sk-...
OPENAI_MODEL=gpt-4-turbo

# Frontend
NEXT_PUBLIC_API_URL=http://localhost:8000

# Rate Limiting
RATE_LIMIT_PER_MINUTE=100

# Kafka (Phase V)
KAFKA_BROKERS=localhost:9092

# Dapr (Phase V)
DAPR_HTTP_PORT=3500
```

---

### MCP Tool Error Responses

**Standardized format**:
```json
{
  "success": false,
  "error": {
    "code": "TASK_NOT_FOUND",
    "message": "Task #999 not found",
    "details": {
      "task_id": 999,
      "user_id": "user123"
    }
  }
}
```

---

### Date/Time Handling

**Strategy**: UTC storage, local display

```
Storage (database):
- All timestamps in UTC
- Column type: TIMESTAMP WITHOUT TIME ZONE

API responses:
- ISO 8601 format with UTC: "2024-12-25T10:00:00Z"

Frontend display:
- Convert to user's local timezone
- Use browser's Intl.DateTimeFormat
- Show relative times: "2 hours ago", "tomorrow at 3pm"

Recurring tasks:
- User specifies "daily at 9am" in their timezone
- Backend converts to UTC cron expression
- Dapr Jobs triggers in UTC
```

---

## 6. ARCHITECTURAL DECISIONS SUMMARY

### Monorepo vs Separate Repos
**Decision**: Monorepo (single repository)

```
Repository structure:
hackathon-2-TODO-App/
├── frontend/          # Next.js app
├── backend/           # FastAPI app
├── infra/             # Kubernetes/Helm charts
├── docs/              # Documentation
└── .github/           # GitHub Actions workflows

Rationale:
- Easier version synchronization
- Single CI/CD pipeline
- Better for learning project
```

### API Versioning
**Decision**: No versioning initially, add /v1 when needed

```
Phase II-IV: /api/{user_id}/tasks (no version)
Phase V: Add /api/v1 only if breaking changes needed

Rationale: YAGNI principle, add complexity when required
```

### Database Pooling
**Decision**: SQLAlchemy defaults (defined earlier)

```python
pool_size=5
max_overflow=10
pool_timeout=30
pool_recycle=3600
```

### Caching Strategy
**Decision**: No caching initially (database only)

```
Phase II-IV: No Redis, no caching layer
Phase V or bonus: Add Redis for:
- Frequently accessed tasks
- User session data
- Rate limiting counters

Rationale: PostgreSQL sufficient for 100 users, premature optimization
```

### Static Asset Serving
**Decision**: Vercel default (CDN automatic)

```
Frontend (Next.js on Vercel):
- Static assets automatically served via Vercel Edge Network
- No custom CDN configuration needed

Images:
- Use Next.js Image component (automatic optimization)
- No separate image CDN
```

---

## APPROVAL REQUIRED

**User, please review these clarifications and:**

1. **Approve all decisions** - Proceed with Phase II planning
2. **Request changes** - Specify which decisions to modify
3. **Ask questions** - Clarify any unclear decisions

Once approved, I will:
1. Create Phase II technical plan
2. Break down into implementable tasks
3. Generate ADRs for key architectural decisions
4. Begin implementation

---

**Status**: ⏸️ Awaiting user approval
**Next Step**: Create Phase II technical plan after approval
**Estimated LOE**: Phase II planning ~2 hours, implementation ~8 hours
