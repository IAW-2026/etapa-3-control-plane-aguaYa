"use client"

import { useState, useEffect } from "react"
import Modal from "@/components/ui/Modal"
import { createLogisticsAdmin, getLogisticsAdminsSimple } from "@/lib/actions/delivery"
import { getVendorsSimple } from "@/lib/actions/vendor"
import { useToast } from "@/components/ui/ToastProvider"
import { Loader2 } from "lucide-react"

type VendorOption = { id: string; name: string; clerkEmail: string }

type Props = {
  isOpen: boolean
  onClose: () => void
  onSuccess: () => void
}

export default function CreateLogisticsAdminModal({ isOpen, onClose, onSuccess }: Props) {
  const { showToast } = useToast()

  const [email, setEmail] = useState("")
  const [idVendedor, setIdVendedor] = useState("")
  const [saving, setSaving] = useState(false)
  const [vendors, setVendors] = useState<VendorOption[]>([])
  const [existingAdminIds, setExistingAdminIds] = useState<Set<string>>(new Set())
  const [created, setCreated] = useState(false)

  useEffect(() => {
    if (!isOpen) return
    setCreated(false)
    setEmail("")
    setIdVendedor("")

    Promise.all([
      getVendorsSimple(),
      getLogisticsAdminsSimple(),
    ]).then(([v, admins]) => {
      setVendors(v)
      setExistingAdminIds(new Set(admins.map((a) => a.id)))
    })
  }, [isOpen])

  const availableVendors = vendors.filter((v) => !existingAdminIds.has(v.id))

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!email || !idVendedor) return
    setSaving(true)
    try {
      await createLogisticsAdmin({ email, idVendedor })
      setCreated(true)
      showToast("success", "Administrador creado correctamente")
    } catch (e) {
      const msg = e instanceof Error ? e.message.toLowerCase() : ""
      if (msg.includes("no se encontró")) {
        showToast("error", "No se encontró un usuario con ese email en Clerk")
      } else {
        showToast("error", "Error al crear administrador")
      }
      setSaving(false)
    }
  }

  function handleCloseSuccess() {
    onClose()
    onSuccess()
  }

  if (created) {
    return (
      <Modal isOpen={isOpen} onClose={handleCloseSuccess} title="Logístico creado exitosamente">
        <div className="space-y-4 text-sm">
          <p className="text-slate-600 dark:text-slate-300">
            El logístico para <strong>{vendors.find((v) => v.id === idVendedor)?.name}</strong> fue creado correctamente.
          </p>
          <p className="text-slate-500 dark:text-slate-400">
            El usuario ya existía en Clerk y ahora tiene permisos de logístico en la app de delivery.
          </p>
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
    <Modal isOpen={isOpen} onClose={onClose} title="Nuevo Administrador">
      <form onSubmit={handleSubmit} className="space-y-4 text-sm">
        <div>
          <label className="mb-1 block text-xs font-medium text-slate-500 dark:text-slate-400">
            Empresa <span className="text-red-500">*</span>
          </label>
          {availableVendors.length === 0 ? (
            <p className="rounded-lg border border-amber-200 bg-amber-50 px-3 py-2 text-sm text-amber-700 dark:border-amber-800/40 dark:bg-amber-900/20 dark:text-amber-400">
              Todas las empresas ya tienen un administrador asignado.
            </p>
          ) : (
            <select
              value={idVendedor}
              onChange={(e) => {
                const selected = vendors.find((v) => v.id === e.target.value)
                setIdVendedor(e.target.value)
                setEmail(selected?.clerkEmail ?? "")
              }}
              required
              className="w-full rounded-lg border border-white/30 bg-gradient-to-br from-white/30 to-slate-100/30 px-3 py-2 text-slate-900 shadow-lg shadow-black/5 backdrop-blur-xl focus:border-blue-500/50 focus:outline-none focus:ring-2 focus:ring-blue-500/20 dark:border-slate-700/40 dark:from-slate-900/40 dark:to-slate-800/40 dark:text-slate-100"
            >
              <option value="">Seleccionar empresa</option>
              {availableVendors.map((v) => (
                <option key={v.id} value={v.id}>{v.name}</option>
              ))}
            </select>
          )}
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
            disabled={saving || !idVendedor || availableVendors.length === 0}
            className="flex items-center gap-1.5 rounded-lg bg-blue-600 px-5 py-2 text-sm text-white shadow-lg shadow-black/5 transition-colors hover:bg-blue-700 disabled:opacity-50"
          >
            {saving && <Loader2 className="h-4 w-4 animate-spin" />}
            {saving ? "Creando..." : "Crear Administrador"}
          </button>
        </div>
      </form>
    </Modal>
  )
}
