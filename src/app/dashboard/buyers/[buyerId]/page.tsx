import { getBuyer } from "@/lib/actions/buyer"
import BuyerDetailClient from "@/components/buyer/BuyerDetailClient"
import { notFound } from "next/navigation"

export const dynamic = "force-dynamic"

type Props = {
  params: Promise<{ buyerId: string }>
}

export default async function BuyerDetailPage({ params }: Props) {
  const { buyerId } = await params

  let buyer
  try {
    buyer = await getBuyer(buyerId)
  } catch {
    notFound()
  }

  if (!buyer) notFound()

  return <BuyerDetailClient buyerId={buyerId} />
}
