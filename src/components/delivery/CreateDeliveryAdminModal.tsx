"use client"

import { useState } from "react"
import Modal from "@/components/ui/Modal"
import { createDeliveryAdmin } from "@/lib/actions/delivery"
import { useToast } from "@/components/ui/ToastProvider"
import { Loader2 } from "lucide-react"

type Props = {
  isOpen: boolean
  onClose: () => void
  onSuccess: () => void
}

export default function CreateDeliveryAdminModal({ isOpen, onClose, onSuccess }: Props) {
  const { showToast } = useToast()

  const [email, setEmail] = useState("")
  const [nombre, setNombre] = useState("")
  const [telefono, setTelefono] = useState("")
  const [saving, setSaving] = useState(false)
  const [created, setCreated] = useState(false)
  const [temporaryPassword, setTemporaryPassword] = useState<string | undefined>()

  function reset() {
    setEmail("")
    setNombre("")
    setTelefono("")
    setCreated(false)
    setTemporaryPassword(undefined)
  }

  if (!isOpen && created) reset()

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!email || !nombre) return
    setSaving(true)
    try {
      const res = await createDeliveryAdmin({ email, nombre, telefono: telefono || undefined })
      setTemporaryPassword(res.temporaryPassword)
      setCreated(true)
      showToast("success", "Admin de delivery creado correctamente")
    } catch (e) {
      const msg = e instanceof Error ? e.message.toLowerCase() : ""
      if (msg.includes("ya existe")) {
        showToast("error", "Ya existe un usuario con ese email en Clerk")
      } else if (msg.includes("faltan")) {
        showToast("error", "Faltan campos requeridos")
      } else {
        showToast("error", "Error al crear admin de delivery")
      }
      setSaving(false)
    }
  }

  function handleCloseSuccess() {
    reset()
    onClose()
    onSuccess()
  }

  if (created) {
    return (
      <Modal isOpen={isOpen} onClose={handleCloseSuccess} title="Admin de delivery creado">
        <div className="space-y-4 text-sm">
          <p className="text-slate-600 dark:text-slate-300">
            El administrador de delivery <strong>{nombre}</strong> fue creado correctamente.
          </p>
          <div className="rounded-lg border border-amber-200 bg-amber-50 p-4 dark:border-amber-800/40 dark:bg-amber-900/20">
            <p className="text-xs font-medium text-amber-700 dark:text-amber-400">Contraseña temporal</p>
            <p className="mt-1 font-mono text-sm font-bold text-amber-900 dark:text-amber-200">
              {temporaryPassword}
            </p>
            <p className="mt-2 text-xs text-amber-600 dark:text-amber-400">
              El usuario debe cambiar esta contraseña en su primer inicio de sesión.
            </p>
          </div>
          <div className="flex justify-end">
            <button
              type="button"
              onClick={handleCloseSuccess}
              className="rounded-lg bg-blue-600 px-5 py-2 text-sm text-white shadow-lg shadow-black/5 transition-colors hover:bg-blue-700"
            >
              Cerrar
            </button>
          </div>
        </div>
      </Modal>
    )
  }

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Nuevo Admin de Delivery">
      <form onSubmit={handleSubmit} className="space-y-4 text-sm">
        <div>
          <label className="mb-1 block text-xs font-medium text-slate-500 dark:text-slate-400">
            Email <span className="text-red-500">*</span>
          </label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            placeholder="admin@ejemplo.com"
            className="w-full rounded-lg border border-white/30 bg-gradient-to-br from-white/30 to-slate-100/30 px-3 py-2 text-slate-900 shadow-lg shadow-black/5 backdrop-blur-xl focus:border-blue-500/50 focus:outline-none focus:ring-2 focus:ring-blue-500/20 dark:border-slate-700/40 dark:from-slate-900/40 dark:to-slate-800/40 dark:text-slate-100"
          />
        </div>
        <div>
          <label className="mb-1 block text-xs font-medium text-slate-500 dark:text-slate-400">
            Nombre <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            value={nombre}
            onChange={(e) => setNombre(e.target.value)}
            required
            placeholder="Admin Centro"
            className="w-full rounded-lg border border-white/30 bg-gradient-to-br from-white/30 to-slate-100/30 px-3 py-2 text-slate-900 shadow-lg shadow-black/5 backdrop-blur-xl focus:border-blue-500/50 focus:outline-none focus:ring-2 focus:ring-blue-500/20 dark:border-slate-700/40 dark:from-slate-900/40 dark:to-slate-800/40 dark:text-slate-100"
          />
        </div>
        <div>
          <label className="mb-1 block text-xs font-medium text-slate-500 dark:text-slate-400">
            Teléfono
          </label>
          <input
            type="text"
            value={telefono}
            onChange={(e) => setTelefono(e.target.value)}
            placeholder="555-0000"
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
            disabled={saving || !email || !nombre}
            className="flex items-center gap-1.5 rounded-lg bg-blue-600 px-5 py-2 text-sm text-white shadow-lg shadow-black/5 transition-colors hover:bg-blue-700 disabled:opacity-50"
          >
            {saving && <Loader2 className="h-4 w-4 animate-spin" />}
            {saving ? "Creando..." : "Crear Admin de Delivery"}
          </button>
        </div>
      </form>
    </Modal>
  )
}
