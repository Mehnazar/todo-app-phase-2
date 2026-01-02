# Evolution of Todo - Implementation Guide

**Project**: Evolution of Todo
**Development Method**: Spec-Driven Development (SDD)
**Based on**: `SPECIFICATION.md`, `CONSTITUTION.md`, `TECHNICAL-PLAN.md`, `TASKS.md`
**Version**: 1.0.0
**Created**: 2025-12-25

---

## Document Purpose

This guide provides **step-by-step implementation instructions** for all phases of the Evolution of Todo project, following strict Spec-Driven Development principles where:
1. **Specifications are written FIRST** (before any code)
2. **Claude Code generates ALL code** (no manual coding)
3. **Iterative refinement** is documented
4. **Testing validates** against specs

---

## Core Implementation Principles

### 1. Spec-First Development ⚠️

```
❌ NEVER: Write code → Create spec
✅ ALWAYS: Create spec → Generate code
```

**Why:** Ensures AI can generate correct code from unambiguous requirements.

### 2. No Manual Coding ⚠️

```
❌ NEVER: Write implementation code manually
✅ ALWAYS: Prompt Claude Code with @spec-file reference
```

**Exception:** Specifications and configuration files (CLAUDE.md, .env.example) can be written manually.

### 3. Iteration Documentation

```markdown
### Task X-Y: [Task Name]

**Iteration 1:**
- Prompt: "Implement @specs/path/to/spec.md"
- Result: Generated [files]
- Issues: [None or description]
- Status: ✓ Accepted or ✗ Rejected

**Iteration 2:** (if needed)
- Spec Changes: [What was clarified]
- Prompt: "Regenerate with updated spec..."
- Result: [Corrected implementation]
- Status: ✓ Accepted
```

### 4. Testing Before Proceeding

```
❌ NEVER: Move to next task with failing tests
✅ ALWAYS: Fix all issues, pass all acceptance criteria
```

### 5. Commit Discipline

```bash
# Format
git commit -m "[T-Phase-TaskNum] Brief description"

# Examples
git commit -m "[SPEC] Phase I data model specification"
git commit -m "[T-I-1.3] Implement Task dataclass via Claude Code"
git commit -m "[TEST] Phase I manual testing complete"
```

---

## Implementation Workflow (Every Task)

```
┌─────────────────────────────────────────────────────────────┐
│  STEP 1: WRITE SPECIFICATION                                │
│  - Create detailed spec file in specs/                      │
│  - Include examples, acceptance criteria                    │
│  - Commit: git commit -m "[SPEC] ..."                       │
└─────────────────────────────────────────────────────────────┘
                             ↓
┌─────────────────────────────────────────────────────────────┐
│  STEP 2: PROMPT CLAUDE CODE                                 │
│  - Reference spec with @filepath                            │
│  - Request implementation                                   │
│  - Review generated code                                    │
└─────────────────────────────────────────────────────────────┘
                             ↓
┌─────────────────────────────────────────────────────────────┐
│  STEP 3: TEST IMPLEMENTATION                                │
│  - Write test cases from acceptance criteria                │
│  - Run tests                                                │
│  - Verify against specification                             │
└─────────────────────────────────────────────────────────────┘
                             ↓
┌─────────────────────────────────────────────────────────────┐
│  STEP 4: REFINE IF NEEDED                                   │
│  - Update spec with clarifications                          │
│  - Re-prompt Claude Code                                    │
│  - Repeat until correct                                     │
└─────────────────────────────────────────────────────────────┘
                             ↓
┌─────────────────────────────────────────────────────────────┐
│  STEP 5: DOCUMENT IN PHR                                    │
│  - Create Prompt History Record                             │
│  - Record prompt, response, files, outcome                  │
│  - Save to history/prompts/                                 │
└─────────────────────────────────────────────────────────────┘
                             ↓
┌─────────────────────────────────────────────────────────────┐
│  STEP 6: COMMIT                                             │
│  - Use task ID in commit message                            │
│  - Commit spec and code together                            │
│  - Push to repository                                       │
└─────────────────────────────────────────────────────────────┘
```

---

## PHASE I: CONSOLE APPLICATION (COMPLETE)

### Overview

**Status:** ✅ COMPLETE
**Duration:** 5-7 hours
**Tasks:** 9
**Output:** Working console todo app with CRUD operations

Phase I has already been implemented. See existing files for reference:
- Specifications: `specs/phase-1/`
- Source code: `src/phase-1/`
- Demo: `demo-phase1.mp4`

**Key Learnings from Phase I:**
- Spec-first approach worked well
- Claude Code generated clean, working code
- TypedDict and dataclass effective for Python 3.13
- UTF-8 encoding fix needed for Windows console
- Clear acceptance criteria crucial for verification

---

## PHASE II: FULL-STACK WEB APPLICATION

### Overview

**Status:** 📋 PLANNED
**Duration:** 14-18 hours
**Tasks:** 12
**Checkpoint:** After Task II-4.3
**Output:** Multi-user web app with authentication

---

### Task II-1.1: Database Schema and Monorepo Setup

**Duration:** 60 minutes
**Priority:** High

#### Step 1: Create Database Schema Specification

**File:** `specs/database/schema.md`

**Content:**
```markdown
# Database Schema Specification

## Overview
PostgreSQL schema for Evolution of Todo Phase II and beyond.

## Design Principles
- UTC timestamps for all datetime fields (per CONSTITUTION.md)
- VARCHAR for user_id (Better Auth default)
- SERIAL for auto-increment IDs
- Foreign keys with appropriate ON DELETE behavior
- Indexes on frequently queried columns

## Tables

### users

**Purpose:** Store user accounts

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | VARCHAR(255) | PRIMARY KEY | User ID from Better Auth |
| email | VARCHAR(255) | UNIQUE, NOT NULL | User email address |
| name | VARCHAR(255) | NULL | User display name |
| created_at | TIMESTAMP | NOT NULL, DEFAULT NOW() AT TIME ZONE 'UTC' | Account creation time |

**Indexes:**
- PRIMARY KEY on id
- UNIQUE INDEX on email

**Notes:**
- id generated by Better Auth (format: usr_xxxxx)
- email must be unique (enforced at database level)
- created_at stores UTC time (no timezone)

### tasks

**Purpose:** Store user tasks

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | SERIAL | PRIMARY KEY | Auto-increment task ID |
| user_id | VARCHAR(255) | NOT NULL, FOREIGN KEY → users(id) | Task owner |
| title | VARCHAR(200) | NOT NULL | Task title |
| description | VARCHAR(1000) | NULL, DEFAULT '' | Task description |
| completed | BOOLEAN | NOT NULL, DEFAULT FALSE | Completion status |
| created_at | TIMESTAMP | NOT NULL, DEFAULT NOW() AT TIME ZONE 'UTC' | Creation time |
| updated_at | TIMESTAMP | NOT NULL, DEFAULT NOW() AT TIME ZONE 'UTC' | Last update time |

**Foreign Keys:**
- user_id REFERENCES users(id) ON DELETE CASCADE

**Indexes:**
- PRIMARY KEY on id
- INDEX on user_id (frequent filter)
- INDEX on completed (for status filtering)
- INDEX on created_at (for sorting)

**Notes:**
- id auto-increments starting from 1
- Cascade delete removes all tasks when user deleted
- All timestamps in UTC
- updated_at must be updated on every modification

## Migration Strategy

**Tool:** Alembic

**Migration Naming:**
- `001_initial_schema.py` - Create users and tasks tables
- `002_add_conversations.py` - Phase III conversation tables
- `003_add_advanced_features.py` - Phase V priorities, tags, due dates

**Migration Process:**
1. Modify SQLModel models
2. Generate migration: `alembic revision --autogenerate -m "description"`
3. Review generated migration (verify upgrade and downgrade)
4. Test upgrade: `alembic upgrade head`
5. Test downgrade: `alembic downgrade -1`
6. Re-test upgrade: `alembic upgrade head`
7. Commit migration file

**Zero-Downtime Guidelines:**
- Add columns with DEFAULT values
- Never drop columns immediately (deprecate first)
- Add indexes CONCURRENTLY in production

## Connection Configuration

**Connection Pooling:**
- pool_size: 20
- max_overflow: 40
- pool_timeout: 30 seconds
- pool_recycle: 3600 seconds (1 hour)

**Environment Variables:**
- DATABASE_URL: PostgreSQL connection string
- Format: `postgresql://user:password@host:port/database`

## Acceptance Criteria
- [ ] users table schema complete
- [ ] tasks table schema complete
- [ ] Foreign keys documented
- [ ] Indexes documented
- [ ] UTC timezone strategy documented
- [ ] Migration strategy documented
- [ ] Connection pooling configuration documented
```

**Commit:**
```bash
git add specs/database/schema.md
git commit -m "[SPEC] Database schema for Phase II"
```

#### Step 2: Create Monorepo Structure

**File:** `todo-app/README.md` (update)

Add section:
```markdown
## Project Structure

```
/
├── frontend/          # Next.js 16+ App Router application
├── backend/           # FastAPI backend application
├── infrastructure/    # Kubernetes, Docker, Helm configs
├── specs/             # All specifications
├── history/           # Prompt history records
└── .specify/          # Spec-Kit Plus configuration
```

### Frontend (Next.js)
- **Framework:** Next.js 16+ with App Router
- **Language:** TypeScript (strict mode)
- **Styling:** Tailwind CSS
- **Auth:** Better Auth client

### Backend (FastAPI)
- **Framework:** FastAPI (async)
- **Language:** Python 3.13+ with type hints
- **ORM:** SQLModel
- **Auth:** Better Auth with JWT
- **Migrations:** Alembic

### Infrastructure
- **Phase IV:** Docker, Helm charts, Minikube
- **Phase V:** Kubernetes manifests, Dapr configs
```

**Create Folders:**
```bash
mkdir -p frontend backend infrastructure
```

**Create CLAUDE.md files:**

**File:** `frontend/CLAUDE.md`
```markdown
# Frontend Implementation Guidelines

**Framework:** Next.js 16+ App Router
**Language:** TypeScript (strict mode)
**Styling:** Tailwind CSS

## Key Requirements

1. **App Router Only** (NOT Pages Router)
   - All pages in `src/app/`
   - Use Server Components by default
   - Client Components only when necessary ('use client' directive)

2. **TypeScript Strict Mode**
   - All functions must have type annotations
   - No `any` types without justification
   - Use interfaces for data structures

3. **Tailwind CSS**
   - No inline styles
   - Use utility classes
   - Responsive design (mobile-first)

4. **Environment Variables**
   - Client-side vars MUST be prefixed with NEXT_PUBLIC_
   - Never commit .env.local
   - Always update .env.example

## File Organization

```
src/
├── app/              # Next.js pages (App Router)
├── components/       # React components
├── lib/              # Utilities, API client
├── types/            # TypeScript types
└── styles/           # Global styles
```

## References
- Parent CONSTITUTION.md: ../../.specify/memory/constitution.md
- API Spec: ../../specs/api/rest-endpoints.md
- UI Spec: ../../specs/ui/components.md
```

**File:** `backend/CLAUDE.md`
```markdown
# Backend Implementation Guidelines

**Framework:** FastAPI
**Language:** Python 3.13+ with type hints
**ORM:** SQLModel
**Database:** Neon PostgreSQL

## Key Requirements

1. **Type Hints Always**
   - Every function must have parameter and return type hints
   - Use `from typing import ...` for complex types
   - No bare `pass` without type hint

2. **Async/Await**
   - All I/O operations must be async
   - Database queries use async SQLAlchemy
   - HTTP clients use httpx (not requests)

3. **Error Handling**
   - Use HTTPException for API errors
   - Follow standardized error format (specs/technical/error-codes.md)
   - Never bare `except:` blocks

4. **Environment Variables**
   - All config from environment
   - Never hardcode secrets
   - Always update .env.example

## File Organization

```
backend/
├── src/
│   ├── main.py           # FastAPI app
│   ├── config.py         # Configuration
│   ├── db.py             # Database connection
│   ├── models.py         # SQLModel models
│   ├── routes/           # API endpoints
│   ├── middleware/       # Auth, errors
│   └── services/         # Business logic
├── alembic/              # Database migrations
└── tests/                # Unit tests
```

## References
- Parent CONSTITUTION.md: ../.specify/memory/constitution.md
- Database Schema: ../specs/database/schema.md
- API Spec: ../specs/api/rest-endpoints.md
- Error Codes: ../specs/technical/error-codes.md
```

**Commit:**
```bash
git add frontend/ backend/ README.md
git commit -m "[T-II-1.1] Create monorepo structure with CLAUDE.md files"
```

---

### Task II-1.2: Initialize Backend with FastAPI and Database

**Duration:** 90 minutes
**Priority:** High

#### Step 1: Initialize Backend Project

**Navigate to backend:**
```bash
cd backend
```

**Initialize with UV:**
```bash
uv init
```

**Add dependencies:**
```bash
uv add fastapi sqlmodel alembic psycopg2-binary python-jose[cryptography] passlib[bcrypt] uvicorn[standard] python-multipart
```

#### Step 2: Create Neon Database

1. Go to https://neon.tech
2. Sign up / Login
3. Create new project: "evolution-of-todo"
4. Create database: "todo_dev"
5. Copy connection string

#### Step 3: Create Database Connection

**File:** `backend/src/db.py`

**Prompt Claude Code:**
```
Create src/db.py based on @../specs/database/schema.md

Requirements:
- Async SQLAlchemy engine with connection pooling
- Pool size: 20, max overflow: 40 (per CONSTITUTION.md)
- Use DATABASE_URL from environment variable
- Provide get_session() dependency for FastAPI
- Handle connection errors gracefully

Reference the schema specification for connection configuration.
```

**Expected Output:**
```python
# src/db.py
from sqlalchemy.ext.asyncio import create_async_engine, AsyncSession
from sqlalchemy.orm import sessionmaker
from sqlmodel import SQLModel
import os

DATABASE_URL = os.getenv("DATABASE_URL")
if not DATABASE_URL:
    raise RuntimeError("DATABASE_URL environment variable is required")

# Convert postgresql:// to postgresql+asyncpg://
if DATABASE_URL.startswith("postgresql://"):
    DATABASE_URL = DATABASE_URL.replace("postgresql://", "postgresql+asyncpg://")

engine = create_async_engine(
    DATABASE_URL,
    echo=True,  # Set to False in production
    pool_size=20,
    max_overflow=40,
    pool_timeout=30,
    pool_recycle=3600,
)

async_session = sessionmaker(
    engine, class_=AsyncSession, expire_on_commit=False
)

async def get_session() -> AsyncSession:
    async with async_session() as session:
        yield session
```

#### Step 4: Create SQLModel Models

**File:** `backend/src/models.py`

**Prompt Claude Code:**
```
Create src/models.py based on @../specs/database/schema.md

Requirements:
- SQLModel classes for User and Task
- All fields must match schema exactly
- created_at and updated_at with UTC defaults
- Follow timezone handling from @../specs/technical/timezone-handling.md
- Type hints on all fields

Generate complete models.
```

**Expected Output:**
```python
# src/models.py
from sqlmodel import Field, SQLModel
from datetime import datetime, timezone
from typing import Optional

class User(SQLModel, table=True):
    __tablename__ = "users"

    id: str = Field(primary_key=True)
    email: str = Field(unique=True, index=True)
    name: Optional[str] = None
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

class Task(SQLModel, table=True):
    __tablename__ = "tasks"

    id: Optional[int] = Field(default=None, primary_key=True)
    user_id: str = Field(foreign_key="users.id", index=True)
    title: str = Field(max_length=200)
    description: str = Field(default="", max_length=1000)
    completed: bool = Field(default=False, index=True)
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))
    updated_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))
```

#### Step 5: Initialize Alembic

```bash
alembic init alembic
```

**Configure Alembic:**

**File:** `backend/alembic/env.py`

Update to use SQLModel metadata:
```python
# Add imports
from src.models import SQLModel
from src.db import DATABASE_URL

# Update target_metadata
target_metadata = SQLModel.metadata

# Update config.set_main_option
config.set_main_option("sqlalchemy.url", DATABASE_URL)
```

**Create Initial Migration:**
```bash
alembic revision --autogenerate -m "initial schema"
```

**Review Generated Migration:**
Open `alembic/versions/001_initial_schema.py` and verify tables created correctly.

**Apply Migration:**
```bash
alembic upgrade head
```

**Verify in Neon Dashboard:**
- Check that `users` and `tasks` tables exist
- Verify columns match schema

#### Step 6: Create Basic FastAPI App

**File:** `backend/src/main.py`

**Prompt Claude Code:**
```
Create src/main.py with a basic FastAPI application.

Requirements:
- FastAPI app instance
- CORS middleware (allow all origins for now)
- Health check endpoint GET /health
- Include API versioning in path: /api/v1/

Keep it simple for now, routes will be added in later tasks.
```

**Expected Output:**
```python
# src/main.py
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

app = FastAPI(title="Evolution of Todo API", version="1.0.0")

# CORS configuration (allow all for development)
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Will be restricted in production
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/health")
async def health_check():
    return {"status": "healthy"}

@app.get("/api/v1/")
async def root():
    return {"message": "Evolution of Todo API v1"}
```

#### Step 7: Create Environment Configuration

**File:** `backend/.env.example`
```env
# Database
DATABASE_URL=postgresql://user:password@ep-xxx.neon.tech/todo_dev?sslmode=require

# Authentication (Phase II)
BETTER_AUTH_SECRET=your-secret-minimum-32-characters-generate-with-openssl-rand-hex-32
BETTER_AUTH_URL=http://localhost:3000

# Environment
ENVIRONMENT=development
LOG_LEVEL=DEBUG

# Connection Pool
DB_POOL_SIZE=20
DB_MAX_OVERFLOW=40
```

**File:** `backend/.env` (create, add to .gitignore)
```env
DATABASE_URL=<your-actual-neon-connection-string>
ENVIRONMENT=development
LOG_LEVEL=DEBUG
```

**Update .gitignore:**
```
.env
.env.local
__pycache__/
*.pyc
```

#### Step 8: Test Backend

**Run server:**
```bash
uvicorn src.main:app --reload
```

**Test endpoints:**
```bash
curl http://localhost:8000/health
# Should return: {"status":"healthy"}

curl http://localhost:8000/api/v1/
# Should return: {"message":"Evolution of Todo API v1"}
```

#### Step 9: Document in PHR

**File:** `history/prompts/phase-2/2025-12-25-backend-initialization.md`

```markdown
# Prompt History Record: Backend Initialization

**Date:** 2025-12-25
**Task:** II-1.2
**Phase:** Phase II - Full-Stack Web

## Prompts

### Prompt 1: Database Connection
"Create src/db.py based on @../specs/database/schema.md..."

**Result:** ✓ Generated db.py with async SQLAlchemy engine and connection pooling

### Prompt 2: SQLModel Models
"Create src/models.py based on @../specs/database/schema.md..."

**Result:** ✓ Generated User and Task models matching schema exactly

### Prompt 3: FastAPI App
"Create src/main.py with basic FastAPI application..."

**Result:** ✓ Generated main.py with health check and CORS

## Files Created
- backend/src/db.py
- backend/src/models.py
- backend/src/main.py
- backend/.env.example
- backend/.env (not committed)
- backend/alembic/versions/001_initial_schema.py

## Tests Performed
- ✓ Alembic migration applied successfully
- ✓ Tables created in Neon database
- ✓ FastAPI server runs without errors
- ✓ Health endpoint returns 200

## Outcome
✓ Backend initialized successfully with database connection and basic API structure.

**Next Task:** II-2.1 - Write API Endpoints Specification
```

#### Step 10: Commit

```bash
cd ..  # Back to todo-app root
git add backend/ history/
git commit -m "[T-II-1.2] Initialize FastAPI backend with Neon PostgreSQL

- Created database connection with connection pooling
- SQLModel User and Task models
- Alembic migration applied
- Basic FastAPI app with health check
- All specifications followed"
```

---

### Task II-2.1: Write API Endpoints Specification

**Duration:** 90 minutes
**Priority:** High

**File:** `specs/api/rest-endpoints.md`

**Create comprehensive API specification (see user's input for complete example)**

Key sections to include:
- Authentication endpoints (register, login)
- Task CRUD endpoints (list, create, get, update, delete, toggle)
- Request/response formats
- Error responses (reference error-codes.md)
- JWT authentication flow

**Commit:**
```bash
git add specs/api/rest-endpoints.md
git commit -m "[SPEC] REST API endpoints for Phase II"
```

---

### Remaining Phase II Tasks

Continue following the same pattern for:
- Task II-2.2: Implement Authentication
- Task II-2.3: Implement Task CRUD Endpoints
- Task II-3.1-3.4: Frontend implementation
- Task II-4.1-4.3: Integration, deployment, documentation

Each task follows:
1. Write detailed specification
2. Prompt Claude Code with spec reference
3. Test against acceptance criteria
4. Document in PHR
5. Commit with task ID

---

## PHASE III-V: IMPLEMENTATION APPROACH

For remaining phases, follow the established pattern:

### Phase III: AI Chatbot
- Create MCP tool specifications first
- Test each tool independently before integration
- Refine system prompt iteratively based on test results
- Verify stateless behavior (server restart test)

### Phase IV: Local Kubernetes
- Test Docker builds locally before deploying
- Use `helm template` to verify charts
- Use `kubectl describe` and `kubectl logs` for debugging
- Document all kubectl-ai interactions

### Phase V: Cloud Deployment
- Start with Redpanda Cloud (simpler than self-hosted Kafka)
- Follow Dapr official quickstarts
- Test CI/CD pipeline in staging environment
- Monitor production deployment closely

---

## TROUBLESHOOTING

### Claude Code Generates Incorrect Code

**Step 1:** Identify the specific issue
- What requirement was violated?
- Is the spec ambiguous?

**Step 2:** Update specification
- Add clarification or example
- Make requirement more explicit

**Step 3:** Re-prompt
```
The previous implementation didn't handle [X] correctly.
I've updated @specs/path/to/spec.md to clarify [Y].
Please regenerate with attention to the updated requirement.
```

### Tests Fail

**Check:**
1. Does test match spec? (Test might be wrong)
2. Is spec complete? (Spec might have gaps)
3. Is environment correct? (Dependencies, env vars)

**Fix:**
- Update spec if incomplete
- Fix test if incorrect
- Regenerate code if spec was clarified

### Integration Issues

**Common Causes:**
- CORS not configured
- Environment variables missing
- Database migrations not applied
- Authentication token format mismatch

**Debug:**
- Check browser console (frontend)
- Check server logs (backend)
- Verify environment variables loaded
- Test API with Postman/Insomnia

---

## COMPLETION CHECKLIST (Per Phase)

Before marking phase complete:

- [ ] All task specifications written and committed
- [ ] All code generated by Claude Code (documented in PHRs)
- [ ] All acceptance criteria met
- [ ] All tests passing
- [ ] README.md updated
- [ ] Demo video created (under 90 seconds, HD)
- [ ] All files committed
- [ ] Git tag created (`phase-X-complete`)
- [ ] Deployment working (Phase II+)
- [ ] No critical bugs

---

**Version:** 1.0.0
**Last Updated:** 2025-12-25
**Total Phases:** 5
**Estimated Total Time:** 60-80 hours
