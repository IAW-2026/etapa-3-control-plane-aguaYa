"use client"

import { useState, useEffect, useCallback } from "react"
import { getProducts } from "@/lib/actions/vendor"
import type { ProductItem } from "@/lib/types"
import ProductEditModal from "@/components/products/ProductEditModal"
import { Search, ChevronLeft, ChevronRight, Loader2, Package } from "lucide-react"

const PAGE_SIZE = 10

export default function ProductsPage() {
  const [products, setProducts] = useState<ProductItem[]>([])
  const [total, setTotal] = useState(0)
  const [page, setPage] = useState(1)
  const [search, setSearch] = useState("")
  const [loading, setLoading] = useState(true)
  const [selected, setSelected] = useState<ProductItem | null>(null)
  const [editOpen, setEditOpen] = useState(false)
  const [allVendors, setAllVendors] = useState<{ id: string; name: string }[]>([])

  const pageCount = Math.max(1, Math.ceil(total / PAGE_SIZE))

  const load = useCallback(async (p: number, s: string) => {
    setLoading(true)
    try {
      const res = await getProducts({ page: String(p), pageSize: String(PAGE_SIZE), ...(s ? { q: s } : {}) })
      setProducts(res.items)
      setTotal(res.total)
    } catch {
      setProducts([])
      setTotal(0)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    load(page, search)
  }, [page, load])

  useEffect(() => {
    if (editOpen) return
    const vendorSet = new Map<string, string>()
    products.forEach((p) => {
      if (p.vendor?.name) {
        vendorSet.set(p.vendor.id, p.vendor.name)
      }
    })
    setAllVendors(Array.from(vendorSet.entries()).map(([id, name]) => ({ id, name })))
  }, [products, editOpen])

  function handleSearch() {
    setPage(1)
    load(1, search)
  }

  function handleKeyDown(e: React.KeyboardEvent) {
    if (e.key === "Enter") handleSearch()
  }

  function handleRowClick(product: ProductItem) {
    setSelected(product)
    setEditOpen(true)
  }

  return (
    <div>
      <div className="mb-8">
        <p className="text-sm font-semibold uppercase tracking-[0.24em] text-sky-700 dark:text-sky-400">Inventario</p>
        <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-100">Productos</h1>
      </div>

      <div className="mb-6 flex items-center gap-3">
        <div className="relative flex-1">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Buscar producto por nombre..."
            className="w-full rounded-xl border border-white/30 bg-gradient-to-br from-white/30 to-slate-100/30 py-2.5 pl-10 pr-4 text-sm text-slate-900 placeholder-slate-400 shadow-lg shadow-black/5 backdrop-blur-xl focus:border-blue-500/50 focus:outline-none focus:ring-2 focus:ring-blue-500/20 dark:border-slate-700/40 dark:from-slate-900/40 dark:to-slate-800/40 dark:text-slate-100 dark:placeholder-slate-500"
          />
        </div>
        <button
          type="button"
          onClick={handleSearch}
          className="rounded-xl bg-blue-600 px-5 py-2.5 text-sm text-white shadow-lg shadow-black/5 transition-colors hover:bg-blue-700"
        >
          Buscar
        </button>
      </div>

      <div className="overflow-hidden rounded-xl border border-white/30 bg-gradient-to-br from-white/30 to-slate-100/30 shadow-lg shadow-black/5 backdrop-blur-xl dark:border-slate-700/40 dark:from-slate-900/40 dark:to-slate-800/40">
        {loading ? (
          <div className="flex items-center justify-center py-20">
            <Loader2 className="h-6 w-6 animate-spin text-slate-400" />
          </div>
        ) : products.length === 0 ? (
          <div className="flex flex-col items-center gap-2 py-20 text-sm text-slate-500 dark:text-slate-400">
            <Package className="h-8 w-8" />
            <p>No se encontraron productos.</p>
          </div>
        ) : (
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-white/20 text-left text-xs font-medium uppercase tracking-wider text-slate-500 dark:border-slate-700/30 dark:text-slate-400">
                <th className="px-6 py-4">Producto</th>
                <th className="px-6 py-4">Vendedor</th>
                <th className="px-6 py-4">Precio</th>
                <th className="px-6 py-4">Stock</th>
                <th className="px-6 py-4">Estado</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/10 dark:divide-slate-700/20">
              {products.map((p) => (
                <tr
                  key={p.id}
                  className="cursor-pointer transition-colors hover:bg-white/20 dark:hover:bg-white/5"
                  onClick={() => handleRowClick(p)}
                >
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      {p.image ? (
                        <img src={p.image} alt="" className="h-9 w-9 rounded-lg object-cover" />
                      ) : (
                        <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-slate-200 text-xs text-slate-500 dark:bg-slate-700">
                          {p.name.charAt(0)}
                        </div>
                      )}
                      <span className="font-medium text-slate-900 dark:text-slate-100">{p.name}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-slate-600 dark:text-slate-400">
                    {p.vendor?.name ?? "—"}
                  </td>
                  <td className="px-6 py-4 text-slate-700 dark:text-slate-300">
                    ${Number(p.price).toLocaleString("es-AR")}
                  </td>
                  <td className="px-6 py-4 text-slate-700 dark:text-slate-300">{p.stock}</td>
                  <td className="px-6 py-4">
                    <span
                      className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-medium ${
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
        )}

        {!loading && products.length > 0 && (
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
        )}
      </div>

      {selected && (
        <ProductEditModal
          product={selected}
          isOpen={editOpen}
          onClose={() => { setEditOpen(false); setSelected(null) }}
          onSave={() => { load(page, search) }}
        />
      )}
    </div>
  )
}
