# Evidencia de Spec 07

Windows x64, feature/spec-7 sobre 6168e54 (main local, Spec 1 y Spec 4 integradas). Se comprobó la raíz, la rama, el árbol inicialmente limpio y el origin solicitado. Los puertos del proyecto estaban libres.

| Comando o helper | Salida | Resultado |
|---|---:|---|
| specify version | 0 | CLI 1.4.3 |
| fiavl.cmd setup | 0 | Node 24.22.3, npm 11.17.0, dependencias vigentes y seed preparado |
| resolve-template.ps1 spec-template -Json | 0 | Plantilla resuelta para la especificación |
| check-prerequisites.ps1 -Json -PathsOnly | 0 | FEATURE_DIR coincide con specs/007-recorridos |
| setup-plan.ps1 y setup-tasks.ps1 | 0 | Plan y plantilla de tareas resueltos |
| check-prerequisites.ps1 con tareas requeridas | 0 | Artefactos disponibles para análisis, implementación y convergencia |
| npm run test:e2e -- tests/e2e/spec-07.spec.ts dentro de fiavl.cmd shell | 0 | 3 de 3 antes de activar available, 6,9 s |
| fiavl.cmd check | 0 | Una ejecución. Lint, tipos, 4 de 4 Node, build y 10 de 10 Playwright en Chromium |
| git diff --check | 0 | Git anticipa conversión LF a CRLF en la entrada |

## Correspondencia con la aceptación

- T001. Los tres escenarios se escribieron antes de implementar la página.
- R1, R2, R3 y R5 (T002–T003). En el primer escenario la prueba consulta GET /api/venues, busca los cinco IDs esperados y contrasta por posición los nombres, descripciones, direcciones, notas e imágenes de ambas selecciones. Comprueba inicio, fin, reinicio al cambiar, avance con teclado y retroceso. Chromium a 375 × 750 no mostró desbordamiento horizontal. Solo el navegador de prueba recibió una entrada pendiente para Spec 4.
- R4 (T004). Retirar Patio del Río del catálogo conserva la segunda parada; la tercera sigue mostrando Plaza del Viento. Un catálogo vacío recibe un aviso distinto.
- R4 (T005). Respuesta diferida, fallo de red y JSON incompatible activan carga, error y recuperación mediante dos reintentos.
- T006. La aceptación pasó con la entrada aún pendiente. Tras activarla, el check completo incluyó las pruebas comunes de menú y navegación. El análisis y la revisión de convergencia cubren cinco requisitos en tres historias, sin trabajo pendiente.

## Alcance

Los helpers usaron el directorio explícito y el puntero ignorado. Se utilizó la rama existente y se omitieron operaciones Git automáticas. La decisión editorial fue usar únicamente sedes. El catálogo común conserva los datos operativos. Véase la nota arquitectónica en plan.md. Las imágenes son ilustraciones locales del prototipo documentadas en docs/assets.md.

La verificación cubre Chromium en Windows con viewport móvil emulado. No se ejecutaron CI remoto, Linux/macOS ni pruebas en dispositivos físicos. Rollup emitió avisos sobre comentarios de Zod y completó el build.
