import { getPaymentAdmin } from "@/lib/actions/payment-admin"
import type { PaymentAdmin } from "@/lib/types"
import PaymentAdminDetailClient from "@/components/payments/PaymentAdminDetailClient"
import { notFound } from "next/navigation"

export const dynamic = "force-dynamic"

export default async function PaymentAdminDetailPage({
  params,
}: {
  params: Promise<{ clerkUserId: string }>
}) {
  const { clerkUserId } = await params

  let admin: PaymentAdmin | null = null
  let error: string | null = null

  try {
    admin = await getPaymentAdmin(clerkUserId)
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

  return <PaymentAdminDetailClient admin={admin} />
}
