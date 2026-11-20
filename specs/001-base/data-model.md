# Modelo de datos

Todas las propiedades son obligatorias, sin null. IDs estables de texto en minúsculas, dígitos y guiones. Textos de presentación no vacíos; image es una ruta local bajo /art/.

| Entidad | Campos y restricciones |
|---|---|
| Event | id, title, description y category de texto; startAt y endAt ISO 8601 a segundos con offset -05:00 y fin posterior al inicio; venueId referencia Venue.id; artistIds lista ordenada de Artist.id distintos; priceCents y capacity enteros no negativos; reservable booleano; image local |
| Artist | id, name, bio, country, discipline e image |
| Venue | id, name, address, description, accessibilityNotes e image |

Una sede acoge muchos eventos. La relación evento–artista se almacena con una posición y clave compuesta. La edición inicial se lee sin filtros de reloj. Las operaciones de escritura públicas se incorporarán en sus specs.
