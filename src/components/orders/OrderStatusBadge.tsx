import type { StatusDefinition, StatusColor } from '@/lib/adapters/types'

const COLOR_MAP: Record<StatusColor, string> = {
  emerald: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400',
  amber: 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400',
  blue: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400',
  red: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400',
  slate: 'bg-slate-100 text-slate-700 dark:bg-slate-700 dark:text-slate-300',
  purple: 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400',
  cyan: 'bg-cyan-100 text-cyan-700 dark:bg-cyan-900/30 dark:text-cyan-400',
}

type Props = {
  status: string
  definitions: StatusDefinition[]
}

export default function OrderStatusBadge({ status, definitions }: Props) {
  const def = definitions.find((d) => d.value === status)
  const className = COLOR_MAP[def?.color ?? 'slate']
  const label = def?.label ?? status

  return (
    <span className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-medium ${className}`}>
      {label}
    </span>
  )
}
