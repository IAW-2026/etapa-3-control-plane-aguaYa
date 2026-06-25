import type { ValoracionItem } from '@/lib/actions/feedback'
import DeleteFeedbackButton from './DeleteFeedbackButton'

function StarDisplay({ stars }: { stars: number }) {
  return (
    <span className="font-bold text-amber-600 dark:text-amber-400">
      {'★'.repeat(stars)}{'☆'.repeat(5 - stars)}
    </span>
  )
}

export default function ValoracionCard({ valoracion }: { valoracion: ValoracionItem }) {
  return (
    <div className="rounded-xl border border-white/30 bg-linear-to-br from-white/30 to-slate-100/30 p-4 shadow-lg shadow-black/5 backdrop-blur-xl dark:border-slate-700/40 dark:from-slate-900/40 dark:to-slate-800/40">
      <div className="flex items-start justify-between gap-2">
        <div className="min-w-0 flex-1 space-y-1.5">
          <p className="text-sm font-medium text-slate-900 dark:text-slate-100">
            {valoracion.id_usuario}
          </p>
          <StarDisplay stars={valoracion.estrellas} />
          <p className="text-sm text-slate-700 dark:text-slate-200 line-clamp-2">
            {valoracion.comentario}
          </p>
          <p className="text-xs text-slate-400 dark:text-slate-500">
            {new Date(valoracion.fecha).toLocaleDateString()}
          </p>
        </div>
        <DeleteFeedbackButton id={valoracion.id_valoracion} type="valoracion" label="Valoración" />
      </div>
    </div>
  )
}
