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
