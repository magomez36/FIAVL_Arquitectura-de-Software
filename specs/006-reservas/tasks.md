# Tareas de Reservas

Marcadas `[x]` solo las acciones realizadas y con evidencia en validation.md. Las `[ ]` quedan pendientes.

## Aceptación previa

- [x] T001 Contrato REST y matriz de impacto en spec.md.
- [x] T002 Pruebas HTTP/unidad/migración/concurrencia en tests/reservations.test.ts (R1–R5, E1–E3, E5).
- [x] T003 Pruebas de lógica web y almacenamiento en tests/spec-06.test.ts (R7).
- [x] T004 Pruebas Playwright en tests/e2e/spec-06.spec.ts (R6, E4).

## Implementación

- [x] T005 Migración apps/api/migrations/006_reservations.sql.
- [x] T006 Repositorio con SQL parametrizado y `BEGIN IMMEDIATE` (R2, R3).
- [x] T007 Servicio con validación, decisión y referencia opaca (R1, R5).
- [x] T008 Router HTTP y composición; sustituye el 501 y su prueba histórica (R3).
- [x] T009 Lógica, cliente y validador de `fiavl:reservations:v1` (R7).
- [x] T010 Página /reservas con estados, formulario, confirmación, «Mis reservas» y cancelación por referencia (R6).
- [x] T011 Estilos locales con tokens `--stage-*` y contraste con `--stage-ink`.

## Integración

- [x] T012 Poner `available: true` tras pasar la aceptación propia.
- [x] T013 `.\fiavl.cmd check` completo y registro en validation.md.
- [ ] T014 Inspección visual manual a 375 y 1440 px (no realizada: sin acceso visual; solo comprobaciones automáticas de desbordamiento).
- [x] T015a Actualizar docs/contracts.md (autorizado) y decidir mantener INVALID_INPUT para 409/422.
- [ ] T015b Mover los esquemas a packages/contracts y añadir CONFLICT: no necesario ahora; requiere autorización.
- [x] T016a Commit y push a feature/spec-6 (autorizados); ver validation.md.
- [ ] T016b Auditoría independiente en sesión nueva, PR y merge (los decide Manuel).

T001–T004 preceden a T005–T011; T012 sigue a T010; T013 verifica el conjunto.
