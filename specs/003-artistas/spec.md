# Feature Specification: Catálogo de artistas (/artistas)

**Feature Branch**: `feature/spec-3` (rama humana existente; el helper de Spec Kit la deriva del directorio como `003-artistas`) · **Directorio**: `specs/003-artistas` · **Created**: 2026-11-22 · **Status**: Implementado, pendiente de auditoría

**Input**: Mostrar el catálogo de artistas con imagen, nombre, país, disciplina, biografía y detalle accesible; búsqueda por nombre; filtros combinables por país y disciplina; actuaciones relacionadas por `artistIds`.

Fuente de datos: catálogo DEMO (`GET /api/artists`, `/events`, `/venues`). Prototipo académico no oficial, hora America/Guayaquil. Sin dependencia de `/agenda` ni de Spec 2.

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Explorar el catálogo (Priority: P1)
**Independent Test**: abrir `/artistas` con `/agenda` aún pendiente.
1. **Dado** el catálogo demo, **cuando** abro `/artistas`, **entonces** veo una ficha por artista (orden de la API) con imagen local, nombre, país, disciplina y biografía.
2. **Dado** que la API responde, **cuando** consulto el contador, **entonces** anuncia «N artistas» y se actualiza al filtrar.

### User Story 2 - Buscar y filtrar (Priority: P1)
1. **Dado** la lista, **cuando** escribo parte del nombre (sin distinguir mayúsculas ni tildes), **entonces** solo quedan artistas cuyo nombre coincide.
2. **Cuando** elijo un país y/o una disciplina, **entonces** los criterios se combinan con la búsqueda (AND). Las opciones salen de los datos recibidos.
3. **Cuando** pulso «Limpiar filtros», **entonces** vuelve el catálogo completo y los controles quedan vacíos.
4. **Dado** que nada coincide, **entonces** se muestra «No hay artistas que coincidan con los filtros.» y el contador indica 0.

### User Story 3 - Detalle y actuaciones (Priority: P1)
1. **Cuando** pulso «Ver detalle» de un artista, **entonces** el botón expone `aria-expanded`/`aria-controls` y se muestra su biografía completa y sus actuaciones.
2. **Dado** un artista, **entonces** sus actuaciones son los eventos cuyo `artistIds` incluye su `id`, ordenados por inicio e id, con título, fecha y hora de Loja (-05:00, sin desplazamiento por UTC) y sede resuelta por `venueId` (si la sede no existe, se omite).
3. **Dado** un artista sin eventos, **entonces** el detalle dice «Este artista no tiene actuaciones programadas.»

### User Story 4 - Estados de datos (Priority: P2)
1. Mientras carga: «Cargando artistas…» (`role=status`).
2. Si cualquier lectura falla o no cumple el contrato: alerta con «Reintentar», que vuelve a consultar.
3. Si la API devuelve `[]`: «Aún no hay artistas en el catálogo.»; sin controles de filtro.

### Edge Cases
- Eventos sin artistas o con artistas desconocidos no afectan al catálogo.
- Evento que cruza medianoche UTC (p. ej. 23:30-05:00) se muestra con su día civil de Loja.
- Filtro vigente cuyo detalle abierto queda oculto: el detalle desaparece con la ficha.
- Imagen: `alt` vacío (decorativa; el nombre ya está en texto).

## Requirements *(mandatory)*
- **FR-001** Consumir solo `getResource('artists'|'events'|'venues', …)` con `z.array(artistSchema)`, `eventsSchema` y `z.array(venueSchema)`; sin prefijo `/api` duplicado.
- **FR-002** Mostrar imagen, nombre, país, disciplina y biografía por artista.
- **FR-003** Búsqueda por nombre y filtros por país y disciplina, combinables, con reinicio.
- **FR-004** Detalle por botón con `aria-expanded`; actuaciones por `artistIds`; estado vacío.
- **FR-005** Estados de carga, error con reintento y vacío; sin datos ficticios de relleno.
- **FR-006** Usar los componentes `Stage*` y tokens `--stage-*`, CSS propio acotado, foco visible, teclado, `prefers-reduced-motion`, responsive 375–1440 px; texto en español.
- **FR-007** Mostrar «Prototipo académico no oficial · Datos demo».
- **FR-008** `available: true` solo tras cumplir la aceptación; sin CRUD, endpoints, migraciones ni cambios en archivos comunes.
- **FR-009** No importar nada de `features/agenda` ni de otro spec.

## Success Criteria *(mandatory)*
- **SC-001** Con el seed, 6 artistas visibles; «Música» + «Ecuador» deja 2; limpiar restaura 6.
- **SC-002** `colectivo-umbral` muestra «Umbral de luz» el 12 de noviembre a las 18:00 en el Teatro del Sur; un artista sin eventos muestra el estado vacío.
- **SC-003** Cada estado (carga, error→reintento, vacío) es verificable por prueba E2E.
- **SC-004** Lógica de filtrado y relación artista–evento verificada por pruebas Node sin navegador.
- **SC-005** Sin desbordamiento horizontal a 375 px.

## Key Entities
Artist (`id, name, bio, country, discipline, image`), Event (`artistIds, title, startAt, venueId`), Venue (`id, name`). Solo lectura.

## Assumptions
- La imagen de las fichas es el arte local del catálogo (`/art/*.svg`, ver `docs/assets.md`).
- La búsqueda es por nombre (el requisito); país y disciplina se filtran con selectores.
- No hay paginación: el contrato entrega la lista completa.

## Fuera de alcance
CRUD de artistas, rutas propias por artista, reservas, agenda personal, endpoints o migraciones nuevos.

## Adaptaciones al flujo Spec Kit
- Rama: se usa la rama humana existente; no se ejecutó hook de rama ni numeración automática.
- `specify` CLI 1.4.3 no está instalado en este equipo; se usaron las skills de `.agents/skills/` y los helpers de `.specify/scripts/powershell/` (`resolve-template`, `check-prerequisites -Json -PathsOnly`).
