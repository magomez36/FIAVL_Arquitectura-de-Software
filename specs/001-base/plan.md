# Implementation Plan: Base de FIAVL Explora

Rama Git `feature/spec-1` · Contexto Spec Kit `001-base` · 2026-11-19

## Summary

Entregar la portada en /, catálogo de lectura y contratos de integración. Primero fijar runtime y datos; después probar la lectura, la portada y la instalación independiente.

## Technical Context

Node 24.22.3 LTS con npm 11.17.0, npm workspaces y versiones directas exactas. React/TypeScript/Vite/Tailwind/React Router/Lucide consumen /api mediante proxy desde 5173 a Express 5 en 3001. Zod valida datos públicos. SQLite embebida en archivo conserva relaciones y migraciones numeradas. Las capas comparten esquemas, nunca una conexión con el navegador. Usar node:test, ESLint, tsc, build Vite y smoke Chromium. Plataformas de aceptación local Windows y CI Windows/Ubuntu.

## Constitution Check

I: cliente HTTP, servicio y repositorio separados. II: lock raíz, fixtures locales y fechas fijas. III: foco, navegación semántica y créditos. IV: rutas y routers independientes con propietarios. V: tests de contrato, persistencia y E2E desde copia limpia. Revisión antes y después del diseño: todos los principios tienen una decisión y una verificación previstas.

## Project Structure

- `apps/api/src/` contiene app, repositorio, migrador, seed y routers independientes. `apps/api/migrations/` conserva SQL numerado.
- `packages/contracts/src/index.ts` define tipos y validadores públicos.
- `apps/web/src/` contiene portada, componentes, cliente HTTP, almacenamiento y features; `public/art/` guarda ilustraciones y logo.
- `tests/` contiene pruebas de contrato y navegador. `.github/workflows/ci.yml` ejecuta las verificaciones de raíz.
- `docs/`, README y AGENTS explican contratos, 4+1, ADR, propiedad e integración.
- En esta carpeta: research, data-model, contracts, quickstart y tareas.

## Integración por capas y por propietario

La composición de arranque conecta el repositorio SQLite con las operaciones de salud, lista y detalle. Express recibe las operaciones y los routers preparados. Las dos entradas de composición de reservas y opiniones permiten incorporar repositorios y servicios por archivo propio. El smoke de navegación contrasta el estado anunciado por cada enlace con su página. Cada dueño conserva la prueba de su namespace HTTP.

## Complexity Tracking

Un proceso API y un archivo SQLite bastan para la edición local. No se requieren servicios externos.

## Ampliación · entorno de desarrollo

fiavl.cmd delega en Windows PowerShell. El manifiesto raíz determina el runtime. La caché portable de usuario y la huella de instalación por checkout tienen ciclos de vida separados. Verificar SHA-256 antes de extraer y publicar descargas completas. Mantener host/proxy locales coordinados; FIAVL_DB es el único ajuste de aplicación. La semilla automática solo inicializa un catálogo vacío. Windows CI prueba el bootstrap y Linux conserva los scripts npm.
