import { getPaymentUsers } from '@/lib/actions/payments'
import type { PaymentUser, PaymentUserListResponse } from '@/lib/api-payment'
import { Search, ChevronLeft, ChevronRight } from 'lucide-react'
import Link from 'next/link'
import PaymentUserStatusButton from '@/components/payments/PaymentUserStatusButton'

export const dynamic = 'force-dynamic'

const STATUS_TABS = [
  { value: '', label: 'Todos' },
  { value: 'ACTIVE', label: 'Activos' },
  { value: 'SUSPENDED', label: 'Inactivos' },
]

const STATUS_STYLES: Record<string, { label: string; className: string }> = {
  ACTIVE:    { label: 'Activo',   className: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400' },
  SUSPENDED: { label: 'Inactivo', className: 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400' },
}

export default async function PaymentUsersPage({
  searchParams,
}: {
  searchParams: Promise<{ page?: string; q?: string; status?: string }>
}) {
  const { page: pageParam, q, status } = await searchParams
  const currentPage = parseInt(pageParam ?? '1', 10)
  const activeTab = status ?? ''

  let data: PaymentUserListResponse | null = null
  let error: string | null = null

  try {
    data = await getPaymentUsers({
      page: currentPage,
      ...(q ? { q } : {}),
      ...(status ? { status } : {}),
    })
    if (data && !status) {
      data = { ...data, items: data.items.filter((u) => u.status !== 'DELETED') }
    }
  } catch (e) {
    error = e instanceof Error ? e.message : 'Error al cargar usuarios'
  }

  function tabUrl(value: string) {
    const params = new URLSearchParams()
    if (value) params.set('status', value)
    if (q) params.set('q', q)
    const qs = params.toString()
    return `/dashboard/payment-users${qs ? `?${qs}` : ''}`
  }

  function pageUrl(page: number) {
    const params = new URLSearchParams()
    params.set('page', String(page))
    if (q) params.set('q', q)
    if (status) params.set('status', status)
    return `/dashboard/payment-users?${params.toString()}`
  }

  return (
    <div>
      <div className="mb-8 flex items-center justify-between">
        <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-100">Usuarios de Pago</h1>
      </div>

      {error && (
        <div className="mb-6 rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-700 dark:border-red-800 dark:bg-red-900/20 dark:text-red-400">
          {error}
        </div>
      )}

      <div className="mb-4 flex items-center gap-2 flex-wrap">
        {STATUS_TABS.map((tab) => (
          <Link
            key={tab.value}
            href={tabUrl(tab.value)}
            className={`rounded-lg px-4 py-2 text-sm font-medium transition-colors ${
              activeTab === tab.value
                ? 'bg-blue-600 text-white'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200 dark:bg-slate-700 dark:text-slate-300 dark:hover:bg-slate-600'
            }`}
          >
            {tab.label}
          </Link>
        ))}
      </div>

      <div className="mb-6">
        <form method="GET" action="/dashboard/payment-users" className="relative max-w-md">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
          <input
            name="q"
            defaultValue={q ?? ''}
            placeholder="Buscar por comprador o vendedor..."
            className="w-full rounded-lg border border-slate-300 bg-white py-2.5 pl-10 pr-4 text-sm text-slate-900 placeholder-slate-400 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 dark:border-slate-600 dark:bg-slate-800 dark:text-slate-100 dark:placeholder-slate-500"
          />
          {status && <input type="hidden" name="status" value={status} />}
        </form>
      </div>

      <div className="rounded-xl border border-slate-200 bg-white shadow-sm dark:border-slate-700 dark:bg-slate-800">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-slate-200 text-left dark:border-slate-700">
                <th className="px-6 py-4 font-medium text-slate-500 dark:text-slate-400">ID</th>
                <th className="px-6 py-4 font-medium text-slate-500 dark:text-slate-400">Como comprador</th>
                <th className="px-6 py-4 font-medium text-slate-500 dark:text-slate-400">Como vendedor</th>
                <th className="px-6 py-4 font-medium text-slate-500 dark:text-slate-400">Estado</th>
                <th className="px-6 py-4 font-medium text-slate-500 dark:text-slate-400">Acción</th>
              </tr>
            </thead>
            <tbody>
              {(!data || data.items.length === 0) && !error && (
                <tr>
                  <td colSpan={5} className="px-6 py-12 text-center text-slate-400">
                    No hay usuarios registrados
                  </td>
                </tr>
              )}
              {data?.items.map((user: PaymentUser) => {
                const style = STATUS_STYLES[user.status] ?? { label: user.status, className: 'bg-slate-100 text-slate-600' }
                return (
                  <tr key={user.id} className="border-b border-slate-100 dark:border-slate-700">
                    <td className="px-6 py-4 font-mono text-xs text-slate-400">{user.id.slice(0, 8)}…</td>
                    <td className="px-6 py-4 text-slate-900 dark:text-slate-100">{user.buyerName || '—'}</td>
                    <td className="px-6 py-4 text-slate-500 dark:text-slate-400">{user.sellerName || '—'}</td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-medium ${style.className}`}>
                        {style.label}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <PaymentUserStatusButton clerkId={user.clerkId} currentStatus={user.status} />
                    </td>
                  </tr>
                )
              })}
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
    </div>
  )
}
