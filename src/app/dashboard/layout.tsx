import Sidebar from "./sidebar"

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex h-screen bg-transparent text-slate-900 dark:text-slate-100">
      <Sidebar />
      <main className="flex-1 overflow-y-auto px-4 py-6 pb-20 pt-16 sm:px-6 lg:px-10 lg:py-8 lg:pb-6 lg:pt-8">{children}</main>
    </div>
  )
}
