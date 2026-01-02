'use client'

import React, { useState, useEffect } from 'react'
import { Modal } from './ui/Modal'
import { Input } from './ui/Input'
import { Textarea } from './ui/Textarea'
import { Button } from './ui/Button'
import { Task, TaskPriority } from '@/types/task'
import CategorySelector from './CategorySelector'
import DueDatePicker from './DueDatePicker'

export interface EditTaskModalProps {
  task: Task | null
  isOpen: boolean
  onClose: () => void
  onSave: (taskId: number, data: {
    title: string
    description: string
    priority: TaskPriority
    due_date?: string
    category?: string
  }) => Promise<void>
}

export function EditTaskModal({ task, isOpen, onClose, onSave }: EditTaskModalProps) {
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [priority, setPriority] = useState<TaskPriority>('medium')
  const [dueDate, setDueDate] = useState('')
  const [category, setCategory] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    if (task) {
      setTitle(task.title)
      setDescription(task.description)
      setPriority(task.priority)
      setDueDate(task.due_date || '')
      setCategory(task.category || '')
      setError('')
    }
  }, [task])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')

    if (!title.trim()) {
      setError('Title is required')
      return
    }

    if (!task) return

    setLoading(true)
    try {
      await onSave(task.id, {
        title,
        description,
        priority,
        due_date: dueDate || undefined,
        category: category || undefined
      })
      onClose()
    } catch (err: any) {
      setError(err.response?.data?.detail?.error?.message || 'Failed to update task')
    } finally {
      setLoading(false)
    }
  }

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Edit Task"
      footer={
        <>
          <Button variant="ghost" onClick={onClose} disabled={loading}>
            Cancel
          </Button>
          <Button onClick={handleSubmit} loading={loading}>
            Save Changes
          </Button>
        </>
      }
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        {error && (
          <div className="bg-red-50 border-l-4 border-red-500 p-4 rounded">
            <p className="text-sm text-red-800">{error}</p>
          </div>
        )}

        <Input
          label="Title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Task title"
          maxLength={200}
          required
          autoFocus
        />

        <Textarea
          label="Description"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="Task description (optional)"
          maxLength={1000}
          rows={4}
        />

        {/* Priority Selector */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Priority Level
          </label>
          <div className="flex gap-3">
            {(['low', 'medium', 'high'] as TaskPriority[]).map((p) => (
              <button
                key={p}
                type="button"
                onClick={() => setPriority(p)}
                className={`
                  flex-1 px-4 py-2.5 rounded-lg font-medium text-sm transition-all
                  ${priority === p
                    ? p === 'high'
                      ? 'bg-red-500 text-white shadow-lg scale-105'
                      : p === 'medium'
                      ? 'bg-amber-500 text-white shadow-lg scale-105'
                      : 'bg-blue-500 text-white shadow-lg scale-105'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }
                `}
              >
                {p.charAt(0).toUpperCase() + p.slice(1)}
              </button>
            ))}
          </div>
        </div>

        <DueDatePicker value={dueDate} onChange={setDueDate} />

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Category (optional)
          </label>
          <CategorySelector value={category} onChange={setCategory} />
        </div>
      </form>
    </Modal>
  )
}
