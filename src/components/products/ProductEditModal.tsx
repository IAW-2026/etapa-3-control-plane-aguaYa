'use client'

import { useState } from 'react'
import Modal from '@/components/ui/Modal'
import { updateProduct, toggleProduct, deleteProduct } from '@/lib/actions/vendor'
import type { ProductItem } from '@/lib/types'
import { Loader2, ArrowLeftRight, Trash2, ImageOff } from 'lucide-react'

type Props = {
  product: ProductItem
  open: boolean
  onClose: () => void
  onUpdate: (updated: ProductItem) => void
  onDelete?: (id: string) => void
}

export default function ProductEditModal({ product, open, onClose, onUpdate, onDelete }: Props) {
  const [form, setForm] = useState({ name: product.name, price: String(product.price), stock: String(product.stock), description: product.description ?? '', image: product.image ?? '' })
  const [saving, setSaving] = useState(false)
  const [toggling, setToggling] = useState(false)
  const [deleting, setDeleting] = useState(false)

  async function handleSave(e: React.FormEvent) {
    e.preventDefault()
    setSaving(true)
    try {
      const price = parseFloat(form.price)
      const stock = parseInt(form.stock, 10)
      if (!form.name.trim()) return
      if (isNaN(price) || price <= 0) return
      if (isNaN(stock) || stock < 0) return
      const res = await updateProduct(product.id, { name: form.name.trim(), price, stock, description: form.description.trim() || undefined, image: form.image.trim() || undefined })
      onUpdate(res.product)
      onClose()
    } catch {
      // error handled by toast from parent
    } finally {
      setSaving(false)
    }
  }

  async function handleToggle() {
    setToggling(true)
    try {
      const res = await toggleProduct(product.id)
      onUpdate(res.product)
    } catch {
      // error handled by toast from parent
    } finally {
      setToggling(false)
    }
  }

  async function handleDelete() {
    if (!onDelete) return
    if (!window.confirm(`¿Eliminar "${product.name}"? Esta acción no se puede deshacer.`)) return
    setDeleting(true)
    try {
      await deleteProduct(product.id)
      onDelete(product.id)
      onClose()
    } catch {
      // error handled by toast from parent
    } finally {
      setDeleting(false)
    }
  }

  function set(field: string, value: string) {
    setForm((prev) => ({ ...prev, [field]: value }))
  }

  return (
    <Modal isOpen={open} onClose={onClose} title={`Editar ${product.name}`}>
      <form onSubmit={handleSave} className="space-y-4">
        <div className="flex items-center gap-3">
          {form.image ? (
            <img src={form.image} alt="" className="h-14 w-14 rounded-lg object-cover" />
          ) : (
            <div className="flex h-14 w-14 items-center justify-center rounded-lg bg-slate-100 text-slate-400 dark:bg-slate-700">
              <ImageOff className="h-5 w-5" />
            </div>
          )}
          <div className="flex-1">
            <label className="mb-1 block text-xs text-slate-500 dark:text-slate-400">URL de imagen</label>
            <input type="text" value={form.image} onChange={(e) => set('image', e.target.value)} placeholder="https://..." className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 placeholder-slate-400 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 dark:border-slate-600 dark:bg-slate-700 dark:text-slate-100 dark:placeholder-slate-500" />
          </div>
        </div>

        <div>
          <label className="mb-1 block text-sm font-medium text-slate-700 dark:text-slate-300">Nombre <span className="text-red-500">*</span></label>
          <input type="text" value={form.name} onChange={(e) => set('name', e.target.value)} required className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 dark:border-slate-600 dark:bg-slate-700 dark:text-slate-100" />
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="mb-1 block text-sm font-medium text-slate-700 dark:text-slate-300">Precio <span className="text-red-500">*</span></label>
            <input type="number" step="0.01" min="0.01" value={form.price} onChange={(e) => set('price', e.target.value)} required className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 dark:border-slate-600 dark:bg-slate-700 dark:text-slate-100" />
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium text-slate-700 dark:text-slate-300">Stock</label>
            <input type="number" min="0" value={form.stock} onChange={(e) => set('stock', e.target.value)} className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 dark:border-slate-600 dark:bg-slate-700 dark:text-slate-100" />
          </div>
        </div>

        <div>
          <label className="mb-1 block text-sm font-medium text-slate-700 dark:text-slate-300">Descripción</label>
          <textarea rows={2} value={form.description} onChange={(e) => set('description', e.target.value)} className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 placeholder-slate-400 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 dark:border-slate-600 dark:bg-slate-700 dark:text-slate-100 dark:placeholder-slate-500" />
        </div>

        <div className="flex items-center justify-between border-t border-slate-200 pt-4 dark:border-slate-700">
          <div className="flex items-center gap-2">
            <button type="button" onClick={handleToggle} disabled={toggling} className="flex items-center gap-1.5 rounded-lg border border-slate-300 px-3 py-2 text-sm text-slate-600 hover:bg-slate-50 disabled:opacity-50 dark:border-slate-600 dark:text-slate-400 dark:hover:bg-slate-700">
              <ArrowLeftRight className="h-4 w-4" />
              {toggling ? 'Cambiando...' : product.isActive ? 'Desactivar' : 'Activar'}
            </button>
            {onDelete && (
              <button type="button" onClick={handleDelete} disabled={deleting} className="flex items-center gap-1.5 rounded-lg border border-red-300 px-3 py-2 text-sm text-red-600 hover:bg-red-50 disabled:opacity-50 dark:border-red-800 dark:text-red-400 dark:hover:bg-red-900/20">
                <Trash2 className="h-4 w-4" />
                {deleting ? 'Eliminando...' : 'Eliminar'}
              </button>
            )}
          </div>
          <div className="flex items-center gap-2">
            <button type="button" onClick={onClose} disabled={saving} className="rounded-lg border border-slate-300 px-4 py-2 text-sm text-slate-600 hover:bg-slate-50 disabled:opacity-50 dark:border-slate-600 dark:text-slate-400 dark:hover:bg-slate-700">Cancelar</button>
            <button type="submit" disabled={saving} className="flex items-center gap-1.5 rounded-lg bg-blue-600 px-4 py-2 text-sm text-white hover:bg-blue-700 disabled:opacity-50">
              {saving && <Loader2 className="h-4 w-4 animate-spin" />}
              {saving ? 'Guardando...' : 'Guardar cambios'}
            </button>
          </div>
        </div>
      </form>
    </Modal>
  )
}
