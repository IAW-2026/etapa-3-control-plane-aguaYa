const PAYMENT_APP_URL = process.env.APP_PAYMENT_URL!
const API_KEY = process.env.APP_PAYMENT_API_KEY!

export type PaymentStatus = 'pending' | 'approved' | 'rejected' | 'cancelled' | 'expired'

export type PaymentItem = {
  id: string
  productId?: string
  productName: string
  productImageUrl?: string
  quantity: number
  unitPrice: number
  subtotal: number
}

export type Invoice = {
  id: string
  subtotal: number
  tax: number
  total: number
  issuedAt: string
}

export type PaymentUserStatus = 'ACTIVE' | 'SUSPENDED' | 'DELETED'

export type PaymentUser = {
  id: string
  clerkId: string
  buyerId: string
  buyerName: string
  sellerId: string
  sellerName: string
  status: PaymentUserStatus
  createdAt: string
}

export type PaymentUserListResponse = {
  items: PaymentUser[]
  total: number
  page: number
  pageCount: number
}

export type InvoicePaymentRef = {
  id: string
  orderId: string
  buyerName: string
  sellerName: string
  status: PaymentStatus
}

export type InvoiceWithPayment = Invoice & {
  payment: InvoicePaymentRef
}

export type InvoiceListResponse = {
  items: InvoiceWithPayment[]
  total: number
  page: number
  pageCount: number
}

export type Payment = {
  id: string
  orderId: string
  buyerName: string
  buyerEmail: string
  buyerAddress?: string
  sellerName: string
  amount: number
  status: PaymentStatus
  createdAt: string
  updatedAt: string
  mpPaymentId?: string
  mpPaymentMethod?: string
  mpPaymentDate?: string
  items: PaymentItem[]
  invoice?: Invoice
}

export type PaymentListResponse = {
  items: Payment[]
  total: number
  page: number
  pageCount: number
}

type RequestOptions = {
  method?: string
  body?: unknown
  params?: Record<string, string>
}

async function request(path: string, opts: RequestOptions = {}) {
  const url = new URL(path, PAYMENT_APP_URL)
  if (opts.params) {
    for (const [key, value] of Object.entries(opts.params)) {
      url.searchParams.set(key, value)
    }
  }
  const res = await fetch(url.toString(), {
    method: opts.method ?? 'GET',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${API_KEY}`,
    },
    body: opts.body ? JSON.stringify(opts.body) : undefined,
    next: { revalidate: 0 },
  })
  if (!res.ok) {
    const text = await res.text()
    throw new Error(`Payment API error ${res.status}: ${text}`)
  }
  return res.json()
}

export const paymentApi = {
  getPayments: (params: Record<string, string>): Promise<PaymentListResponse> =>
    request('/api/admin/payments', { params }),

  getPayment: (id: string): Promise<Payment> =>
    request(`/api/admin/payments/${id}`),

  updateStatus: (id: string, status: string): Promise<void> =>
    request(`/api/admin/payments/${id}/status`, { method: 'PATCH', body: { status } }),

  getUsers: (params: Record<string, string>): Promise<PaymentUserListResponse> =>
    request('/api/admin/users', { params }),

  updateUserStatus: (clerkId: string, status: string): Promise<{ ok: boolean; clerkId: string; status: string }> =>
    request(`/api/admin/users/${clerkId}/status`, { method: 'PATCH', body: { status } }),

  getInvoices: (params: Record<string, string>): Promise<InvoiceListResponse> =>
    request('/api/admin/invoices', { params }),
}
