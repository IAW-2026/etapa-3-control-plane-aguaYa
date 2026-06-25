'use server'

import { clerkClient } from '@clerk/nextjs/server'
import { revalidatePath } from 'next/cache'
import type { AdminBuyer, CreateAdminBuyerData, UpdateAdminBuyerData } from '@/lib/types'

function mapClerkUser(user: Awaited<ReturnType<Awaited<ReturnType<typeof clerkClient>>['users']['getUser']>>): AdminBuyer {
  return {
    clerkUserId: user.id,
    email: user.emailAddresses[0]?.emailAddress ?? '',
    nombre: user.firstName ?? null,
    telefono: (user.publicMetadata as Record<string, unknown>)?.telefono as string ?? null,
    isBlocked: !!user.banned,
    createdAt: new Date(user.createdAt).toISOString(),
  }
}

const ADMIN_ROLE = 'admin'

export async function getBuyerAdmins(params?: Record<string, string>) {
  const client = await clerkClient()
  const page = Number(params?.page) || 1
  const limit = Number(params?.limit) || 10
  const q = params?.q
  const isBlocked = params?.isBlocked

  const clerkLimit = 500
  const { data: allUsers } = await client.users.getUserList({ limit: clerkLimit })

  let filtered = allUsers.filter((u) =>
    (u.publicMetadata as Record<string, unknown>)?.role === ADMIN_ROLE
  )

  if (isBlocked === 'true') {
    filtered = filtered.filter((u) => !!u.banned)
  } else if (isBlocked === 'false') {
    filtered = filtered.filter((u) => !u.banned)
  }

  if (q) {
    const lower = q.toLowerCase()
    filtered = filtered.filter((u) =>
      u.emailAddresses.some((e) => e.emailAddress.toLowerCase().includes(lower)) ||
      u.firstName?.toLowerCase().includes(lower)
    )
  }

  const total = filtered.length
  const pageCount = Math.max(1, Math.ceil(total / limit))
  const start = (page - 1) * limit
  const items = filtered.slice(start, start + limit).map(mapClerkUser)

  return { items, total, pageCount }
}

export async function getBuyerAdmin(clerkUserId: string) {
  const client = await clerkClient()
  const user = await client.users.getUser(clerkUserId)
  return mapClerkUser(user)
}

export async function createBuyerAdmin(data: CreateAdminBuyerData) {
  const client = await clerkClient()

  try {
    const user = await client.users.createUser({
      emailAddress: [data.email],
      password: data.password,
      firstName: data.nombre,
      skipPasswordChecks: true,
      skipPasswordRequirement: true,
    })

    await client.users.unsetPasswordCompromised(user.id)

    await client.users.updateUserMetadata(user.id, {
      publicMetadata: {
        role: ADMIN_ROLE,
        ...(data.telefono ? { telefono: data.telefono } : {}),
      },
    })

    revalidatePath('/dashboard/buyer-admins')
    return mapClerkUser(user)
  } catch (e: unknown) {
    if (e instanceof Error) {
      console.error('[createBuyerAdmin] Error:', (e as any).errors ?? e.message)
      throw new Error(`Error de Clerk: ${(e as any).errors ? JSON.stringify((e as any).errors) : e.message}`)
    }
    throw e
  }
}

export async function convertBuyerToAdmin(buyerUserId: string) {
  const client = await clerkClient()

  try {
    const user = await client.users.getUser(buyerUserId)

    const currentMeta = (user.publicMetadata as Record<string, unknown>) ?? {}

    if (currentMeta.role === ADMIN_ROLE) {
      throw new Error('El usuario ya tiene rol admin')
    }

    const updated = await client.users.updateUserMetadata(buyerUserId, {
      publicMetadata: {
        ...currentMeta,
        role: ADMIN_ROLE,
      },
    })

    revalidatePath('/dashboard/buyer-admins')
    return mapClerkUser(updated)
  } catch (e: unknown) {
    if (e instanceof Error) {
      console.error('[convertBuyerToAdmin] Error:', (e as any).errors ?? e.message)
      throw new Error(`Error al convertir: ${(e as any).errors ? JSON.stringify((e as any).errors) : e.message}`)
    }
    throw e
  }
}

export async function updateBuyerAdmin(clerkUserId: string, data: UpdateAdminBuyerData) {
  const client = await clerkClient()

  const current = await client.users.getUser(clerkUserId)
  const currentMeta = (current.publicMetadata as Record<string, unknown>) ?? {}

  const user = await client.users.updateUser(clerkUserId, {
    ...(data.nombre !== undefined ? { firstName: data.nombre } : {}),
    publicMetadata: {
      ...currentMeta,
      ...(data.telefono !== undefined ? { telefono: data.telefono } : {}),
    },
  })

  revalidatePath('/dashboard/buyer-admins')
  revalidatePath(`/dashboard/buyer-admins/${clerkUserId}`)
  return mapClerkUser(user)
}

export async function toggleBuyerAdmin(clerkUserId: string) {
  const client = await clerkClient()
  const user = await client.users.getUser(clerkUserId)

  if (user.banned) {
    await client.users.unbanUser(clerkUserId)
  } else {
    await client.users.banUser(clerkUserId)
  }

  revalidatePath('/dashboard/buyer-admins')
  revalidatePath(`/dashboard/buyer-admins/${clerkUserId}`)
  return { ok: true, nuevoEstado: user.banned ? 'activo' : 'bloqueado' }
}

export async function removeBuyerAdminRole(clerkUserId: string) {
  const client = await clerkClient()
  const user = await client.users.getUser(clerkUserId)

  const currentMeta = (user.publicMetadata as Record<string, unknown>) ?? {}
  const { role: _removed, ...rest } = currentMeta

  await client.users.updateUserMetadata(clerkUserId, {
    publicMetadata: rest,
  })

  revalidatePath('/dashboard/buyer-admins')
}
