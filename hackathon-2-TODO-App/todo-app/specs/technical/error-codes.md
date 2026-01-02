# Error Code Reference

**Project**: Evolution of Todo
**Purpose**: Standardized error codes for consistent error handling across all phases
**Last Updated**: 2025-12-25

---

## Authentication Errors

| Error Code | HTTP Status | Description | User Message |
|-----------|-------------|-------------|--------------|
| `AUTH_INVALID_CREDENTIALS` | 401 | Wrong email/password combination | Invalid email or password |
| `AUTH_TOKEN_EXPIRED` | 401 | JWT token has expired | Your session has expired. Please log in again. |
| `AUTH_TOKEN_INVALID` | 401 | Malformed or tampered token | Invalid authentication token. Please log in again. |
| `AUTH_EMAIL_EXISTS` | 409 | Email already registered | An account with this email already exists |
| `AUTH_UNAUTHORIZED` | 401 | Missing authentication token | Please log in to continue |

---

## Task Errors

| Error Code | HTTP Status | Description | User Message |
|-----------|-------------|-------------|--------------|
| `TASK_NOT_FOUND` | 404 | Task ID doesn't exist | Task not found. It may have been deleted. |
| `TASK_UNAUTHORIZED` | 403 | Task belongs to different user | You don't have permission to access this task |
| `TASK_INVALID_TITLE` | 400 | Title empty or exceeds 200 characters | Title must be between 1 and 200 characters |
| `TASK_INVALID_DESCRIPTION` | 400 | Description exceeds 1000 characters | Description must be 1000 characters or less |
| `TASK_INVALID_PRIORITY` | 400 | Priority not in [high, medium, low] | Priority must be high, medium, or low |
| `TASK_INVALID_DUE_DATE` | 400 | Due date in the past | Due date must be in the future |

---

## Conversation Errors (Phase III+)

| Error Code | HTTP Status | Description | User Message |
|-----------|-------------|-------------|--------------|
| `CONVERSATION_NOT_FOUND` | 404 | Conversation ID doesn't exist | Conversation not found |
| `CONVERSATION_UNAUTHORIZED` | 403 | Conversation belongs to different user | You don't have permission to access this conversation |
| `CONVERSATION_TOO_LONG` | 422 | Conversation exceeds 100 messages | This conversation is too long. Please start a new one. |

---

## MCP Tool Errors (Phase III+)

| Error Code | HTTP Status | Description | User Message |
|-----------|-------------|-------------|--------------|
| `MCP_TOOL_ERROR` | 500 | MCP tool execution failed | Something went wrong. Please try again. |
| `AI_SERVICE_UNAVAILABLE` | 503 | OpenAI API timeout or error | AI assistant temporarily unavailable. Please try again. |
| `AI_RATE_LIMIT` | 429 | OpenAI rate limit exceeded | Too many AI requests. Please wait a moment. |

---

## System Errors

| Error Code | HTTP Status | Description | User Message |
|-----------|-------------|-------------|--------------|
| `DATABASE_CONNECTION_FAILED` | 503 | Cannot connect to database | Service temporarily unavailable. Please try again. |
| `DATABASE_QUERY_FAILED` | 500 | SQL query error | An error occurred. Please try again. |
| `VALIDATION_ERROR` | 400 | Generic input validation failure | Invalid input. Please check your data. |
| `RATE_LIMIT_EXCEEDED` | 429 | Too many requests from user/IP | Too many requests. Please wait a moment. |
| `INTERNAL_ERROR` | 500 | Unexpected server error | An unexpected error occurred. Please try again. |

---

## HTTP Status Code Mapping

| HTTP Status | Usage | Error Codes |
|-------------|-------|-------------|
| 200 OK | Successful GET/PUT/PATCH | N/A |
| 201 Created | Successful POST (resource created) | N/A |
| 204 No Content | Successful DELETE | N/A |
| 400 Bad Request | Invalid input (validation failed) | `VALIDATION_ERROR`, `TASK_INVALID_*` |
| 401 Unauthorized | Missing/invalid/expired JWT token | `AUTH_*` errors |
| 403 Forbidden | Valid token but accessing another user's data | `*_UNAUTHORIZED` errors |
| 404 Not Found | Resource doesn't exist | `*_NOT_FOUND` errors |
| 409 Conflict | Duplicate resource | `AUTH_EMAIL_EXISTS` |
| 422 Unprocessable Entity | Business logic error | `CONVERSATION_TOO_LONG` |
| 429 Too Many Requests | Rate limit exceeded | `RATE_LIMIT_EXCEEDED`, `AI_RATE_LIMIT` |
| 500 Internal Server Error | Unexpected server error | `INTERNAL_ERROR`, `DATABASE_*`, `MCP_TOOL_ERROR` |
| 503 Service Unavailable | External dependency down | `DATABASE_CONNECTION_FAILED`, `AI_SERVICE_UNAVAILABLE` |

---

## Error Response Format

### Production Environment

```json
{
  "error": {
    "code": "TASK_NOT_FOUND",
    "message": "Task not found. It may have been deleted.",
    "details": {
      "request_id": "abc-123-def-456"
    },
    "timestamp": "2024-12-25T10:30:00Z"
  }
}
```

### Development Environment

```json
{
  "error": {
    "code": "DATABASE_QUERY_FAILED",
    "message": "SQL query error",
    "details": {
      "query": "SELECT * FROM tasks WHERE user_id = $1",
      "exception": "psycopg2.OperationalError: server closed the connection",
      "stack_trace": "Traceback (most recent call last):\n  File \"...\", line 42, in fetch_tasks\n    result = await session.execute(query)\n..."
    },
    "timestamp": "2024-12-25T10:30:00Z"
  }
}
```

---

## Frontend Error Handling

### User-Friendly Error Messages

```typescript
const friendlyMessages: Record<string, string> = {
  AUTH_TOKEN_EXPIRED: "Your session has expired. Please log in again.",
  TASK_NOT_FOUND: "This task no longer exists.",
  RATE_LIMIT_EXCEEDED: "Too many requests. Please wait a moment.",
  DATABASE_CONNECTION_FAILED: "Service temporarily unavailable. Please try again.",
  AI_SERVICE_UNAVAILABLE: "AI assistant is temporarily unavailable. Please try the regular task view.",
  // ... more mappings
}
```

### Error Handling Flow

```typescript
async function handleApiError(response: Response) {
  const errorData = await response.json()
  const code = errorData.error.code

  // Display user-friendly message
  const message = friendlyMessages[code] || errorData.error.message
  toast.error(message)

  // Special handling for auth errors
  if (response.status === 401) {
    localStorage.removeItem('token')
    router.push('/login')
  }

  // Log full error in development
  if (config.isDevelopment) {
    console.error('API Error:', errorData)
  }
}
```

---

## MCP Tool Error Format

MCP tools must return errors in this format:

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
    "timestamp": "2024-12-25T10:30:00Z",
    "tool": "complete_task"
  }
}
```

---

## Logging Strategy

### What to Log

```python
# INFO level - Business events
logger.info(f"Task created: task_id={task_id}, user_id={user_id}")
logger.info(f"User logged in: user_id={user_id}")

# WARNING level - Recoverable errors
logger.warning(f"Failed login attempt: email={email}")
logger.warning(f"Rate limit exceeded: user_id={user_id}")

# ERROR level - Errors requiring attention
logger.error(f"Database connection failed: {error}", exc_info=True)
logger.error(f"MCP tool error: tool={tool_name}, error={error}", exc_info=True)

# DEBUG level - Detailed debugging info (development only)
logger.debug(f"MCP tool called: tool={tool_name}, params={params}")
logger.debug(f"Database query: {query}")
```

### Log Format

```python
# Production
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s',
    handlers=[
        logging.StreamHandler(),  # Kubernetes captures stdout
    ]
)

# Development
logging.basicConfig(
    level=logging.DEBUG,
    format='%(asctime)s - %(name)s - %(levelname)s - %(filename)s:%(lineno)d - %(message)s'
)
```

---

## References

- [CONSTITUTION.md - Section XIII](../../.specify/memory/constitution.md#xiii-architectural-decisions)
- [SPECIFICATION.md - Phase II](../../../SPECIFICATION.md#phase-ii-full-stack-web-application-specification)
- [SPECIFICATION.md - Phase III](../../../SPECIFICATION.md#phase-iii-ai-chatbot-specification)

---

**Version**: 1.0.0
**Last Updated**: 2025-12-25
