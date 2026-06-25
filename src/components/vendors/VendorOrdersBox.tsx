"use client"

import { useState, useEffect, useCallback } from "react"
import { getVendorOrders } from "@/lib/actions/vendor"
import type { OrderItem } from "@/lib/types"
import { ShoppingCart, ChevronLeft, ChevronRight, Loader2, Search } from "lucide-react"
import OrderDetailModal from "@/components/orders/OrderDetailModal"

type Props = {
  vendorId: string
  vendorName: string
}

const PAGE_SIZE = 10

export default function VendorOrdersBox({ vendorId, vendorName }: Props) {
  const [orders, setOrders] = useState<OrderItem[]>([])
  const [total, setTotal] = useState(0)
  const [page, setPage] = useState(1)
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState("")
  const [dateFrom, setDateFrom] = useState("")
  const [dateTo, setDateTo] = useState("")
  const [selected, setSelected] = useState<OrderItem | null>(null)
  const [detailOpen, setDetailOpen] = useState(false)

  const pageCount = Math.max(1, Math.ceil(total / PAGE_SIZE))

  const load = useCallback(async (p: number, s?: string, df?: string, dt?: string) => {
    setLoading(true)
    try {
      const params: Record<string, string> = { page: String(p), limit: String(PAGE_SIZE) }
      if (s) params.q = s
      if (df) params.from = df
      if (dt) params.to = dt
      const res = await getVendorOrders(vendorId, params)
      setOrders(res.items)
      setTotal(res.total)
    } catch (e) {
      console.error("Error loading vendor orders:", e)
      setOrders([])
      setTotal(0)
    } finally {
      setLoading(false)
    }
  }, [vendorId])

  useEffect(() => {
    load(page, search, dateFrom, dateTo)
  }, [page, load])

  function handleSearch() {
    setPage(1)
    load(1, search, dateFrom, dateTo)
  }

  function handleKeyDown(e: React.KeyboardEvent) {
    if (e.key === "Enter") handleSearch()
  }

  function handleRowClick(order: OrderItem) {
    setSelected(order)
    setDetailOpen(true)
  }

  return (
    <div className="mt-6 rounded-xl border border-white/30 bg-gradient-to-br from-white/30 to-slate-100/30 shadow-lg shadow-black/5 backdrop-blur-xl dark:border-slate-700/40 dark:from-slate-900/40 dark:to-slate-800/40">
      <div className="flex items-center gap-2 border-b border-white/20 px-6 py-4 dark:border-slate-700/30">
        <ShoppingCart className="h-5 w-5 text-slate-500 dark:text-slate-400" />
        <h2 className="text-lg font-semibold text-slate-900 dark:text-slate-100">Pedidos</h2>
      </div>

      <div className="flex flex-wrap items-center gap-2 px-6 py-3">
        <div className="relative flex-1">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Buscar por ID o comprador..."
            className="w-full rounded-lg border border-white/30 bg-gradient-to-br from-white/30 to-slate-100/30 py-2 pl-9 pr-3 text-sm text-slate-900 placeholder-slate-400 shadow-lg shadow-black/5 backdrop-blur-xl focus:border-blue-500/50 focus:outline-none focus:ring-2 focus:ring-blue-500/20 dark:border-slate-700/40 dark:from-slate-900/40 dark:to-slate-800/40 dark:text-slate-100 dark:placeholder-slate-500"
          />
        </div>
        <input
          type="date"
          value={dateFrom}
          onChange={(e) => setDateFrom(e.target.value)}
          className="rounded-lg border border-white/30 bg-gradient-to-br from-white/30 to-slate-100/30 px-3 py-2 text-sm text-slate-900 shadow-lg shadow-black/5 backdrop-blur-xl focus:border-blue-500/50 focus:outline-none focus:ring-2 focus:ring-blue-500/20 dark:border-slate-700/40 dark:from-slate-900/40 dark:to-slate-800/40 dark:text-slate-100"
        />
        <input
          type="date"
          value={dateTo}
          onChange={(e) => setDateTo(e.target.value)}
          className="rounded-lg border border-white/30 bg-gradient-to-br from-white/30 to-slate-100/30 px-3 py-2 text-sm text-slate-900 shadow-lg shadow-black/5 backdrop-blur-xl focus:border-blue-500/50 focus:outline-none focus:ring-2 focus:ring-blue-500/20 dark:border-slate-700/40 dark:from-slate-900/40 dark:to-slate-800/40 dark:text-slate-100"
        />
        <button
          type="button"
          onClick={handleSearch}
          className="rounded-lg bg-blue-600 px-4 py-2 text-sm text-white shadow-lg shadow-black/5 transition-colors hover:bg-blue-700"
        >
          Buscar
        </button>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="h-6 w-6 animate-spin text-slate-400" />
        </div>
      ) : orders.length === 0 ? (
        <div className="px-6 py-8 text-center text-sm text-slate-500 dark:text-slate-400">
          No se encontraron pedidos.
        </div>
      ) : (
        <>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-white/20 text-left text-xs font-medium uppercase tracking-wider text-slate-500 dark:border-slate-700/30 dark:text-slate-400">
                  <th className="px-6 py-3">ID</th>
                  <th className="px-6 py-3">Comprador</th>
                  <th className="px-6 py-3">Total</th>
                  <th className="px-6 py-3">Estado</th>
                  <th className="px-6 py-3">Fecha</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/10 dark:divide-slate-700/20">
                {orders.map((o) => (
                  <tr
                    key={o.id}
                    className="cursor-pointer transition-colors hover:bg-white/20 dark:hover:bg-white/5"
                    onClick={() => handleRowClick(o)}
                  >
                    <td className="max-w-[100px] truncate px-6 py-3 font-mono text-xs text-slate-600 dark:text-slate-400">
                      {o.id.slice(0, 8)}...
                    </td>
                    <td className="px-6 py-3 font-medium text-slate-900 dark:text-slate-100">
                      {o.buyerName}
                    </td>
                    <td className="px-6 py-3 text-slate-700 dark:text-slate-300">
                      ${Number(o.total).toLocaleString("es-AR")}
                    </td>
                    <td className="px-6 py-3">
                      <span
                        className={`inline-flex rounded-full px-2 py-0.5 text-xs font-medium ${
                          o.status === "PAID"
                            ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400"
                            : o.status === "READY"
                              ? "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400"
                              : "bg-slate-200 text-slate-600 dark:bg-slate-700 dark:text-slate-300"
                        }`}
                      >
                        {o.status === "PAID" ? "Pagada" : o.status === "READY" ? "Lista" : o.status}
                      </span>
                    </td>
                    <td className="px-6 py-3 text-xs text-slate-500">
                      {new Date(o.createdAt).toLocaleDateString("es-AR")}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

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
        </>
      )}

      {selected && (
        <OrderDetailModal
          order={selected}
          vendorName={vendorName}
          isOpen={detailOpen}
          onClose={() => { setDetailOpen(false); setSelected(null) }}
          onStatusChange={() => { load(page) }}
        />
      )}
    </div>
  )
}
