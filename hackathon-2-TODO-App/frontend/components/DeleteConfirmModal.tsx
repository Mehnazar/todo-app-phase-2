'use client'

import React, { useState } from 'react'
import { AlertTriangle } from 'lucide-react'
import { Modal } from './ui/Modal'
import { Button } from './ui/Button'

export interface DeleteConfirmModalProps {
  isOpen: boolean
  onClose: () => void
  onConfirm: () => Promise<void>
  taskTitle: string
}

export function DeleteConfirmModal({
  isOpen,
  onClose,
  onConfirm,
  taskTitle
}: DeleteConfirmModalProps) {
  const [loading, setLoading] = useState(false)

  const handleConfirm = async () => {
    setLoading(true)
    try {
      await onConfirm()
      onClose()
    } catch (error) {
      // Error will be handled by parent component with toast
      console.error('Delete failed:', error)
    } finally {
      setLoading(false)
    }
  }

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Delete Task"
      size="sm"
      footer={
        <>
          <Button variant="ghost" onClick={onClose} disabled={loading}>
            Cancel
          </Button>
          <Button variant="danger" onClick={handleConfirm} loading={loading}>
            Delete
          </Button>
        </>
      }
    >
      <div className="flex items-start gap-4">
        <div className="flex-shrink-0 text-red-600">
          <AlertTriangle className="w-6 h-6" />
        </div>

        <div className="flex-1">
          <p className="text-gray-900 mb-2">
            Are you sure you want to delete{' '}
            <span className="font-semibold">"{taskTitle}"</span>?
          </p>
          <p className="text-sm text-gray-500">
            This action cannot be undone.
          </p>
        </div>
      </div>
    </Modal>
  )
}
