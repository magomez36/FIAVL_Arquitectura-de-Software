# Vista lógica

## LOG-01 · Dominio y estructuras relevantes

El estilo por capas distribuye responsabilidades de presentación, negocio y acceso a datos. El dibujo usa clases conceptuales para expresar atributos y relaciones. En TypeScript el dominio se materializa como tipos, interfaces, valores y fábricas de operaciones. [Inventario técnico](analysis/01-inventario-arquitectonico.md).

<!-- diagram: LOG-01 -->

```mermaid
classDiagram
direction LR
class Evento {
  <<entidad>>
  +string id
  +string title
  +string description
  +string category
  +string startAt
  +string endAt
  +string venueId
  +string[] artistIds
  +int priceCents
  +int capacity
  +boolean reservable
  +string image
}
class Artista {
  <<entidad>>
  +string id
  +string name
  +string bio
  +string country
  +string discipline
  +string image
}
class Sede {
  <<entidad>>
  +string id
  +string name
  +string address
  +string description
  +string accessibilityNotes
  +string image
}
class Credito {
  <<asociacionPersistente>>
  +string eventId
  +string artistId
  +int position
}
class Reserva {
  <<entidad>>
  +int id
  +string referenceHash
  +string eventId
  +int quantity
  +string status
  +string createdAt
  +string cancelledAt
}
class Valoracion {
  <<entidad>>
  +int id
  +int rating
  +string comment
}
class Disponibilidad {
  <<proyeccion>>
  +string eventId
  +int capacity
  +int reserved
  +int remaining
  +boolean reservable
}
class ResumenValoraciones {
  <<proyeccion>>
  +int total
  +int[5] distribution
  +number average
}
class AgendaLocal {
  <<navegador>>
  +string[] eventIds
}
class ReferenciasLocales {
  <<navegador>>
  +int version
  +StoredItem[] items
}
class PreferenciasLectura {
  <<navegador>>
  +int version
  +TextSize textSize
  +Contrast contrast
}
class RecorridoEditorial {
  <<navegador>>
  +string name
  +string purpose
  +string[] stops
}
class ImagenGaleria {
  <<navegador>>
  +string id
  +string category
  +string title
  +string caption
  +string alt
  +string src
  +int width
  +int height
  +Credit credit
}
Sede "1" -- "0..*" Evento : aloja
Evento "1" -- "0..*" Credito : ordena
Artista "1" -- "0..*" Credito : participa
Evento "1" -- "0..*" Reserva : admite
Disponibilidad ..> Evento : proyecta capacidad
Disponibilidad ..> Reserva : agrega activas
ResumenValoraciones ..> Valoracion : agrega por rating
AgendaLocal ..> Evento : resuelve IDs sin FK
ReferenciasLocales ..> Reserva : resuelve por referencia
RecorridoEditorial ..> Sede : resuelve paradas por ID
ImagenGaleria ..> Sede : proyecta algunas fichas
```

- Cada evento exige una sede. Una sede puede alojar cero o más eventos. Cada crédito exige un evento y un artista. Un evento o artista puede tener cero o más créditos. La tabla asociativa impone unicidad de la pareja y de la posición por evento. El DTO de evento proyecta esa relación como `artistIds` ordenados. [Migración de base](../../apps/api/migrations/001_base.sql), [repositorio de catálogo](../../apps/api/src/repositories/catalog.ts).
- Los DTO de catálogo exigen IDs slug, textos obligatorios, imágenes SVG locales, importes en centavos USD y fechas con segundos y `-05:00`. El fin debe ser posterior al inicio. Algunos controles son más específicos en Zod que en las restricciones físicas. [Contratos](../../packages/contracts/src/index.ts), [migración de base](../../apps/api/migrations/001_base.sql).
- Cada reserva refiere a un evento. La vista HTTP expone la referencia en claro, mientras SQLite guarda su hash único e ID privado. `cancelledAt` admite `null` en estado activo. La disponibilidad agrega solo reservas activas. [Migración 006](../../apps/api/migrations/006_reservations.sql), [servicio](../../apps/api/src/services/reservations.ts), [DTO de navegador](../../apps/web/src/features/reservas/logic.ts).
- La valoración tiene ID interno, puntuación y comentario anulable. El resumen es una proyección de todas las filas y tiene promedio anulable cuando el total es cero. [Migración 010](../../apps/api/migrations/010_feedback.sql), [servicio](../../apps/api/src/services/feedback.ts).
- Las flechas discontinuas de navegador indican resolución o proyección, sin integridad referencial. La agenda guarda directamente el arreglo de IDs. Las referencias guardan `reference`, `eventId` y `quantity` dentro de `items`. La guía guarda opciones versionadas. Recorridos y galería se reconstruyen con datos del módulo y estado de React. [Almacenamiento](../../apps/web/src/lib/storage.ts), [recorridos](../../apps/web/src/features/rutas/itinerarios.ts), [galería](../../apps/web/src/features/galeria/logic.ts).
