import { getResenas, type ResenaItem } from '@/lib/actions/feedback'
import { MessageSquareQuote, ChevronLeft, ChevronRight } from 'lucide-react'
import DeleteFeedbackButton from '@/components/feedback/DeleteFeedbackButton'

export const dynamic = "force-dynamic"

function StarDisplay({ stars }: { stars: number }) {
  return (
    <span className="font-bold text-amber-600 dark:text-amber-400">
      {'★'.repeat(stars)}{'☆'.repeat(5 - stars)}
    </span>
  )
}

export default async function FeedbackResenasPage({
  searchParams,
}: {
  searchParams: Promise<{ page?: string; estrellas?: string }>
}) {
  const { page: pageParam, estrellas: estrellasParam } = await searchParams
  const currentPage = parseInt(pageParam ?? '1', 10)
  const estrellas = estrellasParam ? parseInt(estrellasParam) : undefined

  let data: { items: ResenaItem[]; total: number; page: number; totalPages: number } | null = null
  let error: string | null = null

  try {
    data = await getResenas({ page: currentPage, limit: 10, estrellas })
  } catch (e) {
    error = e instanceof Error ? e.message : 'Error al cargar reseñas'
  }

  function pageUrl(p: number) {
    const params = new URLSearchParams()
    params.set('page', String(p))
    if (estrellas) params.set('estrellas', String(estrellas))
    return `/dashboard/feedback/resenas?${params.toString()}`
  }

  return (
    <div>
      <div className="mb-8 flex items-center justify-between">
        <div>
          <p className="text-sm font-semibold uppercase tracking-[0.24em] text-sky-700 dark:text-sky-400">Feedback App</p>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-100">Reseñas</h1>
        </div>
        <MessageSquareQuote className="h-8 w-8 text-blue-600/40" />
      </div>

      {error && (
        <div className="mb-6 rounded-xl border border-red-200/60 bg-white/80 px-5 py-4 text-sm text-red-700 shadow-lg shadow-black/5 backdrop-blur-xl dark:border-red-800/60 dark:bg-slate-900/80 dark:text-red-400">
          {error}
        </div>
      )}

      <div className="mb-4 flex gap-1 rounded-xl bg-linear-to-br from-slate-100/70 to-slate-200/50 p-1 shadow-lg shadow-black/5 backdrop-blur-xl dark:from-slate-800/60 dark:to-slate-800/40">
        {[undefined, 5, 4, 3, 2, 1].map((s) => {
          const label = s === undefined ? 'Todas' : `${s} ★`
          const isActive = (s === undefined && !estrellas) || s === estrellas
          const href = s === undefined
            ? '/dashboard/feedback/resenas'
            : `/dashboard/feedback/resenas?estrellas=${s}`
          return (
            <a
              key={s ?? 'all'}
              href={href}
              className={`flex-1 rounded-lg px-4 py-2 text-center text-sm font-medium transition-all ${
                isActive
                  ? 'bg-linear-to-br from-white/60 to-slate-100/60 text-slate-900 shadow-sm backdrop-blur-sm dark:from-slate-700 dark:to-slate-600 dark:text-white'
                  : 'text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200'
              }`}
            >
              {label}
            </a>
          )
        })}
      </div>

      <div className="overflow-x-auto rounded-xl border border-white/30 bg-linear-to-br from-white/30 to-slate-100/30 shadow-lg shadow-black/5 backdrop-blur-xl dark:border-slate-700/40 dark:from-slate-900/40 dark:to-slate-800/40">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-white/20 text-left dark:border-slate-700/30">
              <th className="px-6 py-4 font-medium text-slate-500 dark:text-slate-400">Usuario</th>
              <th className="px-6 py-4 font-medium text-slate-500 dark:text-slate-400">Vendedor</th>
              <th className="px-6 py-4 font-medium text-slate-500 dark:text-slate-400">Pedido</th>
              <th className="px-6 py-4 font-medium text-slate-500 dark:text-slate-400">Estrellas</th>
              <th className="px-6 py-4 font-medium text-slate-500 dark:text-slate-400">Comentario</th>
              <th className="px-6 py-4 font-medium text-slate-500 dark:text-slate-400">Fecha</th>
              <th className="px-6 py-4 font-medium text-slate-500 dark:text-slate-400">Acción</th>
            </tr>
          </thead>
          <tbody>
            {(!data || data.items.length === 0) && !error && (
              <tr>
                <td colSpan={7} className="px-6 py-12 text-center text-slate-400">
                  No hay reseñas registradas
                </td>
              </tr>
            )}
            {data?.items.map((resena) => (
              <tr key={resena.id_resena} className="border-b border-white/10 transition-colors hover:bg-white/20 dark:border-slate-700/20 dark:hover:bg-white/5">
                <td className="px-6 py-4 text-slate-900 dark:text-slate-100">{resena.id_usuario}</td>
                <td className="px-6 py-4 text-slate-500 dark:text-slate-400">{resena.id_vendedor}</td>
                <td className="px-6 py-4 text-slate-500 dark:text-slate-400">{resena.id_pedido}</td>
                <td className="px-6 py-4"><StarDisplay stars={resena.estrellas} /></td>
                <td className="px-6 py-4 text-slate-700 dark:text-slate-200 max-w-xs truncate">
                  {resena.comentario || '—'}
                </td>
                <td className="px-6 py-4 text-slate-500 dark:text-slate-400 whitespace-nowrap">
                  {new Date(resena.fecha).toLocaleDateString()}
                </td>
                <td className="px-6 py-4">
                  <DeleteFeedbackButton id={resena.id_resena} type="resena" />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {data && data.totalPages > 1 && (
        <div className="mt-6 flex items-center justify-center gap-2">
          {currentPage > 1 && (
            <a
              href={pageUrl(currentPage - 1)}
              className="flex items-center gap-1 rounded-lg border border-white/30 bg-linear-to-br from-white/30 to-slate-100/30 px-3 py-2 text-sm text-slate-600 shadow-lg shadow-black/5 backdrop-blur-xl transition-colors hover:bg-white/40 dark:border-slate-700/40 dark:from-slate-900/40 dark:to-slate-800/40 dark:text-slate-400 dark:hover:bg-white/10"
            >
              <ChevronLeft className="h-4 w-4" />
              Anterior
            </a>
          )}
          <span className="px-3 text-sm text-slate-500 dark:text-slate-400">
            Página {currentPage} de {data.totalPages}
          </span>
          {currentPage < data.totalPages && (
            <a
              href={pageUrl(currentPage + 1)}
              className="flex items-center gap-1 rounded-lg border border-white/30 bg-linear-to-br from-white/30 to-slate-100/30 px-3 py-2 text-sm text-slate-600 shadow-lg shadow-black/5 backdrop-blur-xl transition-colors hover:bg-white/40 dark:border-slate-700/40 dark:from-slate-900/40 dark:to-slate-800/40 dark:text-slate-400 dark:hover:bg-white/10"
            >
              Siguiente
              <ChevronRight className="h-4 w-4" />
            </a>
          )}
        </div>
      )}
    </div>
  )
}
