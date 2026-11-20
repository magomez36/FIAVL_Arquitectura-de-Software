# Tasks: Base de FIAVL Explora

## Phase 1: Setup

- [X] T001 Fijar Node/npm, workspaces, versiones, scripts, exclusiones y lock en package.json, package-lock.json, .nvmrc, .gitignore y configuraciones de apps/.

## Phase 2: Foundational

- [X] T002 Implementar en packages/contracts/src/index.ts las definiciones canónicas de data-model.md para Event.id, Event.title, Event.description, Event.category, Event.startAt, Event.endAt, Event.venueId, Event.artistIds, Event.priceCents, Event.capacity, Event.reservable, Event.image, Artist.id, Artist.name, Artist.bio, Artist.country, Artist.discipline, Artist.image, Venue.id, Venue.name, Venue.address, Venue.description, Venue.accessibilityNotes, Venue.image.

## Phase 3: User Story 1 – Consultar el catálogo (P1)

Prueba independiente: dos semillas, reinicio, listas y todas las fichas por HTTP.

- [X] T003 [US1] Escribir pruebas de salud, catálogo, errores, idempotencia y persistencia en tests/catalog.test.ts (FR-001/002, SC-001).
- [X] T004 [US1] Crear apps/api/migrations/001_base.sql y apps/api/src/db.ts con FK, migraciones transaccionales y persistencia.
- [X] T005 [US1] Preparar inventario y carga idempotente en apps/api/src/seed.ts con solapamiento, cupos y fechas de la edición.
- [X] T006 [US1] Servir listas, detalles, salud y errores en apps/api/src/app.ts y apps/api/src/catalog.ts y verificar con T003.

## Phase 4: User Story 2 – Descubrir la edición (P1)

Prueba independiente: recorrer la portada y nueve entradas directas en Chromium; provocar cada estado del catálogo.

- [X] T007 [US2] Escribir smoke real y escenarios de estados y navegación en tests/e2e/home.spec.ts (FR-003/004, SC-002).
- [X] T008 [P] [US2] Dibujar identidad y recursos en apps/web/public/art/ y registrar su procedencia en docs/assets.md.
- [X] T009 [P] [US2] Crear cliente HTTP y almacenamiento por función en apps/web/src/lib/ (FR-005).
- [X] T010 [US2] Implementar portada, navegación, estados compartidos y nueve módulos de ruta en apps/web/src/, con diseño adaptable y acceso por teclado.

## Phase 5: User Story 3 – Integrar una contribución (P2)

Prueba independiente: instalar desde cero, ejecutar smoke y ubicar la entrada de cada dueño.

- [X] T011 [US3] Verificar 501 y registrar routers distintos en apps/api/src/features/reservations.ts y apps/api/src/features/feedback.ts (FR-005).
- [X] T012 [P] [US3] Describir instalación, propiedad, arquitectura Mermaid 4+1, ADR, roadmap y contribución en README.md, AGENTS.md y docs/ (FR-006).
- [X] T013 [P] [US3] Publicar tipos, relaciones, errores, ejemplos y fixtures en docs/contracts.md.
- [X] T014 [US3] Configurar comprobaciones en .github/workflows/ci.yml con Windows y Linux y Chromium sin credenciales de aplicación.

## Phase 6: Polish & Cross-Cutting Concerns

- [X] T015 Ejecutar quickstart.md desde copia limpia y registrar los comandos, evidencias, sistemas y límites en specs/001-base/validation.md (SC-003).

## Dependencies & Execution Order

T001 → T002 → US1 (MVP) → US2 → US3 → copia limpia. US1 comparte esquema y pruebas entre persistencia y API; ejecutar T004 y T005 en orden. En US2 se pueden preparar gráficos y cliente a la vez. En US3 se pueden redactar la guía de integración y el contrato en archivos distintos.

## Implementation Strategy

Probar el catálogo antes de integrar la portada. Validar cada historia y repetir las puertas de calidad sobre la entrega exportada. La aprobación del merge corresponde a Manuel.

## Phase 7: Incorporación de US3

- [X] T016 [US3] Implementar fiavl.cmd y scripts/bootstrap.ps1 para runtime, integridad, caché, puertos y cuatro modos (FR-007/008).
- [X] T017 [US3] Proteger inicialización de datos en apps/api/src/seed.ts y documentar FIAVL_DB en .env.example (FR-009).
- [X] T018 [US3] Alinear .github/workflows/ci.yml, README.md, AGENTS.md y quickstart.md con el entorno y el flujo SDD (FR-008/009).
- [X] T019 [US3] Verificar controles y escenarios A–K desde copia limpia, registrar resultados y revisar convergencia en validation.md (SC-004).

## Phase 8: Cierre de auditoría

- [X] T020 [US1] Componer operaciones, repositorio y routers al arrancar en apps/api/src/composition.ts. Mantener SQL y filas fuera de apps/api/src/app.ts (FR-001/002, SC-001, principio I).
- [X] T021 [US3] Separar las pruebas de reservas y opiniones y comprobar navegación con disponibilidad mixta en tests/e2e/home.spec.ts (FR-004/005, SC-002, principio IV).
- [X] T022 Actualizar docs/architecture.md, docs/adr.md, AGENTS.md, el plan y la nota editorial; registrar check y convergencia en validation.md (FR-006, principio V).
