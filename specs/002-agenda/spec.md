# Feature Specification: Programación cultural (/agenda)

**Feature Branch**: `feature/spec-2` (rama humana existente) · **Directorio**: `specs/002-agenda` · **Status**: Implementado, pendiente de E2E

Fuente de datos: catálogo DEMO (`GET /api/events`, `/artists`, `/venues`). No usa las obras reales de `festival2026.ts` ni las muestra como reservables.

## User Story 1 - Consultar la programación (P1)
**Independent Test**: abrir `/agenda` sin ningún otro spec activo.
1. **Dado** el catálogo demo, **cuando** abro `/agenda`, **entonces** veo los eventos de la edición (12–22 nov 2026) ordenados por inicio e ID, sin ocultarlos por la fecha actual.
2. **Dado** un evento, **cuando** lo veo en su tarjeta, **entonces** muestra título, categoría, horario de Loja (America/Guayaquil), sede, imagen local y precio USD (`priceCents/100`; 0 = Gratuito).

## User Story 2 - Buscar y filtrar (P1)
1. **Dado** la lista, **cuando** escribo texto, **entonces** se filtra por título, descripción, categoría, artista o sede.
2. **Cuando** elijo fecha de la edición, categoría o gratuito/de pago, **entonces** los filtros se combinan.
3. **Cuando** pulso "Limpiar filtros", **entonces** vuelve la lista completa; si nada coincide, aparece un mensaje.

## User Story 3 - Detalle accesible (P2)
1. **Cuando** pulso "Ver detalle", **entonces** veo descripción, disciplina, horario, artistas y sede resueltos por `artistIds` y `venueId`, y el botón expone `aria-expanded`.

## User Story 4 - Estados (P2)
1. Mientras carga, se anuncia "Cargando programación…". Si la API falla, alerta con "Reintentar". Sin eventos, mensaje vacío.

## Requirements
- **FR-001** Consumir solo `getResource` con `eventsSchema`, `z.array(artistSchema)` y `z.array(venueSchema)`.
- **FR-002** Usar StageSection/StageHeading/StageCard/StageBadge/StageButton, tokens `--stage-*`, CSS local, foco visible y `prefers-reduced-motion`.
- **FR-003** Mostrar «Prototipo académico no oficial · Datos demo».
- **FR-004** Sin reservas, agenda personal, endpoints ni migraciones.
- **SC-001** Orden, filtros, precio y hora verificables por prueba Node; flujo completo por Playwright.

## Fuera de alcance
Reservas, Mi agenda, guía editorial real (solo enlaces diferenciados futuros).
