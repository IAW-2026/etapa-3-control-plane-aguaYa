import type { OrderAppAdapter, AppOrder, OrderQueryParams, OrderListResponse, StatusDefinition } from './types'

type PaymentRawItem = {
  id: string
  productId?: string
  productName: string
  productImageUrl?: string
  quantity: number
  unitPrice: number
  subtotal: number
}

type PaymentRaw = {
  id: string
  orderId: string
  buyerName: string
  buyerEmail: string
  buyerAddress?: string
  sellerName: string
  amount: number
  status: string
  createdAt: string
  updatedAt: string
  items: PaymentRawItem[]
}

type PaymentRawResponse = {
  items: PaymentRaw[]
  total: number
  page: number
  pageCount: number
}

const STATUSES: StatusDefinition[] = [
  { value: 'pending',   label: 'Pendiente', color: 'amber'   },
  { value: 'approved',  label: 'Aprobado',  color: 'emerald' },
  { value: 'rejected',  label: 'Rechazado', color: 'red'     },
  { value: 'cancelled', label: 'Cancelado', color: 'slate'   },
  { value: 'expired',   label: 'Expirado',  color: 'slate'   },
]

// Only pending can be manually cancelled from the control plane.
// All other transitions are driven by MercadoPago webhooks.
const TRANSITIONS: Record<string, string[]> = {
  pending:   ['cancelled'],
  approved:  [],
  rejected:  [],
  cancelled: [],
  expired:   [],
}

export class PaymentAdapter implements OrderAppAdapter {
  readonly name: string
  readonly source = 'payment'
  private baseUrl: string
  private apiKey: string

  constructor(baseUrl: string, apiKey: string, name = 'Pagos') {
    this.baseUrl = baseUrl.replace(/\/+$/, '')
    this.apiKey = apiKey
    this.name = name
  }

  private async request(path: string, opts: { method?: string; body?: unknown; params?: Record<string, string> } = {}) {
    const url = new URL(path, this.baseUrl)
    if (opts.params) {
      for (const [key, value] of Object.entries(opts.params)) {
        url.searchParams.set(key, value)
      }
    }
    const res = await fetch(url.toString(), {
      method: opts.method ?? 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${this.apiKey}`,
      },
      body: opts.body ? JSON.stringify(opts.body) : undefined,
    })
    if (!res.ok) {
      const text = await res.text()
      throw new Error(`Payment API error ${res.status}: ${text}`)
    }
    return res.json()
  }

  private map(raw: PaymentRaw): AppOrder {
    return {
      id: raw.id,
      externalId: raw.orderId,
      source: this.source,
      status: raw.status,
      total: raw.amount,
      buyerName: raw.buyerName,
      vendorName: raw.sellerName,
      address: raw.buyerAddress,
      createdAt: raw.createdAt,
      updatedAt: raw.updatedAt,
      items: raw.items.map((item) => ({
        id: item.id,
        productName: item.productName,
        productPrice: item.unitPrice,
        quantity: item.quantity,
        image: item.productImageUrl,
      })),
    }
  }

  async getOrders(params: OrderQueryParams): Promise<OrderListResponse> {
    const qp: Record<string, string> = {
      page: String(params.page),
      limit: String(params.limit),
    }
    if (params.q) qp.q = params.q
    if (params.status) qp.status = params.status
    if (params.from) qp.from = params.from
    if (params.to) qp.to = params.to
    const raw: PaymentRawResponse = await this.request('/api/admin/payments', { params: qp })
    return {
      items: raw.items.map((o) => this.map(o)),
      total: raw.total,
      pageCount: raw.pageCount,
    }
  }

  async getOrder(id: string): Promise<AppOrder> {
    const raw: PaymentRaw = await this.request(`/api/admin/payments/${id}`)
    return this.map(raw)
  }

  async updateOrderStatus(id: string, status: string): Promise<AppOrder> {
    await this.request(`/api/admin/payments/${id}/status`, {
      method: 'PATCH',
      body: { status },
    })
    return this.getOrder(id)
  }

  getStatuses(): StatusDefinition[] {
    return STATUSES
  }

  getValidTransitions(status: string): StatusDefinition[] {
    const next = TRANSITIONS[status]
    if (!next) return []
    return STATUSES.filter((s) => next.includes(s.value))
  }
}
