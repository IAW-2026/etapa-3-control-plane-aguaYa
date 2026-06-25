'use server'

import { buyerApi } from '@/lib/api-buyer'
import { revalidatePath } from 'next/cache'
import type { Buyer, BuyerAddress, BuyerOrder, Favorite, CreateBuyerData, CreateBuyerOrderData } from '@/lib/types'

/* ───── Buyers ───── */

export async function getBuyers(params?: Record<string, string>) {
  const res = await buyerApi.get('/api/buyers', params) as { buyers: Buyer[] }
  return res.buyers
}

export async function getBuyer(buyerId: string) {
  const res = await buyerApi.get(`/api/buyers/${buyerId}`) as { buyer: Buyer }
  return res.buyer
}

export async function getBuyerByUser(userId: string) {
  const res = await buyerApi.get(`/api/buyers/by-user/${userId}`) as { buyer_id: string; name: string }
  return res
}

export async function createBuyer(data: CreateBuyerData) {
  const res = await buyerApi.post('/api/buyers', data) as { buyer: Buyer }
  revalidatePath('/dashboard/buyers')
  return res.buyer
}

export async function toggleBuyer(buyerId: string) {
  const current = await getBuyer(buyerId)
  const res = await buyerApi.patch(`/api/buyers/${buyerId}`, { is_active: !current.is_active }) as { buyer: Buyer }
  revalidatePath('/dashboard/buyers')
  revalidatePath(`/dashboard/buyers/${buyerId}`)
  return res.buyer
}

export async function deleteBuyer(buyerId: string) {
  await buyerApi.delete(`/api/buyers/${buyerId}`)
  revalidatePath('/dashboard/buyers')
}

/* ───── Addresses ───── */

export async function getBuyerAddresses(buyerId: string) {
  const res = await buyerApi.get(`/api/buyers/${buyerId}/addresses`) as { addresses: BuyerAddress[] }
  return res.addresses
}

export async function createAddress(buyerId: string, data: { street: string; city: string; zip: string }) {
  const res = await buyerApi.post(`/api/buyers/${buyerId}/addresses`, data) as { address: BuyerAddress }
  revalidatePath(`/dashboard/buyers/${buyerId}`)
  return res.address
}

export async function deleteAddress(addressId: string, buyerId: string) {
  await buyerApi.delete(`/api/addresses/${addressId}`)
  revalidatePath(`/dashboard/buyers/${buyerId}`)
}

/* ───── Orders ───── */

export async function getBuyerOrders(buyerId: string) {
  const res = await buyerApi.get('/api/orders', { buyer_id: buyerId }) as { orders: BuyerOrder[] }
  return res.orders
}

export async function deleteBuyerOrder(orderId: string, buyerId: string) {
  await buyerApi.delete(`/api/orders/${orderId}`)
  revalidatePath(`/dashboard/buyers/${buyerId}`)
}

export async function createBuyerOrder(data: CreateBuyerOrderData) {
  const res = await buyerApi.post('/api/orders', data) as { order: BuyerOrder }
  revalidatePath(`/dashboard/buyers/${data.buyer_id}`)
  revalidatePath('/dashboard/buyer-orders')
  return res.order
}

export async function getAllBuyerOrders(params?: Record<string, string>) {
  const res = await buyerApi.get('/api/orders', params) as { orders: BuyerOrder[] }
  return res.orders
}

export async function updateBuyerOrderStatus(orderId: string, orderStatus: string, status_reason?: string) {
  const res = await buyerApi.patch(`/api/orders/${orderId}`, { orderStatus, ...(status_reason ? { status_reason } : {}) }) as { ok: boolean }
  revalidatePath('/dashboard/buyer-orders')
  return res
}

export async function deleteBuyerOrderGlobal(orderId: string) {
  await buyerApi.delete(`/api/orders/${orderId}`)
  revalidatePath('/dashboard/buyer-orders')
}

/* ───── Favorites ───── */

export async function getBuyerFavorites(buyerId: string) {
  const res = await buyerApi.get('/api/favorites', { buyer_id: buyerId }) as { favorites: Favorite[] }
  return res.favorites
}

export async function addFavorite(buyerId: string, vendorId: string) {
  const res = await buyerApi.post('/api/favorites', { buyer_id: buyerId, vendor_id: vendorId }) as { favorite: Favorite }
  revalidatePath(`/dashboard/buyers/${buyerId}`)
  return res.favorite
}

export async function removeFavorite(buyerId: string, vendorId: string) {
  await buyerApi.delete(`/api/favorites?buyer_id=${encodeURIComponent(buyerId)}&vendor_id=${encodeURIComponent(vendorId)}`)
  revalidatePath(`/dashboard/buyers/${buyerId}`)
}
