'use client'

import { Suspense, useState, useEffect, useCallback } from "react"
import { useSearchParams, useRouter } from "next/navigation"
import { getProducts } from "@/lib/actions/vendor"
import { Search, ChevronLeft, ChevronRight } from "lucide-react"
import Link from "next/link"
import ProductEditModal from "@/components/products/ProductEditModal"
import { useToast } from "@/components/ui/ToastProvider"
import type { ProductItem } from "@/lib/types"

type ListResponse = {
  items: ProductItem[]
  total: number
  pageCount: number
}

function ProductsPageContent() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const { showToast } = useToast()
  const q = searchParams.get("q") ?? ""
  const isActive = searchParams.get("isActive") ?? ""
  const currentPage = parseInt(searchParams.get("page") ?? "1", 10)

  const [data, setData] = useState<ListResponse | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [selectedProduct, setSelectedProduct] = useState<ProductItem | null>(null)

  const fetch = useCallback(async () => {
    setError(null)
    try {
      const res = await getProducts({
        page: String(currentPage),
        ...(q ? { q } : {}),
        ...(isActive ? { isActive } : {}),
      })
      setData(res)
    } catch (e) {
      setError(e instanceof Error ? e.message : "Error al cargar productos")
      setData(null)
    }
  }, [currentPage, q, isActive])

  useEffect(() => { fetch() }, [fetch])

  function tabUrl(value: string) {
    const params = new URLSearchParams()
    if (value) params.set("isActive", value)
    if (q) params.set("q", q)
    const qs = params.toString()
    return `/dashboard/products${qs ? `?${qs}` : ""}`
  }

  function handlePage(url: string) {
    router.push(url)
  }

  function handleUpdate(updated: ProductItem) {
    setData((prev) => prev ? { ...prev, items: prev.items.map((p) => p.id === updated.id ? updated : p) } : prev)
    setSelectedProduct(updated)
    showToast("success", "Producto actualizado correctamente")
  }

  function handleDelete(id: string) {
    setData((prev) => prev ? { ...prev, items: prev.items.filter((p) => p.id !== id) } : prev)
    showToast("success", "Producto eliminado correctamente")
  }

  return (
    <div>
      <div className="mb-8 flex items-center justify-between">
        <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-100">Productos</h1>
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
            isActive === ""
              ? "bg-blue-600 text-white"
              : "bg-slate-100 text-slate-600 hover:bg-slate-200 dark:bg-slate-700 dark:text-slate-300 dark:hover:bg-slate-600"
          }`}
        >
          Todos
        </Link>
        <Link
          href={tabUrl("true")}
          className={`rounded-lg px-4 py-2 text-sm font-medium transition-colors ${
            isActive === "true"
              ? "bg-blue-600 text-white"
              : "bg-slate-100 text-slate-600 hover:bg-slate-200 dark:bg-slate-700 dark:text-slate-300 dark:hover:bg-slate-600"
          }`}
        >
          Activos
        </Link>
        <Link
          href={tabUrl("false")}
          className={`rounded-lg px-4 py-2 text-sm font-medium transition-colors ${
            isActive === "false"
              ? "bg-blue-600 text-white"
              : "bg-slate-100 text-slate-600 hover:bg-slate-200 dark:bg-slate-700 dark:text-slate-300 dark:hover:bg-slate-600"
          }`}
        >
          Inactivos
        </Link>
      </div>

      <div className="mb-6">
        <form method="GET" action="/dashboard/products" className="relative max-w-md">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
          <input
            name="q"
            defaultValue={q ?? ""}
            placeholder="Buscar por nombre o vendedor..."
            className="w-full rounded-lg border border-slate-300 bg-white py-2.5 pl-10 pr-4 text-sm text-slate-900 placeholder-slate-400 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 dark:border-slate-600 dark:bg-slate-800 dark:text-slate-100 dark:placeholder-slate-500"
          />
          {isActive && <input type="hidden" name="isActive" value={isActive} />}
        </form>
      </div>

      <div className="rounded-xl border border-slate-200 bg-white shadow-sm dark:border-slate-700 dark:bg-slate-800">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-slate-200 text-left dark:border-slate-700">
                <th className="px-6 py-4 font-medium text-slate-500 dark:text-slate-400">Nombre</th>
                <th className="px-6 py-4 font-medium text-slate-500 dark:text-slate-400">Vendedor</th>
                <th className="px-6 py-4 font-medium text-slate-500 dark:text-slate-400">Precio</th>
                <th className="px-6 py-4 font-medium text-slate-500 dark:text-slate-400">Stock</th>
                <th className="px-6 py-4 font-medium text-slate-500 dark:text-slate-400">Estado</th>
              </tr>
            </thead>
            <tbody>
              {(!data || data.items.length === 0) && !error && (
                <tr>
                  <td colSpan={5} className="px-6 py-12 text-center text-slate-400">
                    No hay productos registrados
                  </td>
                </tr>
              )}
              {data?.items.map((product) => (
                <tr
                  key={product.id}
                  onClick={() => setSelectedProduct(product)}
                  className="cursor-pointer border-b border-slate-100 hover:bg-slate-50 dark:border-slate-700 dark:hover:bg-slate-700/50"
                >
                  <td className="px-6 py-4 font-medium text-slate-900 dark:text-slate-100">{product.name}</td>
                  <td className="px-6 py-4 text-slate-500 dark:text-slate-400">
                    {product.vendor ? (
                      <Link href={`/dashboard/vendors/${product.vendor.id}`} className="text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300" onClick={(e) => e.stopPropagation()}>
                        {product.vendor.name}
                      </Link>
                    ) : "—"}
                  </td>
                  <td className="px-6 py-4 text-slate-900 dark:text-slate-100">${product.price.toFixed(2)}</td>
                  <td className="px-6 py-4 text-slate-500 dark:text-slate-400">{product.stock}</td>
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

      {data && data.pageCount > 1 && (
        <div className="mt-6 flex items-center justify-center gap-2">
          {currentPage > 1 && (
            <button
              onClick={() => handlePage(`/dashboard/products?page=${currentPage - 1}${q ? `&q=${q}` : ""}${isActive ? `&isActive=${isActive}` : ""}`)}
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
              onClick={() => handlePage(`/dashboard/products?page=${currentPage + 1}${q ? `&q=${q}` : ""}${isActive ? `&isActive=${isActive}` : ""}`)}
              className="flex items-center gap-1 rounded-lg border border-slate-300 px-3 py-2 text-sm text-slate-600 hover:bg-slate-50 dark:border-slate-600 dark:text-slate-400 dark:hover:bg-slate-700"
            >
              Siguiente
              <ChevronRight className="h-4 w-4" />
            </button>
          )}
        </div>
      )}

      {selectedProduct && (
        <ProductEditModal
          product={selectedProduct}
          open={!!selectedProduct}
          onClose={() => setSelectedProduct(null)}
          onUpdate={handleUpdate}
          onDelete={handleDelete}
        />
      )}
    </div>
  )
}

export default function ProductsPage() {
  return (
    <Suspense fallback={null}>
      <ProductsPageContent />
    </Suspense>
  )
}