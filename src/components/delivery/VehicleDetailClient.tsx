"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import type { Vehicle } from "@/lib/types"
import { toggleVehicle, deleteVehicle, updateVehicle } from "@/lib/actions/delivery"
import { useToast } from "@/components/ui/ToastProvider"
import EditModal from "@/components/ui/EditModal"
import ConfirmDialog from "@/components/ui/ConfirmDialog"
import Modal from "@/components/ui/Modal"
import { ArrowLeft, ToggleLeft, ToggleRight, Pencil, Trash2, Loader2 } from "lucide-react"
import Link from "next/link"
import type { FieldConfig } from "@/components/ui/EditModal"

const editFields: FieldConfig[] = [
  { name: "patente", label: "Patente", required: true },
  { name: "tipo", label: "Tipo", required: true },
  { name: "capacidadBidones", label: "Capacidad (bidones)", type: "number", required: true },
]

type Props = {
  vehicle: Vehicle
}

export default function VehicleDetailClient({ vehicle: initial }: Props) {
  const router = useRouter()
  const [vehicle, setVehicle] = useState(initial)
  const { showToast } = useToast()
  const [editOpen, setEditOpen] = useState(false)
  const [deleteOpen, setDeleteOpen] = useState(false)
  const [toggleOpen, setToggleOpen] = useState(false)
  const [toggleReason, setToggleReason] = useState("")
  const [saving, setSaving] = useState(false)
  const [deleting, setDeleting] = useState(false)
  const [toggling, setToggling] = useState(false)

  async function handleToggle() {
    setToggling(true)
    try {
      const motivo = vehicle.estado === "activo" ? (toggleReason || undefined) : undefined
      const res = await toggleVehicle(vehicle.idVehiculo, motivo)
      setVehicle((prev) => ({ ...prev, estado: res.nuevoEstado }))
      setToggleOpen(false)
      setToggleReason("")
      showToast("success", `Vehículo ${res.nuevoEstado === "activo" ? "activado" : "pausado"}`)
    } catch {
      showToast("error", "Error al cambiar estado del vehículo")
    } finally {
      setToggling(false)
    }
  }

  async function handleSave(data: Record<string, string>) {
    setSaving(true)
    try {
      const updated = await updateVehicle(vehicle.idVehiculo, {
        patente: data.patente,
        tipo: data.tipo,
        capacidadBidones: Number(data.capacidadBidones),
      })
      setVehicle(updated)
      setEditOpen(false)
      showToast("success", "Vehículo actualizado")
    } catch {
      showToast("error", "Error al actualizar vehículo")
    } finally {
      setSaving(false)
    }
  }

  async function handleDelete() {
    setDeleting(true)
    try {
      await deleteVehicle(vehicle.idVehiculo)
      showToast("success", "Vehículo eliminado")
      router.push("/dashboard/vehicles")
    } catch {
      showToast("error", "Error al eliminar vehículo")
      setDeleting(false)
      setDeleteOpen(false)
    }
  }

  const choferName = typeof vehicle.choferAsignado === "object" && vehicle.choferAsignado
    ? vehicle.choferAsignado.nombre
    : typeof vehicle.choferAsignado === "string"
    ? vehicle.choferAsignado
    : null

  return (
    <div>
      <div className="mb-6">
        <Link
          href="/dashboard/vehicles"
          className="inline-flex items-center gap-1 text-sm text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200"
        >
          <ArrowLeft className="h-4 w-4" />
          Volver a vehículos
        </Link>
      </div>

      <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-700 dark:bg-slate-800">
        <div className="flex items-start justify-between">
          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-100">
                {vehicle.patente}
              </h1>
              <span className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-medium ${
                vehicle.estado === "activo"
                  ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400"
                  : "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400"
              }`}>
                {vehicle.estado}
              </span>
            </div>
            <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">{vehicle.tipo}</p>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setToggleOpen(true)}
              className="flex items-center gap-1.5 rounded-lg border border-slate-300 px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50 dark:border-slate-600 dark:text-slate-300 dark:hover:bg-slate-700"
            >
              {vehicle.estado === "activo" ? <ToggleLeft className="h-4 w-4" /> : <ToggleRight className="h-4 w-4" />}
              {vehicle.estado === "activo" ? "Pausar" : "Activar"}
            </button>
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
            <p className="text-xs font-medium text-slate-400 uppercase">Patente</p>
            <p className="mt-1 font-mono text-sm text-slate-900 dark:text-slate-100">{vehicle.patente}</p>
          </div>
          <div>
            <p className="text-xs font-medium text-slate-400 uppercase">Tipo</p>
            <p className="mt-1 text-sm text-slate-900 dark:text-slate-100">{vehicle.tipo}</p>
          </div>
          <div>
            <p className="text-xs font-medium text-slate-400 uppercase">Capacidad</p>
            <p className="mt-1 text-sm text-slate-900 dark:text-slate-100">{vehicle.capacidadBidones} bidones</p>
          </div>
          <div>
            <p className="text-xs font-medium text-slate-400 uppercase">Estado</p>
            <p className="mt-1 text-sm text-slate-900 dark:text-slate-100">{vehicle.estado}</p>
          </div>
          <div>
            <p className="text-xs font-medium text-slate-400 uppercase">Chofer asignado</p>
            <p className="mt-1 text-sm text-slate-900 dark:text-slate-100">{choferName ?? "—"}</p>
          </div>
          <div>
            <p className="text-xs font-medium text-slate-400 uppercase">ID Vendedor</p>
            <p className="mt-1 font-mono text-sm text-slate-900 dark:text-slate-100">{vehicle.idVendedor}</p>
          </div>
          {vehicle.motivoPausa && (
            <div className="col-span-2">
              <p className="text-xs font-medium text-slate-400 uppercase">Motivo de pausa</p>
              <p className="mt-1 text-sm text-slate-900 dark:text-slate-100">{vehicle.motivoPausa}</p>
            </div>
          )}
        </div>
      </div>

      {toggleOpen && vehicle.estado === "activo" && (
        <Modal isOpen={toggleOpen} onClose={() => setToggleOpen(false)} title="Pausar vehículo">
          <div className="space-y-4 text-sm">
            <p className="text-slate-600 dark:text-slate-300">
              Indicá el motivo por el cual se pausa el vehículo <strong>{vehicle.patente}</strong>.
              Los choferes asignados serán desasignados automáticamente.
            </p>
            <div>
              <label className="mb-1 block text-xs font-medium text-slate-500 dark:text-slate-400">Motivo</label>
              <textarea
                value={toggleReason}
                onChange={(e) => setToggleReason(e.target.value)}
                rows={3}
                required
                placeholder="Ej: Mantenimiento, reparación, etc."
                className="w-full rounded-lg border border-white/30 bg-gradient-to-br from-white/30 to-slate-100/30 px-3 py-2 text-sm text-slate-900 placeholder-slate-400 shadow-lg shadow-black/5 backdrop-blur-xl focus:border-blue-500/50 focus:outline-none focus:ring-2 focus:ring-blue-500/20 dark:border-slate-700/40 dark:from-slate-900/40 dark:to-slate-800/40 dark:text-slate-100 dark:placeholder-slate-500"
              />
            </div>
            <div className="flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setToggleOpen(false)}
                className="rounded-lg border border-white/30 bg-gradient-to-br from-white/30 to-slate-100/30 px-4 py-2 text-sm text-slate-600 shadow-lg shadow-black/5 backdrop-blur-xl transition-colors hover:bg-white/40 dark:border-slate-700/40 dark:from-slate-900/40 dark:to-slate-800/40 dark:text-slate-400"
              >
                Cancelar
              </button>
              <button
                type="button"
                disabled={toggling || !toggleReason.trim()}
                onClick={handleToggle}
                className="flex items-center gap-1.5 rounded-lg bg-amber-600 px-4 py-2 text-sm text-white shadow-lg shadow-black/5 transition-colors hover:bg-amber-700 disabled:opacity-50"
              >
                {toggling && <Loader2 className="h-4 w-4 animate-spin" />}
                {toggling ? "Pausando..." : "Pausar vehículo"}
              </button>
            </div>
          </div>
        </Modal>
      )}

      {toggleOpen && vehicle.estado !== "activo" && (
        <Modal isOpen={toggleOpen} onClose={() => setToggleOpen(false)} title="Activar vehículo">
          <div className="space-y-4 text-sm">
            <p className="text-slate-600 dark:text-slate-300">
              ¿Estás seguro de activar el vehículo <strong>{vehicle.patente}</strong>?
            </p>
            <div className="flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setToggleOpen(false)}
                className="rounded-lg border border-white/30 bg-gradient-to-br from-white/30 to-slate-100/30 px-4 py-2 text-sm text-slate-600 shadow-lg shadow-black/5 backdrop-blur-xl transition-colors hover:bg-white/40 dark:border-slate-700/40 dark:from-slate-900/40 dark:to-slate-800/40 dark:text-slate-400"
              >
                Cancelar
              </button>
              <button
                type="button"
                disabled={toggling}
                onClick={handleToggle}
                className="flex items-center gap-1.5 rounded-lg bg-emerald-600 px-4 py-2 text-sm text-white shadow-lg shadow-black/5 transition-colors hover:bg-emerald-700 disabled:opacity-50"
              >
                {toggling && <Loader2 className="h-4 w-4 animate-spin" />}
                {toggling ? "Activando..." : "Activar vehículo"}
              </button>
            </div>
          </div>
        </Modal>
      )}

      <EditModal
        isOpen={editOpen}
        onClose={() => setEditOpen(false)}
        onSave={handleSave}
        title="Editar Vehículo"
        fields={editFields}
        initialData={{
          patente: vehicle.patente,
          tipo: vehicle.tipo,
          capacidadBidones: String(vehicle.capacidadBidones),
        }}
        saving={saving}
      />

      <ConfirmDialog
        isOpen={deleteOpen}
        onClose={() => setDeleteOpen(false)}
        onConfirm={handleDelete}
        title="Eliminar vehículo"
        message={`¿Estás seguro de eliminar el vehículo "${vehicle.patente}"? Se desasignarán los choferes asociados. Esta acción no se puede deshacer.`}
        confirmLabel="Sí, eliminar"
        loading={deleting}
      />
    </div>
  )
}
