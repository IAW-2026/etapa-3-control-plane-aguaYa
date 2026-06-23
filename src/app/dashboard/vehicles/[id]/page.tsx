import { getVehicle } from "@/lib/actions/delivery"
import type { Vehicle } from "@/lib/types"
import { notFound } from "next/navigation"
import VehicleDetailClient from "@/components/delivery/VehicleDetailClient"

export const dynamic = "force-dynamic"

export default async function VehicleDetailPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const vehicleId = parseInt(id, 10)

  if (isNaN(vehicleId)) notFound()

  let vehicle: Vehicle | null = null
  let error: string | null = null

  try {
    vehicle = await getVehicle(vehicleId)
  } catch (e) {
    error = e instanceof Error ? e.message : "Error al cargar el vehículo"
  }

  if (error) {
    return (
      <div className="rounded-lg border border-red-200 bg-red-50 p-6 text-sm text-red-700">
        {error}
      </div>
    )
  }

  if (!vehicle) notFound()

  return <VehicleDetailClient vehicle={vehicle} />
}
