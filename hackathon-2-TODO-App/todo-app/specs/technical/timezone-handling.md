# Timezone Handling Strategy

**Project**: Evolution of Todo
**Purpose**: Consistent timezone handling to prevent bugs and ensure correct time display
**Principle**: Store UTC, Display Local
**Last Updated**: 2025-12-25

---

## Core Principles

✅ **Storage**: Always UTC in database
✅ **API Transmission**: ISO 8601 format with Z suffix
✅ **Display**: Convert to user's local timezone in frontend
✅ **Input**: Accept user's local time, convert to UTC before storage
✅ **Natural Language**: Parse relative to user's timezone, store as UTC

---

## Database Schema

### Column Type

```sql
-- Use TIMESTAMP WITHOUT TIME ZONE (stores raw timestamp)
-- Application layer always provides UTC timestamps
created_at TIMESTAMP DEFAULT (NOW() AT TIME ZONE 'UTC')
updated_at TIMESTAMP DEFAULT (NOW() AT TIME ZONE 'UTC')
due_date TIMESTAMP
remind_at TIMESTAMP
```

**Why NOT `TIMESTAMP WITH TIME ZONE`?**
- We always store UTC, so timezone info is redundant
- Simpler to reason about
- Prevents PostgreSQL from doing implicit timezone conversions

---

## Backend (Python/FastAPI)

### Always Use UTC

```python
from datetime import datetime, timezone

# GOOD: Create UTC timestamp
def get_current_time() -> datetime:
    return datetime.now(timezone.utc)

# BAD: Local timezone (don't do this)
def get_current_time() -> datetime:
    return datetime.now()  # Uses local timezone!
```

### Parsing User Input

```python
from datetime import datetime, timezone

def parse_due_date(due_date_str: str) -> datetime:
    """
    Parse ISO 8601 string from frontend.

    Accepts: "2024-12-25T14:30:00-05:00" (user's timezone)
    Returns: datetime in UTC
    """
    dt = datetime.fromisoformat(due_date_str)
    return dt.astimezone(timezone.utc)

# Example
user_input = "2024-12-25T14:30:00-05:00"  # 2:30 PM EST
utc_time = parse_due_date(user_input)
# Result: 2024-12-25T19:30:00+00:00 (7:30 PM UTC)
```

### Serializing for API Response

```python
from datetime import datetime, timezone

def serialize_datetime(dt: datetime) -> str:
    """
    Serialize datetime for API response.

    Returns: ISO 8601 string with Z suffix (UTC)
    """
    if dt.tzinfo is None:
        # If naive datetime, assume it's UTC
        dt = dt.replace(tzinfo=timezone.utc)
    else:
        # Convert to UTC if not already
        dt = dt.astimezone(timezone.utc)

    # Replace +00:00 with Z for cleaner format
    return dt.isoformat().replace('+00:00', 'Z')

# Example
utc_time = datetime.now(timezone.utc)
api_response = serialize_datetime(utc_time)
# Result: "2024-12-25T10:30:00Z"
```

### SQLModel Integration

```python
from sqlmodel import Field, SQLModel
from datetime import datetime, timezone
from typing import Optional

class Task(SQLModel, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    title: str
    user_id: str
    due_date: Optional[datetime] = None
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))
    updated_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

    # Pydantic model config
    class Config:
        json_encoders = {
            datetime: lambda dt: dt.isoformat().replace('+00:00', 'Z')
        }
```

---

## Frontend (TypeScript/Next.js)

### Display in User's Timezone

```typescript
// Automatically uses browser's timezone
function formatTaskDate(isoString: string): string {
  const date = new Date(isoString)
  return date.toLocaleString() // "12/25/2024, 2:30 PM"
}

// More control over format
function formatTaskDateCustom(isoString: string): string {
  const date = new Date(isoString)
  return new Intl.DateTimeFormat('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: 'numeric',
    minute: 'numeric',
    hour12: true
  }).format(date)
  // "Dec 25, 2024, 2:30 PM"
}

// Relative time
function formatRelativeTime(isoString: string): string {
  const date = new Date(isoString)
  const now = new Date()
  const diffMs = date.getTime() - now.getTime()
  const diffMins = Math.floor(diffMs / 60000)

  if (diffMins < 0) return 'overdue'
  if (diffMins < 60) return `in ${diffMins} minutes`
  if (diffMins < 1440) return `in ${Math.floor(diffMins / 60)} hours`
  return `in ${Math.floor(diffMins / 1440)} days`
}
```

### Sending to API

```typescript
// Parse user input and send as ISO string
function createDueDate(userInput: string): string {
  // User enters: "2024-12-25 2:30 PM" (local time)
  const date = new Date(userInput)
  return date.toISOString()
  // Sends: "2024-12-25T14:30:00.000Z" (or with timezone offset)
}

// With date picker library (e.g., react-datepicker)
import DatePicker from 'react-datepicker'

function TaskForm() {
  const [dueDate, setDueDate] = useState<Date | null>(null)

  const handleSubmit = async () => {
    const payload = {
      title: 'Buy groceries',
      due_date: dueDate?.toISOString() // Automatically in UTC
    }
    await api.createTask(userId, payload)
  }

  return (
    <DatePicker
      selected={dueDate}
      onChange={setDueDate}
      showTimeSelect
      dateFormat="Pp"
    />
  )
}
```

---

## Natural Language Date Parsing (Phase III+)

### Backend: dateparser Library

```python
import dateparser
from datetime import datetime, timezone

def parse_natural_language_date(text: str, user_timezone: str = 'UTC') -> datetime:
    """
    Parse natural language date relative to user's timezone.

    Accepts: "tomorrow at 3pm", "next Monday", "in 2 hours"
    Returns: datetime in UTC
    """
    settings = {
        'TIMEZONE': user_timezone,  # User's timezone
        'RETURN_AS_TIMEZONE_AWARE': True,
        'TO_TIMEZONE': 'UTC'  # Convert result to UTC
    }

    dt = dateparser.parse(text, settings=settings)
    if not dt:
        raise ValueError(f"Could not parse date: {text}")

    return dt.astimezone(timezone.utc)

# Examples
user_timezone = 'America/New_York'

parse_natural_language_date("tomorrow at 3pm", user_timezone)
# If today is Dec 25, 2024 in EST:
# Returns: 2024-12-26T20:00:00+00:00 (3pm EST = 8pm UTC)

parse_natural_language_date("in 2 hours", user_timezone)
# Returns: current UTC time + 2 hours

parse_natural_language_date("next Monday at 9am", user_timezone)
# Returns: next Monday at 9am EST converted to UTC
```

### AI Agent Integration

```python
# System prompt for AI agent (Phase III)
SYSTEM_PROMPT = """
You are a helpful task management assistant.

When the user mentions a time, always interpret it in their timezone.
For example:
- "remind me tomorrow at 3pm" → user's local 3pm
- "due Friday" → Friday in user's timezone
- "in 2 hours" → 2 hours from now

Extract time expressions and call the appropriate MCP tool with the UTC timestamp.
"""

# MCP tool implementation
@mcp_tool_wrapper("add_task")
async def add_task(
    user_id: str,
    title: str,
    due_date_text: Optional[str] = None,
    user_timezone: str = 'UTC'
) -> Dict[str, Any]:
    # Parse natural language date
    due_date_utc = None
    if due_date_text:
        due_date_utc = parse_natural_language_date(due_date_text, user_timezone)

    # Create task with UTC timestamp
    task = await db.create_task(
        user_id=user_id,
        title=title,
        due_date=due_date_utc
    )

    return {
        "task_id": task.id,
        "title": task.title,
        "due_date": serialize_datetime(task.due_date) if task.due_date else None
    }
```

---

## Recurring Tasks (Phase V)

### Calculate Next Occurrence

```python
from dateutil.relativedelta import relativedelta
from datetime import datetime, timezone

def calculate_next_occurrence(task: Task) -> datetime:
    """
    Calculate next occurrence for recurring task.
    All calculations in UTC.
    """
    now = datetime.now(timezone.utc)

    if task.recurrence_pattern == "daily":
        return now + relativedelta(days=1)
    elif task.recurrence_pattern == "weekly":
        return now + relativedelta(weeks=1)
    elif task.recurrence_pattern == "monthly":
        return now + relativedelta(months=1)
    else:
        # Custom cron pattern
        from croniter import croniter
        cron = croniter(task.recurrence_pattern, now)
        return cron.get_next(datetime)
```

---

## Reminders (Phase V)

### Scheduling with Dapr Jobs

```python
import httpx
from datetime import datetime, timezone

async def schedule_reminder(task_id: int, user_id: str, remind_at: datetime):
    """
    Schedule reminder via Dapr Jobs API.
    remind_at must be in UTC.
    """
    if remind_at.tzinfo is None:
        remind_at = remind_at.replace(tzinfo=timezone.utc)

    # Dapr expects ISO 8601 format
    due_time = remind_at.isoformat()

    await httpx.post(
        f"http://localhost:3500/v1.0-alpha1/jobs/reminder-task-{task_id}",
        json={
            "dueTime": due_time,  # ISO 8601 UTC
            "data": {
                "task_id": task_id,
                "user_id": user_id,
                "type": "reminder"
            }
        }
    )
```

---

## Common Pitfalls and Solutions

### ❌ Pitfall 1: Using `datetime.now()` without timezone

```python
# BAD
created_at = datetime.now()  # Naive datetime (no timezone)

# GOOD
created_at = datetime.now(timezone.utc)  # Aware datetime (UTC)
```

### ❌ Pitfall 2: Storing local time in database

```python
# BAD
task.due_date = datetime(2024, 12, 25, 14, 30)  # What timezone?

# GOOD
task.due_date = datetime(2024, 12, 25, 14, 30, tzinfo=timezone.utc)
```

### ❌ Pitfall 3: Comparing naive and aware datetimes

```python
# BAD
now = datetime.now()  # Naive
task_due = task.due_date  # Aware (from database)
if now > task_due:  # TypeError!
    ...

# GOOD
now = datetime.now(timezone.utc)  # Both aware
task_due = task.due_date
if now > task_due:  # Works!
    ...
```

### ❌ Pitfall 4: Frontend assumes API returns local time

```typescript
// BAD
const dueDate = new Date(task.due_date) // Assumes local time

// GOOD
// The API returns "2024-12-25T19:30:00Z" (UTC)
// JavaScript Date automatically converts to browser's timezone
const dueDate = new Date(task.due_date) // Correct!
```

---

## Testing Timezone Handling

### Backend Tests

```python
import pytest
from datetime import datetime, timezone

def test_serialize_datetime_utc():
    dt = datetime(2024, 12, 25, 10, 30, tzinfo=timezone.utc)
    result = serialize_datetime(dt)
    assert result == "2024-12-25T10:30:00Z"

def test_parse_due_date_with_timezone():
    # User in EST (-05:00)
    user_input = "2024-12-25T14:30:00-05:00"
    utc_time = parse_due_date(user_input)

    # Should convert to UTC (19:30)
    assert utc_time.hour == 19
    assert utc_time.tzinfo == timezone.utc
```

### Frontend Tests

```typescript
import { formatTaskDate } from '@/lib/utils'

test('formats UTC date to local timezone', () => {
  const utcDate = '2024-12-25T19:30:00Z'
  const formatted = formatTaskDate(utcDate)

  // Result depends on test machine's timezone
  // In EST: "12/25/2024, 2:30 PM"
  // In UTC: "12/25/2024, 7:30 PM"
  expect(formatted).toContain('12/25/2024')
})
```

---

## References

- [Python datetime documentation](https://docs.python.org/3/library/datetime.html)
- [MDN: Date](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Date)
- [ISO 8601 Standard](https://en.wikipedia.org/wiki/ISO_8601)
- [dateparser library](https://github.com/scrapinghub/dateparser)
- [CONSTITUTION.md - Timezone Handling](../../.specify/memory/constitution.md#timezone-handling)

---

**Version**: 1.0.0
**Last Updated**: 2025-12-25
