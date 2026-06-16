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
      <div className="rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-700">
        {error}
      </div>
    )
  }

  return <VendorDetailClient vendor={vendor} />
}
