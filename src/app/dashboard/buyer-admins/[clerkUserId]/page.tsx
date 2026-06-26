import { getBuyerAdmin } from "@/lib/actions/buyer-admin"
import BuyerAdminDetailClient from "@/components/buyer/BuyerAdminDetailClient"
import { notFound } from "next/navigation"

type Props = {
  params: Promise<{ clerkUserId: string }>
}

export default async function BuyerAdminDetailPage({ params }: Props) {
  const { clerkUserId } = await params
  try {
    const admin = await getBuyerAdmin(clerkUserId)
    return <BuyerAdminDetailClient admin={admin} />
  } catch {
    notFound()
  }
}
