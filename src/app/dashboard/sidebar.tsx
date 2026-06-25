"use client"

import { useState } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"
import { mainNav, navSections, type NavItem } from "@/lib/navigation"
import { SignOutButton } from "@clerk/nextjs"
import { LogOut, Menu, X } from "lucide-react"
import ThemeToggle from "@/components/layout/ThemeToggle"

function NavLink({ item, isActive }: { item: NavItem; isActive: boolean }) {
  const Icon = item.icon
  return (
    <Link
      href={item.href}
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

  return (
    <aside className="flex h-full w-64 flex-col border-r border-white/30 bg-gradient-to-br from-white/30 to-slate-100/30 backdrop-blur-xl dark:border-slate-700/40 dark:from-slate-900/40 dark:to-slate-800/40">
      <div className="flex h-16 items-center justify-between border-b border-white/20 px-6 dark:border-slate-700/30">
        <div className="flex items-center gap-2">
          <img src="/icon.svg" alt="AguaYa" className="h-8 w-8" />
          <span className="text-lg font-semibold text-slate-900 dark:text-slate-100">Control Plane</span>
        </div>
        <ThemeToggle />
      </div>

    <nav className="flex-1 space-y-1 overflow-y-auto p-4">
      <p className="px-3 text-xs font-medium text-slate-500 uppercase tracking-wider">General</p>
      <div onClick={onNavClick}>
        <NavLink item={mainNav[0]} isActive={pathname === mainNav[0].href} />
        <NavLink item={mainNav[3]} isActive={pathname === mainNav[3].href} />
      </div>

      {navSections.map((section) => (
        <div key={section.title}>
          <p className="mt-6 px-3 text-xs font-medium text-slate-500 uppercase tracking-wider">
            {section.title}
          </p>
          <div onClick={onNavClick}>
            {section.items.map((item) => (
              <NavLink
                key={item.href}
                item={item}
                isActive={pathname === item.href || pathname.startsWith(item.href + "/")}
              />
            ))}
          </div>
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
  </>
)

export default function Sidebar() {
  const pathname = usePathname()
  const [isOpen, setIsOpen] = useState(false)

  const close = () => setIsOpen(false)

  return (
    <>
      {/* Hamburger — mobile only */}
      <button
        onClick={() => setIsOpen(true)}
        className="fixed left-4 top-4 z-30 flex h-9 w-9 items-center justify-center rounded-lg border border-white/30 bg-white/80 shadow-lg shadow-black/5 backdrop-blur-xl lg:hidden dark:border-slate-700/40 dark:bg-slate-900/80"
        aria-label="Abrir menú"
      >
        <Menu className="h-5 w-5 text-slate-600 dark:text-slate-300" />
      </button>

      {/* Backdrop — mobile only */}
      {isOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/40 backdrop-blur-sm lg:hidden"
          onClick={close}
        />
      )}

      {/* Close button inside sidebar — mobile only */}
      <aside
        className={cn(
          "fixed inset-y-0 left-0 z-50 flex w-64 flex-col",
          "border-r border-white/30 bg-gradient-to-br from-white/30 to-slate-100/30 backdrop-blur-xl",
          "dark:border-slate-700/40 dark:from-slate-900/40 dark:to-slate-800/40",
          "transition-transform duration-200",
          isOpen ? "translate-x-0" : "-translate-x-full",
          "lg:static lg:z-auto lg:translate-x-0 lg:transition-none"
        )}
      >
        <button
          onClick={close}
          className="absolute right-3 top-3 flex h-7 w-7 items-center justify-center rounded-lg text-slate-400 hover:bg-white/20 hover:text-slate-600 lg:hidden dark:hover:bg-slate-700 dark:hover:text-slate-300"
          aria-label="Cerrar menú"
        >
          <X className="h-4 w-4" />
        </button>
        {sidebarContent(pathname, close)}
      </aside>
    </>
  )
}
