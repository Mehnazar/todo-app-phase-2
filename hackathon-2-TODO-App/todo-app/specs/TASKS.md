# Evolution of Todo - Task Breakdown (All Phases)

**Project**: Evolution of Todo
**Development Method**: Spec-Driven Development (SDD)
**Based on**: `SPECIFICATION.md`, `CONSTITUTION.md`, `TECHNICAL-PLAN.md`
**Version**: 1.0.0
**Created**: 2025-12-25

---

## Document Purpose

This document breaks down all 5 phases of the Evolution of Todo project into **atomic, testable tasks** following Spec-Driven Development principles. Each task:
- Has clear acceptance criteria
- References authoritative specifications
- Includes duration estimates
- Documents dependencies
- Specifies outputs

---

## Task Execution Workflow

```
┌─────────────────────────────────────────────────────────────┐
│  1. READ TASK SPECIFICATION                                 │
│     - Understand what to do                                 │
│     - Review referenced specs                               │
│     - Check dependencies completed                          │
└─────────────────────────────────────────────────────────────┘
                             ↓
┌─────────────────────────────────────────────────────────────┐
│  2. CLARIFY IF NEEDED                                       │
│     - Ask questions if ambiguous                            │
│     - Refine acceptance criteria                            │
│     - Update task if needed                                 │
└─────────────────────────────────────────────────────────────┘
                             ↓
┌─────────────────────────────────────────────────────────────┐
│  3. EXECUTE TASK                                            │
│     - Follow specification exactly                          │
│     - Use Claude Code for implementation                    │
│     - Document iterations in CLAUDE.md                      │
└─────────────────────────────────────────────────────────────┘
                             ↓
┌─────────────────────────────────────────────────────────────┐
│  4. VALIDATE ACCEPTANCE CRITERIA                            │
│     - Test all acceptance criteria                          │
│     - Fix issues if criteria not met                        │
│     - Re-test until all pass                                │
└─────────────────────────────────────────────────────────────┘
                             ↓
┌─────────────────────────────────────────────────────────────┐
│  5. CREATE PHR                                              │
│     - Document prompt and response                          │
│     - List files created/modified                           │
│     - Record outcome and next steps                         │
└─────────────────────────────────────────────────────────────┘
                             ↓
┌─────────────────────────────────────────────────────────────┐
│  6. COMMIT TO VERSION CONTROL                               │
│     - Commit with clear message                             │
│     - Reference task ID in commit                           │
│     - Push to repository                                    │
└─────────────────────────────────────────────────────────────┘
```

---

## PHASE I: CONSOLE APPLICATION

### Phase I Overview

**Total Duration:** 5-7 hours
**Tasks:** 9
**Checkpoint:** After Task I-5.2 (Complete demo and documentation)
**Output:** Working console todo app with all 5 basic features
**Status:** ✅ COMPLETE

---

### Task I-1.2: Write Task Data Model Specification

**ID:** I-1.2
**Duration:** 30 minutes
**Depends on:** Nothing (Project setup already complete)
**Priority:** High
**Spec Reference:** `SPECIFICATION.md` Phase I - Data Models

**Description:**
Create comprehensive specification for Task data model including all fields, validation rules, and ID generation strategy.

**What to do:**
1. Create `specs/features/phase1-data-model.md`
2. Define Task structure with all fields (id, title, description, completed)
3. Specify validation rules:
   - Title: 1-200 characters after strip()
   - Description: max 1000 characters
   - ID: sequential integers starting at 1
4. Define ID generation strategy
5. Document TypedDict approach (Python 3.13+)
6. Provide examples for valid and invalid inputs

**Acceptance Criteria:**
- [ ] All Task fields documented with types and constraints
- [ ] Validation rules clearly specified
- [ ] ID generation strategy defined (sequential, starts at 1)
- [ ] Examples provided for valid and invalid inputs
- [ ] TypedDict approach documented

**Output:**
- `specs/features/phase1-data-model.md` with complete specification

**Notes:**
- This is the foundation for all data operations
- Validation rules must be precise (will be enforced in code)

---

### Task I-1.3: Implement Task Dataclass Using Claude Code

**ID:** I-1.3
**Duration:** 30 minutes
**Depends on:** Task I-1.2
**Priority:** High
**Spec Reference:** `specs/features/phase1-data-model.md`

**Description:**
Use Claude Code to generate Task TypedDict with validation functions following the specification exactly.

**What to do:**
1. Prompt Claude Code: "Implement the Task data model specified in specs/features/phase1-data-model.md"
2. Review generated Task TypedDict
3. Review validation functions (create_task, validate_title, validate_description)
4. Test validation logic manually
5. If validation incorrect, refine spec and regenerate
6. Document iterations in `history/prompts/phase-1/`

**Acceptance Criteria:**
- [ ] Task TypedDict has all required fields with type hints
- [ ] create_task function validates and creates Task
- [ ] Title validation: raises ValueError if empty or >200 chars after strip()
- [ ] Description validation: raises ValueError if >1000 chars
- [ ] Code generated by Claude Code (no manual writing)
- [ ] Iterations documented in PHR

**Output:**
- `src/phase-1/models.py` with Task TypedDict and validation functions
- PHR in `history/prompts/phase-1/`

**Notes:**
- Use create_task function for all task creation (enforces validation)
- ValueError messages should be user-friendly

---

### Task I-2.1: Write Storage Manager Specification

**ID:** I-2.1
**Duration:** 30 minutes
**Depends on:** Task I-1.3
**Priority:** High
**Spec Reference:** `SPECIFICATION.md` Phase I - Core Operations

**Description:**
Create specification for TaskManager class that handles in-memory storage and all CRUD operations.

**What to do:**
1. Create `specs/features/phase1-storage.md`
2. Define TaskManager class structure
3. Specify storage mechanism (Dict[int, Task])
4. Specify all CRUD methods:
   - add_task(title, description) -> Task
   - get_task(task_id) -> Optional[Task]
   - list_tasks() -> list[Task]
   - update_task(task_id, title?, description?) -> Optional[Task]
   - delete_task(task_id) -> Optional[Task]
   - toggle_complete(task_id) -> Optional[Task]
5. Define ID generation logic (next_id counter)
6. Document return types and error handling (None for not found)

**Acceptance Criteria:**
- [ ] TaskManager class structure documented
- [ ] All CRUD methods specified with parameters and return types
- [ ] ID generation logic clear (sequential, increments by 1)
- [ ] Error handling defined (return None for task not found)
- [ ] Storage mechanism documented (in-memory Dict)

**Output:**
- `specs/features/phase1-storage.md` with complete TaskManager specification

**Notes:**
- Return None instead of raising exceptions for not-found scenarios
- Use Optional[Task] return type for methods that might not find task

---

### Task I-2.2: Implement Storage Manager Using Claude Code

**ID:** I-2.2
**Duration:** 45 minutes
**Depends on:** Task I-2.1
**Priority:** High
**Spec Reference:** `specs/features/phase1-storage.md`

**Description:**
Use Claude Code to generate TaskManager class with all CRUD operations following the specification.

**What to do:**
1. Prompt Claude Code with storage spec
2. Review generated TaskManager class
3. Test ID generation (verify starts at 1, increments correctly)
4. Test all CRUD operations manually:
   - Create task, verify ID=1
   - Create another, verify ID=2
   - Get existing task, verify returns task
   - Get non-existent task, verify returns None
   - Update task, verify fields changed
   - Delete task, verify removed
   - Toggle complete, verify status changed
5. Refine spec if behavior incorrect, regenerate

**Acceptance Criteria:**
- [ ] TaskManager initializes with empty dict and next_id=1
- [ ] add_task creates task with correct ID and increments next_id
- [ ] get_task returns Task if exists, None otherwise
- [ ] list_tasks returns all tasks as list
- [ ] update_task updates fields and returns updated Task (or None if not found)
- [ ] delete_task removes task and returns it (or None if not found)
- [ ] toggle_complete flips completed status (or returns None if not found)
- [ ] All methods have correct type hints

**Output:**
- `src/phase-1/task_manager.py` with TaskManager class
- PHR in `history/prompts/phase-1/`

**Notes:**
- Keep update_task flexible (None parameter = no change to that field)
- Maintain insertion order for list_tasks (dict preserves order in Python 3.7+)

---

### Task I-3.1: Write All Feature Specifications

**ID:** I-3.1
**Duration:** 60 minutes
**Depends on:** Task I-2.2
**Priority:** High
**Spec Reference:** `SPECIFICATION.md` Phase I - Required Features

**Description:**
Create detailed specifications for all 5 user-facing features, documenting interaction flows, messages, and error handling.

**What to do:**
1. Create `specs/features/add-task.md`:
   - User interaction flow
   - Input prompts
   - Validation behavior
   - Success/error messages
2. Create `specs/features/view-tasks.md`:
   - Display format (numbered list)
   - Empty state message
   - Status indicators (✓ for complete, ☐ for incomplete)
3. Create `specs/features/update-task.md`:
   - ID input and validation
   - Field update prompts (Enter to keep existing)
   - Confirmation messages
4. Create `specs/features/delete-task.md`:
   - Confirmation prompt (y/n)
   - Cancel option
   - Success message
5. Create `specs/features/toggle-complete.md`:
   - ID input
   - Status toggle behavior
   - Visual feedback

**Acceptance Criteria:**
- [ ] All 5 feature specs created
- [ ] Each spec has complete user interaction flow documented
- [ ] Input/output examples provided
- [ ] Error scenarios covered (invalid ID, validation errors)
- [ ] Success/error messages specified exactly

**Output:**
- `specs/features/add-task.md`
- `specs/features/view-tasks.md`
- `specs/features/update-task.md`
- `specs/features/delete-task.md`
- `specs/features/toggle-complete.md`

**Notes:**
- Messages should be user-friendly (not technical)
- Be specific about wording (will be used verbatim in implementation)

---

### Task I-3.2: Implement All Operation Functions Using Claude Code

**ID:** I-3.2
**Duration:** 90 minutes
**Depends on:** Task I-3.1
**Priority:** High
**Spec Reference:** All feature specs in `specs/features/`

**Description:**
Use Claude Code to implement all 5 interactive functions that handle user input and call TaskManager methods.

**What to do:**
1. For each feature spec, prompt Claude Code to implement
2. Implement add_task_interactive(manager) function
3. Implement view_tasks(manager) function
4. Implement update_task_interactive(manager) function
5. Implement delete_task_interactive(manager) function
6. Implement toggle_complete_interactive(manager) function
7. Test each function manually in Python REPL
8. Verify messages match specifications exactly
9. Document iterations in PHR

**Acceptance Criteria:**
- [ ] All 5 functions implemented in `src/phase-1/main.py`
- [ ] Each function matches its specification exactly
- [ ] Input validation implemented per specs
- [ ] User-friendly error messages display (match spec wording)
- [ ] Success confirmations display (match spec wording)
- [ ] No manual code writing (Claude Code generated all code)
- [ ] UTF-8 encoding configured for Windows (if needed)

**Output:**
- Updated `src/phase-1/main.py` with all 5 interactive functions
- PHR in `history/prompts/phase-1/`

**Notes:**
- Test on Windows to verify Unicode characters (✓, ☐) display correctly
- Add UTF-8 encoding fix if needed (see Phase I implementation example)

---

### Task I-4.1: Write Menu System Specification

**ID:** I-4.1
**Duration:** 30 minutes
**Depends on:** Task I-3.2
**Priority:** High
**Spec Reference:** `SPECIFICATION.md` Phase I - User Interface

**Description:**
Create specification for menu system that provides navigation between all features.

**What to do:**
1. Create `specs/features/menu-system.md`
2. Define 6 menu options:
   1. Add Task
   2. View All Tasks
   3. Update Task
   4. Delete Task
   5. Toggle Task Completion
   6. Exit
3. Specify navigation flow (display menu → execute choice → display menu again)
4. Define input validation (must be 1-6, integer only)
5. Document exit mechanism (option 6)
6. Specify invalid input handling (error message, re-display menu)

**Acceptance Criteria:**
- [ ] All 6 menu options listed with exact numbers
- [ ] Navigation flow clear (loop until exit)
- [ ] Input validation rules specified (1-6 only)
- [ ] Exit option (#6) documented
- [ ] Error messages for invalid input specified
- [ ] Welcome message specified

**Output:**
- `specs/features/menu-system.md` with complete menu specification

**Notes:**
- Menu should be simple and intuitive
- Numbers must match exactly (1-6)

---

### Task I-4.2: Implement Menu System Using Claude Code

**ID:** I-4.2
**Duration:** 45 minutes
**Depends on:** Task I-4.1
**Priority:** High
**Spec Reference:** `specs/features/menu-system.md`

**Description:**
Use Claude Code to implement main menu loop that connects all features.

**What to do:**
1. Prompt Claude Code with menu spec
2. Implement main() function with menu loop in `main.py`
3. Connect menu options to operation functions
4. Add welcome message
5. Test navigation flow:
   - Select each option 1-5, verify correct function called
   - Enter invalid input (0, 7, 'a'), verify error shown
   - Select option 6, verify program exits gracefully
6. Test complete user flow (add → view → update → delete → exit)

**Acceptance Criteria:**
- [ ] Menu displays all 6 options clearly
- [ ] Each option (1-5) calls correct function
- [ ] Invalid input shows error and re-displays menu
- [ ] Exit option (6) terminates program gracefully
- [ ] Loop continues until user exits
- [ ] Welcome message displays on start

**Output:**
- Updated `src/phase-1/main.py` with menu system
- PHR in `history/prompts/phase-1/`

**Notes:**
- Use try-except for integer conversion (handle 'a', 'foo', etc.)
- Clear structure (while loop with break on exit)

---

### Task I-5.1: Manual Testing Against Specification

**ID:** I-5.1
**Duration:** 60 minutes
**Depends on:** Task I-4.2
**Priority:** High
**Spec Reference:** `TECHNICAL-PLAN.md` Testing Strategy Phase I

**Description:**
Comprehensive manual testing of all features against acceptance criteria in specifications.

**What to do:**
1. Test add task:
   - Valid input → task created
   - Empty title → error message
   - Title with only spaces → error message
   - Title 201 characters → error message
   - Description 1001 characters → error message
2. Test view tasks:
   - Empty list → "No tasks" message
   - List with tasks → all displayed with numbers
   - Completed task → shows ✓
   - Incomplete task → shows ☐
3. Test update task:
   - Valid ID with new title → updated
   - Valid ID with Enter (keep existing) → not changed
   - Invalid ID → error message
4. Test delete task:
   - Valid ID with 'y' → deleted
   - Valid ID with 'n' → not deleted
   - Invalid ID → error message
5. Test toggle complete:
   - Incomplete task → becomes complete
   - Complete task → becomes incomplete
   - Invalid ID → error message
6. Test menu:
   - All options (1-6) work
   - Invalid input (0, 7, 'a') → error
   - Exit (6) → terminates
7. Document all test results (pass/fail for each scenario)

**Acceptance Criteria:**
- [ ] All features work as specified
- [ ] Edge cases handled (empty input, invalid IDs, max lengths)
- [ ] Error messages clear and user-friendly
- [ ] No crashes or unhandled exceptions
- [ ] Status indicators (✓ and ☐) display correctly
- [ ] Test results documented with pass/fail for each scenario

**Output:**
- `tests/manual-test-results-phase1.md` with detailed test results

**Notes:**
- Be thorough - test every edge case mentioned in specs
- Document any bugs found and fix before proceeding

---

### Task I-5.2: Complete Documentation and Demo

**ID:** I-5.2
**Duration:** 60 minutes
**Depends on:** Task I-5.1
**Priority:** High
**Spec Reference:** Submission Requirements, `CONSTITUTION.md`

**Description:**
Create comprehensive documentation and demo video for Phase I submission.

**What to do:**
1. Update `README.md` with:
   - Project description (Evolution of Todo - Spec-Driven Development)
   - Features list (5 basic CRUD features)
   - Tech stack (Python 3.13, UV, TypedDict)
   - Setup instructions:
     - Install UV
     - Clone repository
     - Run `python src/phase-1/main.py`
   - Usage examples (screenshots or text)
   - Spec-driven development notes (how specs were used)
2. Record demo video (max 90 seconds):
   - Show all 5 features working (add, view, update, delete, toggle)
   - Show spec-driven workflow (show spec file → show generated code)
   - Add narration or text overlays explaining what's happening
   - Record in HD (1080p minimum)
3. Verify all specs committed to git
4. Create git tag: `phase-1-complete`

**Acceptance Criteria:**
- [ ] README.md complete with all sections
- [ ] Setup instructions clear and tested (follow your own instructions)
- [ ] Demo video under 90 seconds
- [ ] Demo shows all 5 features working
- [ ] Demo mentions spec-driven approach
- [ ] Video quality HD (1080p)
- [ ] All specs in /specs folder committed
- [ ] Git tag `phase-1-complete` created

**Output:**
- Updated `README.md`
- `demo-phase1.mp4` (under 90 seconds)
- All files committed with tag `phase-1-complete`

**Notes:**
- Demo video is critical for submission - make it clear and professional
- Use screen recording software (OBS, QuickTime, etc.)

---

### Phase I Checkpoint

**After Task I-5.2 Complete:**

**Status Check:**
- ✅ Console app with all 5 basic features working
- ✅ All features implemented via spec-driven development
- ✅ Manual testing passed (all scenarios)
- ✅ Documentation complete (README, specs, PHRs)
- ✅ Demo video created (under 90 seconds)

**Ready to:**
- Submit Phase I for review
- OR proceed to Phase II

**Commit:**
```bash
git add .
git commit -m "[Phase I Complete] Console todo app with CRUD operations

- All 5 features implemented (add, view, update, delete, toggle)
- Comprehensive specs in /specs/features/
- Manual testing passed
- Demo video created
- Spec-driven development documented"
git tag phase-1-complete
git push origin main --tags
```

---

## PHASE II: FULL-STACK WEB APPLICATION

### Phase II Overview

**Total Duration:** 14-18 hours
**Tasks:** 12
**Checkpoint:** After Task II-4.3 (Deploy and demo)
**Output:** Multi-user web app with authentication and persistent storage
**Status:** 📋 PLANNED

---

### Task II-1.1: Database Schema and Monorepo Setup

**ID:** II-1.1
**Duration:** 60 minutes
**Depends on:** Phase I Complete
**Priority:** High
**Spec Reference:** `SPECIFICATION.md` Phase II - Database, `CONSTITUTION.md` Section XIII

**Description:**
Create database schema specification and set up monorepo structure for frontend, backend, and infrastructure.

**What to do:**
1. Create `specs/database/schema.md` with full schema:
   - users table (id VARCHAR PRIMARY KEY, email VARCHAR UNIQUE, name VARCHAR, created_at TIMESTAMP)
   - tasks table (id SERIAL PRIMARY KEY, user_id VARCHAR FK, title VARCHAR(200), description VARCHAR(1000), completed BOOLEAN, created_at TIMESTAMP, updated_at TIMESTAMP)
   - Document foreign keys (tasks.user_id → users.id)
   - Document indexes (user_id, email, completed)
2. Create monorepo folder structure:
   ```
   /frontend (Next.js app)
   /backend (FastAPI app)
   /infrastructure (Kubernetes/Docker configs later)
   ```
3. Create `frontend/CLAUDE.md` with frontend-specific instructions
4. Create `backend/CLAUDE.md` with backend-specific instructions
5. Update root `CLAUDE.md` to reference monorepo structure

**Acceptance Criteria:**
- [ ] Schema specification complete with all tables, columns, types
- [ ] Foreign keys and indexes documented
- [ ] Alembic migration strategy documented
- [ ] Monorepo folder structure created (/frontend, /backend, /infrastructure)
- [ ] CLAUDE.md files in frontend/ and backend/
- [ ] Root CLAUDE.md updated to reference structure

**Output:**
- `specs/database/schema.md`
- Folders: `/frontend`, `/backend`, `/infrastructure`
- `frontend/CLAUDE.md`
- `backend/CLAUDE.md`
- Updated root `CLAUDE.md`

**Notes:**
- Follow CONSTITUTION.md timezone handling (all TIMESTAMP fields store UTC)
- Use VARCHAR for user_id (Better Auth default)
- Use SERIAL for task IDs (auto-increment integers)

---

### Task II-1.2: Initialize Backend with FastAPI and Database

**ID:** II-1.2
**Duration:** 90 minutes
**Depends on:** Task II-1.1
**Priority:** High
**Spec Reference:** `specs/database/schema.md`, `specs/technical/database-migrations.md`

**Description:**
Set up FastAPI backend with Neon PostgreSQL database and configure Alembic for migrations.

**What to do:**
1. Navigate to `/backend` folder
2. Initialize UV project: `uv init`
3. Install dependencies:
   ```bash
   uv add fastapi sqlmodel alembic psycopg2-binary python-jose[cryptography] passlib[bcrypt] uvicorn python-multipart
   ```
4. Create Neon database:
   - Sign up at neon.tech
   - Create new database
   - Copy connection string
5. Create `src/db.py` with database connection:
   - Configure connection pooling (pool_size=20, max_overflow=40)
   - Use DATABASE_URL from environment variable
6. Create `src/models.py` with SQLModel classes:
   - User model (matches users table)
   - Task model (matches tasks table)
7. Initialize Alembic:
   ```bash
   alembic init alembic
   ```
8. Configure Alembic to use SQLModel metadata
9. Create initial migration:
   ```bash
   alembic revision --autogenerate -m "initial schema"
   ```
10. Apply migration:
    ```bash
    alembic upgrade head
    ```
11. Verify tables created in Neon dashboard
12. Test connection: create simple script that queries database

**Acceptance Criteria:**
- [ ] FastAPI project initialized successfully
- [ ] All dependencies installed
- [ ] Neon database created and connection working
- [ ] Connection pooling configured per CONSTITUTION.md
- [ ] SQLModel classes match schema specification exactly
- [ ] Alembic configured and initial migration created
- [ ] Migration applied successfully (tables exist in Neon)
- [ ] Can run `uvicorn src.main:app` without errors
- [ ] .env.example created with required variables

**Output:**
- `backend/pyproject.toml`
- `backend/src/db.py`
- `backend/src/models.py`
- `backend/src/main.py` (basic FastAPI app)
- `backend/alembic.ini`
- `backend/alembic/env.py` (configured)
- `backend/alembic/versions/001_initial_schema.py`
- `backend/.env.example`

**Notes:**
- Store DATABASE_URL in .env file (never commit)
- Follow specs/technical/environment-config.md for .env setup
- Test migration rollback: `alembic downgrade -1`

---

*[Continuing with remaining Phase II-V tasks following same detailed structure...]*

---

## Task Status Tracking

### Phase I: Console Application
- [x] I-1.2: Write Task Data Model Specification
- [x] I-1.3: Implement Task Dataclass Using Claude Code
- [x] I-2.1: Write Storage Manager Specification
- [x] I-2.2: Implement Storage Manager Using Claude Code
- [x] I-3.1: Write All Feature Specifications
- [x] I-3.2: Implement All Operation Functions Using Claude Code
- [x] I-4.1: Write Menu System Specification
- [x] I-4.2: Implement Menu System Using Claude Code
- [x] I-5.1: Manual Testing Against Specification
- [x] I-5.2: Complete Documentation and Demo

### Phase II: Full-Stack Web Application
- [ ] II-1.1: Database Schema and Monorepo Setup
- [ ] II-1.2: Initialize Backend with FastAPI and Database
- [ ] II-2.1: Write API Endpoints Specification
- [ ] II-2.2: Implement Authentication with Better Auth
- [ ] II-2.3: Implement Task CRUD Endpoints
- [ ] II-3.1: Initialize Next.js Frontend
- [ ] II-3.2: Setup Better Auth and API Client
- [ ] II-3.3: Build Task Management UI Components
- [ ] II-3.4: Build Dashboard Page
- [ ] II-4.1: Integration, Testing and Environment Setup
- [ ] II-4.2: Deploy Backend and Frontend
- [ ] II-4.3: Complete Documentation and Demo

### Phase III: AI Chatbot
- [ ] III-1.1: MCP Tools and Conversation Schema Specification
- [ ] III-1.2: Database Migration for Conversations
- [ ] III-2.1: Setup MCP Server with Official SDK
- [ ] III-2.2: Implement All 5 MCP Tools
- [ ] III-3.1: Setup OpenAI Agents SDK
- [ ] III-3.2: Implement Stateless Chat Endpoint
- [ ] III-4.1: Setup OpenAI ChatKit Frontend
- [ ] III-4.2: Build Chat Page with Conversation History
- [ ] III-5.1: Natural Language Command Testing
- [ ] III-5.2: Deploy and Create Demo

### Phase IV & V
*[Tasks to be expanded in detail when Phase III complete]*

---

## Appendix: Task Template

Use this template when creating new tasks:

```markdown
### Task [ID]: [Title]

**ID:** [Phase]-[Task Number]
**Duration:** [X minutes/hours]
**Depends on:** [Task IDs or "Nothing"]
**Priority:** [High/Medium/Low]
**Spec Reference:** [File path and section]

**Description:**
[1-2 sentence summary of what this task accomplishes]

**What to do:**
1. [Step 1]
2. [Step 2]
3. [...]

**Acceptance Criteria:**
- [ ] [Criterion 1]
- [ ] [Criterion 2]
- [ ] [...]

**Output:**
- [File/artifact created]
- [File/artifact modified]

**Notes:**
- [Important considerations]
- [Edge cases to watch]
```

---

**Version:** 1.0.0
**Last Updated:** 2025-12-25
**Total Tasks (All Phases):** ~60-70
**Estimated Total Time:** 60-80 hours
