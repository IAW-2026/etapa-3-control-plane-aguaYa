"use client"

import { useState, useEffect, useCallback } from "react"
import { getAllBuyerOrders, deleteBuyerOrderGlobal } from "@/lib/actions/buyer"
import type { BuyerOrder } from "@/lib/types"
import CreateGlobalOrderModal from "@/components/buyer/CreateGlobalOrderModal"
import BuyerOrderStatusModal from "@/components/buyer/BuyerOrderStatusModal"
import DeleteButton from "@/components/ui/DeleteButton"
import { Search, ChevronLeft, ChevronRight, Plus, ShoppingCart, Loader2, Pencil } from "lucide-react"

const STATUS_TABS = [
  { key: "", label: "Todos" },
  { key: "PENDING", label: "Pendiente" },
  { key: "PAID", label: "Pagada" },
  { key: "READY", label: "Lista" },
  { key: "IN_DELIVERY", label: "En Delivery" },
  { key: "DELIVERED", label: "Entregada" },
  { key: "IN_REVISION", label: "En Revisión" },
  { key: "CANCELLED", label: "Cancelada" },
]

export default function BuyerOrdersPage() {
  const [orders, setOrders] = useState<BuyerOrder[]>([])
  const [filtered, setFiltered] = useState<BuyerOrder[]>([])
  const [loading, setLoading] = useState(true)
  const [page, setPage] = useState(1)
  const [search, setSearch] = useState("")
  const [statusTab, setStatusTab] = useState("")
  const [showCreate, setShowCreate] = useState(false)
  const [editOrder, setEditOrder] = useState<BuyerOrder | null>(null)

  const PAGE_SIZE = 10
  const pageCount = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE))
  const pageItems = filtered.slice(0, PAGE_SIZE)

  const load = useCallback(async () => {
    setLoading(true)
    try {
      const all = await getAllBuyerOrders()
      setOrders(all)
    } catch {
      setOrders([])
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => { load() }, [load])

  useEffect(() => {
    let result = orders
    if (statusTab) result = result.filter((o) => o.status === statusTab)
    if (search) {
      const q = search.toLowerCase()
      result = result.filter((o) =>
        o.buyer_user_id.toLowerCase().includes(q) ||
        o.vendor_id.toLowerCase().includes(q) ||
        o.order_id.toLowerCase().includes(q)
      )
    }
    setFiltered(result)
    setPage(1)
  }, [orders, statusTab, search])

  function statusBadge(status: string) {
    const cls: Record<string, string> = {
      DELIVERED: "bg-emerald-100 text-emerald-700",
      CANCELLED: "bg-red-100 text-red-700",
      PAID: "bg-emerald-100 text-emerald-700",
      IN_DELIVERY: "bg-blue-100 text-blue-700",
      IN_REVISION: "bg-purple-100 text-purple-700",
      READY: "bg-amber-100 text-amber-700",
      PENDING: "bg-slate-100 text-slate-700",
    }
    return cls[status] || "bg-slate-100 text-slate-700"
  }

  function statusLabel(status: string) {
    return STATUS_TABS.find((t) => t.key === status)?.label || status
  }

  return (
    <div>
      <div className="mb-8 flex items-center justify-between">
        <div>
          <p className="text-sm font-semibold uppercase tracking-[0.24em] text-sky-700 dark:text-sky-400">Buyer App</p>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-100">Pedidos</h1>
        </div>
        <button
          type="button"
          onClick={() => setShowCreate(true)}
          className="flex items-center gap-1.5 rounded-lg bg-blue-600 px-4 py-2 text-sm text-white shadow-lg shadow-black/5 transition-colors hover:bg-blue-700"
        >
          <Plus className="h-4 w-4" />
          Nueva Orden
        </button>
      </div>

      <div className="mb-4 flex flex-wrap gap-1 rounded-xl bg-linear-to-br from-slate-100/70 to-slate-200/50 p-1 shadow-lg shadow-black/5 backdrop-blur-xl dark:from-slate-800/60 dark:to-slate-800/40">
        {STATUS_TABS.map((t) => (
          <button
            key={t.key}
            type="button"
            onClick={() => setStatusTab(t.key)}
            className={`rounded-lg px-3 py-1.5 text-xs font-medium transition-all ${
              statusTab === t.key
                ? "bg-linear-to-br from-white/60 to-slate-100/60 text-slate-900 shadow-sm backdrop-blur-sm dark:from-slate-700 dark:to-slate-600 dark:text-white"
                : "text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200"
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      <div className="mb-6">
        <div className="relative max-w-md">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Buscar por order ID, comprador o vendedor..."
            className="w-full rounded-lg border border-slate-300 bg-white py-2.5 pl-10 pr-4 text-sm text-slate-900 placeholder-slate-400 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 dark:border-slate-600 dark:bg-slate-800 dark:text-slate-100 dark:placeholder-slate-500"
          />
        </div>
      </div>

      <div className="rounded-xl border border-slate-200 bg-white shadow-sm dark:border-slate-700 dark:bg-slate-800">
        {loading ? (
          <div className="flex items-center justify-center py-20">
            <Loader2 className="h-6 w-6 animate-spin text-slate-400" />
          </div>
        ) : pageItems.length === 0 ? (
          <div className="flex flex-col items-center gap-2 py-20 text-sm text-slate-500 dark:text-slate-400">
            <ShoppingCart className="h-8 w-8" />
            <p>No se encontraron pedidos.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-slate-200 text-left dark:border-slate-700">
                  <th className="px-6 py-4 font-medium text-slate-500 dark:text-slate-400">Order ID</th>
                  <th className="px-6 py-4 font-medium text-slate-500 dark:text-slate-400">Comprador</th>
                  <th className="px-6 py-4 font-medium text-slate-500 dark:text-slate-400">Vendedor</th>
                  <th className="px-6 py-4 font-medium text-slate-500 dark:text-slate-400">Total</th>
                  <th className="px-6 py-4 font-medium text-slate-500 dark:text-slate-400">Estado</th>
                  <th className="px-6 py-4 font-medium text-slate-500 dark:text-slate-400">Fecha</th>
                  <th className="px-6 py-4 font-medium text-slate-500 dark:text-slate-400">Acciones</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-700">
                {pageItems.map((o) => (
                  <tr key={o.order_id} className="hover:bg-slate-50 dark:hover:bg-slate-700/50">
                    <td className="px-6 py-4 font-mono text-xs text-slate-600 dark:text-slate-400">
                      {o.order_id.slice(0, 8)}...
                    </td>
                    <td className="px-6 py-4 text-slate-700 dark:text-slate-300">{o.buyer_user_id}</td>
                    <td className="px-6 py-4 text-slate-700 dark:text-slate-300">{o.vendor_id}</td>
                    <td className="px-6 py-4 text-slate-700 dark:text-slate-300">
                      ${o.total.toLocaleString("es-AR")}
                    </td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-medium ${statusBadge(o.status)}`}>
                        {statusLabel(o.status)}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-xs text-slate-500 whitespace-nowrap">
                      {new Date(o.created_at).toLocaleDateString("es-AR")}
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-1">
                        <button
                          type="button"
                          onClick={() => setEditOrder(o)}
                          className="rounded-lg p-1.5 text-blue-500 hover:bg-blue-50 dark:hover:bg-blue-900/20"
                          title="Cambiar estado"
                        >
                          <Pencil className="h-4 w-4" />
                        </button>
                        <DeleteButton
                          id={o.order_id}
                          label={`orden ${o.order_id.slice(0, 8)}`}
                          message={`¿Estás seguro de eliminar la orden ${o.order_id.slice(0, 8)}...?`}
                          deleteAction={deleteBuyerOrderGlobal}
                        />
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {!loading && pageCount > 1 && (
          <div className="flex items-center justify-between border-t border-slate-200 px-6 py-3 dark:border-slate-700">
            <span className="text-xs text-slate-500 dark:text-slate-400">
              Pág. {page} de {pageCount} ({filtered.length} ped.)
            </span>
            <div className="flex gap-1">
              <button
                type="button"
                disabled={page <= 1}
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                className="rounded-lg border border-slate-300 p-1.5 text-slate-600 transition-colors hover:bg-slate-50 disabled:opacity-40 dark:border-slate-600 dark:text-slate-400 dark:hover:bg-slate-700"
              >
                <ChevronLeft className="h-4 w-4" />
              </button>
              <button
                type="button"
                disabled={page >= pageCount}
                onClick={() => setPage((p) => p + 1)}
                className="rounded-lg border border-slate-300 p-1.5 text-slate-600 transition-colors hover:bg-slate-50 disabled:opacity-40 dark:border-slate-600 dark:text-slate-400 dark:hover:bg-slate-700"
              >
                <ChevronRight className="h-4 w-4" />
              </button>
            </div>
          </div>
        )}
      </div>

      <CreateGlobalOrderModal
        isOpen={showCreate}
        onClose={() => setShowCreate(false)}
        onSuccess={() => { setShowCreate(false); load() }}
      />

      {editOrder && (
        <BuyerOrderStatusModal
          isOpen={!!editOrder}
          onClose={() => setEditOrder(null)}
          onSuccess={() => { setEditOrder(null); load() }}
          orderId={editOrder.order_id}
          currentStatus={editOrder.status}
        />
      )}
    </div>
  )
}
