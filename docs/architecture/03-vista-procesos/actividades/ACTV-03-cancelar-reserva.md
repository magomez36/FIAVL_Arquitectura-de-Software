# ACTV-03 · Cancelar una reserva de forma idempotente

**Casos** CU-14. Distingue el cambio de activa a cancelada de una solicitud repetida. El saldo vuelve a calcularse a partir de las activas.

<!-- diagram: ACTV-03 -->

```mermaid
---
config:
  theme: neutral
---
flowchart TD
  I([Inicio]) --> R["Tomar referencia guardada o manual"]
  R --> X{"¿Entrada manual vacía?"}
  X -->|Sí| E["Pedir referencia"] --> F([Fin])
  X -->|No| S["POST cancel · validar formato en servicio"]
  S --> V{"¿Formato válido?"}
  V -->|No| T["400 INVALID_ID"] --> F
  V -->|Sí| B["Calcular SHA-256 y abrir BEGIN IMMEDIATE"]
  B --> D["Buscar reserva por hash"]
  D --> Q{"¿Estado de la referencia?"}
  Q -->|Ausente| N["COMMIT sin cambios · 404"] --> F
  Q -->|Activa| A["UPDATE condicional, con fecha de cancelación"] --> L["Leer resultado y COMMIT"]
  Q -->|Ya cancelada| L
  L --> H["200 con reserva cancelada"]
  H --> U["Actualizar UI y releer disponibilidad"] --> F
  D -.->|Excepción tras BEGIN| Y["ROLLBACK · 500"]
  A -.->|Excepción tras BEGIN| Y
  L -.->|Excepción antes de confirmar| Y
  B -.->|Fallo al abrir| O["500"] --> F
  Y --> F
```

Las salidas de los rombos llevan condiciones y los nodos redondeados delimitan el inicio y el fin de la actividad. [apps/api/src/services/reservations.ts](../../../../apps/api/src/services/reservations.ts), [apps/api/src/repositories/reservations.ts](../../../../apps/api/src/repositories/reservations.ts), [tests/reservations.test.ts](../../../../tests/reservations.test.ts).
