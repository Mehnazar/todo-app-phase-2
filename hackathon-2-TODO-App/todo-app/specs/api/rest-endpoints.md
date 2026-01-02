# REST API Endpoints Specification

**Project**: Evolution of Todo - Phase II
**API Version**: v1
**Base URL**: `/api/v1`
**Authentication**: JWT Bearer Token
**Content-Type**: application/json
**Created**: 2025-12-25

---

## Overview

RESTful API for Evolution of Todo application providing user authentication and task management.

### Core Principles

1. **JWT Authentication** - All endpoints (except auth) require Bearer token
2. **User Isolation** - Users can only access their own data
3. **Stateless** - No server-side sessions
4. **UTC Timestamps** - All dates in ISO 8601 format with Z suffix
5. **Standardized Errors** - Consistent error format across all endpoints

---

## Authentication

### JWT Token Format

**Header:**
```
Authorization: Bearer <token>
```

**Token Payload:**
```json
{
  "sub": "usr_abc123",           // user_id
  "email": "user@example.com",
  "exp": 1735155600              // Unix timestamp (7 days from issue)
}
```

**Token Expiration:** 7 days (604800 seconds)

**Algorithm:** HS256

---

## Authentication Endpoints

### POST /api/v1/auth/register

Register a new user account.

**Authentication:** None required

**Request Body:**
```json
{
  "email": "user@example.com",
  "password": "SecurePass123",
  "name": "John Doe"              // Optional
}
```

**Request Validation:**
- `email`: Required, valid email format, unique
- `password`: Required, 8-128 characters, mixed case + number
- `name`: Optional, max 255 characters

**Success Response (201 Created):**
```json
{
  "user_id": "usr_abc123",
  "email": "user@example.com",
  "name": "John Doe",
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "created_at": "2025-12-25T10:30:00Z"
}
```

**Error Responses:**

**409 Conflict** - Email already registered
```json
{
  "error": {
    "code": "AUTH_EMAIL_EXISTS",
    "message": "Email already registered. Please login or use a different email.",
    "details": {
      "email": "user@example.com"
    },
    "timestamp": "2025-12-25T10:30:00Z"
  }
}
```

**422 Unprocessable Entity** - Invalid password
```json
{
  "error": {
    "code": "AUTH_INVALID_PASSWORD",
    "message": "Password must be 8-128 characters with mixed case and at least one number.",
    "details": {
      "requirements": ["8-128 chars", "mixed case", "number"]
    },
    "timestamp": "2025-12-25T10:30:00Z"
  }
}
```

**422 Unprocessable Entity** - Invalid email
```json
{
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Invalid email format.",
    "details": {
      "field": "email",
      "value": "invalid-email"
    },
    "timestamp": "2025-12-25T10:30:00Z"
  }
}
```

---

### POST /api/v1/auth/login

Authenticate user and receive JWT token.

**Authentication:** None required

**Request Body:**
```json
{
  "email": "user@example.com",
  "password": "SecurePass123"
}
```

**Success Response (200 OK):**
```json
{
  "user_id": "usr_abc123",
  "email": "user@example.com",
  "name": "John Doe",
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "token_expires_at": "2026-01-01T10:30:00Z"
}
```

**Error Responses:**

**401 Unauthorized** - Invalid credentials
```json
{
  "error": {
    "code": "AUTH_INVALID_CREDENTIALS",
    "message": "Invalid email or password.",
    "details": {},
    "timestamp": "2025-12-25T10:30:00Z"
  }
}
```

**422 Unprocessable Entity** - Missing fields
```json
{
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Email and password are required.",
    "details": {
      "missing_fields": ["email", "password"]
    },
    "timestamp": "2025-12-25T10:30:00Z"
  }
}
```

---

## Task Endpoints

All task endpoints require JWT authentication and user isolation.

### GET /api/v1/{user_id}/tasks

List all tasks for authenticated user.

**Authentication:** Required (JWT Bearer token)

**Path Parameters:**
- `user_id` (string): User ID (must match token)

**Query Parameters:**
- `status` (string, optional): Filter by status
  - `all` (default): All tasks
  - `pending`: Incomplete tasks only
  - `completed`: Completed tasks only
- `limit` (integer, optional): Max tasks to return (default: 100, max: 1000)
- `offset` (integer, optional): Pagination offset (default: 0)

**Request Example:**
```
GET /api/v1/usr_abc123/tasks?status=pending&limit=50
Authorization: Bearer eyJhbGc...
```

**Success Response (200 OK):**
```json
{
  "tasks": [
    {
      "id": 1,
      "user_id": "usr_abc123",
      "title": "Buy groceries",
      "description": "Milk, eggs, bread",
      "completed": false,
      "created_at": "2025-12-25T10:30:00Z",
      "updated_at": "2025-12-25T10:30:00Z"
    },
    {
      "id": 2,
      "user_id": "usr_abc123",
      "title": "Call mom",
      "description": "",
      "completed": true,
      "created_at": "2025-12-24T15:20:00Z",
      "updated_at": "2025-12-25T09:15:00Z"
    }
  ],
  "total": 2,
  "limit": 50,
  "offset": 0
}
```

**Error Responses:**

**401 Unauthorized** - Invalid/expired token
```json
{
  "error": {
    "code": "AUTH_TOKEN_INVALID",
    "message": "Invalid or expired token. Please login again.",
    "details": {},
    "timestamp": "2025-12-25T10:30:00Z"
  }
}
```

**403 Forbidden** - user_id mismatch
```json
{
  "error": {
    "code": "FORBIDDEN",
    "message": "Access denied. You can only access your own data.",
    "details": {
      "requested_user_id": "usr_xyz789",
      "authenticated_user_id": "usr_abc123"
    },
    "timestamp": "2025-12-25T10:30:00Z"
  }
}
```

---

### POST /api/v1/{user_id}/tasks

Create a new task.

**Authentication:** Required (JWT Bearer token)

**Path Parameters:**
- `user_id` (string): User ID (must match token)

**Request Body:**
```json
{
  "title": "Buy groceries",
  "description": "Milk, eggs, bread"    // Optional
}
```

**Request Validation:**
- `title`: Required, 1-200 characters after trim
- `description`: Optional, max 1000 characters

**Success Response (201 Created):**
```json
{
  "id": 3,
  "user_id": "usr_abc123",
  "title": "Buy groceries",
  "description": "Milk, eggs, bread",
  "completed": false,
  "created_at": "2025-12-25T10:30:00Z",
  "updated_at": "2025-12-25T10:30:00Z"
}
```

**Error Responses:**

**422 Unprocessable Entity** - Empty title
```json
{
  "error": {
    "code": "TASK_TITLE_INVALID",
    "message": "Title cannot be empty.",
    "details": {
      "field": "title",
      "constraint": "1-200 characters"
    },
    "timestamp": "2025-12-25T10:30:00Z"
  }
}
```

**422 Unprocessable Entity** - Title too long
```json
{
  "error": {
    "code": "TASK_TITLE_INVALID",
    "message": "Title must be 200 characters or less.",
    "details": {
      "field": "title",
      "length": 250,
      "max_length": 200
    },
    "timestamp": "2025-12-25T10:30:00Z"
  }
}
```

**422 Unprocessable Entity** - Description too long
```json
{
  "error": {
    "code": "TASK_DESCRIPTION_TOO_LONG",
    "message": "Description must be 1000 characters or less.",
    "details": {
      "field": "description",
      "length": 1500,
      "max_length": 1000
    },
    "timestamp": "2025-12-25T10:30:00Z"
  }
}
```

---

### GET /api/v1/{user_id}/tasks/{id}

Get a single task by ID.

**Authentication:** Required (JWT Bearer token)

**Path Parameters:**
- `user_id` (string): User ID (must match token)
- `id` (integer): Task ID

**Request Example:**
```
GET /api/v1/usr_abc123/tasks/1
Authorization: Bearer eyJhbGc...
```

**Success Response (200 OK):**
```json
{
  "id": 1,
  "user_id": "usr_abc123",
  "title": "Buy groceries",
  "description": "Milk, eggs, bread",
  "completed": false,
  "created_at": "2025-12-25T10:30:00Z",
  "updated_at": "2025-12-25T10:30:00Z"
}
```

**Error Responses:**

**404 Not Found** - Task doesn't exist or belongs to another user
```json
{
  "error": {
    "code": "TASK_NOT_FOUND",
    "message": "Task not found. It may have been deleted or you don't have access.",
    "details": {
      "task_id": 999,
      "user_id": "usr_abc123"
    },
    "timestamp": "2025-12-25T10:30:00Z"
  }
}
```

**Note:** Returns 404 (not 403) even if task exists but belongs to another user. This prevents leaking information about other users' tasks.

---

### PUT /api/v1/{user_id}/tasks/{id}

Update a task's title and/or description.

**Authentication:** Required (JWT Bearer token)

**Path Parameters:**
- `user_id` (string): User ID (must match token)
- `id` (integer): Task ID

**Request Body:**
```json
{
  "title": "Buy groceries and fruits",     // Optional
  "description": "Milk, eggs, bread, apples"  // Optional
}
```

**Request Validation:**
- At least one field (`title` or `description`) must be provided
- `title`: If provided, 1-200 characters after trim
- `description`: If provided, max 1000 characters

**Success Response (200 OK):**
```json
{
  "id": 1,
  "user_id": "usr_abc123",
  "title": "Buy groceries and fruits",
  "description": "Milk, eggs, bread, apples",
  "completed": false,
  "created_at": "2025-12-25T10:30:00Z",
  "updated_at": "2025-12-25T11:45:00Z"    // Auto-updated
}
```

**Error Responses:**

**404 Not Found** - Task doesn't exist
```json
{
  "error": {
    "code": "TASK_NOT_FOUND",
    "message": "Task not found. It may have been deleted or you don't have access.",
    "details": {
      "task_id": 999,
      "user_id": "usr_abc123"
    },
    "timestamp": "2025-12-25T10:30:00Z"
  }
}
```

**422 Unprocessable Entity** - No fields provided
```json
{
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "At least one field (title or description) must be provided.",
    "details": {},
    "timestamp": "2025-12-25T10:30:00Z"
  }
}
```

**422 Unprocessable Entity** - Invalid title
```json
{
  "error": {
    "code": "TASK_TITLE_INVALID",
    "message": "Title must be 200 characters or less.",
    "details": {
      "field": "title",
      "length": 250,
      "max_length": 200
    },
    "timestamp": "2025-12-25T10:30:00Z"
  }
}
```

---

### DELETE /api/v1/{user_id}/tasks/{id}

Delete a task permanently.

**Authentication:** Required (JWT Bearer token)

**Path Parameters:**
- `user_id` (string): User ID (must match token)
- `id` (integer): Task ID

**Request Example:**
```
DELETE /api/v1/usr_abc123/tasks/1
Authorization: Bearer eyJhbGc...
```

**Success Response (204 No Content):**
```
(No response body)
```

**Error Responses:**

**404 Not Found** - Task doesn't exist
```json
{
  "error": {
    "code": "TASK_NOT_FOUND",
    "message": "Task not found. It may have been deleted or you don't have access.",
    "details": {
      "task_id": 999,
      "user_id": "usr_abc123"
    },
    "timestamp": "2025-12-25T10:30:00Z"
  }
}
```

---

### PATCH /api/v1/{user_id}/tasks/{id}/complete

Toggle task completion status.

**Authentication:** Required (JWT Bearer token)

**Path Parameters:**
- `user_id` (string): User ID (must match token)
- `id` (integer): Task ID

**Request Body:**
```json
{
  "completed": true    // true or false
}
```

**Alternative:** Can omit body to toggle current state

**Success Response (200 OK):**
```json
{
  "id": 1,
  "user_id": "usr_abc123",
  "title": "Buy groceries",
  "description": "Milk, eggs, bread",
  "completed": true,                        // Toggled
  "created_at": "2025-12-25T10:30:00Z",
  "updated_at": "2025-12-25T14:20:00Z"      // Auto-updated
}
```

**Error Responses:**

**404 Not Found** - Task doesn't exist
```json
{
  "error": {
    "code": "TASK_NOT_FOUND",
    "message": "Task not found. It may have been deleted or you don't have access.",
    "details": {
      "task_id": 999,
      "user_id": "usr_abc123"
    },
    "timestamp": "2025-12-25T10:30:00Z"
  }
}
```

---

## Common Error Responses

### 401 Unauthorized - Missing Token
```json
{
  "error": {
    "code": "AUTH_TOKEN_MISSING",
    "message": "Authentication required. Please provide a valid token.",
    "details": {},
    "timestamp": "2025-12-25T10:30:00Z"
  }
}
```

### 401 Unauthorized - Invalid Token
```json
{
  "error": {
    "code": "AUTH_TOKEN_INVALID",
    "message": "Invalid or expired token. Please login again.",
    "details": {},
    "timestamp": "2025-12-25T10:30:00Z"
  }
}
```

### 403 Forbidden - User ID Mismatch
```json
{
  "error": {
    "code": "FORBIDDEN",
    "message": "Access denied. You can only access your own data.",
    "details": {
      "requested_user_id": "usr_xyz789",
      "authenticated_user_id": "usr_abc123"
    },
    "timestamp": "2025-12-25T10:30:00Z"
  }
}
```

### 500 Internal Server Error
```json
{
  "error": {
    "code": "INTERNAL_ERROR",
    "message": "An unexpected error occurred. Please try again later.",
    "details": {
      "request_id": "req_abc123"    // Production only
    },
    "timestamp": "2025-12-25T10:30:00Z"
  }
}
```

---

## HTTP Status Codes

| Code | Meaning | Usage |
|------|---------|-------|
| 200 | OK | Successful GET, PUT, PATCH |
| 201 | Created | Successful POST (resource created) |
| 204 | No Content | Successful DELETE |
| 400 | Bad Request | Malformed JSON, invalid syntax |
| 401 | Unauthorized | Missing/invalid/expired token |
| 403 | Forbidden | Valid token, but access denied (user_id mismatch) |
| 404 | Not Found | Resource doesn't exist or unauthorized access |
| 409 | Conflict | Resource already exists (duplicate email) |
| 422 | Unprocessable Entity | Validation failed (invalid data) |
| 500 | Internal Server Error | Unexpected server error |
| 503 | Service Unavailable | Database down, maintenance mode |

---

## User Isolation Requirements

**CRITICAL:** All task endpoints MUST enforce user isolation.

### Implementation Requirements

1. **Extract user_id from JWT token** (not URL parameter)
2. **Verify URL user_id matches token user_id**
   - If mismatch → 403 Forbidden
3. **Filter all database queries by authenticated user_id**
   - Example: `WHERE task_id = ? AND user_id = ?`
4. **Return 404 (not 403) for unauthorized task access**
   - Prevents leaking information about other users' tasks

### Security Example

```python
# ❌ WRONG - No user isolation
async def get_task(task_id: int, db: AsyncSession):
    result = await db.execute(select(Task).where(Task.id == task_id))
    return result.scalar_one_or_none()

# ✅ CORRECT - User isolation enforced
async def get_task(task_id: int, user_id: str, db: AsyncSession):
    result = await db.execute(
        select(Task)
        .where(Task.id == task_id)
        .where(Task.user_id == user_id)  # CRITICAL: User isolation
    )
    return result.scalar_one_or_none()
```

---

## Timestamp Format

All timestamps MUST follow ISO 8601 format with UTC timezone (Z suffix).

**Format:** `YYYY-MM-DDTHH:MM:SSZ`

**Examples:**
- `2025-12-25T10:30:00Z` ✅ Correct
- `2025-12-25T10:30:00+00:00` ❌ Wrong (use Z, not +00:00)
- `2025-12-25 10:30:00` ❌ Wrong (missing T and Z)

**Backend Serialization:**
```python
from datetime import datetime, timezone

def serialize_datetime(dt: datetime) -> str:
    """Serialize datetime for API response."""
    if dt.tzinfo is None:
        dt = dt.replace(tzinfo=timezone.utc)
    return dt.isoformat().replace('+00:00', 'Z')

# Usage
"created_at": serialize_datetime(task.created_at)
# Output: "2025-12-25T10:30:00Z"
```

**Frontend Parsing:**
```typescript
const createdAt = new Date(task.created_at)
// Automatically converts to browser's local timezone
```

---

## Rate Limiting (Future)

**Phase V Enhancement:**
- 100 requests per minute per user
- 429 Too Many Requests response
- Retry-After header

---

## API Versioning

**Current Version:** v1

**URL Format:** `/api/v1/...`

**Future Versions:**
- Backward-incompatible changes → new version (v2)
- Backward-compatible changes → same version
- Old versions supported for 6 months after new version

---

## CORS Configuration

### Development
```
Access-Control-Allow-Origin: *
Access-Control-Allow-Methods: GET, POST, PUT, PATCH, DELETE, OPTIONS
Access-Control-Allow-Headers: Content-Type, Authorization
Access-Control-Allow-Credentials: true
```

### Production
```
Access-Control-Allow-Origin: https://your-app.vercel.app
Access-Control-Allow-Methods: GET, POST, PUT, PATCH, DELETE, OPTIONS
Access-Control-Allow-Headers: Content-Type, Authorization
Access-Control-Allow-Credentials: true
```

---

## Testing Checklist

Before deploying:

- [ ] All endpoints return correct status codes
- [ ] Authentication required on all task endpoints
- [ ] User isolation enforced (can't access other users' tasks)
- [ ] Invalid tokens return 401
- [ ] user_id mismatch returns 403
- [ ] Non-existent tasks return 404
- [ ] Validation errors return 422
- [ ] Timestamps in ISO 8601 with Z suffix
- [ ] Error responses use standardized format
- [ ] CORS configured correctly
- [ ] Database queries filtered by user_id

---

## References

- [CONSTITUTION.md - API Design Standards](../../.specify/memory/constitution.md#api-design-standards)
- [specs/technical/error-codes.md](../technical/error-codes.md) - Complete error code reference
- [specs/technical/timezone-handling.md](../technical/timezone-handling.md) - Timestamp guidelines
- [specs/database/schema.md](../database/schema.md) - Database schema

---

**Version:** 1.0.0
**Last Updated:** 2025-12-25
**Status:** ✅ Ready for Implementation
