# Validación de Spec 10

## Fase A

En Windows, la ejecución focalizada de Playwright para los tres escenarios «escena» pasó 3/3 (8,6 s, salida 0). Las capturas completas de 375 y 1440 px se abrieron para inspección: fotografía local de telón visible, título marfil y oro, controles legibles, carteles con sus imágenes y enlaces editoriales. Las pruebas cargaron las tres fotografías, comprobaron destinos, desbordamiento, rotación, controles y pausas. Esta revisión precedió a la implementación de la encuesta.

## Resultado final

Rama feature/spec-10 sobre 2ae0899 (main local con Spec 7 integrada), árbol limpio al comenzar y un solo worktree. Se conservaron la rama humana y el directorio explícito. Spec Kit resolvió sus plantillas con resolve-template, setup-plan y setup-tasks; el helper de prerrequisitos confirmó specs/010-encuesta en especificación, análisis y convergencia. El análisis previo asignó todos los criterios a tareas y escenarios. El puntero local está ignorado.

| Criterio | Tarea | Evidencia observada |
|---|---|---|
| V1 | T001–T003 | Titular, fotografía, logo y prototipo no oficial visibles en las dos capturas. |
| V2 | T002–T003 | Tres WebP locales, autores, fuentes y licencia en docs/assets.md. Pruebas de avance a los 7 s, anterior, siguiente, indicadores, pausa manual, foco, hover, visibilidad y preferencia de movimiento. |
| V3 | T003–T004 | El navegador comprobó la animación del foco y la transformación del cartel. Ambos efectos se desactivaron con movimiento reducido. |
| V4 | T003–T004 | Guía compartida y reglas de colaboración entregadas. Smoke de menú y rutas, Espacios y Recorridos pasaron. |
| V5 | T001–T004 | Portada completa a 375 y 1440 px sin desbordamiento. Revisión visual, foco, teclado y gesto horizontal. Ratios de texto sólido en la guía. WebP locales 177 594 bytes en total. |
| E1 | T005–T007 | Formulario móvil recupera un envío fallido, confirma y muestra el nuevo total tras recarga. HTTP rechaza tipos, rango, JSON malformado, campos extra, longitud excesiva y cuerpos grandes. |
| E2 | T005–T007 | Tres votos (1,5,5) producen total 3, frecuencias [1,0,0,0,2] y promedio 3,7. Vacío con media null. Se comprobó el JSON completo y el comentario privado guardado en SQLite. |
| E3 | T005–T006 | Migración desde DB con 001 y reapertura; una sola entrada 010. DB limpia en prueba de rechazo. Router con operaciones inyectadas, servicio y repositorio. |
| S1 | T001–T008 | Tres historias de interacción/participación más la consulta agregada se corresponden con especificación, plan, tareas y escenarios. Convergencia sin tareas nuevas. |
| Q1 | T008 | Puertas completas y E2E anteriores conservados. |

| Comando | Salida | Resultado |
|---|---:|---|
| specify version | 0 | CLI 1.4.3 |
| fiavl.cmd setup | 0 | Node 24.22.3 y npm 11.17.0 |
| Helpers de Spec Kit | 0 | Directorio, plantillas y prerrequisitos resueltos |
| npm run test:e2e -- tests/e2e/spec-10.spec.ts -g escena | 0 | 3/3 en fase A |
| fiavl.cmd check, primera ejecución | 0 | Lint, tipos, 5/5 Node, build y 14/14 E2E |
| fiavl.cmd check, versión final con gesto y prueba de efectos | 0 | Lint, tipos, 5/5 Node, build y 15/15 E2E (24 s) |
| git diff --check | 0 | Revisión final tras retirar una línea vacía al final del CSS |

## Archivos y límites

Las superficies compartidas editadas son AGENTS.md, docs/roadmap.md, docs/design-system.md, docs/assets.md, el namespace feedback de docs/contracts.md y la ampliación de packages/contracts/src/index.ts. Frontend en Home.tsx, main.tsx, style.css, components/Stage.tsx, components/StageCarousel.tsx, features/opiniones/index.tsx y public/images/{telon,danza,musica}.webp. Backend en features/feedback.ts, composition/feedback.ts, services/feedback.ts, repositories/feedback.ts y migrations/010_feedback.sql. Pruebas en tests/feedback.test.ts y tests/e2e/spec-10.spec.ts. Los ocho artefactos SDD se conservan aquí.

Las capturas quedan como salida local ignorada de Playwright. Chromium emuló el tamaño móvil y el gesto táctil. Pendientes de auditoría externa: lectores de pantalla y dispositivos físicos, otros navegadores, Linux/macOS y CI remoto. Rollup informó sobre comentarios de Zod y terminó el build. El resumen cuenta respuestas; el formulario admite más de una participación por persona. La prueba comprueba migración y persistencia con bases temporales. Los cambios de shell y de contratos requieren coordinación al integrar las ramas de los demás specs.

## Iteración cultural · verificación del 21 de noviembre de 2026

Se preservó el trabajo auditado en feature/spec-10 (base 2ae0899). El helper resolvió specs/010-encuesta. Se actualizaron especificación, plan, modelo editorial, investigación, checklist y tareas sin sustituir los documentos originales.

| Criterio | Resultado | Evidencia |
|---|---|---|
| C1/T009–010 | PASS | Cuatro obras, seis funciones, artistas y recintos contrastados con fichas individuales. El navegador comprueba títulos, fechas, horas, sedes, artistas y URL. Tabla de fuentes en research.md. |
| C2/T009–010 | PASS | Cinco sedes en Espacios, con enlaces. El museo lleva fotografía de archivo de Diego Tirira, crédito, año y CC BY-SA 2.0. La prueba simula fallo de descarga y conserva texto y enlace de procedencia. |
| C3/T010 | PASS | Guía editorial, directorio demo, cartelera del prototipo y ambientación identificados. El catálogo HTTP, fixtures, IDs y migraciones anteriores conservan sus contratos. |
| C4/T011 | PASS | Con movimiento normal, foco y cursor fuera y pestaña visible, el cambio se observó en 6972 ms (6982 ms en la ejecución previa). El punto de medida es posterior al montaje. Con movimiento reducido transcurrieron 7200 ms sin cambio. El caso con reloj controlado verifica pausa/reanudación, hover, foco y visibilidad. |
| C5/T012 | PASS | Cabecera con el aviso literal y ficha de marca en docs/assets.md. Navegación, interior móvil y escritorio, lectura de sedes y selección de parada, radio y envío recuperable. Se generaron ocho capturas completas; la revisión visual motivó compactar las cinco estrellas en una fila móvil y volver al inicio antes de capturar Recorridos. |

**Diagnóstico.** El carrusel original ya tenía autoavance. Las capturas anteriores se tomaban con movimiento reducido. En uso normal, entrar con el puntero o enfocar un control suspende el temporizador y «Reanudar» solo quita la pausa manual. Al salir del carrusel comienza otro intervalo. La etiqueta de estado y la barra de siete segundos hacen visible ese comportamiento. Las preferencias del SO se conservaron.

**Windows.** Setup 0; primer check 0 con 5 Node y 19 Playwright; check final 0 con lint, tipos, build, 5/5 Node y 19/19 Playwright (43,3 s). Chromium genera portada, espacios, rutas y opiniones a 375 y 1440 px en test-results/. Git diff --check 0. Rollup avisó sobre anotaciones de Zod y completó el build.

**Archivos de la iteración.** Home.tsx, main.tsx, style.css, StageCarousel.tsx, FestivalGuide.tsx, lib/festival2026.ts, las entradas espacios/rutas/opiniones, public/images/museo-loja.jpg, tests/e2e/spec-10.spec.ts, docs/assets.md, docs/design-system.md y los documentos SDD de esta carpeta. La consulta del festival es una selección editorial fechada. No se confirmó autorización para marcas institucionales ni fotos de las cuatro obras. Las demás sedes enlazan a fuentes primarias. CI remoto, dispositivos físicos, lectores de pantalla y otros motores de navegador quedaron fuera de la ejecución local.
