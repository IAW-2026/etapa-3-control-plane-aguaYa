const SELLER_APP_URL = process.env.SELLER_APP_URL!
const API_KEY = process.env.CONTROL_PLANE_API_KEY!

type RequestOptions = {
  method?: string
  body?: unknown
  params?: Record<string, string>
}

async function request(path: string, opts: RequestOptions = {}) {
  const url = new URL(path, SELLER_APP_URL)
  if (opts.params) {
    for (const [key, value] of Object.entries(opts.params)) {
      url.searchParams.set(key, value)
    }
  }

  const response = await fetch(url.toString(), {
    method: opts.method ?? "GET",
    headers: {
      "Content-Type": "application/json",
      "X-API-Key": API_KEY,
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
    request(path, { params }),

  post: (path: string, body: unknown) =>
    request(path, { method: "POST", body }),

  put: (path: string, body: unknown) =>
    request(path, { method: "PUT", body }),

  patch: (path: string, body?: unknown) =>
    request(path, { method: "PATCH", body }),

  delete: (path: string) =>
    request(path, { method: "DELETE" }),
}
