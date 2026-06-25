"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import type { AdminBuyer } from "@/lib/types"
import { toggleBuyerAdmin, removeBuyerAdminRole } from "@/lib/actions/buyer-admin"
import { useToast } from "@/components/ui/ToastProvider"
import ConfirmDialog from "@/components/ui/ConfirmDialog"
import { ChevronLeft, Power, UserX, Loader2 } from "lucide-react"
import Link from "next/link"

export default function BuyerAdminDetailClient({ admin: initial }: { admin: AdminBuyer }) {
  const [admin, setAdmin] = useState(initial)
  const [loading, setLoading] = useState(false)
  const router = useRouter()
  const { showToast } = useToast()

  const [deleteOpen, setDeleteOpen] = useState(false)
  const [deleting, setDeleting] = useState(false)

  async function handleToggle() {
    setLoading(true)
    try {
      const res = await toggleBuyerAdmin(admin.clerkUserId)
      setAdmin((prev) => ({ ...prev, isBlocked: res.nuevoEstado === "bloqueado" }))
      showToast("success", `Admin buyer ${res.nuevoEstado === "bloqueado" ? "bloqueado" : "desbloqueado"}`)
    } catch {
      showToast("error", "Error al cambiar estado del admin buyer")
    } finally {
      setLoading(false)
    }
  }

  async function handleRemoveRole() {
    setDeleting(true)
    try {
      await removeBuyerAdminRole(admin.clerkUserId)
      showToast("success", "Rol admin buyer removido")
      router.push("/dashboard/buyer-admins")
    } catch {
      showToast("error", "Error al remover rol admin buyer")
      setDeleting(false)
      setDeleteOpen(false)
    }
  }

  return (
    <div>
      <div className="mb-6">
        <Link
          href="/dashboard/buyer-admins"
          className="inline-flex items-center gap-1 text-sm text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200"
        >
          <ChevronLeft className="h-4 w-4" />
          Volver a admin buyers
        </Link>
      </div>

      <div className="rounded-xl border border-white/30 bg-gradient-to-br from-white/30 to-slate-100/30 shadow-lg shadow-black/5 backdrop-blur-xl dark:border-slate-700/40 dark:from-slate-900/40 dark:to-slate-800/40">
        <div className="flex items-start justify-between border-b border-white/20 px-6 py-5 dark:border-slate-700/30">
          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-xl font-bold text-slate-900 dark:text-slate-100">{admin.nombre || admin.email}</h1>
              <span className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-medium ${
                admin.isBlocked
                  ? "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400"
                  : "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400"
              }`}>
                {admin.isBlocked ? "Bloqueado" : "Activo"}
              </span>
            </div>
            <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">Admin Buyer — Gestión global</p>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleToggle}
              disabled={loading}
              className="flex items-center gap-1.5 rounded-lg border border-white/30 bg-gradient-to-br from-white/30 to-slate-100/30 px-3 py-2 text-sm text-slate-600 shadow-lg shadow-black/5 backdrop-blur-xl transition-colors hover:bg-white/40 disabled:opacity-50 dark:border-slate-700/40 dark:from-slate-900/40 dark:to-slate-800/40 dark:text-slate-400"
            >
              <Power className="h-4 w-4" />
              {admin.isBlocked ? "Desbloquear" : "Bloquear"}
            </button>
            <button
              type="button"
              onClick={() => setDeleteOpen(true)}
              className="flex items-center gap-1.5 rounded-lg border border-red-300/50 px-3 py-2 text-sm text-red-600 shadow-lg shadow-black/5 backdrop-blur-xl transition-colors hover:bg-red-50/50 dark:border-red-800/40 dark:text-red-400 dark:hover:bg-red-900/20"
            >
              <UserX className="h-4 w-4" />
              Remove Admin
            </button>
          </div>
        </div>

        <div className="p-6">
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
            <div>
              <p className="text-xs font-medium text-slate-400 uppercase">Email</p>
              <p className="mt-1 text-sm text-slate-900 dark:text-slate-100">{admin.email}</p>
            </div>
            <div>
              <p className="text-xs font-medium text-slate-400 uppercase">Nombre</p>
              <p className="mt-1 text-sm text-slate-900 dark:text-slate-100">{admin.nombre || "—"}</p>
            </div>
            <div>
              <p className="text-xs font-medium text-slate-400 uppercase">Teléfono</p>
              <p className="mt-1 text-sm text-slate-900 dark:text-slate-100">{admin.telefono || "—"}</p>
            </div>
            <div>
              <p className="text-xs font-medium text-slate-400 uppercase">Estado</p>
              <p className="mt-1 text-sm text-slate-900 dark:text-slate-100">{admin.isBlocked ? "Bloqueado" : "Activo"}</p>
            </div>
            <div className="sm:col-span-2">
              <p className="text-xs font-medium text-slate-400 uppercase">Creado</p>
              <p className="mt-1 text-sm text-slate-900 dark:text-slate-100">
                {new Date(admin.createdAt).toLocaleDateString("es-AR", {
                  year: "numeric",
                  month: "long",
                  day: "numeric",
                  hour: "2-digit",
                  minute: "2-digit",
                })}
              </p>
            </div>
          </div>
        </div>
      </div>

      <ConfirmDialog
        isOpen={deleteOpen}
        onClose={() => setDeleteOpen(false)}
        onConfirm={handleRemoveRole}
        title="Remove Admin Rights"
        message={`¿Estás seguro de quitar los permisos de admin a "${admin.email}"? El usuario seguirá existiendo en Clerk y podrá operar como buyer normal.`}
        confirmLabel="Sí, quitar admin"
        loading={deleting}
      />
    </div>
  )
}
