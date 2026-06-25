"use client"

import { useState, useEffect } from "react"
import Modal from "@/components/ui/Modal"
import { createBuyerAdmin, convertBuyerToAdmin, getBuyerAdmins } from "@/lib/actions/buyer-admin"
import { getBuyers } from "@/lib/actions/buyer"
import type { Buyer } from "@/lib/types"
import { useToast } from "@/components/ui/ToastProvider"
import { Loader2, Eye, EyeOff } from "lucide-react"

type Props = {
  isOpen: boolean
  onClose: () => void
  onSuccess: () => void
}

type TabMode = "cero" | "buyer"

export default function CreateBuyerAdminModal({ isOpen, onClose, onSuccess }: Props) {
  const { showToast } = useToast()

  const [mode, setMode] = useState<TabMode>("cero")
  const [saving, setSaving] = useState(false)
  const [created, setCreated] = useState(false)

  // Desde cero
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [nombre, setNombre] = useState("")
  const [telefono, setTelefono] = useState("")
  const [showPassword, setShowPassword] = useState(false)

  // Desde buyer
  const [buyers, setBuyers] = useState<Buyer[]>([])
  const [existingAdminUserIds, setExistingAdminUserIds] = useState<Set<string>>(new Set())
  const [selectedBuyerId, setSelectedBuyerId] = useState("")
  const [selectedBuyerName, setSelectedBuyerName] = useState("")

  useEffect(() => {
    if (!isOpen) {
      reset()
      return
    }
    setCreated(false)

    Promise.all([
      getBuyers(),
      getBuyerAdmins({ limit: "500" }),
    ]).then(([buyersList, adminsRes]) => {
      setBuyers(buyersList)
      setExistingAdminUserIds(new Set(adminsRes.items.map((a) => a.clerkUserId)))
    })
  }, [isOpen])

  function reset() {
    setMode("cero")
    setEmail("")
    setPassword("")
    setNombre("")
    setTelefono("")
    setSelectedBuyerId("")
    setSelectedBuyerName("")
  }

  const availableBuyers = buyers.filter((b) => !existingAdminUserIds.has(b.user_id))

  function handleSelectBuyer(id: string) {
    setSelectedBuyerId(id)
    const buyer = buyers.find((b) => b.buyer_id === id)
    setSelectedBuyerName(buyer?.name || buyer?.mail || "")
  }

  async function handleSubmitCero(e: React.FormEvent) {
    e.preventDefault()
    if (!email || !nombre || !password) return
    setSaving(true)
    try {
      await createBuyerAdmin({ email, password, nombre, telefono: telefono || undefined })
      setCreated(true)
      showToast("success", "Admin Buyer creado correctamente")
    } catch (e) {
      const msg = e instanceof Error ? e.message : "Error desconocido"
      if (msg.toLowerCase().includes("ya existe") || msg.toLowerCase().includes("already exists")) {
        showToast("error", "Ya existe un usuario con ese email en Clerk")
      } else if (msg.toLowerCase().includes("password")) {
        showToast("error", "La contraseña no cumple los requisitos (mín. 8 caracteres)")
      } else {
        showToast("error", `Error: ${msg}`)
      }
    } finally {
      setSaving(false)
    }
  }

  async function handleConvertBuyer() {
    if (!selectedBuyerId) return
    const buyer = buyers.find((b) => b.buyer_id === selectedBuyerId)
    if (!buyer) return
    setSaving(true)
    try {
      await convertBuyerToAdmin(buyer.user_id)
      setCreated(true)
      showToast("success", `Buyer "${buyer.name || buyer.mail}" convertido a Admin Buyer`)
    } catch (e) {
      const msg = e instanceof Error ? e.message : "Error desconocido"
      showToast("error", `Error al convertir: ${msg}`)
    } finally {
      setSaving(false)
    }
  }

  function handleCloseSuccess() {
    onClose()
    onSuccess()
  }

  if (created) {
    return (
      <Modal isOpen={isOpen} onClose={handleCloseSuccess} title="Admin Buyer creado">
        <p className="text-sm text-slate-600 dark:text-slate-300">
          {mode === "cero"
            ? `El admin buyer "${nombre}" fue creado correctamente.`
            : `El buyer fue convertido a Admin Buyer exitosamente.`}
        </p>
        <div className="mt-6 flex justify-end">
          <button
            type="button"
            onClick={handleCloseSuccess}
            className="rounded-lg bg-blue-600 px-5 py-2 text-sm text-white shadow-lg shadow-black/5 transition-colors hover:bg-blue-700"
          >
            Cerrar
          </button>
        </div>
      </Modal>
    )
  }

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Nuevo Admin Buyer">
      <div className="mb-4 flex gap-1 rounded-lg bg-gradient-to-br from-slate-100/70 to-slate-200/50 p-1 dark:from-slate-800/60 dark:to-slate-800/40">
        {[
          { label: "Desde cero", value: "cero" as TabMode },
          { label: "Desde buyer", value: "buyer" as TabMode },
        ].map((tab) => (
          <button
            key={tab.value}
            type="button"
            onClick={() => setMode(tab.value)}
            className={`flex-1 rounded-md px-3 py-1.5 text-center text-sm font-medium transition-all ${
              mode === tab.value
                ? "bg-gradient-to-br from-white/60 to-slate-100/60 text-slate-900 shadow-sm dark:from-slate-700 dark:to-slate-600 dark:text-white"
                : "text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200"
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {mode === "cero" ? (
        <form onSubmit={handleSubmitCero} className="space-y-4 text-sm">
          <div>
            <label className="mb-1 block text-xs font-medium text-slate-500 dark:text-slate-400">
              Email <span className="text-red-500">*</span>
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              placeholder="admin@ejemplo.com"
              className="w-full rounded-lg border border-white/30 bg-gradient-to-br from-white/30 to-slate-100/30 px-3 py-2 text-slate-900 shadow-lg shadow-black/5 backdrop-blur-xl focus:border-blue-500/50 focus:outline-none focus:ring-2 focus:ring-blue-500/20 dark:border-slate-700/40 dark:from-slate-900/40 dark:to-slate-800/40 dark:text-slate-100"
            />
          </div>
          <div>
            <label className="mb-1 block text-xs font-medium text-slate-500 dark:text-slate-400">
              Contraseña <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                placeholder="••••••••"
                className="w-full rounded-lg border border-white/30 bg-gradient-to-br from-white/30 to-slate-100/30 px-3 py-2 pr-10 text-slate-900 shadow-lg shadow-black/5 backdrop-blur-xl focus:border-blue-500/50 focus:outline-none focus:ring-2 focus:ring-blue-500/20 dark:border-slate-700/40 dark:from-slate-900/40 dark:to-slate-800/40 dark:text-slate-100"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300"
              >
                {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>
          </div>
          <div>
            <label className="mb-1 block text-xs font-medium text-slate-500 dark:text-slate-400">
              Nombre <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={nombre}
              onChange={(e) => setNombre(e.target.value)}
              required
              placeholder="Admin Buyer"
              className="w-full rounded-lg border border-white/30 bg-gradient-to-br from-white/30 to-slate-100/30 px-3 py-2 text-slate-900 shadow-lg shadow-black/5 backdrop-blur-xl focus:border-blue-500/50 focus:outline-none focus:ring-2 focus:ring-blue-500/20 dark:border-slate-700/40 dark:from-slate-900/40 dark:to-slate-800/40 dark:text-slate-100"
            />
          </div>
          <div>
            <label className="mb-1 block text-xs font-medium text-slate-500 dark:text-slate-400">Teléfono</label>
            <input
              type="text"
              value={telefono}
              onChange={(e) => setTelefono(e.target.value)}
              placeholder="555-0000"
              className="w-full rounded-lg border border-white/30 bg-gradient-to-br from-white/30 to-slate-100/30 px-3 py-2 text-slate-900 shadow-lg shadow-black/5 backdrop-blur-xl focus:border-blue-500/50 focus:outline-none focus:ring-2 focus:ring-blue-500/20 dark:border-slate-700/40 dark:from-slate-900/40 dark:to-slate-800/40 dark:text-slate-100"
            />
          </div>
          <div className="flex justify-end gap-2 border-t border-white/20 pt-4 dark:border-slate-700/30">
            <button
              type="button"
              onClick={onClose}
              disabled={saving}
              className="rounded-lg border border-white/30 bg-gradient-to-br from-white/30 to-slate-100/30 px-4 py-2 text-sm text-slate-600 shadow-lg shadow-black/5 backdrop-blur-xl transition-colors hover:bg-white/40 disabled:opacity-50 dark:border-slate-700/40 dark:from-slate-900/40 dark:to-slate-800/40 dark:text-slate-400"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={saving || !email || !nombre || !password}
              className="flex items-center gap-1.5 rounded-lg bg-blue-600 px-5 py-2 text-sm text-white shadow-lg shadow-black/5 transition-colors hover:bg-blue-700 disabled:opacity-50"
            >
              {saving && <Loader2 className="h-4 w-4 animate-spin" />}
              {saving ? "Creando..." : "Crear Admin Buyer"}
            </button>
          </div>
        </form>
      ) : (
        <div className="space-y-4 text-sm">
          <div>
            <label className="mb-1 block text-xs font-medium text-slate-500 dark:text-slate-400">
              Buyer <span className="text-red-500">*</span>
            </label>
            {availableBuyers.length === 0 ? (
              <p className="rounded-lg border border-amber-200 bg-amber-50 px-3 py-2 text-sm text-amber-700 dark:border-amber-800/40 dark:bg-amber-900/20 dark:text-amber-400">
                Todos los buyers ya son administradores.
              </p>
            ) : (
              <select
                value={selectedBuyerId}
                onChange={(e) => handleSelectBuyer(e.target.value)}
                className="w-full rounded-lg border border-white/30 bg-gradient-to-br from-white/30 to-slate-100/30 px-3 py-2 text-slate-900 shadow-lg shadow-black/5 backdrop-blur-xl focus:border-blue-500/50 focus:outline-none focus:ring-2 focus:ring-blue-500/20 dark:border-slate-700/40 dark:from-slate-900/40 dark:to-slate-800/40 dark:text-slate-100"
              >
                <option value="">Seleccionar buyer</option>
                {availableBuyers.map((b) => (
                  <option key={b.buyer_id} value={b.buyer_id}>
                    {b.name || b.mail} {b.name && `(${b.mail})`}
                  </option>
                ))}
              </select>
            )}
          </div>

          {selectedBuyerId && selectedBuyerName && (
            <div className="rounded-lg border border-blue-100 bg-blue-50 px-3 py-2 text-xs text-blue-700 dark:border-blue-800/40 dark:bg-blue-900/20 dark:text-blue-400">
              Se agregará el rol <strong>admin_buyer</strong> al usuario Clerk vinculado al buyer seleccionado.
            </div>
          )}

          <div className="flex justify-end gap-2 border-t border-white/20 pt-4 dark:border-slate-700/30">
            <button
              type="button"
              onClick={onClose}
              disabled={saving}
              className="rounded-lg border border-white/30 bg-gradient-to-br from-white/30 to-slate-100/30 px-4 py-2 text-sm text-slate-600 shadow-lg shadow-black/5 backdrop-blur-xl transition-colors hover:bg-white/40 disabled:opacity-50 dark:border-slate-700/40 dark:from-slate-900/40 dark:to-slate-800/40 dark:text-slate-400"
            >
              Cancelar
            </button>
            <button
              type="button"
              onClick={handleConvertBuyer}
              disabled={saving || !selectedBuyerId || availableBuyers.length === 0}
              className="flex items-center gap-1.5 rounded-lg bg-blue-600 px-5 py-2 text-sm text-white shadow-lg shadow-black/5 transition-colors hover:bg-blue-700 disabled:opacity-50"
            >
              {saving && <Loader2 className="h-4 w-4 animate-spin" />}
              {saving ? "Convirtiendo..." : "Convertir a Admin Buyer"}
            </button>
          </div>
        </div>
      )}
    </Modal>
  )
}
