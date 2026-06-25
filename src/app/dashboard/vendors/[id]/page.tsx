import { sellerApi } from "@/lib/api"
import type { VendorDetailResponse } from "@/lib/types"
import { notFound } from "next/navigation"
import VendorDetailClient from "@/components/vendors/VendorDetailClient"

export const dynamic = "force-dynamic"

export default async function VendorDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params

  let vendor: VendorDetailResponse["vendor"] | null = null
  let error: string | null = null

  try {
    const res = await sellerApi.get(`/api/admin/vendors/${id}`) as VendorDetailResponse
    vendor = res.vendor
  } catch (e) {
    error = e instanceof Error ? e.message : "Error al cargar vendedor"
  }

  if (!vendor && !error) return notFound()
  if (!vendor) {
    return (
      <div className="m-8 rounded-xl border border-red-200/60 bg-white/80 p-6 text-sm text-red-700 shadow-lg shadow-black/5 backdrop-blur-xl dark:border-red-800/60 dark:bg-slate-900/80 dark:text-red-400">
        <p className="font-medium">Error al cargar el vendedor</p>
        <p className="mt-1">{error}</p>
      </div>
    )
  }

  return <VendorDetailClient vendor={vendor} />
}
