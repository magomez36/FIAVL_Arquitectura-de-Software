# Validación de Agenda · 22 de noviembre de 2026

macOS (Darwin 24.6), rama feature/spec-2 desde main 450651e, Node 24.22.3, npm 11.17.0 (prefijo del README), `npm ci` limpio.

| Comprobación | Salida | Evidencia |
|---|---:|---|
| git rev-parse / branch / status / remote -v | 0 | Raíz y rama correctas; origin = magomez36/FIAVL_Arquitectura-de-Software |
| specify version | 0 | CLI presente (Spec Kit 1.4.3 según AGENTS.md; versión exacta no verificada en esta salida) |
| Helpers `.specify/scripts/powershell/*.ps1` | NO EJECUTADOS | No hay `pwsh` en macOS. Se adaptó: se usó SPECIFY_FEATURE_DIRECTORY=specs/002-agenda como convención, se leyeron las plantillas y se redactaron los artefactos a mano |
| node scripts/verify-runtime.mjs | 0 | Runtime correcto |
| npm run lint | 0 | Sin avisos |
| npm run typecheck | 0 | Sin errores |
| npm test | 0 | 12 pruebas, 12 pasan (3 de ellas de coherencia visual estática) |
| npm run build | 0 | api y web compilan |
| npm run test:e2e (Chromium headless) | 1 | 20 de 22 pasan. Las 2 de `spec-02.spec.ts` pasan (tras corregir un selector ambiguo de mi prueba y un `stage-badge` que tapaba el botón). Fallan 2 de `spec-10.spec.ts` («escena y destinos» a 375 y 1440 px) |

## Adaptaciones y límites
- Orden de pruebas: la primera versión de la página se escribió antes que las pruebas; las pruebas de aceptación definitivas (E2E y de coherencia) se añadieron en la segunda pasada, antes de ejecutar los comandos.
- Las pruebas de coherencia visual son estáticas (código y CSS); no sustituyen la revisión a 375/1440 px, que NO está verificada.
- No se ejecutaron análisis/convergencia de skills con CLI; la cobertura requisito→prueba está en checklists/requirements.md.
- Fallo heredado/de integración, no de la lógica de Agenda: `spec-10.spec.ts:13` espera `href="#seleccion"` en la primera escena del carrusel, pero `Home.tsx` usa `agendaAvailable` y `StageCarousel.tsx:63` enlaza a `/agenda` cuando Agenda está activa. Al activar `available: true` (obligatorio) el contrato del carrusel cambia por diseño. La prueba es de Manuel y no se editó; requiere su decisión. No se comprobó contra `origin/main` con un worktree.
- No hubo revisión visual manual a 375/1440 px ni lector de pantalla; solo las comprobaciones E2E a 375 px (sin desbordamiento horizontal).
- Fuera de esta ejecución: otros sistemas, CI remoto.
