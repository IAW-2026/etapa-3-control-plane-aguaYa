"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { useToast } from "@/components/ui/ToastProvider"
import { toggleVendor, updateVendor, deleteVendor } from "@/lib/actions/vendor"
import type { Vendor } from "@/lib/types"
import type { FieldConfig } from "@/components/ui/EditModal"
import EditModal from "@/components/ui/EditModal"
import ConfirmDialog from "@/components/ui/ConfirmDialog"
import VendorProductsBox from "@/components/vendors/VendorProductsBox"
import VendorOrdersBox from "@/components/vendors/VendorOrdersBox"
import { Mail, MapPin, BadgeCheck, Package, ShoppingCart, Calendar, Edit3, Trash2, Power, ChevronLeft, Hash } from "lucide-react"
import Link from "next/link"

const editFields: FieldConfig[] = [
  { name: "name", label: "Nombre", required: true },
  { name: "address", label: "Dirección", required: true },
  { name: "description", label: "Descripción", type: "textarea" },
  { name: "cuil", label: "CUIL", placeholder: "20-12345678-9" },
  { name: "cuit", label: "CUIT", placeholder: "30-12345678-9" },
  { name: "image", label: "URL de imagen", type: "image", placeholder: "https://..." },
]

type Props = {
  vendor: Vendor
}

export default function VendorDetailClient({ vendor: initial }: Props) {
  const router = useRouter()
  const [vendor, setVendor] = useState(initial)
  const { showToast } = useToast()
  const [editOpen, setEditOpen] = useState(false)
  const [deleteOpen, setDeleteOpen] = useState(false)
  const [saving, setSaving] = useState(false)
  const [deleting, setDeleting] = useState(false)

  async function handleToggle() {
    try {
      const res = await toggleVendor(vendor.id)
      setVendor((prev) => ({ ...prev, isActive: !prev.isActive }))
      showToast("success", "Estado actualizado")
    } catch {
      showToast("error", "Error al cambiar estado")
    }
  }

  async function handleSave(data: Record<string, string>) {
    const { name, address, description, cuil, cuit, image } = data
    setSaving(true)
    try {
      const res = await updateVendor(vendor.id, { name, address, description, cuil, cuit, image: image?.trim() || undefined })
      setVendor((prev) => ({ ...prev, ...res.vendor }))
      setEditOpen(false)
      showToast("success", "Vendedor actualizado correctamente")
    } catch {
      showToast("error", "Error al guardar cambios")
    } finally {
      setSaving(false)
    }
  }

  async function handleDelete() {
    setDeleting(true)
    try {
      await deleteVendor(vendor.id)
      showToast("success", "Vendedor eliminado correctamente")
      router.push("/dashboard/vendors")
    } catch {
      showToast("error", "Error al eliminar vendedor")
      setDeleting(false)
      setDeleteOpen(false)
    }
  }

  return (
    <div>
      <Link
        href="/dashboard/vendors"
        className="mb-6 inline-flex items-center gap-1 text-sm text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200"
      >
        <ChevronLeft className="h-4 w-4" />
        Volver a vendedores
      </Link>

      <div className="rounded-xl border border-slate-200 bg-white shadow-sm dark:border-slate-700 dark:bg-slate-800">
        <div className="flex items-center justify-between border-b border-slate-200 px-6 py-5 dark:border-slate-700">
          <div className="flex items-center gap-3">
            {vendor.image ? (
              <img
                src={vendor.image}
                alt={vendor.name}
                className="h-10 w-10 rounded-lg object-cover"
              />
            ) : (
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-600 text-sm font-bold text-white">
                {vendor.name.charAt(0).toUpperCase()}
              </div>
            )}
            <h1 className="text-xl font-bold text-slate-900 dark:text-slate-100">
              {vendor.name}
            </h1>
            <span
              className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-medium ${
                vendor.isActive
                  ? "bg-emerald-100 text-emerald-700"
                  : "bg-red-100 text-red-700"
              }`}
            >
              {vendor.isActive ? "Activo" : "Inactivo"}
            </span>
          </div>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleToggle}
              className="flex items-center gap-1.5 rounded-lg border border-slate-300 px-3 py-2 text-sm text-slate-600 hover:bg-slate-50 dark:border-slate-600 dark:text-slate-400 dark:hover:bg-slate-700"
            >
              <Power className="h-4 w-4" />
              {vendor.isActive ? "Desactivar" : "Activar"}
            </button>
            <button
              type="button"
              onClick={() => setEditOpen(true)}
              className="flex items-center gap-1.5 rounded-lg bg-blue-600 px-3 py-2 text-sm text-white hover:bg-blue-700"
            >
              <Edit3 className="h-4 w-4" />
              Editar
            </button>
            <button
              type="button"
              onClick={() => setDeleteOpen(true)}
              className="flex items-center gap-1.5 rounded-lg border border-red-300 px-3 py-2 text-sm text-red-600 hover:bg-red-50 dark:border-red-800 dark:text-red-400 dark:hover:bg-red-900/20"
            >
              <Trash2 className="h-4 w-4" />
              Eliminar
            </button>
          </div>
        </div>

        <div className="p-6">
            <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
              <div className="space-y-4">
                <div className="flex items-center gap-2 text-sm">
                  <Mail className="h-4 w-4 text-slate-400" />
                  <span className="text-slate-500">Email:</span>
                  <span className="text-slate-900 dark:text-slate-100">{vendor.clerkEmail || "—"}</span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <MapPin className="h-4 w-4 text-slate-400" />
                  <span className="text-slate-500">Dirección:</span>
                  <span className="text-slate-900 dark:text-slate-100">{vendor.address}</span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <Hash className="h-4 w-4 text-slate-400" />
                  <span className="text-slate-500">CUIL:</span>
                  <span className="text-slate-900 dark:text-slate-100">{vendor.cuil || "—"}</span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <Hash className="h-4 w-4 text-slate-400" />
                  <span className="text-slate-500">CUIT:</span>
                  <span className="text-slate-900 dark:text-slate-100">{vendor.cuit || "—"}</span>
                </div>
              </div>
              <div className="space-y-4">
                <div className="flex items-center gap-2 text-sm">
                  <Package className="h-4 w-4 text-slate-400" />
                  <span className="text-slate-500">Productos:</span>
                  <span className="font-medium text-slate-900 dark:text-slate-100">{vendor._count.products}</span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <ShoppingCart className="h-4 w-4 text-slate-400" />
                  <span className="text-slate-500">Pedidos:</span>
                  <span className="font-medium text-slate-900 dark:text-slate-100">{vendor._count.orders}</span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <Calendar className="h-4 w-4 text-slate-400" />
                  <span className="text-slate-500">Creado:</span>
                  <span className="text-slate-900 dark:text-slate-100">
                    {new Date(vendor.createdAt).toLocaleDateString("es-AR", {
                      year: "numeric",
                      month: "long",
                      day: "numeric",
                    })}
                  </span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <BadgeCheck className="h-4 w-4 text-slate-400" />
                  <span className="text-slate-500">Clerk:</span>
                  <span className="text-slate-900 dark:text-slate-100">{vendor.clerkName || "—"}</span>
                </div>
              </div>
            </div>
            {vendor.description && (
              <div className="mt-6 border-t border-slate-200 pt-4 dark:border-slate-700">
                <p className="text-sm text-slate-500">Descripción:</p>
                <p className="mt-1 text-sm text-slate-900 dark:text-slate-100">{vendor.description}</p>
              </div>
            )}
          </div>
      </div>

      <div className="mt-2 grid grid-cols-1 gap-6 lg:grid-cols-2">
        <VendorProductsBox vendorId={vendor.id} />
        <VendorOrdersBox vendorId={vendor.id} vendorName={vendor.name} />
      </div>

      <EditModal
        isOpen={editOpen}
        onClose={() => setEditOpen(false)}
        onSave={handleSave}
        title="Editar Vendedor"
        fields={editFields}
        initialData={{
          name: vendor.name,
          address: vendor.address,
          description: vendor.description ?? "",
          cuil: vendor.cuil ?? "",
          cuit: vendor.cuit ?? "",
          image: vendor.image ?? "",
        }}
        saving={saving}
      />

      <ConfirmDialog
        isOpen={deleteOpen}
        onClose={() => setDeleteOpen(false)}
        onConfirm={handleDelete}
        title="Eliminar vendedor"
        message="¿Estás seguro de eliminar este vendedor? Esta acción no se puede deshacer."
        confirmLabel="Sí, eliminar"
        loading={deleting}
      />
    </div>
  )
}
