import type { OrderAppAdapter, AppOrder, AppOrderItem, OrderQueryParams, OrderListResponse, StatusDefinition } from './types'

type BuyerRawOrder = {
  order_id: string
  vendor_id: string
  buyer_id: string
  buyer_user_id: string
  status: string
  status_reason?: string
  total: number
  address_id?: string
  created_at: string
  updated_at: string
  items?: Array<{
    id: string
    product_id: string
    product_name: string
    product_price: number
    quantity: number
  }>
}

const STATUSES: StatusDefinition[] = [
  { value: 'PENDING', label: 'Pendiente', color: 'slate' },
  { value: 'PAID', label: 'Pagada', color: 'emerald' },
  { value: 'READY', label: 'Lista', color: 'amber' },
  { value: 'IN_DELIVERY', label: 'En Delivery', color: 'blue' },
  { value: 'DELIVERED', label: 'Entregada', color: 'emerald' },
  { value: 'IN_REVISION', label: 'En Revisión', color: 'purple' },
  { value: 'CANCELLED', label: 'Cancelada', color: 'red' },
]

const TRANSITIONS: Record<string, string[]> = {
  PENDING: ['PAID', 'CANCELLED'],
  PAID: ['READY', 'CANCELLED'],
  READY: ['IN_DELIVERY', 'CANCELLED'],
  IN_DELIVERY: ['DELIVERED', 'IN_REVISION', 'CANCELLED'],
  DELIVERED: [],
  IN_REVISION: ['IN_DELIVERY', 'CANCELLED'],
  CANCELLED: [],
}

export class BuyerAdapter implements OrderAppAdapter {
  readonly name: string
  readonly source = 'buyer'
  private baseUrl: string
  private apiKey: string

  constructor(baseUrl: string, apiKey: string, name = 'Compradores') {
    this.baseUrl = baseUrl.replace(/\/+$/, '')
    this.apiKey = apiKey
    this.name = name
  }

  private async request(path: string, opts: { method?: string; body?: unknown; params?: Record<string, string> } = {}) {
    let url
    try {
      url = new URL(path, this.baseUrl)
    } catch {
      throw new Error(`Error interno: URL inválida para ${this.name} (${path})`)
    }
    if (opts.params) {
      for (const [key, value] of Object.entries(opts.params)) {
        url.searchParams.set(key, value)
      }
    }
    let res
    try {
      res = await fetch(url.toString(), {
        method: opts.method ?? 'GET',
        headers: {
          'Content-Type': 'application/json',
          'x-api-key': this.apiKey,
        },
        body: opts.body ? JSON.stringify(opts.body) : undefined,
      })
    } catch {
      throw new Error(`No se puede conectar con la app "${this.name}". Verificá que el servicio esté corriendo en ${this.baseUrl}`)
    }
    const bodyText = await res.text()
    if (!res.ok) {
      throw new Error(`Error ${res.status} de ${this.name}: ${bodyText.slice(0, 200)}`)
    }
    try {
      return JSON.parse(bodyText)
    } catch {
      if (bodyText.startsWith('<!DOCTYPE') || bodyText.startsWith('<html')) {
        throw new Error(`No se puede conectar con la app "${this.name}". Verificá que el servicio esté corriendo en ${this.baseUrl}`)
      }
      throw new Error(`Respuesta inválida de "${this.name}": ${bodyText.slice(0, 100)}`)
    }
  }

  private map(raw: BuyerRawOrder): AppOrder {
    return {
      id: raw.order_id,
      source: this.source,
      status: raw.status,
      total: raw.total,
      buyerName: raw.buyer_user_id,
      vendorName: raw.vendor_id,
      createdAt: raw.created_at,
      updatedAt: raw.updated_at,
      items: (raw.items ?? []).map((i): AppOrderItem => ({
        id: i.id,
        productName: i.product_name,
        productPrice: i.product_price,
        quantity: i.quantity,
      })),
    }
  }

  async getOrders(params: OrderQueryParams): Promise<OrderListResponse> {
    const qp: Record<string, string> = {}
    if (params.q) qp.q = params.q
    if (params.status) qp.status = params.status
    const raw: { orders: BuyerRawOrder[] } = await this.request('/api/orders', { params: qp })
    const items = raw.orders.map((o) => this.map(o))
    const total = items.length
    const pageCount = Math.max(1, Math.ceil(total / params.limit))
    return { items, total, pageCount }
  }

  async getOrder(id: string): Promise<AppOrder> {
    const raw: { order: BuyerRawOrder } = await this.request(`/api/orders/${id}`)
    return this.map(raw.order)
  }

  async updateOrderStatus(id: string, status: string): Promise<AppOrder> {
    await this.request(`/api/orders/${id}`, {
      method: 'PATCH',
      body: { orderStatus: status },
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
