# rest-fundamentals

Curso autodidacta de **REST con Node.js + Express** organizado en dos bloques: **teoría** y **ejercicios prácticos**.

Basado parcialmente en el curso [REST Fundamentals de Pluralsight](https://www.pluralsight.com/) (repo base: [`neuhoffm/ps-rest-fundamentals`](https://github.com/neuhoffm/ps-rest-fundamentals)).

## Estructura

```
rest-intro/
├── theory/                            # Teoría general (independiente de cualquier ejercicio)
│   └── 01-fundamentals.md             # Fundamentos: URL, verbos, respuestas, content types…
└── exercises/                         # Ejercicios prácticos
    ├── 01-carved-rock-fitness/        # Ejercicio 1: nuestro sandbox limpio
    │   ├── README.md                  # Cómo arrancar este ejercicio
    │   ├── DESIGN.md                  # Contexto, modelo de datos y blueprint de endpoints
    │   ├── package.json
    │   ├── server.js
    │   └── node_modules/
    └── ps-rest-fundamentals/          # Repo base del curso (clon de Pluralsight)
        ├── server/                    # Backend del curso (aquí se programa)
        ├── frontend/                  # Frontend de demo
        └── …                          # Tiene branches por módulo: m3-before/after, m4-…
```

Cada ejercicio es un **mini-proyecto Node independiente** con su propio `package.json` y dependencias. Eso permite tener distintas versiones y configuraciones por ejercicio sin que se interfieran.

## Bloque 1 — Teoría

| # | Documento | Contenido |
|---|-----------|-----------|
| 01 | [`theory/01-fundamentals.md`](./theory/01-fundamentals.md) | ¿Qué es REST? · Anatomía de una URL · Verbos HTTP · Respuestas y códigos de estado · Content types · Clientes y servidores · Buenas prácticas · Filosofía de diseño |

> A medida que avancemos en el curso, añadiremos aquí más documentos (versionado, autenticación, HATEOAS, caching, rate limiting, etc.).

## Bloque 2 — Ejercicios prácticos

| # | Ejercicio | Descripción |
|---|-----------|-------------|
| 01 | [`exercises/01-carved-rock-fitness/`](./exercises/01-carved-rock-fitness/) | Diseñar y construir una API REST para **Carved Rock Fitness**, un retailer de equipamiento outdoor con tres perfiles de usuario (cliente final, cajero, stockroom). Sandbox limpio. |
| — | [`exercises/ps-rest-fundamentals/`](./exercises/ps-rest-fundamentals/) | **Repo base oficial** del curso [Pluralsight REST Fundamentals](https://github.com/neuhoffm/ps-rest-fundamentals) (autor: `neuhoffm`). Contiene `server/` (backend a programar) y `frontend/` (demo). Las branches están organizadas por módulo: `m3-before` / `m3-after`, `m4-before` / `m4-after`, etc. Usar `git checkout <branch>` para cambiar entre puntos del curso. |

### Branches del repo (replicadas del upstream)

En lugar de mantener un sub-repo dentro de `exercises/ps-rest-fundamentals/`, este repositorio replica directamente las branches del curso. Cambia de branch desde la raíz para que `exercises/ps-rest-fundamentals/` muestre el estado correspondiente:

| Branch | Estado del subproyecto |
|--------|------------------------|
| `main`        | Snapshot por defecto (= `m3-before`). Punto de entrada del repo. |
| `m3-before`   | Estado inicial del módulo 3 |
| `m3-after`    | Estado final del módulo 3 (solución del instructor) |
| `m4-before`   | Estado inicial del módulo 4 |
| `m4-after`    | Estado final del módulo 4 |
| `m5-before`   | Estado inicial del módulo 5 |
| `m5-after`    | Estado final del módulo 5 |
| `m6-before`   | Estado inicial del módulo 6 |
| `m6-after`    | Estado final del módulo 6 |
| `m8-before`   | Estado inicial del módulo 8 |
| `m8-after`    | Estado final del módulo 8 |

> La teoría (`theory/`) y nuestro sandbox (`exercises/01-carved-rock-fitness/`) se mantienen idénticos en todas las branches. Solo cambia `exercises/ps-rest-fundamentals/`.

```bash
# Ver branches disponibles
git branch -a

# Saltar al inicio del módulo 5
git checkout m5-before

# Instalar dependencias del backend del curso
cd exercises/ps-rest-fundamentals/server && npm install
```

Requisitos del subproyecto: **Node.js >= 20**.

## Requisitos generales

- **Node.js >= 18**
- **npm**

Cada ejercicio tiene sus propias instrucciones en su `README.md`.
