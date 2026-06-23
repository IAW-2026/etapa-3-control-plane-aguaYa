"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import ConfirmDialog from "./ConfirmDialog"
import { Trash2 } from "lucide-react"

type Props = {
  id: number
  label: string
  message: string
  deleteAction: (id: number) => Promise<void>
}

export default function DeleteButton({ id, label, message, deleteAction }: Props) {
  const router = useRouter()
  const [open, setOpen] = useState(false)
  const [loading, setLoading] = useState(false)

  async function handleDelete() {
    setLoading(true)
    try {
      await deleteAction(id)
      setOpen(false)
      router.refresh()
    } catch {
      setLoading(false)
      setOpen(false)
    }
  }

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="rounded-lg p-1.5 text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20"
        title={`Eliminar ${label}`}
      >
        <Trash2 className="h-4 w-4" />
      </button>
      <ConfirmDialog
        isOpen={open}
        onClose={() => setOpen(false)}
        onConfirm={handleDelete}
        title="Eliminar"
        message={message}
        confirmLabel="Eliminar"
        loading={loading}
      />
    </>
  )
}
