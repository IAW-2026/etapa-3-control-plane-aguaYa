"use client"

import { useState, useEffect, useCallback } from "react"
import { getVendorProducts } from "@/lib/actions/vendor"
import type { ProductItem } from "@/lib/types"
import { Package, ChevronLeft, ChevronRight, Loader2 } from "lucide-react"
import ProductEditModal from "@/components/products/ProductEditModal"

type Props = {
  vendorId: string
}

const PAGE_SIZE = 10

export default function VendorProductsBox({ vendorId }: Props) {
  const [products, setProducts] = useState<ProductItem[]>([])
  const [total, setTotal] = useState(0)
  const [page, setPage] = useState(1)
  const [loading, setLoading] = useState(true)
  const [selected, setSelected] = useState<ProductItem | null>(null)
  const [editOpen, setEditOpen] = useState(false)

  const pageCount = Math.max(1, Math.ceil(total / PAGE_SIZE))

  const load = useCallback(async (p: number) => {
    setLoading(true)
    try {
      const res = await getVendorProducts(vendorId, { page: String(p), pageSize: String(PAGE_SIZE) })
      setProducts(res.items)
      setTotal(res.total)
    } catch {
      setProducts([])
      setTotal(0)
    } finally {
      setLoading(false)
    }
  }, [vendorId])

  useEffect(() => {
    load(page)
  }, [page, load])

  function handleRowClick(product: ProductItem) {
    setSelected(product)
    setEditOpen(true)
  }

  return (
    <div className="mt-6 rounded-xl border border-white/30 bg-gradient-to-br from-white/30 to-slate-100/30 shadow-lg shadow-black/5 backdrop-blur-xl dark:border-slate-700/40 dark:from-slate-900/40 dark:to-slate-800/40">
      <div className="flex items-center gap-2 border-b border-white/20 px-6 py-4 dark:border-slate-700/30">
        <Package className="h-5 w-5 text-slate-500 dark:text-slate-400" />
        <h2 className="text-lg font-semibold text-slate-900 dark:text-slate-100">Productos</h2>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="h-6 w-6 animate-spin text-slate-400" />
        </div>
      ) : products.length === 0 ? (
        <div className="px-6 py-8 text-center text-sm text-slate-500 dark:text-slate-400">
          Este vendedor no tiene productos.
        </div>
      ) : (
        <>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-white/20 text-left text-xs font-medium uppercase tracking-wider text-slate-500 dark:border-slate-700/30 dark:text-slate-400">
                  <th className="px-6 py-3">Producto</th>
                  <th className="px-6 py-3">Precio</th>
                  <th className="px-6 py-3">Stock</th>
                  <th className="px-6 py-3">Estado</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/10 dark:divide-slate-700/20">
                {products.map((p) => (
                  <tr
                    key={p.id}
                    className="cursor-pointer transition-colors hover:bg-white/20 dark:hover:bg-white/5"
                    onClick={() => handleRowClick(p)}
                  >
                    <td className="px-6 py-3">
                      <div className="flex items-center gap-2">
                        {p.image ? (
                          <img src={p.image} alt="" className="h-8 w-8 rounded object-cover" />
                        ) : (
                          <div className="flex h-8 w-8 items-center justify-center rounded bg-slate-200 text-xs text-slate-500 dark:bg-slate-700">
                            {p.name.charAt(0)}
                          </div>
                        )}
                        <span className="font-medium text-slate-900 dark:text-slate-100">{p.name}</span>
                      </div>
                    </td>
                    <td className="px-6 py-3 text-slate-700 dark:text-slate-300">${Number(p.price).toLocaleString("es-AR")}</td>
                    <td className="px-6 py-3 text-slate-700 dark:text-slate-300">{p.stock}</td>
                    <td className="px-6 py-3">
                      <span
                        className={`inline-flex rounded-full px-2 py-0.5 text-xs font-medium ${
                          p.isActive
                            ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400"
                            : "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400"
                        }`}
                      >
                        {p.isActive ? "Activo" : "Inactivo"}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="flex items-center justify-between border-t border-white/20 px-6 py-3 dark:border-slate-700/30">
            <span className="text-xs text-slate-500 dark:text-slate-400">
              Pág. {page} de {pageCount} ({total} prod.)
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
        <ProductEditModal
          product={selected}
          isOpen={editOpen}
          onClose={() => { setEditOpen(false); setSelected(null) }}
          onSave={() => { load(page) }}
        />
      )}
    </div>
  )
}
