const FEEDBACK_APP_URL = process.env.FEEDBACK_APP_URL!
const API_KEY = process.env.FEEDBACK_API_KEY!

type RequestOptions = {
  method?: string
  body?: unknown
  params?: Record<string, string>
}

async function request(path: string, opts: RequestOptions = {}) {
  let url
  try {
    url = new URL(path, FEEDBACK_APP_URL)
  } catch {
    throw new Error(`Error interno: URL inválida (${path})`)
  }
  if (opts.params) {
    for (const [key, value] of Object.entries(opts.params)) {
      url.searchParams.set(key, value)
    }
  }

  let response
  try {
    response = await fetch(url.toString(), {
      method: opts.method ?? "GET",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": API_KEY,
      },
      body: opts.body ? JSON.stringify(opts.body) : undefined,
      next: { revalidate: 0 },
    })
  } catch {
    throw new Error(`No se puede conectar con la app de Feedback. Verificá que el servicio esté corriendo en ${FEEDBACK_APP_URL}`)
  }

  const bodyText = await response.text()
  if (!response.ok) {
    throw new Error(`Error ${response.status} de Feedback: ${bodyText.slice(0, 200)}`)
  }

  try {
    return JSON.parse(bodyText)
  } catch {
    if (bodyText.startsWith('<!DOCTYPE') || bodyText.startsWith('<html')) {
      throw new Error(`No se puede conectar con la app de Feedback. Verificá que el servicio esté corriendo en ${FEEDBACK_APP_URL}`)
    }
    throw new Error(`Respuesta inválida de Feedback: ${bodyText.slice(0, 100)}`)
  }
}

export const feedbackApi = {
  get: (path: string, params?: Record<string, string>) =>
    request(path, { params }),

  delete: (path: string) =>
    request(path, { method: "DELETE" }),
}
