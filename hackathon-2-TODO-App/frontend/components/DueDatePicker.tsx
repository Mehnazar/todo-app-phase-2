import { Calendar } from 'lucide-react'

interface DueDatePickerProps {
  value?: string
  onChange: (date: string) => void
  label?: string
  className?: string
}

export default function DueDatePicker({ value, onChange, label = 'Due Date', className = '' }: DueDatePickerProps) {
  return (
    <div className={className}>
      <label className="block text-sm font-medium text-gray-700 mb-1.5">
        {label}
      </label>
      <div className="relative">
        <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
        <input
          type="date"
          value={value || ''}
          onChange={(e) => onChange(e.target.value)}
          className="
            w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg
            focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent
            bg-white text-gray-900
          "
        />
      </div>
    </div>
  )
}
