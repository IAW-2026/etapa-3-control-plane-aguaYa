import { sellerApi } from "@/lib/api"

type Order = {
  id: string
  buyerName: string
  total: number
  status: string
  createdAt: string
  vendor?: { name: string }
  items?: { productName: string; quantity: number }[]
}

export const dynamic = "force-dynamic"

export default async function OrdersPage() {
  let orders: Order[] = []
  let error: string | null = null

  try {
    orders = await sellerApi.get("/api/admin/orders")
  } catch (e) {
    error = e instanceof Error ? e.message : "Error al cargar pedidos"
  }

  const statusColors: Record<string, string> = {
    PAID: "bg-amber-100 text-amber-700",
    READY: "bg-blue-100 text-blue-700",
    DELIVERED: "bg-emerald-100 text-emerald-700",
    CANCELLED: "bg-red-100 text-red-700",
  }

  return (
    <div>
      <div className="mb-8 flex items-center justify-between">
        <h1 className="text-2xl font-bold text-slate-900">Pedidos</h1>
      </div>

      {error && (
        <div className="mb-6 rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-700">
          {error}
        </div>
      )}

      <div className="rounded-xl border border-slate-200 bg-white shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-slate-200 text-left">
                <th className="px-6 py-4 font-medium text-slate-500">ID</th>
                <th className="px-6 py-4 font-medium text-slate-500">Comprador</th>
                <th className="px-6 py-4 font-medium text-slate-500">Vendedor</th>
                <th className="px-6 py-4 font-medium text-slate-500">Total</th>
                <th className="px-6 py-4 font-medium text-slate-500">Estado</th>
                <th className="px-6 py-4 font-medium text-slate-500">Fecha</th>
              </tr>
            </thead>
            <tbody>
              {orders.length === 0 && !error && (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center text-slate-400">
                    No hay pedidos registrados
                  </td>
                </tr>
              )}
              {orders.map((order) => (
                <tr key={order.id} className="border-b border-slate-100 hover:bg-slate-50">
                  <td className="px-6 py-4 font-mono text-xs text-slate-500">{order.id.slice(0, 8)}</td>
                  <td className="px-6 py-4 text-slate-900">{order.buyerName || "—"}</td>
                  <td className="px-6 py-4 text-slate-500">{order.vendor?.name ?? "—"}</td>
                  <td className="px-6 py-4 text-slate-900">${order.total.toFixed(2)}</td>
                  <td className="px-6 py-4">
                    <span
                      className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-medium ${
                        statusColors[order.status] ?? "bg-slate-100 text-slate-700"
                      }`}
                    >
                      {order.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-slate-500">
                    {new Date(order.createdAt).toLocaleDateString("es-AR")}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
