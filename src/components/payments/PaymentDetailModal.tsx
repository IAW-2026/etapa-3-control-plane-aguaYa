'use client'

import { useState } from 'react'
import Modal from '@/components/ui/Modal'
import { cancelPayment, getPayment } from '@/lib/actions/payments'
import type { Payment } from '@/lib/api-payment'
import { User, DollarSign, Calendar, MapPin, Hash, CreditCard, FileText, X } from 'lucide-react'
import { useToast } from '@/components/ui/ToastProvider'

const STATUS_STYLES: Record<string, { label: string; className: string }> = {
  pending:   { label: 'Pendiente', className: 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400' },
  approved:  { label: 'Aprobado',  className: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400' },
  rejected:  { label: 'Rechazado', className: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400' },
  cancelled: { label: 'Cancelado', className: 'bg-slate-100 text-slate-600 dark:bg-slate-700 dark:text-slate-400' },
  expired:   { label: 'Expirado',  className: 'bg-slate-100 text-slate-600 dark:bg-slate-700 dark:text-slate-400' },
}

type Props = {
  payment: Payment
  open: boolean
  onClose: () => void
  onStatusChange: (id: string, newStatus: string) => void
}

export default function PaymentDetailModal({ payment, open, onClose, onStatusChange }: Props) {
  const [detail, setDetail] = useState<Payment>(payment)
  const [cancelling, setCancelling] = useState(false)
  const { showToast } = useToast()

  const statusStyle = STATUS_STYLES[detail.status] ?? { label: detail.status, className: 'bg-slate-100 text-slate-600' }

  async function handleCancel() {
    setCancelling(true)
    try {
      await cancelPayment(detail.id)
      const updated = await getPayment(detail.id)
      setDetail(updated)
      onStatusChange(detail.id, 'cancelled')
      showToast('success', 'Pago cancelado correctamente')
    } catch {
      showToast('error', 'No se pudo cancelar el pago')
    } finally {
      setCancelling(false)
    }
  }

  return (
    <Modal isOpen={open} onClose={onClose} title={`Pago #${detail.orderId}`}>
      <div className="space-y-4 max-h-[70vh] overflow-y-auto pr-1">

        {/* Estado */}
        <div className="flex items-center justify-between rounded-lg bg-slate-50 p-3 dark:bg-slate-700/50">
          <span className="text-sm text-slate-500 dark:text-slate-400">Estado</span>
          <div className="flex items-center gap-2">
            <span className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-medium ${statusStyle.className}`}>
              {statusStyle.label}
            </span>
            {detail.status === 'pending' && (
              <button
                type="button"
                onClick={handleCancel}
                disabled={cancelling}
                className="flex items-center gap-1 rounded-lg border border-red-300 px-2.5 py-1 text-xs text-red-600 hover:bg-red-50 disabled:opacity-50 dark:border-red-700 dark:text-red-400 dark:hover:bg-red-900/20"
              >
                <X className="h-3 w-3" />
                {cancelling ? 'Cancelando...' : 'Cancelar'}
              </button>
            )}
          </div>
        </div>

        {/* Datos principales */}
        <div className="grid grid-cols-2 gap-3 text-sm">
          <div className="flex items-center gap-2 text-slate-500"><User className="h-4 w-4 shrink-0" /><span>Comprador:</span></div>
          <div className="text-slate-900 dark:text-slate-100">{detail.buyerName}</div>

          <div className="flex items-center gap-2 text-slate-500"><User className="h-4 w-4 shrink-0" /><span>Email:</span></div>
          <div className="text-slate-900 dark:text-slate-100">{detail.buyerEmail}</div>

          <div className="flex items-center gap-2 text-slate-500"><User className="h-4 w-4 shrink-0" /><span>Vendedor:</span></div>
          <div className="text-slate-900 dark:text-slate-100">{detail.sellerName}</div>

          {detail.buyerAddress && (
            <>
              <div className="flex items-center gap-2 text-slate-500"><MapPin className="h-4 w-4 shrink-0" /><span>Dirección:</span></div>
              <div className="text-slate-900 dark:text-slate-100">{detail.buyerAddress}</div>
            </>
          )}

          <div className="flex items-center gap-2 text-slate-500"><DollarSign className="h-4 w-4 shrink-0" /><span>Monto:</span></div>
          <div className="font-medium text-slate-900 dark:text-slate-100">${detail.amount.toLocaleString('es-AR')}</div>

          <div className="flex items-center gap-2 text-slate-500"><Calendar className="h-4 w-4 shrink-0" /><span>Creado:</span></div>
          <div className="text-slate-900 dark:text-slate-100">
            {new Date(detail.createdAt).toLocaleDateString('es-AR')}{' '}
            {new Date(detail.createdAt).toLocaleTimeString('es-AR', { hour: '2-digit', minute: '2-digit' })}
          </div>

          {detail.mpPaymentId && (
            <>
              <div className="flex items-center gap-2 text-slate-500"><Hash className="h-4 w-4 shrink-0" /><span>MP ID:</span></div>
              <div className="font-mono text-xs text-slate-900 dark:text-slate-100">{detail.mpPaymentId}</div>
            </>
          )}

          {detail.mpPaymentMethod && (
            <>
              <div className="flex items-center gap-2 text-slate-500"><CreditCard className="h-4 w-4 shrink-0" /><span>Método:</span></div>
              <div className="text-slate-900 dark:text-slate-100">{detail.mpPaymentMethod}</div>
            </>
          )}
        </div>

        {/* Items */}
        <div>
          <h4 className="mb-2 text-sm font-medium text-slate-700 dark:text-slate-300">
            Productos ({detail.items.length})
          </h4>
          <div className="divide-y divide-slate-100 rounded-lg border border-slate-200 dark:divide-slate-700 dark:border-slate-700">
            {detail.items.map((item) => (
              <div key={item.id} className="flex items-center justify-between px-3 py-2 text-sm">
                <div className="flex items-center gap-2">
                  {item.productImageUrl ? (
                    <img src={item.productImageUrl} alt={item.productName} className="h-8 w-8 rounded object-cover" />
                  ) : (
                    <div className="flex h-8 w-8 items-center justify-center rounded bg-slate-100 text-xs text-slate-400 dark:bg-slate-700">
                      {item.productName.charAt(0)}
                    </div>
                  )}
                  <div>
                    <p className="text-slate-900 dark:text-slate-100">{item.productName}</p>
                    <p className="text-xs text-slate-400">${item.unitPrice.toLocaleString('es-AR')} x {item.quantity}</p>
                  </div>
                </div>
                <p className="font-medium text-slate-900 dark:text-slate-100">
                  ${item.subtotal.toLocaleString('es-AR')}
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* Factura */}
        {detail.invoice && (
          <div>
            <h4 className="mb-2 flex items-center gap-2 text-sm font-medium text-slate-700 dark:text-slate-300">
              <FileText className="h-4 w-4" />
              Factura
            </h4>
            <div className="rounded-lg border border-slate-200 p-3 dark:border-slate-700 space-y-1 text-sm">
              <div className="flex justify-between text-slate-500 dark:text-slate-400">
                <span>Subtotal</span>
                <span>${detail.invoice.subtotal.toLocaleString('es-AR')}</span>
              </div>
              <div className="flex justify-between text-slate-500 dark:text-slate-400">
                <span>Impuestos</span>
                <span>${detail.invoice.tax.toLocaleString('es-AR')}</span>
              </div>
              <div className="flex justify-between border-t border-slate-200 pt-1 font-medium text-slate-900 dark:border-slate-700 dark:text-slate-100">
                <span>Total</span>
                <span>${detail.invoice.total.toLocaleString('es-AR')}</span>
              </div>
              <p className="text-xs text-slate-400 pt-1">
                Emitida: {new Date(detail.invoice.issuedAt).toLocaleDateString('es-AR')}
              </p>
            </div>
          </div>
        )}
      </div>
    </Modal>
  )
}
