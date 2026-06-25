'use client'

import { Suspense, useState, useEffect, useCallback } from 'react'
import { useSearchParams } from 'next/navigation'
import { getInvoices } from '@/lib/actions/payments'
import type { InvoiceListResponse, InvoiceWithPayment } from '@/lib/api-payment'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import Link from 'next/link'
import InvoiceDetailModal from '@/components/payments/InvoiceDetailModal'

function formatARS(amount: number) {
  return `$${amount.toLocaleString('es-AR', { minimumFractionDigits: 2 })}`
}

function FacturasPageContent() {
  const searchParams = useSearchParams()
  const currentPage = parseInt(searchParams.get('page') ?? '1', 10)

  const [data, setData] = useState<InvoiceListResponse | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [selected, setSelected] = useState<InvoiceWithPayment | null>(null)

  const fetchData = useCallback(async () => {
    setError(null)
    try {
      const result = await getInvoices({ page: currentPage })
      setData(result)
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Error al cargar facturas')
    }
  }, [currentPage])

  useEffect(() => { fetchData() }, [fetchData])

  function pageUrl(page: number) {
    return `/dashboard/facturas?page=${page}`
  }

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-100">Facturas</h1>
      </div>

      {error && (
        <div className="mb-6 rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-700 dark:border-red-800 dark:bg-red-900/20 dark:text-red-400">
          {error}
        </div>
      )}

      <div className="rounded-xl border border-slate-200 bg-white shadow-sm dark:border-slate-700 dark:bg-slate-800">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-slate-200 text-left dark:border-slate-700">
                <th className="px-6 py-4 font-medium text-slate-500 dark:text-slate-400">ID</th>
                <th className="px-6 py-4 font-medium text-slate-500 dark:text-slate-400">Comprador</th>
                <th className="px-6 py-4 font-medium text-slate-500 dark:text-slate-400">Vendedor</th>
                <th className="px-6 py-4 font-medium text-slate-500 dark:text-slate-400">Total</th>
                <th className="px-6 py-4 font-medium text-slate-500 dark:text-slate-400">Emitida</th>
              </tr>
            </thead>
            <tbody>
              {(!data || data.items.length === 0) && !error && (
                <tr>
                  <td colSpan={5} className="px-6 py-12 text-center text-slate-400">
                    No hay facturas registradas
                  </td>
                </tr>
              )}
              {data?.items.map((inv) => (
                <tr
                  key={inv.id}
                  onClick={() => setSelected(inv)}
                  className="cursor-pointer border-b border-slate-100 hover:bg-slate-50 dark:border-slate-700 dark:hover:bg-slate-700/50"
                >
                  <td className="px-6 py-4 font-mono text-xs text-slate-400">{inv.id.slice(0, 8)}…</td>
                  <td className="px-6 py-4 text-slate-900 dark:text-slate-100">{inv.payment.buyerName}</td>
                  <td className="px-6 py-4 text-slate-500 dark:text-slate-400">{inv.payment.sellerName}</td>
                  <td className="px-6 py-4 font-medium text-slate-900 dark:text-slate-100">{formatARS(inv.total)}</td>
                  <td className="px-6 py-4 text-slate-500 dark:text-slate-400">
                    {new Date(inv.issuedAt).toLocaleDateString('es-AR')}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {data && data.pageCount > 1 && (
        <div className="mt-6 flex items-center justify-center gap-2">
          {currentPage > 1 && (
            <Link
              href={pageUrl(currentPage - 1)}
              className="flex items-center gap-1 rounded-lg border border-slate-300 px-3 py-2 text-sm text-slate-600 hover:bg-slate-50 dark:border-slate-600 dark:text-slate-400 dark:hover:bg-slate-700"
            >
              <ChevronLeft className="h-4 w-4" />
              Anterior
            </Link>
          )}
          <span className="px-3 text-sm text-slate-500 dark:text-slate-400">
            Página {currentPage} de {data.pageCount}
          </span>
          {currentPage < data.pageCount && (
            <Link
              href={pageUrl(currentPage + 1)}
              className="flex items-center gap-1 rounded-lg border border-slate-300 px-3 py-2 text-sm text-slate-600 hover:bg-slate-50 dark:border-slate-600 dark:text-slate-400 dark:hover:bg-slate-700"
            >
              Siguiente
              <ChevronRight className="h-4 w-4" />
            </Link>
          )}
        </div>
      )}

      {selected && (
        <InvoiceDetailModal
          invoice={selected}
          open={!!selected}
          onClose={() => setSelected(null)}
        />
      )}
    </div>
  )
}

export default function FacturasPage() {
  return (
    <Suspense fallback={null}>
      <FacturasPageContent />
    </Suspense>
  )
}
