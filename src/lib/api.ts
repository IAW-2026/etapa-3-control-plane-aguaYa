const SELLER_APP_URL = process.env.SELLER_APP_URL!
const SELLER_API_KEY = process.env.SELLER_API_KEY!

type RequestOptions = {
  method?: string
  body?: unknown
  params?: Record<string, string>
}

async function request(baseUrl: string, apiKey: string, path: string, opts: RequestOptions = {}) {
  const url = new URL(path, baseUrl)
  if (opts.params) {
    for (const [key, value] of Object.entries(opts.params)) {
      url.searchParams.set(key, value)
    }
  }

  const response = await fetch(url.toString(), {
    method: opts.method ?? "GET",
    headers: {
      "Content-Type": "application/json",
      "X-API-Key": apiKey,
    },
    body: opts.body ? JSON.stringify(opts.body) : undefined,
    next: { revalidate: 0 },
  })

  if (!response.ok) {
    const error = await response.text()
    throw new Error(`API error ${response.status}: ${error}`)
  }

  return response.json()
}

export const sellerApi = {
  get: (path: string, params?: Record<string, string>) =>
    request(SELLER_APP_URL, SELLER_API_KEY, path, { params }),

  post: (path: string, body: unknown) =>
    request(SELLER_APP_URL, SELLER_API_KEY, path, { method: "POST", body }),

  put: (path: string, body: unknown) =>
    request(SELLER_APP_URL, SELLER_API_KEY, path, { method: "PUT", body }),

  delete: (path: string) =>
    request(SELLER_APP_URL, SELLER_API_KEY, path, { method: "DELETE" }),
}
