# Tasks: Mi agenda

- [x] T001 Pruebas de aceptación: `tests/spec-05.test.ts` (8) y `tests/e2e/spec-05.spec.ts` (9).
- [x] T002 `logic.ts`.
- [x] T003 `index.tsx` y `mi-agenda.css`, `available: true`.
- [x] T004 Suite completa local (ver validation.md; vigente: `npm test` 47/47, e2e 58/59 con la falla ajena de spec-06).
- [x] T005 Revisión visual a 375/1440 px con capturas de Chromium (jerarquía h3 y borde de conflicto). Pendientes, NO VERIFICADOS: lector de pantalla y revisión por una persona.
- [x] T006 Auditoría independiente (agente nuevo, SHA 56b6700): APTO PARA PULL REQUEST con tres observaciones no bloqueantes (H1 h3, H2 borde de conflicto, H3 documentación), corregidas en el commit siguiente. Checks de Actions del SHA final: ver PR #9.
- [ ] T007 Aprobación formal y merge: los decide Manuel.
- Incidencia preexistente ajena: `spec-06.spec.ts:142` falla en macOS también en `main` limpio; no se toca.
