"use client"

import { useState, useEffect } from "react"
import Modal from "@/components/ui/Modal"
import { createZone } from "@/lib/actions/delivery"
import { getVendorsSimple } from "@/lib/actions/vendor"
import { useToast } from "@/components/ui/ToastProvider"
import { Loader2, Building2, X } from "lucide-react"

type VendorItem = { id: string; name: string; clerkEmail: string }

type Props = {
  isOpen: boolean
  onClose: () => void
  onSuccess: () => void
}

export default function CreateZoneModal({ isOpen, onClose, onSuccess }: Props) {
  const { showToast } = useToast()
  const [nombre, setNombre] = useState("")
  const [saving, setSaving] = useState(false)
  const [vendors, setVendors] = useState<VendorItem[]>([])
  const [selectedEmpresas, setSelectedEmpresas] = useState<string[]>([])

  useEffect(() => {
    if (!isOpen) return
    setNombre("")
    setSelectedEmpresas([])
    getVendorsSimple().then(setVendors)
  }, [isOpen])

  function toggleEmpresa(id: string) {
    setSelectedEmpresas((prev) =>
      prev.includes(id) ? prev.filter((v) => v !== id) : [...prev, id]
    )
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!nombre.trim()) return
    setSaving(true)
    try {
      await createZone({ nombre: nombre.trim(), empresas: selectedEmpresas.length > 0 ? selectedEmpresas : undefined })
      showToast("success", "Zona creada correctamente")
      onSuccess()
      onClose()
    } catch {
      showToast("error", "Error al crear zona")
    } finally {
      setSaving(false)
    }
  }

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Nueva Zona">
      <form onSubmit={handleSubmit} className="space-y-4 text-sm">
        <div>
          <label className="mb-1 block text-xs font-medium text-slate-500 dark:text-slate-400">
            Nombre de la zona <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            value={nombre}
            onChange={(e) => setNombre(e.target.value)}
            required
            placeholder="Ej: Centro, Palihue, Alem..."
            className="w-full rounded-lg border border-white/30 bg-gradient-to-br from-white/30 to-slate-100/30 px-3 py-2 text-slate-900 placeholder-slate-400 shadow-lg shadow-black/5 backdrop-blur-xl focus:border-blue-500/50 focus:outline-none focus:ring-2 focus:ring-blue-500/20 dark:border-slate-700/40 dark:from-slate-900/40 dark:to-slate-800/40 dark:text-slate-100 dark:placeholder-slate-500"
          />
        </div>

        <div>
          <label className="mb-1 block text-xs font-medium text-slate-500 dark:text-slate-400">
            Empresas vinculadas
          </label>
          {selectedEmpresas.length > 0 && (
            <div className="mb-2 flex flex-wrap gap-1.5">
              {selectedEmpresas.map((id) => {
                const v = vendors.find((v) => v.id === id)
                return (
                  <span key={id} className="inline-flex items-center gap-1 rounded-full bg-blue-100 px-2.5 py-1 text-xs text-blue-700 dark:bg-blue-900/30 dark:text-blue-400">
                    {v?.name ?? id}
                    <button type="button" onClick={() => toggleEmpresa(id)} className="hover:text-blue-900 dark:hover:text-blue-200">
                      <X className="h-3 w-3" />
                    </button>
                  </span>
                )
              })}
            </div>
          )}
          <div className="max-h-36 overflow-y-auto rounded-lg border border-white/30 bg-gradient-to-br from-white/30 to-slate-100/30 p-2 shadow-lg shadow-black/5 backdrop-blur-xl dark:border-slate-700/40 dark:from-slate-900/40 dark:to-slate-800/40">
            {vendors.length === 0 ? (
              <p className="p-2 text-xs text-slate-400">Cargando empresas...</p>
            ) : (
              vendors.map((v) => (
                <label key={v.id} className="flex cursor-pointer items-center gap-2 rounded-md px-2 py-1.5 hover:bg-white/40 dark:hover:bg-white/5">
                  <input
                    type="checkbox"
                    checked={selectedEmpresas.includes(v.id)}
                    onChange={() => toggleEmpresa(v.id)}
                    className="h-4 w-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500"
                  />
                  <span className="text-xs text-slate-700 dark:text-slate-300">{v.name}</span>
                </label>
              ))
            )}
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
            {saving ? "Creando..." : "Crear Zona"}
          </button>
        </div>
      </form>
    </Modal>
  )
}
