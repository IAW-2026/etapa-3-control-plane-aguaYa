'use client'

import Modal from '@/components/ui/Modal'
import type { InvoiceWithPayment } from '@/lib/api-payment'
import { FileText, User, Hash, Calendar, DollarSign, Printer } from 'lucide-react'

const PAYMENT_STATUS_STYLES: Record<string, { label: string; className: string }> = {
  pending:   { label: 'Pendiente', className: 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400' },
  approved:  { label: 'Aprobado',  className: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400' },
  rejected:  { label: 'Rechazado', className: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400' },
  cancelled: { label: 'Cancelado', className: 'bg-slate-100 text-slate-600 dark:bg-slate-700 dark:text-slate-400' },
  expired:   { label: 'Expirado',  className: 'bg-slate-100 text-slate-600 dark:bg-slate-700 dark:text-slate-400' },
}

function formatARS(amount: number) {
  return `$${amount.toLocaleString('es-AR', { minimumFractionDigits: 2 })}`
}

type Props = {
  invoice: InvoiceWithPayment
  open: boolean
  onClose: () => void
}

export default function InvoiceDetailModal({ invoice, open, onClose }: Props) {
  const paymentStyle = PAYMENT_STATUS_STYLES[invoice.payment.status] ?? { label: invoice.payment.status, className: 'bg-slate-100 text-slate-600' }

  return (
    <Modal isOpen={open} onClose={onClose} title={`Factura ${invoice.id.slice(0, 8)}…`}>
      <div className="space-y-4">

        {/* Datos del pago asociado */}
        <div>
          <h4 className="mb-2 flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-slate-400">
            <FileText className="h-3.5 w-3.5" />
            Pago asociado
          </h4>
          <div className="rounded-lg border border-slate-200 p-3 dark:border-slate-700 space-y-2 text-sm">
            <div className="grid grid-cols-2 gap-2">
              <div className="flex items-center gap-2 text-slate-500"><Hash className="h-4 w-4 shrink-0" /><span>Orden:</span></div>
              <div className="font-mono text-xs text-slate-700 dark:text-slate-300">{invoice.payment.orderId}</div>

              <div className="flex items-center gap-2 text-slate-500"><User className="h-4 w-4 shrink-0" /><span>Comprador:</span></div>
              <div className="text-slate-900 dark:text-slate-100">{invoice.payment.buyerName}</div>

              <div className="flex items-center gap-2 text-slate-500"><User className="h-4 w-4 shrink-0" /><span>Vendedor:</span></div>
              <div className="text-slate-900 dark:text-slate-100">{invoice.payment.sellerName}</div>

              <div className="flex items-center gap-2 text-slate-500"><DollarSign className="h-4 w-4 shrink-0" /><span>Estado:</span></div>
              <div>
                <span className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-medium ${paymentStyle.className}`}>
                  {paymentStyle.label}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Desglose factura */}
        <div>
          <h4 className="mb-2 flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-slate-400">
            <DollarSign className="h-3.5 w-3.5" />
            Detalle
          </h4>
          <div className="rounded-lg border border-slate-200 p-3 dark:border-slate-700 space-y-1 text-sm">
            <div className="flex justify-between text-slate-500 dark:text-slate-400">
              <span>Subtotal</span>
              <span>{formatARS(invoice.subtotal)}</span>
            </div>
            <div className="flex justify-between text-slate-500 dark:text-slate-400">
              <span>IVA (21%)</span>
              <span>{formatARS(invoice.tax)}</span>
            </div>
            <div className="flex justify-between border-t border-slate-200 pt-2 font-semibold text-slate-900 dark:border-slate-700 dark:text-slate-100">
              <span>Total</span>
              <span>{formatARS(invoice.total)}</span>
            </div>
          </div>
        </div>

        {/* Fecha */}
        <div className="flex items-center gap-2 text-sm text-slate-400">
          <Calendar className="h-4 w-4" />
          <span>Emitida el {new Date(invoice.issuedAt).toLocaleDateString('es-AR', {
            year: 'numeric', month: 'long', day: 'numeric',
            hour: '2-digit', minute: '2-digit',
          })}</span>
        </div>

        {/* Acciones */}
        <div className="flex justify-end border-t border-slate-200 pt-3 dark:border-slate-700">
          <a
            href={`/api/invoices/${invoice.id}/pdf`}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1.5 rounded-lg bg-blue-600 px-4 py-2 text-sm text-white shadow-lg shadow-black/5 transition-colors hover:bg-blue-700"
          >
            <Printer className="h-4 w-4" />
            Imprimir / Descargar PDF
          </a>
        </div>

      </div>
    </Modal>
  )
}
