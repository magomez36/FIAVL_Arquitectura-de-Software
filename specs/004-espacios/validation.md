# Validación de Espacios · 20 de noviembre de 2026

Windows x64, rama feature/spec-4, HEAD ae8b445 más cambios locales. Raíz y origin coincidieron con la solicitud. Árbol limpio antes de empezar. main local es ancestro de HEAD.

| Comprobación | Salida | Evidencia |
|---|---:|---|
| git rev-parse --show-toplevel, git branch --show-current, git status --short, git remote -v | 0 cada uno | Checkout, rama y remoto esperados |
| specify version | 0 | Spec Kit 1.4.3 |
| fiavl.cmd setup | 1 y luego 0 | Primer intento sin acceso a caché del perfil. Con acceso autorizado, Node 24.22.3, npm 11.17.0 y seed preparados |
| resolve-template, check-prerequisites -PathsOnly, setup-plan y setup-tasks | 0 | Directorio 004-espacios y plantillas resueltas. Tras el bloqueo inicial de scripts se usó PowerShell con política limitada al proceso |
| check-prerequisites -RequireSpec -RequireTasks -IncludeTasks | 0 | Diseño y tareas disponibles para análisis y convergencia |
| npm run test:e2e -- tests/e2e/spec-04.spec.ts | 0 | Tres escenarios en Chromium antes de activar available |
| fiavl.cmd check | 0 | Una ejecución. Lint, tipos, 4 pruebas Node, build y 7 E2E correctos |
| git diff --check | 0 | Git avisó de conversión futura LF a CRLF |

## Cobertura y convergencia

- T001. Los tres escenarios se escribieron antes de sustituir el componente pendiente.
- T002 / R1 y R5. Cinco sedes reales, filtro por nombre, dirección y búsqueda sin resultados. Al borrar el filtro vuelven las cinco. Tab alcanza el resumen y Enter abre la ficha. A 375 × 750 no hay desbordamiento horizontal.
- T003 / R2 y R3. Teatro del Sur muestra descripción, dirección y nota de acceso del seed e imagen SVG cargada. Los títulos y tiempos coinciden en cantidad, identidad y orden con sus actividades en la API. Las etiquetas de dirección y condiciones indican su carácter demo. La ilustración procede del catálogo común documentado en docs/assets.md.
- T004 / R4. Con respuestas controladas se comprobó carga, rechazo de una lista inválida, reintento, directorio vacío y sede sin eventos. La aplicación lee datos exclusivamente de la API.
- T005. Tras pasar la aceptación propia se activó la entrada. Las pruebas comunes recorrieron las nueve rutas y el menú. Los cinco requisitos tienen implementación y evidencia. La revisión de convergencia no identificó tareas adicionales.

## Adaptación del flujo y límites

Se conservó la rama humana existente. El puntero local ignorado y SPECIFY_FEATURE_DIRECTORY dirigieron los helpers a specs/004-espacios. La nota arquitectónica está en plan.md. La revisión local abarca Windows y Chromium con viewport móvil emulado. Quedan fuera de esta ejecución los navegadores de dispositivos físicos, otros sistemas y CI remoto. Rollup informó de anotaciones descartadas en Zod. La decisión de integrar corresponde a Manuel.
