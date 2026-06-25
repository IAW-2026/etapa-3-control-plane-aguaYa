'use server'

import { sellerApi } from '@/lib/api'
import { revalidatePath } from 'next/cache'

export async function toggleVendor(id: string) {
  const res = await sellerApi.patch(`/api/admin/vendors/${id}/toggle`)
  revalidatePath('/dashboard/vendors')
  revalidatePath(`/dashboard/vendors/${id}`)
  return res
}

export async function updateVendor(id: string, data: {
  name: string
  address: string
  description?: string
  cuil?: string
  cuit?: string
  image?: string
}) {
  const res = await sellerApi.put(`/api/admin/vendors/${id}`, data)
  revalidatePath('/dashboard/vendors')
  revalidatePath(`/dashboard/vendors/${id}`)
  return res
}

export async function deleteVendor(id: string) {
  const res = await sellerApi.delete(`/api/admin/vendors/${id}`)
  revalidatePath('/dashboard/vendors')
  return res
}

export async function getVendorProducts(vendorId: string, params?: Record<string, string>) {
  return sellerApi.get(`/api/admin/vendors/${vendorId}/products`, params)
}

export async function getProducts(params?: Record<string, string>) {
  return sellerApi.get('/api/admin/products', params)
}

export async function getVendorOrders(vendorId: string, params?: Record<string, string>) {
  return sellerApi.get(`/api/admin/vendors/${vendorId}/orders`, params)
}

export async function updateOrderStatus(orderId: string, status: 'PAID' | 'READY') {
  const res = await sellerApi.patch(`/api/admin/orders/${orderId}/status`, { status })
  revalidatePath('/dashboard/vendors/[id]')
  return res
}

export async function updateProduct(id: string, data: {
  name: string
  price: number
  stock: number
  description?: string
  image?: string
}) {
  const res = await sellerApi.put(`/api/admin/products/${id}`, data)
  revalidatePath('/dashboard/vendors/[id]')
  return res
}

export async function toggleProduct(id: string) {
  const res = await sellerApi.patch(`/api/admin/products/${id}/toggle`)
  revalidatePath('/dashboard/vendors/[id]')
  return res
}

export async function deleteProduct(id: string) {
  const res = await sellerApi.delete(`/api/admin/products/${id}`)
  revalidatePath('/dashboard/vendors/[id]')
  revalidatePath('/dashboard/products')
  return res
}

export async function getVendors(params?: Record<string, string>) {
  return sellerApi.get('/api/admin/vendors', params)
}

export async function getVendorsSimple() {
  const res = await sellerApi.get('/api/admin/vendors') as { items: Array<{ id: string; name: string; clerkEmail: string }> }
  return res.items.map((v) => ({ id: v.id, name: v.name, clerkEmail: v.clerkEmail }))
}
