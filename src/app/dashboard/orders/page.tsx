'use client'

import { Suspense, useState, useEffect, useCallback, useRef } from "react"
import { useSearchParams, useRouter } from "next/navigation"
import { getMergedOrders, getOrderAdapters } from "@/lib/actions/orders"
import type { AppOrder, StatusDefinition } from "@/lib/adapters/types"
import { Search, ChevronLeft, ChevronRight } from "lucide-react"
import OrderDetailModal from "@/components/orders/OrderDetailModal"
import OrderStatusBadge from "@/components/orders/OrderStatusBadge"
import { useToast } from "@/components/ui/ToastProvider"

const ADMIN_PAGE_SIZE = 10

type AppInfo = {
  name: string
  source: string
  statuses: StatusDefinition[]
}

type PageData = {
  items: AppOrder[]
  total: number
  pageCount: number
  errors?: string[]
}

function OrdersPageContent() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const { showToast } = useToast()
  const q = searchParams.get("q") ?? ""
  const source = searchParams.get("source") ?? ""
  const currentPage = parseInt(searchParams.get("page") ?? "1", 10)

  const [data, setData] = useState<PageData | null>(null)
  const [apps, setApps] = useState<AppInfo[]>([])
  const [selectedOrder, setSelectedOrder] = useState<AppOrder | null>(null)
  const [validTransitions, setValidTransitions] = useState<StatusDefinition[]>([])
  const bufferRef = useRef<{ items: AppOrder[]; fetchedPage: number } | null>(null)

  useEffect(() => {
    getOrderAdapters().then(setApps)
  }, [])

  const fetchData = useCallback(async () => {
    const result = await getMergedOrders({
      page: currentPage,
      q: q || undefined,
      source: source || undefined,
    })
    setData(result)
  }, [currentPage, q, source])

  useEffect(() => { fetchData() }, [fetchData])

  useEffect(() => {
    if (selectedOrder) {
      setValidTransitions([])
    }
  }, [selectedOrder])

  function statusDefs(source: string): StatusDefinition[] {
    return apps.find((a) => a.source === source)?.statuses ?? []
  }

  function tabUrl(value: string) {
    const params = new URLSearchParams()
    if (value) params.set("source", value)
    if (q) params.set("q", q)
    const qs = params.toString()
    return `/dashboard/orders${qs ? `?${qs}` : ""}`
  }

  function handlePage(url: string) {
    bufferRef.current = null
    router.push(url)
  }

  function handleOrderClick(order: AppOrder) {
    setSelectedOrder(order)
  }

  function handleStatusChange(orderId: string, newStatus: string) {
    setData((prev) => prev ? { ...prev, items: prev.items.map((o) => o.id === orderId ? { ...o, status: newStatus } : o) } : prev)
    setSelectedOrder((prev) => prev?.id === orderId ? { ...prev, status: newStatus } : prev)
    showToast("success", "Estado actualizado correctamente")
  }

  const allSources = apps.map((a) => a.source)

  return (
    <div>
      <div className="mb-8 flex items-center justify-between">
        <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-100">Pedidos</h1>
      </div>

      <div className="mb-4 flex items-center gap-2">
        <a
          href={tabUrl("")}
          className={`rounded-lg px-4 py-2 text-sm font-medium transition-colors ${
            source === ""
              ? "bg-blue-600 text-white"
              : "bg-slate-100 text-slate-600 hover:bg-slate-200 dark:bg-slate-700 dark:text-slate-300 dark:hover:bg-slate-600"
          }`}
        >
          Todas
        </a>
        {apps.map((app) => (
          <a
            key={app.source}
            href={tabUrl(app.source)}
            className={`rounded-lg px-4 py-2 text-sm font-medium transition-colors ${
              source === app.source
                ? "bg-blue-600 text-white"
                : "bg-slate-100 text-slate-600 hover:bg-slate-200 dark:bg-slate-700 dark:text-slate-300 dark:hover:bg-slate-600"
            }`}
          >
            {app.name}
          </a>
        ))}
      </div>

      <div className="mb-6">
        <form method="GET" action="/dashboard/orders" className="relative max-w-md">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
          <input
            name="q"
            defaultValue={q ?? ""}
            placeholder="Buscar por ID externo, comprador o vendedor..."
            className="w-full rounded-lg border border-slate-300 bg-white py-2.5 pl-10 pr-4 text-sm text-slate-900 placeholder-slate-400 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 dark:border-slate-600 dark:bg-slate-800 dark:text-slate-100 dark:placeholder-slate-500"
          />
          {source && <input type="hidden" name="source" value={source} />}
        </form>
      </div>

      {data?.errors && data.errors.length > 0 && (
        <div className="mb-6 rounded-lg border border-amber-200 bg-amber-50 p-4 text-sm text-amber-700">
          {data.errors.map((e, i) => (
            <p key={i}>{e}</p>
          ))}
        </div>
      )}

      <div className="rounded-xl border border-slate-200 bg-white shadow-sm dark:border-slate-700 dark:bg-slate-800">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-slate-200 text-left dark:border-slate-700">
                <th className="px-6 py-4 font-medium text-slate-500 dark:text-slate-400">ID</th>
                <th className="px-6 py-4 font-medium text-slate-500 dark:text-slate-400">Comprador</th>
                <th className="px-6 py-4 font-medium text-slate-500 dark:text-slate-400">Vendedor</th>
                <th className="px-6 py-4 font-medium text-slate-500 dark:text-slate-400">App</th>
                <th className="px-6 py-4 font-medium text-slate-500 dark:text-slate-400">Total</th>
                <th className="px-6 py-4 font-medium text-slate-500 dark:text-slate-400">Estado</th>
                <th className="px-6 py-4 font-medium text-slate-500 dark:text-slate-400">Fecha</th>
              </tr>
            </thead>
            <tbody>
              {(!data || data.items.length === 0) && !data?.errors && (
                <tr>
                  <td colSpan={7} className="px-6 py-12 text-center text-slate-400">
                    No hay pedidos registrados
                  </td>
                </tr>
              )}
              {data?.items.map((order) => (
                <tr
                  key={`${order.source}-${order.id}`}
                  onClick={() => handleOrderClick(order)}
                  className="cursor-pointer border-b border-slate-100 hover:bg-slate-50 dark:border-slate-700 dark:hover:bg-slate-700/50"
                >
                  <td className="px-6 py-4 font-mono text-xs text-slate-500 dark:text-slate-400">
                    {order.externalId ? `#${order.externalId}` : order.id.slice(0, 8)}
                  </td>
                  <td className="px-6 py-4 text-slate-900 dark:text-slate-100">{order.buyerName || "—"}</td>
                  <td className="px-6 py-4 text-slate-500 dark:text-slate-400">{order.vendorName || "—"}</td>
                  <td className="px-6 py-4 text-slate-500 dark:text-slate-400">{order.source}</td>
                  <td className="px-6 py-4 text-slate-900 dark:text-slate-100">${order.total.toFixed(2)}</td>
                  <td className="px-6 py-4">
                    <OrderStatusBadge status={order.status} definitions={statusDefs(order.source)} />
                  </td>
                  <td className="px-6 py-4 text-slate-500 dark:text-slate-400">
                    {new Date(order.createdAt).toLocaleDateString("es-AR")} {new Date(order.createdAt).toLocaleTimeString("es-AR", { hour: '2-digit', minute: '2-digit' })}
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
            <button
              onClick={() => handlePage(`/dashboard/orders?page=${currentPage - 1}${q ? `&q=${q}` : ""}${source ? `&source=${source}` : ""}`)}
              className="flex items-center gap-1 rounded-lg border border-slate-300 px-3 py-2 text-sm text-slate-600 hover:bg-slate-50 dark:border-slate-600 dark:text-slate-400 dark:hover:bg-slate-700"
            >
              <ChevronLeft className="h-4 w-4" />
              Anterior
            </button>
          )}
          <span className="px-3 text-sm text-slate-500 dark:text-slate-400">
            Página {currentPage} de {data.pageCount}
          </span>
          {currentPage < data.pageCount && (
            <button
              onClick={() => handlePage(`/dashboard/orders?page=${currentPage + 1}${q ? `&q=${q}` : ""}${source ? `&source=${source}` : ""}`)}
              className="flex items-center gap-1 rounded-lg border border-slate-300 px-3 py-2 text-sm text-slate-600 hover:bg-slate-50 dark:border-slate-600 dark:text-slate-400 dark:hover:bg-slate-700"
            >
              Siguiente
              <ChevronRight className="h-4 w-4" />
            </button>
          )}
        </div>
      )}

      {selectedOrder && (
        <OrderDetailModal
          order={selectedOrder}
          open={!!selectedOrder}
          onClose={() => setSelectedOrder(null)}
          onStatusChange={handleStatusChange}
          statuses={statusDefs(selectedOrder.source)}
          validTransitions={validTransitions}
        />
      )}
    </div>
  )
}

export default function OrdersPage() {
  return (
    <Suspense fallback={null}>
      <OrdersPageContent />
    </Suspense>
  )
}
