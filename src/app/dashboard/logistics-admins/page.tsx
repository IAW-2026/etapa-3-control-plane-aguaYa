import { getLogisticsAdmins, deleteLogisticsAdmin } from "@/lib/actions/delivery"
import type { LogisticsAdmin, ListResponse } from "@/lib/types"
import { Search, ChevronLeft, ChevronRight, Pencil } from "lucide-react"
import Link from "next/link"
import DeleteButton from "@/components/ui/DeleteButton"
import CreateLogisticsAdminWrapper from "@/components/delivery/CreateLogisticsAdminWrapper"

export const dynamic = "force-dynamic"

export default async function LogisticsAdminsPage({
  searchParams,
}: {
  searchParams: Promise<{ page?: string; q?: string; isBlocked?: string }>
}) {
  const { page: pageParam, q, isBlocked } = await searchParams
  const currentPage = parseInt(pageParam ?? "1", 10)
  const activeTab = isBlocked ?? ""

  let data: ListResponse<LogisticsAdmin> | null = null
  let error: string | null = null

  try {
    data = await getLogisticsAdmins({
      page: String(currentPage),
      limit: "10",
      ...(q ? { q } : {}),
      ...(isBlocked ? { isBlocked } : {}),
    })
  } catch (e) {
    error = e instanceof Error ? e.message : "Error al cargar administradores"
  }

  function tabUrl(value: string) {
    const params = new URLSearchParams()
    if (value) params.set("isBlocked", value)
    if (q) params.set("q", q)
    const qs = params.toString()
    return `/dashboard/logistics-admins${qs ? `?${qs}` : ""}`
  }

  return (
    <div>
      <div className="mb-8 flex items-center justify-between">
        <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-100">Administradores</h1>
        <CreateLogisticsAdminWrapper />
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
          href={tabUrl("true")}
          className={`rounded-lg px-4 py-2 text-sm font-medium transition-colors ${
            activeTab === "true"
              ? "bg-blue-600 text-white"
              : "bg-slate-100 text-slate-600 hover:bg-slate-200 dark:bg-slate-700 dark:text-slate-300 dark:hover:bg-slate-600"
          }`}
        >
          Bloqueados
        </Link>
        <Link
          href={tabUrl("false")}
          className={`rounded-lg px-4 py-2 text-sm font-medium transition-colors ${
            activeTab === "false"
              ? "bg-blue-600 text-white"
              : "bg-slate-100 text-slate-600 hover:bg-slate-200 dark:bg-slate-700 dark:text-slate-300 dark:hover:bg-slate-600"
          }`}
        >
          Activos
        </Link>
      </div>

      <div className="mb-6">
        <form method="GET" action="/dashboard/logistics-admins" className="relative max-w-md">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
          <input
            name="q"
            defaultValue={q ?? ""}
            placeholder="Buscar por nombre o empresa..."
            className="w-full rounded-lg border border-slate-300 bg-white py-2.5 pl-10 pr-4 text-sm text-slate-900 placeholder-slate-400 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 dark:border-slate-600 dark:bg-slate-800 dark:text-slate-100 dark:placeholder-slate-500"
          />
          {isBlocked && <input type="hidden" name="isBlocked" value={isBlocked} />}
        </form>
      </div>

      <div className="rounded-xl border border-slate-200 bg-white shadow-sm dark:border-slate-700 dark:bg-slate-800">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-slate-200 text-left dark:border-slate-700">
                <th className="px-6 py-4 font-medium text-slate-500 dark:text-slate-400">Nombre</th>
                <th className="px-6 py-4 font-medium text-slate-500 dark:text-slate-400">ID Vendedor</th>
                <th className="px-6 py-4 font-medium text-slate-500 dark:text-slate-400">Estado</th>
                <th className="px-6 py-4 font-medium text-slate-500 dark:text-slate-400">Acciones</th>
              </tr>
            </thead>
            <tbody>
              {(!data || data.items.length === 0) && !error && (
                <tr>
                  <td colSpan={4} className="px-6 py-12 text-center text-slate-400">
                    No hay administradores registrados
                  </td>
                </tr>
              )}
              {data?.items.map((admin) => (
                <tr key={admin.clerkUserId} className="border-b border-slate-100 hover:bg-slate-50 dark:border-slate-700 dark:hover:bg-slate-700/50">
                  <td className="px-6 py-4 font-medium">
                    <Link href={`/dashboard/logistics-admins/${admin.clerkUserId}`} className="text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300">
                      {admin.nombre} — {admin.nombreEmpresa}
                    </Link>
                  </td>
                  <td className="px-6 py-4 font-mono text-slate-500 dark:text-slate-400">{admin.idVendedor}</td>
                  <td className="px-6 py-4">
                    <span className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-medium ${
                      admin.isBlocked
                        ? "bg-red-100 text-red-700"
                        : "bg-emerald-100 text-emerald-700"
                    }`}>
                      {admin.isBlocked ? "Bloqueado" : "Activo"}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-1">
                      <Link
                        href={`/dashboard/logistics-admins/${admin.clerkUserId}`}
                        className="rounded-lg p-1.5 text-blue-500 hover:bg-blue-50 dark:hover:bg-blue-900/20"
                        title={`Editar ${admin.nombre}`}
                      >
                        <Pencil className="h-4 w-4" />
                      </Link>
                      <DeleteButton
                        id={admin.clerkUserId}
                        label={admin.nombre}
                        message={`¿Estás seguro de eliminar a "${admin.nombre}"? Se le quitarán los permisos de administrador.`}
                        deleteAction={deleteLogisticsAdmin}
                      />
                    </div>
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
              href={`/dashboard/logistics-admins?page=${currentPage - 1}${q ? `&q=${q}` : ""}${isBlocked ? `&isBlocked=${isBlocked}` : ""}`}
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
              href={`/dashboard/logistics-admins?page=${currentPage + 1}${q ? `&q=${q}` : ""}${isBlocked ? `&isBlocked=${isBlocked}` : ""}`}
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
