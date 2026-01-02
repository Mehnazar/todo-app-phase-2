# Phase I: Console Application Specification

**Feature ID:** PHASE1-CONSOLE
**Status:** In Development
**References:** [SPECIFICATION.md](../../../SPECIFICATION.md#phase-i-console-application-specification)

---

## Target Audience
Individual developers and power users comfortable with command-line interfaces who need basic task management without GUI overhead.

## Focus
In-memory task management with CRUD operations via Python console interface, serving as the foundational data model for all future phases.

## Success Criteria
- ✅ User can add tasks with title and optional description
- ✅ User can view all tasks with completion status
- ✅ User can update task details (title/description)
- ✅ User can delete tasks by ID
- ✅ User can mark tasks as complete/incomplete
- ✅ All operations work without external dependencies
- ✅ Data persists only during program runtime

## Constraints
- **Language:** Python 3.13+ only
- **Storage:** In-memory only (lists/dictionaries)
- **Package Manager:** UV for dependency management
- **Development:** All code generated via Claude Code + Spec-Kit Plus
- **No manual coding:** Specifications refined until correct output
- **Input method:** Command-line menu system
- **Output format:** Formatted console text

## Not Building (Phase I)
- ❌ Persistent storage (database or files)
- ❌ User authentication
- ❌ Web interface
- ❌ Priority levels or tags
- ❌ Due dates or reminders
- ❌ Search or filter functionality
- ❌ Multi-user support

---

## Feature 1: Add Task

**User Story:** As a user, I can create a new task with a title and optional description.

### Acceptance Criteria
- ✅ Title is required (1-200 characters)
- ✅ Description is optional (max 1000 characters)
- ✅ System generates unique task ID automatically
- ✅ Task defaults to incomplete status
- ✅ User receives confirmation with task ID

### Example Interaction
```
> Add Task
Enter title: Buy groceries
Enter description (optional): Milk, eggs, bread
✓ Task #1 created: "Buy groceries"
```

### Implementation Notes
- Use auto-incrementing integer for task IDs
- Store tasks in a dictionary with ID as key
- Validate title length (1-200 chars)
- Validate description length (max 1000 chars)
- Return task object with all fields populated

---

## Feature 2: View Task List

**User Story:** As a user, I can view all my tasks with their status.

### Acceptance Criteria
- ✅ Display all tasks with ID, title, and status
- ✅ Show completion status clearly (✓ or ☐)
- ✅ Empty list shows "No tasks yet"
- ✅ Tasks displayed in order of creation

### Example Output
```
Your Tasks:
[1] ☐ Buy groceries
[2] ✓ Call mom
[3] ☐ Finish report
```

### Implementation Notes
- Iterate through tasks dictionary in order of ID
- Use Unicode checkboxes: ✓ (completed), ☐ (incomplete)
- Handle empty list gracefully with message
- Format output with consistent spacing

---

## Feature 3: Update Task

**User Story:** As a user, I can modify existing task details.

### Acceptance Criteria
- ✅ User selects task by ID
- ✅ Can update title and/or description
- ✅ Leaving field blank keeps existing value
- ✅ Invalid ID shows error message
- ✅ User receives confirmation of update

### Example Interaction
```
> Update Task
Enter task ID: 1
New title (press Enter to keep current): Buy groceries and fruits
New description: Milk, eggs, bread, apples, oranges
✓ Task #1 updated
```

### Implementation Notes
- Validate task ID exists before updating
- If input is empty string, keep existing value
- Validate new title length if provided
- Validate new description length if provided
- Return updated task object

---

## Feature 4: Delete Task

**User Story:** As a user, I can remove tasks I no longer need.

### Acceptance Criteria
- ✅ User selects task by ID
- ✅ Confirmation prompt before deletion
- ✅ Task removed from list permanently
- ✅ Invalid ID shows error message

### Example Interaction
```
> Delete Task
Enter task ID: 2
Confirm delete "Call mom"? (y/n): y
✓ Task #2 deleted
```

### Implementation Notes
- Validate task ID exists before prompting
- Show task title in confirmation prompt
- Accept 'y' or 'yes' (case-insensitive) for confirmation
- Remove task from dictionary on confirmation
- Do not renumber remaining tasks

---

## Feature 5: Mark as Complete

**User Story:** As a user, I can toggle task completion status.

### Acceptance Criteria
- ✅ User selects task by ID
- ✅ Status toggles between complete/incomplete
- ✅ Visual indicator updates immediately
- ✅ Invalid ID shows error message

### Example Interaction
```
> Toggle Complete
Enter task ID: 1
✓ Task #1 marked as complete
```

### Implementation Notes
- Validate task ID exists before toggling
- Toggle boolean `completed` field
- Show appropriate confirmation message
- Return updated task object

---

## Data Model

### Task Entity
```python
{
    "id": int,           # Auto-incrementing, unique
    "title": str,        # 1-200 characters, required
    "description": str,  # 0-1000 characters, optional
    "completed": bool    # Default: False
}
```

### Storage Structure
```python
tasks: dict[int, dict] = {}
next_task_id: int = 1
```

---

## User Interface Flow

### Main Menu
```
=== Todo List Manager ===
1. Add Task
2. View Tasks
3. Update Task
4. Delete Task
5. Toggle Complete
6. Exit

Choose an option (1-6):
```

### Error Handling
- Invalid menu choice → "Invalid option. Please choose 1-6."
- Invalid task ID → "Task #X not found."
- Empty title → "Title cannot be empty."
- Title too long → "Title must be 200 characters or less."
- Description too long → "Description must be 1000 characters or less."

---

## Technical Requirements

### File Structure
```
src/phase-1/
├── main.py          # Entry point with menu loop
├── task_manager.py  # Task CRUD operations
└── models.py        # Task data model
```

### Dependencies
- **Python Standard Library only** (no external packages)
- Type hints required on all functions
- Docstrings required on all functions

### Code Quality Standards
- Follow PEP 8 style guide
- Use type hints (Python 3.13+)
- Add docstrings for all functions
- No global state (pass task storage as parameter)
- Pure functions where possible

---

## Testing Checklist

### Manual Test Cases
- [ ] Add task with title only
- [ ] Add task with title and description
- [ ] Add task with title > 200 chars (should fail)
- [ ] Add task with description > 1000 chars (should fail)
- [ ] View empty task list
- [ ] View task list with multiple tasks
- [ ] Update task title only
- [ ] Update task description only
- [ ] Update task with both title and description
- [ ] Update non-existent task (should fail)
- [ ] Delete task with confirmation
- [ ] Delete task without confirmation
- [ ] Delete non-existent task (should fail)
- [ ] Toggle task to complete
- [ ] Toggle task to incomplete
- [ ] Toggle non-existent task (should fail)
- [ ] Exit application cleanly

---

## Definition of Done

- [ ] All 5 features implemented and working
- [ ] Code follows Python 3.13+ standards
- [ ] Type hints on all functions
- [ ] No external dependencies
- [ ] Manual testing completed with all test cases passing
- [ ] Code generated by Claude Code (no manual coding)
- [ ] Specification documented in this file

---

**Version:** 1.0.0
**Last Updated:** 2025-12-25
**Author:** Claude Code + Spec-Kit Plus
