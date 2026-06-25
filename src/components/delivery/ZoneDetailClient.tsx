"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import type { Zone } from "@/lib/types"
import { updateZone, deleteZone, getDriver } from "@/lib/actions/delivery"
import { getVendorsSimple } from "@/lib/actions/vendor"
import { useToast } from "@/components/ui/ToastProvider"
import EditModal from "@/components/ui/EditModal"
import ConfirmDialog from "@/components/ui/ConfirmDialog"
import { ArrowLeft, Pencil, Trash2, Users, Building2, Plus, X, Loader2, Check } from "lucide-react"
import Link from "next/link"
import type { FieldConfig } from "@/components/ui/EditModal"

type VendorItem = { id: string; name: string; clerkEmail: string }

const editFields: FieldConfig[] = [
  { name: "nombre", label: "Nombre de la zona", required: true },
]

type Props = {
  zone: Zone
}

export default function ZoneDetailClient({ zone: initial }: Props) {
  const router = useRouter()
  const [zone, setZone] = useState(initial)
  const { showToast } = useToast()
  const [editOpen, setEditOpen] = useState(false)
  const [deleteOpen, setDeleteOpen] = useState(false)
  const [saving, setSaving] = useState(false)
  const [deleting, setDeleting] = useState(false)

  const [vendors, setVendors] = useState<VendorItem[]>([])
  const [currentEmpresas, setCurrentEmpresas] = useState<string[]>([])
  const [showAdd, setShowAdd] = useState(false)
  const [savingEmpresas, setSavingEmpresas] = useState(false)
  const [driversEmpresa, setDriversEmpresa] = useState<Record<number, string | null>>({})

  useEffect(() => {
    getVendorsSimple().then(setVendors)
  }, [])

  useEffect(() => {
    setCurrentEmpresas(zone.empresas ?? [])
  }, [zone])

  useEffect(() => {
    if (!Array.isArray(zone.choferes) || zone.choferes.length === 0) return
    Promise.all(
      zone.choferes.map((c) =>
        getDriver(c.idChofer)
          .then((d) => ({ id: c.idChofer, empresa: d.nombreEmpresa ?? null }))
          .catch(() => ({ id: c.idChofer, empresa: null }))
      )
    ).then((results) => {
      const map: Record<number, string | null> = {}
      results.forEach((r) => { map[r.id] = r.empresa })
      setDriversEmpresa(map)
    })
  }, [zone])

  async function handleSave(data: Record<string, string>) {
    setSaving(true)
    try {
      const updated = await updateZone(zone.idZona, { nombre: data.nombre })
      setZone(updated)
      setEditOpen(false)
      showToast("success", "Zona actualizada")
    } catch {
      showToast("error", "Error al actualizar zona")
    } finally {
      setSaving(false)
    }
  }

  async function handleDelete() {
    setDeleting(true)
    try {
      await deleteZone(zone.idZona)
      showToast("success", "Zona eliminada")
      router.push("/dashboard/zones")
    } catch {
      showToast("error", "Error al eliminar zona")
      setDeleting(false)
      setDeleteOpen(false)
    }
  }

  async function handleSaveEmpresas() {
    setSavingEmpresas(true)
    try {
      const updated = await updateZone(zone.idZona, { nombre: zone.nombre, empresas: currentEmpresas })
      setZone(updated)
      setShowAdd(false)
      showToast("success", "Empresas actualizadas")
    } catch {
      showToast("error", "Error al actualizar empresas")
    } finally {
      setSavingEmpresas(false)
    }
  }

  function toggleEmpresa(id: string) {
    setCurrentEmpresas((prev) =>
      prev.includes(id) ? prev.filter((v) => v !== id) : [...prev, id]
    )
  }

  const choferesCount = Array.isArray(zone.choferes) ? zone.choferes.length : zone.choferes
  const choferesList = Array.isArray(zone.choferes) ? zone.choferes : []
  const empresasFiltradas = (currentEmpresas ?? []).filter((e) => e && e.trim())
  const vendorMap = new Map(vendors.map((v) => [v.id, v.name]))
  const availableVendors = vendors.filter((v) => !currentEmpresas.includes(v.id))

  return (
    <div>
      <div className="mb-6">
        <Link
          href="/dashboard/zones"
          className="inline-flex items-center gap-1 text-sm text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200"
        >
          <ArrowLeft className="h-4 w-4" />
          Volver a zonas
        </Link>
      </div>

      <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-700 dark:bg-slate-800">
        <div className="flex items-start justify-between">
          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-100">
                {zone.nombre}
              </h1>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setEditOpen(true)}
              className="flex items-center gap-1.5 rounded-lg bg-blue-600 px-3 py-2 text-sm text-white shadow-lg shadow-black/5 transition-colors hover:bg-blue-700"
            >
              <Pencil className="h-4 w-4" />
              Editar
            </button>
            <button
              type="button"
              onClick={() => setDeleteOpen(true)}
              className="flex items-center gap-1.5 rounded-lg border border-red-300/50 px-3 py-2 text-sm text-red-600 hover:bg-red-50/50 dark:border-red-800/40 dark:text-red-400 dark:hover:bg-red-900/20"
            >
              <Trash2 className="h-4 w-4" />
              Eliminar
            </button>
          </div>
        </div>

        <div className="mt-8 grid grid-cols-1 gap-6 sm:grid-cols-2">
          <div>
            <p className="text-xs font-medium text-slate-400 uppercase">Nombre</p>
            <p className="mt-1 text-sm text-slate-900 dark:text-slate-100">{zone.nombre}</p>
          </div>
          <div className="flex items-center gap-2">
            <Users className="h-4 w-4 text-slate-400" />
            <div>
              <p className="text-xs font-medium text-slate-400 uppercase">Choferes</p>
              <p className="mt-1 text-sm text-slate-900 dark:text-slate-100">{choferesCount}</p>
            </div>
          </div>
        </div>

        {choferesList.length > 0 && (
          <div className="mt-6">
            <div className="flex items-center gap-2 border-t border-slate-100 pt-4 dark:border-slate-700">
              <Users className="h-4 w-4 text-slate-400" />
              <p className="text-xs font-medium text-slate-400 uppercase">Choferes en esta zona</p>
            </div>
            <div className="mt-2 flex flex-wrap gap-2">
              {choferesList.map((c, i) => {
                const empresa = typeof c === "object" ? driversEmpresa[c.idChofer] : null
                return (
                  <span key={i} className="inline-flex items-center gap-1.5 rounded-full bg-slate-100 px-3 py-1 text-xs text-slate-700 dark:bg-slate-700 dark:text-slate-300">
                    <span>{typeof c === "string" ? c : c.nombre}</span>
                    {empresa && (
                      <span className="rounded-full bg-blue-100 px-1.5 py-0.5 text-[10px] text-blue-600 dark:bg-blue-900/30 dark:text-blue-400">
                        {empresa}
                      </span>
                    )}
                  </span>
                )
              })}
            </div>
          </div>
        )}

        <div className="mt-6">
          <div className="flex items-center justify-between gap-2 border-t border-slate-100 pt-4 dark:border-slate-700">
            <div className="flex items-center gap-2">
              <Building2 className="h-4 w-4 text-slate-400" />
              <p className="text-xs font-medium text-slate-400 uppercase">Empresas vinculadas</p>
            </div>
            <button
              type="button"
              onClick={() => setShowAdd(!showAdd)}
              className="flex items-center gap-1 rounded-lg px-2.5 py-1 text-xs font-medium text-blue-600 hover:bg-blue-50 dark:text-blue-400 dark:hover:bg-blue-900/20"
            >
              {showAdd ? (
                <>Cancelar</>
              ) : (
                <><Plus className="h-3.5 w-3.5" /> Agregar</>
              )}
            </button>
          </div>

          {empresasFiltradas.length > 0 && (
            <div className="mt-2 flex flex-wrap gap-1.5">
              {empresasFiltradas.map((id) => (
                <span key={id} className="inline-flex items-center gap-1 rounded-full bg-blue-100 px-3 py-1 text-xs text-blue-700 dark:bg-blue-900/30 dark:text-blue-400">
                  {vendorMap.get(id) ?? id}
                  <button
                    type="button"
                    onClick={() => toggleEmpresa(id)}
                    className="hover:text-blue-900 dark:hover:text-blue-200"
                  >
                    <X className="h-3 w-3" />
                  </button>
                </span>
              ))}
            </div>
          )}

          {empresasFiltradas.length === 0 && !showAdd && (
            <p className="mt-2 text-xs text-slate-400">Sin empresas vinculadas</p>
          )}

          {showAdd && (
            <div className="mt-3 space-y-2">
              {availableVendors.length === 0 ? (
                <p className="text-xs text-slate-400">Todas las empresas ya están vinculadas</p>
              ) : (
                <div className="max-h-36 overflow-y-auto rounded-lg border border-white/30 bg-gradient-to-br from-white/30 to-slate-100/30 p-2 shadow-lg shadow-black/5 backdrop-blur-xl dark:border-slate-700/40 dark:from-slate-900/40 dark:to-slate-800/40">
                  {availableVendors.map((v) => (
                    <label key={v.id} className="flex cursor-pointer items-center gap-2 rounded-md px-2 py-1.5 hover:bg-white/40 dark:hover:bg-white/5">
                      <input
                        type="checkbox"
                        checked={currentEmpresas.includes(v.id)}
                        onChange={() => toggleEmpresa(v.id)}
                        className="h-4 w-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500"
                      />
                      <span className="text-xs text-slate-700 dark:text-slate-300">{v.name}</span>
                    </label>
                  ))}
                </div>
              )}
              <div className="flex justify-end">
                <button
                  type="button"
                  onClick={handleSaveEmpresas}
                  disabled={savingEmpresas}
                  className="flex items-center gap-1 rounded-lg bg-blue-600 px-3 py-1.5 text-xs text-white shadow-lg shadow-black/5 transition-colors hover:bg-blue-700 disabled:opacity-50"
                >
                  {savingEmpresas ? (
                    <Loader2 className="h-3 w-3 animate-spin" />
                  ) : (
                    <Check className="h-3 w-3" />
                  )}
                  {savingEmpresas ? "Guardando..." : "Guardar empresas"}
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      <EditModal
        isOpen={editOpen}
        onClose={() => setEditOpen(false)}
        onSave={handleSave}
        title="Editar Zona"
        fields={editFields}
        initialData={{ nombre: zone.nombre }}
        saving={saving}
      />

      <ConfirmDialog
        isOpen={deleteOpen}
        onClose={() => setDeleteOpen(false)}
        onConfirm={handleDelete}
        title="Eliminar zona"
        message={`¿Estás seguro de eliminar la zona "${zone.nombre}"? Se desasignarán los choferes y se eliminarán los vínculos con empresas. Esta acción no se puede deshacer.`}
        confirmLabel="Sí, eliminar"
        loading={deleting}
      />
    </div>
  )
}
