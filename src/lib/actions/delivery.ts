'use server'

import { deliveryApi } from '@/lib/api-delivery'
import type { Driver, Vehicle, Zone, LogisticsAdmin, AdminDelivery, ListResponse, CreateDriverData, UpdateDriverData, CreateVehicleData, UpdateVehicleData, CreateZoneData, UpdateZoneData, CreateLogisticsAdminData, UpdateLogisticsAdminData, CreateAdminDeliveryData, UpdateAdminDeliveryData, ToggleResponse } from '@/lib/types'
import { revalidatePath } from 'next/cache'
import { clerkClient } from '@clerk/nextjs/server'

/* ───── Drivers ───── */

export async function getDrivers(params?: Record<string, string>) {
  return deliveryApi.get('/api/admin/drivers', params) as Promise<ListResponse<Driver>>
}

export async function getDriver(id: number) {
  return deliveryApi.get(`/api/admin/drivers/${id}`) as Promise<Driver>
}

export async function toggleDriver(id: number) {
  const res = await deliveryApi.patch(`/api/admin/drivers/${id}/toggle`)
  revalidatePath('/dashboard/drivers')
  revalidatePath(`/dashboard/drivers/${id}`)
  return res
}

export async function createDriver(data: CreateDriverData) {
  const res = await deliveryApi.post('/api/admin/drivers', data) as Driver
  revalidatePath('/dashboard/drivers')
  return res
}

export async function updateDriver(id: number, data: UpdateDriverData) {
  const res = await deliveryApi.put(`/api/admin/drivers/${id}`, data) as Driver
  revalidatePath('/dashboard/drivers')
  revalidatePath(`/dashboard/drivers/${id}`)
  return res
}

export async function deleteDriver(id: number) {
  const res = await deliveryApi.delete(`/api/admin/drivers/${id}`)
  revalidatePath('/dashboard/drivers')
  return res
}

/* ───── Vehicles ───── */

export async function getVehicles(params?: Record<string, string>) {
  return deliveryApi.get('/api/admin/vehicles', params) as Promise<ListResponse<Vehicle>>
}

export async function getVehicle(id: number) {
  return deliveryApi.get(`/api/admin/vehicles/${id}`) as Promise<Vehicle>
}

export async function createVehicle(data: CreateVehicleData) {
  const res = await deliveryApi.post('/api/admin/vehicles', data) as Vehicle
  revalidatePath('/dashboard/vehicles')
  return res
}

export async function updateVehicle(id: number, data: UpdateVehicleData) {
  const res = await deliveryApi.put(`/api/admin/vehicles/${id}`, data) as Vehicle
  revalidatePath('/dashboard/vehicles')
  revalidatePath(`/dashboard/vehicles/${id}`)
  return res
}

export async function toggleVehicle(id: number, motivoPausa?: string) {
  const body = motivoPausa ? { motivoPausa } : {}
  const res = await deliveryApi.patch(`/api/admin/vehicles/${id}/toggle`, body) as ToggleResponse
  revalidatePath('/dashboard/vehicles')
  revalidatePath(`/dashboard/vehicles/${id}`)
  return res
}

export async function deleteVehicle(id: number) {
  const res = await deliveryApi.delete(`/api/admin/vehicles/${id}`)
  revalidatePath('/dashboard/vehicles')
  return res
}

/* ───── Zones ───── */

export async function getZones(params?: Record<string, string>) {
  return deliveryApi.get('/api/admin/zones', params) as Promise<ListResponse<Zone>>
}

export async function getZone(id: number) {
  return deliveryApi.get(`/api/admin/zones/${id}`) as Promise<Zone>
}

export async function createZone(data: CreateZoneData) {
  const res = await deliveryApi.post('/api/admin/zones', data) as Zone
  revalidatePath('/dashboard/zones')
  return res
}

export async function updateZone(id: number, data: UpdateZoneData) {
  const res = await deliveryApi.put(`/api/admin/zones/${id}`, data) as Zone
  revalidatePath('/dashboard/zones')
  revalidatePath(`/dashboard/zones/${id}`)
  return res
}

export async function deleteZone(id: number) {
  const res = await deliveryApi.delete(`/api/admin/zones/${id}`)
  revalidatePath('/dashboard/zones')
  return res
}

/* ───── Logistics Admins (companies) ───── */

export async function getLogisticsAdminsSimple() {
  const res = await deliveryApi.get('/api/admin/logistics-admins') as {
    items: Array<{ idVendedor: string; nombreEmpresa: string }>
  }
  return res.items.map((item) => ({
    id: item.idVendedor,
    name: item.nombreEmpresa,
  }))
}

/* ───── CRUD Logistics Admins ───── */

export async function getLogisticsAdmins(params?: Record<string, string>) {
  return deliveryApi.get('/api/admin/logistics-admins', params) as Promise<ListResponse<LogisticsAdmin>>
}

export async function getLogisticsAdmin(clerkUserId: string) {
  return deliveryApi.get(`/api/admin/logistics-admins/${clerkUserId}`) as Promise<LogisticsAdmin>
}

export async function createLogisticsAdmin(data: CreateLogisticsAdminData) {
  const { email, idVendedor } = data

  const client = await clerkClient()
  const { data: users } = await client.users.getUserList({ emailAddress: [email] })

  if (users.length === 0) {
    throw new Error("No se encontró ningún usuario con ese email en Clerk")
  }

  const clerkUserId = users[0].id

  const res = await deliveryApi.post('/api/admin/logistics-admins', { clerkUserId, idVendedor }) as LogisticsAdmin
  revalidatePath('/dashboard/logistics-admins')
  return res
}

export async function updateLogisticsAdmin(clerkUserId: string, data: UpdateLogisticsAdminData) {
  const res = await deliveryApi.put(`/api/admin/logistics-admins/${clerkUserId}`, data) as LogisticsAdmin
  revalidatePath('/dashboard/logistics-admins')
  revalidatePath(`/dashboard/logistics-admins/${clerkUserId}`)
  return res
}

export async function toggleLogisticsAdmin(clerkUserId: string) {
  const res = await deliveryApi.patch(`/api/admin/logistics-admins/${clerkUserId}/toggle`, {}) as ToggleResponse
  revalidatePath('/dashboard/logistics-admins')
  revalidatePath(`/dashboard/logistics-admins/${clerkUserId}`)
  return res
}

export async function deleteLogisticsAdmin(clerkUserId: string) {
  const res = await deliveryApi.delete(`/api/admin/logistics-admins/${clerkUserId}`)
  revalidatePath('/dashboard/logistics-admins')
  return res
}

/* ───── Admin Delivery (global) ───── */

export async function getDeliveryAdmins(params?: Record<string, string>) {
  return deliveryApi.get('/api/admin/delivery-admins', params) as Promise<ListResponse<AdminDelivery>>
}

export async function getDeliveryAdmin(clerkUserId: string) {
  return deliveryApi.get(`/api/admin/delivery-admins/${clerkUserId}`) as Promise<AdminDelivery>
}

export async function createDeliveryAdmin(data: CreateAdminDeliveryData) {
  const res = await deliveryApi.post('/api/admin/delivery-admins', data) as AdminDelivery & { temporaryPassword?: string }
  revalidatePath('/dashboard/delivery-admins')
  return res
}

export async function updateDeliveryAdmin(clerkUserId: string, data: UpdateAdminDeliveryData) {
  const res = await deliveryApi.put(`/api/admin/delivery-admins/${clerkUserId}`, data) as AdminDelivery
  revalidatePath('/dashboard/delivery-admins')
  revalidatePath(`/dashboard/delivery-admins/${clerkUserId}`)
  return res
}

export async function toggleDeliveryAdmin(clerkUserId: string) {
  const res = await deliveryApi.patch(`/api/admin/delivery-admins/${clerkUserId}/toggle`, {}) as ToggleResponse
  revalidatePath('/dashboard/delivery-admins')
  revalidatePath(`/dashboard/delivery-admins/${clerkUserId}`)
  return res
}

export async function deleteDeliveryAdmin(clerkUserId: string) {
  const res = await deliveryApi.delete(`/api/admin/delivery-admins/${clerkUserId}`)
  revalidatePath('/dashboard/delivery-admins')
  return res
}
