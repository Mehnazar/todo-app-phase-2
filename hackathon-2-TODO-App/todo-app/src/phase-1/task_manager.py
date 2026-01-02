"""
Task CRUD operations for Phase I Console Application.

References: specs/phase-1/spec.md
"""

from typing import Optional
from models import Task, create_task, format_task


class TaskManager:
    """
    Manages in-memory task storage and operations.

    Attributes:
        tasks: Dictionary storing tasks by ID
        next_task_id: Counter for generating unique task IDs
    """

    def __init__(self) -> None:
        """Initialize empty task storage."""
        self.tasks: dict[int, Task] = {}
        self.next_task_id: int = 1

    def add_task(self, title: str, description: str = "") -> Task:
        """
        Create a new task with the given title and description.

        Args:
            title: Task title (1-200 characters, required)
            description: Task description (0-1000 characters, optional)

        Returns:
            Created task object

        Raises:
            ValueError: If title or description validation fails
        """
        task = create_task(self.next_task_id, title, description)
        self.tasks[self.next_task_id] = task
        self.next_task_id += 1
        return task

    def get_task(self, task_id: int) -> Optional[Task]:
        """
        Retrieve a task by ID.

        Args:
            task_id: ID of the task to retrieve

        Returns:
            Task object if found, None otherwise
        """
        return self.tasks.get(task_id)

    def list_tasks(self) -> list[Task]:
        """
        Get all tasks in order of creation.

        Returns:
            List of all tasks sorted by ID
        """
        return [self.tasks[task_id] for task_id in sorted(self.tasks.keys())]

    def update_task(
        self,
        task_id: int,
        title: Optional[str] = None,
        description: Optional[str] = None
    ) -> Optional[Task]:
        """
        Update a task's title and/or description.

        Args:
            task_id: ID of the task to update
            title: New title (None to keep existing)
            description: New description (None to keep existing)

        Returns:
            Updated task object if found, None otherwise

        Raises:
            ValueError: If title or description validation fails
        """
        task = self.get_task(task_id)
        if task is None:
            return None

        # Validate new values if provided
        if title is not None:
            if len(title) == 0:
                raise ValueError("Title cannot be empty.")
            if len(title) > 200:
                raise ValueError("Title must be 200 characters or less.")
            task["title"] = title

        if description is not None:
            if len(description) > 1000:
                raise ValueError("Description must be 1000 characters or less.")
            task["description"] = description

        return task

    def delete_task(self, task_id: int) -> Optional[Task]:
        """
        Delete a task by ID.

        Args:
            task_id: ID of the task to delete

        Returns:
            Deleted task object if found, None otherwise
        """
        return self.tasks.pop(task_id, None)

    def toggle_complete(self, task_id: int) -> Optional[Task]:
        """
        Toggle a task's completion status.

        Args:
            task_id: ID of the task to toggle

        Returns:
            Updated task object if found, None otherwise
        """
        task = self.get_task(task_id)
        if task is None:
            return None

        task["completed"] = not task["completed"]
        return task

    def format_task_list(self) -> str:
        """
        Format all tasks for display.

        Returns:
            Formatted string of all tasks, or "No tasks yet" if empty
        """
        if not self.tasks:
            return "No tasks yet"

        formatted_tasks = [format_task(task) for task in self.list_tasks()]
        return "\n".join(formatted_tasks)
