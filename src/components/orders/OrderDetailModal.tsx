'use client'

import { useState } from 'react'
import Modal from '@/components/ui/Modal'
import { updateOrderStatus } from '@/lib/actions/orders'
import OrderStatusBadge from '@/components/orders/OrderStatusBadge'
import type { AppOrder, StatusDefinition } from '@/lib/adapters/types'
import { User, DollarSign, Calendar, Package, Hash, MapPin, ArrowLeftRight } from 'lucide-react'

type Props = {
  order: AppOrder
  open: boolean
  onClose: () => void
  onStatusChange: (orderId: string, newStatus: string) => void
  statuses: StatusDefinition[]
  validTransitions: StatusDefinition[]
}

export default function OrderDetailModal({ order, open, onClose, onStatusChange, statuses, validTransitions }: Props) {
  const [changing, setChanging] = useState(false)

  async function handleTransition(targetStatus: string) {
    setChanging(true)
    try {
      await updateOrderStatus(order.source, order.id, targetStatus)
      onStatusChange(order.id, targetStatus)
    } catch {
      // toast is handled at parent level
    } finally {
      setChanging(false)
    }
  }

  return (
    <Modal isOpen={open} onClose={onClose} title={order.externalId ? `Pedido #${order.externalId}` : `Pedido ${order.id.slice(0, 8)}`}>
      <div className="space-y-4">
        <div className="flex items-center justify-between rounded-lg bg-slate-50 p-3 dark:bg-slate-700/50">
          <div className="flex items-center gap-2 text-sm text-slate-500 dark:text-slate-400">
            <span>Estado</span>
            <span className="rounded bg-slate-200 px-1.5 py-0.5 text-xs text-slate-500 dark:bg-slate-600 dark:text-slate-400">{order.source}</span>
          </div>
          <div className="flex items-center gap-2">
            <OrderStatusBadge status={order.status} definitions={statuses} />
            {validTransitions.length > 0 && (
              <div className="flex gap-1">
                {validTransitions.map((t) => (
                  <button
                    key={t.value}
                    type="button"
                    onClick={() => handleTransition(t.value)}
                    disabled={changing}
                    className="flex items-center gap-1 rounded-lg border border-slate-300 px-2.5 py-1.5 text-xs text-slate-600 hover:bg-slate-100 disabled:opacity-50 dark:border-slate-600 dark:text-slate-400 dark:hover:bg-slate-700"
                  >
                    <ArrowLeftRight className="h-3.5 w-3.5" />
                    {changing ? 'Cambiando...' : t.label}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3 text-sm">
          <div className="flex items-center gap-2 text-slate-500">
            <User className="h-4 w-4 shrink-0" />
            <span>Comprador:</span>
          </div>
          <div className="text-slate-900 dark:text-slate-100">{order.buyerName || 'Anónimo'}</div>

          {order.externalId && (
            <>
              <div className="flex items-center gap-2 text-slate-500">
                <Hash className="h-4 w-4 shrink-0" />
                <span>ID externo:</span>
              </div>
              <div className="text-slate-900 dark:text-slate-100">#{order.externalId}</div>
            </>
          )}

          <div className="flex items-center gap-2 text-slate-500">
            <Package className="h-4 w-4 shrink-0" />
            <span>App origen:</span>
          </div>
          <div className="text-slate-900 dark:text-slate-100">{order.source}</div>

          {order.vendorName && (
            <>
              <div className="flex items-center gap-2 text-slate-500">
                <Package className="h-4 w-4 shrink-0" />
                <span>Vendedor:</span>
              </div>
              <div className="text-slate-900 dark:text-slate-100">{order.vendorName}</div>
            </>
          )}

          <div className="flex items-center gap-2 text-slate-500">
            <DollarSign className="h-4 w-4 shrink-0" />
            <span>Total:</span>
          </div>
          <div className="font-medium text-slate-900 dark:text-slate-100">${order.total.toFixed(2)}</div>

          <div className="flex items-center gap-2 text-slate-500">
            <Calendar className="h-4 w-4 shrink-0" />
            <span>Creado:</span>
          </div>
          <div className="text-slate-900 dark:text-slate-100">
            {new Date(order.createdAt).toLocaleDateString('es-AR')} {new Date(order.createdAt).toLocaleTimeString('es-AR', { hour: '2-digit', minute: '2-digit' })}
          </div>

          {order.address && (
            <>
              <div className="flex items-center gap-2 text-slate-500">
                <MapPin className="h-4 w-4 shrink-0" />
                <span>Dirección:</span>
              </div>
              <div className="text-slate-900 dark:text-slate-100">{order.address}</div>
            </>
          )}
        </div>

        <div>
          <h4 className="mb-2 text-sm font-medium text-slate-700 dark:text-slate-300">
            Productos ({order.items.length})
          </h4>
          <div className="divide-y divide-slate-100 rounded-lg border border-slate-200 dark:divide-slate-700 dark:border-slate-700">
            {order.items.map((item) => (
              <div key={item.id} className="flex items-center justify-between px-3 py-2 text-sm">
                <div className="flex items-center gap-2">
                  {item.image ? (
                    <img src={item.image} alt={item.productName} className="h-8 w-8 rounded object-cover" />
                  ) : (
                    <div className="flex h-8 w-8 items-center justify-center rounded bg-slate-100 text-xs text-slate-400 dark:bg-slate-700">
                      {item.productName.charAt(0)}
                    </div>
                  )}
                  <div>
                    <p className="text-slate-900 dark:text-slate-100">{item.productName}</p>
                    <p className="text-xs text-slate-400">${item.productPrice.toFixed(2)} x {item.quantity}</p>
                  </div>
                </div>
                <p className="font-medium text-slate-900 dark:text-slate-100">
                  ${(item.productPrice * item.quantity).toFixed(2)}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </Modal>
  )
}
