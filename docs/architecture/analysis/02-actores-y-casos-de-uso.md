# Actores y casos de uso

## Actores

| ID | Rol externo | Responsabilidades e interacciones | Objetivos | Evidencia |
|---|---|---|---|---|
| ACT-01 | Visitante | Navega, consulta contenidos, administra su selección en este navegador, usa referencias de reserva, configura la lectura y responde la encuesta. Elige qué datos suministra en el formulario. | Descubrir la edición, organizar actividades y compartir su experiencia. | [Shell](../../../apps/web/src/main.tsx), [registro de rutas](../../../apps/web/src/features/index.ts), [reservas](../../../apps/web/src/features/reservas/index.tsx), [opiniones](../../../apps/web/src/features/opiniones/index.tsx). |
| ACT-02 | Integrante técnico que consulta el catálogo | Usa un cliente HTTP para verificar colecciones, fichas y relaciones demo. La interfaz pública permite la consulta sin credenciales. | Obtener datos consistentes para verificar o presentar el catálogo. | [Spec 1, US1](../../../specs/001-base/spec.md), [contrato REST](../../contracts.md), [handlers públicos](../../../apps/api/src/app.ts), [prueba HTTP](../../../tests/catalog.test.ts). |

El límite lógico abarca la aplicación web y su API. React, Vite, Express, SQLite y localStorage son participantes técnicos internos. Los sitios enlazados y las fuentes de las fotos aportan procedencia y son destinos de navegación voluntaria. El prototipo conserva los datos editoriales y las imágenes localmente. El rol técnico de ACT-02 describe el uso documentado de la interfaz REST, incluso cuando una misma persona desempeña ambos roles. La instalación, contribución y aceptación pertenecen al ciclo de desarrollo.

La búsqueda y el filtrado son variaciones de un objetivo de exploración. Abrir una ficha, ampliar una imagen, revisar el programa guardado o recuperar una reserva tienen un resultado informativo propio. Agregar y quitar pertenecen a armar la agenda. El control del carrusel y la navegación son parte de descubrir la edición. El resumen de opiniones se puede consultar sin enviar una valoración. Los objetivos quedan conectados al actor sin relaciones `include`, `extend` ni generalización.

## Catálogo detallado

### CU-01 · Descubrir la edición demo

- **Spec y actor** — Spec 1, ACT-01 (Visitante).
- **Objetivo** — Reconocer la edición y llegar a una sección o a la selección demo.
- **Descripción** — El visitante recorre las escenas, elige un destino o navega mediante el menú.
- **Precondiciones** — Navegador con la portada accesible.
- **Disparador** — Abrir `/`.

**Flujo principal**

1. El shell presenta el aviso académico y las fechas de la edición.
2. `StageCarousel` presenta la primera escena y `Selection` inicia la lectura del catálogo.
3. La portada valida la lista y muestra los primeros tres eventos.
4. El visitante recorre las escenas, elige un destino o navega mediante el menú.

- **Alternativas** — Puede saltar a `#seleccion`, pausar o avanzar manualmente. El primer destino es `/agenda` en el SHA modelado y sería `#seleccion` con Agenda desactivada. Una URL desconocida ofrece volver al inicio.
- **Excepciones** — La lectura muestra carga, vacío o error con reintento. La navegación y el carrusel siguen operativos.
- **Postcondiciones** — Selección visible si hay fichas o navegación al destino elegido.
- **Reglas** — Fechas 12–22 de noviembre de 2026. Autoavance de 7 s y pausas por foco, puntero, pestaña oculta, acción manual o movimiento reducido.
- **Participantes** — App, Header, Home, StageCarousel, Selection, cliente HTTP, catálogo.
- **Endpoints** — GET /api/events.
- **Persistencia** — Lectura SQLite. Escena y menú en memoria.
- **Fuente** — [apps/web/src/main.tsx](../../../apps/web/src/main.tsx), [apps/web/src/Home.tsx](../../../apps/web/src/Home.tsx), [apps/web/src/components/StageCarousel.tsx](../../../apps/web/src/components/StageCarousel.tsx).
- **Pruebas identificadas** — [tests/e2e/home.spec.ts](../../../tests/e2e/home.spec.ts), [tests/e2e/spec-10.spec.ts](../../../tests/e2e/spec-10.spec.ts).
- **Secuencia** — [CU-01](../03-vista-procesos/secuencias/CU-01-descubrir-edicion.md).

### CU-02 · Consultar el catálogo mediante la API pública

- **Spec y actor** — Spec 1, ACT-02 (Integrante técnico).
- **Objetivo** — Obtener una colección demo o recuperar una ficha por identidad.
- **Descripción** — La API responde JSON con la lista o ficha.
- **Precondiciones** — API local iniciada y base migrada.
- **Disparador** — Solicitar una colección o un recurso identificado.

**Flujo principal**

1. El consumidor envía `GET` para una colección o una ficha.
2. Express selecciona el recurso y llama a `list` o `detail`.
3. El repositorio lee SQLite y valida los objetos publicados con Zod.
4. La API responde JSON con la lista o ficha.

- **Alternativas** — Una base sin semilla puede devolver listas vacías. Las tres colecciones se consultan independientemente.
- **Excepciones** — ID inválido → 400 `INVALID_ID`. ID válido ausente → 404 `NOT_FOUND`. Fallo inesperado → 500 `INTERNAL_ERROR`.
- **Postcondiciones** — El consumidor recibe los datos o un error identificable.
- **Reglas** — Catálogo sin paginación, filtro por reloj ni escritura pública. Eventos ordenados por inicio e ID. Artistas y sedes por ID.
- **Participantes** — Cliente HTTP externo, Express, servicio y repositorio de catálogo, Zod, SQLite.
- **Endpoints** — GET /api/{events,artists,venues} y GET /api/{events,artists,venues}/:id.
- **Persistencia** — Lectura de events, venues, artists y event_artists.
- **Fuente** — [apps/api/src/app.ts](../../../apps/api/src/app.ts), [apps/api/src/catalog.ts](../../../apps/api/src/catalog.ts), [apps/api/src/repositories/catalog.ts](../../../apps/api/src/repositories/catalog.ts), [packages/contracts/src/index.ts](../../../packages/contracts/src/index.ts).
- **Pruebas identificadas** — [tests/catalog.test.ts](../../../tests/catalog.test.ts).
- **Secuencia** — [CU-02](../03-vista-procesos/secuencias/CU-02-consultar-catalogo-api.md).

### CU-03 · Explorar la programación cultural

- **Spec y actor** — Spec 2, ACT-01 (Visitante).
- **Objetivo** — Localizar eventos demo por interés, fecha, categoría o precio.
- **Descripción** — La lista anuncia el total y presenta horario, sede, categoría e importe.
- **Precondiciones** — Ruta `/agenda` activa.
- **Disparador** — Abrir Agenda o cambiar los criterios.

**Flujo principal**

1. Agenda solicita eventos, artistas y sedes en paralelo.
2. El cliente valida los tres resultados y la UI prepara los nombres relacionados.
3. El visitante busca o combina filtros; `filterEvents` ordena y filtra en memoria.
4. La lista anuncia el total y presenta horario, sede, categoría e importe.

- **Alternativas** — Limpiar restaura los criterios iniciales; la consulta incluye datos de artista y sede de las listas ya leídas.
- **Excepciones** — Un fallo de red o contrato muestra reintento. Una lista sin eventos utiliza el mismo mensaje que la búsqueda sin coincidencias.
- **Postcondiciones** — Lista y contador reflejan los criterios vigentes.
- **Reglas** — AND entre criterios, fechas civiles de Loja, USD o Gratuito; orden inicio/ID.
- **Participantes** — Agenda, getResource, filterEvents, catálogo.
- **Endpoints** — GET /api/events, GET /api/artists, GET /api/venues al cargar/reintentar.
- **Persistencia** — Lectura SQLite, filtros en memoria.
- **Fuente** — [apps/web/src/features/agenda/index.tsx](../../../apps/web/src/features/agenda/index.tsx), [apps/web/src/features/agenda/logic.ts](../../../apps/web/src/features/agenda/logic.ts).
- **Pruebas identificadas** — [tests/spec-02.test.ts](../../../tests/spec-02.test.ts), [tests/e2e/spec-02.spec.ts](../../../tests/e2e/spec-02.spec.ts).
- **Secuencia** — [CU-03](../03-vista-procesos/secuencias/CU-03-explorar-programacion.md).

### CU-04 · Consultar el detalle de un evento

- **Spec y actor** — Spec 2, ACT-01 (Visitante).
- **Objetivo** — Conocer descripción, horario completo, sede, artistas y precio de un evento.
- **Descripción** — Se expande el detalle con descripción, disciplina, horario e importe.
- **Precondiciones** — Catálogo de Agenda cargado y tarjeta visible.
- **Disparador** — Activar «Ver detalle».

**Flujo principal**

1. React actualiza `selected` con el ID.
2. La página resuelve sede y artistas mediante los mapas del catálogo.
3. Se expande el detalle con descripción, disciplina, horario e importe.

- **Alternativas** — Volver a activar oculta el detalle. Abrir otro cambia la selección. Si no hay nombres de artistas resueltos se indica «Por confirmar».
- **Excepciones** — Si la lectura inicial falla, no hay tarjeta hasta recuperar la consulta.
- **Postcondiciones** — Detalle en pantalla y selección en memoria.
- **Reglas** — Un ID seleccionado a la vez; `aria-expanded` refleja el estado.
- **Participantes** — Agenda, StageButton, mapas del catálogo.
- **Endpoints** — Ninguno al abrir el detalle.
- **Persistencia** — Memoria del navegador.
- **Fuente** — [apps/web/src/features/agenda/index.tsx](../../../apps/web/src/features/agenda/index.tsx), [apps/web/src/features/agenda/logic.ts](../../../apps/web/src/features/agenda/logic.ts).
- **Pruebas identificadas** — [tests/e2e/spec-02.spec.ts](../../../tests/e2e/spec-02.spec.ts).
- **Secuencia** — [CU-04](../03-vista-procesos/secuencias/CU-04-detalle-evento.md).

### CU-05 · Explorar el catálogo de artistas

- **Spec y actor** — Spec 3, ACT-01 (Visitante).
- **Objetivo** — Encontrar artistas por nombre, país o disciplina.
- **Descripción** — `filterArtists` combina nombre, país y disciplina y actualiza el contador.
- **Precondiciones** — Ruta `/artistas` activa.
- **Disparador** — Abrir la sección o introducir criterios.

**Flujo principal**

1. Artistas inicia lecturas paralelas de artistas, eventos y sedes.
2. El cliente valida los contratos y se muestran las fichas.
3. `filterArtists` combina nombre, país y disciplina y actualiza el contador.

- **Alternativas** — Limpiar restaura todos. Se distinguen catálogo vacío y filtro sin coincidencias.
- **Excepciones** — Fallo de cualquiera de las tres lecturas o del contrato: alerta y reintento.
- **Postcondiciones** — Catálogo listo para elegir una ficha.
- **Reglas** — Nombre sin distinción de mayúsculas ni tildes; opciones de filtros a partir de datos recibidos.
- **Participantes** — Artistas, getResource, filterArtists, catálogo.
- **Endpoints** — GET /api/artists, GET /api/events, GET /api/venues al cargar/reintentar.
- **Persistencia** — Lectura SQLite; filtros en memoria.
- **Fuente** — [apps/web/src/features/artistas/index.tsx](../../../apps/web/src/features/artistas/index.tsx), [apps/web/src/features/artistas/logic.ts](../../../apps/web/src/features/artistas/logic.ts).
- **Pruebas identificadas** — [tests/spec-03.test.ts](../../../tests/spec-03.test.ts), [tests/e2e/spec-03.spec.ts](../../../tests/e2e/spec-03.spec.ts).
- **Secuencia** — [CU-05](../03-vista-procesos/secuencias/CU-05-explorar-artistas.md).

### CU-06 · Consultar la trayectoria y actuaciones de un artista

- **Spec y actor** — Spec 3, ACT-01 (Visitante).
- **Objetivo** — Leer la biografía y saber en qué eventos participa un artista.
- **Descripción** — Se presentan título, horario de Loja y sede si está disponible.
- **Precondiciones** — Tarjeta visible y catálogos cargados.
- **Disparador** — Activar «Ver detalle».

**Flujo principal**

1. `ArtistCard` alterna `open`.
2. React muestra la biografía y las actuaciones calculadas por `performancesOf`.
3. Se presentan título, horario de Loja y sede si está disponible.

- **Alternativas** — Artista sin actuaciones: aviso. Sede sin correspondencia en los datos recibidos: se omite su nombre.
- **Excepciones** — Si un filtro saca la ficha de los resultados, se desmonta la tarjeta y desaparece el detalle.
- **Postcondiciones** — Detalle visible o colapsado según la interacción.
- **Reglas** — Asociación por pertenencia en `artistIds`; orden inicio/ID.
- **Participantes** — ArtistCard, performancesOf, datos en React.
- **Endpoints** — Ninguno al abrir el detalle.
- **Persistencia** — Memoria del navegador.
- **Fuente** — [apps/web/src/features/artistas/index.tsx](../../../apps/web/src/features/artistas/index.tsx), [apps/web/src/features/artistas/logic.ts](../../../apps/web/src/features/artistas/logic.ts).
- **Pruebas identificadas** — [tests/spec-03.test.ts](../../../tests/spec-03.test.ts), [tests/e2e/spec-03.spec.ts](../../../tests/e2e/spec-03.spec.ts).
- **Secuencia** — [CU-06](../03-vista-procesos/secuencias/CU-06-detalle-artista.md).

### CU-07 · Encontrar una sede en el directorio demo

- **Spec y actor** — Spec 4, ACT-01 (Visitante).
- **Objetivo** — Localizar una sede por nombre o dirección.
- **Descripción** — El visitante busca por nombre o dirección y obtiene las sedes coincidentes.
- **Precondiciones** — Ruta `/espacios` activa.
- **Disparador** — Abrir el directorio o escribir una búsqueda.

**Flujo principal**

1. Espacios solicita sedes y eventos en paralelo.
2. Valida los resultados y ordena los eventos.
3. El visitante busca por nombre o dirección y obtiene las sedes coincidentes.

- **Alternativas** — Borrar búsqueda recupera el directorio; se diferencian catálogo vacío y búsqueda sin resultados.
- **Excepciones** — Fallo de lectura o contrato: se ofrece reintentar; la sección editorial local permanece.
- **Postcondiciones** — Directorio disponible con los resultados de la búsqueda.
- **Reglas** — Normalización de mayúsculas y acentos; las fichas demo proceden de la API.
- **Participantes** — Espacios, getResource, searchable, catálogo.
- **Endpoints** — GET /api/venues, GET /api/events al cargar/reintentar.
- **Persistencia** — Lectura SQLite, consulta en memoria.
- **Fuente** — [apps/web/src/features/espacios/index.tsx](../../../apps/web/src/features/espacios/index.tsx).
- **Pruebas identificadas** — [tests/e2e/spec-04.spec.ts](../../../tests/e2e/spec-04.spec.ts).
- **Secuencia** — [CU-07](../03-vista-procesos/secuencias/CU-07-buscar-sede.md).

### CU-08 · Consultar una sede demo y sus actividades

- **Spec y actor** — Spec 4, ACT-01 (Visitante).
- **Objetivo** — Conocer dónde está una sede, sus notas demo de acceso y sus actividades.
- **Descripción** — Se consultan los eventos que Espacios ya asoció a esa sede.
- **Precondiciones** — Sede visible en el directorio demo.
- **Disparador** — Abrir su `<summary>` mediante teclado o puntero.

**Flujo principal**

1. El control nativo expande `VenueDetails`.
2. La ficha muestra ilustración, descripción, dirección y acceso demo.
3. Se consultan los eventos que Espacios ya asoció a esa sede.

- **Alternativas** — Si no tiene actividades se muestra un aviso. La ficha se puede plegar.
- **Excepciones** — Si el directorio no pudo cargar, el control todavía no está disponible. Las condiciones reales se confirman fuera de la aplicación.
- **Postcondiciones** — Ficha consultada sin modificar los datos.
- **Reglas** — Actividades por `venueId`, cronológicas en hora de Loja.
- **Participantes** — Espacios, VenueDetails, details/summary.
- **Endpoints** — Ninguno al abrir la ficha.
- **Persistencia** — Memoria del navegador.
- **Fuente** — [apps/web/src/features/espacios/index.tsx](../../../apps/web/src/features/espacios/index.tsx).
- **Pruebas identificadas** — [tests/e2e/spec-04.spec.ts](../../../tests/e2e/spec-04.spec.ts).
- **Secuencia** — [CU-08](../03-vista-procesos/secuencias/CU-08-detalle-sede.md).

### CU-09 · Armar mi agenda personal

- **Spec y actor** — Spec 5, ACT-01 (Visitante).
- **Objetivo** — Guardar o quitar eventos de mi selección personal.
- **Descripción** — `resolveAgenda` recompone la agenda visible y la UI actualiza botones y mensajes.
- **Precondiciones** — Ruta `/mi-agenda`; catálogo listo para elegir eventos.
- **Disparador** — Activar «Agregar», «Quitar» o limpiar referencias obsoletas.

**Flujo principal**

1. React actualiza los IDs mediante `addId`, `removeId` o la limpieza explícita.
2. `writeLocal` intenta guardar la lista JSON.
3. `resolveAgenda` recompone la agenda visible y la UI actualiza botones y mensajes.

- **Alternativas** — Un ID ya guardado no se duplica. Es posible quitar de una vez los IDs ausentes.
- **Excepciones** — Si falla la escritura, los cambios siguen en la vista y se anuncia que se perderán al recargar.
- **Postcondiciones** — Selección actualizada y guardada si el navegador lo permite.
- **Reglas** — Una identidad por evento, sin adquirir ni liberar plazas.
- **Participantes** — Mi agenda, lógica local, writeLocal, almacenamiento del navegador.
- **Endpoints** — Ninguno al agregar o quitar.
- **Persistencia** — `fiavl:agenda:v1`, lista de IDs por origen de navegador.
- **Fuente** — [apps/web/src/features/mi-agenda/index.tsx](../../../apps/web/src/features/mi-agenda/index.tsx), [apps/web/src/features/mi-agenda/logic.ts](../../../apps/web/src/features/mi-agenda/logic.ts), [apps/web/src/lib/storage.ts](../../../apps/web/src/lib/storage.ts).
- **Pruebas identificadas** — [tests/spec-05.test.ts](../../../tests/spec-05.test.ts), [tests/e2e/spec-05.spec.ts](../../../tests/e2e/spec-05.spec.ts).
- **Secuencia** — [CU-09](../03-vista-procesos/secuencias/CU-09-armar-agenda.md).

### CU-10 · Revisar mi programa y sus solapamientos

- **Spec y actor** — Spec 5, ACT-01 (Visitante).
- **Objetivo** — Recuperar el programa y detectar conflictos de horarios.
- **Descripción** — React presenta el programa cronológico y anuncia los conflictos.
- **Precondiciones** — Ruta accesible; puede haber una agenda guardada.
- **Disparador** — Abrir o recargar `/mi-agenda`.

**Flujo principal**

1. `readLocal` lee y valida IDs guardados.
2. Mi agenda carga eventos y sedes en paralelo.
3. `resolveAgenda` separa IDs encontrados y ausentes; `conflictsOf` calcula solapamientos.
4. React presenta el programa cronológico y anuncia los conflictos.

- **Alternativas** — Sin datos o con datos corruptos, comienza vacía. Referencias obsoletas se anuncian y quedan disponibles para quitar.
- **Excepciones** — Fallo HTTP o contrato inválido: estado de error y reintento. Lectura local bloqueada: lista inicial vacía.
- **Postcondiciones** — Programa y conflictos visibles, selección guardada conservada hasta una acción de edición.
- **Reglas** — Hay conflicto si cada inicio es anterior al fin del otro evento; extremos contiguos no chocan.
- **Participantes** — Mi agenda, readLocal, lógica local, getResource, catálogo.
- **Endpoints** — GET /api/events, GET /api/venues al cargar/reintentar.
- **Persistencia** — Lectura de SQLite para el catálogo y de `fiavl:agenda:v1` para la selección.
- **Fuente** — [apps/web/src/features/mi-agenda/index.tsx](../../../apps/web/src/features/mi-agenda/index.tsx), [apps/web/src/features/mi-agenda/logic.ts](../../../apps/web/src/features/mi-agenda/logic.ts), [apps/web/src/lib/storage.ts](../../../apps/web/src/lib/storage.ts).
- **Pruebas identificadas** — [tests/spec-05.test.ts](../../../tests/spec-05.test.ts), [tests/e2e/spec-05.spec.ts](../../../tests/e2e/spec-05.spec.ts).
- **Secuencia** — [CU-10](../03-vista-procesos/secuencias/CU-10-revisar-agenda.md).

### CU-11 · Consultar plazas disponibles

- **Spec y actor** — Spec 6, ACT-01 (Visitante).
- **Objetivo** — Saber qué eventos admiten reserva y cuántas plazas les quedan.
- **Descripción** — React combina por `eventId`, muestra eventos reservables y distingue aforo agotado.
- **Precondiciones** — Ruta `/reservas` o acceso al endpoint de disponibilidad.
- **Disparador** — Abrir Reservas o reintentar su consulta.

**Flujo principal**

1. La página solicita catálogo y disponibilidad en paralelo.
2. El servicio calcula el saldo con las sumas de reservas activas del repositorio.
3. React combina por `eventId`, muestra eventos reservables y distingue aforo agotado.

- **Alternativas** — La API también permite consultar un evento por ID, aunque la página usa la colección.
- **Excepciones** — La página distingue carga, fallo con reintento y ausencia de eventos reservables. La ruta por ID devuelve 400 o 404 cuando corresponde.
- **Postcondiciones** — Disponibilidad visible como lectura puntual.
- **Reglas** — Saldo = máximo entre cero y capacidad menos plazas activas. Sin filtrado por reloj.
- **Participantes** — Reservas, getResource, routers, servicios y repositorios de catálogo y reservas.
- **Endpoints** — GET /api/events, GET /api/reservations/availability. Variante API GET /api/reservations/availability/:eventId.
- **Persistencia** — Lectura de events y reservations.
- **Fuente** — [apps/web/src/features/reservas/index.tsx](../../../apps/web/src/features/reservas/index.tsx), [apps/api/src/features/reservations.ts](../../../apps/api/src/features/reservations.ts), [apps/api/src/services/reservations.ts](../../../apps/api/src/services/reservations.ts), [apps/api/src/repositories/reservations.ts](../../../apps/api/src/repositories/reservations.ts).
- **Pruebas identificadas** — [tests/reservations.test.ts](../../../tests/reservations.test.ts), [tests/spec-06.test.ts](../../../tests/spec-06.test.ts), [tests/e2e/spec-06.spec.ts](../../../tests/e2e/spec-06.spec.ts).
- **Secuencia** — [CU-11](../03-vista-procesos/secuencias/CU-11-consultar-plazas.md).

### CU-12 · Reservar plazas demostrativas

- **Spec y actor** — Spec 6, ACT-01 (Visitante).
- **Objetivo** — Obtener una reserva activa y una referencia para recuperarla o cancelarla.
- **Descripción** — Tras `COMMIT`, Express responde 201. La página confirma, mueve el foco, guarda la referencia si puede y relee el saldo.
- **Precondiciones** — Evento seleccionable y cantidad válida según la vista.
- **Disparador** — Enviar el formulario de reserva.

**Flujo principal**

1. `checkQuantity` valida la entrada local; `postJson` envía la petición.
2. El router analiza JSON hasta 1 KiB; el servicio valida tipo, rango y forma.
3. Dentro de `BEGIN IMMEDIATE`, lee el evento y las plazas activas, comprueba saldo e inserta una reserva activa con hash.
4. Tras `COMMIT`, Express responde 201. La página confirma, mueve el foco, guarda la referencia si puede y relee el saldo.

- **Alternativas** — La vista puede estar desactualizada; el servidor decide el saldo final. Sin almacenamiento local, el visitante conserva la referencia mostrada.
- **Excepciones** — 400 para forma inválida, 413 exceso, 404 evento ausente, 422 no reservable, 409 saldo insuficiente; excepción transaccional → rollback y error 500. Si no llega la respuesta, se desconoce el resultado desde la UI.
- **Postcondiciones** — Reserva persistente cuando se confirma; listas locales y saldo actualizados en la medida en que se completan las operaciones de navegador.
- **Reglas** — Cantidad entera 1–10, evento reservable, suma de activas nunca excede capacidad por este flujo. La referencia se genera con 24 bytes aleatorios, se persiste SHA-256.
- **Participantes** — Reservas, checkQuantity, postJson, router, servicio, repositorio, SQLite, writeLocal.
- **Endpoints** — POST /api/reservations y GET /api/reservations/availability.
- **Persistencia** — SQLite y copia local `{reference,eventId,quantity}` si está disponible.
- **Fuente** — [apps/web/src/features/reservas/index.tsx](../../../apps/web/src/features/reservas/index.tsx), [apps/web/src/features/reservas/client.ts](../../../apps/web/src/features/reservas/client.ts), [apps/api/src/features/reservations.ts](../../../apps/api/src/features/reservations.ts), [apps/api/src/services/reservations.ts](../../../apps/api/src/services/reservations.ts), [apps/api/src/repositories/reservations.ts](../../../apps/api/src/repositories/reservations.ts), [apps/api/migrations/006_reservations.sql](../../../apps/api/migrations/006_reservations.sql).
- **Pruebas identificadas** — [tests/reservations.test.ts](../../../tests/reservations.test.ts), [tests/spec-06.test.ts](../../../tests/spec-06.test.ts), [tests/e2e/spec-06.spec.ts](../../../tests/e2e/spec-06.spec.ts).
- **Secuencia** — [CU-12](../03-vista-procesos/secuencias/CU-12-reservar-plazas.md).

### CU-13 · Consultar mis reservas por referencia

- **Spec y actor** — Spec 6, ACT-01 (Visitante).
- **Objetivo** — Recuperar el estado de las referencias recordadas y gestionar esa lista local.
- **Descripción** — La página presenta activa, cancelada o no encontrada.
- **Precondiciones** — Lista guardada en el origen actual o referencia conocida para consultar la API.
- **Disparador** — Abrir `/reservas` o consultar una referencia en la API.

**Flujo principal**

1. La página lee las referencias válidas con `readLocal`.
2. Al montar, consulta cada referencia con `getResource`.
3. El servicio valida formato, calcula el hash y busca la reserva.
4. La página presenta activa, cancelada o no encontrada.

- **Alternativas** — Sin lista válida se ve el estado vacío. Se puede quitar una referencia cancelada o inexistente, operación local. La consulta directa por API acepta una referencia conocida.
- **Excepciones** — Formato inválido → 400; ausente → 404. En la lista, errores distintos de 404 no tienen estado terminal propio y pueden dejar «Consultando…».
- **Postcondiciones** — Estado recuperado de SQLite; la lista local cambia solo por alta o limpieza explícita.
- **Reglas** — Máximo 20 referencias únicas recordadas y estados leídos del servidor. La UI no ofrece consulta manual independiente.
- **Participantes** — Reservas, readLocal/writeLocal, getResource, router, servicio y repositorio.
- **Endpoints** — GET /api/reservations/:reference.
- **Persistencia** — Lectura SQLite y lectura/escritura condicional de `fiavl:reservations:v1`.
- **Fuente** — [apps/web/src/features/reservas/index.tsx](../../../apps/web/src/features/reservas/index.tsx), [apps/web/src/features/reservas/logic.ts](../../../apps/web/src/features/reservas/logic.ts), [apps/api/src/features/reservations.ts](../../../apps/api/src/features/reservations.ts), [apps/api/src/services/reservations.ts](../../../apps/api/src/services/reservations.ts).
- **Pruebas identificadas** — [tests/reservations.test.ts](../../../tests/reservations.test.ts), [tests/spec-06.test.ts](../../../tests/spec-06.test.ts), [tests/e2e/spec-06.spec.ts](../../../tests/e2e/spec-06.spec.ts).
- **Secuencia** — [CU-13](../03-vista-procesos/secuencias/CU-13-consultar-reservas.md).

### CU-14 · Cancelar una reserva mediante referencia

- **Spec y actor** — Spec 6, ACT-01 (Visitante).
- **Objetivo** — Liberar las plazas de una reserva cuya referencia posee.
- **Descripción** — Tras confirmar, la API devuelve 200 y la UI actualiza el estado y vuelve a leer disponibilidad.
- **Precondiciones** — Referencia válida conocida o activa en el navegador.
- **Disparador** — Cancelar desde la lista o enviar la referencia manual.

**Flujo principal**

1. React envía la referencia mediante `postJson`.
2. El servicio valida formato y busca por hash dentro de una transacción.
3. Si estaba activa, el repositorio actualiza estado y fecha; el servicio recupera el resultado.
4. Tras confirmar, la API devuelve 200 y la UI actualiza el estado y vuelve a leer disponibilidad.

- **Alternativas** — Una cancelación repetida devuelve la reserva ya cancelada y su fecha previa.
- **Excepciones** — Referencia vacía en UI, formato inválido (400), desconocida (404) o fallo inesperado (500); un fallo dentro de la transacción revierte los cambios.
- **Postcondiciones** — Reserva cancelada y saldo calculado sin contar sus plazas; la referencia puede seguir listada.
- **Reglas** — La referencia es capacidad al portador. La transición activa a cancelada sucede una vez.
- **Participantes** — Reservas, postJson, router, servicio, repositorio, SQLite.
- **Endpoints** — POST /api/reservations/:reference/cancel y GET /api/reservations/availability.
- **Persistencia** — Actualización SQLite; cancelar no borra la referencia local.
- **Fuente** — [apps/web/src/features/reservas/index.tsx](../../../apps/web/src/features/reservas/index.tsx), [apps/api/src/features/reservations.ts](../../../apps/api/src/features/reservations.ts), [apps/api/src/services/reservations.ts](../../../apps/api/src/services/reservations.ts), [apps/api/src/repositories/reservations.ts](../../../apps/api/src/repositories/reservations.ts), [apps/api/migrations/006_reservations.sql](../../../apps/api/migrations/006_reservations.sql).
- **Pruebas identificadas** — [tests/reservations.test.ts](../../../tests/reservations.test.ts), [tests/e2e/spec-06.spec.ts](../../../tests/e2e/spec-06.spec.ts).
- **Secuencia** — [CU-14](../03-vista-procesos/secuencias/CU-14-cancelar-reserva.md).

### CU-15 · Explorar un recorrido cultural

- **Spec y actor** — Spec 7, ACT-01 (Visitante).
- **Objetivo** — Recorrer una secuencia temática de sedes y conocer cada parada.
- **Descripción** — El visitante elige itinerario, lee propósito y recorre paradas con anterior/siguiente.
- **Precondiciones** — Ruta `/rutas` accesible; requiere al menos una sede de catálogo para mostrar el selector.
- **Disparador** — Abrir Rutas o elegir un recorrido.

**Flujo principal**

1. La página carga y valida las sedes.
2. `Recorrido` cruza sus IDs editoriales por orden con el catálogo.
3. El visitante elige itinerario, lee propósito y recorre paradas con anterior/siguiente.

- **Alternativas** — Una sede ausente conserva su posición. Cambiar itinerario vuelve a la primera parada; extremos deshabilitados.
- **Excepciones** — Carga, catálogo vacío o fallo con reintento. Sin sedes no se muestra el explorador.
- **Postcondiciones** — Recorrido y parada visibles; selección temporal.
- **Reglas** — Dos recorridos temáticos, 2 y 3 paradas. Las posiciones se basan en el orden editorial.
- **Participantes** — Rutas, Recorrido, itinerarios, getResource, catálogo.
- **Endpoints** — GET /api/venues al cargar/reintentar.
- **Persistencia** — Lectura SQLite; itinerarios y estado en navegador.
- **Fuente** — [apps/web/src/features/rutas/index.tsx](../../../apps/web/src/features/rutas/index.tsx), [apps/web/src/features/rutas/itinerarios.ts](../../../apps/web/src/features/rutas/itinerarios.ts).
- **Pruebas identificadas** — [tests/e2e/spec-07.spec.ts](../../../tests/e2e/spec-07.spec.ts).
- **Secuencia** — [CU-15](../03-vista-procesos/secuencias/CU-15-explorar-recorrido.md).

### CU-16 · Explorar la galería por categorías

- **Spec y actor** — Spec 8, ACT-01 (Visitante).
- **Objetivo** — Encontrar imágenes y reconocer su procedencia.
- **Descripción** — El visitante filtra y consulta el contador y los créditos.
- **Precondiciones** — Ruta `/galeria` accesible; la parte editorial está en el navegador.
- **Disparador** — Abrir la galería o elegir una categoría.

**Flujo principal**

1. Se muestra el inventario local mientras se solicitan sedes.
2. `buildItems` combina ilustraciones de sedes válidas y recursos editoriales en orden estable.
3. El visitante filtra y consulta el contador y los créditos.

- **Alternativas** — Sedes vacías o pendientes conservan las imágenes editoriales; categoría vacía permite volver a Todas.
- **Excepciones** — Fallo de red o de contrato muestra mensajes distintos y reintento; una imagen rota cambia a alternativa textual.
- **Postcondiciones** — Colección visible total o filtrada.
- **Reglas** — Ocho recursos editoriales; categorías Sedes, Ambientación, Ilustraciones y Archivo documental, más Todas. Sin mezclar fotos con ilustraciones de sedes.
- **Participantes** — Galería, Picture, buildItems, categoryCounts, getResource, catálogo.
- **Endpoints** — GET /api/venues al cargar/reintentar; recursos locales /art y /images.
- **Persistencia** — Lectura SQLite para sedes; inventario y filtros en memoria.
- **Fuente** — [apps/web/src/features/galeria/index.tsx](../../../apps/web/src/features/galeria/index.tsx), [apps/web/src/features/galeria/logic.ts](../../../apps/web/src/features/galeria/logic.ts), [docs/assets.md](../../../docs/assets.md).
- **Pruebas identificadas** — [tests/spec-08.test.ts](../../../tests/spec-08.test.ts), [tests/e2e/spec-08.spec.ts](../../../tests/e2e/spec-08.spec.ts).
- **Secuencia** — [CU-16](../03-vista-procesos/secuencias/CU-16-explorar-galeria.md).

### CU-17 · Ampliar y recorrer imágenes de la galería

- **Spec y actor** — Spec 8, ACT-01 (Visitante).
- **Objetivo** — Examinar una imagen ampliada y sus créditos, y recorrer resultados vecinos.
- **Descripción** — Al cerrar, React limpia la selección y devuelve el foco.
- **Precondiciones** — Imagen presente en los resultados actuales.
- **Disparador** — Activar «Ampliar».

**Flujo principal**

1. Galería guarda el botón de origen y selecciona el ID.
2. `Lightbox` abre el `<dialog>` con `showModal` y enfoca Cerrar.
3. El visitante consulta imagen, pie y crédito y puede recorrer vecinos.
4. Al cerrar, React limpia la selección y devuelve el foco.

- **Alternativas** — Anterior y Siguiente tienen límites, sin ciclo. Se cierra con botón, Escape o fondo. El enfoque vuelve a Colección si desapareció el botón.
- **Excepciones** — Una imagen rota usa alternativa textual; sin selección válida no se presenta el diálogo.
- **Postcondiciones** — Diálogo cerrado y foco recuperado o imagen elegida visible.
- **Reglas** — Tab y Shift+Tab quedan dentro del modal; los vecinos se calculan en el filtrado actual.
- **Participantes** — Galería, Lightbox, Picture, neighbour, API DOM del navegador.
- **Endpoints** — Ningún endpoint API en la interacción; posible descarga de imagen estática.
- **Persistencia** — Estado temporal del navegador.
- **Fuente** — [apps/web/src/features/galeria/index.tsx](../../../apps/web/src/features/galeria/index.tsx), [apps/web/src/features/galeria/logic.ts](../../../apps/web/src/features/galeria/logic.ts).
- **Pruebas identificadas** — [tests/spec-08.test.ts](../../../tests/spec-08.test.ts), [tests/e2e/spec-08.spec.ts](../../../tests/e2e/spec-08.spec.ts).
- **Secuencia** — [CU-17](../03-vista-procesos/secuencias/CU-17-ampliar-galeria.md).

### CU-18 · Consultar condiciones demo de acceso a sedes

- **Spec y actor** — Spec 9, ACT-01 (Visitante).
- **Objetivo** — Encontrar notas de acceso y dirección de una sede demo.
- **Descripción** — `filterVenues` aplica la consulta normalizada al nombre, dirección y notas.
- **Precondiciones** — Ruta `/accesibilidad` accesible.
- **Disparador** — Abrir la guía o introducir una búsqueda.

**Flujo principal**

1. La página consulta y valida las sedes.
2. React presenta nombre, dirección y notas de acceso.
3. `filterVenues` aplica la consulta normalizada al nombre, dirección y notas.

- **Alternativas** — Borrar la búsqueda restaura la lista. Una búsqueda sin resultados y un catálogo vacío tienen estados propios.
- **Excepciones** — Fallo de catálogo ofrece reintento sin afectar los controles de lectura.
- **Postcondiciones** — Información de acceso visible como dato demo.
- **Reglas** — No se deducen capacidades físicas; se indica confirmar con la sede.
- **Participantes** — Guía de accesibilidad, VenueCard, filterVenues, getResource, catálogo.
- **Endpoints** — GET /api/venues al cargar/reintentar.
- **Persistencia** — Lectura SQLite; consulta en memoria.
- **Fuente** — [apps/web/src/features/accesibilidad/index.tsx](../../../apps/web/src/features/accesibilidad/index.tsx), [apps/web/src/features/accesibilidad/logic.ts](../../../apps/web/src/features/accesibilidad/logic.ts).
- **Pruebas identificadas** — [tests/spec-09.test.ts](../../../tests/spec-09.test.ts), [tests/e2e/spec-09.spec.ts](../../../tests/e2e/spec-09.spec.ts).
- **Secuencia** — [CU-18](../03-vista-procesos/secuencias/CU-18-consultar-acceso.md).

### CU-19 · Personalizar la lectura de la guía

- **Spec y actor** — Spec 9, ACT-01 (Visitante).
- **Objetivo** — Ajustar y conservar tamaño y contraste o recuperar los valores predeterminados.
- **Descripción** — La guía anuncia el ajuste y la siguiente visita restaura el valor guardado.
- **Precondiciones** — Guía montada; los controles funcionan aunque falle el catálogo.
- **Disparador** — Abrir, elegir un ajuste o restablecer.

**Flujo principal**

1. `restore` intenta recuperar una preferencia válida.
2. El visitante cambia un radio o activa «Restablecer preferencias».
3. React aplica `data-*` y `writeLocal` intenta guardar el objeto versionado.
4. La guía anuncia el ajuste y la siguiente visita restaura el valor guardado.

- **Alternativas** — Sin valor se usan predeterminados. Un objeto JSON de esquema inválido activa aviso y permite repararlo al guardar o restablecer.
- **Excepciones** — Si se bloquea la escritura, el efecto visual se aplica pero no persiste. JSON no parseable se absorbe antes del validador de la guía.
- **Postcondiciones** — Preferencias aplicadas al ámbito `.a11y-guide`; guardadas si la escritura tiene éxito.
- **Reglas** — Tres tamaños y dos contrastes. Restablecer queda inactivo con valores por defecto y sin corrupción de esquema detectada.
- **Participantes** — Guía, restore, preferencesSchema, readLocal/writeLocal, CSS.
- **Endpoints** — Ninguno para los ajustes.
- **Persistencia** — `fiavl:accessibility:v1`, `{version:1,textSize,contrast}`.
- **Fuente** — [apps/web/src/features/accesibilidad/index.tsx](../../../apps/web/src/features/accesibilidad/index.tsx), [apps/web/src/features/accesibilidad/logic.ts](../../../apps/web/src/features/accesibilidad/logic.ts), [apps/web/src/features/accesibilidad/accesibilidad.css](../../../apps/web/src/features/accesibilidad/accesibilidad.css), [apps/web/src/lib/storage.ts](../../../apps/web/src/lib/storage.ts).
- **Pruebas identificadas** — [tests/spec-09.test.ts](../../../tests/spec-09.test.ts), [tests/e2e/spec-09.spec.ts](../../../tests/e2e/spec-09.spec.ts).
- **Secuencia** — [CU-19](../03-vista-procesos/secuencias/CU-19-personalizar-lectura.md).

### CU-20 · Consultar la guía editorial del FIAVL 2026

- **Spec y actor** — Spec 10, ACT-01 (Visitante).
- **Objetivo** — Identificar obras, artistas, horarios y sedes documentadas y acceder a la fuente.
- **Descripción** — El visitante consulta la referencia documental que le interesa.
- **Precondiciones** — Portada o `/espacios` accesible.
- **Disparador** — Elegir «Guía FIAVL 2026» o «Sedes de Loja».

**Flujo principal**

1. `FestivalProgram` presenta cuatro obras con horarios, artistas, sedes y enlaces.
2. `FestivalVenues` muestra dos sedes en portada y permite abrir las cinco en `/espacios`.
3. El visitante consulta la referencia documental que le interesa.

- **Alternativas** — Puede seguir un enlace externo de procedencia; se trata de navegación del navegador. El directorio demo de Espacios carga por su cuenta.
- **Excepciones** — Si falla la fotografía de archivo, se conserva la alternativa textual con la procedencia.
- **Postcondiciones** — Información editorial consultada sin escritura.
- **Reglas** — Las fichas editoriales locales son distintas de los registros demo reservables.
- **Participantes** — FestivalProgram, FestivalVenues, MuseumPhoto, datos `festival2026.ts`.
- **Endpoints** — Ningún endpoint API para lo editorial; imagen estática y navegación opcional a sitios fuente.
- **Persistencia** — Datos fuente en el código de presentación.
- **Fuente** — [apps/web/src/Home.tsx](../../../apps/web/src/Home.tsx), [apps/web/src/components/FestivalGuide.tsx](../../../apps/web/src/components/FestivalGuide.tsx), [apps/web/src/lib/festival2026.ts](../../../apps/web/src/lib/festival2026.ts), [apps/web/src/features/espacios/index.tsx](../../../apps/web/src/features/espacios/index.tsx).
- **Pruebas identificadas** — [tests/e2e/spec-10.spec.ts](../../../tests/e2e/spec-10.spec.ts).
- **Secuencia** — [CU-20](../03-vista-procesos/secuencias/CU-20-consultar-guia-editorial.md).

### CU-21 · Enviar una valoración sobre la experiencia

- **Spec y actor** — Spec 10, ACT-01 (Visitante).
- **Objetivo** — Compartir una puntuación y un comentario opcional y recibir confirmación.
- **Descripción** — La API devuelve 201 con `{accepted:true}`; la página valida el recibo, muestra confirmación e incrementa `revision`.
- **Precondiciones** — Ruta `/opiniones` activa y API disponible para confirmar.
- **Disparador** — Enviar una puntuación elegida.

**Flujo principal**

1. La página valida la entrada con `feedbackInputSchema` y deshabilita el envío mientras espera.
2. Express recibe JSON hasta 8 KiB; el servicio valida nuevamente y el repositorio inserta.
3. La API devuelve 201 con `{accepted:true}`; la página valida el recibo, muestra confirmación e incrementa `revision`.

- **Alternativas** — Comentario opcional; vacío o recortado a vacío se guarda `NULL`. El resumen vuelve a consultarse tras la confirmación.
- **Excepciones** — Entrada inválida → corrección; API 400/413 o fallo inesperado genera aviso genérico de reintento en UI. Una respuesta perdida no certifica que no se haya guardado.
- **Postcondiciones** — Valoración persistida si el INSERT tuvo éxito; confirmación visible si se recibió el 201 válido.
- **Reglas** — Puntuación entera 1–5, comentario máx. 500 caracteres antes de recortar, sin identificador de visitante o evento y sin deduplicación.
- **Participantes** — Opiniones, esquema compartido, fetch, router, servicio, repositorio, SQLite.
- **Endpoints** — POST /api/feedback. El cambio de revisión dispara GET /api/feedback/summary.
- **Persistencia** — SQLite feedback. Estado del formulario en memoria.
- **Fuente** — [apps/web/src/features/opiniones/index.tsx](../../../apps/web/src/features/opiniones/index.tsx), [apps/api/src/features/feedback.ts](../../../apps/api/src/features/feedback.ts), [apps/api/src/services/feedback.ts](../../../apps/api/src/services/feedback.ts), [apps/api/src/repositories/feedback.ts](../../../apps/api/src/repositories/feedback.ts), [packages/contracts/src/index.ts](../../../packages/contracts/src/index.ts), [apps/api/migrations/010_feedback.sql](../../../apps/api/migrations/010_feedback.sql).
- **Pruebas identificadas** — [tests/feedback.test.ts](../../../tests/feedback.test.ts), [tests/e2e/spec-10.spec.ts](../../../tests/e2e/spec-10.spec.ts).
- **Secuencia** — [CU-21](../03-vista-procesos/secuencias/CU-21-enviar-valoracion.md).

### CU-22 · Consultar el resumen de valoraciones

- **Spec y actor** — Spec 10, ACT-01 (Visitante).
- **Objetivo** — Conocer el total, la distribución y el promedio agregado de respuestas.
- **Descripción** — El cliente valida el JSON y presenta las métricas.
- **Precondiciones** — Ruta `/opiniones` o acceso al endpoint público.
- **Disparador** — Abrir Opiniones, reintentar o recibir confirmación de envío.

**Flujo principal**

1. `Summary` solicita el agregado.
2. El repositorio cuenta filas por `rating`; el servicio calcula total, cinco frecuencias y promedio.
3. El cliente valida el JSON y presenta las métricas.

- **Alternativas** — Con cero respuestas hay cinco frecuencias en cero y promedio `null`; la vista anuncia ausencia de valoraciones.
- **Excepciones** — Fallo HTTP o de contrato → reintento. El efecto aborta lecturas anteriores al cambiar la revisión o desmontarse.
- **Postcondiciones** — Resumen visible o estado de recuperación activado.
- **Reglas** — Promedio redondeado a un decimal; comentarios y filas individuales fuera del agregado.
- **Participantes** — Summary, getResource, router, servicio, repositorio, SQLite.
- **Endpoints** — GET /api/feedback/summary.
- **Persistencia** — Lectura agregada de SQLite, sin almacenar resultados en localStorage.
- **Fuente** — [apps/web/src/features/opiniones/index.tsx](../../../apps/web/src/features/opiniones/index.tsx), [apps/api/src/features/feedback.ts](../../../apps/api/src/features/feedback.ts), [apps/api/src/services/feedback.ts](../../../apps/api/src/services/feedback.ts), [apps/api/src/repositories/feedback.ts](../../../apps/api/src/repositories/feedback.ts), [packages/contracts/src/index.ts](../../../packages/contracts/src/index.ts).
- **Pruebas identificadas** — [tests/feedback.test.ts](../../../tests/feedback.test.ts), [tests/e2e/spec-10.spec.ts](../../../tests/e2e/spec-10.spec.ts).
- **Secuencia** — [CU-22](../03-vista-procesos/secuencias/CU-22-consultar-resumen.md).
