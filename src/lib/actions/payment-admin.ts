'use server'

import { clerkClient } from '@clerk/nextjs/server'
import { revalidatePath } from 'next/cache'
import type { PaymentAdmin, CreatePaymentAdminData, UpdatePaymentAdminData } from '@/lib/types'

function mapClerkUser(user: Awaited<ReturnType<Awaited<ReturnType<typeof clerkClient>>['users']['getUser']>>): PaymentAdmin {
  return {
    clerkUserId: user.id,
    email: user.emailAddresses[0]?.emailAddress ?? '',
    nombre: user.firstName ?? null,
    telefono: (user.publicMetadata as Record<string, unknown>)?.telefono as string ?? null,
    isBlocked: !!user.banned,
    createdAt: new Date(user.createdAt).toISOString(),
  }
}

const ADMIN_PAYMENT_ROLE = 'admin_payment'

export async function getPaymentAdmins(params?: Record<string, string>) {
  const client = await clerkClient()
  const page = Number(params?.page) || 1
  const limit = Number(params?.limit) || 10
  const q = params?.q
  const isBlocked = params?.isBlocked

  const { data: allUsers } = await client.users.getUserList({ limit: 500 })

  let filtered = allUsers.filter((u) => {
    const roles = (u.publicMetadata as Record<string, unknown>)?.roles
    return Array.isArray(roles) && (roles as string[]).includes(ADMIN_PAYMENT_ROLE)
  })

  if (isBlocked === 'true') filtered = filtered.filter((u) => !!u.banned)
  else if (isBlocked === 'false') filtered = filtered.filter((u) => !u.banned)

  if (q) {
    const lower = q.toLowerCase()
    filtered = filtered.filter((u) =>
      u.emailAddresses.some((e) => e.emailAddress.toLowerCase().includes(lower)) ||
      u.firstName?.toLowerCase().includes(lower)
    )
  }

  const total = filtered.length
  const pageCount = Math.max(1, Math.ceil(total / limit))
  const items = filtered.slice((page - 1) * limit, page * limit).map(mapClerkUser)

  return { items, total, pageCount }
}

export async function getPaymentAdmin(clerkUserId: string) {
  const client = await clerkClient()
  const user = await client.users.getUser(clerkUserId)
  return mapClerkUser(user)
}

export async function createPaymentAdmin(data: CreatePaymentAdminData) {
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
        roles: [ADMIN_PAYMENT_ROLE],
        ...(data.telefono ? { telefono: data.telefono } : {}),
      },
    })

    revalidatePath('/dashboard/payment-admins')
    return mapClerkUser(user)
  } catch (e: unknown) {
    if (e instanceof Error) {
      throw new Error(`Error de Clerk: ${(e as any).errors ? JSON.stringify((e as any).errors) : e.message}`)
    }
    throw e
  }
}

export async function updatePaymentAdmin(clerkUserId: string, data: UpdatePaymentAdminData) {
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

  revalidatePath('/dashboard/payment-admins')
  revalidatePath(`/dashboard/payment-admins/${clerkUserId}`)
  return mapClerkUser(user)
}

export async function togglePaymentAdmin(clerkUserId: string) {
  const client = await clerkClient()
  const user = await client.users.getUser(clerkUserId)

  if (user.banned) {
    await client.users.unbanUser(clerkUserId)
  } else {
    await client.users.banUser(clerkUserId)
  }

  revalidatePath('/dashboard/payment-admins')
  revalidatePath(`/dashboard/payment-admins/${clerkUserId}`)
  return { ok: true, nuevoEstado: user.banned ? 'activo' : 'bloqueado' }
}

export async function deletePaymentAdmin(clerkUserId: string) {
  const client = await clerkClient()
  await client.users.deleteUser(clerkUserId)
  revalidatePath('/dashboard/payment-admins')
}
