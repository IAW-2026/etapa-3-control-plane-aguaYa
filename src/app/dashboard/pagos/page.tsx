'use client'

import { Suspense, useState, useEffect, useCallback } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import { getPayments } from '@/lib/actions/payments'
import type { Payment, PaymentListResponse } from '@/lib/api-payment'
import { Search, ChevronLeft, ChevronRight } from 'lucide-react'
import PaymentDetailModal from '@/components/payments/PaymentDetailModal'

const STATUS_STYLES: Record<string, { label: string; className: string }> = {
  pending:   { label: 'Pendiente', className: 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400' },
  approved:  { label: 'Aprobado',  className: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400' },
  rejected:  { label: 'Rechazado', className: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400' },
  cancelled: { label: 'Cancelado', className: 'bg-slate-100 text-slate-600 dark:bg-slate-700 dark:text-slate-400' },
  expired:   { label: 'Expirado',  className: 'bg-slate-100 text-slate-600 dark:bg-slate-700 dark:text-slate-400' },
}

const STATUS_TABS = [
  { value: '', label: 'Todos' },
  { value: 'pending', label: 'Pendientes' },
  { value: 'approved', label: 'Aprobados' },
  { value: 'rejected', label: 'Rechazados' },
  { value: 'cancelled', label: 'Cancelados' },
]

function PagosPageContent() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const q = searchParams.get('q') ?? ''
  const status = searchParams.get('status') ?? ''
  const currentPage = parseInt(searchParams.get('page') ?? '1', 10)

  const [data, setData] = useState<PaymentListResponse | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [selected, setSelected] = useState<Payment | null>(null)

  const fetchData = useCallback(async () => {
    setError(null)
    try {
      const result = await getPayments({ page: currentPage, q: q || undefined, status: status || undefined })
      setData(result)
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Error al cargar pagos')
    }
  }, [currentPage, q, status])

  useEffect(() => { fetchData() }, [fetchData])

  function tabUrl(value: string) {
    const params = new URLSearchParams()
    if (value) params.set('status', value)
    if (q) params.set('q', q)
    const qs = params.toString()
    return `/dashboard/pagos${qs ? `?${qs}` : ''}`
  }

  function pageUrl(page: number) {
    const params = new URLSearchParams()
    params.set('page', String(page))
    if (q) params.set('q', q)
    if (status) params.set('status', status)
    return `/dashboard/pagos?${params.toString()}`
  }

  function handleStatusChange(id: string, newStatus: string) {
    setData((prev) =>
      prev ? { ...prev, items: prev.items.map((p) => p.id === id ? { ...p, status: newStatus as Payment['status'] } : p) } : prev
    )
    setSelected((prev) => prev?.id === id ? { ...prev, status: newStatus as Payment['status'] } : prev)
  }

  return (
    <div>
      <div className="mb-8 flex items-center justify-between">
        <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-100">Pagos</h1>
      </div>

      {/* Tabs por estado */}
      <div className="mb-4 flex items-center gap-2 flex-wrap">
        {STATUS_TABS.map((tab) => (
          <a
            key={tab.value}
            href={tabUrl(tab.value)}
            className={`rounded-lg px-4 py-2 text-sm font-medium transition-colors ${
              status === tab.value
                ? 'bg-blue-600 text-white'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200 dark:bg-slate-700 dark:text-slate-300 dark:hover:bg-slate-600'
            }`}
          >
            {tab.label}
          </a>
        ))}
      </div>

      {/* Búsqueda */}
      <div className="mb-6">
        <form method="GET" action="/dashboard/pagos" className="relative max-w-md">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
          <input
            name="q"
            defaultValue={q}
            placeholder="Buscar por comprador, vendedor u orden..."
            className="w-full rounded-lg border border-slate-300 bg-white py-2.5 pl-10 pr-4 text-sm text-slate-900 placeholder-slate-400 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 dark:border-slate-600 dark:bg-slate-800 dark:text-slate-100 dark:placeholder-slate-500"
          />
          {status && <input type="hidden" name="status" value={status} />}
        </form>
      </div>

      {error && (
        <div className="mb-6 rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-700 dark:border-red-800 dark:bg-red-900/20 dark:text-red-400">
          {error}
        </div>
      )}

      {/* Tabla */}
      <div className="rounded-xl border border-slate-200 bg-white shadow-sm dark:border-slate-700 dark:bg-slate-800">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-slate-200 text-left dark:border-slate-700">
                <th className="px-6 py-4 font-medium text-slate-500 dark:text-slate-400">Orden</th>
                <th className="px-6 py-4 font-medium text-slate-500 dark:text-slate-400">Comprador</th>
                <th className="px-6 py-4 font-medium text-slate-500 dark:text-slate-400">Vendedor</th>
                <th className="px-6 py-4 font-medium text-slate-500 dark:text-slate-400">Monto</th>
                <th className="px-6 py-4 font-medium text-slate-500 dark:text-slate-400">Estado</th>
                <th className="px-6 py-4 font-medium text-slate-500 dark:text-slate-400">Fecha</th>
              </tr>
            </thead>
            <tbody>
              {(!data || data.items.length === 0) && !error && (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center text-slate-400">
                    No hay pagos registrados
                  </td>
                </tr>
              )}
              {data?.items.map((payment) => {
                const style = STATUS_STYLES[payment.status] ?? { label: payment.status, className: 'bg-slate-100 text-slate-600' }
                return (
                  <tr
                    key={payment.id}
                    onClick={() => setSelected(payment)}
                    className="cursor-pointer border-b border-slate-100 hover:bg-slate-50 dark:border-slate-700 dark:hover:bg-slate-700/50"
                  >
                    <td className="px-6 py-4 font-mono text-xs text-slate-500 dark:text-slate-400">
                      #{payment.orderId}
                    </td>
                    <td className="px-6 py-4 text-slate-900 dark:text-slate-100">{payment.buyerName}</td>
                    <td className="px-6 py-4 text-slate-500 dark:text-slate-400">{payment.sellerName}</td>
                    <td className="px-6 py-4 font-medium text-slate-900 dark:text-slate-100">
                      ${payment.amount.toLocaleString('es-AR')}
                    </td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-medium ${style.className}`}>
                        {style.label}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-slate-500 dark:text-slate-400">
                      {new Date(payment.createdAt).toLocaleDateString('es-AR')}{' '}
                      {new Date(payment.createdAt).toLocaleTimeString('es-AR', { hour: '2-digit', minute: '2-digit' })}
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Paginación */}
      {data && data.pageCount > 1 && (
        <div className="mt-6 flex items-center justify-center gap-2">
          {currentPage > 1 && (
            <a
              href={pageUrl(currentPage - 1)}
              className="flex items-center gap-1 rounded-lg border border-slate-300 px-3 py-2 text-sm text-slate-600 hover:bg-slate-50 dark:border-slate-600 dark:text-slate-400 dark:hover:bg-slate-700"
            >
              <ChevronLeft className="h-4 w-4" />
              Anterior
            </a>
          )}
          <span className="px-3 text-sm text-slate-500 dark:text-slate-400">
            Página {currentPage} de {data.pageCount}
          </span>
          {currentPage < data.pageCount && (
            <a
              href={pageUrl(currentPage + 1)}
              className="flex items-center gap-1 rounded-lg border border-slate-300 px-3 py-2 text-sm text-slate-600 hover:bg-slate-50 dark:border-slate-600 dark:text-slate-400 dark:hover:bg-slate-700"
            >
              Siguiente
              <ChevronRight className="h-4 w-4" />
            </a>
          )}
        </div>
      )}

      {selected && (
        <PaymentDetailModal
          payment={selected}
          open={!!selected}
          onClose={() => setSelected(null)}
          onStatusChange={handleStatusChange}
        />
      )}
    </div>
  )
}

export default function PagosPage() {
  return (
    <Suspense fallback={null}>
      <PagosPageContent />
    </Suspense>
  )
}
