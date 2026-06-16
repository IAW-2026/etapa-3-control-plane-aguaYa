'use server'

import { discoverApps, findApp } from '@/lib/adapters/registry'
import type { AppOrder, OrderQueryParams, StatusDefinition } from '@/lib/adapters/types'
import { revalidatePath } from 'next/cache'

const ADMIN_PAGE_SIZE = 10
const BUFFER_MULTIPLIER = 3

export async function getMergedOrders(params: {
  page?: number
  q?: string
  status?: string
  source?: string
  from?: string
  to?: string
}) {
  const page = params.page ?? 1
  const limit = ADMIN_PAGE_SIZE * BUFFER_MULTIPLIER

  const apps = discoverApps()
  const filtered = params.source ? apps.filter((a) => a.source === params.source) : apps

  const fetchParams: OrderQueryParams = {
    page,
    limit,
    ...(params.q ? { q: params.q } : {}),
    ...(params.status ? { status: params.status } : {}),
    ...(params.from ? { from: params.from } : {}),
    ...(params.to ? { to: params.to } : {}),
  }

  const results = await Promise.allSettled(
    filtered.map((app) => app.getOrders(fetchParams).then((r) => ({ app: app.source, ...r })))
  )

  const allItems: AppOrder[] = []
  let totalItems = 0
  const errors: string[] = []

  for (const result of results) {
    if (result.status === 'fulfilled') {
      allItems.push(...result.value.items)
      totalItems += result.value.total
    } else {
      errors.push(result.reason?.message ?? 'Unknown error')
    }
  }

  allItems.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())

  const start = 0
  const end = page * ADMIN_PAGE_SIZE
  const pageItems = allItems.slice(start, end)
  const pageCount = Math.ceil(Math.max(1, totalItems) / ADMIN_PAGE_SIZE)

  return { items: pageItems, total: totalItems, pageCount, errors: errors.length > 0 ? errors : undefined }
}

export async function getOrder(source: string, id: string) {
  const app = findApp(source)
  if (!app) throw new Error(`App "${source}" not found`)
  return app.getOrder(id)
}

export async function updateOrderStatus(source: string, id: string, status: string) {
  const app = findApp(source)
  if (!app) throw new Error(`App "${source}" not found`)
  const result = await app.updateOrderStatus(id, status)
  revalidatePath('/dashboard/orders')
  return result
}

export async function getOrderAdapters() {
  return discoverApps().map((a) => ({ name: a.name, source: a.source, statuses: a.getStatuses() }))
}

export async function getValidTransitions(source: string, status: string): Promise<StatusDefinition[]> {
  const app = findApp(source)
  if (!app) return []
  return app.getValidTransitions(status)
}
