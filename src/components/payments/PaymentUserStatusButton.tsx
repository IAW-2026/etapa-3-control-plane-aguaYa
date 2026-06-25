'use client'

import { useState, useTransition } from 'react'
import { updatePaymentUserStatus } from '@/lib/actions/payments'
import { Power } from 'lucide-react'

export default function PaymentUserStatusButton({
  clerkId,
  currentStatus,
}: {
  clerkId: string
  currentStatus: string
}) {
  const [status, setStatus] = useState(currentStatus)
  const [pending, startTransition] = useTransition()

  const isActive = status === 'ACTIVE'

  function handleToggle() {
    const next = isActive ? 'SUSPENDED' : 'ACTIVE'
    startTransition(async () => {
      await updatePaymentUserStatus(clerkId, next)
      setStatus(next)
    })
  }

  return (
    <button
      type="button"
      onClick={handleToggle}
      disabled={pending}
      className="flex items-center gap-1.5 rounded-lg border border-slate-200 px-3 py-1.5 text-xs font-medium transition-colors disabled:opacity-50 dark:border-slate-600 hover:bg-slate-50 dark:hover:bg-slate-700"
    >
      <Power className="h-3.5 w-3.5" />
      {pending ? '...' : isActive ? 'Suspender' : 'Activar'}
    </button>
  )
}
