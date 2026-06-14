"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"
import { mainNav, secondaryNav, type NavItem } from "@/lib/navigation"
import { SignOutButton } from "@clerk/nextjs"
import { LogOut } from "lucide-react"
import ThemeToggle from "@/components/ThemeToggle"

function NavLink({ item, isActive }: { item: NavItem; isActive: boolean }) {
  const Icon = item.icon
  return (
    <Link
      href={item.href}
      className={cn(
        "flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors",
        isActive
          ? "bg-blue-600 text-white"
          : "text-slate-400 hover:bg-slate-800 hover:text-white"
      )}
    >
      <Icon className="h-4 w-4" />
      {item.label}
    </Link>
  )
}

export default function Sidebar() {
  const pathname = usePathname()

  return (
    <aside className="flex h-full w-64 flex-col bg-slate-900 dark:bg-slate-950">
      <div className="flex h-16 items-center justify-between border-b border-slate-800 px-6">
        <div className="flex items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-600 text-sm font-bold text-white">
            CP
          </div>
          <span className="text-lg font-semibold text-white">Control Plane</span>
        </div>
        <ThemeToggle />
      </div>

      <nav className="flex-1 space-y-1 p-4">
        <p className="px-3 text-xs font-medium text-slate-500 uppercase tracking-wider">Seller App</p>
        {mainNav.map((item) => (
          <NavLink key={item.href} item={item} isActive={pathname === item.href} />
        ))}

        {secondaryNav.length > 0 && (
          <>
            <p className="mt-6 px-3 text-xs font-medium text-slate-500 uppercase tracking-wider">Próximamente</p>
            {secondaryNav.map((item) => (
              <NavLink key={item.href} item={item} isActive={pathname === item.href} />
            ))}
          </>
        )}
      </nav>

      <div className="border-t border-slate-800 p-4">
        <SignOutButton>
          <button className="flex w-full items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium text-slate-400 transition-colors hover:bg-slate-800 hover:text-white">
            <LogOut className="h-4 w-4" />
            Cerrar sesión
          </button>
        </SignOutButton>
      </div>
    </aside>
  )
}
