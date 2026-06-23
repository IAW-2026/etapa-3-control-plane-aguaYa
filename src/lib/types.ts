export type Vendor = {
  id: string
  name: string
  description?: string
  address: string
  image?: string
  cuil?: string
  cuit?: string
  isActive: boolean
  createdAt: string
  clerkName: string
  clerkEmail: string
  _count: { products: number; orders: number }
}

export type ListResponse<T> = {
  items: T[]
  total: number
  pageCount: number
}

export type VendorDetailResponse = {
  success: boolean
  vendor: Vendor
}

export type ProductItem = {
  id: string
  name: string
  description?: string
  price: number
  stock: number
  image?: string
  isActive: boolean
  createdAt: string
  vendor?: { name: string; id: string }
}

export type OrderItemProduct = {
  id: string
  name: string
  price: number
  image?: string
}

export type OrderLineItem = {
  id: string
  productName: string
  productPrice: number
  quantity: number
  product: OrderItemProduct
}

export type OrderItem = {
  id: string
  externalId: string
  buyerName: string
  status: string
  total: number
  address?: string
  createdAt: string
  items: OrderLineItem[]
  vendor?: { name: string; id: string }
}

/* Delivery App types */
export type Driver = {
  idChofer: number
  nombre: string
  telefono?: string
  estado: string
  disponible: boolean
  zona?: { idZona: number; nombre: string } | null
  vehiculo?: { idVehiculo: number; patente: string; tipo: string } | null
  pedidosAsignados: number
  idVendedor: string
  nombreEmpresa?: string | null
  clerkUserId?: string
  idVehiculo?: number | null
  idZona?: number | null
  temporaryPassword?: string
}

export type Vehicle = {
  idVehiculo: number
  patente: string
  tipo: string
  capacidadBidones: number
  estado: string
  motivoPausa?: string | null
  idVendedor: string
  choferAsignado?: string | { idChofer: number; nombre: string } | null
}

export type Zone = {
  idZona: number
  nombre: string
  choferes: number | Array<{ idChofer: number; nombre: string }>
  empresas: string[]
}

/* Create/Update payload types */
export type CreateDriverData = {
  email: string
  nombre: string
  telefono?: string
  idVendedor?: string
  idZona?: number
  idVehiculo?: number
}

export type UpdateDriverData = {
  nombre?: string
  telefono?: string
  idZona?: number
  idVehiculo?: number
}

export type CreateVehicleData = {
  patente: string
  tipo: string
  capacidadBidones: number
  idVendedor: string
}

export type UpdateVehicleData = {
  patente?: string
  tipo?: string
  capacidadBidones?: number
}

export type CreateZoneData = {
  nombre: string
}

export type UpdateZoneData = {
  nombre: string
}

export type ToggleVehicleData = {
  motivoPausa?: string
}

export type ToggleResponse = {
  ok: boolean
  nuevoEstado: string
}
