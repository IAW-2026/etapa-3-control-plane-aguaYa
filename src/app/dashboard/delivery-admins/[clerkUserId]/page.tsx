import { getDeliveryAdmin } from "@/lib/actions/delivery"
import type { AdminDelivery } from "@/lib/types"
import { notFound } from "next/navigation"
import DeliveryAdminDetailClient from "@/components/delivery/DeliveryAdminDetailClient"

export const dynamic = "force-dynamic"

export default async function DeliveryAdminDetailPage({
  params,
}: {
  params: Promise<{ clerkUserId: string }>
}) {
  const { clerkUserId } = await params

  let admin: AdminDelivery | null = null
  let error: string | null = null

  try {
    admin = await getDeliveryAdmin(clerkUserId)
  } catch (e) {
    error = e instanceof Error ? e.message : "Error al cargar el administrador de delivery"
  }

  if (error) {
    return (
      <div className="rounded-lg border border-red-200 bg-red-50 p-6 text-sm text-red-700">
        {error}
      </div>
    )
  }

  if (!admin) notFound()

  return <DeliveryAdminDetailClient admin={admin} />
}
