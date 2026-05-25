# Ejercicio 01 · Carved Rock Fitness API

Primer ejercicio del curso: diseñar y construir una API REST para **Carved Rock Fitness**, un retailer de equipamiento outdoor.

El diseño completo del API (contexto, personas, modelo de datos, blueprint de endpoints) está en [`DESIGN.md`](./DESIGN.md). Este `README` solo cubre **cómo arrancar y trabajar el ejercicio**.

> Antes de empezar, conviene haber leído la teoría en [`../../theory/01-fundamentals.md`](../../theory/01-fundamentals.md).

## Requisitos

- Node.js >= 18
- npm

## Instalación

Desde este directorio:

```bash
npm install
```

## Ejecución

Modo producción:

```bash
npm start
```

Modo desarrollo (recarga automática al cambiar `server.js`):

```bash
npm run dev
```

El servidor arranca por defecto en `http://localhost:3000`. Puedes cambiar el puerto con la variable de entorno `PORT`:

```bash
PORT=4000 npm start
```

## Endpoint actual

El servidor parte de un esqueleto mínimo:

- `GET /health` → `{ "status": "ok", "uptime": <segundos> }`

Cualquier otra ruta responde con `404 Not Found`.

## Próximos pasos

Implementar los endpoints definidos en `DESIGN.md`:

- `items`: `GET`, `POST`, `GET /:id`, `PUT /:id`, `DELETE /:id`
- `customers`: `GET`, `POST`, `GET /:id`, `PUT /:id`, `DELETE /:id`, `GET /search`, `GET /:id/orders`
- `orders`: `GET`, `POST`, `GET /:id`, `PUT /:id`, `DELETE /:id`
- `orderItems`: `POST /orders/:id/items`, `DELETE /orders/:id/items/:itemId`

## Estructura

```
01-carved-rock-fitness/
├── README.md          # este fichero (cómo arrancar)
├── DESIGN.md          # contexto, personas, modelo de datos y blueprint
├── package.json
├── package-lock.json
├── server.js          # esqueleto del servidor
└── node_modules/
```
