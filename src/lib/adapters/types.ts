export type StatusColor = 'emerald' | 'amber' | 'blue' | 'red' | 'slate' | 'purple' | 'cyan'

export type StatusDefinition = {
  value: string
  label: string
  color: StatusColor
}

export type AppOrderItem = {
  id: string
  productName: string
  productPrice: number
  quantity: number
  image?: string
}

export type AppOrder = {
  id: string
  externalId?: string
  source: string
  status: string
  total: number
  buyerName?: string
  vendorName?: string
  address?: string
  createdAt: string
  updatedAt?: string
  items: AppOrderItem[]
}

export type OrderQueryParams = {
  page: number
  limit: number
  q?: string
  status?: string
  from?: string
  to?: string
}

export type OrderListResponse = {
  items: AppOrder[]
  total: number
  pageCount: number
}

export interface OrderAppAdapter {
  readonly name: string
  readonly source: string
  getOrders(params: OrderQueryParams): Promise<OrderListResponse>
  getOrder(id: string): Promise<AppOrder>
  updateOrderStatus(id: string, status: string): Promise<AppOrder>
  getStatuses(): StatusDefinition[]
  getValidTransitions(status: string): StatusDefinition[]
}
