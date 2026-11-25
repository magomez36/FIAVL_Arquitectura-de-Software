# ACTV-05 · Validar y confirmar una valoración

**Casos** CU-21. Distingue validación cliente/servidor, persistencia y confirmación del recibo. El reintento del formulario puede ocurrir tras una respuesta no confirmada.

<!-- diagram: ACTV-05 -->

```mermaid
---
config:
  theme: neutral
---
flowchart TD
  I([Inicio]) --> E["Elegir puntuación y escribir comentario opcional"]
  E --> C{"¿Cumple el esquema en el navegador?"}
  C -->|No| O["Mostrar indicación de corrección"] --> E
  C -->|Sí| P["Bloquear envío mientras espera y enviar POST /api/feedback"]
  P --> B{"¿JSON válido, límite 8 KiB y esquema válido?"}
  B -->|No| R["400 o 413"]
  B -->|Sí| K["INSERT rating y comentario recortado o NULL"]
  K --> M{"¿INSERT correcto?"}
  M -->|Sí| S["201 con accepted: true"]
  M -->|No| T["500"]
  S --> Q{"¿El navegador verifica el recibo?"}
  R --> X["Mostrar aviso; permitir reintento"]
  T --> X
  Q -->|No| X
  Q -->|Sí| A["Confirmar y disparar lectura del resumen"] --> F([Fin])
  X -->|Corregir o reintentar| E
  X -->|Salir| F
```

Las salidas de los rombos llevan condiciones y los nodos redondeados delimitan el inicio y el fin de la actividad. [apps/web/src/features/opiniones/index.tsx](../../../../apps/web/src/features/opiniones/index.tsx), [apps/api/src/features/feedback.ts](../../../../apps/api/src/features/feedback.ts), [apps/api/src/services/feedback.ts](../../../../apps/api/src/services/feedback.ts), [tests/feedback.test.ts](../../../../tests/feedback.test.ts).
