# Plan · Spec 08

Cliente-servidor en tres capas lógicas: presentación (React), negocio (`logic.ts`) y acceso a datos (API existente vía `getResource`). Galería es de solo lectura.

## Archivos propios

- `apps/web/src/features/galeria/index.tsx` (UI, estados, diálogo), `logic.ts` (catálogo editorial, orden, filtros, vecinos, validación de rutas locales), `galeria.css` (ámbito `.galeria`).
- `tests/spec-08.test.ts` (Node), `tests/e2e/spec-08.spec.ts` (Playwright), `specs/008-galeria/`.
- `available: true` en la entrada del registro propio.

## Decisiones

1. `<dialog>` nativo con `showModal` y un manejador de Tab propio: Chromium deja salir el foco a la interfaz del navegador al sobrepasar el último control, por lo que el confinamiento se hace explícito.
2. Imagen rota: se sustituye el `<img>` por un bloque de texto con `role="img"`; no queda elemento que dispare `onError` otra vez.
3. Sedes con estado propio (`loading`/`failed`/`ready`): los recursos editoriales siempre se muestran.
4. Navegación Anterior/Siguiente sin ciclo; si el botón enfocado se deshabilita, el foco pasa a Cerrar.
5. Se compensa el reinicio de márgenes de Tailwind (`margin: auto` en el diálogo) y los estilos globales de `header` y `figcaption` usando `div` y reglas locales.
6. Sin cambios en shell, CSS global, contratos, API, fixtures, workflows ni dependencias.

## Pruebas

Node para lógica y procedencia; E2E para flujos, teclado, foco, estados HTTP, imagen rota, movimiento reducido, anchos y regresión.
