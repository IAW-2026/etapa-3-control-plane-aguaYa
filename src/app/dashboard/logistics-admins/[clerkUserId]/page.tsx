import { getLogisticsAdmin } from "@/lib/actions/delivery"
import type { LogisticsAdmin } from "@/lib/types"
import { notFound } from "next/navigation"
import LogisticsAdminDetailClient from "@/components/delivery/LogisticsAdminDetailClient"

export const dynamic = "force-dynamic"

export default async function LogisticsAdminDetailPage({
  params,
}: {
  params: Promise<{ clerkUserId: string }>
}) {
  const { clerkUserId } = await params

  let admin: LogisticsAdmin | null = null
  let error: string | null = null

  try {
    admin = await getLogisticsAdmin(clerkUserId)
  } catch (e) {
    error = e instanceof Error ? e.message : "Error al cargar el administrador"
  }

  if (error) {
    return (
      <div className="rounded-lg border border-red-200 bg-red-50 p-6 text-sm text-red-700">
        {error}
      </div>
    )
  }

  if (!admin) notFound()

  return <LogisticsAdminDetailClient admin={admin} />
}
