# CU-22 · Consultar el resumen de valoraciones

**Actor** Visitante (ACT-01). **Spec** 10. Conocer el total, la distribución y el promedio agregado de respuestas.

<!-- diagram: CU-22 -->

```mermaid
sequenceDiagram
actor V as Visitante
participant U as Summary
participant H as getResource
participant A as Router de feedback
participant S as Servicio de feedback
participant R as Repositorio de feedback
participant D as SQLite
V->>U: Abrir Opiniones
loop Montaje, revisión tras envío o reintento
  U->>H: Consultar agregado con AbortSignal
  H-)A: GET /api/feedback/summary
  A->>S: summary()
  S->>R: counts()
  R->>D: SELECT rating, count(*) GROUP BY rating
  D-->>R: Conteos por puntuación
  R-->>S: Pares rating y count
  S->>S: Calcular total, cinco frecuencias, promedio o null
  S-->>A: FeedbackSummary
  A-->>H: JSON o error
  H->>H: Validar esquema del resumen
  alt Resultado válido y vigente
    H-->>U: Datos agregados
    U-->>V: Distribución y promedio o aviso sin valoraciones
  else Error HTTP o JSON/esquema inválido
    U-->>V: Alerta con Reintentar
  end
end
opt Efecto sustituido o desmontado
  U->>H: Abortar lectura anterior
end
```

Lectura agregada de SQLite, sin almacenar resultados en localStorage.

[Catálogo detallado](../../analysis/02-actores-y-casos-de-uso.md) · [Vista de procesos](../README.md).
