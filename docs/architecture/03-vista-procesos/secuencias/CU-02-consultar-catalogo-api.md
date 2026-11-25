# CU-02 · Consultar el catálogo mediante la API pública

**Actor** Integrante técnico (ACT-02). **Spec** 1. Obtener una colección demo o recuperar una ficha por identidad.

<!-- diagram: CU-02 -->

```mermaid
sequenceDiagram
actor T as Integrante técnico
participant A as Express
participant C as Servicio de catálogo
participant R as Repositorio de catálogo
participant D as SQLite
alt Consulta de colección
  T-)A: GET /api/events, /api/artists o /api/venues
  A->>C: list(collection)
  C->>R: read(collection)
  R->>D: SELECT ordenado
  D-->>R: Filas
  R->>R: Proyectar campos y validar con Zod
  R-->>C: Fichas validadas
  C-->>A: Colección
  A-->>T: 200 lista, incluso vacía
else Consulta por identidad
  T-)A: GET /api/recurso/:id
  A->>C: detail(collection, id)
  C->>C: idSchema.safeParse
  alt ID inválido
    A-->>T: 400 INVALID_ID
  else ID válido
    C->>R: read(collection, id)
    R->>D: SELECT por ID parametrizado
    D-->>R: Fila o ausencia
    R->>R: Validar la proyección
    R-->>C: Ficha o ausencia
    C-->>A: found o notFound
    A-->>T: 200 ficha o 404 NOT_FOUND
  end
end
Note over A,D: Una excepción de lectura o validación devuelve 500 INTERNAL_ERROR
```

Lectura de events, venues, artists y event_artists.

[Catálogo detallado](../../analysis/02-actores-y-casos-de-uso.md) · [Vista de procesos](../README.md).
