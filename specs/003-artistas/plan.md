# Implementation Plan: Catálogo de artistas

**Spec**: [spec.md](spec.md) · **Rama**: `feature/spec-3`

## Resumen técnico
Página React de solo lectura en `apps/web/src/features/artistas/`. Tres lecturas paralelas al API existente mediante `getResource`, validadas con los esquemas Zod de `@fiavl/contracts`. La lógica pura (filtrado, opciones, actuaciones, fecha de Loja) vive en `logic.ts` para probarla sin navegador. Sin cambios de backend.

## Technical Context
React 19 + TypeScript + Vite, React Router; Node 24.22.3 / npm 11.17.0; pruebas `node --test` y Playwright. Almacenamiento: ninguno nuevo (SQLite de solo lectura vía API). Rendimiento: 6 artistas demo; filtrado en memoria con `useMemo`.

## Constitution Check
| Principio | Cumplimiento |
|---|---|
| I Tres capas | UI → HTTP (`getResource`) → API existente; sin SQL en la UI |
| II Demo reproducible | Datos del seed; sin secretos |
| III Acceso y procedencia | Teclado, foco visible, estados, aviso no oficial, imágenes locales documentadas en `docs/assets.md` |
| IV Propiedad por spec | Solo `features/artistas/`, `specs/003-artistas/`, `tests/spec-03.test.ts`, `tests/e2e/spec-03.spec.ts` |
| V Evidencia | Ver `validation.md` |

## Estructura
```
apps/web/src/features/artistas/
  index.tsx     # Feature {path,label,available,Page}: carga, estados, UI
  logic.ts      # filtrado, opciones, actuaciones, formato de fecha (puro)
  artistas.css  # estilos acotados a .artistas con tokens --stage-*
tests/spec-03.test.ts        # lógica y límites de integración
tests/e2e/spec-03.spec.ts    # flujo en navegador
specs/003-artistas/          # SDD, validation.md, architecture.md
```

## Decisiones
1. **Detalle en línea** (botón `aria-expanded` + región), igual que el patrón de agenda pero sin importarlo: evita rutas nuevas (archivos comunes) y funciona con teclado.
2. **Un solo estado de carga** para las tres lecturas (`Promise.all`); un fallo muestra error con reintento, sin datos parciales.
3. **Búsqueda normalizada** (NFD sin marcas, minúsculas) para tolerar tildes.
4. **Fecha con `Intl` y `timeZone: 'America/Guayaquil'`**: día civil de Loja garantizado.
5. **Sin dependencia de Spec 2**: ninguna importación de `features/agenda`.

## Riesgos
`home.spec.ts` y el menú derivan de `available`; al activarlo, el enlace deja de marcarse pendiente (comportamiento esperado, el smoke común lo comprueba dinámicamente).
