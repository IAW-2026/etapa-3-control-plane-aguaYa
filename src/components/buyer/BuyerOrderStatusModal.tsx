"use client"

import { useState } from "react"
import Modal from "@/components/ui/Modal"
import { updateBuyerOrderStatus } from "@/lib/actions/buyer"
import { useToast } from "@/components/ui/ToastProvider"
import { Loader2 } from "lucide-react"

const STATUSES = [
  { value: "PENDING", label: "Pendiente" },
  { value: "PAID", label: "Pagada" },
  { value: "READY", label: "Lista" },
  { value: "IN_DELIVERY", label: "En Delivery" },
  { value: "DELIVERED", label: "Entregada" },
  { value: "IN_REVISION", label: "En Revisión" },
  { value: "CANCELLED", label: "Cancelada" },
]

type Props = {
  isOpen: boolean
  onClose: () => void
  onSuccess: () => void
  orderId: string
  currentStatus: string
}

export default function BuyerOrderStatusModal({ isOpen, onClose, onSuccess, orderId, currentStatus }: Props) {
  const { showToast } = useToast()

  const [orderStatus, setOrderStatus] = useState(currentStatus)
  const [statusReason, setStatusReason] = useState("")
  const [saving, setSaving] = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setSaving(true)
    try {
      await updateBuyerOrderStatus(orderId, orderStatus, statusReason || undefined)
      showToast("success", "Estado actualizado correctamente")
      onSuccess()
    } catch {
      showToast("error", "Error al actualizar estado")
    } finally {
      setSaving(false)
    }
  }

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Cambiar Estado de Orden">
      <form onSubmit={handleSubmit} className="space-y-4 text-sm">
        <div>
          <label className="mb-1 block text-xs font-medium text-slate-500 dark:text-slate-400">
            Estado <span className="text-red-500">*</span>
          </label>
          <select
            value={orderStatus}
            onChange={(e) => setOrderStatus(e.target.value)}
            required
            className="w-full rounded-lg border border-white/30 bg-gradient-to-br from-white/30 to-slate-100/30 px-3 py-2 text-slate-900 shadow-lg shadow-black/5 backdrop-blur-xl focus:border-blue-500/50 focus:outline-none focus:ring-2 focus:ring-blue-500/20 dark:border-slate-700/40 dark:from-slate-900/40 dark:to-slate-800/40 dark:text-slate-100"
          >
            {STATUSES.map((s) => (
              <option key={s.value} value={s.value}>{s.label}</option>
            ))}
          </select>
        </div>
        <div>
          <label className="mb-1 block text-xs font-medium text-slate-500 dark:text-slate-400">
            Motivo del cambio
          </label>
          <input
            type="text"
            value={statusReason}
            onChange={(e) => setStatusReason(e.target.value)}
            placeholder="Ej: Cliente solicitó cancelación"
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
            disabled={saving}
            className="flex items-center gap-1.5 rounded-lg bg-blue-600 px-5 py-2 text-sm text-white shadow-lg shadow-black/5 transition-colors hover:bg-blue-700 disabled:opacity-50"
          >
            {saving && <Loader2 className="h-4 w-4 animate-spin" />}
            {saving ? "Guardando..." : "Guardar"}
          </button>
        </div>
      </form>
    </Modal>
  )
}
