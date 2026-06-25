"use client"

import { useState, useEffect, useCallback } from "react"
import { useRouter } from "next/navigation"
import type { Buyer, BuyerAddress, BuyerOrder, Favorite } from "@/lib/types"
import { getBuyer, getBuyerAddresses, getBuyerOrders, getBuyerFavorites, toggleBuyer, deleteBuyer, createAddress, deleteAddress, deleteBuyerOrder, addFavorite, removeFavorite } from "@/lib/actions/buyer"
import { getVendorsSimple } from "@/lib/actions/vendor"
import { useToast } from "@/components/ui/ToastProvider"
import ConfirmDialog from "@/components/ui/ConfirmDialog"
import CreateBuyerOrderModal from "./CreateBuyerOrderModal"
import { Loader2, MapPin, ShoppingCart, Heart, Info, Plus, Trash2, ArrowLeft } from "lucide-react"
import Link from "next/link"

type Props = {
  buyerId: string
}

type Tab = "info" | "addresses" | "orders" | "favorites"

export default function BuyerDetailClient({ buyerId }: Props) {
  const router = useRouter()
  const { showToast } = useToast()

  const [buyer, setBuyer] = useState<Buyer | null>(null)
  const [addresses, setAddresses] = useState<BuyerAddress[]>([])
  const [orders, setOrders] = useState<BuyerOrder[]>([])
  const [favorites, setFavorites] = useState<Favorite[]>([])
  const [vendors, setVendors] = useState<Array<{ id: string; name: string }>>([])
  const [loading, setLoading] = useState(true)
  const [tab, setTab] = useState<Tab>("info")
  const [busy, setBusy] = useState(false)

  const [showNewAddress, setShowNewAddress] = useState(false)
  const [newStreet, setNewStreet] = useState("")
  const [newCity, setNewCity] = useState("")
  const [newZip, setNewZip] = useState("")

  const [showAddFavorite, setShowAddFavorite] = useState(false)
  const [selectedVendor, setSelectedVendor] = useState("")

  const [confirmDelete, setConfirmDelete] = useState<{ type: "buyer" | "order" | "address"; id: string } | null>(null)
  const [loadErrors, setLoadErrors] = useState<string[]>([])
  const [showCreateOrder, setShowCreateOrder] = useState(false)

  const load = useCallback(async () => {
    setLoading(true)
    setLoadErrors([])

    const [bResult, addrResult, ordResult, favResult] = await Promise.allSettled([
      getBuyer(buyerId),
      getBuyerAddresses(buyerId),
      getBuyerOrders(buyerId),
      getBuyerFavorites(buyerId),
    ])

    if (bResult.status === 'fulfilled') {
      setBuyer(bResult.value)
    } else {
      showToast("error", "Error al cargar datos del comprador")
      setLoading(false)
      return
    }

    const failed: string[] = []

    if (addrResult.status === 'fulfilled') {
      setAddresses(addrResult.value)
    } else {
      setAddresses([])
      failed.push("Direcciones")
    }

    if (ordResult.status === 'fulfilled') {
      setOrders(ordResult.value)
    } else {
      setOrders([])
      failed.push("Órdenes")
    }

    if (favResult.status === 'fulfilled') {
      setFavorites(favResult.value)
    } else {
      setFavorites([])
      failed.push("Favoritos")
    }

    if (failed.length > 0) {
      setLoadErrors(failed)
    }

    try {
      setVendors(await getVendorsSimple())
    } catch {
      setVendors([])
    }

    setLoading(false)
  }, [buyerId, showToast])

  useEffect(() => { load() }, [buyerId])

  if (loading || !buyer) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="h-6 w-6 animate-spin text-slate-400" />
      </div>
    )
  }

  async function handleToggle() {
    if (!buyer) return
    setBusy(true)
    try {
      await toggleBuyer(buyerId)
      showToast("success", `Comprador ${buyer.is_active ? "bloqueado" : "activado"}`)
      load()
    } catch {
      showToast("error", "Error al cambiar estado")
    } finally {
      setBusy(false)
    }
  }

  async function handleDeleteBuyer() {
    setBusy(true)
    try {
      await deleteBuyer(buyerId)
      showToast("success", "Comprador eliminado")
      router.push("/dashboard/buyers")
    } catch {
      showToast("error", "Error al eliminar comprador")
    } finally {
      setBusy(false)
      setConfirmDelete(null)
    }
  }

  async function handleCreateAddress(e: React.FormEvent) {
    e.preventDefault()
    if (!newStreet || !newCity || !newZip) return
    setBusy(true)
    try {
      await createAddress(buyerId, { street: newStreet, city: newCity, zip: newZip })
      showToast("success", "Dirección agregada")
      setNewStreet("")
      setNewCity("")
      setNewZip("")
      setShowNewAddress(false)
      load()
    } catch {
      showToast("error", "Error al crear dirección")
    } finally {
      setBusy(false)
    }
  }

  async function handleDeleteAddress() {
    if (!confirmDelete || confirmDelete.type !== "address") return
    setBusy(true)
    try {
      await deleteAddress(confirmDelete.id, buyerId)
      showToast("success", "Dirección eliminada")
      load()
    } catch {
      showToast("error", "Error al eliminar dirección")
    } finally {
      setBusy(false)
      setConfirmDelete(null)
    }
  }

  async function handleDeleteOrder() {
    if (!confirmDelete || confirmDelete.type !== "order") return
    setBusy(true)
    try {
      await deleteBuyerOrder(confirmDelete.id, buyerId)
      showToast("success", "Orden eliminada")
      load()
    } catch {
      showToast("error", "Error al eliminar orden")
    } finally {
      setBusy(false)
      setConfirmDelete(null)
    }
  }

  async function handleAddFavorite(e: React.FormEvent) {
    e.preventDefault()
    if (!selectedVendor) return
    setBusy(true)
    try {
      await addFavorite(buyerId, selectedVendor)
      showToast("success", "Favorito agregado")
      setSelectedVendor("")
      setShowAddFavorite(false)
      load()
    } catch {
      showToast("error", "Error al agregar favorito")
    } finally {
      setBusy(false)
    }
  }

  async function handleRemoveFavorite(vendorId: string) {
    setBusy(true)
    try {
      await removeFavorite(buyerId, vendorId)
      showToast("success", "Favorito eliminado")
      load()
    } catch {
      showToast("error", "Error al eliminar favorito")
    } finally {
      setBusy(false)
    }
  }

  const tabs: { key: Tab; label: string; icon: typeof Info }[] = [
    { key: "info", label: "Información", icon: Info },
    { key: "addresses", label: "Direcciones", icon: MapPin },
    { key: "orders", label: "Órdenes", icon: ShoppingCart },
    { key: "favorites", label: "Favoritos", icon: Heart },
  ]

  return (
    <div>
      <div className="mb-6 flex items-center gap-3">
        <Link
          href="/dashboard/buyers"
          className="rounded-lg p-2 text-slate-400 hover:bg-slate-100 hover:text-slate-600 dark:hover:bg-slate-700"
        >
          <ArrowLeft className="h-5 w-5" />
        </Link>
        <div>
          <p className="text-sm font-semibold uppercase tracking-[0.24em] text-sky-700 dark:text-sky-400">Buyer App</p>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-100">{buyer.name || buyer.mail || "Comprador"}</h1>
        </div>
      </div>

      {loadErrors.length > 0 && (
        <div className="mb-6 rounded-lg border border-amber-200 bg-amber-50 p-3 text-sm text-amber-700 dark:border-amber-800/40 dark:bg-amber-900/20 dark:text-amber-400">
          No se pudieron cargar: {loadErrors.join(", ")}.
        </div>
      )}

      <div className="mb-6 flex gap-1 rounded-xl bg-linear-to-br from-slate-100/70 to-slate-200/50 p-1 shadow-lg shadow-black/5 backdrop-blur-xl dark:from-slate-800/60 dark:to-slate-800/40">
        {tabs.map((t) => {
          const Icon = t.icon
          return (
            <button
              key={t.key}
              type="button"
              onClick={() => setTab(t.key)}
              className={`flex flex-1 items-center justify-center gap-2 rounded-lg px-4 py-2 text-sm font-medium transition-all ${
                tab === t.key
                  ? "bg-linear-to-br from-white/60 to-slate-100/60 text-slate-900 shadow-sm backdrop-blur-sm dark:from-slate-700 dark:to-slate-600 dark:text-white"
                  : "text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200"
              }`}
            >
              <Icon className="h-4 w-4" />
              {t.label}
            </button>
          )
        })}
      </div>

      <div className="rounded-xl border border-white/30 bg-gradient-to-br from-white/30 to-slate-100/30 p-6 shadow-lg shadow-black/5 backdrop-blur-xl dark:border-slate-700/40 dark:from-slate-900/40 dark:to-slate-800/40">
        {tab === "info" && (
          <div className="space-y-4 text-sm">
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div>
                <p className="text-xs font-medium text-slate-500 dark:text-slate-400">Buyer ID</p>
                <p className="mt-1 font-mono text-slate-900 dark:text-slate-100">{buyer.buyer_id}</p>
              </div>
              <div>
                <p className="text-xs font-medium text-slate-500 dark:text-slate-400">User ID (Clerk)</p>
                <p className="mt-1 font-mono text-slate-900 dark:text-slate-100">{buyer.user_id}</p>
              </div>
              <div>
                <p className="text-xs font-medium text-slate-500 dark:text-slate-400">Email</p>
                <p className="mt-1 text-slate-900 dark:text-slate-100">{buyer.mail}</p>
              </div>
              <div>
                <p className="text-xs font-medium text-slate-500 dark:text-slate-400">Teléfono</p>
                <p className="mt-1 text-slate-900 dark:text-slate-100">{buyer.phone_numbers || "—"}</p>
              </div>
              <div>
                <p className="text-xs font-medium text-slate-500 dark:text-slate-400">Estado</p>
                <span className={`mt-1 inline-flex rounded-full px-2.5 py-0.5 text-xs font-medium ${
                  buyer.is_active
                    ? "bg-emerald-100 text-emerald-700"
                    : "bg-red-100 text-red-700"
                }`}>
                  {buyer.is_active ? "Activo" : "Inactivo"}
                </span>
              </div>
            </div>
            <div className="flex gap-2 border-t border-white/20 pt-4 dark:border-slate-700/30">
              <button
                type="button"
                onClick={handleToggle}
                disabled={busy}
                className={`rounded-lg px-4 py-2 text-sm text-white shadow-lg shadow-black/5 backdrop-blur-xl transition-colors disabled:opacity-50 ${
                  buyer.is_active
                    ? "bg-amber-600 hover:bg-amber-700"
                    : "bg-emerald-600 hover:bg-emerald-700"
                }`}
              >
                {busy ? "Procesando..." : buyer.is_active ? "Bloquear" : "Activar"}
              </button>
              <button
                type="button"
                onClick={() => setConfirmDelete({ type: "buyer", id: buyerId })}
                disabled={busy}
                className="rounded-lg bg-red-600 px-4 py-2 text-sm text-white shadow-lg shadow-black/5 backdrop-blur-xl transition-colors hover:bg-red-700 disabled:opacity-50"
              >
                Eliminar
              </button>
            </div>
          </div>
        )}

        {tab === "addresses" && (
          <div className="space-y-4 text-sm">
            <div className="flex items-center justify-between">
              <p className="text-xs font-medium text-slate-500 dark:text-slate-400">
                {addresses.length} dirección{addresses.length !== 1 ? "es" : ""}
              </p>
              <button
                type="button"
                onClick={() => setShowNewAddress(true)}
                className="flex items-center gap-1 rounded-lg bg-blue-600 px-3 py-1.5 text-xs text-white shadow-lg shadow-black/5 transition-colors hover:bg-blue-700"
              >
                <Plus className="h-3.5 w-3.5" />
                Agregar
              </button>
            </div>

            {showNewAddress && (
              <form onSubmit={handleCreateAddress} className="rounded-lg border border-white/20 bg-white/30 p-4 space-y-3 dark:border-slate-700/30 dark:bg-slate-800/30">
                <input
                  type="text"
                  value={newStreet}
                  onChange={(e) => setNewStreet(e.target.value)}
                  required
                  placeholder="Calle y número"
                  className="w-full rounded-lg border border-white/30 bg-gradient-to-br from-white/30 to-slate-100/30 px-3 py-2 text-slate-900 shadow-lg shadow-black/5 backdrop-blur-xl focus:border-blue-500/50 focus:outline-none focus:ring-2 focus:ring-blue-500/20 dark:border-slate-700/40 dark:from-slate-900/40 dark:to-slate-800/40 dark:text-slate-100"
                />
                <div className="grid grid-cols-2 gap-2">
                  <input
                    type="text"
                    value={newCity}
                    onChange={(e) => setNewCity(e.target.value)}
                    required
                    placeholder="Ciudad"
                    className="w-full rounded-lg border border-white/30 bg-gradient-to-br from-white/30 to-slate-100/30 px-3 py-2 text-slate-900 shadow-lg shadow-black/5 backdrop-blur-xl focus:border-blue-500/50 focus:outline-none focus:ring-2 focus:ring-blue-500/20 dark:border-slate-700/40 dark:from-slate-900/40 dark:to-slate-800/40 dark:text-slate-100"
                  />
                  <input
                    type="text"
                    value={newZip}
                    onChange={(e) => setNewZip(e.target.value)}
                    required
                    placeholder="Código postal"
                    className="w-full rounded-lg border border-white/30 bg-gradient-to-br from-white/30 to-slate-100/30 px-3 py-2 text-slate-900 shadow-lg shadow-black/5 backdrop-blur-xl focus:border-blue-500/50 focus:outline-none focus:ring-2 focus:ring-blue-500/20 dark:border-slate-700/40 dark:from-slate-900/40 dark:to-slate-800/40 dark:text-slate-100"
                  />
                </div>
                <div className="flex justify-end gap-2">
                  <button
                    type="button"
                    onClick={() => setShowNewAddress(false)}
                    className="rounded-lg border border-white/30 bg-gradient-to-br from-white/30 to-slate-100/30 px-3 py-1.5 text-xs text-slate-600 shadow-lg shadow-black/5 backdrop-blur-xl transition-colors hover:bg-white/40 dark:border-slate-700/40 dark:from-slate-900/40 dark:to-slate-800/40 dark:text-slate-400"
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    disabled={busy || !newStreet || !newCity || !newZip}
                    className="flex items-center gap-1 rounded-lg bg-blue-600 px-3 py-1.5 text-xs text-white shadow-lg shadow-black/5 transition-colors hover:bg-blue-700 disabled:opacity-50"
                  >
                    {busy && <Loader2 className="h-3 w-3 animate-spin" />}
                    Guardar
                  </button>
                </div>
              </form>
            )}

            {addresses.length === 0 && !showNewAddress && (
              <p className="py-6 text-center text-slate-400">Sin direcciones registradas</p>
            )}
            {addresses.map((addr) => (
              <div key={addr.id} className="flex items-center justify-between rounded-lg border border-white/20 bg-white/30 p-3 dark:border-slate-700/30 dark:bg-slate-800/30">
                <div>
                  <p className="font-medium text-slate-900 dark:text-slate-100">{addr.street}</p>
                  <p className="text-xs text-slate-500">{addr.city} — {addr.zip}</p>
                </div>
                <button
                  type="button"
                  onClick={() => setConfirmDelete({ type: "address", id: addr.id })}
                  className="rounded-lg p-1.5 text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20"
                  title="Eliminar dirección"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            ))}
          </div>
        )}

        {tab === "orders" && (
          <div className="space-y-4 text-sm">
            <div className="flex items-center justify-between">
              <p className="text-xs font-medium text-slate-500 dark:text-slate-400">
                {orders.length} orden{orders.length !== 1 ? "es" : ""}
              </p>
              <button
                type="button"
                onClick={() => setShowCreateOrder(true)}
                className="flex items-center gap-1 rounded-lg bg-blue-600 px-3 py-1.5 text-xs text-white shadow-lg shadow-black/5 transition-colors hover:bg-blue-700"
              >
                <Plus className="h-3.5 w-3.5" />
                Nueva Orden
              </button>
            </div>
            {orders.length === 0 && (
              <p className="py-6 text-center text-slate-400">Sin órdenes registradas</p>
            )}
            {orders.length > 0 && (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-white/20 text-left text-xs font-medium uppercase tracking-wider text-slate-500 dark:border-slate-700/30 dark:text-slate-400">
                      <th className="pb-3 pr-4">Order ID</th>
                      <th className="pb-3 pr-4">Vendor</th>
                      <th className="pb-3 pr-4">Total</th>
                      <th className="pb-3 pr-4">Estado</th>
                      <th className="pb-3 pr-4">Fecha</th>
                      <th className="pb-3">Acción</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/10 dark:divide-slate-700/20">
                    {orders.map((o) => (
                      <tr key={o.order_id} className="transition-colors hover:bg-white/20 dark:hover:bg-white/5">
                        <td className="py-3 pr-4 font-mono text-xs text-slate-600 dark:text-slate-400">
                          {o.order_id.slice(0, 8)}...
                        </td>
                        <td className="py-3 pr-4 text-slate-700 dark:text-slate-300">{o.vendor_id}</td>
                        <td className="py-3 pr-4 text-slate-700 dark:text-slate-300">${o.total.toLocaleString("es-AR")}</td>
                        <td className="py-3 pr-4">
                          <span className={`inline-flex rounded-full px-2 py-0.5 text-xs font-medium ${
                            o.status === "DELIVERED" ? "bg-emerald-100 text-emerald-700" :
                            o.status === "CANCELLED" ? "bg-red-100 text-red-700" :
                            o.status === "PAID" ? "bg-emerald-100 text-emerald-700" :
                            o.status === "IN_DELIVERY" ? "bg-blue-100 text-blue-700" :
                            o.status === "IN_REVISION" ? "bg-purple-100 text-purple-700" :
                            o.status === "READY" ? "bg-amber-100 text-amber-700" :
                            "bg-slate-100 text-slate-700"
                          }`}>
                            {o.status}
                          </span>
                        </td>
                        <td className="py-3 pr-4 text-xs text-slate-500 whitespace-nowrap">
                          {new Date(o.created_at).toLocaleDateString("es-AR")}
                        </td>
                        <td className="py-3">
                          <button
                            type="button"
                            onClick={() => setConfirmDelete({ type: "order", id: o.order_id })}
                            className="rounded-lg p-1.5 text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20"
                            title="Eliminar orden"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {tab === "favorites" && (
          <div className="space-y-4 text-sm">
            <div className="flex items-center justify-between">
              <p className="text-xs font-medium text-slate-500 dark:text-slate-400">
                {favorites.length} favorito{favorites.length !== 1 ? "s" : ""}
              </p>
              <button
                type="button"
                onClick={() => setShowAddFavorite(true)}
                className="flex items-center gap-1 rounded-lg bg-blue-600 px-3 py-1.5 text-xs text-white shadow-lg shadow-black/5 transition-colors hover:bg-blue-700"
              >
                <Plus className="h-3.5 w-3.5" />
                Agregar
              </button>
            </div>

            {showAddFavorite && (
              <form onSubmit={handleAddFavorite} className="flex items-end gap-2 rounded-lg border border-white/20 bg-white/30 p-4 dark:border-slate-700/30 dark:bg-slate-800/30">
                <div className="flex-1">
                  <label className="mb-1 block text-xs font-medium text-slate-500 dark:text-slate-400">Vendedor</label>
                  <select
                    value={selectedVendor}
                    onChange={(e) => setSelectedVendor(e.target.value)}
                    required
                    className="w-full rounded-lg border border-white/30 bg-gradient-to-br from-white/30 to-slate-100/30 px-3 py-2 text-sm text-slate-900 shadow-lg shadow-black/5 backdrop-blur-xl focus:border-blue-500/50 focus:outline-none focus:ring-2 focus:ring-blue-500/20 dark:border-slate-700/40 dark:from-slate-900/40 dark:to-slate-800/40 dark:text-slate-100"
                  >
                    <option value="">Seleccionar vendedor</option>
                    {vendors.map((v) => (
                      <option key={v.id} value={v.id}>{v.name}</option>
                    ))}
                  </select>
                </div>
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => setShowAddFavorite(false)}
                    className="rounded-lg border border-white/30 bg-gradient-to-br from-white/30 to-slate-100/30 px-3 py-2 text-xs text-slate-600 shadow-lg shadow-black/5 backdrop-blur-xl transition-colors hover:bg-white/40 dark:border-slate-700/40 dark:from-slate-900/40 dark:to-slate-800/40 dark:text-slate-400"
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    disabled={busy || !selectedVendor}
                    className="flex items-center gap-1 rounded-lg bg-blue-600 px-3 py-2 text-xs text-white shadow-lg shadow-black/5 transition-colors hover:bg-blue-700 disabled:opacity-50"
                  >
                    {busy && <Loader2 className="h-3 w-3 animate-spin" />}
                    Guardar
                  </button>
                </div>
              </form>
            )}

            {favorites.length === 0 && !showAddFavorite && (
              <p className="py-6 text-center text-slate-400">Sin favoritos</p>
            )}
            {favorites.map((fav) => {
              const vendor = vendors.find((v) => v.id === fav.vendor_id)
              return (
                <div key={`${fav.buyer_id}-${fav.vendor_id}`} className="flex items-center justify-between rounded-lg border border-white/20 bg-white/30 p-3 dark:border-slate-700/30 dark:bg-slate-800/30">
                  <div>
                    <p className="font-medium text-slate-900 dark:text-slate-100">
                      {vendor?.name || fav.vendor_id}
                    </p>
                    <p className="text-xs text-slate-500">ID: {fav.vendor_id}</p>
                  </div>
                  <button
                    type="button"
                    onClick={() => handleRemoveFavorite(fav.vendor_id)}
                    className="rounded-lg p-1.5 text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20"
                    title="Quitar favorito"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              )
            })}
          </div>
        )}
      </div>

      <CreateBuyerOrderModal
        isOpen={showCreateOrder}
        onClose={() => setShowCreateOrder(false)}
        onSuccess={() => { setShowCreateOrder(false); load() }}
        buyerId={buyerId}
        buyerUserId={buyer.user_id}
        vendors={vendors}
        addresses={addresses}
      />

      <ConfirmDialog
        isOpen={confirmDelete !== null}
        onClose={() => setConfirmDelete(null)}
        onConfirm={() => {
          if (confirmDelete?.type === "buyer") handleDeleteBuyer()
          else if (confirmDelete?.type === "address") handleDeleteAddress()
          else if (confirmDelete?.type === "order") handleDeleteOrder()
        }}
        title="Eliminar"
        message={
          confirmDelete?.type === "buyer" ? "¿Estás seguro de eliminar este comprador? Esta acción no se puede deshacer." :
          confirmDelete?.type === "address" ? "¿Estás seguro de eliminar esta dirección?" :
          "¿Estás seguro de eliminar esta orden?"
        }
        confirmLabel="Eliminar"
        loading={busy}
      />
    </div>
  )
}
