'use server'

import { deliveryApi } from '@/lib/api-delivery'
import type { Driver, Vehicle, Zone, ListResponse } from '@/lib/types'
import { revalidatePath } from 'next/cache'

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

/* ───── Vehicles ───── */

export async function getVehicles(params?: Record<string, string>) {
  return deliveryApi.get('/api/admin/vehicles', params) as Promise<ListResponse<Vehicle>>
}

/* ───── Zones ───── */

export async function getZones(params?: Record<string, string>) {
  return deliveryApi.get('/api/admin/zones', params) as Promise<ListResponse<Zone>>
}
