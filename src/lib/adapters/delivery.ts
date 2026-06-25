import type { OrderAppAdapter, AppOrder, AppOrderItem, OrderQueryParams, OrderListResponse, StatusDefinition } from './types'

type DeliveryRawOrder = {
  idPedido: number
  estado: string
  cliente: string
  direccion: string
  telefono?: string
  cantBidones: number
  zona: string
  idVendedor: string
  idPedidoExterno?: number
  choferAsignado?: { idChofer: number; nombre: string; telefono?: string; vehiculo?: { patente: string; tipo: string } }
  createdAt: string
  assignedAt?: string
  updatedAt?: string
}

type DeliveryRawResponse = {
  items: DeliveryRawOrder[]
  total: number
  page: number
  pageCount: number
}

const STATUSES: StatusDefinition[] = [
  { value: 'ready', label: 'Listo', color: 'amber' },
  { value: 'asignado', label: 'Asignado', color: 'blue' },
  { value: 'en_camino', label: 'En Camino', color: 'purple' },
  { value: 'entregado', label: 'Entregado', color: 'emerald' },
  { value: 'cancelado', label: 'Cancelado', color: 'red' },
  { value: 'revision', label: 'Revisión', color: 'cyan' },
]

const TRANSITIONS: Record<string, string[]> = {
  ready: ['asignado'],
  asignado: ['en_camino', 'cancelado'],
  en_camino: ['entregado', 'revision', 'cancelado'],
  entregado: [],
  cancelado: [],
  revision: ['en_camino', 'cancelado'],
}

export class DeliveryAdapter implements OrderAppAdapter {
  readonly name: string
  readonly source = 'delivery'
  private baseUrl: string
  private apiKey: string

  constructor(baseUrl: string, apiKey: string, name = 'Delivery') {
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
      throw new Error(`Delivery API error ${res.status}: ${text}`)
    }
    return res.json()
  }

  private map(raw: DeliveryRawOrder): AppOrder {
    return {
      id: String(raw.idPedido),
      externalId: raw.idPedidoExterno ? String(raw.idPedidoExterno) : undefined,
      source: this.source,
      status: raw.estado,
      total: raw.cantBidones * 1, // precio por bidón — el CP no tiene el precio, se usa cantidad como referencia
      buyerName: raw.cliente,
      vendorName: raw.idVendedor,
      address: raw.direccion,
      createdAt: raw.createdAt,
      updatedAt: raw.updatedAt ?? raw.assignedAt,
      items: [
        {
          id: String(raw.idPedido),
          productName: `Delivery (${raw.cantBidones} bidón${raw.cantBidones !== 1 ? 'es' : ''})`,
          productPrice: 0,
          quantity: raw.cantBidones,
        },
      ],
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
    const raw: DeliveryRawResponse = await this.request('/api/admin/deliveries', { params: qp })
    return {
      items: raw.items.map((o) => this.map(o)),
      total: raw.total,
      pageCount: raw.pageCount,
    }
  }

  async getOrder(id: string): Promise<AppOrder> {
    const raw: DeliveryRawOrder = await this.request(`/api/admin/deliveries/${id}`)
    return this.map(raw)
  }

  async updateOrderStatus(id: string, status: string): Promise<AppOrder> {
    const raw: { ok: boolean } = await this.request(`/api/admin/deliveries/${id}/status`, {
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
