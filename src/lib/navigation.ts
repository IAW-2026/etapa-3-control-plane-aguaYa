import {
  LayoutDashboard,
  Store,
  Package,
  ShoppingCart,
  Truck,
  Car,
  MapPin,
  Shield,
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
  { label: "Admin Seller", href: "/dashboard/seller-admins", icon: Shield },
]

export const deliveryNav: NavItem[] = [
  { label: "Choferes", href: "/dashboard/drivers", icon: Truck },
  { label: "Vehículos", href: "/dashboard/vehicles", icon: Car },
  { label: "Zonas", href: "/dashboard/zones", icon: MapPin },
  { label: "Logísticos", href: "/dashboard/logistics-admins", icon: Shield },
  { label: "Admin Delivery", href: "/dashboard/delivery-admins", icon: Shield },
]

export type NavSection = {
  title: string
  items: NavItem[]
}

export const navSections: NavSection[] = [
  { title: "Seller App", items: mainNav.slice(1) },
  { title: "Delivery App", items: deliveryNav },
]
