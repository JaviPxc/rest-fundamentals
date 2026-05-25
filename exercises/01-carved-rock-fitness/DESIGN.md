# Carved Rock Fitness API · DESIGN

Diseño del primer ejercicio del curso. Aplica la teoría recogida en [`../../theory/01-fundamentals.md`](../../theory/01-fundamentals.md) sobre un dominio realista de retail outdoor.

> Toda la teoría general (URL, verbos, respuestas, content types, clientes/servidores, buenas prácticas) vive en `theory/01-fundamentals.md`. Aquí solo el diseño del ejercicio. Para arrancar el código del ejercicio, ver el [`README.md`](./README.md) hermano.

---

## 1. Contexto y retos heredados

A lo largo del curso construiremos una API para **Carved Rock Fitness**, un gran retailer de equipamiento outdoor.

Carved Rock ha crecido principalmente por **adquisiciones**, lo que ha generado deuda técnica clásica:

| Problema | Síntoma |
|----------|---------|
| **Endpoints duplicados / inconsistentes** | Múltiples formas de buscar un cliente que devuelven datos diferentes. |
| **Modelos de seguridad fragmentados** | Cada compañía adquirida traía su propio esquema de autenticación/permisos. |
| **Rendimiento desigual** | Algunas partes pensadas para performance, otras nunca optimizadas. |
| **Caja registradora en XML** | Sistema antiguo aislado del resto (JSON), suele quedarse desactualizado. |
| **Cambios costosos** | Las breaking changes provocan downtime o ciclos de test largos. |

> **Objetivo del curso**: rediseñar la API para resolver estos cinco puntos.

---

## 2. Personas (consumidores de la API)

Tres perfiles consumirán la API. Cada uno aporta restricciones distintas al diseño:

| Persona | Canal | Restricciones / notas |
|---------|-------|------------------------|
| **Cliente final** | Web de e-commerce pública + app móvil autenticada. | Necesita endpoints rápidos y resilientes en móvil (ver `theory/01-fundamentals.md` §6.2). |
| **Cajero (cashier)** | Caja registradora antigua. | Sus endpoints deben servirse en **XML** (`application/xml`). |
| **Empleado de stock** | Portal interno para preparación de pedidos. | Acceso autenticado al fulfillment. |

> Estas tres personas justifican decisiones que iremos tomando: content negotiation (XML/JSON), tamaño de payload, autenticación, etc.

---

## 3. Modelo de datos

Carved Rock ya tiene su modelo unificado. En el curso nos centramos en **cuatro entidades** suficientes para ilustrar las relaciones REST.

### 3.1. Entidades

**Item**

| Campo         | Tipo     | Notas         |
|---------------|----------|---------------|
| `ID`          | `Int`    | PK            |
| `Name`        | `String` |               |
| `Description` | `String` |               |

**Customer**

| Campo   | Tipo     | Notas |
|---------|----------|-------|
| `ID`    | `UUID`   | PK    |
| `Name`  | `String` |       |
| `Email` | `String` |       |

**Order**

| Campo        | Tipo       | Notas                       |
|--------------|------------|-----------------------------|
| `ID`         | `UUID`     | PK                          |
| `CustomerId` | `UUID`     | FK → `Customer.ID`          |
| `Status`     | `String`   | Estado del pedido           |
| `CreatedAt`  | `DateTime` |                             |

**OrderItem**

| Campo      | Tipo   | Notas                                |
|------------|--------|--------------------------------------|
| `OrderId`  | `UUID` | PK (parte) · FK → `Order.ID`         |
| `ItemId`   | `Int`  | PK (parte) · FK → `Item.ID`          |
| `Quantity` | `Int`  | Cantidad de ese item en el pedido    |

> `OrderItem` tiene **clave compuesta** (`OrderId` + `ItemId`); no necesita un `ID` propio.

### 3.2. Esquema visual de las entidades

```
┌─────────────────────┐        ┌────────────────────────┐
│ Item                │        │ OrderItem              │
│─────────────────────│        │────────────────────────│
│ PK  ID         Int  │◄──────┤ PK,FK ItemId    Int    │
│     Name       Str  │        │ PK,FK OrderId   UUID   │──┐
│     Description Str │        │       Quantity  Int    │  │
└─────────────────────┘        └────────────────────────┘  │
                                                            │
┌─────────────────────┐        ┌────────────────────────┐  │
│ Customer            │        │ Order                  │  │
│─────────────────────│        │────────────────────────│  │
│ PK  ID         UUID │◄──────┤ FK    CustomerId UUID  │  │
│     Name       Str  │        │ PK    ID         UUID  │◄─┘
│     Email      Str  │        │       Status     Str   │
└─────────────────────┘        │       CreatedAt  DT    │
                               └────────────────────────┘
```

### 3.3. Cardinalidades

```
Customer 1 ───< N Order 1 ───< N OrderItem N >─── 1 Item
```

- Un `Customer` tiene **muchos** `Order` → FK `CustomerId` en `Order`.
- Un `Order` tiene **muchos** `OrderItem` → FK `OrderId` en `OrderItem`.
- Un `Item` aparece en **muchos** `OrderItem` → FK `ItemId` en `OrderItem`.

> Patrón clásico: las FKs viven siempre en la entidad "del lado N". `OrderItem` actúa como tabla intermedia que resuelve la relación N-N entre `Order` e `Item`.

---

## 4. Planificación y diseño de la API

Con el contexto y el modelo claros, diseñamos la API. Hay dos puntos de partida igualmente válidos:

- **Desde el modelo de datos** (enfoque back-end): partir de las entidades y mapear su CRUD a verbos REST.
- **Desde el cliente** (enfoque consumer-first): partir de los *jobs to be done* de cada persona.

Aquí usamos **modelo de datos primero** y luego **iteramos con cada persona** para detectar lo que falta.

### 4.1. Mapeo CRUD → verbos REST

Patrón base para `items`, `customers` y `orders`:

| Acción     | Verbo + endpoint                  |
|------------|-----------------------------------|
| Crear      | `POST   /api/v1/<recurso>`        |
| Listar     | `GET    /api/v1/<recurso>`        |
| Leer uno   | `GET    /api/v1/<recurso>/:id`    |
| Actualizar | `PUT    /api/v1/<recurso>/:id`    |
| Borrar     | `DELETE /api/v1/<recurso>/:id`    |

#### Excepción: `OrderItem`

Para no inflar la API, **no exponemos CRUD completo** sobre `OrderItem`. Bastan dos endpoints como subcolección de un pedido:

| Verbo + endpoint                                  | Acción |
|---------------------------------------------------|--------|
| `POST   /api/v1/orders/:id/items`                 | Añadir un item al pedido. |
| `DELETE /api/v1/orders/:id/items/:itemId`         | Quitar un item del pedido. |

> Los items del pedido se devuelven dentro del `GET /api/v1/orders/:id`. No se modelan como recurso de primer nivel.

### 4.2. Iteración por persona (jobs to be done)

Una vez tenemos el "CRUD por defecto", recorremos cada persona (§2) para detectar lo que falta.

#### Cliente final

| Job to be done                                          | Endpoint |
|---------------------------------------------------------|----------|
| Abrir el email de confirmación y ver el detalle.        | `GET /api/v1/orders/:id` |
| Browse del catálogo público.                            | `GET /api/v1/items` |
| Ver ficha de un item.                                   | `GET /api/v1/items/:id` |
| Ver / editar su perfil.                                 | `GET` / `PUT /api/v1/customers/:id` |
| **Ver el histórico de SUS pedidos** ← no cubierto por CRUD | `GET /api/v1/customers/:id/orders` *(subcolección, nuevo)* |

#### Cajero

| Job to be done                                          | Endpoint |
|---------------------------------------------------------|----------|
| Crear pedidos en caja.                                  | `POST /api/v1/orders` |
| Añadir / quitar items del pedido.                       | `POST` / `DELETE /api/v1/orders/:id/items[/:itemId]` |
| Consultar items.                                        | `GET /api/v1/items[/:id]` |
| Responder dudas: ver clientes y sus pedidos.            | `GET /api/v1/customers/:id` + `GET /api/v1/customers/:id/orders` |
| **Crear nuevas cuentas de cliente** (solo cajeros).     | `POST /api/v1/customers` |
| **Buscar clientes rápido** ← listar todos es lento      | `GET /api/v1/customers/search?q=…` *(nuevo)* |

> Recuerda: todos los endpoints servidos al cajero deben devolverse en **`application/xml`** (sistema de caja antiguo, §1).

#### Empleado de stockroom

| Job to be done                                          | Endpoint |
|---------------------------------------------------------|----------|
| Consultar inventario.                                   | `GET /api/v1/items[/:id]` |
| Dar de alta y actualizar inventario.                    | `POST` / `PUT /api/v1/items[/:id]` |
| Ver todos los pedidos pendientes y su detalle.          | `GET /api/v1/orders[/:id]` |
| **Actualizar el `status` de un pedido** conforme se fulfilla. | `PUT /api/v1/orders/:id` *(o un futuro `PATCH`)* |

### 4.3. Blueprint final de endpoints

#### Vista textual del diagrama por recurso

```
Items                          Customers                       Orders
─────                          ─────────                       ──────
GET    /items                  POST   /customers               POST   /orders
GET    /items/:id              GET    /customers               GET    /orders
POST   /items                  GET    /customers/:id           GET    /orders/:id
PUT    /items/:id              PUT    /customers/:id           PUT    /orders/:id
DELETE /items/:id              DELETE /customers/:id           DELETE /orders/:id
                               GET    /customers/search        POST   /orders/:id/items
                               GET    /customers/:id/orders    DELETE /orders/:id/items/:itemId
```

#### Vista por persona (qué endpoints consume cada perfil)

Réplica textual del diagrama del curso, donde cada perfil conecta visualmente con sus endpoints. Útil para razonar sobre permisos y para preparar el módulo de autenticación/autorización.

```
                ┌──────────────────────────────────────────────┐
                │                                              │
   ┌────────────┴──────────────┐                ┌──────────────┴──────────────────────┐
   │  Cliente final            │                │  Items                              │
   │  (web + app móvil)        │────────────────│   GET    /items          (browse)   │
   └────────────┬──────────────┘                │   GET    /items/:id      (ficha)    │
                │                               └─────────────────────────────────────┘
                │                                ┌─────────────────────────────────────┐
                ├────────────────────────────────│  Customers                          │
                │                                │   GET    /customers/:id   (own)     │
                │                                │   PUT    /customers/:id   (own)     │
                │                                │   GET    /customers/:id/orders (own)│
                │                                └─────────────────────────────────────┘
                │                                ┌─────────────────────────────────────┐
                └────────────────────────────────│  Orders                             │
                                                 │   GET    /orders/:id     (own)      │
                                                 └─────────────────────────────────────┘

   ┌───────────────────────────┐                ┌─────────────────────────────────────┐
   │  Cajero (cashier)         │                │  Items                              │
   │  Caja registradora · XML  │────────────────│   GET    /items                     │
   └────────────┬──────────────┘                │   GET    /items/:id                 │
                │                                └─────────────────────────────────────┘
                │                                ┌─────────────────────────────────────┐
                ├────────────────────────────────│  Customers                          │
                │                                │   GET    /customers                 │
                │                                │   POST   /customers     (alta)      │
                │                                │   GET    /customers/:id             │
                │                                │   GET    /customers/search          │
                │                                │   GET    /customers/:id/orders      │
                │                                └─────────────────────────────────────┘
                │                                ┌─────────────────────────────────────┐
                └────────────────────────────────│  Orders                             │
                                                 │   POST   /orders                    │
                                                 │   GET    /orders/:id                │
                                                 │   POST   /orders/:id/items          │
                                                 │   DELETE /orders/:id/items/:itemId  │
                                                 └─────────────────────────────────────┘

   ┌───────────────────────────┐                ┌─────────────────────────────────────┐
   │  Empleado de Stockroom    │                │  Items                              │
   │  Portal interno           │────────────────│   GET    /items                     │
   └────────────┬──────────────┘                │   GET    /items/:id                 │
                │                                │   POST   /items                     │
                │                                │   PUT    /items/:id                 │
                │                                │   DELETE /items/:id                 │
                │                                └─────────────────────────────────────┘
                │                                ┌─────────────────────────────────────┐
                └────────────────────────────────│  Orders                             │
                                                 │   GET    /orders                    │
                                                 │   GET    /orders/:id                │
                                                 │   PUT    /orders/:id    (status)    │
                                                 └─────────────────────────────────────┘
```

> Reglas implícitas:
> - El **cliente final** solo accede a **sus propios** datos (own) → autorización a nivel de recurso.
> - El **cajero** consume **todo en `application/xml`** (sistema de caja antiguo).
> - El **stockroom** es el único con escritura completa sobre `items` y con la responsabilidad de avanzar el `status` de los pedidos.

#### Tabla completa con responsables

| Recurso     | Endpoint                              | Verbos                  | Quién |
|-------------|---------------------------------------|-------------------------|-------|
| Items       | `/api/v1/items`                       | `GET`, `POST`           | Cliente (read), Stock (read/write) |
| Items       | `/api/v1/items/:id`                   | `GET`, `PUT`, `DELETE`  | Cliente (read), Stock (read/write) |
| Customers   | `/api/v1/customers`                   | `GET`, `POST`           | Cajero, Stock |
| Customers   | `/api/v1/customers/:id`               | `GET`, `PUT`, `DELETE`  | Cliente (own), Cajero |
| Customers   | `/api/v1/customers/search`            | `GET`                   | Cajero |
| Customers   | `/api/v1/customers/:id/orders`        | `GET`                   | Cliente (own), Cajero |
| Orders      | `/api/v1/orders`                      | `GET`, `POST`           | Cajero, Stock |
| Orders      | `/api/v1/orders/:id`                  | `GET`, `PUT`, `DELETE`  | Cliente (own), Cajero, Stock |
| OrderItems  | `/api/v1/orders/:id/items`            | `POST`                  | Cajero |
| OrderItems  | `/api/v1/orders/:id/items/:itemId`    | `DELETE`                | Cajero |

> Este blueprint es la hoja de ruta para implementar la API.

---

<!-- Próximas secciones del caso práctico: implementación inicial, content negotiation XML/JSON, autenticación por persona, paginación de /items, etc. -->
