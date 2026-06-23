"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import type { Driver } from "@/lib/types"
import { toggleDriver, updateDriver, deleteDriver, getZones, getVehicles } from "@/lib/actions/delivery"
import { useToast } from "@/components/ui/ToastProvider"
import Modal from "@/components/ui/Modal"
import ConfirmDialog from "@/components/ui/ConfirmDialog"
import { ArrowLeft, ToggleLeft, ToggleRight, Pencil, Trash2, Loader2 } from "lucide-react"
import Link from "next/link"
import type { Zone, Vehicle } from "@/lib/types"

export default function DriverDetailClient({ driver: initial }: { driver: Driver }) {
  const [driver, setDriver] = useState(initial)
  const [loading, setLoading] = useState(false)
  const router = useRouter()
  const { showToast } = useToast()

  const [editOpen, setEditOpen] = useState(false)
  const [deleteOpen, setDeleteOpen] = useState(false)
  const [saving, setSaving] = useState(false)
  const [deleting, setDeleting] = useState(false)

  const [editNombre, setEditNombre] = useState("")
  const [editTelefono, setEditTelefono] = useState("")
  const [editIdZona, setEditIdZona] = useState("")
  const [editIdVehiculo, setEditIdVehiculo] = useState("")

  const [zones, setZones] = useState<Zone[]>([])
  const [vehicles, setVehicles] = useState<Vehicle[]>([])

  useEffect(() => {
    if (editOpen) {
      setEditNombre(driver.nombre)
      setEditTelefono(driver.telefono ?? "")
      setEditIdZona(String(driver.idZona ?? driver.zona?.idZona ?? ""))
      setEditIdVehiculo(String(driver.idVehiculo ?? ""))
      Promise.all([
        getZones({ limit: "100" }),
        getVehicles({ limit: "100", estado: "activo", idVendedor: driver.idVendedor }),
      ]).then(([z, v]) => {
        setZones(z.items)
        setVehicles(v.items)
      })
    }
  }, [editOpen, driver])

  async function handleToggle() {
    setLoading(true)
    try {
      const res = await toggleDriver(driver.idChofer)
      setDriver((prev) => ({ ...prev, estado: res.nuevoEstado }))
      showToast("success", `Chofer ${res.nuevoEstado === "activo" ? "activado" : "desactivado"}`)
    } catch {
      showToast("error", "Error al cambiar estado del chofer")
    } finally {
      setLoading(false)
    }
  }

  async function handleSave(e: React.FormEvent) {
    e.preventDefault()
    setSaving(true)
    try {
      const updated = await updateDriver(driver.idChofer, {
        nombre: editNombre,
        telefono: editTelefono || undefined,
        idZona: editIdZona ? Number(editIdZona) : undefined,
        idVehiculo: editIdVehiculo ? Number(editIdVehiculo) : undefined,
      })
      setDriver(updated)
      setEditOpen(false)
      showToast("success", "Chofer actualizado")
    } catch {
      showToast("error", "Error al actualizar chofer")
    } finally {
      setSaving(false)
    }
  }

  async function handleDelete() {
    setDeleting(true)
    try {
      await deleteDriver(driver.idChofer)
      showToast("success", "Chofer eliminado")
      router.push("/dashboard/drivers")
    } catch {
      showToast("error", "Error al eliminar chofer")
      setDeleting(false)
      setDeleteOpen(false)
    }
  }

  const badgeColor: Record<string, string> = {
    activo: "bg-emerald-100 text-emerald-700",
    inactivo: "bg-red-100 text-red-700",
    pendiente: "bg-amber-100 text-amber-700",
    rechazado: "bg-slate-100 text-slate-700",
  }

  return (
    <div>
      <div className="mb-6">
        <Link
          href="/dashboard/drivers"
          className="inline-flex items-center gap-1 text-sm text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200"
        >
          <ArrowLeft className="h-4 w-4" />
          Volver a choferes
        </Link>
      </div>

      <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-700 dark:bg-slate-800">
        <div className="flex items-start justify-between">
          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-100">{driver.nombre}</h1>
              <span className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-medium ${badgeColor[driver.estado] ?? "bg-slate-100 text-slate-700"}`}>
                {driver.estado}
              </span>
            </div>
            {driver.nombreEmpresa && (
              <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">{driver.nombreEmpresa}</p>
            )}
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleToggle}
              disabled={loading}
              className="flex items-center gap-2 rounded-lg border border-slate-300 px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50 disabled:opacity-50 dark:border-slate-600 dark:text-slate-300 dark:hover:bg-slate-700"
            >
              {driver.estado === "activo" ? <ToggleLeft className="h-4 w-4" /> : <ToggleRight className="h-4 w-4" />}
              {driver.estado === "activo" ? "Desactivar" : "Activar"}
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
            <p className="text-xs font-medium text-slate-400 uppercase">Teléfono</p>
            <p className="mt-1 text-sm text-slate-900 dark:text-slate-100">{driver.telefono || "—"}</p>
          </div>
          <div>
            <p className="text-xs font-medium text-slate-400 uppercase">Disponible</p>
            <p className="mt-1 text-sm text-slate-900 dark:text-slate-100">{driver.disponible ? "Sí" : "No"}</p>
          </div>
          <div>
            <p className="text-xs font-medium text-slate-400 uppercase">Zona</p>
            <p className="mt-1 text-sm text-slate-900 dark:text-slate-100">{driver.zona?.nombre || "—"}</p>
          </div>
          <div>
            <p className="text-xs font-medium text-slate-400 uppercase">Vehículo</p>
            <p className="mt-1 text-sm text-slate-900 dark:text-slate-100">
              {driver.vehiculo ? `${driver.vehiculo.patente} (${driver.vehiculo.tipo})` : "—"}
            </p>
          </div>
          <div>
            <p className="text-xs font-medium text-slate-400 uppercase">Pedidos asignados</p>
            <p className="mt-1 text-sm text-slate-900 dark:text-slate-100">{driver.pedidosAsignados}</p>
          </div>
          <div>
            <p className="text-xs font-medium text-slate-400 uppercase">ID Vendedor</p>
            <p className="mt-1 text-sm font-mono text-slate-900 dark:text-slate-100">{driver.idVendedor}</p>
          </div>
        </div>
      </div>

      {editOpen && (
        <Modal isOpen={editOpen} onClose={() => setEditOpen(false)} title="Editar Chofer">
          <form onSubmit={handleSave} className="space-y-4 text-sm">
            <div>
              <label className="mb-1 block text-xs font-medium text-slate-500 dark:text-slate-400">Nombre</label>
              <input
                type="text"
                value={editNombre}
                onChange={(e) => setEditNombre(e.target.value)}
                required
                className="w-full rounded-lg border border-white/30 bg-gradient-to-br from-white/30 to-slate-100/30 px-3 py-2 text-slate-900 shadow-lg shadow-black/5 backdrop-blur-xl focus:border-blue-500/50 focus:outline-none focus:ring-2 focus:ring-blue-500/20 dark:border-slate-700/40 dark:from-slate-900/40 dark:to-slate-800/40 dark:text-slate-100"
              />
            </div>
            <div>
              <label className="mb-1 block text-xs font-medium text-slate-500 dark:text-slate-400">Teléfono</label>
              <input
                type="text"
                value={editTelefono}
                onChange={(e) => setEditTelefono(e.target.value)}
                className="w-full rounded-lg border border-white/30 bg-gradient-to-br from-white/30 to-slate-100/30 px-3 py-2 text-slate-900 shadow-lg shadow-black/5 backdrop-blur-xl focus:border-blue-500/50 focus:outline-none focus:ring-2 focus:ring-blue-500/20 dark:border-slate-700/40 dark:from-slate-900/40 dark:to-slate-800/40 dark:text-slate-100"
              />
            </div>
            <div>
              <label className="mb-1 block text-xs font-medium text-slate-500 dark:text-slate-400">Zona</label>
              <select
                value={editIdZona}
                onChange={(e) => setEditIdZona(e.target.value)}
                className="w-full rounded-lg border border-white/30 bg-gradient-to-br from-white/30 to-slate-100/30 px-3 py-2 text-slate-900 shadow-lg shadow-black/5 backdrop-blur-xl focus:border-blue-500/50 focus:outline-none focus:ring-2 focus:ring-blue-500/20 dark:border-slate-700/40 dark:from-slate-900/40 dark:to-slate-800/40 dark:text-slate-100"
              >
                <option value="">Sin zona</option>
                {zones.map((z) => (
                  <option key={z.idZona} value={z.idZona}>{z.nombre}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="mb-1 block text-xs font-medium text-slate-500 dark:text-slate-400">Vehículo</label>
              <select
                value={editIdVehiculo}
                onChange={(e) => setEditIdVehiculo(e.target.value)}
                className="w-full rounded-lg border border-white/30 bg-gradient-to-br from-white/30 to-slate-100/30 px-3 py-2 text-slate-900 shadow-lg shadow-black/5 backdrop-blur-xl focus:border-blue-500/50 focus:outline-none focus:ring-2 focus:ring-blue-500/20 dark:border-slate-700/40 dark:from-slate-900/40 dark:to-slate-800/40 dark:text-slate-100"
              >
                <option value="">Sin vehículo</option>
                {vehicles.map((v) => (
                  <option key={v.idVehiculo} value={v.idVehiculo}>
                    {v.patente} — {v.tipo}
                  </option>
                ))}
              </select>
            </div>
            <div className="flex justify-end gap-2 border-t border-white/20 pt-4 dark:border-slate-700/30">
              <button
                type="button"
                onClick={() => setEditOpen(false)}
                disabled={saving}
                className="rounded-lg border border-white/30 bg-gradient-to-br from-white/30 to-slate-100/30 px-4 py-2 text-sm text-slate-600 shadow-lg shadow-black/5 backdrop-blur-xl transition-colors hover:bg-white/40 disabled:opacity-50 dark:border-slate-700/40 dark:from-slate-900/40 dark:to-slate-800/40 dark:text-slate-400"
              >
                Cancelar
              </button>
              <button
                type="submit"
                disabled={saving}
                className="flex items-center gap-1.5 rounded-lg bg-blue-600 px-4 py-2 text-sm text-white shadow-lg shadow-black/5 transition-colors hover:bg-blue-700 disabled:opacity-50"
              >
                {saving && <Loader2 className="h-4 w-4 animate-spin" />}
                {saving ? "Guardando..." : "Guardar cambios"}
              </button>
            </div>
          </form>
        </Modal>
      )}

      <ConfirmDialog
        isOpen={deleteOpen}
        onClose={() => setDeleteOpen(false)}
        onConfirm={handleDelete}
        title="Eliminar chofer"
        message={`¿Estás seguro de eliminar a "${driver.nombre}"? Esta acción no se puede deshacer.`}
        confirmLabel="Sí, eliminar"
        loading={deleting}
      />
    </div>
  )
}
