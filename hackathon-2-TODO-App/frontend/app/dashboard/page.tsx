'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { Trash2, Edit2, LogOut, User } from 'lucide-react'
import { auth } from '@/lib/auth'
import { taskAPI } from '@/lib/api'
import { useToast } from '@/hooks/useToast'
import type { Task } from '@/types/task'
import { EditTaskModal } from '@/components/EditTaskModal'
import { DeleteConfirmModal } from '@/components/DeleteConfirmModal'

export default function DashboardPage() {
  const router = useRouter()
  const toast = useToast()
  const [tasks, setTasks] = useState<Task[]>([])
  const [loading, setLoading] = useState(true)
  const [user, setUser] = useState<any>(null)
  const [newTask, setNewTask] = useState('')
  const [addingTask, setAddingTask] = useState(false)

  // Modal state
  const [editingTask, setEditingTask] = useState<Task | null>(null)
  const [deletingTask, setDeletingTask] = useState<{ id: number; title: string } | null>(null)

  // Color rotation for vibrant cards
  const colorRotation = [
    { bg: 'bg-purple-500', hover: 'hover:bg-purple-600' },
    { bg: 'bg-orange-500', hover: 'hover:bg-orange-600' },
    { bg: 'bg-blue-500', hover: 'hover:bg-blue-600' },
  ]

  useEffect(() => {
    // Check authentication
    if (!auth.isAuthenticated()) {
      router.push('/login')
      return
    }

    const userData = auth.getUser()
    setUser(userData)

    // Load tasks
    loadTasks(userData.id)
  }, [router])

  const loadTasks = async (userId: string) => {
    try {
      setLoading(true)
      const tasksData = await taskAPI.getTasks(userId)
      setTasks(tasksData)
    } catch (err: any) {
      toast.error('Failed to load tasks')
    } finally {
      setLoading(false)
    }
  }

  const handleAddTask = async () => {
    if (!user || !newTask.trim()) return

    setAddingTask(true)
    try {
      const createdTask = await taskAPI.createTask(user.id, {
        title: newTask.trim(),
        description: '',
        priority: 'medium',
      })
      setTasks([...tasks, createdTask])
      setNewTask('')
      toast.success('Task added!')
    } catch (err: any) {
      toast.error('Failed to add task')
    } finally {
      setAddingTask(false)
    }
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !addingTask) {
      handleAddTask()
    }
  }

  const handleEditTask = async (
    taskId: number,
    data: {
      title: string
      description: string
      priority: 'low' | 'medium' | 'high'
      due_date?: string
      category?: string
    }
  ) => {
    if (!user) return

    try {
      const updatedTask = await taskAPI.updateTask(user.id, taskId, data)
      setTasks(tasks.map(task =>
        task.id === taskId ? updatedTask : task
      ))
      toast.success('Task updated successfully!')
    } catch (err: any) {
      toast.error('Failed to update task')
      throw err
    }
  }

  const handleDeleteTask = async () => {
    if (!user || !deletingTask) return

    try {
      await taskAPI.deleteTask(user.id, deletingTask.id)
      setTasks(tasks.filter(task => task.id !== deletingTask.id))
      toast.success('Task deleted successfully')
    } catch (err: any) {
      toast.error('Failed to delete task')
      throw err
    }
  }

  const handleLogout = () => {
    auth.logout()
    router.push('/login')
  }

  // Helper function to get card color based on index
  const getTaskColor = (index: number) => {
    return colorRotation[index % colorRotation.length]
  }

  if (loading && !user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-800 via-slate-900 to-slate-950">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-500 mx-auto mb-4"></div>
          <p className="text-lg text-gray-300">Loading your tasks...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-800 via-slate-900 to-slate-950 p-4 md:p-8">
      {/* Top Bar with User Info */}
      <div className="max-w-4xl mx-auto mb-6">
        <div className="flex justify-end items-center gap-3">
          <div className="flex items-center gap-2 px-3 py-2 bg-slate-700/50 rounded-lg border border-slate-600">
            <User className="w-4 h-4 text-purple-400" />
            <span className="text-sm font-medium text-white">{user?.name}</span>
          </div>
          <button
            onClick={handleLogout}
            className="flex items-center gap-2 px-3 py-2 bg-slate-700/50 hover:bg-slate-700 rounded-lg border border-slate-600 text-white transition-colors"
          >
            <LogOut className="w-4 h-4" />
            <span className="text-sm hidden sm:inline">Logout</span>
          </button>
        </div>
      </div>

      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <h1 className="text-3xl md:text-5xl font-bold text-white text-center mb-8 md:mb-12 tracking-wide drop-shadow-[0_0_25px_rgba(168,85,247,0.4)]">
          What's the Plan for Today?
        </h1>

        {/* Add Todo Section */}
        <div className="flex flex-col sm:flex-row gap-3 mb-8">
          <input
            type="text"
            value={newTask}
            onChange={(e) => setNewTask(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="Add a todo"
            disabled={addingTask}
            className="flex-1 bg-slate-800/50 border-2 border-purple-500 rounded-xl px-4 py-3 md:px-6 md:py-4 text-white text-base md:text-lg placeholder-gray-400 focus:outline-none focus:border-purple-400 transition-colors disabled:opacity-50"
          />
          <button
            onClick={handleAddTask}
            disabled={addingTask || !newTask.trim()}
            className="bg-purple-600 hover:bg-purple-700 disabled:bg-purple-800 disabled:opacity-50 text-white font-semibold px-6 py-3 md:px-8 md:py-4 rounded-xl transition-all transform hover:scale-105 disabled:transform-none disabled:cursor-not-allowed"
          >
            {addingTask ? 'Adding...' : 'Add Todo'}
          </button>
        </div>

        {/* Task List */}
        {loading && tasks.length === 0 ? (
          <div className="text-center text-gray-400 text-lg mt-16">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-500 mx-auto mb-4"></div>
            Loading tasks...
          </div>
        ) : tasks.length === 0 ? (
          <div className="text-center text-gray-400 text-lg md:text-xl mt-16 space-y-3">
            <div className="text-6xl mb-4">📝</div>
            <p className="font-medium">No tasks yet.</p>
            <p className="text-base text-gray-500">Add one to get started!</p>
          </div>
        ) : (
          <div className="space-y-3">
            {/* Reversed order - newest tasks appear at top with highest numbers */}
            {[...tasks].reverse().map((task, index) => {
              const taskNumber = tasks.length - index
              const colorIndex = (tasks.length - 1 - index) % colorRotation.length
              const color = colorRotation[colorIndex]

              return (
                <div
                  key={task.id}
                  className={`${color.bg} rounded-xl p-4 md:p-5 flex items-center justify-between text-white shadow-lg hover:shadow-2xl transition-all group ${color.hover}`}
                >
                  <span className="text-base md:text-xl font-medium flex-1 mr-4">
                    <span className="font-bold">{taskNumber}</span> - {task.title}
                  </span>
                  <div className="flex gap-2 md:gap-3 flex-shrink-0">
                    <button
                      onClick={() => {
                        const taskToDelete = tasks.find(t => t.id === task.id)
                        if (taskToDelete) {
                          setDeletingTask({ id: task.id, title: taskToDelete.title })
                        }
                      }}
                      className="w-9 h-9 md:w-10 md:h-10 rounded-full bg-white/20 hover:bg-white/30 flex items-center justify-center transition-colors"
                      title="Delete task"
                    >
                      <Trash2 size={18} className="md:w-5 md:h-5" />
                    </button>
                    <button
                      onClick={() => setEditingTask(task)}
                      className="w-9 h-9 md:w-10 md:h-10 rounded-full bg-white/20 hover:bg-white/30 flex items-center justify-center transition-colors"
                      title="Edit task"
                    >
                      <Edit2 size={18} className="md:w-5 md:h-5" />
                    </button>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>

      {/* Edit Task Modal */}
      <EditTaskModal
        task={editingTask}
        isOpen={!!editingTask}
        onClose={() => setEditingTask(null)}
        onSave={handleEditTask}
      />

      {/* Delete Confirmation Modal */}
      <DeleteConfirmModal
        isOpen={!!deletingTask}
        onClose={() => setDeletingTask(null)}
        onConfirm={handleDeleteTask}
        taskTitle={deletingTask?.title || ''}
      />
    </div>
  )
}
