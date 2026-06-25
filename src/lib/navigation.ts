import {
  LayoutDashboard,
  Store,
  Package,
  ShoppingCart,
  Truck,
  Car,
  MapPin,
  CreditCard,
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

export const deliveryNav: NavItem[] = [
  { label: "Choferes", href: "/dashboard/drivers", icon: Truck },
  { label: "Vehículos", href: "/dashboard/vehicles", icon: Car },
  { label: "Zonas", href: "/dashboard/zones", icon: MapPin },
]

export type NavSection = {
  title: string
  items: NavItem[]
}

export const paymentNav: NavItem[] = [
  { label: "Pagos", href: "/dashboard/pagos", icon: CreditCard },
]

export const navSections: NavSection[] = [
  { title: "Seller App", items: mainNav.slice(1) },
  { title: "Delivery App", items: deliveryNav },
  { title: "Payment App", items: paymentNav },
]
