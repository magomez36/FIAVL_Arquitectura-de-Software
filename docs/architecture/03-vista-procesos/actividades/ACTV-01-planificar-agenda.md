# ACTV-01 · Planificar la agenda y detectar conflictos

**Casos** CU-09, CU-10. Expone el ciclo de edición, guardado tolerante a fallos y revisión de conflictos. La lectura fallida se puede reintentar con la selección local intacta.

<!-- diagram: ACTV-01 -->

```mermaid
---
config:
  theme: neutral
---
flowchart TD
  I([Inicio]) --> S0["Leer IDs guardados del navegador"]
  S0 --> R["Solicitar eventos y sedes"]
  R --> C{"¿Catálogo disponible?"}
  C -->|No| E["Mostrar error y permitir reintento"]
  E -->|Reintentar| R
  E -->|Salir| F([Fin])
  C -->|Sí| D["Resolver IDs, conservar ausentes y ordenar"]
  D --> O{"¿Editar la selección?"}
  O -->|Sí| M["Agregar sin duplicados, quitar o limpiar IDs ausentes"]
  M --> N["Actualizar React e intentar guardar en localStorage"]
  N --> W{"¿Se guardó?"}
  W -->|No| A["Anunciar que se perderá al recargar"] --> D
  W -->|Sí| D
  O -->|Revisar| S{"¿Hay intervalos que se cruzan<br/>con desigualdad estricta?"}
  S -->|Sí| H["Anunciar eventos en conflicto"]
  S -->|No| T["Mostrar programa sin aviso, o agenda vacía"]
  H --> O
  T --> O
  O -->|Salir| F
```

Las salidas de los rombos llevan condiciones y los nodos redondeados delimitan el inicio y el fin de la actividad. [apps/web/src/features/mi-agenda/index.tsx](../../../../apps/web/src/features/mi-agenda/index.tsx), [apps/web/src/features/mi-agenda/logic.ts](../../../../apps/web/src/features/mi-agenda/logic.ts), [tests/spec-05.test.ts](../../../../tests/spec-05.test.ts).
