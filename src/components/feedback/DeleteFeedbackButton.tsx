'use client'

import { Trash2 } from 'lucide-react'
import { deleteResena, deleteValoracion } from '@/lib/actions/feedback'
import { useState } from 'react'
import ConfirmDialog from '@/components/ui/ConfirmDialog'
import { useToast } from '@/components/ui/ToastProvider'

type Props = {
  id: number
  type: 'resena' | 'valoracion'
  label: string
}

export default function DeleteFeedbackButton({ id, type, label }: Props) {
  const [showConfirm, setShowConfirm] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)
  const { showToast } = useToast()

  const handleDelete = async () => {
    setIsDeleting(true)
    try {
      if (type === 'resena') {
        await deleteResena(id)
      } else {
        await deleteValoracion(id)
      }
      showToast('success', `${label} eliminada correctamente`)
      setShowConfirm(false)
    } catch {
      showToast('error', `Error al eliminar ${label.toLowerCase()}`)
      setIsDeleting(false)
    }
  }

  return (
    <>
      <button
        onClick={() => setShowConfirm(true)}
        disabled={isDeleting}
        className={`text-rose-500 hover:text-rose-700 transition-colors ${isDeleting ? 'opacity-50 cursor-not-allowed' : ''}`}
        title={`Eliminar ${label.toLowerCase()}`}
      >
        <Trash2 className="h-4 w-4" />
      </button>

      <ConfirmDialog
        isOpen={showConfirm}
        onClose={() => { if (!isDeleting) setShowConfirm(false) }}
        onConfirm={handleDelete}
        title={`Eliminar ${label.toLowerCase()}`}
        message={`¿Estás seguro de que querés eliminar esta ${label.toLowerCase()}? Esta acción no se puede deshacer.`}
        confirmLabel="Eliminar"
        variant="danger"
        loading={isDeleting}
      />
    </>
  )
}
