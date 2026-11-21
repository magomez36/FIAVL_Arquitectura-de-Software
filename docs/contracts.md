# Contratos de integración · Spec 1

Base de origen único `/api`. Todas las respuestas llevan JSON UTF-8. Visibilidad pública y de lectura para el catálogo. Listas sin paginación, envoltorio ni filtro por reloj. Moneda USD. El navegador usa `getResource` con una ruta relativa y un validador. Definiciones ejecutables en `packages/contracts/src/index.ts`.

| Método y ruta | Éxito / orden | Ejemplo de prueba |
|---|---|---|
| GET /api/health | 200, {"status":"ok"} después de consultar la tabla events | Con SQLite abierto |
| GET /api/events | 200, Event[], por startAt e id | 12 con seed; [] en base recién migrada |
| GET /api/events/:id | 200, Event | /api/events/umbral-de-luz |
| GET /api/artists | 200, Artist[], por id | 6 con seed |
| GET /api/artists/:id | 200, Artist | /api/artists/colectivo-umbral |
| GET /api/venues | 200, Venue[], por id | 5 con seed |
| GET /api/venues/:id | 200, Venue | /api/venues/teatro-del-sur |
| Cualquier método /api/reservations o descendiente | 501 NOT_IMPLEMENTED | POST /api/reservations |
| POST /api/feedback | 201, {"accepted":true} | {"rating":4,"comment":"Buena experiencia"} |
| GET /api/feedback/summary | 200, resumen de valoraciones | {"total":1,"distribution":[0,0,0,1,0],"average":4} |

## Campos

Objetos de forma exacta. Todos los campos obligatorios y no nulos. Los textos descriptivos tienen al menos un carácter. Los identificadores cumplen `^[a-z0-9]+(?:-[a-z0-9]+)*$`. Cada imagen es una ruta `/art/<nombre>.svg` cuyo nombre contiene minúsculas, dígitos o guiones.

| Entidad | Campo | Tipo y significado |
|---|---|---|
| Event, Artist, Venue | id, image | string identificador estable y string URL local, respectivamente |
| Event | title, description, category | string por campo. Título, reseña y disciplina editorial |
| Event | startAt, endAt | string ISO con segundos y sufijo -05:00. Fin posterior al inicio, hora civil America/Guayaquil |
| Event | venueId | string, FK a Venue.id. Una sede por evento |
| Event | artistIds | string[], cero o más FK a Artist.id, sin duplicados y en orden de crédito |
| Event | priceCents, capacity | enteros seguros ≥ 0. Centavos de USD y aforo total inicial. El costo cero indica acceso gratuito |
| Event | reservable | boolean. Identifica si la actividad admite reserva en la edición |
| Artist | name, bio, country, discipline | string por campo. Nombre artístico, biografía, país y disciplina |
| Venue | name, address, description, accessibilityNotes | string por campo. Nombre, dirección demo, descripción y condiciones de acceso |

### Fichas relacionadas reales del seed

```json
{
  "id": "umbral-de-luz",
  "title": "Umbral de luz",
  "description": "Una compañía dibuja caminos de luz con el cuerpo sobre un escenario en penumbra.",
  "category": "Danza",
  "startAt": "2026-11-12T18:00:00-05:00",
  "endAt": "2026-11-12T20:00:00-05:00",
  "venueId": "teatro-del-sur",
  "artistIds": [
    "colectivo-umbral"
  ],
  "priceCents": 500,
  "capacity": 3,
  "reservable": true,
  "image": "/art/danza.svg"
}
```

```json
{
  "id": "colectivo-umbral",
  "name": "Colectivo Umbral",
  "bio": "Investiga el movimiento de grupos en espacios cotidianos.",
  "country": "Ecuador",
  "discipline": "Danza",
  "image": "/art/danza.svg"
}
```

```json
{
  "id": "teatro-del-sur",
  "name": "Teatro del Sur",
  "address": "Calle del Telón 12",
  "description": "Sala de caja negra con graderío cercano al escenario.",
  "accessibilityNotes": "Entrada a nivel y dos espacios para silla de ruedas.",
  "image": "/art/teatro.svg"
}
```

## Errores y recuperación

| HTTP | error.code | Condición |
|---|---|---|
| 400 | INVALID_ID | Identificador mal formado |
| 404 | NOT_FOUND | Ficha o ruta inexistente |
| 500 | INTERNAL_ERROR | Fallo inesperado de lectura o validación del catálogo |
| 501 | NOT_IMPLEMENTED | Namespace de reservas pendiente |

Ejemplo de `GET /api/events/desconocido`:

```json
{"error":{"code":"NOT_FOUND","message":"Ficha no encontrada."}}
```

Los consumidores discriminan por estado y código. El mensaje se presenta en español. Un error de red o de formato en la portada activa el estado de error con reintento.

## Datos de prueba

El inventario reproducible está en [fixtures.json](../apps/api/src/fixtures.json). `umbral-de-luz` es reservable con 3 plazas, cuesta 500 centavos y se solapa el 12 de noviembre con `el-rio-suena`, gratuito y no reservable. `mapa-sonoro` es gratuito y reservable con 2 plazas. El último evento, `cauce-final`, comienza el 22 de noviembre. Ver [pruebas HTTP](../tests/catalog.test.ts).

## Persistencia del navegador

El módulo `apps/web/src/lib/storage.ts` guarda JSON por clave versionada: `fiavl:agenda:v1`, `fiavl:reservations:v1`, `fiavl:accessibility:v1` y `fiavl:feedback:v1`. Cada dueño define el contenido y el validador de lectura. La lectura devuelve undefined ante ausencia, corrupción o acceso bloqueado; la escritura informa éxito con un booleano.

## Encuesta de experiencia

POST recibe application/json, máximo 8 KiB, con rating entero de 1 a 5 y comment opcional de hasta 500 unidades UTF-16 antes de recortar espacios exteriores. Solo se admiten esos campos. Ausencia de puntuación, forma inválida o JSON malformado devuelven 400 INVALID_INPUT. El límite de tamaño devuelve 413 INVALID_INPUT. Los errores conservan el envoltorio común.

GET /api/feedback/summary devuelve total, distribution (cinco cantidades, de una a cinco estrellas) y average redondeado a un decimal. Con cero respuestas devuelve {"total":0,"distribution":[0,0,0,0,0],"average":null}. Los comentarios se almacenan en la base local y el API público entrega únicamente el agregado.
