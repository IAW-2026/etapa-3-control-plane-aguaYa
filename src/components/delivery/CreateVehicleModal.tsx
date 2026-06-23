"use client"

import { useState, useEffect } from "react"
import Modal from "@/components/ui/Modal"
import { createVehicle } from "@/lib/actions/delivery"
import { getVendorsSimple } from "@/lib/actions/vendor"
import { useToast } from "@/components/ui/ToastProvider"
import { Loader2 } from "lucide-react"

const TIPOS_VEHICULO = ["Camioneta", "Furgón", "Camión", "Moto", "Auto", "Utilitario"]

type Props = {
  isOpen: boolean
  onClose: () => void
  onSuccess: () => void
}

export default function CreateVehicleModal({ isOpen, onClose, onSuccess }: Props) {
  const { showToast } = useToast()

  const [patente, setPatente] = useState("")
  const [tipo, setTipo] = useState("")
  const [capacidad, setCapacidad] = useState("")
  const [idVendedor, setIdVendedor] = useState("")
  const [saving, setSaving] = useState(false)
  const [vendors, setVendors] = useState<{ id: string; name: string }[]>([])

  useEffect(() => {
    if (!isOpen) return
    setPatente("")
    setTipo("")
    setCapacidad("")
    setIdVendedor("")
    getVendorsSimple().then(setVendors)
  }, [isOpen])

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!patente || !tipo || !capacidad || !idVendedor) return
    setSaving(true)
    try {
      await createVehicle({
        patente: patente.toUpperCase(),
        tipo,
        capacidadBidones: Number(capacidad),
        idVendedor,
      })
      showToast("success", "Vehículo creado correctamente")
      onSuccess()
      onClose()
    } catch {
      showToast("error", "Error al crear vehículo")
    } finally {
      setSaving(false)
    }
  }

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Nuevo Vehículo">
      <form onSubmit={handleSubmit} className="space-y-4 text-sm">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="mb-1 block text-xs font-medium text-slate-500 dark:text-slate-400">
              Patente <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={patente}
              onChange={(e) => setPatente(e.target.value)}
              required
              placeholder="ABC123"
              className="w-full rounded-lg border border-white/30 bg-gradient-to-br from-white/30 to-slate-100/30 px-3 py-2 font-mono text-slate-900 placeholder-slate-400 shadow-lg shadow-black/5 backdrop-blur-xl focus:border-blue-500/50 focus:outline-none focus:ring-2 focus:ring-blue-500/20 dark:border-slate-700/40 dark:from-slate-900/40 dark:to-slate-800/40 dark:text-slate-100 dark:placeholder-slate-500"
            />
          </div>

          <div>
            <label className="mb-1 block text-xs font-medium text-slate-500 dark:text-slate-400">
              Tipo <span className="text-red-500">*</span>
            </label>
            <select
              value={tipo}
              onChange={(e) => setTipo(e.target.value)}
              required
              className="w-full rounded-lg border border-white/30 bg-gradient-to-br from-white/30 to-slate-100/30 px-3 py-2 text-slate-900 shadow-lg shadow-black/5 backdrop-blur-xl focus:border-blue-500/50 focus:outline-none focus:ring-2 focus:ring-blue-500/20 dark:border-slate-700/40 dark:from-slate-900/40 dark:to-slate-800/40 dark:text-slate-100"
            >
              <option value="">Seleccionar tipo</option>
              {TIPOS_VEHICULO.map((t) => (
                <option key={t} value={t}>{t}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="mb-1 block text-xs font-medium text-slate-500 dark:text-slate-400">
              Capacidad (bidones) <span className="text-red-500">*</span>
            </label>
            <input
              type="number"
              value={capacidad}
              onChange={(e) => setCapacidad(e.target.value)}
              required
              min="1"
              placeholder="20"
              className="w-full rounded-lg border border-white/30 bg-gradient-to-br from-white/30 to-slate-100/30 px-3 py-2 text-slate-900 placeholder-slate-400 shadow-lg shadow-black/5 backdrop-blur-xl focus:border-blue-500/50 focus:outline-none focus:ring-2 focus:ring-blue-500/20 dark:border-slate-700/40 dark:from-slate-900/40 dark:to-slate-800/40 dark:text-slate-100 dark:placeholder-slate-500"
            />
          </div>

          <div>
            <label className="mb-1 block text-xs font-medium text-slate-500 dark:text-slate-400">
              Vendedor <span className="text-red-500">*</span>
            </label>
            <select
              value={idVendedor}
              onChange={(e) => setIdVendedor(e.target.value)}
              required
              className="w-full rounded-lg border border-white/30 bg-gradient-to-br from-white/30 to-slate-100/30 px-3 py-2 text-slate-900 shadow-lg shadow-black/5 backdrop-blur-xl focus:border-blue-500/50 focus:outline-none focus:ring-2 focus:ring-blue-500/20 dark:border-slate-700/40 dark:from-slate-900/40 dark:to-slate-800/40 dark:text-slate-100"
            >
              <option value="">Seleccionar vendedor</option>
              {vendors.map((v) => (
                <option key={v.id} value={v.id}>{v.name}</option>
              ))}
            </select>
          </div>
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
            {saving ? "Creando..." : "Crear Vehículo"}
          </button>
        </div>
      </form>
    </Modal>
  )
}
