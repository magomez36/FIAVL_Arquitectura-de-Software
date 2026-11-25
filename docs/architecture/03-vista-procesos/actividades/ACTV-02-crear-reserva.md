# ACTV-02 · Validar y confirmar una reserva

**Casos** CU-12. Hace visibles las ramas de validación, evento, aforo y excepción. La decisión de aforo ocurre dentro de la transacción.

<!-- diagram: ACTV-02 -->

```mermaid
---
config:
  theme: neutral
---
flowchart TD
  I([Inicio]) --> U["Validar selección y cantidad en UI"]
  U --> Q{"¿Entrada local utilizable?"}
  Q -->|No| E["Mostrar error local"] --> F([Fin])
  Q -->|Sí| P["POST /api/reservations · analizar JSON y validar esquema"]
  P --> G{"¿Cuerpo válido y dentro del límite?"}
  G -->|No| RE["400 o 413"] --> F
  G -->|Sí| L["Generar referencia y hora · BEGIN IMMEDIATE"]
  L --> J{"¿Se adquirió la transacción?"}
  J -->|No| RE500["500 · sin transacción iniciada"] --> F
  J -->|Sí| B["Leer evento"]
  B --> D{"¿Evento existe y admite reserva?"}
  D -->|No| N["COMMIT sin escritura · 404 o 422"] --> F
  D -->|Sí| S["Sumar reservas activas"]
  S --> K{"¿Cantidad ≤ saldo?"}
  K -->|No| X["COMMIT sin escritura · 409"] --> F
  K -->|Sí| Z["INSERT reserva activa con hash"]
  Z --> C["COMMIT"]
  C --> H["201 con referencia y saldo"]
  H --> M["Confirmar, intentar conservar referencia y releer saldo"] --> F
  B -.->|Excepción| Y["ROLLBACK · 500"]
  S -.->|Excepción| Y
  Z -.->|Excepción| Y
  C -.->|Excepción| Y
  Y --> F
```

Las salidas de los rombos llevan condiciones y los nodos redondeados delimitan el inicio y el fin de la actividad. [apps/api/src/services/reservations.ts](../../../../apps/api/src/services/reservations.ts), [apps/api/src/repositories/reservations.ts](../../../../apps/api/src/repositories/reservations.ts), [tests/reservations.test.ts](../../../../tests/reservations.test.ts).
