export default function VendorProductsSkeleton({ rows = 5 }: { rows?: number }) {
  return (
    <>
      {Array.from({ length: rows }).map((_, i) => (
        <div key={i} className="flex items-center gap-3 px-5 py-3">
          <div className="h-10 w-10 animate-pulse rounded-lg bg-slate-200 dark:bg-slate-700" />
          <div className="min-w-0 flex-1">
            <div className="mb-1 h-4 w-32 animate-pulse rounded bg-slate-200 dark:bg-slate-700" />
            <div className="flex items-center gap-3">
              <div className="h-3 w-16 animate-pulse rounded bg-slate-200 dark:bg-slate-700" />
              <div className="h-3 w-14 animate-pulse rounded bg-slate-200 dark:bg-slate-700" />
            </div>
          </div>
          <div className="h-5 w-14 animate-pulse rounded-full bg-slate-200 dark:bg-slate-700" />
        </div>
      ))}
    </>
  )
}
