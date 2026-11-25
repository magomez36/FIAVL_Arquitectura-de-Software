# CU-11 · Consultar plazas disponibles

**Actor** Visitante (ACT-01). **Spec** 6. Saber qué eventos admiten reserva y cuántas plazas les quedan.

<!-- diagram: CU-11 -->

```mermaid
sequenceDiagram
actor V as Visitante
participant U as Reservas
participant H as getResource
participant A as API Express
participant S as Servicio de reservas
participant R as Repositorio de reservas
participant D as SQLite
V->>U: Abrir Reservas
loop Carga o reintento
  par Catálogo
    U->>H: Consultar events
    H-)A: GET /api/events
    A->>D: Leer catálogo vía servicio y repositorio
    D-->>A: Eventos
    A-->>H: JSON o error
  and Disponibilidad
    U->>H: Consultar reservations/availability
    H-)A: GET /api/reservations/availability
    A->>S: availability()
    S->>R: listEvents()
    R->>D: SELECT capacidad y SUM(quantity) de activas
    D-->>R: Eventos y ocupación
    R-->>S: Capacidad y plazas activas
    S-->>A: Saldo calculado
    A-->>H: JSON o error
  end
  H->>H: Validar listas
  alt Lecturas válidas y vigentes
    H-->>U: Eventos y disponibilidad
    U->>U: Filtrar reservables y unir por eventId
    U-->>V: Plazas, agotado o sin eventos reservables
  else Error de lectura o contrato
    U-->>V: Alerta y Reintentar
  end
end
opt Cliente HTTP consulta un evento por ID
  V-)A: GET /api/reservations/availability/:eventId
  A->>S: availabilityOf(eventId)
  S->>S: Validar ID
  S->>R: Si es válido, atomically para leer evento y suma
  R->>D: BEGIN IMMEDIATE, lecturas, COMMIT
  S-->>A: Disponibilidad, ID inválido o ausencia
  A-->>V: 200, 400 o 404
end
```

Lectura de events y reservations.

[Catálogo detallado](../../analysis/02-actores-y-casos-de-uso.md) · [Vista de procesos](../README.md).
