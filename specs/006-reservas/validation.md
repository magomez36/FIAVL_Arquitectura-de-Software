# Evidencia de Spec 06

Windows 11 Home 10.0.26200 x64, Node 24.22.3, npm 11.17.0 (runtime del bootstrap; el Node del PATH era 22.21.0). Rama feature/spec-6, HEAD 798337c = origin/main tras `git fetch` (incluye Specs 1, 2, 3, 4, 7 y 10; Spec 5 pendiente y sin dependencia). Árbol limpio al comenzar; un solo checkout; sin add/commit/push. Servidores detenidos durante las ejecuciones.

| Comando | Salida | Resultado |
|---|---:|---|
| `.\fiavl.cmd setup` | 0 | Dependencias vigentes y seed preparado |
| `check-prerequisites.ps1 -Json -PathsOnly` con `SPECIFY_FEATURE_DIRECTORY=specs/006-reservas` | 0 | FEATURE_DIR = specs/006-reservas (el campo BRANCH lo deriva del directorio, no de Git) |
| `specify version` | error | CLI no instalado: no se ejecutaron fases del CLI; documentos redactados a mano (ver plan.md) |
| `node --test tests/reservations.test.ts` (antes de la UI) | 0 | 12 de 12 |
| `npx playwright test tests/e2e/spec-06.spec.ts` | 0 | 7 de 7, 9,7 s |
| `.\fiavl.cmd check` (1.ª, con tubería) | — | mismos resultados; el código de salida de esa ejecución no es concluyente |
| `.\fiavl.cmd check` (2.ª, sin tubería) | 0 | lint sin avisos, tipos sin errores, Node 35 de 35, build correcto, Playwright 33 de 33 (50,7 s) |
| `.\fiavl.cmd check` (3.ª, final, tras editar contracts.md y la prueba de fuentes; sin tubería) | 0 | Node 35 de 35, Playwright 33 de 33 (1,1 min), lint, tipos y build correctos. La prueba de spec-10 «escena automática…» pasó otra vez (3 de 3 ejecuciones completas); no prueba que la inestabilidad esté resuelta |
| `git diff --check` | 0 | Solo avisos de conversión LF→CRLF de Git |

Rollup emite avisos de comentarios de Zod conocidos y completa el build. Los 35 Node tests = 12 (reservations) + 6 (spec-06) + 17 previos; la prueba histórica de 501 se sustituyó, no se conservó.

## Correspondencia con la aceptación

| Criterio | Evidencia |
|---|---|
| US1 crear / errores | reservations.test «crear…», «entradas inválidas…» (cantidades 0, −1, 1,5, "2", null, 11, 1e9; cuerpos mal formados, campos extra, sin Content-Type, 413; evento inexistente 404; no reservable 422); e2e 1 y 2 |
| US2 restantes | «disponibilidad…» (reserved/remaining ≠ capacity), e2e 1 (40→37→40 plazas, 7 reservables, El río suena ausente), «Aforo agotado» deshabilitada en e2e 2 |
| US3 cancelar | «crear, consultar y cancelar…» (doble cancelación: restantes 1→1 y cuerpo idéntico), «no se puede cancelar la reserva ajena…» (IDs «1», «2», «0», longitudes 31/33 → 400; desconocida → 404), e2e 2 (cancelación manual) |
| US4 estados | e2e 4 (carga, error, reintento, vacío), e2e 5 (storage corrupto y bloqueado) |
| US5 concurrencia / persistencia | «dos reservas concurrentes…» (misma conexión: 201+409; dos conexiones sobre un archivo con 6 solicitudes y 2 plazas: exactamente 2×201, 4×409, SUM activa = 2), «persistencia tras reabrir…» |
| Capacidad 0 | «aforo…» (capacity=0 → 409 «No quedan plazas»), saldo exacto aceptado y siguiente rechazado |
| R3 capas | «el router no usa SQL…» + «un fallo del almacenamiento hace ROLLBACK…» (trigger que aborta: 500, `isTransaction=false`, sin reserva parcial) |
| R4 / E5 migración | «la migración 006 convive con 010…»: BD limpia registra [1, 6, 10]; BD con 001 y 010 aplicadas y 3 respuestas de feedback: tras abrir se aplica 006, filas idénticas, resumen `{total:3, distribution:[0,0,1,0,2], average:4.3}`, POST /api/feedback y GET /summary siguen funcionando, reabrir no duplica el registro. 010_feedback.sql sin modificar (`git status`) |
| R7 storage | spec-06.test (validador estricto, duplicados, datos extra, máximo 20, JSON corrupto, `SecurityError`) y e2e 5 |
| R6 / E4 UI | e2e 6 (375 y 1440 px sin desbordamiento; Tab y Enter; foco al encabezado de confirmación; contorno de foco no `none`), e2e 7 (movimiento reducido, título del documento, menú sin «No disponible») |

## Matriz de impacto tras `available: true`

| Superficie | Resultado observado |
|---|---|
| Menú y nueve rutas (home.spec) | Pasa: /reservas ya no muestra «Función no disponible» |
| Entradas activas independientes (home.spec) | Pasa: su módulo de prueba para /reservas sigue sustituyendo a la entrada real |
| Agenda, Artistas, Espacios, Rutas, Opiniones, carrusel | spec-02/03/04/07/10 verdes (33 de 33) |
| Catálogo, feedback y storage | tests/catalog, feedback y storage verdes (35 de 35) |

## Inestabilidad conocida de spec-10 «escena automática, pausas, teclado e indicadores»

Pasó en las dos ejecuciones completas de `check`. Dos pasadas verdes no prueban corrección; no se ha diagnosticado su causa (escena 2 vs 3) porque no falló. No se modificó StageCarousel ni la prueba. El spec-10 «intervalo en tiempo real» observó un cambio automático a 7424 ms.

## No realizado / límites

- Sin inspección visual manual ni capturas: solo comprobaciones automáticas (desbordamiento, foco, textos). El contraste de la UI se basó en el uso de `--stage-ink` sobre `--stage-surface` (14,23:1 según docs/design-system.md) y marfil sobre vino (10,98:1) para las insignias; no se midió en el navegador.
- Solo Chromium en Windows con viewport emulado. Sin Linux/macOS, CI remoto, dispositivos físicos ni lector de pantalla.
- Sin autenticación ni limitación de frecuencia; la referencia al portador es el único secreto, y se guarda en claro en `localStorage` del navegador (aviso visible si no se puede guardar).
- 409 y 422 comparten el código `INVALID_INPUT` por decisión documentada (architecture.md); docs/contracts.md ya describe los endpoints reales.
- Se puede reservar un evento ya pasado (el contrato común prohíbe filtrar por reloj).
- La prueba E2E usa un servidor compartido y datos demo; cada prueba devuelve el aforo que toma.

## Correcciones posteriores a la auditoría y al CI del PR #7

CI Linux (pull_request, ejecución 45201517219) falló solo en `tests/e2e/spec-10.spec.ts` «escena automática, pausas, teclado e indicadores» (esperaba «Ir a escena 2», encontró «Ir a escena 3»); las otras 32 E2E pasaron.

| Cambio | Detalle |
|---|---|
| Prueba spec-10 | Corrección ya desarrollada y validada por Davide en `feature/spec-5` (commit `f24a46e`, CI verde en Linux y Windows). Se incorporó solo ese archivo con `git restore --source=origin/feature/spec-5`; el diff son 7 líneas añadidas: esperas del estado visible antes de cada `page.clock.fastForward()`. Sin cambios en StageCarousel, aserciones, timeouts ni omisiones. |
| M1 | `docs/architecture.md`: retiradas las afirmaciones obsoletas de 501 para Reservas. |
| M2 | `reservas.css`: foco visible en vino con halo blanco dentro de los paneles claros (el dorado no contrasta sobre marfil). |
| B1 | `reservas.css`: bordes de inputs/selects de 2 px en `#6B5A62` (≥5:1 sobre blanco y marfil). |
| B2, B3 | Observaciones no bloqueantes de la auditoría, documentadas sin cambio de código. |

| Comando | Resultado |
|---|---|
| `npx playwright test tests/e2e/spec-10.spec.ts -g "escena automática" --repeat-each=15` | 15 de 15 (44,5 s), Node 24.22.3 del bootstrap |
| `.\fiavl.cmd check` | salida 0: lint, tipos, Node 35 de 35, build, Playwright 33 de 33 (51,5 s) |
| Revisión visual de Reservas a 375 y 1440 px | NO VERIFICADO (sin navegador interactivo; solo las comprobaciones automáticas de desbordamiento y foco de spec-06) |
| Contrastes M2/B1 | Calculados a partir de los tokens, no medidos en navegador |
