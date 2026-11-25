# CU-10 · Revisar mi programa y sus solapamientos

**Actor** Visitante (ACT-01). **Spec** 5. Recuperar el programa y detectar conflictos de horarios.

<!-- diagram: CU-10 -->

```mermaid
---
config:
  theme: neutral
---
sequenceDiagram
actor V as Visitante
participant U as Mi agenda
participant S as localStorage
participant H as getResource
participant A as API de catálogo
participant D as SQLite
V->>U: Abrir o recargar /mi-agenda
U->>S: readLocal agenda y parseIds
alt Datos válidos
  S-->>U: IDs únicos
else Ausencia, corrupción o bloqueo
  S-->>U: undefined, iniciar agenda vacía
end
loop Montaje o reintento
  par Eventos
    U->>H: Solicitar events
    H-)A: GET /api/events
    A->>D: Leer eventos
    D-->>A: Filas
    A-->>H: JSON o error
  and Sedes
    U->>H: Solicitar venues
    H-)A: GET /api/venues
    A->>D: Leer sedes
    D-->>A: Filas
    A-->>H: JSON o error
  end
  H->>H: Validar ambas listas
  alt Lecturas válidas y vigentes
    H-->>U: Catálogo
    U->>U: resolveAgenda y conflictsOf
    U-->>V: Programa ordenado o vacío y avisos de solapamiento o IDs ausentes
  else Fallo de lectura o contrato
    U-->>V: Alerta y Reintentar
  end
end
```

Lectura de SQLite para el catálogo y de `fiavl:agenda:v1` para la selección.

[Catálogo detallado](../../analysis/02-actores-y-casos-de-uso.md) · [Vista de procesos](../README.md).
