"use client"

import { useState, useEffect, useCallback } from "react"
import { getBuyerAdmins, removeBuyerAdminRole } from "@/lib/actions/buyer-admin"
import type { AdminBuyer, ListResponse } from "@/lib/types"
import { Search, ChevronLeft, ChevronRight, Loader2, Shield } from "lucide-react"
import Link from "next/link"
import { Pencil, UserX } from "lucide-react"
import CreateBuyerAdminWrapper from "@/components/buyer/CreateBuyerAdminWrapper"

const PAGE_SIZE = 10

export default function BuyerAdminsPage() {
  const [data, setData] = useState<ListResponse<AdminBuyer> | null>(null)
  const [page, setPage] = useState(1)
  const [search, setSearch] = useState("")
  const [activeTab, setActiveTab] = useState("")
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [reloadKey, setReloadKey] = useState(0)

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
      if (tab) params.isBlocked = tab
      const res = await getBuyerAdmins(params)
      setData(res)
    } catch (e) {
      setError(e instanceof Error ? e.message : "Error al cargar administradores")
      setData(null)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    load(page, search, activeTab)
  }, [page, reloadKey, load])

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

  async function handleRemoveRole(id: string) {
    await removeBuyerAdminRole(id)
    setReloadKey((k) => k + 1)
  }

  return (
    <div>
      <div className="mb-8 flex items-center justify-between">
        <div>
          <p className="text-sm font-semibold uppercase tracking-[0.24em] text-sky-700 dark:text-sky-400">Buyer App</p>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-100">Admin Buyer</h1>
        </div>
        <CreateBuyerAdminWrapper onCreated={() => setReloadKey((k) => k + 1)} />
      </div>

      {error && (
        <div className="mb-6 rounded-xl border border-red-200/60 bg-white/80 p-4 text-sm text-red-700 shadow-lg shadow-black/5 backdrop-blur-xl dark:border-red-800/60 dark:bg-slate-900/80 dark:text-red-400">
          {error}
        </div>
      )}

      <div className="mb-4 flex gap-1 rounded-xl bg-gradient-to-br from-slate-100/70 to-slate-200/50 p-1 shadow-lg shadow-black/5 backdrop-blur-xl dark:from-slate-800/60 dark:to-slate-800/40">
        {[
          { label: "Todos", value: "" },
          { label: "Bloqueados", value: "true" },
          { label: "Activos", value: "false" },
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
            placeholder="Buscar por email o nombre..."
            className="w-full rounded-xl border border-white/30 bg-gradient-to-br from-white/30 to-slate-100/30 py-2.5 pl-10 pr-4 text-sm text-slate-900 placeholder-slate-400 shadow-lg shadow-black/5 backdrop-blur-xl focus:border-blue-500/50 focus:outline-none focus:ring-2 focus:ring-blue-500/20 dark:border-slate-700/40 dark:from-slate-900/40 dark:to-slate-800/40 dark:text-slate-100 dark:placeholder-slate-500"
          />
        </div>
      </div>

      <div className="overflow-hidden rounded-xl border border-white/30 bg-gradient-to-br from-white/30 to-slate-100/30 shadow-lg shadow-black/5 backdrop-blur-xl dark:border-slate-700/40 dark:from-slate-900/40 dark:to-slate-800/40">
        <div className="overflow-x-auto">
          {loading ? (
            <div className="flex items-center justify-center py-20">
              <Loader2 className="h-6 w-6 animate-spin text-slate-400" />
            </div>
          ) : !data || data.items.length === 0 ? (
            <div className="flex flex-col items-center gap-2 py-16 text-sm text-slate-400">
              <Shield className="h-8 w-8" />
              <p>No hay administradores registrados</p>
            </div>
          ) : (
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-white/20 text-left text-xs font-medium uppercase tracking-wider text-slate-500 dark:border-slate-700/30 dark:text-slate-400">
                  <th className="px-6 py-4">Email</th>
                  <th className="px-6 py-4">Nombre</th>
                  <th className="px-6 py-4">Estado</th>
                  <th className="px-6 py-4">Acciones</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/10 dark:divide-slate-700/20">
                {data.items.map((admin) => (
                  <tr key={admin.clerkUserId} className="transition-colors hover:bg-white/20 dark:hover:bg-white/5">
                    <td className="px-6 py-4">
                      <Link href={`/dashboard/buyer-admins/${admin.clerkUserId}`} className="font-medium text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300">
                        {admin.email}
                      </Link>
                    </td>
                    <td className="px-6 py-4 text-slate-700 dark:text-slate-300">{admin.nombre || "—"}</td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-medium ${
                        admin.isBlocked
                          ? "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400"
                          : "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400"
                      }`}>
                        {admin.isBlocked ? "Bloqueado" : "Activo"}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-1">
                        <Link
                          href={`/dashboard/buyer-admins/${admin.clerkUserId}`}
                          className="rounded-lg p-1.5 text-slate-500 hover:bg-white/40 dark:hover:bg-slate-700/30"
                          title="Editar"
                        >
                          <Pencil className="h-4 w-4" />
                        </Link>
                        <button
                          type="button"
                          onClick={() => handleRemoveRole(admin.clerkUserId)}
                          className="rounded-lg p-1.5 text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20"
                          title={`Remove Admin ${admin.email}`}
                        >
                          <UserX className="h-4 w-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>

        {!loading && data && data.pageCount > 1 && (
          <div className="flex items-center justify-between border-t border-white/20 px-6 py-3 dark:border-slate-700/30">
            <span className="text-xs text-slate-500 dark:text-slate-400">
              Pág. {page} de {pageCount} ({data.total} adm.)
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
