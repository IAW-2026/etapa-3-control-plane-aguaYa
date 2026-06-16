"use client"

import { useState, useEffect, useCallback } from "react"
import { getVendorProducts } from "@/lib/actions/vendor"
import type { ProductItem } from "@/lib/types"
import { Package, DollarSign, PackageCheck, ImageOff, ChevronLeft, ChevronRight } from "lucide-react"
import VendorProductsSkeleton from "@/components/ui/loading/VendorProductsSkeleton"
import ProductEditModal from "@/components/products/ProductEditModal"
import { useToast } from "@/components/ui/ToastProvider"

type Props = {
  vendorId: string
}

export default function VendorProductsBox({ vendorId }: Props) {
  const [items, setItems] = useState<ProductItem[]>([])
  const [page, setPage] = useState(1)
  const [pageCount, setPageCount] = useState(1)
  const [loading, setLoading] = useState(true)
  const [selectedProduct, setSelectedProduct] = useState<ProductItem | null>(null)
  const limit = 5
  const { showToast } = useToast()

  const fetch = useCallback(async (p: number) => {
    setLoading(true)
    try {
      const res = await getVendorProducts(vendorId, { page: String(p), limit: String(limit) })
      setItems(res.items ?? [])
      setPageCount(res.pageCount ?? 1)
      setPage(p)
    } catch {
      setItems([])
    } finally {
      setLoading(false)
    }
  }, [vendorId])

  useEffect(() => { fetch(1) }, [fetch])

  function handleUpdate(updated: ProductItem) {
    setItems((prev) => prev.map((p) => p.id === updated.id ? updated : p))
    setSelectedProduct(updated)
    showToast('success', 'Producto actualizado correctamente')
  }

  function handleDelete(id: string) {
    setItems((prev) => prev.filter((p) => p.id !== id))
    showToast('success', 'Producto eliminado correctamente')
  }

  return (
    <div className="rounded-xl border border-slate-200 bg-white shadow-sm dark:border-slate-700 dark:bg-slate-800">
      <div className="flex items-center justify-between border-b border-slate-200 px-5 py-4 dark:border-slate-700">
        <div className="flex items-center gap-2">
          <Package className="h-5 w-5 text-blue-600" />
          <h2 className="font-semibold text-slate-900 dark:text-slate-100">Productos</h2>
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
      <div className="divide-y divide-slate-100 dark:divide-slate-700">
        {loading && <VendorProductsSkeleton rows={limit} />}
        {!loading && items.length === 0 && (
          <p className="px-5 py-8 text-center text-sm text-slate-400">Sin productos</p>
        )}
        {!loading && items.map((product) => (
          <button
            key={product.id}
            type="button"
            onClick={() => setSelectedProduct(product)}
            className="flex w-full items-center gap-3 px-5 py-3 text-left transition-colors hover:bg-slate-50 dark:hover:bg-slate-700/50"
          >
            {product.image ? (
              <img
                src={product.image}
                alt={product.name}
                className="h-10 w-10 flex-shrink-0 rounded-lg object-cover"
              />
            ) : (
              <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-lg bg-slate-100 text-slate-400 dark:bg-slate-700">
                <ImageOff className="h-4 w-4" />
              </div>
            )}
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-medium text-slate-900 dark:text-slate-100">
                {product.name}
              </p>
              <div className="flex items-center gap-3 text-xs text-slate-500">
                <span className="flex items-center gap-1">
                  <DollarSign className="h-3 w-3" />
                  {product.price.toFixed(2)}
                </span>
                <span className="flex items-center gap-1">
                  <PackageCheck className="h-3 w-3" />
                  {product.stock} uds.
                </span>
              </div>
            </div>
            <span
              className={`flex-shrink-0 rounded-full px-2 py-0.5 text-xs font-medium ${
                product.isActive
                  ? "bg-emerald-100 text-emerald-700"
                  : "bg-red-100 text-red-700"
              }`}
            >
              {product.isActive ? "Activo" : "Inactivo"}
            </span>
          </button>
        ))}
      </div>

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
