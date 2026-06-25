'use server'

import { paymentApi } from '@/lib/api-payment'
import { revalidatePath } from 'next/cache'

export async function getPayments(params: {
  page?: number
  q?: string
  status?: string
}) {
  const qp: Record<string, string> = {
    page: String(params.page ?? 1),
    limit: '10',
  }
  if (params.q) qp.q = params.q
  if (params.status) qp.status = params.status
  return paymentApi.getPayments(qp)
}

export async function getPayment(id: string) {
  return paymentApi.getPayment(id)
}

export async function cancelPayment(id: string) {
  await paymentApi.updateStatus(id, 'cancelled')
  revalidatePath('/dashboard/pagos')
}

export async function getPaymentUsers(params: {
  page?: number
  q?: string
  status?: string
}) {
  const qp: Record<string, string> = {
    page: String(params.page ?? 1),
    limit: '10',
  }
  if (params.q) qp.q = params.q
  if (params.status) qp.status = params.status
  return paymentApi.getUsers(qp)
}

export async function updatePaymentUserStatus(clerkId: string, status: string) {
  await paymentApi.updateUserStatus(clerkId, status)
  revalidatePath('/dashboard/payment-users')
}

export async function getInvoices(params: { page?: number }) {
  const qp: Record<string, string> = {
    page: String(params.page ?? 1),
    limit: '10',
  }
  return paymentApi.getInvoices(qp)
}
