"use client"

import Modal from "@/components/ui/Modal"
import { useState } from "react"
import { updateOrderStatus } from "@/lib/actions/vendor"
import { useToast } from "@/components/ui/ToastProvider"
import type { OrderItem } from "@/lib/types"

type Props = {
  order: OrderItem
  vendorName: string
  isOpen: boolean
  onClose: () => void
  onStatusChange: () => void
}

export default function OrderDetailModal({ order, vendorName, isOpen, onClose, onStatusChange }: Props) {
  const { showToast } = useToast()
  const [toggling, setToggling] = useState(false)

  async function handleToggle() {
    const nextStatus = order.status === "PAID" ? "READY" : "PAID"
    setToggling(true)
    try {
      await updateOrderStatus(order.id, nextStatus)
      showToast("success", "Estado actualizado a " + (nextStatus === "PAID" ? "Pagada" : "Lista"))
      onStatusChange()
    } catch {
      showToast("error", "Error al actualizar estado")
    } finally {
      setToggling(false)
    }
  }

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={`Pedido #${order.id.slice(0, 8)}`}>
      <div className="space-y-4 text-sm">
        <div className="grid grid-cols-2 gap-3">
          <div className="rounded-lg border border-white/30 bg-gradient-to-br from-white/30 to-slate-100/30 p-3 shadow-lg shadow-black/5 backdrop-blur-xl dark:border-slate-700/40 dark:from-slate-900/40 dark:to-slate-800/40">
            <span className="text-xs text-slate-500 dark:text-slate-400">Comprador</span>
            <p className="font-medium text-slate-900 dark:text-slate-100">{order.buyerName}</p>
          </div>
          <div className="rounded-lg border border-white/30 bg-gradient-to-br from-white/30 to-slate-100/30 p-3 shadow-lg shadow-black/5 backdrop-blur-xl dark:border-slate-700/40 dark:from-slate-900/40 dark:to-slate-800/40">
            <span className="text-xs text-slate-500 dark:text-slate-400">Vendedor</span>
            <p className="font-medium text-slate-900 dark:text-slate-100">{vendorName}</p>
          </div>
          <div className="rounded-lg border border-white/30 bg-gradient-to-br from-white/30 to-slate-100/30 p-3 shadow-lg shadow-black/5 backdrop-blur-xl dark:border-slate-700/40 dark:from-slate-900/40 dark:to-slate-800/40">
            <span className="text-xs text-slate-500 dark:text-slate-400">Total</span>
            <p className="font-medium text-slate-900 dark:text-slate-100">${Number(order.total).toLocaleString("es-AR")}</p>
          </div>
          <div className="rounded-lg border border-white/30 bg-gradient-to-br from-white/30 to-slate-100/30 p-3 shadow-lg shadow-black/5 backdrop-blur-xl dark:border-slate-700/40 dark:from-slate-900/40 dark:to-slate-800/40">
            <span className="text-xs text-slate-500 dark:text-slate-400">Estado</span>
            <div className="flex items-center gap-2">
              <span
                className={`inline-flex rounded-full px-2 py-0.5 text-xs font-medium ${
                  order.status === "PAID"
                    ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400"
                    : order.status === "READY"
                      ? "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400"
                      : "bg-slate-200 text-slate-600 dark:bg-slate-700 dark:text-slate-300"
                }`}
              >
                {order.status === "PAID" ? "Pagada" : order.status === "READY" ? "Lista" : order.status}
              </span>
              <button
                type="button"
                disabled={toggling}
                onClick={handleToggle}
                className="ml-2 rounded-lg border border-white/30 bg-gradient-to-br from-white/30 to-slate-100/30 px-2.5 py-1 text-xs text-slate-600 shadow-lg shadow-black/5 backdrop-blur-xl transition-colors hover:bg-white/40 disabled:opacity-50 dark:border-slate-700/40 dark:from-slate-900/40 dark:to-slate-800/40 dark:text-slate-400"
              >
                {toggling ? "..." : order.status === "PAID" ? "Marcar como Lista" : "Marcar como Pagada"}
              </button>
            </div>
          </div>
        </div>

        {order.address && (
          <div className="rounded-lg border border-white/30 bg-gradient-to-br from-white/30 to-slate-100/30 p-3 shadow-lg shadow-black/5 backdrop-blur-xl dark:border-slate-700/40 dark:from-slate-900/40 dark:to-slate-800/40">
            <span className="text-xs text-slate-500 dark:text-slate-400">Dirección</span>
            <p className="font-medium text-slate-900 dark:text-slate-100">{order.address}</p>
          </div>
        )}

        {order.createdAt && (
          <div className="rounded-lg border border-white/30 bg-gradient-to-br from-white/30 to-slate-100/30 p-3 shadow-lg shadow-black/5 backdrop-blur-xl dark:border-slate-700/40 dark:from-slate-900/40 dark:to-slate-800/40">
            <span className="text-xs text-slate-500 dark:text-slate-400">Fecha</span>
            <p className="font-medium text-slate-900 dark:text-slate-100">
              {new Date(order.createdAt).toLocaleString("es-AR", {
                year: "numeric",
                month: "long",
                day: "numeric",
                hour: "2-digit",
                minute: "2-digit",
              })}
            </p>
          </div>
        )}

        {order.items && order.items.length > 0 && (
          <div>
            <h4 className="mb-2 text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
              Items
            </h4>
            <div className="space-y-2">
              {order.items.map((item, i) => (
                <div
                  key={i}
                  className="flex items-center justify-between rounded-lg border border-white/30 bg-gradient-to-br from-white/30 to-slate-100/30 p-3 shadow-lg shadow-black/5 backdrop-blur-xl dark:border-slate-700/40 dark:from-slate-900/40 dark:to-slate-800/40"
                >
                  <div>
                    <p className="font-medium text-slate-900 dark:text-slate-100">{item.productName}</p>
                    <p className="text-xs text-slate-500 dark:text-slate-400">
                      Cant: {item.quantity} x ${Number(item.productPrice).toLocaleString("es-AR")}
                    </p>
                  </div>
                  <p className="font-medium text-slate-900 dark:text-slate-100">
                    ${(Number(item.productPrice) * item.quantity).toLocaleString("es-AR")}
                  </p>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </Modal>
  )
}
