"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import type { PaymentAdmin } from "@/lib/types"
import { togglePaymentAdmin, updatePaymentAdmin, deletePaymentAdmin } from "@/lib/actions/payment-admin"
import { useToast } from "@/components/ui/ToastProvider"
import Modal from "@/components/ui/Modal"
import ConfirmDialog from "@/components/ui/ConfirmDialog"
import { ChevronLeft, Power, Pencil, Trash2, Loader2 } from "lucide-react"
import Link from "next/link"

export default function PaymentAdminDetailClient({ admin: initial }: { admin: PaymentAdmin }) {
  const [admin, setAdmin] = useState(initial)
  const [loading, setLoading] = useState(false)
  const router = useRouter()
  const { showToast } = useToast()

  const [editOpen, setEditOpen] = useState(false)
  const [deleteOpen, setDeleteOpen] = useState(false)
  const [saving, setSaving] = useState(false)
  const [deleting, setDeleting] = useState(false)

  const [editNombre, setEditNombre] = useState("")
  const [editTelefono, setEditTelefono] = useState("")

  function openEdit() {
    setEditNombre(admin.nombre ?? "")
    setEditTelefono(admin.telefono ?? "")
    setEditOpen(true)
  }

  async function handleToggle() {
    setLoading(true)
    try {
      const res = await togglePaymentAdmin(admin.clerkUserId)
      setAdmin((prev) => ({ ...prev, isBlocked: res.nuevoEstado === "bloqueado" }))
      showToast("success", `Admin de pagos ${res.nuevoEstado === "bloqueado" ? "bloqueado" : "desbloqueado"}`)
    } catch {
      showToast("error", "Error al cambiar estado del admin de pagos")
    } finally {
      setLoading(false)
    }
  }

  async function handleSave(e: React.FormEvent) {
    e.preventDefault()
    setSaving(true)
    try {
      const updated = await updatePaymentAdmin(admin.clerkUserId, {
        nombre: editNombre || undefined,
        telefono: editTelefono || undefined,
      })
      setAdmin(updated)
      setEditOpen(false)
      showToast("success", "Admin de pagos actualizado")
    } catch {
      showToast("error", "Error al actualizar admin de pagos")
    } finally {
      setSaving(false)
    }
  }

  async function handleDelete() {
    setDeleting(true)
    try {
      await deletePaymentAdmin(admin.clerkUserId)
      showToast("success", "Admin de pagos eliminado")
      router.push("/dashboard/payment-admins")
    } catch {
      showToast("error", "Error al eliminar admin de pagos")
      setDeleting(false)
      setDeleteOpen(false)
    }
  }

  const inputClass = "w-full rounded-lg border border-white/30 bg-gradient-to-br from-white/30 to-slate-100/30 px-3 py-2 text-slate-900 shadow-lg shadow-black/5 backdrop-blur-xl focus:border-blue-500/50 focus:outline-none focus:ring-2 focus:ring-blue-500/20 dark:border-slate-700/40 dark:from-slate-900/40 dark:to-slate-800/40 dark:text-slate-100"

  return (
    <div>
      <div className="mb-6">
        <Link
          href="/dashboard/payment-admins"
          className="inline-flex items-center gap-1 text-sm text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200"
        >
          <ChevronLeft className="h-4 w-4" />
          Volver a admin pagos
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
            <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">Admin Pagos — Gestión global</p>
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
              onClick={openEdit}
              className="flex items-center gap-1.5 rounded-lg bg-blue-600 px-3 py-2 text-sm text-white shadow-lg shadow-black/5 transition-colors hover:bg-blue-700"
            >
              <Pencil className="h-4 w-4" />
              Editar
            </button>
            <button
              type="button"
              onClick={() => setDeleteOpen(true)}
              className="flex items-center gap-1.5 rounded-lg border border-red-300/50 px-3 py-2 text-sm text-red-600 shadow-lg shadow-black/5 backdrop-blur-xl transition-colors hover:bg-red-50/50 dark:border-red-800/40 dark:text-red-400 dark:hover:bg-red-900/20"
            >
              <Trash2 className="h-4 w-4" />
              Eliminar
            </button>
          </div>
        </div>

        <div className="p-6">
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
            <div>
              <p className="text-xs font-medium uppercase text-slate-400">Email</p>
              <p className="mt-1 text-sm text-slate-900 dark:text-slate-100">{admin.email}</p>
            </div>
            <div>
              <p className="text-xs font-medium uppercase text-slate-400">Nombre</p>
              <p className="mt-1 text-sm text-slate-900 dark:text-slate-100">{admin.nombre || "—"}</p>
            </div>
            <div>
              <p className="text-xs font-medium uppercase text-slate-400">Teléfono</p>
              <p className="mt-1 text-sm text-slate-900 dark:text-slate-100">{admin.telefono || "—"}</p>
            </div>
            <div>
              <p className="text-xs font-medium uppercase text-slate-400">Estado</p>
              <p className="mt-1 text-sm text-slate-900 dark:text-slate-100">{admin.isBlocked ? "Bloqueado" : "Activo"}</p>
            </div>
            <div className="sm:col-span-2">
              <p className="text-xs font-medium uppercase text-slate-400">Creado</p>
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

      {editOpen && (
        <Modal isOpen={editOpen} onClose={() => setEditOpen(false)} title="Editar Admin de Pagos">
          <form onSubmit={handleSave} className="space-y-4 text-sm">
            <div>
              <label className="mb-1 block text-xs font-medium text-slate-500 dark:text-slate-400">Nombre</label>
              <input
                type="text"
                value={editNombre}
                onChange={(e) => setEditNombre(e.target.value)}
                className={inputClass}
              />
            </div>
            <div>
              <label className="mb-1 block text-xs font-medium text-slate-500 dark:text-slate-400">Teléfono</label>
              <input
                type="text"
                value={editTelefono}
                onChange={(e) => setEditTelefono(e.target.value)}
                className={inputClass}
              />
            </div>
            <div className="flex justify-end gap-2 border-t border-white/20 pt-4 dark:border-slate-700/30">
              <button
                type="button"
                onClick={() => setEditOpen(false)}
                disabled={saving}
                className="rounded-lg border border-white/30 bg-gradient-to-br from-white/30 to-slate-100/30 px-4 py-2 text-sm text-slate-600 shadow-lg shadow-black/5 backdrop-blur-xl transition-colors hover:bg-white/40 disabled:opacity-50 dark:border-slate-700/40 dark:from-slate-900/40 dark:to-slate-800/40 dark:text-slate-400"
              >
                Cancelar
              </button>
              <button
                type="submit"
                disabled={saving}
                className="flex items-center gap-1.5 rounded-lg bg-blue-600 px-4 py-2 text-sm text-white shadow-lg shadow-black/5 transition-colors hover:bg-blue-700 disabled:opacity-50"
              >
                {saving && <Loader2 className="h-4 w-4 animate-spin" />}
                {saving ? "Guardando..." : "Guardar cambios"}
              </button>
            </div>
          </form>
        </Modal>
      )}

      <ConfirmDialog
        isOpen={deleteOpen}
        onClose={() => setDeleteOpen(false)}
        onConfirm={handleDelete}
        title="Eliminar admin de pagos"
        message={`¿Estás seguro de eliminar a "${admin.email}"? Se eliminará el usuario de Clerk y perderá todos los accesos. Esta acción no se puede deshacer.`}
        confirmLabel="Sí, eliminar"
        loading={deleting}
      />
    </div>
  )
}
