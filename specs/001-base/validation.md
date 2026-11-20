# Evidencia de aceptación · Spec 1

Verificación local del 19 de noviembre de 2026. Rama de desarrollo `feature/spec-1`, base `b08b919da4472c7a2bcedf4c76e35ef233b15c01`. Herramientas comprobadas: Specify CLI 1.4.3, Node 24.22.3, npm 11.17.0 y Playwright 1.65.1 con Chromium (revisión 1255).

## Instalación y ejecución independientes

Se exportó el commit inicial con `git archive` y se aplicó el diff mediante `git apply --check` y `git apply` en rutas con espacios. Windows 11 x64 y Ubuntu 24.04 x64 (contenedor oficial `mcr.microsoft.com/playwright:v1.65.1-noble`) recibieron únicamente los archivos de la entrega. Cada copia creó sus propios node_modules y base de datos. El lockfile contiene los mismos datos JSON en ambas plataformas. El puntero local de Spec Kit, los directorios de build y las bases SQLite quedan fuera del diff.

| Comando sobre el lockfile final | Windows | Linux |
|---|---|---|
| npm ci --no-audit --no-fund | 297 paquetes, salida 0 | 296 paquetes, salida 0 |
| npm run lint | Pasó | Pasó |
| npm run typecheck | Pasó | Pasó |
| npm test | 2/2 | 2/2 |
| npm run build | API y web compiladas, Vite 7.3.8 | API y web compiladas, Vite 7.3.8 |
| npm run db:seed | Salida 0 | Salida 0 en dos ejecuciones consecutivas |
| npm run test:e2e | 3/3, 16,3 s | 3/3, 9,5 s |

La diferencia de paquetes corresponde a binarios de plataforma. En Windows se comprobó la instalación con `npx playwright install chromium`; Linux usó la imagen con las bibliotecas de Chromium y ejecutó el mismo comando. En un Ubuntu nuevo, usar `npx playwright install --with-deps chromium`, como indica el workflow.

## Evidencia por tarea

| Tarea | Comprobación |
|---|---|
| T001 | Instalación independiente de los tres workspaces en dos sistemas; Node/npm exactos y lock íntegro. |
| T002–T006 | La prueba de catálogo crea SQLite en disco, siembra dos veces, compara filas y uniones, cierra y reabre. HTTP devuelve salud 200, listas de 12/6/5 y las mismas 23 fichas por ID. Una modificación SQL posterior se refleja en el detalle HTTP. Se comprueban integridad referencial, cupo bajo, solapamiento, tipos, 400, 404 y ambos 501. |
| T007, T010 | Chromium consume el proxy real; comprueba selección por teclado, tres tarjetas, imágenes cargadas y edición visible con reloj en 2031. Verifica nueve rutas, menú móvil, Escape, retorno al inicio y ausencia de desplazamiento horizontal. El escenario de recuperación controla la respuesta de red para reproducir espera, error y vacío de forma determinista. |
| T008 | Logo y cuatro ilustraciones locales inventariados en docs/assets.md. Inspección visual de la portada en 1366 × 880 y 375 × 812. |
| T009 | Prueba de claves independientes y recuperación ante JSON corrupto. El cliente HTTP valida respuestas con los contratos de dominio. |
| T011 | POST a reservations y feedback devuelve HTTP 501 y NOT_IMPLEMENTED desde dos routers independientes. |
| T012–T013 | Propiedad de diez rutas en AGENTS.md. Contrato con ejemplos contra fixtures reales, guía, cuatro vistas y un escenario, ADR y roadmap en docs/. |
| T014 | actionlint 1.7.12 validó .github/workflows/ci.yml con salida 0. Se ejecutaron las puertas locales de la matriz Windows/Linux. |
| T015 | Copias limpias, instalación del lockfile final y prueba adicional de npm run dev en Windows. |

En Windows, `npm run dev` arrancó Express en 3001 y Vite en 5173. A través de Vite se leyeron salud y las tres colecciones, se abrió Reservas desde el menú y se regresó a la portada sin errores JavaScript. Una prueba adicional con SQLite recién migrada devolvió tres listas vacías con 200; cerrar la conexión produjo 500 INTERNAL_ERROR en salud.

## Alcance de la validación

El primer inventario de dependencias produjo avisos de npm. Se fijaron versiones compatibles corregidas de concurrently, typescript-eslint, react-router-dom, Vite y Zod. `npm audit --audit-level=high` sobre el lockfile final informó **0 vulnerabilidades**. npm advierte sobre el fin de soporte de ESLint 9.39.1 y el postinstall opcional de esbuild; Rollup informa de comentarios de optimización de Zod. El build y las pruebas pasan en ambas plataformas.

El runner alojado de GitHub Actions queda pendiente de la publicación humana de la rama. La revisión de accesibilidad cubre teclado, foco, semántica, estados y ancho móvil; la sesión no incluyó lector de pantalla ni dispositivos físicos. La aceptación y el merge corresponden a Manuel.

## Reproducir

Con los puertos 3001 y 5173 libres, seguir [el quickstart](quickstart.md). La guía de [instalación y build](../../README.md) incluye la configuración de Chromium para un equipo nuevo.

## Ampliación de incorporación · FR-007 a FR-009 / SC-004

Cambios desarrollados en el repositorio de Manuel sobre feature/spec-1. Las copias temporales sirvieron solo para QA. Node 24.22.3 y npm 11.17.0 se leyeron del manifiesto. La primera preparación con Node 26.5.0 descargó el ZIP de nodejs.org, cotejó SHA-256, instaló npm bajo el prefijo privado e instaló 297 paquetes en Windows. El proceso padre siguió resolviendo su Node original al salir.

| Escenario | Resultado observado |
|---|---|
| A · Node incompatible | setup seleccionó el portable exacto y terminó con código 0. |
| B y D · Sin Node y primer checkout | where.exe no encontró node.exe. Desde una copia con espacios y perfil vacío, setup descargó y preparó los ejecutables y sembró 12 eventos. |
| C · Pareja correcta | Una sesión con ambos ejecutables en PATH y otra caché vacía reutilizó la pareja. shell ejecutó node y npm y devolvió las dos versiones esperadas. |
| E y J · Segunda ejecución y portable | Con PATH sin Node, el segundo setup encontró el portable de su perfil, anunció dependencias vigentes y conservó el mtime del sello. |
| F · Lock modificado | Añadir un salto de línea al lockfile de prueba disparó una instalación y renovó el sello. |
| G · .env | Se abrió la base definida por una ruta con espacios. El .env preexistente conservó sus bytes. |
| H · Puerto ocupado | Un listener de prueba retuvo 3001. El inicio terminó con código de fallo, informó el puerto y dejó activo el listener. |
| I · Sin red | Un proxy local inaccesible aplicado a la petición real de descarga produjo fallo y diagnóstico FIAVL antes de crear node_modules. El siguiente intento con conexión funcionó. |
| K · Persistencia | Una nueva preparación conservó un título modificado, un evento eliminado deliberadamente y una tabla ajena con su fila. El proxy devolvió el título propio desde SQLite. |

Reproducción de B–K: `node tests/bootstrap/windows.mjs` desde el checkout Windows, con Git y Node disponibles para lanzar el ensayo. El proceso hijo de bootstrap recibe un PATH independiente. En el caso A se ejecutó directamente `.\fiavl.cmd setup` en el equipo de Manuel. Los cuatro modos se ejecutaron realmente; el inicio sirvió HTML y /api/health desde 5173. El modo check preparó Chromium con el CLI fijado en el lockfile.

| Puerta | Windows x64 | Linux x64 |
|---|---|---|
| npm ci y npm run db:seed | Correctos, incluida la variante --if-empty | Correctos con --if-empty |
| npm run lint y npm run typecheck | Salida 0 | Salida 0 |
| npm test | 2/2 | 2/2 |
| npm run build | API y web compiladas | API y web compiladas |
| npm run test:e2e | 3/3 Chromium | 3/3 Chromium |

En Linux se ejecutó el flujo POSIX de prefijo privado de npm en una copia limpia, dentro del laboratorio Ubuntu de la base. El contenedor se usó exclusivamente para verificar Linux. La aplicación y el workflow arrancan directamente sobre el sistema. También se confirmó Specify CLI 1.4.3 y, desde una copia de los artefactos SDD, la resolución del directorio y de spec-template sin reinicialización.

**NO VERIFICADOS:** macOS, Windows ARM64 y la ejecución alojada de este cambio en GitHub Actions. También se ejecutó check con PLAYWRIGHT_BROWSERS_PATH apuntando a una carpeta nueva. Descargó Chromium v1255 y sus auxiliares desde el CDN y pasaron los tres E2E. actionlint 1.7.12 validó el workflow con salida 0.

**Advertencias revisadas:** ESLint 9.39.1 está fuera de soporte; queda pendiente planificar su actualización mayor tras la auditoría. npm avisa sobre el postinstall de esbuild 0.28.2; se conserva la política del lock y la configuración existente sin añadir autorizaciones de scripts. Rollup descarta dos anotaciones de comentarios de Zod. Ninguno de estos avisos impidió compilar ni ejecutar las pruebas en las dos plataformas.

**Convergencia final.** El helper 1.4.3 resolvió specs/001-base con spec, plan, modelo, contratos, quickstart y tareas. La revisión contrastó nueve requisitos, cuatro criterios de éxito, cinco principios y 19 tareas con los archivos y las ejecuciones anteriores. Resultado: cero tareas nuevas. Las entradas de las nueve secciones y los dos routers reservados coinciden con la base entregada.

## Cierre de los cuatro hallazgos de auditoría

En el checkout Windows x64 de `feature/spec-1`, una ejecución de `.\fiavl.cmd check` seleccionó Node 24.22.3 y npm 11.17.0, reutilizó las dependencias, ejecutó `db:seed --if-empty` y terminó con código **0**.

| Comprobación de cierre | Resultado observado |
|---|---|
| `npm run lint` y `npm run typecheck` | Ambas pasaron. |
| `npm test` | 4/4. Catálogo en disco, claves de navegador y un contrato HTTP por propietario de los dos namespaces. |
| `npm run build` | TypeScript compiló la API y Vite 7.3.8 produjo el cliente. Rollup informó dos anotaciones de comentarios de Zod. |
| `npm run test:e2e` | 4/4 en Chromium, 14,9 s. Portada y proxy real, menú móvil y recarga directa de nueve rutas, disponibilidad mixta y recuperación del catálogo. |

**T020 · FR-001/002 y SC-001.** La prueba de catálogo recuperó las 23 fichas, conservó filas y relaciones después de dos semillas y de reabrir el archivo, y leyó por HTTP un título modificado en SQLite. Pasaron los casos de ID inválido y ficha ausente. Una comprobación adicional contra la API compilada y una base en memoria recién migrada obtuvo tres listas vacías con 200, salud con 200 y, tras cerrar la conexión, salud con 500 e `INTERNAL_ERROR`. La búsqueda de `DatabaseSync`, `node:sqlite`, `db`, `.prepare(` y `SELECT` en `apps/api/src/app.ts`, `features/` y el servicio `catalog.ts` devolvió cero coincidencias.

**T021 · FR-004/005 y SC-002.** El smoke recorrió las nueve entradas reales. En un contexto de navegador aislado, Playwright sustituyó únicamente los módulos de Mi agenda y Reservas por dos páginas de prueba con `available: true`. El mismo recorrido comprobó el contenido de ambas con Programación pendiente. Las únicas aserciones HTTP de 501 en `tests/` están en `reservations.test.ts` y `feedback.test.ts`, cada una contra el router real de su dueño.

Una comprobación puntual sobre la API compilada montó un router de prueba que devolvía 204, primero en reservas y después en opiniones. En las dos composiciones, el otro router real devolvió 501 y el catálogo conservó los 12 eventos. La prueba utilizó SQLite en memoria.

**T022 · FR-006.** La vista lógica y la física, el ADR 005 y el mapa de propiedad describen la composición implementada y el motor SQLite embebido. La nota editorial cubre los nueve requisitos, once escenarios numerados y cuatro criterios de éxito. El checklist conserva sus 16 ítems verificados. Las pruebas A–K y las ejecuciones de otros sistemas corresponden a la evidencia previa. La ejecución alojada en GitHub Actions queda pendiente.

**Convergencia de cierre.** `specify version` confirmó 1.4.3. El helper `check-prerequisites.ps1 -Json -RequireSpec -RequireTasks -IncludeTasks` resolvió `specs/001-base`. La revisión de `speckit-converge` contrastó los nueve requisitos, cuatro criterios de éxito, once escenarios numerados, cinco principios y 22 tareas con los archivos y las evidencias vigentes. Resultado `converged`, cero tareas abiertas y cero tareas añadidas por convergencia.
