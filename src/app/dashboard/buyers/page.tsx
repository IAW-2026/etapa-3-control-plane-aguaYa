import { getBuyers } from "@/lib/actions/buyer"
import type { Buyer } from "@/lib/types"
import { Search, ChevronLeft, ChevronRight, Pencil } from "lucide-react"
import Link from "next/link"
import CreateBuyerWrapper from "@/components/buyer/CreateBuyerWrapper"
import DeleteButton from "@/components/ui/DeleteButton"
import { deleteBuyer } from "@/lib/actions/buyer"

export const dynamic = "force-dynamic"

export default async function BuyersPage({
  searchParams,
}: {
  searchParams: Promise<{ page?: string; q?: string; estado?: string }>
}) {
  const { page: pageParam, q, estado } = await searchParams
  const currentPage = parseInt(pageParam ?? "1", 10)
  const activeTab = estado ?? ""

  let buyers: Buyer[] = []
  let error: string | null = null

  try {
    buyers = await getBuyers({ page: String(currentPage), limit: "10", ...(q ? { q } : {}), ...(estado ? { estado } : {}) })
  } catch (e) {
    error = e instanceof Error ? e.message : "Error al cargar compradores"
  }

  const filtered = !activeTab ? buyers : buyers.filter((b) =>
    activeTab === "activo" ? b.is_active : !b.is_active
  )

  const pageSize = 10
  const total = filtered.length
  const pageCount = Math.max(1, Math.ceil(total / pageSize))
  const pageItems = filtered.slice(0, pageSize)

  function tabUrl(value: string) {
    const params = new URLSearchParams()
    if (value) params.set("estado", value)
    if (q) params.set("q", q)
    const qs = params.toString()
    return `/dashboard/buyers${qs ? `?${qs}` : ""}`
  }

  return (
    <div>
      <div className="mb-8 flex items-center justify-between">
        <div>
          <p className="text-sm font-semibold uppercase tracking-[0.24em] text-sky-700 dark:text-sky-400">Buyer App</p>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-100">Compradores</h1>
        </div>
        <CreateBuyerWrapper />
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
        <form method="GET" action="/dashboard/buyers" className="relative max-w-md">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
          <input
            name="q"
            defaultValue={q ?? ""}
            placeholder="Buscar por nombre o email..."
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
                <th className="px-6 py-4 font-medium text-slate-500 dark:text-slate-400">Email</th>
                <th className="px-6 py-4 font-medium text-slate-500 dark:text-slate-400">User ID</th>
                <th className="px-6 py-4 font-medium text-slate-500 dark:text-slate-400">Estado</th>
                <th className="px-6 py-4 font-medium text-slate-500 dark:text-slate-400">Acciones</th>
              </tr>
            </thead>
            <tbody>
              {pageItems.length === 0 && !error && (
                <tr>
                  <td colSpan={5} className="px-6 py-12 text-center text-slate-400">
                    No hay compradores registrados
                  </td>
                </tr>
              )}
              {pageItems.map((buyer) => {
                const displayName = buyer.name || buyer.mail || "Sin nombre"
                return (
                <tr key={buyer.buyer_id} className="border-b border-slate-100 hover:bg-slate-50 dark:border-slate-700 dark:hover:bg-slate-700/50">
                  <td className="px-6 py-4">
                    <Link href={`/dashboard/buyers/${buyer.buyer_id}`} className="font-medium text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300">
                      {buyer.name || "—"}
                    </Link>
                  </td>
                  <td className="px-6 py-4">
                    <Link href={`/dashboard/buyers/${buyer.buyer_id}`} className="text-slate-500 hover:text-blue-600 dark:text-slate-400 dark:hover:text-blue-400">
                      {buyer.mail}
                    </Link>
                  </td>
                  <td className="px-6 py-4">
                    <Link href={`/dashboard/buyers/${buyer.buyer_id}`} className="font-mono text-xs text-slate-500 hover:text-blue-600 dark:text-slate-400 dark:hover:text-blue-400">
                      {buyer.user_id.slice(0, 12)}...
                    </Link>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-medium ${
                      buyer.is_active
                        ? "bg-emerald-100 text-emerald-700"
                        : "bg-red-100 text-red-700"
                    }`}>
                      {buyer.is_active ? "Activo" : "Inactivo"}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-1">
                      <Link
                        href={`/dashboard/buyers/${buyer.buyer_id}`}
                        className="rounded-lg p-1.5 text-blue-500 hover:bg-blue-50 dark:hover:bg-blue-900/20"
                        title={`Editar ${displayName}`}
                      >
                        <Pencil className="h-4 w-4" />
                      </Link>
                      <DeleteButton
                        id={buyer.buyer_id}
                        label={displayName}
                        message={`¿Estás seguro de eliminar a "${displayName}"? Esta acción no se puede deshacer.`}
                        deleteAction={deleteBuyer}
                      />
                    </div>
                  </td>
                </tr>
              )})}
            </tbody>
          </table>
        </div>
      </div>

      {pageCount > 1 && (
        <div className="mt-6 flex items-center justify-center gap-2">
          {currentPage > 1 && (
            <Link
              href={`/dashboard/buyers?page=${currentPage - 1}${q ? `&q=${q}` : ""}${estado ? `&estado=${estado}` : ""}`}
              className="flex items-center gap-1 rounded-lg border border-slate-300 px-3 py-2 text-sm text-slate-600 hover:bg-slate-50 dark:border-slate-600 dark:text-slate-400 dark:hover:bg-slate-700"
            >
              <ChevronLeft className="h-4 w-4" />
              Anterior
            </Link>
          )}
          <span className="px-3 text-sm text-slate-500 dark:text-slate-400">
            Página {currentPage} de {pageCount}
          </span>
          {currentPage < pageCount && (
            <Link
              href={`/dashboard/buyers?page=${currentPage + 1}${q ? `&q=${q}` : ""}${estado ? `&estado=${estado}` : ""}`}
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
