# Control Plane — AguaYa

Panel de administración centralizado del ecosistema **AguaYa**. Permite a un superadministrador gestionar todas las apps del sistema desde un único lugar: vendedores, productos, pedidos, conductores, zonas, reseñas, valoraciones, transacciones y más.

## Secciones del Dashboard

| App | Funcionalidades |
|---|---|
| **Seller App** | Vendedores, Productos, Admin Seller |
| **Delivery App** | Choferes, Vehículos, Zonas, Logísticos, Admin Delivery |
| **Buyer App** | Compradores, Pedidos, Admin Buyer |
| **Feedback App** | Reseñas, Valoraciones |
| **Payment App** | Transacciones, Facturas, Usuarios de Pago, Admin Pagos |

## Apps Integradas

El control plane se conecta con las siguientes apps del ecosistema mediante sus APIs REST:

| App | Variable de entorno | Endpoints Admin |
|---|---|---|
| Seller | `SELLER_APP_URL` | `/api/admin/vendors`, `/api/admin/products`, `/api/admin/orders` |
| Delivery | `DELIVERY_APP_URL` | `/api/admin/drivers`, `/api/admin/vehicles`, `/api/admin/zones`, `/api/admin/deliveries` |
| Feedback | `FEEDBACK_APP_URL` | `/api/analytics/reviews`, `/api/analytics/valoraciones`, `/api/control/reviews/:id`, `/api/control/valoraciones/:id` |
| Buyer | `BUYER_APP_URL` | `/api/admin/buyers`, `/api/admin/buyer-orders` |
| Payment | `PAYMENT_APP_URL` | `/api/admin/pagos`, `/api/admin/facturas` |

Cada app se autentica mediante una API Key compartida enviada en el header `x-api-key` o `Authorization`.
## Usuarios
superadmin1+clerk_test@iaw.com
superadmin2+clerk_test@iaw.com
Contraseña: iawuser#
## Tecnologías

- **Framework:** Next.js 16 (App Router)
- **UI:** React 19 + Tailwind CSS v4
- **Autenticación:** Clerk
- **Lenguaje:** TypeScript
- **Íconos:** lucide-react
- **Estilos:** Glassmorphism, diseño responsivo

## Requisitos

- Node.js >= 20

## Instalación y ejecución

```bash
# Instalar dependencias
npm install

# Crear archivo de variables de entorno
cp .env.example .env.local
# Editar .env.local con las URLs y API keys de cada app

# Iniciar en modo desarrollo
npm run dev
```

El servidor arranca en `http://localhost:3001`.



### Rutas del dashboard

```
/dashboard                          → Overview con estadísticas
/dashboard/vendors                  → Vendedores
/dashboard/vendors/[id]             → Detalle de vendedor
/dashboard/products                 → Productos
/dashboard/orders                   → Pedidos unificados
/dashboard/seller-admins            → Admin Seller
/dashboard/drivers                  → Choferes
/dashboard/drivers/[id]             → Detalle de chofer
/dashboard/vehicles                 → Vehículos
/dashboard/zones                    → Zonas
/dashboard/logistics-admins         → Logísticos
/dashboard/delivery-admins          → Admin Delivery
/dashboard/buyers                   → Compradores
/dashboard/buyer-orders             → Pedidos Buyer
/dashboard/buyer-admins             → Admin Buyer
/dashboard/feedback/resenas         → Reseñas
/dashboard/feedback/valoraciones    → Valoraciones
/dashboard/pagos                    → Transacciones
/dashboard/facturas                 → Facturas
/dashboard/payment-admins           → Admin Pagos
/dashboard/payment-users            → Usuarios Pagos
```

