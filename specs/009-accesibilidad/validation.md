# Validación de Accesibilidad · 23 de noviembre de 2026

Windows 11 x64, rama feature/spec-9. HEAD inicial y base 3832460 (main con Spec 6, PR #7); origin/main coincidía y era ancestro. Árbol limpio al inicio. El SHA final es el del commit publicado (ver informe de entrega).

| Comprobación | Salida | Evidencia |
|---|---:|---|
| git status, branch, rev-parse, fetch, log origin/main | 0 | Rama y remoto esperados |
| `.\fiavl.cmd setup` | 0 | Node 24.22.3, npm 11.17.0, dependencias vigentes, seed preparado |
| `node --test tests/spec-09.test.ts` | 0 | 4 pruebas |
| `tsc --noEmit`, `eslint` sobre archivos propios | 0 | Sin hallazgos |
| `playwright test tests/e2e/spec-09.spec.ts` (antes de activar available) | 0 | 10 escenarios |
| `.\fiavl.cmd check` (una ejecución, sin tubería, available:true) | 0 | lint, tipos, 39 pruebas Node, build y 43 E2E correctos |

## Cobertura
- US1/R1: cinco sedes de la API con dirección y notas idénticas al registro; aviso demo visible.
- US2/R2: «TELON» con espacios → Teatro del Sur; búsqueda en notas; sin coincidencias; limpiar restaura 5.
- US3/R4: tamaño extra grande aumenta la fuente computada >1,4×; contraste elevado cambia fondo a rgb(15,9,20); html/body sin clases.
- US4/R3: JSON `{version:1,...}` en fiavl:accessibility:v1; restauración tras reload con aviso; datos corruptos → predeterminados con aviso; almacenamiento bloqueado → se aplica, alerta y sin pageerror.
- US5: carga, respuesta inválida, Reintentar, catálogo vacío; preferencias operativas durante el fallo.
- R5: pares de color verificados por cálculo en tests (AA 4,5:1 texto, 3:1 foco/bordes; foco elevado dorado solo sobre fondo oscuro, foco estándar #005A6B sobre claro); contorno ≥3 px; movimiento reducido → transiciones 0 s.
- R6: navegación por flechas en radios, 375 y 1440 px sin desbordamiento con texto extra grande y contraste elevado.
- Regresión: menú y nueve rutas, Home, Agenda, Artistas, Espacios, Reservas, Rutas y Opiniones pasan en el mismo `check`. Mi agenda y Galería siguen pendientes según main. Spec 10 no mostró intermitencia en esta ejecución.

## Límites (NO VERIFICADO)
- Spec Kit: `specify` no está instalado (CLI no encontrado); specs/009-accesibilidad se redactó manualmente, sin ejecutar helpers. NO VERIFICADO con Spec Kit 1.4.3.
- Lector de pantalla (NVDA/JAWS/VoiceOver): NO VERIFICADO; solo roles y regiones aria comprobados por Playwright.
- Inspección visual: capturas de Chromium a 1440 px (estándar) y 375 px (elevado, extra grande) revisadas manualmente; no se conservan en el repositorio. Otros navegadores y dispositivos físicos: NO VERIFICADO.
- CI remoto (Windows/Linux) del SHA nuevo: se consulta tras el push.
- No implica conformidad WCAG certificada. Rollup avisa de anotaciones descartadas en Zod (preexistente).
