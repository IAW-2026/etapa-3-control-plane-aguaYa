import type { OrderAppAdapter, AppOrder, AppOrderItem, OrderQueryParams, OrderListResponse, StatusDefinition } from './types'

type SellerRawOrder = {
  id: string
  externalId: string
  buyerName: string
  status: string
  total: number
  address?: string
  createdAt: string
  updatedAt: string
  vendor?: { name: string; id: string }
  items: Array<{
    id: string
    productName: string
    productPrice: number
    quantity: number
    product?: { id: string; name: string; price: number; image?: string }
  }>
}

type SellerRawResponse = {
  items: SellerRawOrder[]
  total: number
  pageCount: number
}

const STATUSES: StatusDefinition[] = [
  { value: 'PAID', label: 'Pagada', color: 'emerald' },
  { value: 'READY', label: 'Lista', color: 'amber' },
]

export class SellerAdapter implements OrderAppAdapter {
  readonly name: string
  readonly source = 'seller'
  private baseUrl: string
  private apiKey: string

  constructor(baseUrl: string, apiKey: string, name = 'Vendedores') {
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
          'X-API-Key': this.apiKey,
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

  private map(raw: SellerRawOrder): AppOrder {
    return {
      id: raw.id,
      externalId: raw.externalId,
      source: this.source,
      status: raw.status,
      total: raw.total,
      buyerName: raw.buyerName,
      vendorName: raw.vendor?.name,
      address: raw.address,
      createdAt: raw.createdAt,
      updatedAt: raw.updatedAt,
      items: raw.items.map((i): AppOrderItem => ({
        id: i.id,
        productName: i.productName,
        productPrice: i.productPrice,
        quantity: i.quantity,
        image: i.product?.image,
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
    const raw: SellerRawResponse = await this.request('/api/admin/orders', { params: qp })
    return {
      items: raw.items.map((o) => this.map(o)),
      total: raw.total,
      pageCount: raw.pageCount,
    }
  }

  async getOrder(id: string): Promise<AppOrder> {
    const raw: SellerRawOrder & { vendor?: { name: string; id: string } } = await this.request(`/api/admin/orders/${id}`)
    return this.map(raw)
  }

  async updateOrderStatus(id: string, status: string): Promise<AppOrder> {
    const raw: { order: SellerRawOrder } = await this.request(`/api/admin/orders/${id}/status`, {
      method: 'PATCH',
      body: { status },
    })
    return this.map(raw.order)
  }

  getStatuses(): StatusDefinition[] {
    return STATUSES
  }

  getValidTransitions(status: string): StatusDefinition[] {
    if (status === 'PAID') return STATUSES.filter((s) => s.value === 'READY')
    if (status === 'READY') return STATUSES.filter((s) => s.value === 'PAID')
    return []
  }
}
