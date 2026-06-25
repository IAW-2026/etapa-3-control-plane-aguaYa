"use client"

import { useState, useEffect } from "react"
import Modal from "@/components/ui/Modal"
import type { Buyer } from "@/lib/types"
import { createBuyerOrder } from "@/lib/actions/buyer"
import { getBuyers } from "@/lib/actions/buyer"
import { getVendorsSimple } from "@/lib/actions/vendor"
import { useToast } from "@/components/ui/ToastProvider"
import { Loader2, Plus, Trash2 } from "lucide-react"

type Props = {
  isOpen: boolean
  onClose: () => void
  onSuccess: () => void
}

type LineItem = {
  product_name: string
  product_price: number
  quantity: number
}

export default function CreateGlobalOrderModal({ isOpen, onClose, onSuccess }: Props) {
  const { showToast } = useToast()

  const [buyers, setBuyers] = useState<Buyer[]>([])
  const [vendors, setVendors] = useState<Array<{ id: string; name: string }>>([])
  const [buyerId, setBuyerId] = useState("")
  const [buyerUserId, setBuyerUserId] = useState("")
  const [vendorId, setVendorId] = useState("")
  const [total, setTotal] = useState("")
  const [items, setItems] = useState<LineItem[]>([])
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    if (!isOpen) return
    setBuyerId("")
    setBuyerUserId("")
    setVendorId("")
    setTotal("")
    setItems([])
    Promise.all([getBuyers(), getVendorsSimple()]).then(([b, v]) => {
      setBuyers(b)
      setVendors(v)
    }).catch(() => showToast("error", "Error al cargar datos"))
  }, [isOpen, showToast])

  function addItem() {
    setItems([...items, { product_name: "", product_price: 0, quantity: 1 }])
  }

  function updateItem(idx: number, field: keyof LineItem, value: string | number) {
    setItems(items.map((item, i) => i === idx ? { ...item, [field]: value } : item))
  }

  function removeItem(idx: number) {
    setItems(items.filter((_, i) => i !== idx))
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!buyerId || !vendorId || !total) return
    setSaving(true)
    try {
      const validItems = items.filter((i) => i.product_name && i.quantity > 0)
      await createBuyerOrder({
        vendor_id: vendorId,
        buyer_id: buyerId,
        buyer_user_id: buyerUserId,
        total: parseFloat(total),
        items: validItems.length > 0 ? validItems.map((i) => ({
          product_id: "",
          product_name: i.product_name,
          product_price: i.product_price,
          quantity: i.quantity,
        })) : undefined,
      })
      showToast("success", "Orden creada correctamente")
      onSuccess()
    } catch {
      showToast("error", "Error al crear orden")
    } finally {
      setSaving(false)
    }
  }

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Nueva Orden">
      <form onSubmit={handleSubmit} className="space-y-4 text-sm">
        <div>
          <label className="mb-1 block text-xs font-medium text-slate-500 dark:text-slate-400">
            Comprador <span className="text-red-500">*</span>
          </label>
          <select
            value={buyerId}
            onChange={(e) => {
              const b = buyers.find((b) => b.buyer_id === e.target.value)
              setBuyerId(e.target.value)
              setBuyerUserId(b?.user_id ?? "")
            }}
            required
            className="w-full rounded-lg border border-white/30 bg-gradient-to-br from-white/30 to-slate-100/30 px-3 py-2 text-slate-900 shadow-lg shadow-black/5 backdrop-blur-xl focus:border-blue-500/50 focus:outline-none focus:ring-2 focus:ring-blue-500/20 dark:border-slate-700/40 dark:from-slate-900/40 dark:to-slate-800/40 dark:text-slate-100"
          >
            <option value="">Seleccionar comprador</option>
            {buyers.map((b) => (
              <option key={b.buyer_id} value={b.buyer_id}>{b.name || b.mail}</option>
            ))}
          </select>
        </div>
        <div>
          <label className="mb-1 block text-xs font-medium text-slate-500 dark:text-slate-400">
            Vendedor <span className="text-red-500">*</span>
          </label>
          <select
            value={vendorId}
            onChange={(e) => setVendorId(e.target.value)}
            required
            className="w-full rounded-lg border border-white/30 bg-gradient-to-br from-white/30 to-slate-100/30 px-3 py-2 text-slate-900 shadow-lg shadow-black/5 backdrop-blur-xl focus:border-blue-500/50 focus:outline-none focus:ring-2 focus:ring-blue-500/20 dark:border-slate-700/40 dark:from-slate-900/40 dark:to-slate-800/40 dark:text-slate-100"
          >
            <option value="">Seleccionar vendedor</option>
            {vendors.map((v) => (
              <option key={v.id} value={v.id}>{v.name}</option>
            ))}
          </select>
        </div>
        <div>
          <label className="mb-1 block text-xs font-medium text-slate-500 dark:text-slate-400">
            Total <span className="text-red-500">*</span>
          </label>
          <input
            type="number"
            step="0.01"
            min="0"
            value={total}
            onChange={(e) => setTotal(e.target.value)}
            required
            placeholder="0.00"
            className="w-full rounded-lg border border-white/30 bg-gradient-to-br from-white/30 to-slate-100/30 px-3 py-2 text-slate-900 shadow-lg shadow-black/5 backdrop-blur-xl focus:border-blue-500/50 focus:outline-none focus:ring-2 focus:ring-blue-500/20 dark:border-slate-700/40 dark:from-slate-900/40 dark:to-slate-800/40 dark:text-slate-100"
          />
        </div>

        <div>
          <div className="mb-2 flex items-center justify-between">
            <p className="text-xs font-medium text-slate-500 dark:text-slate-400">Items</p>
            <button
              type="button"
              onClick={addItem}
              className="flex items-center gap-1 text-xs text-blue-600 hover:text-blue-700 dark:text-blue-400"
            >
              <Plus className="h-3 w-3" />
              Agregar item
            </button>
          </div>
          {items.length === 0 && (
            <p className="text-xs text-slate-400">Sin items detallados</p>
          )}
          {items.map((item, idx) => (
            <div key={idx} className="mb-2 flex items-start gap-2 rounded-lg border border-white/20 bg-white/30 p-2 dark:border-slate-700/30 dark:bg-slate-800/30">
              <div className="flex-1 space-y-1">
                <input
                  type="text"
                  value={item.product_name}
                  onChange={(e) => updateItem(idx, "product_name", e.target.value)}
                  placeholder="Nombre del producto"
                  className="w-full rounded border border-white/20 bg-transparent px-2 py-1 text-xs text-slate-900 placeholder-slate-400 focus:outline-none dark:text-slate-100"
                />
                <div className="flex gap-1">
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    value={item.product_price}
                    onChange={(e) => updateItem(idx, "product_price", parseFloat(e.target.value) || 0)}
                    placeholder="Precio"
                    className="w-20 rounded border border-white/20 bg-transparent px-2 py-1 text-xs text-slate-900 placeholder-slate-400 focus:outline-none dark:text-slate-100"
                  />
                  <input
                    type="number"
                    min="1"
                    value={item.quantity}
                    onChange={(e) => updateItem(idx, "quantity", parseInt(e.target.value) || 0)}
                    placeholder="Cant."
                    className="w-16 rounded border border-white/20 bg-transparent px-2 py-1 text-xs text-slate-900 placeholder-slate-400 focus:outline-none dark:text-slate-100"
                  />
                </div>
              </div>
              <button
                type="button"
                onClick={() => removeItem(idx)}
                className="mt-1 rounded p-1 text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20"
              >
                <Trash2 className="h-3.5 w-3.5" />
              </button>
            </div>
          ))}
        </div>

        <div className="flex justify-end gap-2 border-t border-white/20 pt-4 dark:border-slate-700/30">
          <button
            type="button"
            onClick={onClose}
            disabled={saving}
            className="rounded-lg border border-white/30 bg-gradient-to-br from-white/30 to-slate-100/30 px-4 py-2 text-sm text-slate-600 shadow-lg shadow-black/5 backdrop-blur-xl transition-colors hover:bg-white/40 disabled:opacity-50 dark:border-slate-700/40 dark:from-slate-900/40 dark:to-slate-800/40 dark:text-slate-400"
          >
            Cancelar
          </button>
          <button
            type="submit"
            disabled={saving || !buyerId || !vendorId || !total}
            className="flex items-center gap-1.5 rounded-lg bg-blue-600 px-5 py-2 text-sm text-white shadow-lg shadow-black/5 transition-colors hover:bg-blue-700 disabled:opacity-50"
          >
            {saving && <Loader2 className="h-4 w-4 animate-spin" />}
            {saving ? "Creando..." : "Crear Orden"}
          </button>
        </div>
      </form>
    </Modal>
  )
}
