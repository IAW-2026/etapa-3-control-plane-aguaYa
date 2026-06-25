export type Vendor = {
  id: string;
  name: string;
  description?: string;
  address: string;
  image?: string;
  cuil?: string;
  cuit?: string;
  isActive: boolean;
  createdAt: string;
  clerkName: string;
  clerkEmail: string;
  _count: { products: number; orders: number };
};

export type ListResponse<T> = {
  items: T[];
  total: number;
  pageCount: number;
};

export type VendorDetailResponse = {
  success: boolean;
  vendor: Vendor;
};

export type ProductItem = {
  id: string;
  name: string;
  description?: string;
  price: number;
  stock: number;
  image?: string;
  isActive: boolean;
  createdAt: string;
  vendor?: { name: string; id: string };
};

export type OrderItemProduct = {
  id: string;
  name: string;
  price: number;
  image?: string;
};

export type OrderLineItem = {
  id: string;
  productName: string;
  productPrice: number;
  quantity: number;
  product: OrderItemProduct;
};

export type OrderItem = {
  id: string;
  externalId: string;
  buyerName: string;
  status: string;
  total: number;
  address?: string;
  createdAt: string;
  items: OrderLineItem[];
  vendor?: { name: string; id: string };
};

/* Delivery App types */
export type Driver = {
  idChofer: number;
  nombre: string;
  telefono?: string;
  estado: string;
  disponible: boolean;
  zona?: { idZona: number; nombre: string } | null;
  vehiculo?: { idVehiculo: number; patente: string; tipo: string } | null;
  pedidosAsignados: number;
  idVendedor: string;
  nombreEmpresa?: string | null;
  clerkUserId?: string;
  idVehiculo?: number | null;
  idZona?: number | null;
  temporaryPassword?: string;
};

export type Vehicle = {
  idVehiculo: number;
  patente: string;
  tipo: string;
  capacidadBidones: number;
  estado: string;
  motivoPausa?: string | null;
  idVendedor: string;
  choferAsignado?: string | { idChofer: number; nombre: string } | null;
};

export type Zone = {
  idZona: number;
  nombre: string;
  choferes: number | Array<{ idChofer: number; nombre: string }>;
  empresas: string[];
};

/* Create/Update payload types */
export type CreateDriverData = {
  email: string;
  nombre: string;
  telefono?: string;
  idVendedor?: string;
  idZona?: number;
  idVehiculo?: number;
};

export type UpdateDriverData = {
  nombre?: string;
  telefono?: string;
  idZona?: number;
  idVehiculo?: number;
};

export type CreateVehicleData = {
  patente: string;
  tipo: string;
  capacidadBidones: number;
  idVendedor: string;
};

export type UpdateVehicleData = {
  patente?: string;
  tipo?: string;
  capacidadBidones?: number;
};

export type CreateZoneData = {
  nombre: string
  empresas?: string[]
}

export type UpdateZoneData = {
  nombre: string
  empresas?: string[]
}

export type ToggleVehicleData = {
  motivoPausa?: string;
};

export type ToggleResponse = {
  ok: boolean;
  nuevoEstado: string;
};

/* Logistics Admin */
export type LogisticsAdmin = {
  clerkUserId: string;
  nombre: string;
  telefono?: string;
  idVendedor: string;
  nombreEmpresa: string;
  isBlocked: boolean;
  createdAt: string;
};

export type CreateLogisticsAdminData = {
  email: string;
  idVendedor: string;
};

export type UpdateLogisticsAdminData = {
  nombre?: string;
  nombreEmpresa?: string;
};

/* Admin Delivery (global, sin empresa) */
export type AdminDelivery = {
  clerkUserId: string;
  nombre: string | null;
  telefono?: string | null;
  isBlocked: boolean;
  createdAt: string;
};

export type CreateAdminDeliveryData = {
  email: string;
  nombre: string;
  telefono?: string;
};

export type UpdateAdminDeliveryData = {
  nombre?: string;
  telefono?: string;
};

/* Admin Payment (gestionado directo por Clerk desde Control Plane) */
export type PaymentAdmin = {
  clerkUserId: string
  email: string
  nombre: string | null
  telefono: string | null
  isBlocked: boolean
  createdAt: string
}

export type CreatePaymentAdminData = {
  email: string
  password: string
  nombre: string
  telefono?: string
}

export type UpdatePaymentAdminData = {
  nombre?: string
  telefono?: string
}

/* Buyer App types */
export type Buyer = {
  buyer_id: string
  user_id: string
  mail: string
  name: string
  phone_numbers?: string
  is_active: boolean
}

export type BuyerAddress = {
  id: string
  street: string
  city: string
  zip: string
  buyer_id: string
}

export type BuyerOrder = {
  order_id: string
  vendor_id: string
  buyer_id: string
  buyer_user_id: string
  status: string
  status_reason?: string
  total: number
  address_id?: string
  created_at: string
  updated_at: string
}

export type BuyerOrderItem = {
  id: string
  order_id: string
  product_id: string
  product_name: string
  product_price: number
  quantity: number
}

export type Favorite = {
  buyer_id: string
  vendor_id: string
}

export type CreateBuyerData = {
  user_id: string
  mail: string
  name: string
}

export type CreateBuyerOrderData = {
  vendor_id: string
  buyer_id: string
  buyer_user_id: string
  total: number
  address_id?: string
  items?: Array<{
    product_id: string
    product_name: string
    product_price: number
    quantity: number
  }>
}
/* Admin Seller (gestionado directo por Clerk desde Control Plane) */
export type SellerAdmin = {
  clerkUserId: string;
  email: string;
  nombre: string | null;
  telefono: string | null;
  isBlocked: boolean;
  createdAt: string;
};

export type CreateSellerAdminData = {
  email: string;
  password: string;
  nombre: string;
  telefono?: string;
};

export type UpdateSellerAdminData = {
  nombre?: string;
  telefono?: string;
};
