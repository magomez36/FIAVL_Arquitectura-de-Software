# Vista de desarrollo

## DES-01 · Componentes y responsabilidades

La línea gruesa representa el intercambio HTTP en ejecución. Las líneas de trazo fino continuo representan llamadas y uso interno. Las líneas discontinuas muestran composición o dependencias estáticas. El proxy y los puertos se detallan en la vista física.

<!-- diagram: DES-01 -->

```mermaid
---
config:
  theme: neutral
---
flowchart TB
  subgraph W["Presentación · navegador"]
    direction TB
    APP["React Router, portada y nueve páginas<br/>Stage, Status y guía editorial"]
    CLIENT["Adaptadores HTTP<br/>getResource, postJson y fetch"]
    STORE["readLocal y writeLocal"]
    LS[("localStorage · 3 claves activas")]
    APP --> CLIENT
    APP --> STORE --> LS
  end
  subgraph B["Servidor · proceso Node.js"]
    direction TB
    HT["Express · catálogo, reservas y feedback"]
    CAT["Servicio de catálogo"]
    RES["Servicio de reservas"]
    FEE["Servicio de feedback"]
    RC["Repositorio de catálogo"]
    RR["Repositorio de reservas"]
    RF["Repositorio de feedback"]
    DB[("SQLite embebido")]
    COM["Composición raíz"]
    HT --> CAT --> RC --> DB
    HT --> RES --> RR --> DB
    HT --> FEE --> RF --> DB
    COM -.->|"inyecta operaciones"| HT
    COM -.->|"conecta servicios y repositorios"| RES
  end
  Z["Biblioteca Zod y DTO<br/>@fiavl/contracts"]
  CLIENT ==>|"HTTP /api · JSON"| HT
  W -.->|"importa esquemas y tipos"| Z
  B -.->|"importa esquemas y tipos"| Z
```

La composición raíz entrega operaciones a Express e inyecta las implementaciones de repositorio en los servicios de catálogo, reservas y feedback. La flecha de composición hacia reservas ilustra este patrón. React valida la información recibida mediante esquemas. Los servicios validan las entradas pertinentes y el repositorio de catálogo valida sus proyecciones. Los contratos se importan como biblioteca. [Composición](../../apps/api/src/composition.ts), [router raíz](../../apps/api/src/app.ts), [cliente HTTP](../../apps/web/src/lib/http.ts), [contratos](../../packages/contracts/src/index.ts).

## DES-02 · Paquetes y dependencias estáticas

Los recintos representan paquetes npm y las rutas muestran la organización del repositorio. Las flechas continuas representan importaciones o referencias internas principales. Las discontinuas añaden dependencias de tipos, lectura de archivos o uso por herramientas. La comunicación HTTP se muestra en DES-01.

<!-- diagram: DES-02 -->

```mermaid
---
config:
  theme: neutral
---
flowchart TB
  ROOT["package.json y lock raíz<br/>workspaces apps/* y packages/*"]
  subgraph W["apps/web · @fiavl/web"]
    direction TB
    ENTRY["index.html · src/main.tsx · src/Home.tsx"]
    FE["src/features/<br/>index.ts, types.ts y nueve carpetas"]
    CO["src/components/<br/>Stage, Status, StageCarousel, FestivalGuide"]
    LIB["src/lib/<br/>http, storage, festival2026"]
    PUB["public/<br/>art e images"]
    WC["vite.config.ts"]
    ENTRY --> FE
    ENTRY --> CO
    FE --> CO
    FE --> LIB
    CO --> LIB
    WC -.-> ENTRY
    ENTRY -.-> PUB
    FE -.-> PUB
  end
  subgraph A["apps/api · @fiavl/api"]
    direction TB
    SERVER["src/server.ts"]
    CMAIN["src/composition.ts y src/composition/"]
    HT["src/app.ts y src/features/"]
    SVC["src/catalog.ts y src/services/"]
    REP["src/repositories/"]
    DBC["src/db.ts · seed.ts · seed-cli.ts"]
    MIG["migrations/<br/>001, 006, 010"]
    SERVER --> CMAIN
    SERVER --> DBC
    CMAIN --> HT
    CMAIN --> SVC
    CMAIN --> REP
    HT -.->|tipos de operaciones| SVC
    REP -.->|interfaces de repositorio| SVC
    DBC -.->|lee SQL numerado| MIG
  end
  P["@fiavl/contracts<br/>packages/contracts/src/index.ts"]
  T["tests/<br/>Node, integraciones HTTP, bootstrap y e2e"]
  CI["fiavl.cmd · scripts/<br/>.github/workflows/ci.yml"]
  ROOT -.-> W
  ROOT -.-> A
  ROOT -.-> P
  A -.->|importa workspace| P
  W -.->|importa workspace| P
  T -.-> W
  T -.-> A
  T -.-> P
  CI -.-> T
```

`apps/web` y `apps/api` dependen del workspace `@fiavl/contracts`. Los repositorios importan desde negocio las interfaces que implementan. En ejecución los servicios llaman al repositorio inyectado. Los scripts y las pruebas se ubican en la raíz y ejercitan los paquetes. [Manifest raíz](../../package.json), [Web](../../apps/web/package.json), [API](../../apps/api/package.json), [contratos](../../packages/contracts/package.json), [configuración de Playwright](../../playwright.config.ts).
