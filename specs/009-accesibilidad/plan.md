# Plan · Spec 09

- UI en `apps/web/src/features/accesibilidad/`: `index.tsx` (página), `logic.ts` (esquema, búsqueda, contraste), `accesibilidad.css` (ámbito local).
- Reutiliza `Stage*`, `Status`, `getResource`, `readLocal/writeLocal` y `venueSchema` sin editarlos.
- Decisiones: (1) `readLocal` no distingue «sin datos» de «dañado»; se marca el fallo dentro del parser para mostrar aviso. (2) El bloqueo de lectura es indistinguible de «sin datos»; el aviso aparece al fallar `writeLocal`. (3) Foco: contorno sólido + halo contrastante para valer sobre fondo claro y oscuro; el dorado solo se usa sobre fondo oscuro. (4) CSS propio en lugar de tocar `style.css`.
- Riesgos: estilos globales de `article`/`.status` heredados (se neutralizan dentro de la guía); texto extra grande en 375 px (verificado sin desbordamiento).
