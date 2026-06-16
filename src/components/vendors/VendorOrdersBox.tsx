"use client"

import { useState, useEffect, useCallback } from "react"
import { getVendorOrders } from "@/lib/actions/vendor"
import type { OrderItem } from "@/lib/types"
import type { AppOrder, StatusDefinition } from "@/lib/adapters/types"
import { ShoppingCart, User, DollarSign, Calendar, ChevronLeft, ChevronRight, Search, X } from "lucide-react"
import VendorOrdersSkeleton from "@/components/ui/loading/VendorOrdersSkeleton"
import OrderDetailModal from "@/components/orders/OrderDetailModal"
import { useToast } from "@/components/ui/ToastProvider"

type Props = {
  vendorId: string
  vendorName: string
}

const SELLER_STATUSES: StatusDefinition[] = [
  { value: 'PAID', label: 'Pagada', color: 'emerald' },
  { value: 'READY', label: 'Lista', color: 'amber' },
]

function toAppOrder(o: OrderItem, vendorName: string): AppOrder {
  return {
    id: o.id,
    externalId: o.externalId,
    source: 'seller',
    status: o.status,
    total: o.total,
    buyerName: o.buyerName,
    vendorName,
    address: o.address,
    createdAt: o.createdAt,
    items: o.items.map((i) => ({
      id: i.id,
      productName: i.productName,
      productPrice: i.productPrice,
      quantity: i.quantity,
      image: i.product?.image,
    })),
  }
}

function getValidSellerTransitions(status: string): StatusDefinition[] {
  if (status === 'PAID') return SELLER_STATUSES.filter((s) => s.value === 'READY')
  if (status === 'READY') return SELLER_STATUSES.filter((s) => s.value === 'PAID')
  return []
}

const STATUS_LABELS: Record<string, string> = {
  PAID: "Pagada",
  READY: "Lista",
}

export default function VendorOrdersBox({ vendorId, vendorName }: Props) {
  const [items, setItems] = useState<OrderItem[]>([])
  const [page, setPage] = useState(1)
  const [pageCount, setPageCount] = useState(1)
  const [loading, setLoading] = useState(true)
  const limit = 5

  const [q, setQ] = useState("")
  const [from, setFrom] = useState("")
  const [to, setTo] = useState("")
  const [selectedOrder, setSelectedOrder] = useState<OrderItem | null>(null)
  const { showToast } = useToast()

  const buildParams = useCallback((p: number) => {
    const params: Record<string, string> = { page: String(p), limit: String(limit) }
    if (q) params.q = q
    if (from) params.from = from
    if (to) params.to = to
    return params
  }, [q, from, to])

  const fetch = useCallback(async (p: number) => {
    setLoading(true)
    try {
      const res = await getVendorOrders(vendorId, buildParams(p))
      setItems(res.items ?? [])
      setPageCount(res.pageCount ?? 1)
      setPage(p)
    } catch {
      setItems([])
    } finally {
      setLoading(false)
    }
  }, [vendorId, buildParams])

  useEffect(() => { fetch(1) }, [fetch])

  function handleSearch(e: React.FormEvent) {
    e.preventDefault()
    fetch(1)
  }

  function clearFilters() {
    setQ("")
    setFrom("")
    setTo("")
  }

  function handleStatusChange(orderId: string, newStatus: string) {
    setItems((prev) => prev.map((o) => o.id === orderId ? { ...o, status: newStatus } : o))
    showToast('success', `Pedido actualizado a ${STATUS_LABELS[newStatus] ?? newStatus}`)
    setSelectedOrder(null)
  }

  const hasFilters = q || from || to
  const selectedAppOrder = selectedOrder ? toAppOrder(selectedOrder, vendorName) : null

  return (
    <div className="rounded-xl border border-slate-200 bg-white shadow-sm dark:border-slate-700 dark:bg-slate-800">
      <div className="flex items-center justify-between border-b border-slate-200 px-5 py-4 dark:border-slate-700">
        <div className="flex items-center gap-2">
          <ShoppingCart className="h-5 w-5 text-blue-600" />
          <h2 className="font-semibold text-slate-900 dark:text-slate-100">Pedidos</h2>
        </div>
        {pageCount > 1 && (
          <div className="flex items-center gap-1 text-xs text-slate-500">
            <button
              type="button"
              disabled={page <= 1 || loading}
              onClick={() => fetch(page - 1)}
              className="rounded p-1 hover:bg-slate-100 disabled:opacity-30 dark:hover:bg-slate-700"
            >
              <ChevronLeft className="h-4 w-4" />
            </button>
            <span>{page} / {pageCount}</span>
            <button
              type="button"
              disabled={page >= pageCount || loading}
              onClick={() => fetch(page + 1)}
              className="rounded p-1 hover:bg-slate-100 disabled:opacity-30 dark:hover:bg-slate-700"
            >
              <ChevronRight className="h-4 w-4" />
            </button>
          </div>
        )}
      </div>

      <form onSubmit={handleSearch} className="flex flex-wrap items-end gap-2 border-b border-slate-100 px-5 py-3 dark:border-slate-700">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
          <input
            name="q"
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Buscar por ID, comprador o producto..."
            className="w-full rounded-lg border border-slate-300 bg-white py-2 pl-9 pr-3 text-sm text-slate-900 placeholder-slate-400 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 dark:border-slate-600 dark:bg-slate-700 dark:text-slate-100 dark:placeholder-slate-500"
          />
        </div>
        <div>
          <label className="mb-1 block text-xs text-slate-500 dark:text-slate-400">Desde</label>
          <input
            type="date"
            value={from}
            onChange={(e) => setFrom(e.target.value)}
            className="rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 dark:border-slate-600 dark:bg-slate-700 dark:text-slate-100"
          />
        </div>
        <div>
          <label className="mb-1 block text-xs text-slate-500 dark:text-slate-400">Hasta</label>
          <input
            type="date"
            value={to}
            onChange={(e) => setTo(e.target.value)}
            className="rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 dark:border-slate-600 dark:bg-slate-700 dark:text-slate-100"
          />
        </div>
        <button
          type="submit"
          disabled={loading}
          className="rounded-lg bg-blue-600 px-4 py-2 text-sm text-white hover:bg-blue-700 disabled:opacity-50"
        >
          Filtrar
        </button>
        {hasFilters && (
          <button
            type="button"
            onClick={() => { clearFilters(); fetch(1) }}
            className="flex items-center gap-1 rounded-lg border border-slate-300 px-3 py-2 text-sm text-slate-600 hover:bg-slate-50 dark:border-slate-600 dark:text-slate-400 dark:hover:bg-slate-700"
          >
            <X className="h-4 w-4" />
          </button>
        )}
      </form>

      <div className="divide-y divide-slate-100 dark:divide-slate-700">
        {loading && <VendorOrdersSkeleton rows={limit} />}
        {!loading && items.length === 0 && (
          <p className="px-5 py-8 text-center text-sm text-slate-400">Sin pedidos</p>
        )}
        {!loading && items.map((order) => (
          <button
            key={order.id}
            type="button"
            onClick={() => setSelectedOrder(order)}
            className="w-full px-5 py-3 text-left transition-colors hover:bg-slate-50 dark:hover:bg-slate-700/50"
          >
            <div className="flex items-center justify-between">
              <p className="text-sm font-medium text-slate-900 dark:text-slate-100">
                #{order.externalId}
              </p>
              <span
                className={`rounded-full px-2 py-0.5 text-xs font-medium ${
                  order.status === "PAID"
                    ? "bg-emerald-100 text-emerald-700"
                    : "bg-amber-100 text-amber-700"
                }`}
              >
                {STATUS_LABELS[order.status] ?? order.status}
              </span>
            </div>
            <div className="mt-1 flex items-center gap-3 text-xs text-slate-500">
              <span className="flex items-center gap-1">
                <User className="h-3 w-3" />
                {order.buyerName || "Anónimo"}
              </span>
              <span className="flex items-center gap-1">
                <DollarSign className="h-3 w-3" />
                {order.total.toFixed(2)}
              </span>
              <span className="flex items-center gap-1">
                <Calendar className="h-3 w-3" />
                {new Date(order.createdAt).toLocaleDateString("es-AR")} {new Date(order.createdAt).toLocaleTimeString("es-AR", { hour: '2-digit', minute: '2-digit' })}
              </span>
            </div>
            {order.items.length > 0 && (
              <p className="mt-1 text-xs text-slate-400">
                {order.items.length} producto{order.items.length !== 1 ? "s" : ""}
              </p>
            )}
          </button>
        ))}
      </div>

      {selectedAppOrder && (
        <OrderDetailModal
          order={selectedAppOrder}
          open={!!selectedAppOrder}
          onClose={() => setSelectedOrder(null)}
          onStatusChange={handleStatusChange}
          statuses={SELLER_STATUSES}
          validTransitions={getValidSellerTransitions(selectedAppOrder.status)}
        />
      )}
    </div>
  )
}
