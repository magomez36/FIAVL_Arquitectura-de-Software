# Validación · Spec 3 (Artistas)

Fecha: 2026-11-22 · Windows 11 · rama `feature/spec-3` · Node 24.22.3 / npm 11.17.0 (runtime de `fiavl.cmd`).

## Comandos
| Comando | Resultado |
|---|---|
| `git rev-parse --show-toplevel` / `git branch --show-current` / `git status --short` / `git remote -v` | Raíz del repo, `feature/spec-3`, árbol limpio al inicio, origin `magomez36/FIAVL_Arquitectura-de-Software` |
| `resolve-template.ps1 spec-template -Json` | OK (plantilla resuelta) |
| `check-prerequisites.ps1 -Json -PathsOnly` con `SPECIFY_FEATURE_DIRECTORY=specs/003-artistas` | OK, `FEATURE_DIR` = `specs/003-artistas` |
| `specify version` | **No ejecutable: CLI no instalado** (instalarlo requiere uv/Python y permiso humano; no se instaló) |
| `.\fiavl.cmd check` (1.ª ejecución) | Código 1. Lint, tipos, 18 tests Node y build pasaron; E2E: 24 ok, 2 fallos **de mis pruebas** (localizadores: el nombre del botón cambia a «Ocultar detalle»; el menú está tras el botón «Menú»). Sin fallo de código de producto |
| `.\fiavl.cmd check` (2.ª, tras corregir las pruebas) | **Código 0**: lint, tipos, 18/18 tests Node, build y 26/26 E2E |

CI remoto (GitHub Actions) **no ejecutado**; no se declara verde.

## Escenarios verificados
| Escenario | Evidencia |
|---|---|
| Ficha con imagen, nombre, país, disciplina y biografía de la API | `spec-03.spec.ts` test 1 |
| Búsqueda por nombre (sin tildes/mayúsculas), país + disciplina combinados, limpieza, sin coincidencias, contador | `spec-03.test.ts`, `spec-03.spec.ts` test 1 |
| Detalle accesible: `aria-expanded`, abrir con teclado (Enter), biografía | `spec-03.spec.ts` test 2 |
| Actuaciones por `artistIds`: «Umbral de luz», 12 de noviembre, 18:00, Teatro del Sur, `datetime` `-05:00` | `spec-03.spec.ts` test 2; unit: orden por inicio/id, sede ausente, 23:30-05:00 sin desplazamiento UTC |
| Artista sin actuaciones → estado vacío | E2E test 2 (respuesta interceptada que le quita los eventos) y unit (`ensamble-cauce`) |
| Carga, error con reintento, catálogo vacío | E2E tests 3 y 4 |
| Sin desbordamiento horizontal a 375 px | E2E test 1 |
| Independencia de Spec 2 | Prueba estática: sin imports de `features/agenda` ni `fetch`/`/api/` directos; no se editó ningún archivo de Spec 2 |
| Menú activo y smoke común | `home.spec.ts` (4/4) y E2E test 5 |

## Limitaciones
- **Revisión visual manual en navegador a 375/1440 px y con movimiento reducido: NO realizada** (sin acceso interactivo a navegador). Solo hay aserciones automáticas (sin desbordamiento a 375 px; foco por teclado). Pendiente para la auditoría humana.
- La prueba de «artista sin actuaciones» usa una respuesta interceptada porque en el seed todos los artistas tienen eventos; el catálogo real no se modificó.
- No se ejecutó una fase roja previa de las pruebas: se escribieron antes de la implementación (T001) pero se corrieron por primera vez con el código ya presente.
- Sin pruebas de contraste automáticas; se reutilizan los tokens y patrones de agenda. Linux/macOS no probados.
- Spec Kit: no se ejecutaron `clarify`, `analyze`, `converge` como invocaciones separadas; el análisis de cobertura se hizo manualmente (FR/SC ↔ pruebas, tabla superior).

## Cobertura FR/SC
FR-001/009 → prueba estática; FR-002/003 → E2E 1 + unit; FR-004 → E2E 2; FR-005 → E2E 3-4; FR-006 → CSS + E2E 1 (parcial, ver limitaciones); FR-007 → E2E 1; FR-008 → diff (solo archivos propios). SC-001..005 → ver tabla de escenarios.

## Corrección posterior a la revisión (PR #6)
- **Contraste del título**: `.artistas-title` usaba `--stage-ivory` (#F5EDE0), igual al fondo de página (`--paper`), y quedaba prácticamente invisible. Ahora usa `--stage-ink` (#302237, ~13:1 sobre ivory). Solo cambió esa propiedad en `apps/web/src/features/artistas/artistas.css`; no se tocaron tokens globales ni Spec 10. Filtros y fichas ya usaban `--stage-ink` sobre `--stage-surface`/blanco.
- **Estado SDD**: spec y plan distinguen ahora el escenario de independencia previsto (agenda pendiente) del estado real (Spec 2 integrado en `main`, `/agenda` activa). No se eliminaron requisitos ni evidencias.
- **Verificación tras la corrección**: `.\fiavl.cmd check` en Windows, código 0 (lint, tipos, pruebas Node, build y 26/26 E2E, incluido `spec-10` «escena automática…»). `git diff --check` sin errores. Siguen sin realizarse capturas ni revisión visual manual a 375/1440 px, ni pruebas en Linux/macOS; el contraste del título se justifica por los valores de los tokens, no por inspección visual.
