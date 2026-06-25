import { getSellerAdmin } from "@/lib/actions/seller-admin"
import type { SellerAdmin } from "@/lib/types"
import SellerAdminDetailClient from "@/components/seller/SellerAdminDetailClient"
import { notFound } from "next/navigation"

export const dynamic = "force-dynamic"

export default async function SellerAdminDetailPage({
  params,
}: {
  params: Promise<{ clerkUserId: string }>
}) {
  const { clerkUserId } = await params

  let admin: SellerAdmin | null = null
  let error: string | null = null

  try {
    admin = await getSellerAdmin(clerkUserId)
  } catch (e) {
    error = e instanceof Error ? e.message : "Error al cargar el administrador"
  }

  if (error) {
    return (
      <div className="m-8 rounded-xl border border-red-200/60 bg-white/80 p-6 text-sm text-red-700 shadow-lg shadow-black/5 backdrop-blur-xl dark:border-red-800/60 dark:bg-slate-900/80 dark:text-red-400">
        {error}
      </div>
    )
  }

  if (!admin) notFound()

  return <SellerAdminDetailClient admin={admin} />
}
