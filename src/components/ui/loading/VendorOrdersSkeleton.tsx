export default function VendorOrdersSkeleton({ rows = 5 }: { rows?: number }) {
  return (
    <>
      {Array.from({ length: rows }).map((_, i) => (
        <div key={i} className="px-5 py-3">
          <div className="flex items-center justify-between">
            <div className="h-4 w-20 animate-pulse rounded bg-slate-200 dark:bg-slate-700" />
            <div className="h-5 w-14 animate-pulse rounded-full bg-slate-200 dark:bg-slate-700" />
          </div>
          <div className="mt-2 flex items-center gap-3">
            <div className="h-3 w-16 animate-pulse rounded bg-slate-200 dark:bg-slate-700" />
            <div className="h-3 w-14 animate-pulse rounded bg-slate-200 dark:bg-slate-700" />
            <div className="h-3 w-28 animate-pulse rounded bg-slate-200 dark:bg-slate-700" />
          </div>
          <div className="mt-2 h-3 w-24 animate-pulse rounded bg-slate-200 dark:bg-slate-700" />
        </div>
      ))}
    </>
  )
}
