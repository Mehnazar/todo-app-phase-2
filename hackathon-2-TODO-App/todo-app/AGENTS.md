# AI Agent Workflow and Behavior

**Project**: Evolution of Todo
**Development Method**: Spec-Driven Development (SDD)
**Primary Agent**: Claude Code + Spec-Kit Plus

---

## Agent Role and Responsibilities

### Primary Agent: Claude Code

Claude Code serves as the **exclusive implementation agent** for this project, following strict Spec-Driven Development principles.

**Responsibilities**:
1. Generate 100% of implementation code from specifications
2. Ensure code matches specifications exactly
3. Follow constitution principles and coding standards
4. Create type-safe, well-documented code
5. Validate acceptance criteria are met

**Prohibited Actions**:
- Manual code writing by humans (except specs and configuration)
- Deviating from specifications
- Making architectural decisions not in specs
- Adding features not explicitly specified

---

## Agent Workflow

### Phase-by-Phase Workflow

```
┌─────────────────────────────────────────────────────────────┐
│  1. SPECIFICATION PHASE                                      │
│     - User provides/refines feature specification           │
│     - Agent validates specification completeness            │
│     - Agent identifies missing requirements                 │
│     - Output: Complete feature specification document       │
└─────────────────────────────────────────────────────────────┘
                             ↓
┌─────────────────────────────────────────────────────────────┐
│  2. PLANNING PHASE (for complex features)                   │
│     - Agent creates technical implementation plan           │
│     - Agent identifies architectural decisions              │
│     - Agent suggests ADRs for significant decisions         │
│     - Output: Implementation plan, ADR suggestions          │
└─────────────────────────────────────────────────────────────┘
                             ↓
┌─────────────────────────────────────────────────────────────┐
│  3. TASK BREAKDOWN PHASE                                    │
│     - Agent breaks plan into testable tasks                 │
│     - Agent creates acceptance criteria per task            │
│     - Agent identifies dependencies                         │
│     - Output: Task list with acceptance tests               │
└─────────────────────────────────────────────────────────────┘
                             ↓
┌─────────────────────────────────────────────────────────────┐
│  4. IMPLEMENTATION PHASE                                    │
│     - Agent generates code from specifications              │
│     - Agent ensures type safety and documentation           │
│     - Agent validates against acceptance criteria           │
│     - Output: Working code that matches specification       │
└─────────────────────────────────────────────────────────────┘
                             ↓
┌─────────────────────────────────────────────────────────────┐
│  5. VALIDATION PHASE                                        │
│     - Agent runs tests against acceptance criteria          │
│     - Agent verifies code matches specification             │
│     - Agent creates Prompt History Record (PHR)             │
│     - Output: Validated implementation, PHR document        │
└─────────────────────────────────────────────────────────────┘
```

---

## Agent Behavior Guidelines

### 1. Specification Interpretation

**When Agent Encounters**:
- **Ambiguous Requirements** → Ask clarifying questions, don't assume
- **Missing Details** → Request specific information from user
- **Conflicting Requirements** → Highlight conflict, request resolution
- **Incomplete Acceptance Criteria** → Suggest additional criteria

**Example**:
```
User: "Add authentication to the app"

Agent Response:
"I need clarification on authentication requirements:
1. Which authentication method? (JWT, session-based, OAuth)
2. Password requirements? (min length, complexity)
3. Token expiration time?
4. Password reset functionality needed?

Please specify so I can create accurate implementation."
```

### 2. Code Generation Principles

**Always**:
- ✅ Generate code that exactly matches specification
- ✅ Include type hints on all functions (Python 3.13+)
- ✅ Add docstrings explaining WHY (not just WHAT)
- ✅ Follow language-specific best practices
- ✅ Validate inputs at boundaries
- ✅ Handle errors gracefully
- ✅ Reference specification section in file headers

**Never**:
- ❌ Add features not in specification
- ❌ Make assumptions about requirements
- ❌ Hardcode secrets or configuration
- ❌ Write code without type safety
- ❌ Skip error handling
- ❌ Use global state or mutable shared state

### 3. Constitution Adherence

Agent must enforce constitutional principles:

1. **Spec-First Development**: Refuse to code without specification
2. **Stateless Architecture**: Generate only stateless, scalable services
3. **Security-First**: Include auth/validation at all boundaries
4. **Event-Driven**: Use events for service communication (Phase III+)
5. **Type Safety**: Full type hints in Python, strict TypeScript

### 4. Error Handling Strategy

**Input Validation**:
```python
# Agent-generated validation pattern
def add_task(title: str, description: str = "") -> Task:
    """
    Create task with validated inputs.

    Raises:
        ValueError: If title empty or exceeds 200 chars
        ValueError: If description exceeds 1000 chars
    """
    if not title or len(title) == 0:
        raise ValueError("Title cannot be empty.")
    if len(title) > 200:
        raise ValueError("Title must be 200 characters or less.")
    # ... implementation
```

**Graceful Degradation**:
- Return `None` for not-found items (don't raise)
- Use `Optional[T]` return types
- Provide clear error messages to users

### 5. Documentation Standards

**File Headers**:
```python
"""
Module description and purpose.

References: specs/phase-X/feature-name.md#section
"""
```

**Function Docstrings**:
```python
def function_name(param: Type) -> ReturnType:
    """
    Brief description of what function does.

    Explain WHY this function exists (business logic),
    not just mechanics of how it works.

    Args:
        param: Description of parameter purpose

    Returns:
        Description of return value

    Raises:
        ExceptionType: When and why this is raised
    """
```

---

## Agent Decision Trees

### Decision 1: Should I Create an ADR?

```
Is this decision:
├─ Impactful (long-term consequences)? AND
├─ Has alternatives (multiple valid options)? AND
└─ Cross-cutting (affects system design)?

YES → Suggest ADR to user, wait for approval
NO  → Implement according to spec
```

### Decision 2: Should I Ask the User?

```
Do I have:
├─ Complete requirements?
├─ Clear acceptance criteria?
└─ No conflicting constraints?

YES → Proceed with implementation
NO  → Ask targeted questions, request clarification
```

### Decision 3: Should I Refuse to Implement?

```
Does request:
├─ Violate constitution principles?
├─ Lack specification?
└─ Contradict existing spec?

YES → Politely refuse, explain why, suggest fix
NO  → Proceed with implementation
```

---

## Human-Agent Collaboration

### User Responsibilities

1. **Provide Specifications** - Clear, complete feature requirements
2. **Make Decisions** - Choose between valid architectural options
3. **Review Output** - Verify generated code matches intent
4. **Refine Specs** - Update specifications when issues found

### Agent Responsibilities

1. **Ask Questions** - Clarify ambiguous requirements
2. **Generate Code** - Produce type-safe, documented implementation
3. **Validate Output** - Ensure code matches specifications
4. **Document Decisions** - Create PHRs and suggest ADRs

### Collaboration Pattern

```
User: Provides specification
  ↓
Agent: Asks clarifying questions
  ↓
User: Provides answers
  ↓
Agent: Generates implementation
  ↓
User: Tests and reviews
  ↓
Agent: Creates PHR documenting process
  ↓
User: Approves or requests refinement
  ↓
[Repeat if refinement needed]
```

---

## Quality Assurance

### Agent Self-Checks

Before submitting code, agent verifies:

- [ ] Code matches specification exactly
- [ ] All acceptance criteria met
- [ ] Type hints present on all functions
- [ ] Docstrings explain WHY, not just WHAT
- [ ] Error handling covers edge cases
- [ ] No hardcoded secrets or config
- [ ] File references specification section
- [ ] Constitution principles followed

### Agent Testing Protocol

1. **Functional Testing** - Verify each feature works
2. **Validation Testing** - Test input validation rules
3. **Error Handling Testing** - Test error scenarios
4. **Edge Case Testing** - Test boundary conditions

---

## Prompt History Records (PHRs)

Agent creates PHR after every significant interaction:

**When to Create PHR**:
- After implementing new feature
- After planning session
- After architectural decision
- After debugging session
- After specification refinement

**PHR Contents**:
- User prompt (verbatim)
- Agent response summary
- Files created/modified
- Tests performed
- Outcome and reflection
- Next steps

**PHR Location**:
```
history/prompts/
├── constitution/        # Constitution-related prompts
├── phase-1/            # Phase I feature prompts
├── phase-2/            # Phase II feature prompts
└── general/            # Non-feature-specific prompts
```

---

## Anti-Patterns to Avoid

### ❌ Anti-Pattern 1: Assuming Requirements

**Wrong**:
```
User: "Add authentication"
Agent: [Generates JWT-based auth without asking]
```

**Correct**:
```
User: "Add authentication"
Agent: "I need clarification: JWT or session-based?
        Token expiration? Password requirements?"
```

### ❌ Anti-Pattern 2: Over-Engineering

**Wrong**:
```python
# Adding features not in spec
def add_task(title: str, priority: str = "medium",
             tags: list[str] = [], due_date: datetime = None):
    # Priority, tags, due_date not in Phase I spec!
```

**Correct**:
```python
# Exactly what spec requires
def add_task(title: str, description: str = "") -> Task:
    # Only title and description in Phase I spec
```

### ❌ Anti-Pattern 3: Ignoring Constitution

**Wrong**:
```python
# Global mutable state (violates stateless principle)
current_user = None
tasks = {}

def set_current_user(user):
    global current_user
    current_user = user
```

**Correct**:
```python
# Stateless design, user passed as parameter
class TaskManager:
    def get_user_tasks(self, user_id: str) -> list[Task]:
        # Query database filtered by user_id
```

---

## Technical Standards

Before implementing any feature, agents must verify compliance with these technical standards:

### 1. Error Handling Standards ✅

**Requirement**: Every API endpoint and MCP tool must return standardized error format

**Reference**: [specs/technical/error-codes.md](specs/technical/error-codes.md)

**Checklist**:
- [ ] API endpoints return HTTP status codes per standard (200, 201, 400, 401, 403, 404, 422, 500, 503)
- [ ] Error responses include `code`, `message`, `details`, and `timestamp`
- [ ] User-friendly error messages (no technical details in production)
- [ ] MCP tools return `{success, data/error, metadata}` format
- [ ] All error codes defined in error-codes.md

**Example**:
```python
# API endpoint error
raise HTTPException(
    status_code=404,
    detail={
        "error": {
            "code": "TASK_NOT_FOUND",
            "message": "Task not found. It may have been deleted.",
            "details": {"task_id": task_id},
            "timestamp": datetime.now(timezone.utc).isoformat()
        }
    }
)

# MCP tool error
return {
    "success": False,
    "error": {
        "code": "TASK_NOT_FOUND",
        "message": "Task with ID 123 does not exist",
        "details": {"task_id": 123, "user_id": user_id}
    },
    "metadata": {"timestamp": "...", "tool": "complete_task"}
}
```

### 2. Database Changes Standards ✅

**Requirement**: All database schema changes must follow migration workflow

**Reference**: [specs/technical/database-migrations.md](specs/technical/database-migrations.md)

**Checklist**:
- [ ] Create Alembic migration before schema changes: `alembic revision -m "description"`
- [ ] Test upgrade AND downgrade: `alembic upgrade head` and `alembic downgrade -1`
- [ ] Zero-downtime migrations (add columns with defaults, never drop immediately)
- [ ] Migration includes both `upgrade()` and `downgrade()` functions
- [ ] Test migration on development database before production

**Example**:
```bash
# Workflow
1. Modify SQLModel models
2. alembic revision --autogenerate -m "add priority column"
3. Review generated migration file
4. alembic upgrade head (test)
5. alembic downgrade -1 (test rollback)
6. alembic upgrade head (re-test)
7. Commit migration file
```

### 3. Environment Configuration Standards ✅

**Requirement**: Never hardcode URLs, API keys, or secrets

**Reference**: [specs/technical/environment-config.md](specs/technical/environment-config.md)

**Checklist**:
- [ ] All config from environment variables
- [ ] Use appropriate config source (`.env` local, ConfigMap/Secret in K8s)
- [ ] Add new variables to `.env.example`
- [ ] Document required vs optional variables
- [ ] Different secrets for each environment

**Example**:
```python
# Backend
DATABASE_URL = os.getenv("DATABASE_URL")
if not DATABASE_URL:
    raise RuntimeError("DATABASE_URL environment variable is required")

# Frontend
const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'
```

### 4. Timezone Handling Standards ✅

**Requirement**: Store UTC, display local

**Reference**: [specs/technical/timezone-handling.md](specs/technical/timezone-handling.md)

**Checklist**:
- [ ] All timestamps stored as UTC in database
- [ ] API transmits ISO 8601 with Z suffix
- [ ] Frontend converts to user's local timezone for display
- [ ] User input converted to UTC before storage
- [ ] Use `datetime.now(timezone.utc)` not `datetime.now()`

**Example**:
```python
# Backend: Always UTC
from datetime import datetime, timezone

created_at = datetime.now(timezone.utc)

def serialize_datetime(dt: datetime) -> str:
    return dt.replace(tzinfo=timezone.utc).isoformat().replace('+00:00', 'Z')

# Frontend: Display local
function formatDate(isoString: string): string {
  return new Date(isoString).toLocaleString()
}
```

### 5. Authentication Standards ✅

**Requirement**: Follow authentication architecture from CONSTITUTION.md

**Reference**: [CONSTITUTION.md - Section XIII](.specify/memory/constitution.md#authentication-strategy)

**Checklist**:
- [ ] JWT in `Authorization: Bearer <token>` header
- [ ] 7-day token expiration (no refresh tokens)
- [ ] Password requirements: 8+ chars, mixed case, number
- [ ] All API endpoints require valid token (except auth endpoints)
- [ ] User can only access their own data (check user_id)

**Example**:
```python
# Dependency for FastAPI
async def get_current_user(token: str = Depends(oauth2_scheme)) -> User:
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=["HS256"])
        user_id = payload.get("sub")
        if not user_id:
            raise HTTPException(status_code=401, detail="Invalid token")
        return await get_user(user_id)
    except JWTError:
        raise HTTPException(status_code=401, detail="Invalid token")
```

---

## Agent Pre-Implementation Checklist

Before generating code for any feature, agent must:

1. ✅ **Read relevant specifications**
   - Feature spec in `specs/phase-X/`
   - Technical specs in `specs/technical/`
   - Constitution principles

2. ✅ **Identify applicable standards**
   - Does this involve database changes? → Check database-migrations.md
   - Does this involve API errors? → Check error-codes.md
   - Does this involve timestamps? → Check timezone-handling.md
   - Does this need config? → Check environment-config.md
   - Does this need auth? → Check CONSTITUTION.md Section XIII

3. ✅ **Verify all code follows standards**
   - Error handling: Standardized format
   - Database: Migration created and tested
   - Config: No hardcoded values
   - Timezone: All UTC in storage
   - Auth: JWT required, user isolation enforced

4. ✅ **Document references in code**
   - File header: References spec section
   - Comments: Explain WHY, not WHAT

---

## Success Metrics

Agent effectiveness measured by:

1. **Specification Adherence**: 100% of features match spec
2. **First-Pass Success**: Code works without spec refinement
3. **Type Safety**: 100% of functions have type hints
4. **Documentation Coverage**: All functions have docstrings
5. **Constitution Compliance**: Zero violations of principles
6. **PHR Completeness**: All sessions documented

---

## Agent Evolution

As project progresses through phases:

| Phase | Agent Complexity | Additional Capabilities |
|-------|------------------|-------------------------|
| I     | Basic | Simple CRUD, input validation |
| II    | Moderate | API design, database schemas, auth |
| III   | Advanced | MCP tool creation, conversational AI |
| IV    | Expert | Container config, Helm charts, K8s |
| V     | Master | Event architecture, Dapr, production ops |

---

**This document defines agent behavior for the Evolution of Todo project. All AI agents must follow these guidelines when generating code or making decisions.**

---

**Version**: 1.0.0
**Last Updated**: 2025-12-25
**References**: [CONSTITUTION.md](.specify/memory/constitution.md), [CLAUDE.md](CLAUDE.md)
