"use client"

import { useState, useEffect, useCallback } from "react"
import { getMergedOrders, getOrderAdapters } from "@/lib/actions/orders"
import type { AppOrder, StatusDefinition } from "@/lib/adapters/types"
import OrderStatusBadge from "@/components/orders/OrderStatusBadge"
import { ShoppingCart, ChevronLeft, ChevronRight, Loader2, Search } from "lucide-react"

const PAGE_SIZE = 10

type AdapterInfo = {
  key: string
  name: string
  statuses: StatusDefinition[]
}

export default function OrdersPage() {
  const [orders, setOrders] = useState<AppOrder[]>([])
  const [total, setTotal] = useState(0)
  const [page, setPage] = useState(1)
  const [search, setSearch] = useState("")
  const [source, setSource] = useState("")
  const [adapters, setAdapters] = useState<AdapterInfo[]>([])
  const [loading, setLoading] = useState(true)

  const pageCount = Math.max(1, Math.ceil(total / PAGE_SIZE))

  useEffect(() => {
    getOrderAdapters().then((adapters) => {
      setAdapters(adapters.map((a: { source: string; name: string; statuses: StatusDefinition[] }) => ({ key: a.source, name: a.name, statuses: a.statuses })))
    })
  }, [])

  const load = useCallback(async (p: number, s: string, src: string) => {
    setLoading(true)
    try {
      const res = await getMergedOrders({ page: p, q: s || undefined, source: src || undefined })
      setOrders(res.items)
      setTotal(res.total)
    } catch {
      setOrders([])
      setTotal(0)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    load(page, search, source)
  }, [page, source, load])

  function handleSearch() {
    setPage(1)
    load(1, search, source)
  }

  function handleKeyDown(e: React.KeyboardEvent) {
    if (e.key === "Enter") handleSearch()
  }

  function getStatusDefs(sourceKey: string): StatusDefinition[] {
    return adapters.find((a) => a.key === sourceKey)?.statuses ?? []
  }

  return (
    <div>
      <div className="mb-8">
        <p className="text-sm font-semibold uppercase tracking-[0.24em] text-sky-700 dark:text-sky-400">Gestión</p>
        <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-100">Pedidos</h1>
      </div>

      <div className="mb-6 flex flex-wrap items-center gap-3">
        <div className="relative flex-1">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Buscar por comprador..."
            className="w-full rounded-xl border border-white/30 bg-gradient-to-br from-white/30 to-slate-100/30 py-2.5 pl-10 pr-4 text-sm text-slate-900 placeholder-slate-400 shadow-lg shadow-black/5 backdrop-blur-xl focus:border-blue-500/50 focus:outline-none focus:ring-2 focus:ring-blue-500/20 dark:border-slate-700/40 dark:from-slate-900/40 dark:to-slate-800/40 dark:text-slate-100 dark:placeholder-slate-500"
          />
        </div>
        {adapters.length > 1 && (
          <select
            value={source}
            onChange={(e) => { setSource(e.target.value); setPage(1) }}
            className="rounded-xl border border-white/30 bg-gradient-to-br from-white/30 to-slate-100/30 px-4 py-2.5 text-sm text-slate-900 shadow-lg shadow-black/5 backdrop-blur-xl focus:border-blue-500/50 focus:outline-none focus:ring-2 focus:ring-blue-500/20 dark:border-slate-700/40 dark:from-slate-900/40 dark:to-slate-800/40 dark:text-slate-100"
          >
            <option value="">Todas las apps</option>
            {adapters.map((s) => (
              <option key={s.key} value={s.key}>{s.name}</option>
            ))}
          </select>
        )}
        <button
          type="button"
          onClick={handleSearch}
          className="rounded-xl bg-blue-600 px-5 py-2.5 text-sm text-white shadow-lg shadow-black/5 transition-colors hover:bg-blue-700"
        >
          Buscar
        </button>
      </div>

      <div className="overflow-hidden rounded-xl border border-white/30 bg-gradient-to-br from-white/30 to-slate-100/30 shadow-lg shadow-black/5 backdrop-blur-xl dark:border-slate-700/40 dark:from-slate-900/40 dark:to-slate-800/40">
        {loading ? (
          <div className="flex items-center justify-center py-20">
            <Loader2 className="h-6 w-6 animate-spin text-slate-400" />
          </div>
        ) : orders.length === 0 ? (
          <div className="flex flex-col items-center gap-2 py-20 text-sm text-slate-500 dark:text-slate-400">
            <ShoppingCart className="h-8 w-8" />
            <p>No se encontraron pedidos.</p>
          </div>
        ) : (
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-white/20 text-left text-xs font-medium uppercase tracking-wider text-slate-500 dark:border-slate-700/30 dark:text-slate-400">
                <th className="px-6 py-4">ID</th>
                <th className="px-6 py-4">Comprador</th>
                <th className="px-6 py-4">Vendedor</th>
                <th className="px-6 py-4">App</th>
                <th className="px-6 py-4">Total</th>
                <th className="px-6 py-4">Estado</th>
                <th className="px-6 py-4">Fecha</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/10 dark:divide-slate-700/20">
              {orders.map((o) => (
                <tr key={`${o.source}-${o.id}`} className="transition-colors hover:bg-white/20 dark:hover:bg-white/5">
                  <td className="max-w-[100px] truncate px-6 py-4 font-mono text-xs text-slate-600 dark:text-slate-400">
                    {o.id.slice(0, 8)}...
                  </td>
                  <td className="px-6 py-4 font-medium text-slate-900 dark:text-slate-100">{o.buyerName}</td>
                  <td className="px-6 py-4 text-slate-600 dark:text-slate-400">{o.vendorName ?? "—"}</td>
                  <td className="px-6 py-4">
                    <span className="inline-flex rounded-md bg-blue-100 px-2 py-0.5 text-xs font-medium text-blue-700 dark:bg-blue-900/30 dark:text-blue-400">
                      {adapters.find(s => s.key === o.source)?.name ?? o.source}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-slate-700 dark:text-slate-300">
                    ${Number(o.total).toLocaleString("es-AR")}
                  </td>
                  <td className="px-6 py-4">
                    <OrderStatusBadge status={o.status} definitions={getStatusDefs(o.source)} />
                  </td>
                  <td className="px-6 py-4 text-xs text-slate-500">
                    {new Date(o.createdAt).toLocaleDateString("es-AR")}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}

        {!loading && orders.length > 0 && (
          <div className="flex items-center justify-between border-t border-white/20 px-6 py-3 dark:border-slate-700/30">
            <span className="text-xs text-slate-500 dark:text-slate-400">
              Pág. {page} de {pageCount} ({total} ped.)
            </span>
            <div className="flex gap-1">
              <button
                type="button"
                disabled={page <= 1}
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                className="rounded-lg border border-white/30 bg-gradient-to-br from-white/30 to-slate-100/30 p-1.5 text-slate-600 shadow-lg shadow-black/5 backdrop-blur-xl transition-colors hover:bg-white/40 disabled:opacity-40 dark:border-slate-700/40 dark:from-slate-900/40 dark:to-slate-800/40 dark:text-slate-400"
              >
                <ChevronLeft className="h-4 w-4" />
              </button>
              <button
                type="button"
                disabled={page >= pageCount}
                onClick={() => setPage((p) => p + 1)}
                className="rounded-lg border border-white/30 bg-gradient-to-br from-white/30 to-slate-100/30 p-1.5 text-slate-600 shadow-lg shadow-black/5 backdrop-blur-xl transition-colors hover:bg-white/40 disabled:opacity-40 dark:border-slate-700/40 dark:from-slate-900/40 dark:to-slate-800/40 dark:text-slate-400"
              >
                <ChevronRight className="h-4 w-4" />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
