import { auth } from "@clerk/nextjs/server"
import { sellerApi } from "@/lib/api"
import { Store, Package, ShoppingCart, Users } from "lucide-react"

async function getStats() {
  try {
    const [vendors, products] = await Promise.all([
      sellerApi.get("/api/admin/vendors"),
      sellerApi.get("/api/admin/products"),
    ])
    return {
      totalVendors: Array.isArray(vendors) ? vendors.length : 0,
      totalProducts: Array.isArray(products) ? products.length : 0,
    }
  } catch {
    return { totalVendors: 0, totalProducts: 0 }
  }
}

export default async function OverviewPage() {
  const stats = await getStats()

  const cards = [
    { label: "Vendedores", value: stats.totalVendors, icon: Store, color: "bg-blue-500" },
    { label: "Productos", value: stats.totalProducts, icon: Package, color: "bg-emerald-500" },
    { label: "Pedidos", value: "—", icon: ShoppingCart, color: "bg-amber-500" },
    { label: "Usuarios", value: "—", icon: Users, color: "bg-violet-500" },
  ]

  return (
    <div>
      <h1 className="mb-8 text-2xl font-bold text-slate-900">Overview</h1>

      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
        {cards.map((card) => {
          const Icon = card.icon
          return (
            <div key={card.label} className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
              <div className="flex items-center gap-4">
                <div className={`flex h-12 w-12 items-center justify-center rounded-lg ${card.color}`}>
                  <Icon className="h-6 w-6 text-white" />
                </div>
                <div>
                  <p className="text-sm font-medium text-slate-500">{card.label}</p>
                  <p className="text-2xl font-bold text-slate-900">{card.value}</p>
                </div>
              </div>
            </div>
          )
        })}
      </div>

      <div className="mt-8 rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
        <h2 className="text-lg font-semibold text-slate-900">Bienvenido al Control Plane</h2>
        <p className="mt-2 text-sm text-slate-500">
          Panel de administración centralizado del sistema AguaYa. Desde aquí podés gestionar
          vendedores, productos, pedidos y próximamente todas las aplicaciones del ecosistema.
        </p>
      </div>
    </div>
  )
}
