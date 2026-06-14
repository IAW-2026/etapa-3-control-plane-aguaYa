import {
  LayoutDashboard,
  Store,
  Package,
  ShoppingCart,
  type LucideIcon,
} from "lucide-react"

export type NavItem = {
  label: string
  href: string
  icon: LucideIcon
}

export const mainNav: NavItem[] = [
  { label: "Overview", href: "/dashboard", icon: LayoutDashboard },
  { label: "Vendedores", href: "/dashboard/vendors", icon: Store },
  { label: "Productos", href: "/dashboard/products", icon: Package },
  { label: "Pedidos", href: "/dashboard/orders", icon: ShoppingCart },
]

export const secondaryNav: NavItem[] = [
  // { label: "Compradores", href: "/buyers", icon: Users },
  // { label: "Reclamos", href: "/claims", icon: AlertTriangle },
  // { label: "Choferes", href: "/drivers", icon: Truck },
  // { label: "Vehículos", href: "/vehicles", icon: Car },
  // { label: "Transacciones", href: "/transactions", icon: CreditCard },
  // { label: "Reseñas", href: "/reviews", icon: Star },
  // { label: "FAQs", href: "/faqs", icon: HelpCircle },
]
