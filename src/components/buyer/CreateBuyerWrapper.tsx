"use client"

import { useState } from "react"
import { Plus } from "lucide-react"
import CreateBuyerModal from "./CreateBuyerModal"

export default function CreateBuyerWrapper() {
  const [open, setOpen] = useState(false)

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="flex items-center gap-1.5 rounded-lg bg-blue-600 px-4 py-2 text-sm text-white shadow-lg shadow-black/5 transition-colors hover:bg-blue-700"
      >
        <Plus className="h-4 w-4" />
        Nuevo Comprador
      </button>
      <CreateBuyerModal
        isOpen={open}
        onClose={() => setOpen(false)}
        onSuccess={() => setOpen(false)}
      />
    </>
  )
}
