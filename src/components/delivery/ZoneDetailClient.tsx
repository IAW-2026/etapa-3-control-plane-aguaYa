"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import type { Zone } from "@/lib/types"
import { updateZone, deleteZone } from "@/lib/actions/delivery"
import { useToast } from "@/components/ui/ToastProvider"
import EditModal from "@/components/ui/EditModal"
import ConfirmDialog from "@/components/ui/ConfirmDialog"
import { ArrowLeft, Pencil, Trash2, Users, Building2 } from "lucide-react"
import Link from "next/link"
import type { FieldConfig } from "@/components/ui/EditModal"

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

  const choferesCount = Array.isArray(zone.choferes) ? zone.choferes.length : zone.choferes
  const choferesList = Array.isArray(zone.choferes) ? zone.choferes : []
  const empresasFiltradas = zone.empresas.filter((e) => e && e.trim())

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
              {choferesList.map((c, i) => (
                <span key={i} className="inline-flex rounded-full bg-slate-100 px-3 py-1 text-xs text-slate-700 dark:bg-slate-700 dark:text-slate-300">
                  {typeof c === "string" ? c : c.nombre}
                </span>
              ))}
            </div>
          </div>
        )}

        {empresasFiltradas.length > 0 && (
          <div className="mt-6">
            <div className="flex items-center gap-2 border-t border-slate-100 pt-4 dark:border-slate-700">
              <Building2 className="h-4 w-4 text-slate-400" />
              <p className="text-xs font-medium text-slate-400 uppercase">Empresas vinculadas</p>
            </div>
            <div className="mt-2 flex flex-wrap gap-2">
              {empresasFiltradas.map((empresa, i) => (
                <span key={i} className="inline-flex rounded-full bg-blue-100 px-3 py-1 text-xs text-blue-700 dark:bg-blue-900/30 dark:text-blue-400">
                  {empresa}
                </span>
              ))}
            </div>
          </div>
        )}
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
