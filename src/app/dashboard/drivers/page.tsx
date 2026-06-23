import { getDrivers, deleteDriver } from "@/lib/actions/delivery"
import type { Driver, ListResponse } from "@/lib/types"
import { Search, ChevronLeft, ChevronRight, Plus } from "lucide-react"
import Link from "next/link"
import CreateDriverWrapper from "./CreateDriverWrapper"
import DeleteButton from "@/components/ui/DeleteButton"

export const dynamic = "force-dynamic"

export default async function DriversPage({
  searchParams,
}: {
  searchParams: Promise<{ page?: string; q?: string; estado?: string }>
}) {
  const { page: pageParam, q, estado } = await searchParams
  const currentPage = parseInt(pageParam ?? "1", 10)
  const activeTab = estado ?? ""

  let data: ListResponse<Driver> | null = null
  let error: string | null = null

  try {
    data = await getDrivers({
      page: String(currentPage),
      limit: "10",
      ...(q ? { q } : {}),
      ...(estado ? { estado } : {}),
    })
  } catch (e) {
    error = e instanceof Error ? e.message : "Error al cargar choferes"
  }

  function tabUrl(value: string) {
    const params = new URLSearchParams()
    if (value) params.set("estado", value)
    if (q) params.set("q", q)
    const qs = params.toString()
    return `/dashboard/drivers${qs ? `?${qs}` : ""}`
  }

  return (
    <div>
      <div className="mb-8 flex items-center justify-between">
        <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-100">Choferes</h1>
        <CreateDriverWrapper />
      </div>

      {error && (
        <div className="mb-6 rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-700">
          {error}
        </div>
      )}

      <div className="mb-4 flex items-center gap-2">
        <Link
          href={tabUrl("")}
          className={`rounded-lg px-4 py-2 text-sm font-medium transition-colors ${
            activeTab === ""
              ? "bg-blue-600 text-white"
              : "bg-slate-100 text-slate-600 hover:bg-slate-200 dark:bg-slate-700 dark:text-slate-300 dark:hover:bg-slate-600"
          }`}
        >
          Todos
        </Link>
        <Link
          href={tabUrl("activo")}
          className={`rounded-lg px-4 py-2 text-sm font-medium transition-colors ${
            activeTab === "activo"
              ? "bg-blue-600 text-white"
              : "bg-slate-100 text-slate-600 hover:bg-slate-200 dark:bg-slate-700 dark:text-slate-300 dark:hover:bg-slate-600"
          }`}
        >
          Activos
        </Link>
        <Link
          href={tabUrl("inactivo")}
          className={`rounded-lg px-4 py-2 text-sm font-medium transition-colors ${
            activeTab === "inactivo"
              ? "bg-blue-600 text-white"
              : "bg-slate-100 text-slate-600 hover:bg-slate-200 dark:bg-slate-700 dark:text-slate-300 dark:hover:bg-slate-600"
          }`}
        >
          Inactivos
        </Link>
      </div>

      <div className="mb-6">
        <form method="GET" action="/dashboard/drivers" className="relative max-w-md">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
          <input
            name="q"
            defaultValue={q ?? ""}
            placeholder="Buscar por nombre..."
            className="w-full rounded-lg border border-slate-300 bg-white py-2.5 pl-10 pr-4 text-sm text-slate-900 placeholder-slate-400 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 dark:border-slate-600 dark:bg-slate-800 dark:text-slate-100 dark:placeholder-slate-500"
          />
          {estado && <input type="hidden" name="estado" value={estado} />}
        </form>
      </div>

      <div className="rounded-xl border border-slate-200 bg-white shadow-sm dark:border-slate-700 dark:bg-slate-800">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-slate-200 text-left dark:border-slate-700">
                <th className="px-6 py-4 font-medium text-slate-500 dark:text-slate-400">Nombre</th>
                <th className="px-6 py-4 font-medium text-slate-500 dark:text-slate-400">Teléfono</th>
                <th className="px-6 py-4 font-medium text-slate-500 dark:text-slate-400">Estado</th>
                <th className="px-6 py-4 font-medium text-slate-500 dark:text-slate-400">Disponible</th>
                <th className="px-6 py-4 font-medium text-slate-500 dark:text-slate-400">Zona</th>
                <th className="px-6 py-4 font-medium text-slate-500 dark:text-slate-400">Vehículo</th>
                <th className="px-6 py-4 font-medium text-slate-500 dark:text-slate-400">Pedidos</th>
                <th className="px-6 py-4 font-medium text-slate-500 dark:text-slate-400">Acciones</th>
              </tr>
            </thead>
            <tbody>
              {(!data || data.items.length === 0) && !error && (
                <tr>
                  <td colSpan={8} className="px-6 py-12 text-center text-slate-400">
                    No hay choferes registrados
                  </td>
                </tr>
              )}
              {data?.items.map((driver) => (
                <tr key={driver.idChofer} className="border-b border-slate-100 hover:bg-slate-50 dark:border-slate-700 dark:hover:bg-slate-700/50">
                  <td className="px-6 py-4">
                    <Link href={`/dashboard/drivers/${driver.idChofer}`} className="font-medium text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300">
                      {driver.nombre}
                    </Link>
                  </td>
                  <td className="px-6 py-4 text-slate-500 dark:text-slate-400">{driver.telefono || "—"}</td>
                  <td className="px-6 py-4">
                    <span className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-medium ${
                      driver.estado === "activo"
                        ? "bg-emerald-100 text-emerald-700"
                        : driver.estado === "pendiente"
                        ? "bg-amber-100 text-amber-700"
                        : "bg-red-100 text-red-700"
                    }`}>
                      {driver.estado}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-slate-500 dark:text-slate-400">
                    {driver.disponible ? "Sí" : "No"}
                  </td>
                  <td className="px-6 py-4 text-slate-500 dark:text-slate-400">{driver.zona?.nombre || "—"}</td>
                  <td className="px-6 py-4 text-slate-500 dark:text-slate-400">{driver.vehiculo?.patente || "—"}</td>
                  <td className="px-6 py-4 text-slate-500 dark:text-slate-400">{driver.pedidosAsignados}</td>
                  <td className="px-6 py-4">
                    <DeleteButton
                      id={driver.idChofer}
                      label={driver.nombre}
                      message={`¿Estás seguro de eliminar a "${driver.nombre}"? Esta acción no se puede deshacer.`}
                      deleteAction={deleteDriver}
                    />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {data && data.pageCount > 1 && (
        <div className="mt-6 flex items-center justify-center gap-2">
          {currentPage > 1 && (
            <Link
              href={`/dashboard/drivers?page=${currentPage - 1}${q ? `&q=${q}` : ""}${estado ? `&estado=${estado}` : ""}`}
              className="flex items-center gap-1 rounded-lg border border-slate-300 px-3 py-2 text-sm text-slate-600 hover:bg-slate-50 dark:border-slate-600 dark:text-slate-400 dark:hover:bg-slate-700"
            >
              <ChevronLeft className="h-4 w-4" />
              Anterior
            </Link>
          )}
          <span className="px-3 text-sm text-slate-500 dark:text-slate-400">
            Página {currentPage} de {data.pageCount}
          </span>
          {currentPage < data.pageCount && (
            <Link
              href={`/dashboard/drivers?page=${currentPage + 1}${q ? `&q=${q}` : ""}${estado ? `&estado=${estado}` : ""}`}
              className="flex items-center gap-1 rounded-lg border border-slate-300 px-3 py-2 text-sm text-slate-600 hover:bg-slate-50 dark:border-slate-600 dark:text-slate-400 dark:hover:bg-slate-700"
            >
              Siguiente
              <ChevronRight className="h-4 w-4" />
            </Link>
          )}
        </div>
      )}
    </div>
  )
}
