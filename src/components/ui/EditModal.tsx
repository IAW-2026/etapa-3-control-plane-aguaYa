'use client'

import { useState, useEffect } from 'react'
import Modal from '@/components/ui/Modal'
import { Loader2 } from 'lucide-react'

export type FieldConfig = {
  name: string
  label: string
  type?: 'text' | 'textarea' | 'email' | 'number' | 'image'
  required?: boolean
  placeholder?: string
}

type Props = {
  isOpen: boolean
  onClose: () => void
  onSave: (data: Record<string, string>) => Promise<void>
  title: string
  fields: FieldConfig[]
  initialData: Record<string, string>
  saving?: boolean
}

export default function EditModal({
  isOpen,
  onClose,
  onSave,
  title,
  fields,
  initialData,
  saving = false,
}: Props) {
  const [form, setForm] = useState<Record<string, string>>({})

  useEffect(() => {
    if (isOpen) {
      setForm({ ...initialData })
    }
  }, [isOpen, initialData])

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    await onSave(form)
  }

  function updateField(name: string, value: string) {
    setForm((prev) => ({ ...prev, [name]: value }))
  }

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={title}>
      <form onSubmit={handleSubmit} className="space-y-4">
        {fields.map((field) => (
          <div key={field.name}>
            <label className="mb-1 block text-sm font-medium text-slate-700 dark:text-slate-300">
              {field.label}
              {field.required && <span className="ml-1 text-red-500">*</span>}
            </label>
            {field.type === 'image' ? (
              <div className="flex items-center gap-3">
                {form[field.name] ? (
                  <img src={form[field.name]} alt="" className="h-14 w-14 flex-shrink-0 rounded-lg object-cover" onError={(e) => { (e.target as HTMLImageElement).style.display = 'none' }} />
                ) : (
                  <div className="flex h-14 w-14 flex-shrink-0 items-center justify-center rounded-lg bg-slate-100 text-slate-400 dark:bg-slate-700">
                    <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
                  </div>
                )}
                <input
                  type="text"
                  value={form[field.name] ?? ''}
                  onChange={(e) => updateField(field.name, e.target.value)}
                  placeholder={field.placeholder}
                  className="flex-1 rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 placeholder-slate-400 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 dark:border-slate-600 dark:bg-slate-700 dark:text-slate-100 dark:placeholder-slate-500"
                />
              </div>
            ) : field.type === 'textarea' ? (
              <textarea
                value={form[field.name] ?? ''}
                onChange={(e) => updateField(field.name, e.target.value)}
                required={field.required}
                rows={3}
                placeholder={field.placeholder}
                className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 placeholder-slate-400 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 dark:border-slate-600 dark:bg-slate-700 dark:text-slate-100 dark:placeholder-slate-500"
              />
            ) : (
              <input
                type={field.type ?? 'text'}
                value={form[field.name] ?? ''}
                onChange={(e) => updateField(field.name, e.target.value)}
                required={field.required}
                placeholder={field.placeholder}
                className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 placeholder-slate-400 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 dark:border-slate-600 dark:bg-slate-700 dark:text-slate-100 dark:placeholder-slate-500"
              />
            )}
          </div>
        ))}
        <div className="flex justify-end gap-2 pt-2">
          <button
            type="button"
            onClick={onClose}
            disabled={saving}
            className="rounded-lg border border-slate-300 px-4 py-2 text-sm text-slate-600 hover:bg-slate-50 disabled:opacity-50 dark:border-slate-600 dark:text-slate-400 dark:hover:bg-slate-700"
          >
            Cancelar
          </button>
          <button
            type="submit"
            disabled={saving}
            className="flex items-center gap-1.5 rounded-lg bg-blue-600 px-4 py-2 text-sm text-white hover:bg-blue-700 disabled:opacity-50"
          >
            {saving && <Loader2 className="h-4 w-4 animate-spin" />}
            {saving ? 'Guardando...' : 'Guardar cambios'}
          </button>
        </div>
      </form>
    </Modal>
  )
}
