"""
Task data model for Phase I Console Application.

References: specs/phase-1/spec.md#data-model
"""

from typing import TypedDict


class Task(TypedDict):
    """
    Task entity with required fields.

    Attributes:
        id: Auto-incrementing unique identifier
        title: Task title (1-200 characters)
        description: Optional task description (0-1000 characters)
        completed: Task completion status (default: False)
    """
    id: int
    title: str
    description: str
    completed: bool


def create_task(task_id: int, title: str, description: str = "") -> Task:
    """
    Create a new task with the specified fields.

    Args:
        task_id: Unique identifier for the task
        title: Task title (1-200 characters)
        description: Optional task description (0-1000 characters)

    Returns:
        Task dictionary with all fields populated

    Raises:
        ValueError: If title is empty or exceeds 200 characters
        ValueError: If description exceeds 1000 characters
    """
    if not title or len(title) == 0:
        raise ValueError("Title cannot be empty.")
    if len(title) > 200:
        raise ValueError("Title must be 200 characters or less.")
    if len(description) > 1000:
        raise ValueError("Description must be 1000 characters or less.")

    return Task(
        id=task_id,
        title=title,
        description=description,
        completed=False
    )


def format_task(task: Task) -> str:
    """
    Format a task for display in the task list.

    Args:
        task: Task to format

    Returns:
        Formatted string with checkbox, ID, and title

    Example:
        "[1] ☐ Buy groceries"
        "[2] ✓ Call mom"
    """
    status_icon = "✓" if task["completed"] else "☐"
    return f"[{task['id']}] {status_icon} {task['title']}"
