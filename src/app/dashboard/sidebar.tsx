"use client"

import { useState } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"
import { mainNav, navSections, type NavItem } from "@/lib/navigation"
import { SignOutButton } from "@clerk/nextjs"
import { LogOut, Menu, X } from "lucide-react"
import ThemeToggle from "@/components/layout/ThemeToggle"

function NavLink({ item, isActive, onClick }: { item: NavItem; isActive: boolean; onClick?: () => void }) {
  const Icon = item.icon
  return (
    <Link
      href={item.href}
      onClick={onClick}
      className={cn(
        "flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors",
        isActive
          ? "bg-blue-600 text-white"
          : "text-slate-500 hover:bg-white/20 hover:text-slate-900 dark:text-slate-400 dark:hover:bg-white/5 dark:hover:text-white"
      )}
    >
      <Icon className="h-4 w-4" />
      {item.label}
    </Link>
  )
}

export default function Sidebar() {
  const pathname = usePathname()
  const [mobileOpen, setMobileOpen] = useState(false)

  function closeMobile() {
    setMobileOpen(false)
  }

  return (
    <>
      {/* Hamburger button — visible only on mobile */}
      <button
        type="button"
        onClick={() => setMobileOpen(true)}
        className="fixed left-4 top-4 z-50 flex items-center justify-center rounded-xl border border-white/30 bg-gradient-to-br from-white/30 to-slate-100/30 p-2.5 shadow-lg shadow-black/5 backdrop-blur-xl lg:hidden dark:border-slate-700/40 dark:from-slate-900/40 dark:to-slate-800/40"
        aria-label="Abrir menú"
      >
        <Menu className="h-5 w-5 text-slate-600 dark:text-slate-300" />
      </button>

      {/* Overlay — closes sidebar on tap */}
      {mobileOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/40 backdrop-blur-sm lg:hidden"
          onClick={closeMobile}
        />
      )}

      {/* Sidebar panel */}
      <aside
        className={cn(
          "fixed inset-y-0 left-0 z-50 flex w-64 flex-col border-r border-white/30 bg-gradient-to-br from-white/30 to-slate-100/30 backdrop-blur-xl transition-transform duration-300 dark:border-slate-700/40 dark:from-slate-900/40 dark:to-slate-800/40",
          "lg:static lg:z-auto lg:translate-x-0",
          mobileOpen ? "translate-x-0" : "-translate-x-full"
        )}
      >
        <div className="flex h-16 items-center justify-between border-b border-white/20 px-6 dark:border-slate-700/30">
          <div className="flex items-center gap-2">
            <img src="/icon.svg" alt="AguaYa" className="h-8 w-8" />
            <span className="text-lg font-semibold text-slate-900 dark:text-slate-100">Control Plane</span>
          </div>
          <div className="flex items-center gap-2">
            <ThemeToggle />
            {/* Close button — mobile only */}
            <button
              type="button"
              onClick={closeMobile}
              className="flex items-center justify-center rounded-lg p-1.5 text-slate-500 hover:bg-white/20 lg:hidden dark:hover:bg-white/10"
              aria-label="Cerrar menú"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
        </div>

        <nav className="flex-1 space-y-1 overflow-y-auto p-4">
          <p className="px-3 text-xs font-medium text-slate-500 uppercase tracking-wider">General</p>
          <NavLink item={mainNav[0]} isActive={pathname === mainNav[0].href} onClick={closeMobile} />

          {navSections.map((section) => (
            <div key={section.title}>
              <p className="mt-6 px-3 text-xs font-medium text-slate-500 uppercase tracking-wider">
                {section.title}
              </p>
              {section.items.map((item) => (
                <NavLink
                  key={item.href}
                  item={item}
                  isActive={pathname === item.href || pathname.startsWith(item.href + "/")}
                  onClick={closeMobile}
                />
              ))}
            </div>
          ))}
        </nav>

        <div className="border-t border-white/20 p-4 dark:border-slate-700/30">
          <SignOutButton>
            <button className="flex w-full items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium text-slate-500 transition-colors hover:bg-white/20 hover:text-slate-900 dark:text-slate-400 dark:hover:bg-white/5 dark:hover:text-white">
              <LogOut className="h-4 w-4" />
              Cerrar sesión
            </button>
          </SignOutButton>
        </div>
      </aside>
    </>
  )
}
