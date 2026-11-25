# CU-13 · Consultar mis reservas por referencia

**Actor** Visitante (ACT-01). **Spec** 6. Recuperar el estado de las referencias recordadas y gestionar esa lista local.

<!-- diagram: CU-13 -->

```mermaid
sequenceDiagram
actor V as Visitante
participant U as Reservas
participant L as localStorage
participant A as Router de reservas
participant S as Servicio de reservas
participant R as Repositorio de reservas
participant D as SQLite
V->>U: Abrir /reservas
U->>L: readLocal y parseStored
L-->>U: Referencias válidas o lista vacía
loop Una lectura por referencia al montar
  U-)A: GET /api/reservations/:reference
  A->>S: find(reference)
  S->>S: Validar y calcular SHA-256
  S->>R: atomically si el formato es válido
  R->>D: BEGIN IMMEDIATE, SELECT por hash, COMMIT
  D-->>R: Reserva o ausencia
  R-->>S: Datos de la fila
  S-->>A: ok, invalidReference o notFound
  alt 200 y esquema válido
    A-->>U: Reserva
    U-->>V: Activa o Cancelada
  else 404
    A-->>U: NOT_FOUND
    U-->>V: Reserva no encontrada
  else Otro fallo
    A-->>U: Error de lectura
    Note over U: Puede permanecer Consultando
  end
end
opt Quitar referencia cancelada o ausente
  V->>U: Quitar de la lista
  U->>L: Guardar lista local filtrada
end
```

Lectura SQLite y lectura/escritura condicional de `fiavl:reservations:v1`.

[Catálogo detallado](../../analysis/02-actores-y-casos-de-uso.md) · [Vista de procesos](../README.md).
