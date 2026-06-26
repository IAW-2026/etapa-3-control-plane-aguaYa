import type { ResenaItem } from '@/lib/actions/feedback'
import DeleteFeedbackButton from './DeleteFeedbackButton'

function StarDisplay({ stars }: { stars: number }) {
  return (
    <span className="font-bold text-amber-600 dark:text-amber-400">
      {'★'.repeat(stars)}{'☆'.repeat(5 - stars)}
    </span>
  )
}

export default function ResenaCard({ resena }: { resena: ResenaItem }) {
  return (
    <div className="rounded-xl border border-white/30 bg-linear-to-br from-white/30 to-slate-100/30 p-4 shadow-lg shadow-black/5 backdrop-blur-xl dark:border-slate-700/40 dark:from-slate-900/40 dark:to-slate-800/40">
      <div className="flex items-start justify-between gap-2">
        <div className="min-w-0 flex-1 space-y-1.5">
          <div className="flex items-center gap-2 text-sm">
            <span className="font-medium text-slate-900 dark:text-slate-100">{resena.id_usuario.slice(0, 10)}</span>
            <span className="text-slate-400">·</span>
            <span className="text-slate-500 dark:text-slate-400">#{resena.id_pedido}</span>
          </div>
          <div className="text-xs text-slate-500 dark:text-slate-400">
            Vendedor: {resena.id_vendedor}
          </div>
          <StarDisplay stars={resena.estrellas} />
          {resena.comentario && (
            <p className="text-sm text-slate-700 dark:text-slate-200 line-clamp-2">
              {resena.comentario}
            </p>
          )}
          <p className="text-xs text-slate-400 dark:text-slate-500">
            {new Date(resena.fecha).toLocaleDateString()}
          </p>
        </div>
        <DeleteFeedbackButton id={resena.id_resena} type="resena" label="Reseña" />
      </div>
    </div>
  )
}
