import { getDriver } from "@/lib/actions/delivery"
import type { Driver } from "@/lib/types"
import { notFound } from "next/navigation"
import DriverDetailClient from "@/components/delivery/DriverDetailClient"

export const dynamic = "force-dynamic"

export default async function DriverDetailPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const driverId = parseInt(id, 10)

  if (isNaN(driverId)) notFound()

  let driver: Driver | null = null
  let error: string | null = null

  try {
    driver = await getDriver(driverId)
  } catch (e) {
    error = e instanceof Error ? e.message : "Error al cargar el chofer"
  }

  if (error) {
    return (
      <div className="rounded-lg border border-red-200 bg-red-50 p-6 text-sm text-red-700">
        {error}
      </div>
    )
  }

  if (!driver) notFound()

  return <DriverDetailClient driver={driver} />
}
