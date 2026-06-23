import { getVehicles, getLogisticsAdminsSimple, deleteVehicle } from "@/lib/actions/delivery"
import type { Vehicle, ListResponse } from "@/lib/types"
import { Search, ChevronLeft, ChevronRight } from "lucide-react"
import Link from "next/link"
import CreateVehicleWrapper from "./CreateVehicleWrapper"
import DeleteButton from "@/components/ui/DeleteButton"

export const dynamic = "force-dynamic"

export default async function VehiclesPage({
  searchParams,
}: {
  searchParams: Promise<{ page?: string; q?: string; estado?: string }>
}) {
  const { page: pageParam, q, estado } = await searchParams
  const currentPage = parseInt(pageParam ?? "1", 10)
  const activeTab = estado ?? ""

  let data: ListResponse<Vehicle> | null = null
  let error: string | null = null
  let vendorMap = new Map<string, string>()

  try {
    const [vehicles, admins] = await Promise.all([
      getVehicles({
        page: String(currentPage),
        limit: "10",
        ...(q ? { q } : {}),
        ...(estado ? { estado } : {}),
      }),
      getLogisticsAdminsSimple(),
    ])
    data = vehicles
    vendorMap = new Map(admins.map((a) => [a.id, a.name]))
  } catch (e) {
    error = e instanceof Error ? e.message : "Error al cargar vehículos"
  }

  function tabUrl(value: string) {
    const params = new URLSearchParams()
    if (value) params.set("estado", value)
    if (q) params.set("q", q)
    const qs = params.toString()
    return `/dashboard/vehicles${qs ? `?${qs}` : ""}`
  }

  return (
    <div>
      <div className="mb-8 flex items-center justify-between">
        <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-100">Vehículos</h1>
        <CreateVehicleWrapper />
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
          href={tabUrl("pausado")}
          className={`rounded-lg px-4 py-2 text-sm font-medium transition-colors ${
            activeTab === "pausado"
              ? "bg-blue-600 text-white"
              : "bg-slate-100 text-slate-600 hover:bg-slate-200 dark:bg-slate-700 dark:text-slate-300 dark:hover:bg-slate-600"
          }`}
        >
          Pausados
        </Link>
      </div>

      <div className="mb-6">
        <form method="GET" action="/dashboard/vehicles" className="relative max-w-md">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
          <input
            name="q"
            defaultValue={q ?? ""}
            placeholder="Buscar por patente..."
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
                <th className="px-6 py-4 font-medium text-slate-500 dark:text-slate-400">Patente</th>
                <th className="px-6 py-4 font-medium text-slate-500 dark:text-slate-400">Tipo</th>
                <th className="px-6 py-4 font-medium text-slate-500 dark:text-slate-400">Capacidad</th>
                <th className="px-6 py-4 font-medium text-slate-500 dark:text-slate-400">Estado</th>
                <th className="px-6 py-4 font-medium text-slate-500 dark:text-slate-400">Empresa</th>
                <th className="px-6 py-4 font-medium text-slate-500 dark:text-slate-400">Chofer</th>
                <th className="px-6 py-4 font-medium text-slate-500 dark:text-slate-400">Acciones</th>
              </tr>
            </thead>
            <tbody>
              {(!data || data.items.length === 0) && !error && (
                <tr>
                  <td colSpan={7} className="px-6 py-12 text-center text-slate-400">
                    No hay vehículos registrados
                  </td>
                </tr>
              )}
              {data?.items.map((vehicle) => (
                <tr key={vehicle.idVehiculo} className="border-b border-slate-100 hover:bg-slate-50 dark:border-slate-700 dark:hover:bg-slate-700/50">
                  <td className="px-6 py-4 font-mono text-sm font-medium">
                    <Link href={`/dashboard/vehicles/${vehicle.idVehiculo}`} className="text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300">
                      {vehicle.patente}
                    </Link>
                  </td>
                  <td className="px-6 py-4 text-slate-500 dark:text-slate-400">{vehicle.tipo}</td>
                  <td className="px-6 py-4 text-slate-500 dark:text-slate-400">{vehicle.capacidadBidones} bidones</td>
                  <td className="px-6 py-4">
                    <span className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-medium ${
                       vehicle.estado === "activo"
                         ? "bg-emerald-100 text-emerald-700"
                         : "bg-amber-100 text-amber-700"
                     }`}>
                       {vehicle.estado}
                     </span>
                   </td>
                   <td className="px-6 py-4 text-slate-500 dark:text-slate-400">
                     {vendorMap.get(vehicle.idVendedor) || vehicle.idVendedor}
                   </td>
                   <td className="px-6 py-4 text-slate-500 dark:text-slate-400">
                     {typeof vehicle.choferAsignado === "object" && vehicle.choferAsignado
                       ? vehicle.choferAsignado.nombre
                       : typeof vehicle.choferAsignado === "string"
                       ? vehicle.choferAsignado
                       : "—"}
                   </td>
                   <td className="px-6 py-4">
                     <DeleteButton
                       id={vehicle.idVehiculo}
                       label={vehicle.patente}
                       message={`¿Estás seguro de eliminar el vehículo "${vehicle.patente}"? Se desasignarán los choferes asociados. Esta acción no se puede deshacer.`}
                       deleteAction={deleteVehicle}
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
              href={`/dashboard/vehicles?page=${currentPage - 1}${q ? `&q=${q}` : ""}${estado ? `&estado=${estado}` : ""}`}
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
              href={`/dashboard/vehicles?page=${currentPage + 1}${q ? `&q=${q}` : ""}${estado ? `&estado=${estado}` : ""}`}
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
