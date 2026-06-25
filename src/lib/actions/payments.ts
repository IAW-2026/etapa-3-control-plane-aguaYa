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
