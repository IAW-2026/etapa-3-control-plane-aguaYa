'use client'

import { Trash2 } from 'lucide-react'
import { deleteResena, deleteValoracion } from '@/lib/actions/feedback'
import { useState } from 'react'

type Props = {
  id: number
  type: 'resena' | 'valoracion'
}

export default function DeleteFeedbackButton({ id, type }: Props) {
  const [isDeleting, setIsDeleting] = useState(false)

  const handleDelete = async () => {
    if (!window.confirm('¿Estás seguro de que querés eliminar este elemento? Esta acción no se puede deshacer.')) return
    setIsDeleting(true)
    try {
      if (type === 'resena') {
        await deleteResena(id)
      } else {
        await deleteValoracion(id)
      }
    } catch {
      alert('Error al eliminar')
    } finally {
      setIsDeleting(false)
    }
  }

  return (
    <button
      onClick={handleDelete}
      disabled={isDeleting}
      className={`text-rose-500 hover:text-rose-700 transition-colors ${isDeleting ? 'opacity-50 cursor-not-allowed' : ''}`}
      title="Eliminar"
    >
      <Trash2 className="h-4 w-4" />
    </button>
  )
}
