'use server'

import { clerkClient } from '@clerk/nextjs/server'
import { revalidatePath } from 'next/cache'
import type { SellerAdmin, CreateSellerAdminData, UpdateSellerAdminData } from '@/lib/types'

function mapClerkUser(user: Awaited<ReturnType<Awaited<ReturnType<typeof clerkClient>>['users']['getUser']>>): SellerAdmin {
  return {
    clerkUserId: user.id,
    email: user.emailAddresses[0]?.emailAddress ?? '',
    nombre: user.firstName ?? null,
    telefono: (user.publicMetadata as Record<string, unknown>)?.telefono as string ?? null,
    isBlocked: !!user.banned,
    createdAt: new Date(user.createdAt).toISOString(),
  }
}

const ADMIN_SELLER_ROLE = 'admin_seller'

export async function getSellerAdmins(params?: Record<string, string>) {
  const client = await clerkClient()
  const page = Number(params?.page) || 1
  const limit = Number(params?.limit) || 10
  const q = params?.q
  const isBlocked = params?.isBlocked

  const clerkLimit = 500
  const { data: allUsers } = await client.users.getUserList({ limit: clerkLimit })

  let filtered = allUsers.filter((u) =>
    (u.publicMetadata as Record<string, unknown>)?.roles &&
    Array.isArray((u.publicMetadata as Record<string, unknown>).roles) &&
    ((u.publicMetadata as Record<string, unknown>).roles as string[]).includes(ADMIN_SELLER_ROLE)
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

export async function getSellerAdmin(clerkUserId: string) {
  const client = await clerkClient()
  const user = await client.users.getUser(clerkUserId)
  return mapClerkUser(user)
}

export async function createSellerAdmin(data: CreateSellerAdminData) {
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
        roles: [ADMIN_SELLER_ROLE],
        ...(data.telefono ? { telefono: data.telefono } : {}),
      },
    })

    revalidatePath('/dashboard/seller-admins')
    return mapClerkUser(user)
  } catch (e: unknown) {
    if (e instanceof Error) {
      console.error('[createSellerAdmin] Error:', (e as any).errors ?? e.message)
      throw new Error(`Error de Clerk: ${(e as any).errors ? JSON.stringify((e as any).errors) : e.message}`)
    }
    throw e
  }
}

export async function updateSellerAdmin(clerkUserId: string, data: UpdateSellerAdminData) {
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

  revalidatePath('/dashboard/seller-admins')
  revalidatePath(`/dashboard/seller-admins/${clerkUserId}`)
  return mapClerkUser(user)
}

export async function toggleSellerAdmin(clerkUserId: string) {
  const client = await clerkClient()
  const user = await client.users.getUser(clerkUserId)

  if (user.banned) {
    await client.users.unbanUser(clerkUserId)
  } else {
    await client.users.banUser(clerkUserId)
  }

  revalidatePath('/dashboard/seller-admins')
  revalidatePath(`/dashboard/seller-admins/${clerkUserId}`)
  return { ok: true, nuevoEstado: user.banned ? 'activo' : 'bloqueado' }
}

export async function deleteSellerAdmin(clerkUserId: string) {
  const client = await clerkClient()
  await client.users.deleteUser(clerkUserId)

  revalidatePath('/dashboard/seller-admins')
}
