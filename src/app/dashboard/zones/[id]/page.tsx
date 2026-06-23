import { getZone } from "@/lib/actions/delivery"
import type { Zone } from "@/lib/types"
import { notFound } from "next/navigation"
import ZoneDetailClient from "@/components/delivery/ZoneDetailClient"

export const dynamic = "force-dynamic"

export default async function ZoneDetailPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const zoneId = parseInt(id, 10)

  if (isNaN(zoneId)) notFound()

  let zone: Zone | null = null
  let error: string | null = null

  try {
    zone = await getZone(zoneId)
  } catch (e) {
    error = e instanceof Error ? e.message : "Error al cargar la zona"
  }

  if (error) {
    return (
      <div className="rounded-lg border border-red-200 bg-red-50 p-6 text-sm text-red-700">
        {error}
      </div>
    )
  }

  if (!zone) notFound()

  return <ZoneDetailClient zone={zone} />
}
