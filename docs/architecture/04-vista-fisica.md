# Vista física

## FIS-01 · Despliegue local documentado

El diagrama muestra la topología local reproducible. El navegador y los dos procesos de servidor comparten la computadora anfitriona. El motor de datos se ejecuta dentro del proceso Node.js. La flecha de Express a SQLite resume el acceso síncrono que pasa por servicios y repositorios, detallado en la [vista de desarrollo](02-vista-desarrollo.md).

<!-- diagram: FIS-01 -->

```mermaid
---
config:
  theme: neutral
---
flowchart TB
  subgraph HOST["Computadora anfitriona"]
    direction TB
    BOOT["fiavl.cmd → bootstrap.ps1<br/>runtime, npm ci y db:seed"]
    subgraph B["Navegador"]
      APP["React, Router y JS/CSS<br/>Origen 127.0.0.1:5173"]
      LS[("localStorage del origen")]
      APP --> LS
    end
    VITE["Proceso Vite · desarrollo o preview<br/>127.0.0.1:5173 · strictPort"]
    subgraph N["Proceso Node.js · backend"]
      HTTP["Express · 127.0.0.1:3001"]
      SQLITE["node:sqlite · DatabaseSync"]
      HTTP -->|llamadas síncronas| SQLITE
    end
    FILE[("apps/api/data/fiavl.sqlite<br/>o ruta FIAVL_DB")]
    WEB["apps/web/dist/<br/>HTML, JS, CSS y recursos"]
    API["apps/api/dist/<br/>JavaScript ESM"]
    MIG["apps/api/migrations/ y<br/>workspace @fiavl/contracts"]
    BOOT -.->|"modo inicio"| VITE
    BOOT -.->|"modo inicio"| HTTP
    APP <-->|"HTTP: documento, recursos y /api"| VITE
    VITE ==>|"proxy /api · HTTP JSON"| HTTP
    SQLITE -->|I/O de archivo| FILE
    WEB -.->|servido en preview| VITE
    API -.->|entrada compilada opcional| HTTP
    MIG -.->|"carga al arrancar / imports"| HTTP
  end
```

| Entorno | Arranque y artefactos |
|---|---|
| Desarrollo Windows | `fiavl.cmd` ejecuta PowerShell, resuelve Node **24.22.3** y npm **11.17.0**, prepara dependencias y ejecuta `db:seed -- --if-empty`. El modo inicio lanza `npm run dev`, que arranca Vite y la API TypeScript mediante `node --watch`. |
| Desarrollo manual | El flujo del README fija el runtime, usa `npm ci`, prepara la semilla y lanza `npm run dev`. El arranque ordinario de `server.ts` migra. La semilla proviene del paso previo. |
| Compilación y preview | TypeScript emite `apps/api/dist/`. Vite genera `apps/web/dist/`. La comprobación manual prevista usa `node apps/api/dist/server.js` y Vite preview con las mismas direcciones y proxy. El backend conserva dependencia del workspace de contratos, sus paquetes y las migraciones. |
| Base y preferencias | SQLite usa `apps/api/data/fiavl.sqlite` por defecto. `FIAVL_DB` permite cambiar su ubicación, con preferencia del entorno sobre `.env`. Las claves de `localStorage` corresponden al origen de la página, incluido el puerto. |
| Despliegue futuro | Para otro servidor de estáticos habría que mantener el enrutamiento de la SPA y la redirección de `/api` hacia Express. El modelo representa el entorno local versionado. |

Los puertos efectivos se encuentran en [Vite](../../apps/web/vite.config.ts) y [servidor Node.js](../../apps/api/src/server.ts). La resolución de datos se implementa en [db.ts](../../apps/api/src/db.ts) y [seed-cli.ts](../../apps/api/src/seed-cli.ts). Los requisitos y modos de Windows se implementan en [fiavl.cmd](../../fiavl.cmd) y [bootstrap.ps1](../../scripts/bootstrap.ps1). La [configuración de compilación](../../apps/api/tsconfig.build.json) determina el artefacto de API.
