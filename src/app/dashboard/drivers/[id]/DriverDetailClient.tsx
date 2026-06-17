"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import type { Driver } from "@/lib/types"
import { toggleDriver } from "@/lib/actions/delivery"
import { useToast } from "@/components/ui/ToastProvider"
import { ArrowLeft, ToggleLeft, ToggleRight } from "lucide-react"
import Link from "next/link"

export default function DriverDetailClient({ driver: initial }: { driver: Driver }) {
  const [driver, setDriver] = useState(initial)
  const [loading, setLoading] = useState(false)
  const router = useRouter()
  const { showToast } = useToast()

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

          <button
            onClick={handleToggle}
            disabled={loading}
            className="flex items-center gap-2 rounded-lg border border-slate-300 px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50 disabled:opacity-50 dark:border-slate-600 dark:text-slate-300 dark:hover:bg-slate-700"
          >
            {driver.estado === "activo" ? <ToggleLeft className="h-4 w-4" /> : <ToggleRight className="h-4 w-4" />}
            {driver.estado === "activo" ? "Desactivar" : "Activar"}
          </button>
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
    </div>
  )
}
