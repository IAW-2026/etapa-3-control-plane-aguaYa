import type { OrderAppAdapter } from './types'
import { SellerAdapter } from './seller'

const adapterFactories: Record<string, (url: string, apiKey: string, name: string) => OrderAppAdapter> = {
  seller: (url, apiKey, name) => new SellerAdapter(url, apiKey, name),
}

export function discoverApps(): OrderAppAdapter[] {
  const adapters: OrderAppAdapter[] = []

  for (const key of Object.keys(process.env)) {
    const match = key.match(/^APP_(\w+)_URL$/)
    if (match) {
      const id = match[1].toLowerCase()
      const url = process.env[key]!
      const apiKey = process.env[`APP_${match[1]}_API_KEY`] ?? ''
      const name = process.env[`APP_${match[1]}_NAME`] ?? id

      if (id in adapterFactories) {
        adapters.push(adapterFactories[id](url, apiKey, name))
      }
    }
  }

  return adapters
}

export function findApp(source: string): OrderAppAdapter | undefined {
  return discoverApps().find((a) => a.source === source)
}
