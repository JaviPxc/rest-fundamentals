# Teoría REST

Apuntes acumulativos sobre REST. Iremos añadiendo aquí toda la teoría a medida que avancemos.

> El **caso práctico** (Carved Rock Fitness: contexto, personas, modelo de datos y diseño de la API) vive en el primer ejercicio: [`exercises/01-carved-rock-fitness/DESIGN.md`](../exercises/01-carved-rock-fitness/DESIGN.md).

---

## 1. ¿Qué es REST?

**REST** (Representational State Transfer) es un **estilo arquitectónico** para diseñar APIs sobre HTTP. No es un protocolo ni un estándar formal, sino un conjunto de principios que definen cómo deben comportarse los servicios web.

### Principios fundamentales

1. **Cliente-Servidor**: separación clara entre quien consume (cliente) y quien provee (servidor).
2. **Stateless (sin estado)**: cada petición contiene toda la información necesaria; el servidor no guarda contexto entre llamadas.
3. **Cacheable**: las respuestas deben indicar si pueden almacenarse en caché.
4. **Interfaz uniforme**: uso coherente de URIs, métodos HTTP y representaciones (normalmente JSON).
5. **Sistema en capas**: el cliente no necesita saber si habla con el servidor final o con un proxy/balanceador.
6. **Recursos identificables por URI**: todo es un recurso (`/users`, `/users/42`, `/orders/7/items`).

---

## 2. Anatomía de una URL REST

```
https://api.carvedrockfitness.com:443/api/v1/items/1?include=images
└─┬─┘  └──────────────┬─────────────┘└┬┘└─────┬───────┘└──────┬─────┘
scheme           domain              port    path           query
```

| Parte      | Descripción | Notas |
|------------|-------------|-------|
| **scheme** | `https` (seguro) o `http` (inseguro). | Usa siempre `https` fuera de local. |
| **domain** | Servidor que aloja el servicio. | — |
| **port**   | Puerto del servidor. | `443` por defecto en HTTPS y `80` en HTTP → se omiten. Solo aparece en local (3000, 8080, etc.). |
| **path**   | Ruta al recurso. | Es la parte que más peso tiene en la convención. |
| **query**  | Información adicional (filtros, paginación, etc.). | Opcional. |

### 2.1. Convenciones del path

#### Prefijo `/api`
Opcional, pero recomendable porque:
- Mejora la legibilidad del tráfico (debugging).
- Separa el front web del API cuando comparten servidor.

#### Versionado en la ruta
```
/api/v1/items
/api/v2/items
```
Habitual para comunicar **breaking changes** a los consumidores.

#### Nombres de recursos
- **Sustantivos en plural**: `items`, `customers`, `orders`.
- **Nunca verbos**: no uses `getItems` ni `listItems` (el verbo lo aporta el método HTTP).

#### Colección vs recurso concreto
```
GET /api/v1/items       → colección (0..N items)
GET /api/v1/items/1     → recurso concreto (id = 1)
```

#### Subcolecciones
```
GET /api/v1/orders/42              → datos generales del pedido 42
GET /api/v1/orders/42/items        → todos los items de ese pedido
GET /api/v1/orders/42/items/7      → item 7 dentro del pedido 42
```

### 2.2. Query parameters

Sirven para **modificar** la petición sin cambiar el recurso.

| Caso | Ejemplo |
|------|---------|
| Un valor | `?include=images` |
| Varios valores (CSV → array en la mayoría de frameworks) | `?include=images,reviews` |
| Paginación | `?limit=50&offset=50` (página 2 de 50) |
| Filtrado | `?role=admin&status=active` |
| Ordenación | `?sort=-createdAt` |
| Múltiples queries combinadas | `?include=images,reviews&exclude=stock` |

> Separa parámetros con `&`. Piensa en el tamaño de la respuesta y ofrece formas de limitarla.

---

## 3. Métodos / verbos HTTP

Cada verbo REST mapea a una **acción** que pides al servidor.

| Acción UI | Verbo HTTP | Operación BD | Idempotente | Seguro |
|-----------|------------|--------------|-------------|--------|
| Ver       | `GET`      | Read         | Sí          | Sí     |
| Borrar    | `DELETE`   | Delete       | Sí          | No     |
| Añadir    | `POST`     | Create       | No          | No     |
| Editar (entero) | `PUT`  | Update       | Sí          | No     |
| Editar (parcial) | `PATCH` | Update    | Debería sí (varía) | No |

- **Seguro**: no modifica el estado del servidor.
- **Idempotente**: llamar N veces produce el mismo resultado que llamar 1 vez.

> **Solo existe un `GET`**: no hay "get list" vs "get single". La diferencia se expresa en la URL (`/items` vs `/items/1`), no en el verbo.

### 3.1. POST vs PUT vs PATCH

| Aspecto         | POST                                              | PUT                              | PATCH                                |
|-----------------|---------------------------------------------------|----------------------------------|--------------------------------------|
| **Uso previsto** | Crear nuevo recurso                              | Reemplazar/actualizar entero     | Actualización parcial                |
| **Idempotente** | No (cada llamada crea un recurso con nuevo ID)    | Sí                               | Pretendida sí, implementaciones varían |
| **Adopción**    | Universal                                         | Universal                        | Inconsistente, baja en APIs públicas grandes |

> **Recomendación práctica**: usar `PUT` tanto para actualizaciones completas como parciales si te preocupa la consistencia entre clientes/librerías.

---

## 4. Respuestas

Toda respuesta REST tiene dos componentes principales: un **cuerpo** (opcional) y un **código de estado** (obligatorio).

### 4.1. Tipos de cuerpo de respuesta

Hay tres opciones habituales:

1. **Datos del recurso** — devolver el/los items solicitados. Es lo más común, sobre todo en `GET`.
2. **Mensaje de estado** — texto descriptivo de lo ocurrido (p. ej. `"item created with id 42"`, `"item deleted successfully"`).
3. **Sin contenido** — solo el código de estado, sin cuerpo (típico en `DELETE` con `204`).

### 4.2. Códigos de estado HTTP

Todo código va de **100 a 599** y se agrupa por centenas. Existen ~75 códigos definidos, pero en la práctica se usan menos de 20 con regularidad.

| Rango   | Significado        | Uso |
|---------|--------------------|-----|
| **1xx** | Informativos       | Muy raros (handshake, switching protocols). |
| **2xx** | Éxito              | Operación completada correctamente. |
| **3xx** | Redirección        | El recurso vive en otro sitio o no ha cambiado. |
| **4xx** | Error del cliente  | La petición está mal hecha. |
| **5xx** | Error del servidor | El servidor ha fallado al procesar una petición válida. |

> Lista completa: [IANA HTTP Status Code Registry](https://www.iana.org/assignments/http-status-codes/http-status-codes.xhtml).

#### 1xx — Informativos
Pocas veces relevantes en una API REST. Ejemplos: `100 Continue`, `101 Switching Protocols`.

#### 2xx — Éxito

| Código | Nombre        | Uso típico |
|--------|---------------|-----------|
| `200`  | OK            | Éxito con cuerpo. Habitual en `GET`. |
| `201`  | Created       | Recurso creado. Típico en `POST`. Conviene incluir el header `Location: /items/<id>`. |
| `204`  | No Content    | Éxito sin cuerpo. Típico en `DELETE`, `PUT`, `PATCH`. |

#### 3xx — Redirección

| Código | Nombre              | Uso típico |
|--------|---------------------|-----------|
| `301`  | Moved Permanently   | Forzar la migración a una nueva URL (p. ej. fin de soporte de `v1` → `v2`). |
| `304`  | Not Modified        | El cliente ya tiene la versión vigente (cache hit). |
| `307`  | Temporary Redirect  | Redirección temporal (mantenimiento, traslado puntual de tráfico). |

#### 4xx — Errores del cliente
Muy utilizados: sirven para comunicarle al cliente **qué ha hecho mal**.

| Código | Nombre               | Uso típico |
|--------|----------------------|-----------|
| `400`  | Bad Request          | Genérico: parámetros faltantes o mal formateados. Acompañar de mensaje aclaratorio. |
| `401`  | Unauthorized         | No autenticado. Cuidado al detallar mensajes (compromiso seguridad/UX). |
| `403`  | Forbidden            | Autenticado, pero **sin permisos** suficientes. |
| `404`  | Not Found            | El recurso no existe. |
| `405`  | Method Not Allowed   | Verbo HTTP no soportado en ese endpoint (p. ej. `POST` en uno solo de lectura). |
| `406`  | Not Acceptable       | El cliente pide la **respuesta** en un formato que el servidor no soporta (header `Accept`). |
| `409`  | Conflict             | Conflicto con el estado actual del recurso (p. ej. recurso duplicado). |
| `415`  | Unsupported Media Type | El cliente envía datos en un formato que el servidor no soporta (header `Content-Type`). |
| `422`  | Unprocessable Entity | Sintaxis válida pero contenido semánticamente incorrecto (validaciones de negocio). |

> Diferencia clave **406 vs 415**: 406 = el servidor no puede **responder** en el formato pedido; 415 = el servidor no puede **leer** el formato enviado.

#### 5xx — Errores del servidor
Mantener **mensajes mínimos** por seguridad (no exponer stack traces).

| Código | Nombre                | Uso típico |
|--------|-----------------------|-----------|
| `500`  | Internal Server Error | Error genérico. Incluir como mucho un `correlationId` para que el cliente lo reporte. |
| `501`  | Not Implemented       | Funcionalidad anunciada pero aún no operativa ("coming soon"). |
| `502`  | Bad Gateway           | Servidor intermedio recibió una respuesta inválida del upstream. |
| `503`  | Service Unavailable   | Servidor saturado o en mantenimiento. |

### 4.3. Convenciones por verbo

| Verbo    | Éxito típico                                     | Notas |
|----------|--------------------------------------------------|-------|
| `GET`    | `200 OK` con el recurso/colección                | `404` si no existe. |
| `POST`   | `201 Created` + header `Location: /items/<id>`   | `200` si devuelve algo procesado. |
| `PUT`    | `200 OK` (con cuerpo) o `204 No Content`         | `201` si el `PUT` crea el recurso. |
| `PATCH`  | `200 OK` o `204 No Content`                      | — |
| `DELETE` | `204 No Content`                                 | `404` si no existe. |

---

## 5. Content types

REST permite intercambiar muchos formatos distintos en peticiones y respuestas. El catálogo oficial lo mantiene la **IANA** (Internet Assigned Numbers Authority): miles de tipos y subtipos.

> Lista completa: [IANA Media Types](https://www.iana.org/assignments/media-types/media-types.xhtml).

### 5.1. Formato

Un content type sigue siempre el patrón:

```
category/subtype
```

Ejemplos: `text/html`, `application/json`, `image/png`.

### 5.2. Categorías principales

Hay muchas categorías padre, pero las relevantes para una API REST son pocas.

| Categoría     | Para qué sirve                                        | Subtipos típicos |
|---------------|-------------------------------------------------------|------------------|
| `text/*`      | Contenido legible por humanos.                        | `text/plain`, `text/html`, `text/css`, `text/javascript` |
| `font/*`      | Tipografías (uso casi exclusivo en web).              | `font/woff`, `font/woff2`, `font/ttf` |
| `application/*` | "Cajón de sastre" para datos binarios o que requieren una app concreta. **La categoría más usada en APIs REST.** | `application/json`, `application/xml`, `application/pdf`, `application/octet-stream` |
| `audio/*`     | Audio.                                                | `audio/mpeg`, `audio/wav` |
| `image/*`     | Imágenes.                                             | `image/png`, `image/jpeg`, `image/svg+xml` |
| `video/*`     | Vídeo.                                                | `video/mp4`, `video/webm` |

> En este curso/proyecto trabajaremos principalmente con `application/json` (y, puntualmente, `application/xml`).

### 5.3. Cómo se usan: cabeceras (headers)

Las cabeceras son pares **clave-valor** que acompañan a la petición o la respuesta con instrucciones adicionales. Para los content types nos interesan dos:

#### `Accept` — qué quiere recibir el cliente

El cliente le indica al servidor en qué formato espera la respuesta.

```http
GET /api/v1/items/1 HTTP/1.1
Accept: application/xml
```

> El servidor **no está obligado** a respetarlo. Muchas APIs solo soportan un formato (típicamente JSON) y devolverán `406 Not Acceptable` si el cliente pide otra cosa.

#### `Content-Type` — qué formato lleva el cuerpo

Se usa tanto en **peticiones** (lo que envía el cliente) como en **respuestas** (lo que devuelve el servidor).

Cliente enviando datos:

```http
POST /api/v1/items HTTP/1.1
Content-Type: application/xml

<item><name>Tent</name></item>
```

Servidor respondiendo:

```http
HTTP/1.1 200 OK
Content-Type: application/json

{"id":1,"name":"Tent"}
```

> Si el servidor recibe un `Content-Type` que no soporta, responde con `415 Unsupported Media Type` (ver sección 4.2).

### 5.4. Resumen rápido

| Cabecera        | Quién la pone        | Qué dice                                  | Error si no se respeta |
|-----------------|----------------------|-------------------------------------------|------------------------|
| `Accept`        | Cliente              | "Quiero la respuesta en este formato"     | `406 Not Acceptable`   |
| `Content-Type`  | Cliente o servidor   | "El cuerpo que envío está en este formato" | `415 Unsupported Media Type` |

---

## 6. Clientes y servidores REST

### 6.1. ¿Qué diferencia a un cliente de un servidor?

La distinción **no es de hardware** (CPU, RAM, tamaño físico) sino de **comportamiento**:

| Aspecto                | Servidor                                         | Cliente                                          |
|------------------------|--------------------------------------------------|--------------------------------------------------|
| Disponibilidad esperada| Siempre encendido y accesible.                   | Puede estar apagado o desconectado.              |
| Quién inicia           | Espera y **responde** a peticiones.              | **Inicia** la petición.                          |
| Garantía de respuesta  | Se asume que estará disponible.                  | No se asume; el servidor no le hace peticiones.  |

> En REST, el servidor no llama al cliente: solo responde. Si necesitas push del servidor al cliente, eso ya cae fuera del paradigma REST puro (WebSockets, SSE, webhooks).

### 6.2. Tipos de clientes

| Tipo                                  | Características                                          | Implicación de diseño                                                                 |
|---------------------------------------|----------------------------------------------------------|--------------------------------------------------------------------------------------|
| **Computadoras** (laptop, desktop, otro servidor) | Potencia alta, conexión estable, mucha data.   | Clientes "fiables"; puedes devolver respuestas grandes sin problema.                 |
| **Móviles** (smartphones, tablets)    | Potentes pero **conexión inestable** y a veces lenta.    | **Diseñar para resiliencia**: reintentos, timeouts razonables, respuestas compactas. |
| **IoT** (electrodomésticos, sensores, wearables) | CPU/memoria muy limitadas, conexión variable. | **Payloads pequeños** y endpoints simples. Evitar respuestas enormes.                |

### 6.3. Tipos de servidores

- **Dinámicos** — atados a una fuente de datos que cambia (BD, otra API, etc.). Son la **gran mayoría** de las APIs REST.
- **Estáticos** — no permiten modificar los datos. Algunos casos típicos:
  - **Servidor de ficheros**: simplemente sirve documentos estáticos.
  - **Mock server**: usa un JSON como fuente de datos, útil para testing/desarrollo sin backend real.

> El tamaño/potencia del servidor no determina si puede soportar REST. Incluso chips diminutos de IoT pueden actuar como servidor REST (aunque no son recomendables para producción).

### 6.4. ¿En qué lenguaje implementar la API?

**El que ya conozcas**: prácticamente todos los lenguajes modernos tienen soporte sólido para REST.

Ejemplos habituales: **Python**, **JavaScript / Node.js**, **TypeScript**, **Java**, **Kotlin**, **C#**, **Go**, **Ruby**, **Rust**, **PHP**.

> En los ejercicios de este curso usaremos **Node.js + Express** (ver el `README.md` de cada ejercicio en [`../exercises/`](../exercises/)).

---

## 7. Buenas prácticas REST (resumen)

- **Nombres de recursos en plural** (`/users`, no `/user`).
- **Sin verbos en la URI**: el verbo lo aporta el método HTTP (`POST /users`, no `/createUser`).
- **Jerarquías claras**: `/users/42/orders` para relaciones.
- **Versionado**: prefijo `/api/v1/...` para evolucionar sin romper clientes.
- **Filtrado, paginación y orden por query string**: `/users?role=admin&page=2&limit=20&sort=-createdAt`.
- **Códigos HTTP correctos** y cuerpos de error consistentes (`{ "error": "...", "code": "..." }`).
- **Validación de entrada** (puedes usar `zod`, `joi` o `express-validator`).
- **Idempotencia** real en `PUT` y `DELETE`.
- **Documentación**: OpenAPI / Swagger.

---

## 8. Filosofía de diseño

> *"Programs must be written for people to read, and only incidentally for machines to execute."*
> — **Hal Abelson** (MIT)

Prioriza la **legibilidad y usabilidad** para los desarrolladores que consumirán tu API por encima de una adherencia estricta al estándar REST.

---

<!-- Próximas secciones de teoría: versionado, autenticación/autorización, HATEOAS, caching, rate limiting, etc. -->
<!-- El caso práctico continúa en exercises/01-carved-rock-fitness/DESIGN.md -->
