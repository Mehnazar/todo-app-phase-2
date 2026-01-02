# Backend Implementation Guidelines

**Project**: Evolution of Todo - Backend
**Framework**: FastAPI (async)
**Language**: Python 3.13+ with type hints
**ORM**: SQLModel (SQLAlchemy + Pydantic)
**Database**: Neon Serverless PostgreSQL
**Authentication**: Better Auth with JWT
**Development Method**: Spec-Driven Development (SDD)

---

## Core Requirements

### 1. Type Hints Always ⚠️

**CRITICAL:** Every function MUST have parameter and return type hints

```python
# ✅ CORRECT
async def get_tasks(user_id: str, db: AsyncSession) -> list[Task]:
    result = await db.execute(select(Task).where(Task.user_id == user_id))
    return result.scalars().all()

# ❌ WRONG
async def get_tasks(user_id, db):  # Missing type hints
    # ...
```

**Required Imports:**
```python
from typing import Optional, List, Dict, Any
from sqlmodel import Field, SQLModel, select
```

---

### 2. Async/Await for All I/O

**CRITICAL:** All I/O operations MUST be async

```python
# ✅ CORRECT - Async database query
async def get_task(task_id: int, db: AsyncSession) -> Optional[Task]:
    result = await db.execute(select(Task).where(Task.id == task_id))
    return result.scalar_one_or_none()

# ❌ WRONG - Synchronous database query
def get_task(task_id: int, db: Session) -> Optional[Task]:
    return db.query(Task).filter(Task.id == task_id).first()  # Blocking!
```

**Async Libraries:**
- Database: `sqlalchemy.ext.asyncio`
- HTTP Client: `httpx` (NOT `requests`)
- File I/O: `aiofiles`

---

### 3. Error Handling Standards

**Use HTTPException for API errors:**

```python
from fastapi import HTTPException, status

# ✅ CORRECT - Standardized error format
raise HTTPException(
    status_code=status.HTTP_404_NOT_FOUND,
    detail={
        "error": {
            "code": "TASK_NOT_FOUND",
            "message": "Task not found. It may have been deleted.",
            "details": {"task_id": task_id},
            "timestamp": datetime.now(timezone.utc).isoformat()
        }
    }
)

# ❌ WRONG - Bare exception
raise Exception("Task not found")  # No user-friendly message

# ❌ WRONG - Bare except block
try:
    # ...
except:  # Catches ALL exceptions including SystemExit
    pass
```

**Reference:** `specs/technical/error-codes.md` for standardized error codes

---

### 4. Environment Variables

**ALL config from environment:**

```python
import os

# ✅ CORRECT - From environment with validation
DATABASE_URL = os.getenv("DATABASE_URL")
if not DATABASE_URL:
    raise RuntimeError("DATABASE_URL environment variable is required")

# ❌ WRONG - Hardcoded
DATABASE_URL = "postgresql://user:pass@localhost/db"  # NEVER hardcode!
```

**Files:**
- `.env` - Local development (NEVER commit)
- `.env.example` - Template (ALWAYS commit)

---

## File Organization

```
backend/
├── src/
│   ├── main.py               # FastAPI app entry point
│   ├── config.py             # Configuration (env vars)
│   ├── db.py                 # Database connection & session
│   ├── models.py             # SQLModel models (User, Task)
│   ├── routes/               # API endpoints
│   │   ├── __init__.py
│   │   ├── auth.py           # Authentication endpoints
│   │   ├── tasks.py          # Task CRUD endpoints
│   │   └── chat.py           # Chat endpoint (Phase III)
│   ├── middleware/           # Middleware
│   │   ├── __init__.py
│   │   ├── auth.py           # JWT authentication
│   │   └── errors.py         # Error handler
│   ├── services/             # Business logic
│   │   ├── __init__.py
│   │   ├── auth_service.py   # Authentication logic
│   │   └── task_service.py   # Task business logic
│   └── utils/                # Utilities
│       ├── __init__.py
│       └── datetime_utils.py # Timezone helpers
├── alembic/                  # Database migrations
│   ├── versions/
│   │   └── 001_initial.py
│   └── env.py
├── tests/                    # Unit tests (optional)
├── .env.example              # Environment template
├── .env                      # Local env (gitignored)
├── alembic.ini               # Alembic configuration
├── pyproject.toml            # UV dependencies
└── README.md                 # Setup instructions
```

---

## Database Operations

### SQLModel Models

```python
from sqlmodel import Field, SQLModel
from datetime import datetime, timezone
from typing import Optional

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

### Async Queries

```python
from sqlmodel import select
from sqlalchemy.ext.asyncio import AsyncSession

async def get_user_tasks(user_id: str, db: AsyncSession) -> list[Task]:
    """Get all tasks for a user."""
    result = await db.execute(
        select(Task)
        .where(Task.user_id == user_id)
        .order_by(Task.created_at.desc())
    )
    return result.scalars().all()

async def create_task(
    user_id: str,
    title: str,
    description: str,
    db: AsyncSession
) -> Task:
    """Create a new task."""
    task = Task(
        user_id=user_id,
        title=title,
        description=description,
        created_at=datetime.now(timezone.utc),
        updated_at=datetime.now(timezone.utc)
    )
    db.add(task)
    await db.commit()
    await db.refresh(task)
    return task
```

### User Isolation (CRITICAL)

**ALWAYS filter by user_id:**

```python
# ✅ CORRECT - User isolation enforced
async def get_task(task_id: int, user_id: str, db: AsyncSession) -> Optional[Task]:
    result = await db.execute(
        select(Task)
        .where(Task.id == task_id)
        .where(Task.user_id == user_id)  # CRITICAL: User isolation
    )
    return result.scalar_one_or_none()

# ❌ WRONG - No user isolation (security vulnerability!)
async def get_task(task_id: int, db: AsyncSession) -> Optional[Task]:
    result = await db.execute(select(Task).where(Task.id == task_id))
    return result.scalar_one_or_none()  # ANY user can access ANY task!
```

---

## API Endpoint Structure

### Route File Template

```python
# src/routes/tasks.py
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from src.db import get_session
from src.models import Task
from src.middleware.auth import get_current_user
from datetime import datetime, timezone

router = APIRouter(prefix="/api/v1", tags=["tasks"])

@router.get("/{user_id}/tasks")
async def list_tasks(
    user_id: str,
    current_user: str = Depends(get_current_user),
    db: AsyncSession = Depends(get_session)
) -> list[Task]:
    """List all tasks for a user."""
    # Verify user can only access own tasks
    if user_id != current_user:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail={"error": {"code": "FORBIDDEN", "message": "Access denied"}}
        )

    # Query tasks
    result = await db.execute(
        select(Task)
        .where(Task.user_id == user_id)
        .order_by(Task.created_at.desc())
    )
    return result.scalars().all()
```

### Register Routes in main.py

```python
# src/main.py
from fastapi import FastAPI
from src.routes import auth, tasks

app = FastAPI(title="Evolution of Todo API", version="1.0.0")

# Register routers
app.include_router(auth.router)
app.include_router(tasks.router)
```

---

## Authentication (JWT)

### JWT Middleware

```python
# src/middleware/auth.py
from fastapi import Depends, HTTPException, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from jose import JWTError, jwt

security = HTTPBearer()
SECRET_KEY = os.getenv("BETTER_AUTH_SECRET")
ALGORITHM = "HS256"

async def get_current_user(
    credentials: HTTPAuthorizationCredentials = Depends(security)
) -> str:
    """Extract user_id from JWT token."""
    token = credentials.credentials
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        user_id: str = payload.get("sub")
        if user_id is None:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail={"error": {"code": "AUTH_TOKEN_INVALID", "message": "Invalid token"}}
            )
        return user_id
    except JWTError:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail={"error": {"code": "AUTH_TOKEN_INVALID", "message": "Invalid token"}}
        )
```

### Usage in Endpoints

```python
@router.get("/{user_id}/tasks")
async def list_tasks(
    user_id: str,
    current_user: str = Depends(get_current_user),  # JWT validation
    db: AsyncSession = Depends(get_session)
):
    # Verify user_id matches token
    if user_id != current_user:
        raise HTTPException(status_code=403, detail={"error": {"code": "FORBIDDEN"}})
    # ...
```

---

## Timezone Handling

### Always Use UTC

```python
from datetime import datetime, timezone

# ✅ CORRECT - UTC timestamp
created_at = datetime.now(timezone.utc)

# ❌ WRONG - Local timezone (ambiguous)
created_at = datetime.now()  # What timezone?
```

### Serialize for API

```python
def serialize_datetime(dt: datetime) -> str:
    """Serialize datetime for API response (ISO 8601 with Z)."""
    if dt.tzinfo is None:
        dt = dt.replace(tzinfo=timezone.utc)
    return dt.isoformat().replace('+00:00', 'Z')

# Usage
task_dict = {
    "id": task.id,
    "title": task.title,
    "created_at": serialize_datetime(task.created_at)  # "2025-12-25T10:30:00Z"
}
```

**Reference:** `specs/technical/timezone-handling.md`

---

## Database Migrations (Alembic)

### Workflow

**1. Modify SQLModel models:**
```python
# src/models.py
class Task(SQLModel, table=True):
    # Add new field
    priority: int = Field(default=2)
```

**2. Generate migration:**
```bash
alembic revision --autogenerate -m "add priority to tasks"
```

**3. Review generated migration:**
```python
# alembic/versions/002_add_priority.py
def upgrade():
    op.add_column('tasks', sa.Column('priority', sa.Integer(), nullable=True))

def downgrade():
    op.drop_column('tasks', 'priority')
```

**4. Apply migration:**
```bash
alembic upgrade head
```

**5. Test rollback:**
```bash
alembic downgrade -1
alembic upgrade head  # Re-apply
```

**Reference:** `specs/technical/database-migrations.md`

---

## Error Response Format

### Standardized Structure

```python
{
    "error": {
        "code": "TASK_NOT_FOUND",
        "message": "Task not found. It may have been deleted.",
        "details": {"task_id": 123, "user_id": "usr_abc"},
        "timestamp": "2025-12-25T10:30:00Z"
    }
}
```

### Common Error Codes

- `AUTH_TOKEN_INVALID` - Invalid or expired JWT token
- `AUTH_EMAIL_EXISTS` - Email already registered
- `AUTH_INVALID_CREDENTIALS` - Wrong email/password
- `TASK_NOT_FOUND` - Task doesn't exist
- `TASK_UNAUTHORIZED` - User doesn't own task
- `TASK_TITLE_INVALID` - Title validation failed
- `VALIDATION_ERROR` - Request validation failed

**Reference:** `specs/technical/error-codes.md` for complete list

---

## Testing Checklist

Before marking feature complete:

- [ ] All functions have type hints
- [ ] All I/O operations are async
- [ ] User isolation enforced (WHERE user_id = ...)
- [ ] Error responses use standardized format
- [ ] Environment variables documented in `.env.example`
- [ ] Timestamps stored in UTC
- [ ] Alembic migration created and tested
- [ ] API endpoints tested with Postman/Insomnia
- [ ] No bare `except:` blocks
- [ ] No hardcoded secrets

---

## Common Pitfalls

### ❌ Mistake 1: Missing User Isolation
```python
# ❌ WRONG - Security vulnerability!
task = await db.get(Task, task_id)

# ✅ CORRECT - User isolation
result = await db.execute(
    select(Task).where(Task.id == task_id, Task.user_id == user_id)
)
task = result.scalar_one_or_none()
```

### ❌ Mistake 2: Synchronous I/O
```python
# ❌ WRONG - Blocking operation
def get_task(db: Session):  # Sync Session
    return db.query(Task).first()

# ✅ CORRECT - Async operation
async def get_task(db: AsyncSession):
    result = await db.execute(select(Task))
    return result.scalar_one_or_none()
```

### ❌ Mistake 3: Local Timezone
```python
# ❌ WRONG - Ambiguous timezone
created_at = datetime.now()

# ✅ CORRECT - Explicit UTC
created_at = datetime.now(timezone.utc)
```

---

## References

**Parent Documentation:**
- [CONSTITUTION.md](../.specify/memory/constitution.md) - Architectural principles
- [specs/database/schema.md](../todo-app/specs/database/schema.md) - Database schema
- [specs/api/rest-endpoints.md](../todo-app/specs/api/rest-endpoints.md) - API spec
- [specs/technical/error-codes.md](../todo-app/specs/technical/error-codes.md) - Error codes
- [specs/technical/timezone-handling.md](../todo-app/specs/technical/timezone-handling.md) - Timezone strategy

**External Documentation:**
- [FastAPI Documentation](https://fastapi.tiangolo.com/)
- [SQLModel Documentation](https://sqlmodel.tiangolo.com/)
- [Alembic Documentation](https://alembic.sqlalchemy.org/)
- [Better Auth Documentation](https://better-auth.com/)

---

**Version:** 1.0.0
**Created:** 2025-12-25
**Development Method:** Spec-Driven Development (SDD)
