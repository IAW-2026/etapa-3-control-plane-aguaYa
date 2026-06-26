"use client"

import { useState, useEffect } from "react"
import Modal from "@/components/ui/Modal"
import { createBuyer } from "@/lib/actions/buyer"
import { useToast } from "@/components/ui/ToastProvider"
import { Loader2 } from "lucide-react"

type Props = {
  isOpen: boolean
  onClose: () => void
  onSuccess: () => void
}

export default function CreateBuyerModal({ isOpen, onClose, onSuccess }: Props) {
  const { showToast } = useToast()

  const [userId, setUserId] = useState("")
  const [mail, setMail] = useState("")
  const [name, setName] = useState("")
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    if (!isOpen) return
    setUserId("")
    setMail("")
    setName("")
  }, [isOpen])

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!userId || !mail || !name) return
    setSaving(true)
    try {
      await createBuyer({ user_id: userId, mail, name })
      showToast("success", "Comprador creado correctamente")
      onSuccess()
    } catch (e) {
      const msg = e instanceof Error ? e.message.toLowerCase() : ""
      if (msg.includes("ya existe")) {
        showToast("error", "Ya existe un comprador con ese email o user_id")
      } else {
        showToast("error", "Error al crear comprador")
      }
    } finally {
      setSaving(false)
    }
  }

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Nuevo Comprador">
      <form onSubmit={handleSubmit} className="space-y-4 text-sm">
        <div>
          <label className="mb-1 block text-xs font-medium text-slate-500 dark:text-slate-400">
            User ID (Clerk) <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            value={userId}
            onChange={(e) => setUserId(e.target.value)}
            required
            placeholder="user_2abcdef..."
            className="w-full rounded-lg border border-white/30 bg-gradient-to-br from-white/30 to-slate-100/30 px-3 py-2 text-slate-900 shadow-lg shadow-black/5 backdrop-blur-xl focus:border-blue-500/50 focus:outline-none focus:ring-2 focus:ring-blue-500/20 dark:border-slate-700/40 dark:from-slate-900/40 dark:to-slate-800/40 dark:text-slate-100"
          />
        </div>
        <div>
          <label className="mb-1 block text-xs font-medium text-slate-500 dark:text-slate-400">
            Email <span className="text-red-500">*</span>
          </label>
          <input
            type="email"
            value={mail}
            onChange={(e) => setMail(e.target.value)}
            required
            placeholder="comprador@ejemplo.com"
            className="w-full rounded-lg border border-white/30 bg-gradient-to-br from-white/30 to-slate-100/30 px-3 py-2 text-slate-900 shadow-lg shadow-black/5 backdrop-blur-xl focus:border-blue-500/50 focus:outline-none focus:ring-2 focus:ring-blue-500/20 dark:border-slate-700/40 dark:from-slate-900/40 dark:to-slate-800/40 dark:text-slate-100"
          />
        </div>
        <div>
          <label className="mb-1 block text-xs font-medium text-slate-500 dark:text-slate-400">
            Nombre <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
            placeholder="Juan Pérez"
            className="w-full rounded-lg border border-white/30 bg-gradient-to-br from-white/30 to-slate-100/30 px-3 py-2 text-slate-900 shadow-lg shadow-black/5 backdrop-blur-xl focus:border-blue-500/50 focus:outline-none focus:ring-2 focus:ring-blue-500/20 dark:border-slate-700/40 dark:from-slate-900/40 dark:to-slate-800/40 dark:text-slate-100"
          />
        </div>
        <div className="flex justify-end gap-2 border-t border-white/20 pt-4 dark:border-slate-700/30">
          <button
            type="button"
            onClick={onClose}
            disabled={saving}
            className="rounded-lg border border-white/30 bg-gradient-to-br from-white/30 to-slate-100/30 px-4 py-2 text-sm text-slate-600 shadow-lg shadow-black/5 backdrop-blur-xl transition-colors hover:bg-white/40 disabled:opacity-50 dark:border-slate-700/40 dark:from-slate-900/40 dark:to-slate-800/40 dark:text-slate-400"
          >
            Cancelar
          </button>
          <button
            type="submit"
            disabled={saving || !userId || !mail || !name}
            className="flex items-center gap-1.5 rounded-lg bg-blue-600 px-5 py-2 text-sm text-white shadow-lg shadow-black/5 transition-colors hover:bg-blue-700 disabled:opacity-50"
          >
            {saving && <Loader2 className="h-4 w-4 animate-spin" />}
            {saving ? "Creando..." : "Crear Comprador"}
          </button>
        </div>
      </form>
    </Modal>
  )
}
