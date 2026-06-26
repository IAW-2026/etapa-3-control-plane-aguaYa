"use client"

import { useState, useEffect } from "react"
import Modal from "@/components/ui/Modal"
import { createDriver } from "@/lib/actions/delivery"
import { getZones } from "@/lib/actions/delivery"
import { getVehicles } from "@/lib/actions/delivery"
import { getLogisticsAdminsSimple } from "@/lib/actions/delivery"
import { useToast } from "@/components/ui/ToastProvider"
import { Loader2, Eye, EyeOff, Copy, Check } from "lucide-react"
import type { Zone, Vehicle } from "@/lib/types"

type Props = {
  isOpen: boolean
  onClose: () => void
  onSuccess: () => void
}

export default function CreateDriverModal({ isOpen, onClose, onSuccess }: Props) {
  const { showToast } = useToast()

  const [email, setEmail] = useState("")
  const [nombre, setNombre] = useState("")
  const [telefono, setTelefono] = useState("")
  const [idVendedor, setIdVendedor] = useState("")
  const [idZona, setIdZona] = useState("")
  const [idVehiculo, setIdVehiculo] = useState("")
  const [saving, setSaving] = useState(false)

  const [zones, setZones] = useState<Zone[]>([])
  const [vehicles, setVehicles] = useState<Vehicle[]>([])
  const [empresas, setEmpresas] = useState<{ id: string; name: string }[]>([])

  const [createdPassword, setCreatedPassword] = useState<string | null>(null)
  const [showPassword, setShowPassword] = useState(false)
  const [copied, setCopied] = useState(false)

  useEffect(() => {
    if (!isOpen) return
    setCreatedPassword(null)
    setShowPassword(false)
    setCopied(false)
    setEmail("")
    setNombre("")
    setTelefono("")
    setIdVendedor("")
    setIdZona("")
    setIdVehiculo("")

    Promise.all([
      getZones({ limit: "100" }),
      getVehicles({ limit: "100" }),
      getLogisticsAdminsSimple(),
    ]).then(([z, v, e]) => {
      setZones(z.items)
      setVehicles(v.items)
      setEmpresas(e)
    })
  }, [isOpen])

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!email || !nombre) return
    setSaving(true)
    try {
      const res = await createDriver({
        email,
        nombre,
        telefono: telefono || undefined,
        idVendedor: idVendedor || undefined,
        idZona: idZona ? Number(idZona) : undefined,
        idVehiculo: idVehiculo ? Number(idVehiculo) : undefined,
      })
      setCreatedPassword(res.temporaryPassword ?? null)
      showToast("success", "Chofer creado correctamente")
    } catch (e) {
      const msg = e instanceof Error ? e.message.toLowerCase() : ""
      if (msg.includes("email") || msg.includes("clerk") || msg.includes("ya existe")) {
        showToast("error", "El email ya está registrado")
      } else {
        showToast("error", "Error al crear chofer")
      }
      setSaving(false)
    }
  }

  function handleCopy() {
    if (createdPassword) {
      navigator.clipboard.writeText(createdPassword)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    }
  }

  function handleCloseSuccess() {
    onClose()
    onSuccess()
  }

  if (createdPassword) {
    return (
      <Modal isOpen={isOpen} onClose={handleCloseSuccess} title="Chofer creado exitosamente">
        <div className="space-y-4 text-sm">
          <p className="text-slate-600 dark:text-slate-300">
            El chofer <strong>{nombre}</strong> fue creado. Usá esta contraseña temporal para que inicie sesión por primera vez.
          </p>

          <div className="rounded-xl border border-emerald-200/60 bg-emerald-50/50 p-4 dark:border-emerald-800/40 dark:bg-emerald-900/20">
            <p className="mb-1 text-xs font-medium text-emerald-700 dark:text-emerald-400">Contraseña temporal</p>
            <div className="flex items-center gap-2">
              <code className="flex-1 rounded-lg bg-white px-3 py-2 font-mono text-sm text-slate-900 shadow-sm dark:bg-slate-800 dark:text-slate-100">
                {showPassword ? createdPassword : "••••••••••••"}
              </code>
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="rounded-lg p-2 text-slate-400 hover:bg-slate-100 hover:text-slate-600 dark:hover:bg-slate-700"
              >
                {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
              <button
                type="button"
                onClick={handleCopy}
                className="rounded-lg p-2 text-slate-400 hover:bg-slate-100 hover:text-slate-600 dark:hover:bg-slate-700"
              >
                {copied ? <Check className="h-4 w-4 text-emerald-500" /> : <Copy className="h-4 w-4" />}
              </button>
            </div>
          </div>

          <div className="flex justify-end">
            <button
              type="button"
              onClick={handleCloseSuccess}
              className="rounded-lg bg-blue-600 px-5 py-2 text-sm text-white shadow-lg shadow-black/5 transition-colors hover:bg-blue-700"
            >
              Cerrar
            </button>
          </div>
        </div>
      </Modal>
    )
  }

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Nuevo Chofer">
      <form onSubmit={handleSubmit} className="space-y-4 text-sm">
        <div className="grid grid-cols-2 gap-4">
          <div className="col-span-2">
            <label className="mb-1 block text-xs font-medium text-slate-500 dark:text-slate-400">
              Email <span className="text-red-500">*</span>
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              placeholder="chofer@ejemplo.com"
              className="w-full rounded-lg border border-white/30 bg-gradient-to-br from-white/30 to-slate-100/30 px-3 py-2 text-slate-900 placeholder-slate-400 shadow-lg shadow-black/5 backdrop-blur-xl focus:border-blue-500/50 focus:outline-none focus:ring-2 focus:ring-blue-500/20 dark:border-slate-700/40 dark:from-slate-900/40 dark:to-slate-800/40 dark:text-slate-100 dark:placeholder-slate-500"
            />
          </div>

          <div className="col-span-2">
            <label className="mb-1 block text-xs font-medium text-slate-500 dark:text-slate-400">
              Nombre <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={nombre}
              onChange={(e) => setNombre(e.target.value)}
              required
              placeholder="Nombre completo"
              className="w-full rounded-lg border border-white/30 bg-gradient-to-br from-white/30 to-slate-100/30 px-3 py-2 text-slate-900 placeholder-slate-400 shadow-lg shadow-black/5 backdrop-blur-xl focus:border-blue-500/50 focus:outline-none focus:ring-2 focus:ring-blue-500/20 dark:border-slate-700/40 dark:from-slate-900/40 dark:to-slate-800/40 dark:text-slate-100 dark:placeholder-slate-500"
            />
          </div>

          <div>
            <label className="mb-1 block text-xs font-medium text-slate-500 dark:text-slate-400">Teléfono</label>
            <input
              type="text"
              value={telefono}
              onChange={(e) => setTelefono(e.target.value)}
              placeholder="555-0000"
              className="w-full rounded-lg border border-white/30 bg-gradient-to-br from-white/30 to-slate-100/30 px-3 py-2 text-slate-900 placeholder-slate-400 shadow-lg shadow-black/5 backdrop-blur-xl focus:border-blue-500/50 focus:outline-none focus:ring-2 focus:ring-blue-500/20 dark:border-slate-700/40 dark:from-slate-900/40 dark:to-slate-800/40 dark:text-slate-100 dark:placeholder-slate-500"
            />
          </div>

          <div>
            <label className="mb-1 block text-xs font-medium text-slate-500 dark:text-slate-400">Zona</label>
            <select
              value={idZona}
              onChange={(e) => setIdZona(e.target.value)}
              className="w-full rounded-lg border border-white/30 bg-gradient-to-br from-white/30 to-slate-100/30 px-3 py-2 text-slate-900 shadow-lg shadow-black/5 backdrop-blur-xl focus:border-blue-500/50 focus:outline-none focus:ring-2 focus:ring-blue-500/20 dark:border-slate-700/40 dark:from-slate-900/40 dark:to-slate-800/40 dark:text-slate-100"
            >
              <option value="">Sin zona</option>
              {zones
                .filter((z) => !idVendedor || z.empresas.includes(idVendedor))
                .map((z) => (
                  <option key={z.idZona} value={z.idZona}>{z.nombre}</option>
                ))}
            </select>
          </div>

          <div className="col-span-2">
            <label className="mb-1 block text-xs font-medium text-slate-500 dark:text-slate-400">
              Empresa
            </label>
            <select
              value={idVendedor}
              onChange={(e) => {
                setIdVendedor(e.target.value)
                setIdZona("")
                setIdVehiculo("")
              }}
              className="w-full rounded-lg border border-white/30 bg-gradient-to-br from-white/30 to-slate-100/30 px-3 py-2 text-slate-900 shadow-lg shadow-black/5 backdrop-blur-xl focus:border-blue-500/50 focus:outline-none focus:ring-2 focus:ring-blue-500/20 dark:border-slate-700/40 dark:from-slate-900/40 dark:to-slate-800/40 dark:text-slate-100"
            >
              <option value="">Seleccionar empresa</option>
              {empresas.map((e) => (
                <option key={e.id} value={e.id}>{e.name}</option>
              ))}
            </select>
          </div>

          <div className="col-span-2">
            <label className="mb-1 block text-xs font-medium text-slate-500 dark:text-slate-400">Vehículo</label>
            <select
              value={idVehiculo}
              onChange={(e) => setIdVehiculo(e.target.value)}
              className="w-full rounded-lg border border-white/30 bg-gradient-to-br from-white/30 to-slate-100/30 px-3 py-2 text-slate-900 shadow-lg shadow-black/5 backdrop-blur-xl focus:border-blue-500/50 focus:outline-none focus:ring-2 focus:ring-blue-500/20 dark:border-slate-700/40 dark:from-slate-900/40 dark:to-slate-800/40 dark:text-slate-100"
            >
              <option value="">Sin vehículo</option>
              {vehicles
                .filter((v) => v.estado === "activo" && (!idVendedor || v.idVendedor === idVendedor))
                .map((v) => (
                  <option key={v.idVehiculo} value={v.idVehiculo}>
                    {v.patente} — {v.tipo}
                  </option>
                ))}
            </select>
          </div>
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
            disabled={saving}
            className="flex items-center gap-1.5 rounded-lg bg-blue-600 px-5 py-2 text-sm text-white shadow-lg shadow-black/5 transition-colors hover:bg-blue-700 disabled:opacity-50"
          >
            {saving && <Loader2 className="h-4 w-4 animate-spin" />}
            {saving ? "Creando..." : "Crear Chofer"}
          </button>
        </div>
      </form>
    </Modal>
  )
}
