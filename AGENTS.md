<!-- BEGIN:nextjs-agent-rules -->
# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` before writing any code. Heed deprecation notices.
<!-- END:nextjs-agent-rules -->

<!-- BEGIN:session-2026-06-23 -->
# Session: CRUD Logistics Admin completo

## Resumen
CRUD completo de logistics admins siguiendo el patrón de delivery (drivers, vehicles, zones).

## Archivos modificados
- `src/lib/types.ts` — `CreateLogisticsAdminData`: `{ email, idVendedor }` en vez de `{ idVendedor, nombreEmpresa }`
- `src/lib/actions/delivery.ts` — `createLogisticsAdmin` busca user en Clerk por email → envía `{ clerkUserId, idVendedor }` a delivery API
- `src/lib/actions/vendor.ts` — `getVendorsSimple()` incluye `clerkEmail`
- `src/components/delivery/CreateLogisticsAdminModal.tsx` — sin input email; auto-fill desde `clerkEmail` del vendor seleccionado; filtra empresas que ya tienen admin
- `src/app/dashboard/logistics-admins/page.tsx` — columna Nombre muestra `nombre — nombreEmpresa`; columna Empresa eliminada
- `src/lib/navigation.ts` — "Administradores" → "Logísticos"

## Patrón de creación
1. Seleccionar empresa del dropdown (solo sin admin)
2. Email se auto-rellena desde `clerkEmail` del vendedor (Seller API)
3. Server action: email → Clerk API (`getUserList`) → obtiene `clerkUserId`
4. Delivery API: `POST /api/admin/logistics-admins` con `{ clerkUserId, idVendedor }`
<!-- END:session-2026-06-23 -->

<!-- BEGIN:session-2026-06-24 -->
# Session: CRUD Admin Delivery completo

## Resumen
CRUD completo de admin_delivery (usuarios globales sin empresa) siguiendo el patrón de logistics-admins.

## Archivos modificados/creados
- `src/lib/types.ts` — Nuevos tipos: `AdminDelivery`, `CreateAdminDeliveryData`, `UpdateAdminDeliveryData`
- `src/lib/actions/delivery.ts` — Nuevas server actions: `getDeliveryAdmins`, `getDeliveryAdmin`, `createDeliveryAdmin`, `updateDeliveryAdmin`, `toggleDeliveryAdmin`, `deleteDeliveryAdmin`
- `src/lib/navigation.ts` — "Admin Delivery" agregado al `deliveryNav`
- `src/app/dashboard/delivery-admins/page.tsx` — List page con tabs (Todos/Bloqueados/Activos), búsqueda, paginación, delete
- `src/app/dashboard/delivery-admins/[clerkUserId]/page.tsx` — Detail server page
- `src/components/delivery/CreateDeliveryAdminModal.tsx` — Modal crear con inputs email, nombre, teléfono; success muestra temporaryPassword
- `src/components/delivery/CreateDeliveryAdminWrapper.tsx` — Wrapper client
- `src/components/delivery/DeliveryAdminDetailClient.tsx` — Detail client con toggle, editar, eliminar

## Diferencias con logistics-admins
- Sin empresa (`idVendedor: ""`, `nombreEmpresa: null`) — es global
- Create: Delivery App crea usuario en Clerk directamente (no lookup), devuelve `temporaryPassword`
- Toggle: responde "bloqueado"/"activo" en vez de "blocked"/"active"
- Delete: DELETE real de UserProfile + remueve rol en Clerk

## Rutas endpoints Delivery App
- `GET /api/admin/delivery-admins` — lista paginada con `q`, `isBlocked`
- `POST /api/admin/delivery-admins` — crea: `{ email, nombre, telefono? }` → devuelve `{ ...admin, temporaryPassword }`
- `GET /api/admin/delivery-admins/[clerkUserId]` — detalle
- `PUT /api/admin/delivery-admins/[clerkUserId]` — edita `{ nombre?, telefono? }`
- `PATCH /api/admin/delivery-admins/[clerkUserId]/toggle` — bloquea/desbloquea
- `DELETE /api/admin/delivery-admins/[clerkUserId]` — baja definitiva

## ⚠️ Problema identificado
La página `/dashboard/delivery-admins` no muestra datos porque la **Delivery App** (`proyecto-b-delivery-Jeremias`) **no tiene implementados** los endpoints `/api/admin/delivery-admins/*` ni `/api/admin/logistics-admins/*`. Sin estos endpoints, el Control Plane no puede comunicarse con la Delivery App para gestionar estos usuarios. Se documentaron los endpoints faltantes en `ArchivosLocales/tareas-delivery-app.md`.

## Archivos de contexto actualizados
- `ArchivosLocales/CONTEXTO.md` — Estado actualizado, problema documentado
- `ArchivosLocales/tareas-delivery-app.md` — Endpoints completos para delivery-admins y logistics-admins agregados (ítems 10-21)
- `AGENTS.md` — Este mismo archivo
<!-- END:session-2026-06-24 -->

<!-- BEGIN:session-2026-06-25 -->
# Session: Botones Editar en listados Delivery App (Control Plane)

## Resumen
Se agregaron botones "Editar" (ícono Pencil) en las tablas de todas las secciones de Delivery App dentro del Control Plane, más un fix en la columna Nombre de logistics-admins.

## Archivos modificados
- `src/app/dashboard/drivers/page.tsx` — Botón Editar en cada fila (link a detalle)
- `src/app/dashboard/vehicles/page.tsx` — Botón Editar en cada fila (link a detalle)
- `src/app/dashboard/zones/page.tsx` — Botón Editar en cada fila (link a detalle)
- `src/app/dashboard/logistics-admins/page.tsx` — Botón Editar + fix: columna Nombre ahora muestra `{nombre} — {nombreEmpresa}` (antes solo mostraba `{nombreEmpresa}`)
- `src/app/dashboard/delivery-admins/page.tsx` — Botón Editar en cada fila (link a detalle)

## Patrón usado
Cada botón Editar es un `<Link>` con ícono `Pencil` de lucide-react, ubicado a la izquierda del botón Eliminar, envuelto en un `<div className="flex items-center gap-1">`. El link apunta a la página de detalle del recurso (donde ya existe el formulario de edición).
<!-- END:session-2026-06-25 -->

<!-- BEGIN:session-2026-06-25b -->
# Session: Zone ↔ Empresa (vinculación desde Control Plane)

## Resumen
Se actualizó el Control Plane para que las zonas puedan vincularse con empresas (vendedores). Esto requiere los endpoints actualizados en la Delivery App que aceptan `empresas?: string[]` en POST y PUT de zonas.

## Archivos modificados
- `src/lib/types.ts` — `CreateZoneData.empresas?: string[]`, `UpdateZoneData.empresas?: string[]`
- `src/components/delivery/CreateZoneModal.tsx` — selector de empresas (checkboxes con vendors disponibles)
- `src/components/delivery/ZoneDetailClient.tsx` — panel editable de empresas vinculadas (agregar/quitar + guardar)

## Patrón
- CreateZoneModal carga vendors via `getVendorsSimple()`, checkboxes tipo toggle, envía `{ nombre, empresas: string[] }`
- ZoneDetailClient muestra badges editables con × para quitar, "+" para agregar del listado de vendors disponibles, y botón "Guardar empresas" que llama `updateZone({ nombre, empresas })`
<!-- END:session-2026-06-25b -->

<!-- BEGIN:session-2026-06-25c -->
# Session: Admin Buyer (CRUD completo + creación dual)

## Resumen
CRUD completo de administradores de Buyer App (rol `admin_buyer` en Clerk) con dos formas de creación: desde cero (nuevo usuario Clerk) o convirtiendo un buyer existente.

## Archivos creados
- `src/lib/types.ts` — Tipos `AdminBuyer`, `CreateAdminBuyerData`, `UpdateAdminBuyerData`
- `src/lib/actions/buyer-admin.ts` — Server actions: `getBuyerAdmins`, `getBuyerAdmin`, `createBuyerAdmin`, `convertBuyerToAdmin`, `updateBuyerAdmin`, `toggleBuyerAdmin`, `deleteBuyerAdmin`
- `src/components/buyer/CreateBuyerAdminModal.tsx` — Modal con dos tabs: "Desde cero" (email, password, nombre, teléfono) y "Desde buyer" (dropdown de buyers existentes)
- `src/components/buyer/CreateBuyerAdminWrapper.tsx` — Wrapper client
- `src/components/buyer/BuyerAdminDetailClient.tsx` — Detail client con toggle, editar, eliminar
- `src/app/dashboard/buyer-admins/page.tsx` — Lista con tabs, búsqueda, paginación, botón Editar + Eliminar
- `src/app/dashboard/buyer-admins/[clerkUserId]/page.tsx` — Server page de detalle

## Archivos modificados
- `src/lib/navigation.ts` — "Admin Buyer" agregado a `buyerNav`

## Patrones
- `createBuyerAdmin` y `convertBuyerToAdmin` usan Clerk API directamente (como `createSellerAdmin`)
- `convertBuyerToAdmin` recibe `buyerUserId` (Clerk ID), busca el user en Clerk, agrega `admin_buyer` a `publicMetadata.roles`
- El modal filtra buyers que ya son admins para evitar conversiones duplicadas
<!-- END:session-2026-06-25c -->
