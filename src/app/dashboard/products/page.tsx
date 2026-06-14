import { sellerApi } from "@/lib/api"

type Product = {
  id: string
  name: string
  description?: string
  price: number
  stock: number
  isActive: boolean
  vendor?: { name: string }
}

export const dynamic = "force-dynamic"

export default async function ProductsPage() {
  let products: Product[] = []
  let error: string | null = null

  try {
    products = await sellerApi.get("/api/admin/products")
  } catch (e) {
    error = e instanceof Error ? e.message : "Error al cargar productos"
  }

  return (
    <div>
      <div className="mb-8 flex items-center justify-between">
        <h1 className="text-2xl font-bold text-slate-900">Productos</h1>
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
                <th className="px-6 py-4 font-medium text-slate-500">Nombre</th>
                <th className="px-6 py-4 font-medium text-slate-500">Vendedor</th>
                <th className="px-6 py-4 font-medium text-slate-500">Precio</th>
                <th className="px-6 py-4 font-medium text-slate-500">Stock</th>
                <th className="px-6 py-4 font-medium text-slate-500">Estado</th>
              </tr>
            </thead>
            <tbody>
              {products.length === 0 && !error && (
                <tr>
                  <td colSpan={5} className="px-6 py-12 text-center text-slate-400">
                    No hay productos registrados
                  </td>
                </tr>
              )}
              {products.map((product) => (
                <tr key={product.id} className="border-b border-slate-100 hover:bg-slate-50">
                  <td className="px-6 py-4 font-medium text-slate-900">{product.name}</td>
                  <td className="px-6 py-4 text-slate-500">{product.vendor?.name ?? "—"}</td>
                  <td className="px-6 py-4 text-slate-900">${product.price.toFixed(2)}</td>
                  <td className="px-6 py-4 text-slate-500">{product.stock}</td>
                  <td className="px-6 py-4">
                    <span
                      className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-medium ${
                        product.isActive
                          ? "bg-emerald-100 text-emerald-700"
                          : "bg-red-100 text-red-700"
                      }`}
                    >
                      {product.isActive ? "Activo" : "Inactivo"}
                    </span>
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
