# Validación de Mi agenda · 22 de noviembre de 2026

macOS (Darwin 24.6), rama `feature/spec-5` creada desde `main` en `10384a5` (incluye Spec 2). Node 24.22.3, npm 11.17.0, Chromium headless.

## Matriz de impacto (available=true de `/mi-agenda`)
| Consumidor | Cambio | Cobertura |
|---|---|---|
| Menú (`main.tsx`) | Desaparece «No disponible» en Mi agenda | e2e spec-05 (entrada directa) |
| Ruta `/mi-agenda` | Deja de mostrar `Unavailable` | e2e spec-05 |
| Home / carrusel | No cambia: el CTA de la primera escena ya apunta a `/agenda` (Spec 2) y no se tocó | spec-10 (suite completa) |
| `/agenda` y otras features | Sin cambios; Mi agenda no escribe en su estado ni depende de su UI | spec-02/04/07/10 en la suite completa |
| Persistencia | Solo `fiavl:agenda:v1` vía `readLocal/writeLocal` | tests/storage.test.ts + spec-05 |

## Resultados reales
| Comando | Salida | Detalle |
|---|---:|---|
| `npm run lint` | 0 | sin avisos |
| `npm run typecheck` | 0 | sin errores |
| `npm test` | 0 | 17 pruebas, 17 pasan |
| `npm run build` | 0 | api y web compilan |
| `npm run test:e2e` | 0 | 25 de 25 pasan (4 de spec-05) |
| `playwright test spec-10 -g "escena automática" --repeat-each=8` | 0 | 8 de 8 pasan |

## Escenarios probados
Añadir, duplicado (botón deshabilitado y `addId` idempotente), quitar, orden, solapamiento real (`umbral-de-luz`/`el-rio-suena`), extremos contiguos (solo unitaria: el catálogo demo no tiene un par contiguo), recarga, ID inexistente, almacenamiento corrupto, almacenamiento bloqueado (aviso), error con reintento, 375 px y 1440 px sin desbordamiento horizontal.

## Límites
- Los helpers `.ps1` de Spec Kit no se ejecutaron (no hay `pwsh` en macOS); los artefactos SDD se redactaron a mano.
- NO VERIFICADO: revisión visual manual, lector de pantalla, movimiento reducido en navegador (solo comprobación estática del CSS), otros sistemas operativos.
- CI remoto NO consultado. El test intermitente de Spec 10 («escena automática…») falló una vez en una corrida local y una vez en CI en una rama anterior; su causa no está demostrada. Las 8 repeticiones de hoy pasaron, lo que no demuestra que esté resuelto. No se tocó.
- Prueba ajena modificada: ninguna.

## Actualización 23 de noviembre de 2026 · sincronización con main (resultados LOCALES)
- `origin/main` (798337c, PR #6 Spec 3 Artistas) integrado con `git merge --no-edit origin/main` (commit de merge fdd31cd), sin conflictos. Spec 3 presente (`specs/003-artistas`, `tests/e2e/spec-03.spec.ts`).
- Runtime: Node 24.22.3 y npm 11.17.0 (prefijo del README); `npm ci` salida 0.
- `npm run lint`, `typecheck`, `build`: salida 0. `npm test`: 23 de 23. `npm run test:e2e`: 30 de 30 (Chromium, macOS).

### Prueba intermitente de Spec 10 («escena automática, pausas, teclado e indicadores»)
- Reproducida: antes del cambio, `--repeat-each=15` dio 12 fallos y 3 aciertos (con los workers en paralelo), todos en `spec-10.spec.ts:54`: `Expected "Ir a escena 2"`, `Received "Ir a escena 3"`, justo después de simular la pestaña oculta y avanzar el reloj 8000 ms.
- Causa probable (consistente con la evidencia, no probada en el componente): la prueba avanzaba el reloj falso justo después de disparar el evento, antes de que React confirmara el estado de pausa y limpiara el temporizador de `StageCarousel`. No se identificó defecto en el componente y no se tocó.
- Cambio mínimo autorizado por Manuel, solo en `tests/e2e/spec-10.spec.ts`: antes de cada `fastForward` se espera el texto de estado visible correspondiente (autoavance, puntero, pausa manual, controles, pestaña en pausa). No se quitaron aserciones, ni se añadieron esperas fijas ni timeouts mayores.
- Después del cambio: `--repeat-each=15` dio 15 de 15 aciertos. Es evidencia local; no se sabe si el CI de Linux lo confirmará.
- GitHub Actions de esta actualización: NO consultado todavía.

## Corrección de contraste (23 de noviembre de 2026, a petición de Manuel)
- `mi-agenda.css`: el título `h1` pasa de `--stage-ivory` (invisible sobre fondo marfil) a `--stage-ink`. Además, las tarjetas de Mi agenda tienen relleno (`--stage-gap`) para que el texto no toque el borde. La prueba estática de tokens usa `--stage-ink` en lugar de `--stage-ivory`.
- Revisión visual (capturas con Playwright/Chromium en macOS, vista de `/mi-agenda` con dos eventos agregados): a 1440 px y a 375 px el título, los encabezados, las tarjetas, el aviso de solapamiento y los botones se leen y no hay desbordamiento horizontal. Revisión por una persona, lector de pantalla y movimiento reducido en navegador: NO VERIFICADOS.
- Local: lint, typecheck y build salida 0; `npm test` 23 de 23; `npm run test:e2e` 30 de 30. GitHub Actions de este commit: NO consultado.

## Actualización 23 de noviembre de 2026 · segunda sincronización con main (resultados LOCALES, macOS)
- `origin/main` (64d2f8c, hasta el PR #8 Spec 9) integrado con `git merge --no-edit origin/main` (merge 8e04858), sin conflictos.
- `npm ci`, lint, typecheck y build: salida 0. `npm test`: 44 de 44.
- `npm run test:e2e`: 53 de 54. Falla `spec-06.spec.ts:142` («reservas: teclado completo…»): `Expected: not ""`, `Received: ""` en `getByLabel('Evento')` tras `ArrowDown` (línea 153). Falla 6 de 6 en la rama y 3 de 3 en un worktree limpio de `origin/main`, así que NO la introduce Mi agenda. Causa no demostrada; hipótesis: en macOS, `ArrowDown` sobre un `<select>` abre la lista en lugar de cambiar el valor. No se tocó (prueba de otro spec).
- GitHub Actions (Windows y Linux) de este commit: NO consultado.

## Cierre del desarrollo definitivo · 24 de noviembre de 2026 (resultados LOCALES, macOS)
- Base: `origin/main` = 64d2f8c ya integrado (0 commits de `main` sin incorporar; Specs 3, 6 y 9 presentes). Node 24.22.3, npm 11.17.0 (prefijo del README).
- Contraste del foco (calculado): el anillo dorado `--stage-gold` daba 1,82:1 sobre `--stage-surface` y 1,64:1 sobre `--stage-ivory` (mínimo 3:1). Ahora el anillo es `--stage-wine` con doble anillo blanco: 12,19:1 y 10,98:1. Cambio solo en `mi-agenda.css`; los tokens globales no se tocaron.
- Catálogo sin eventos: antes la sección «Agregar eventos» quedaba vacía sin explicación; ahora muestra «El catálogo no tiene eventos por ahora.».
- Pruebas añadidas: unitarias (conflictos múltiples, desempate por ID sin mutar la entrada, foco sin dorado) y e2e (catálogo vacío, respuesta fuera de contrato con reintento, almacenamiento bloqueado al leer, teclado + foco visible + movimiento reducido, 320 px y 768 px sin desbordamiento).
- Resultados: `verify-runtime`, lint, typecheck y build: salida 0. `npm test`: 46 de 46. `npm run test:e2e`: 57 de 58. Spec 5 e2e: 8 de 8. `spec-10 -g "escena automática" --repeat-each=15`: 15 de 15.
- Falla conocida, ajena: `spec-06.spec.ts:142` (selector «Evento» vacío tras `ArrowDown`). Falla igual en un worktree limpio de `origin/main` en esta Mac; hipótesis no demostrada: comportamiento de `<select>` en macOS. No se tocó.
- Verificación del foco: por estilo computado en Chromium (color, ancho, estilo); no se hizo captura visual del anillo ni revisión con lector de pantalla (NO VERIFICADO).
- Spec Kit: helpers `.ps1` no ejecutados (no hay `pwsh` en macOS). GitHub Actions de este commit: se consulta aparte.

## Auditoría independiente y correcciones · 24 de noviembre de 2026 (VIGENTE para el SHA siguiente a 56b6700)
Las secciones anteriores se conservan como historial; las líneas «GitHub Actions … NO consultado» de ellas quedaron superadas por los checks del PR #9.

**Auditoría (SHA 56b6700, PR #9).** La hizo un agente nuevo, sin el contexto del desarrollo, en un clon limpio, con el prompt de auditoría del líder. Es independiente del autor del código, pero no es una revisión humana ni de otro modelo. Veredicto: APTO PARA PULL REQUEST, con tres observaciones no bloqueantes. Resultados que el auditor reportó: lint, typecheck y build salida 0; `npm test` 46/46; e2e 57/58 (solo `spec-06.spec.ts:142`); `spec-10 --repeat-each=10` 90/90; checks de push (run 45322093609) y de `pull_request` (run 45430429412) en verde en Linux y Windows.

**Observaciones y su corrección** (solo `index.tsx`, `mi-agenda.css` y pruebas de Spec 5):
- H1 (jerarquía): los títulos de tarjeta eran `h2` del tamaño de las secciones. Ahora son `h3` (`.mi-agenda-card-title`, 21,6 px a 375 px y 28 px a 1440 px, frente a 37,6 y 57,6 px de los `h2`). El `h1` y los dos `h2` («Tu programa», «Agregar eventos») no cambian.
- H2 (contraste): el borde del aviso de solapamiento pasa de `--stage-gold` (1,64:1) a `--stage-wine` (10,98:1 sobre marfil, 12,19:1 sobre la tarjeta). No se añadieron tokens. `--stage-gold` ya no se usa en la hoja de Spec 5.
- H3 (documentación): el diff de `tests/e2e/spec-10.spec.ts` contra `main` es vacío porque la estabilización ya estaba integrada en `main` (commit 159614e); no se eliminaron aserciones. Las referencias anteriores a un «cambio» en ese archivo describen esa estabilización, no un cambio pendiente de este PR.
- Menor, sin cambio: sede inexistente muestra «· » sin nombre; el catálogo demo no tiene ese caso.

**Pruebas añadidas:** unitaria de estructura (h3 en las dos listas, borde en vino, sin dorado) y e2e «jerarquía h1 > h2 > h3 y borde de conflicto en vino» (un `h1`, dos `h2`, un `h3` por tarjeta, borde `rgb(89, 28, 55)`, tamaño de `h3` menor que el de `h2`). La prueba de tokens usa ahora `--stage-wine` en lugar de `--stage-gold`.

**Resultados LOCALES tras las correcciones (macOS, Node 24.21.0 con npm 11.17.0 del README):**
- `npm run lint`, `typecheck`, `build`: salida 0. `npm test`: 47 de 47.
- `npm run test:e2e`: 58 pasan y 1 falla. Spec 5 e2e: 9 de 9. La falla es `spec-06.spec.ts:142`.
- Revisión visual con capturas de Chromium a 375 y 1440 px (`/mi-agenda` con dos eventos en conflicto): jerarquía legible, borde de conflicto en vino, sin desbordamiento. No se versionan.

**Incidencia preexistente, no tocada:** `tests/e2e/spec-06.spec.ts:142` (selector «Evento» vacío tras `ArrowDown`) falla igual en `origin/main` limpio en macOS (también lo comprobó el auditor en un worktree limpio). Hipótesis no demostrada: comportamiento de `<select>` en macOS. En CI (Linux y Windows) pasa. Spec 6 y su prueba no se modificaron.

**NO VERIFICADO:** lector de pantalla y revisión visual por una persona. GitHub Actions del commit de estas correcciones: ver el PR #9.
