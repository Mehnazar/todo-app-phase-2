'use client'

import { useState, useRef, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Plus, ChevronDown, ChevronUp, Sparkles, Zap } from 'lucide-react'
import { cn } from '@/lib/cn'
import { Input } from './ui/Input'
import { Textarea } from './ui/Textarea'
import { Button } from './ui/Button'
import CategorySelector from './CategorySelector'
import DueDatePicker from './DueDatePicker'
import { TaskPriority } from '@/types/task'

interface AddTaskFormProps {
  onAdd: (title: string, description: string, priority: TaskPriority, dueDate?: string, category?: string) => Promise<void>
}

export default function AddTaskForm({ onAdd }: AddTaskFormProps) {
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [priority, setPriority] = useState<TaskPriority>('medium')
  const [dueDate, setDueDate] = useState('')
  const [category, setCategory] = useState('')
  const [loading, setLoading] = useState(false)
  const [expanded, setExpanded] = useState(false)
  const [isFocused, setIsFocused] = useState(false)
  const titleInputRef = useRef<HTMLInputElement>(null)
  const charCount = title.length

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!title.trim()) return

    setLoading(true)
    try {
      await onAdd(title, description, priority, dueDate || undefined, category || undefined)
      // Reset form with animation
      setTitle('')
      setDescription('')
      setPriority('medium')
      setDueDate('')
      setCategory('')
      setExpanded(false)
      titleInputRef.current?.focus()
    } finally {
      setLoading(false)
    }
  }

  // Focus title input when expanded
  useEffect(() => {
    if (expanded) {
      titleInputRef.current?.focus()
    }
  }, [expanded])

  // Handle keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Escape to close/clear
      if (e.key === 'Escape' && expanded) {
        if (title || description) {
          setTitle('')
          setDescription('')
        } else {
          setExpanded(false)
        }
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [expanded, title, description])

  const priorityOptions: { value: TaskPriority; label: string; icon: string; color: string }[] = [
    { value: 'low', label: 'Low', icon: '🔵', color: 'indigo' },
    { value: 'medium', label: 'Medium', icon: '🟡', color: 'amber' },
    { value: 'high', label: 'High', icon: '🔴', color: 'rose' },
  ]

  return (
    <motion.div
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      className={cn(
        'relative bg-white rounded-2xl border-2 overflow-hidden transition-all duration-300',
        isFocused || expanded
          ? 'border-indigo-400 shadow-2xl shadow-indigo-100/50'
          : 'border-slate-200 shadow-lg hover:border-slate-300'
      )}
    >
      {/* Gradient background overlay when focused */}
      <AnimatePresence>
        {(isFocused || expanded) && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 bg-gradient-to-br from-indigo-500/5 via-purple-500/5 to-pink-500/5 pointer-events-none"
          />
        )}
      </AnimatePresence>

      <form onSubmit={handleSubmit} className="relative p-6">
        {/* Header with icon */}
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center shadow-lg shadow-indigo-500/30">
            <Sparkles className="w-5 h-5 text-white" />
          </div>
          <div className="flex-1">
            <h3 className="text-lg font-semibold text-slate-900">Add New Task</h3>
            <p className="text-xs text-slate-500">What needs to be done?</p>
          </div>
          {charCount > 0 && (
            <motion.span
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              className={cn(
                'text-xs font-medium px-2 py-1 rounded-full',
                charCount > 180 ? 'bg-rose-100 text-rose-700' : 'bg-slate-100 text-slate-600'
              )}
            >
              {charCount}/200
            </motion.span>
          )}
        </div>

        {/* Quick Add Section - Always Visible */}
        <div className="flex gap-3 mb-4">
          <div className="flex-1 relative">
            <Input
              ref={titleInputRef}
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              onFocus={() => {
                setIsFocused(true)
                if (!expanded) setExpanded(true)
              }}
              onBlur={() => setIsFocused(false)}
              placeholder="e.g., Review project proposal"
              className={cn(
                'flex-1 h-14 text-base px-4 rounded-xl border-2 transition-all',
                isFocused ? 'border-indigo-400 ring-4 ring-indigo-100' : 'border-slate-200'
              )}
              maxLength={200}
            />
          </div>

          <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
            <Button
              type="submit"
              disabled={loading || !title.trim()}
              loading={loading}
              icon={!loading && <Plus className="w-5 h-5" />}
              className={cn(
                'h-14 px-8 rounded-xl font-semibold text-base shadow-lg transition-all',
                'bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700',
                'disabled:opacity-50 disabled:cursor-not-allowed'
              )}
            >
              {!loading && 'Add Task'}
            </Button>
          </motion.div>
        </div>

        {/* Expanded Section - Hidden by default */}
        <AnimatePresence>
          {expanded && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.3, ease: 'easeInOut' }}
              className="space-y-5 overflow-hidden"
            >
              {/* Description */}
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2.5 flex items-center gap-2">
                  Description
                  <span className="text-xs font-normal text-slate-400">(optional)</span>
                </label>
                <Textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  maxLength={1000}
                  rows={4}
                  placeholder="Add more details about this task..."
                  className="w-full px-4 py-3 rounded-xl border-2 border-slate-200 focus:border-indigo-400 focus:ring-4 focus:ring-indigo-100 transition-all resize-none"
                />
              </div>

              {/* Priority Selector - Enhanced */}
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-3 flex items-center gap-2">
                  <Zap className="w-4 h-4 text-amber-500" />
                  Priority Level
                </label>
                <div className="grid grid-cols-3 gap-3">
                  {priorityOptions.map((option) => (
                    <motion.button
                      key={option.value}
                      type="button"
                      onClick={() => setPriority(option.value)}
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      className={cn(
                        'relative px-4 py-3.5 rounded-xl font-semibold text-sm transition-all border-2 overflow-hidden',
                        priority === option.value
                          ? option.color === 'rose'
                            ? 'bg-rose-500 text-white border-rose-500 shadow-lg shadow-rose-500/30'
                            : option.color === 'amber'
                            ? 'bg-amber-500 text-white border-amber-500 shadow-lg shadow-amber-500/30'
                            : 'bg-indigo-500 text-white border-indigo-500 shadow-lg shadow-indigo-500/30'
                          : 'bg-white text-slate-700 border-slate-200 hover:border-slate-300 hover:shadow-md'
                      )}
                    >
                      <span className="flex items-center justify-center gap-2">
                        <span className="text-lg">{option.icon}</span>
                        {option.label}
                      </span>
                      {priority === option.value && (
                        <motion.div
                          layoutId="priority-indicator"
                          className="absolute inset-0 bg-gradient-to-br from-white/20 to-transparent pointer-events-none"
                          transition={{ type: 'spring', stiffness: 500, damping: 30 }}
                        />
                      )}
                    </motion.button>
                  ))}
                </div>
              </div>

              {/* Due Date */}
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2.5">
                  Due Date
                  <span className="text-xs font-normal text-slate-400 ml-2">(optional)</span>
                </label>
                <DueDatePicker value={dueDate} onChange={setDueDate} />
              </div>

              {/* Category */}
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2.5">
                  Category
                  <span className="text-xs font-normal text-slate-400 ml-2">(optional)</span>
                </label>
                <CategorySelector value={category} onChange={setCategory} />
              </div>

              {/* Collapse Button */}
              <div className="flex justify-between items-center pt-3 border-t border-slate-200">
                <p className="text-xs text-slate-500">
                  Press <kbd className="px-2 py-1 bg-slate-100 rounded text-slate-700 font-mono">Esc</kbd> to clear
                </p>
                <motion.button
                  type="button"
                  onClick={() => setExpanded(false)}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="text-sm text-slate-600 hover:text-slate-900 flex items-center gap-1.5 font-medium transition-colors px-3 py-1.5 rounded-lg hover:bg-slate-100"
                >
                  <ChevronUp className="w-4 h-4" />
                  Hide details
                </motion.button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Show expand hint when collapsed */}
        {!expanded && (
          <motion.button
            type="button"
            onClick={() => setExpanded(true)}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="w-full text-center text-sm text-slate-500 hover:text-indigo-600 flex items-center justify-center gap-1.5 py-2 transition-colors"
          >
            <ChevronDown className="w-4 h-4" />
            <span>Add description, priority & more</span>
          </motion.button>
        )}
      </form>
    </motion.div>
  )
}
