import {
  LayoutDashboard,
  Store,
  Package,
  ShoppingCart,
  Truck,
  Car,
  MapPin,
  Shield,
  CreditCard,
  Users,
  FileText,
  MessageSquareQuote,
  Star,
  type LucideIcon,
} from "lucide-react";

export type NavItem = {
  label: string;
  href: string;
  icon: LucideIcon;
};

export const mainNav: NavItem[] = [
  { label: "Overview", href: "/dashboard", icon: LayoutDashboard },
  { label: "Vendedores", href: "/dashboard/vendors", icon: Store },
  { label: "Productos", href: "/dashboard/products", icon: Package },
  { label: "Pedidos", href: "/dashboard/orders", icon: ShoppingCart },
  { label: "Admin Seller", href: "/dashboard/seller-admins", icon: Shield },
];

export const deliveryNav: NavItem[] = [
  { label: "Choferes", href: "/dashboard/drivers", icon: Truck },
  { label: "Vehículos", href: "/dashboard/vehicles", icon: Car },
  { label: "Zonas", href: "/dashboard/zones", icon: MapPin },
  { label: "Logísticos", href: "/dashboard/logistics-admins", icon: Shield },
  { label: "Admin Delivery", href: "/dashboard/delivery-admins", icon: Shield },
];
export const feedbackNav: NavItem[] = [
  { label: "Reseñas", href: "/dashboard/feedback/resenas", icon: MessageSquareQuote },
  { label: "Valoraciones", href: "/dashboard/feedback/valoraciones", icon: Star },
]
export const buyerNav: NavItem[] = [
  { label: "Compradores", href: "/dashboard/buyers", icon: Users },
  { label: "Pedidos", href: "/dashboard/buyer-orders", icon: ShoppingCart },
]

export type NavSection = {
  title: string;
  items: NavItem[];
};

export const paymentNav: NavItem[] = [
  { label: "Transacciones", href: "/dashboard/pagos", icon: CreditCard },
];

export const adminPaymentsNav: NavItem[] = [
  { label: "Admin Pagos", href: "/dashboard/payment-admins", icon: Shield },
];

export const usuariosPaymentsNav: NavItem[] = [
  { label: "Usuarios Pagos", href: "/dashboard/payment-users", icon: Users },
];

export const facturasNav: NavItem[] = [
  { label: "Facturas", href: "/dashboard/facturas", icon: FileText },
];

export const navSections: NavSection[] = [
  { title: "Seller App", items: mainNav.slice(1) },
  { title: "Delivery App", items: deliveryNav },
  { title: "Buyer App", items: buyerNav },
  { title: "Feedback App", items: feedbackNav },
  { title: "Payment App", items: [...paymentNav, ...facturasNav, ...usuariosPaymentsNav, ...adminPaymentsNav] },
];
