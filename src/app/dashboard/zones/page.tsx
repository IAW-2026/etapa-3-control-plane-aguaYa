import { getZones, deleteZone } from "@/lib/actions/delivery"
import type { Zone, ListResponse } from "@/lib/types"
import { Search, ChevronLeft, ChevronRight } from "lucide-react"
import Link from "next/link"
import CreateZoneWrapper from "@/components/delivery/CreateZoneWrapper"
import DeleteButton from "@/components/ui/DeleteButton"

export const dynamic = "force-dynamic"

export default async function ZonesPage({
  searchParams,
}: {
  searchParams: Promise<{ page?: string; q?: string }>
}) {
  const { page: pageParam, q } = await searchParams
  const currentPage = parseInt(pageParam ?? "1", 10)

  let data: ListResponse<Zone> | null = null
  let error: string | null = null

  try {
    data = await getZones({
      page: String(currentPage),
      limit: "10",
      ...(q ? { q } : {}),
    })
  } catch (e) {
    error = e instanceof Error ? e.message : "Error al cargar zonas"
  }

  return (
    <div>
      <div className="mb-8 flex items-center justify-between">
        <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-100">Zonas</h1>
        <CreateZoneWrapper />
      </div>

      {error && (
        <div className="mb-6 rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-700">
          {error}
        </div>
      )}

      <div className="mb-6">
        <form method="GET" action="/dashboard/zones" className="relative max-w-md">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
          <input
            name="q"
            defaultValue={q ?? ""}
            placeholder="Buscar por nombre de zona..."
            className="w-full rounded-lg border border-slate-300 bg-white py-2.5 pl-10 pr-4 text-sm text-slate-900 placeholder-slate-400 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 dark:border-slate-600 dark:bg-slate-800 dark:text-slate-100 dark:placeholder-slate-500"
          />
        </form>
      </div>

      <div className="rounded-xl border border-slate-200 bg-white shadow-sm dark:border-slate-700 dark:bg-slate-800">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-slate-200 text-left dark:border-slate-700">
                <th className="px-6 py-4 font-medium text-slate-500 dark:text-slate-400">Nombre</th>
                <th className="px-6 py-4 font-medium text-slate-500 dark:text-slate-400">Choferes</th>
                <th className="px-6 py-4 font-medium text-slate-500 dark:text-slate-400">Empresas vinculadas</th>
                <th className="px-6 py-4 font-medium text-slate-500 dark:text-slate-400">Acciones</th>
              </tr>
            </thead>
            <tbody>
              {(!data || data.items.length === 0) && !error && (
                <tr>
                  <td colSpan={4} className="px-6 py-12 text-center text-slate-400">
                    No hay zonas registradas
                  </td>
                </tr>
              )}
              {data?.items.map((zone) => (
                <tr key={zone.idZona} className="border-b border-slate-100 hover:bg-slate-50 dark:border-slate-700 dark:hover:bg-slate-700/50">
                  <td className="px-6 py-4 font-medium">
                    <Link href={`/dashboard/zones/${zone.idZona}`} className="text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300">
                      {zone.nombre}
                    </Link>
                  </td>
                  <td className="px-6 py-4 text-slate-500 dark:text-slate-400">
                    {typeof zone.choferes === "number" ? zone.choferes : zone.choferes.length}
                  </td>
                  <td className="px-6 py-4 text-slate-500 dark:text-slate-400">
                    {zone.empresas.length > 0 ? zone.empresas.join(", ") : "—"}
                  </td>
                  <td className="px-6 py-4">
                    <DeleteButton
                      id={zone.idZona}
                      label={zone.nombre}
                      message={`¿Estás seguro de eliminar la zona "${zone.nombre}"? Se desasignarán los choferes y se eliminarán los vínculos con empresas. Esta acción no se puede deshacer.`}
                      deleteAction={deleteZone}
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
            <a
              href={`/dashboard/zones?page=${currentPage - 1}${q ? `&q=${q}` : ""}`}
              className="flex items-center gap-1 rounded-lg border border-slate-300 px-3 py-2 text-sm text-slate-600 hover:bg-slate-50 dark:border-slate-600 dark:text-slate-400 dark:hover:bg-slate-700"
            >
              <ChevronLeft className="h-4 w-4" />
              Anterior
            </a>
          )}
          <span className="px-3 text-sm text-slate-500 dark:text-slate-400">
            Página {currentPage} de {data.pageCount}
          </span>
          {currentPage < data.pageCount && (
            <a
              href={`/dashboard/zones?page=${currentPage + 1}${q ? `&q=${q}` : ""}`}
              className="flex items-center gap-1 rounded-lg border border-slate-300 px-3 py-2 text-sm text-slate-600 hover:bg-slate-50 dark:border-slate-600 dark:text-slate-400 dark:hover:bg-slate-700"
            >
              Siguiente
              <ChevronRight className="h-4 w-4" />
            </a>
          )}
        </div>
      )}
    </div>
  )
}
