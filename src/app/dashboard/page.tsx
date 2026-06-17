import { sellerApi } from "@/lib/api"
import { deliveryApi } from "@/lib/api-delivery"
import { Store, Package, ShoppingCart, Truck } from "lucide-react"

async function getStats() {
  let totalVendors = 0, totalProducts = 0, totalDrivers = 0

  try {
    const vendors = await sellerApi.get("/api/admin/vendors")
    totalVendors = Array.isArray(vendors) ? vendors.length : 0
  } catch {}

  try {
    const products = await sellerApi.get("/api/admin/products")
    totalProducts = Array.isArray(products) ? products.length : 0
  } catch {}

  try {
    const drivers = await deliveryApi.get("/api/admin/drivers")
    totalDrivers = drivers?.total ?? 0
  } catch {}

  return { totalVendors, totalProducts, totalDrivers }
}

export default async function OverviewPage() {
  const stats = await getStats()

  const cards = [
    { label: "Vendedores", value: stats.totalVendors, icon: Store, color: "bg-blue-500" },
    { label: "Productos", value: stats.totalProducts, icon: Package, color: "bg-emerald-500" },
    { label: "Pedidos", value: "—", icon: ShoppingCart, color: "bg-amber-500" },
    { label: "Choferes", value: stats.totalDrivers, icon: Truck, color: "bg-violet-500" },
  ]

  return (
    <div>
      <h1 className="mb-8 text-2xl font-bold text-slate-900 dark:text-slate-100">Overview</h1>

      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
        {cards.map((card) => {
          const Icon = card.icon
          return (
            <div key={card.label} className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-700 dark:bg-slate-800">
              <div className="flex items-center gap-4">
                <div className={`flex h-12 w-12 items-center justify-center rounded-lg ${card.color}`}>
                  <Icon className="h-6 w-6 text-white" />
                </div>
                <div>
                  <p className="text-sm font-medium text-slate-500 dark:text-slate-400">{card.label}</p>
                  <p className="text-2xl font-bold text-slate-900 dark:text-slate-100">{card.value}</p>
                </div>
              </div>
            </div>
          )
        })}
      </div>

      <div className="mt-8 rounded-xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-700 dark:bg-slate-800">
        <h2 className="text-lg font-semibold text-slate-900 dark:text-slate-100">Bienvenido al Control Plane</h2>
        <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">
          Panel de administración centralizado del sistema AguaYa. Desde aquí podés gestionar
          vendedores, productos, pedidos y todas las aplicaciones del ecosistema.
        </p>
      </div>
    </div>
  )
}
