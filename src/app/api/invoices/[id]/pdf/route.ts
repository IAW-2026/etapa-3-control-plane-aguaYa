import { NextRequest, NextResponse } from 'next/server'

const PAYMENT_APP_URL = process.env.APP_PAYMENT_URL!
const API_KEY = process.env.APP_PAYMENT_API_KEY!

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params

  const res = await fetch(`${PAYMENT_APP_URL}/api/admin/invoices/${id}/pdf`, {
    headers: { Authorization: `Bearer ${API_KEY}` },
  })

  if (!res.ok) {
    return new NextResponse('Error al obtener el PDF', { status: res.status })
  }

  const buffer = await res.arrayBuffer()

  return new NextResponse(buffer, {
    headers: {
      'Content-Type': 'application/pdf',
      'Content-Disposition': `attachment; filename="factura-${id}.pdf"`,
    },
  })
}
