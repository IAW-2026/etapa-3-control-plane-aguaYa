'use server'

import { feedbackApi } from '@/lib/api-feedback'
import { revalidatePath } from 'next/cache'

export type ResenaItem = {
  id_resena: number
  id_pedido: string
  id_usuario: string
  id_vendedor: string
  estrellas: number
  comentario: string | null
  foto: string | null
  fecha: string
}

export type ValoracionItem = {
  id_valoracion: number
  id_usuario: string
  comentario: string
  estrellas: number
  fecha: string
}

type FeedbackListResponse<T> = {
  success: boolean
  data: {
    items: T[]
    total: number
    page: number
    totalPages: number
  }
}

export async function getResenas(params?: {
  page?: number
  limit?: number
  estrellas?: number
}) {
  const qp: Record<string, string> = {}
  if (params?.page) qp.page = String(params.page)
  if (params?.limit) qp.limit = String(params.limit)
  if (params?.estrellas) qp.estrellas = String(params.estrellas)

  const res: FeedbackListResponse<ResenaItem> = await feedbackApi.get('/api/analytics/reviews', qp)
  return res.data
}

export async function getValoraciones(params?: {
  page?: number
  limit?: number
  estrellas?: number
}) {
  const qp: Record<string, string> = {}
  if (params?.page) qp.page = String(params.page)
  if (params?.limit) qp.limit = String(params.limit)
  if (params?.estrellas) qp.estrellas = String(params.estrellas)

  const res: FeedbackListResponse<ValoracionItem> = await feedbackApi.get('/api/analytics/valoraciones', qp)
  return res.data
}

export async function deleteResena(id: number) {
  await feedbackApi.delete(`/api/control/reviews/${id}`)
  revalidatePath('/dashboard/feedback/resenas')
}

export async function deleteValoracion(id: number) {
  await feedbackApi.delete(`/api/control/valoraciones/${id}`)
  revalidatePath('/dashboard/feedback/valoraciones')
}
