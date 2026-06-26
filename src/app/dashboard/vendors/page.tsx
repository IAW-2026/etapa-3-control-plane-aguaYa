"use client"

import { useState, useEffect, useCallback } from "react"
import { getVendors } from "@/lib/actions/vendor"
import type { Vendor, ListResponse } from "@/lib/types"
import { Store, Search, ChevronLeft, ChevronRight, Loader2 } from "lucide-react"
import Link from "next/link"

const PAGE_SIZE = 10

export default function VendorsPage() {
  const [data, setData] = useState<ListResponse<Vendor> | null>(null)
  const [page, setPage] = useState(1)
  const [search, setSearch] = useState("")
  const [activeTab, setActiveTab] = useState("")
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const pageCount = Math.max(1, data?.pageCount ?? 1)

  const load = useCallback(async (p: number, s: string, tab: string) => {
    setLoading(true)
    setError(null)
    try {
      const params: Record<string, string> = {
        page: String(p),
        limit: String(PAGE_SIZE),
      }
      if (s) params.q = s
      if (tab) params.isActive = tab
      const res = await getVendors(params)
      setData(res)
    } catch (e) {
      setError(e instanceof Error ? e.message : "Error al cargar vendedores")
      setData(null)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    load(page, search, activeTab)
  }, [page, load])

  function handleSearch() {
    setPage(1)
    load(1, search, activeTab)
  }

  function handleKeyDown(e: React.KeyboardEvent) {
    if (e.key === "Enter") handleSearch()
  }

  function switchTab(tab: string) {
    setActiveTab(tab)
    setPage(1)
    load(1, search, tab)
  }

  return (
    <div>
      <div className="mb-8 flex items-center justify-between">
        <div>
          <p className="text-sm font-semibold uppercase tracking-[0.24em] text-sky-700 dark:text-sky-400">Seller App</p>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-100">Vendedores</h1>
        </div>
        <Store className="h-8 w-8 text-blue-600/40" />
      </div>

      {error && (
        <div className="mb-6 rounded-xl border border-red-200/60 bg-white/80 px-5 py-4 text-sm text-red-700 shadow-lg shadow-black/5 backdrop-blur-xl dark:border-red-800/60 dark:bg-slate-900/80 dark:text-red-400">
          {error}
        </div>
      )}

      <div className="mb-4 flex gap-1 rounded-xl bg-gradient-to-br from-slate-100/70 to-slate-200/50 p-1 shadow-lg shadow-black/5 backdrop-blur-xl dark:from-slate-800/60 dark:to-slate-800/40">
        {[
          { label: "Todos", value: "" },
          { label: "Activos", value: "true" },
          { label: "Inactivos", value: "false" },
        ].map((tab) => (
          <button
            key={tab.value}
            type="button"
            onClick={() => switchTab(tab.value)}
            className={`flex-1 rounded-lg px-4 py-2 text-center text-sm font-medium transition-all ${
              activeTab === tab.value
                ? "bg-gradient-to-br from-white/60 to-slate-100/60 text-slate-900 shadow-sm backdrop-blur-sm dark:from-slate-700 dark:to-slate-600 dark:text-white"
                : "text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200"
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      <div className="mb-6">
        <div className="relative max-w-md">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Buscar por nombre, email, dirección, CUIL o CUIT..."
            className="w-full rounded-xl border border-white/30 bg-gradient-to-br from-white/30 to-slate-100/30 py-2.5 pl-10 pr-4 text-sm text-slate-900 placeholder-slate-400 shadow-lg shadow-black/5 backdrop-blur-xl focus:border-blue-500/50 focus:outline-none focus:ring-2 focus:ring-blue-500/20 dark:border-slate-700/40 dark:from-slate-900/40 dark:to-slate-800/40 dark:text-slate-100 dark:placeholder-slate-500"
          />
        </div>
      </div>

      <div className="overflow-x-auto rounded-xl border border-white/30 bg-gradient-to-br from-white/30 to-slate-100/30 shadow-lg shadow-black/5 backdrop-blur-xl dark:border-slate-700/40 dark:from-slate-900/40 dark:to-slate-800/40">
        {loading ? (
          <div className="flex items-center justify-center py-20">
            <Loader2 className="h-6 w-6 animate-spin text-slate-400" />
          </div>
        ) : !data || data.items.length === 0 ? (
          <div className="flex flex-col items-center gap-2 py-16 text-sm text-slate-400">
            <Store className="h-8 w-8" />
            <p>No hay vendedores registrados</p>
          </div>
        ) : (
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-white/20 text-left dark:border-slate-700/30">
                <th className="px-6 py-4 font-medium text-slate-500 dark:text-slate-400">Nombre</th>
                <th className="px-6 py-4 font-medium text-slate-500 dark:text-slate-400">Email</th>
                <th className="px-6 py-4 font-medium text-slate-500 dark:text-slate-400">Dirección</th>
                <th className="px-6 py-4 font-medium text-slate-500 dark:text-slate-400">Productos</th>
                <th className="px-6 py-4 font-medium text-slate-500 dark:text-slate-400">Pedidos</th>
                <th className="px-6 py-4 font-medium text-slate-500 dark:text-slate-400">Estado</th>
              </tr>
            </thead>
            <tbody>
              {data.items.map((vendor) => (
                <tr key={vendor.id} className="border-b border-white/10 transition-colors hover:bg-white/20 dark:border-slate-700/20 dark:hover:bg-white/5">
                  <td className="px-6 py-4">
                    <Link href={`/dashboard/vendors/${vendor.id}`} className="font-medium text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300">
                      {vendor.name}
                    </Link>
                  </td>
                  <td className="px-6 py-4 text-slate-500 dark:text-slate-400">{vendor.clerkEmail || "—"}</td>
                  <td className="px-6 py-4 text-slate-500 dark:text-slate-400">{vendor.address}</td>
                  <td className="px-6 py-4 text-slate-500 dark:text-slate-400">{vendor._count.products}</td>
                  <td className="px-6 py-4 text-slate-500 dark:text-slate-400">{vendor._count.orders}</td>
                  <td className="px-6 py-4">
                    <span
                      className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-medium ${
                        vendor.isActive
                          ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400"
                          : "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400"
                      }`}
                    >
                      {vendor.isActive ? "Activo" : "Inactivo"}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}

        {!loading && data && data.pageCount > 1 && (
          <div className="flex items-center justify-between border-t border-white/20 px-6 py-3 dark:border-slate-700/30">
            <span className="text-xs text-slate-500 dark:text-slate-400">
              Pág. {page} de {pageCount} ({data.total} vend.)
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
    </div>
  )
}
