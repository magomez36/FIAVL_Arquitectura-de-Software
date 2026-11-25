# CU-01 · Descubrir la edición demo

**Actor** Visitante (ACT-01). **Spec** 1. Reconocer la edición y llegar a una sección o a la selección demo.

<!-- diagram: CU-01 -->

```mermaid
---
config:
  theme: neutral
---
sequenceDiagram
actor V as Visitante
participant U as Shell y Home
participant C as StageCarousel
participant H as getResource
participant A as API de catálogo
participant D as SQLite
V->>U: Abrir /
par Escena y navegación
  U->>C: Montar con agendaAvailable
  C-->>V: Mostrar escena, fecha y destino
  loop Mientras la portada está abierta
    alt Reproducción habilitada durante 7 s
      C->>C: Avanzar y reprogramar temporizador
    else Foco, puntero, pestaña oculta, pausa o movimiento reducido
      C->>C: Detener temporizador
    else Acción manual
      V->>C: Elegir escena o destino
      C-->>V: Actualizar escena o navegar
    end
  end
and Selección del prototipo
  loop Montaje o reintento
    U->>H: Selection solicita events
    H-)A: GET /api/events
    A->>D: Leer eventos y créditos ordenados
    D-->>A: Filas
    A-->>H: JSON o error
    H->>H: Validar Event[]
    alt Resultado vigente
      H-->>U: Eventos
      U-->>V: Primeros tres o estado vacío
    else Error
      U-->>V: Alerta y opción Reintentar
    end
  end
end
opt Elegir sección desde el menú
  V->>U: Activar enlace
  U-->>V: Cerrar menú y enfocar main en cambio de ruta
end
```

Lectura SQLite. Escena y menú en memoria.

[Catálogo detallado](../../analysis/02-actores-y-casos-de-uso.md) · [Vista de procesos](../README.md).
