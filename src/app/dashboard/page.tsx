"use client"

import { useState, useEffect } from "react"
import { getVendors, getProducts } from "@/lib/actions/vendor"
import { getSellerAdmins } from "@/lib/actions/seller-admin"
import { getBuyersCount } from "@/lib/actions/buyer"
import { getPayments } from "@/lib/actions/payments"
import { getValoraciones, getResenas } from "@/lib/actions/feedback"
import { Store, Package, Shield, Users, CreditCard, Star, MessageSquare, Truck, Loader2 } from "lucide-react"

type KpiState = number | null | "loading"

export default function OverviewPage() {
  const [vendors, setVendors] = useState<KpiState>("loading")
  const [products, setProducts] = useState<KpiState>("loading")
  const [sellerAdmins, setSellerAdmins] = useState<KpiState>("loading")
  const [buyers, setBuyers] = useState<KpiState>("loading")
  const [transactions, setTransactions] = useState<KpiState>("loading")
  const [ratings, setRatings] = useState<KpiState>("loading")
  const [reviews, setReviews] = useState<KpiState>("loading")

  useEffect(() => {
    async function load() {
      const results = await Promise.allSettled([
        getVendors({ limit: "1" }).then(r => r.total ?? 0).catch(() => null),
        getProducts({ limit: "1" }).then(r => r.total ?? 0).catch(() => null),
        getSellerAdmins({ limit: "1" }).then(r => r.total ?? 0).catch(() => null),
        getBuyersCount(),
        getPayments({ page: 1 }).then(r => r.total ?? 0).catch(() => null),
        getValoraciones({ limit: 1 }).then(r => r.total ?? 0).catch(() => null),
        getResenas({ limit: 1 }).then(r => r.total ?? 0).catch(() => null),
      ])

      const values = results.map(r => r.status === "fulfilled" ? r.value : null)
      setVendors(values[0])
      setProducts(values[1])
      setSellerAdmins(values[2])
      setBuyers(values[3])
      setTransactions(values[4])
      setRatings(values[5])
      setReviews(values[6])
    }
    load()
  }, [])

  const cards = [
    { label: "Vendedores", value: vendors, icon: Store, color: "bg-blue-500" },
    { label: "Productos", value: products, icon: Package, color: "bg-emerald-500" },
    { label: "Admin Seller", value: sellerAdmins, icon: Shield, color: "bg-violet-500" },
    { label: "Compradores", value: buyers, icon: Users, color: "bg-indigo-500" },
    { label: "Transacciones", value: transactions, icon: CreditCard, color: "bg-amber-500" },
    { label: "Valoraciones", value: ratings, icon: Star, color: "bg-pink-500" },
    { label: "Reseñas", value: reviews, icon: MessageSquare, color: "bg-teal-500" },
    { label: "Choferes", value: null, icon: Truck, color: "bg-slate-400" },
  ]

  return (
    <div>
      <div className="mb-8">
        <p className="text-sm font-semibold uppercase tracking-[0.24em] text-sky-700 dark:text-sky-400">Dashboard</p>
        <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-100">Overview</h1>
      </div>

      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
        {cards.map((card) => {
          const Icon = card.icon
          return (
            <div key={card.label} className="rounded-xl border border-white/30 bg-gradient-to-br from-white/30 to-slate-100/30 p-6 shadow-lg shadow-black/5 backdrop-blur-xl dark:border-slate-700/40 dark:from-slate-900/40 dark:to-slate-800/40">
              <div className="flex items-center gap-4">
                <div className={`flex h-12 w-12 items-center justify-center rounded-lg ${card.color}`}>
                  <Icon className="h-6 w-6 text-white" />
                </div>
                <div>
                  <p className="text-sm font-medium text-slate-500 dark:text-slate-400">{card.label}</p>
                  <p className="text-2xl font-bold text-slate-900 dark:text-slate-100">
                    {card.value === "loading" ? (
                      <Loader2 className="h-5 w-5 animate-spin text-slate-300" />
                    ) : card.value === null ? (
                      "—"
                    ) : (
                      Number(card.value).toLocaleString("es-AR")
                    )}
                  </p>
                </div>
              </div>
            </div>
          )
        })}
      </div>

      <div className="mt-8 rounded-xl border border-white/30 bg-gradient-to-br from-white/30 to-slate-100/30 p-6 shadow-lg shadow-black/5 backdrop-blur-xl dark:border-slate-700/40 dark:from-slate-900/40 dark:to-slate-800/40">
        <h2 className="text-lg font-semibold text-slate-900 dark:text-slate-100">Bienvenido al Control Plane</h2>
        <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">
          Panel de administración centralizado del sistema AguaYa. Desde aquí podés gestionar
          vendedores, productos, pedidos y todas las aplicaciones del ecosistema.
        </p>
      </div>
    </div>
  )
}
