"use client"

import Modal from "@/components/ui/Modal"
import { useState } from "react"
import { updateProduct, toggleProduct, deleteProduct } from "@/lib/actions/vendor"
import { useToast } from "@/components/ui/ToastProvider"
import type { ProductItem } from "@/lib/types"
import ConfirmDialog from "@/components/ui/ConfirmDialog"
import { Loader2 } from "lucide-react"

type Props = {
  product: ProductItem
  isOpen: boolean
  onClose: () => void
  onSave: () => void
}

export default function ProductEditModal({ product, isOpen, onClose, onSave }: Props) {
  const { showToast } = useToast()
  const [name, setName] = useState(product.name)
  const [price, setPrice] = useState(String(product.price))
  const [stock, setStock] = useState(String(product.stock))
  const [description, setDescription] = useState(product.description ?? "")
  const [image, setImage] = useState(product.image ?? "")
  const [saving, setSaving] = useState(false)
  const [toggling, setToggling] = useState(false)
  const [deleteOpen, setDeleteOpen] = useState(false)
  const [deleting, setDeleting] = useState(false)

  function reset() {
    setName(product.name)
    setPrice(String(product.price))
    setStock(String(product.stock))
    setDescription(product.description ?? "")
    setImage(product.image ?? "")
  }

  async function handleSave(e: React.FormEvent) {
    e.preventDefault()
    setSaving(true)
    try {
      await updateProduct(product.id, {
        name,
        price: Number(price),
        stock: Number(stock),
        description,
        image: image.trim() || undefined,
      })
      showToast("success", "Producto actualizado")
      onSave()
      onClose()
    } catch {
      showToast("error", "Error al actualizar producto")
    } finally {
      setSaving(false)
    }
  }

  async function handleToggle() {
    setToggling(true)
    try {
      await toggleProduct(product.id)
      showToast("success", product.isActive ? "Producto desactivado" : "Producto activado")
      onSave()
    } catch {
      showToast("error", "Error al cambiar estado")
    } finally {
      setToggling(false)
    }
  }

  async function handleDelete() {
    setDeleting(true)
    try {
      await deleteProduct(product.id)
      showToast("success", "Producto eliminado")
      onSave()
      onClose()
    } catch {
      showToast("error", "Error al eliminar producto")
      setDeleting(false)
      setDeleteOpen(false)
    }
  }

  return (
    <>
      <Modal isOpen={isOpen} onClose={onClose} title={`Editar: ${product.name}`}>
        <form onSubmit={handleSave} className="space-y-4 text-sm">
          <div className="flex gap-4">
            {image ? (
              <img src={image} alt="" className="h-20 w-20 flex-shrink-0 rounded-lg object-cover" onError={(e) => { (e.target as HTMLImageElement).style.display = 'none' }} />
            ) : product.image ? (
              <img src={product.image} alt="" className="h-20 w-20 flex-shrink-0 rounded-lg object-cover" />
            ) : null}
            <div className="flex-1 space-y-3">
              <div>
                <label className="mb-1 block text-xs font-medium text-slate-500 dark:text-slate-400">Nombre</label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                  className="w-full rounded-lg border border-white/30 bg-gradient-to-br from-white/30 to-slate-100/30 px-3 py-2 text-slate-900 placeholder-slate-400 shadow-lg shadow-black/5 backdrop-blur-xl focus:border-blue-500/50 focus:outline-none focus:ring-2 focus:ring-blue-500/20 dark:border-slate-700/40 dark:from-slate-900/40 dark:to-slate-800/40 dark:text-slate-100 dark:placeholder-slate-500"
                />
              </div>
              <div className="flex gap-3">
                <div className="flex-1">
                  <label className="mb-1 block text-xs font-medium text-slate-500 dark:text-slate-400">Precio</label>
                  <input
                    type="number"
                    step="0.01"
                    value={price}
                    onChange={(e) => setPrice(e.target.value)}
                    required
                    className="w-full rounded-lg border border-white/30 bg-gradient-to-br from-white/30 to-slate-100/30 px-3 py-2 text-slate-900 shadow-lg shadow-black/5 backdrop-blur-xl focus:border-blue-500/50 focus:outline-none focus:ring-2 focus:ring-blue-500/20 dark:border-slate-700/40 dark:from-slate-900/40 dark:to-slate-800/40 dark:text-slate-100"
                  />
                </div>
                <div className="flex-1">
                  <label className="mb-1 block text-xs font-medium text-slate-500 dark:text-slate-400">Stock</label>
                  <input
                    type="number"
                    value={stock}
                    onChange={(e) => setStock(e.target.value)}
                    required
                    className="w-full rounded-lg border border-white/30 bg-gradient-to-br from-white/30 to-slate-100/30 px-3 py-2 text-slate-900 shadow-lg shadow-black/5 backdrop-blur-xl focus:border-blue-500/50 focus:outline-none focus:ring-2 focus:ring-blue-500/20 dark:border-slate-700/40 dark:from-slate-900/40 dark:to-slate-800/40 dark:text-slate-100"
                  />
                </div>
              </div>
            </div>
          </div>

          <div>
            <label className="mb-1 block text-xs font-medium text-slate-500 dark:text-slate-400">URL de imagen</label>
            <input
              type="text"
              value={image}
              onChange={(e) => setImage(e.target.value)}
              placeholder="https://..."
              className="w-full rounded-lg border border-white/30 bg-gradient-to-br from-white/30 to-slate-100/30 px-3 py-2 text-slate-900 placeholder-slate-400 shadow-lg shadow-black/5 backdrop-blur-xl focus:border-blue-500/50 focus:outline-none focus:ring-2 focus:ring-blue-500/20 dark:border-slate-700/40 dark:from-slate-900/40 dark:to-slate-800/40 dark:text-slate-100 dark:placeholder-slate-500"
            />
          </div>

          <div>
            <label className="mb-1 block text-xs font-medium text-slate-500 dark:text-slate-400">Descripción</label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={3}
              className="w-full rounded-lg border border-white/30 bg-gradient-to-br from-white/30 to-slate-100/30 px-3 py-2 text-slate-900 placeholder-slate-400 shadow-lg shadow-black/5 backdrop-blur-xl focus:border-blue-500/50 focus:outline-none focus:ring-2 focus:ring-blue-500/20 dark:border-slate-700/40 dark:from-slate-900/40 dark:to-slate-800/40 dark:text-slate-100 dark:placeholder-slate-500"
            />
          </div>

          <div className="flex items-center justify-between border-t border-white/20 pt-3 dark:border-slate-700/30">
            <div className="flex items-center gap-3">
              <button
                type="button"
                disabled={toggling}
                onClick={handleToggle}
                className={`rounded-lg border px-3 py-2 text-sm shadow-lg shadow-black/5 backdrop-blur-xl transition-colors disabled:opacity-50 ${
                  product.isActive
                    ? "border-white/30 bg-gradient-to-br from-white/30 to-slate-100/30 text-slate-600 hover:bg-white/40 dark:border-slate-700/40 dark:from-slate-900/40 dark:to-slate-800/40 dark:text-slate-400"
                    : "border-emerald-300/50 bg-emerald-50/50 text-emerald-700 hover:bg-emerald-100/50 dark:border-emerald-800/40 dark:bg-emerald-900/20 dark:text-emerald-400"
                }`}
              >
                {toggling ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : product.isActive ? (
                  "Desactivar"
                ) : (
                  "Activar"
                )}
              </button>
              <button
                type="button"
                onClick={() => setDeleteOpen(true)}
                disabled={deleting}
                className="rounded-lg border border-red-300/50 px-3 py-2 text-sm text-red-600 shadow-lg shadow-black/5 backdrop-blur-xl transition-colors hover:bg-red-50/50 disabled:opacity-50 dark:border-red-800/40 dark:text-red-400 dark:hover:bg-red-900/20"
              >
                Eliminar
              </button>
            </div>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={onClose}
                disabled={saving}
                className="rounded-lg border border-white/30 bg-gradient-to-br from-white/30 to-slate-100/30 px-4 py-2 text-sm text-slate-600 shadow-lg shadow-black/5 backdrop-blur-xl transition-colors hover:bg-white/40 disabled:opacity-50 dark:border-slate-700/40 dark:from-slate-900/40 dark:to-slate-800/40 dark:text-slate-400 dark:hover:bg-white/10"
              >
                Cancelar
              </button>
              <button
                type="submit"
                disabled={saving}
                className="flex items-center gap-1.5 rounded-lg bg-blue-600 px-4 py-2 text-sm text-white shadow-lg shadow-black/5 transition-colors hover:bg-blue-700 disabled:opacity-50"
              >
                {saving && <Loader2 className="h-4 w-4 animate-spin" />}
                {saving ? "Guardando..." : "Guardar"}
              </button>
            </div>
          </div>
        </form>
      </Modal>

      <ConfirmDialog
        isOpen={deleteOpen}
        onClose={() => setDeleteOpen(false)}
        onConfirm={handleDelete}
        title="Eliminar producto"
        message={`¿Estás seguro de eliminar "${product.name}"? Esta acción no se puede deshacer.`}
        confirmLabel="Sí, eliminar"
        loading={deleting}
      />
    </>
  )
}
