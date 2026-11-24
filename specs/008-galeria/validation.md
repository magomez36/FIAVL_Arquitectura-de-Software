# Validación de Galería · 24 de noviembre de 2026

macOS (Darwin 24.6, arm64), rama feature/spec-8 creada desde main `31fb23a` (PR #9 de Spec 5). Al validar: 0 commits de main sin incorporar. Node 24.22.3, npm 11.17.0 (`node scripts/verify-runtime.mjs` = 0). Puertos 3001/5173 libres antes de E2E. El SHA final y los enlaces de CI son los del informe de entrega.

| Comprobación | Salida | Evidencia |
|---|---:|---|
| `npm run lint` | 0 | Sin hallazgos |
| `npm run typecheck` | 0 | Sin errores |
| `npm test` | 0 | 58 pruebas Node, 58 correctas (11 de `spec-08.test.ts`) |
| `npm run build` | 0 | API y Vite correctos |
| `node --test tests/spec-08.test.ts` | 0 | 11 de 11 |
| `npx playwright test tests/e2e/spec-08.spec.ts` | 0 | 18 de 18 |
| `npm run test:e2e` | 1 | 77 escenarios: 76 correctos, 1 fallo ajeno (ver abajo) |

## Fallo conocido ajeno

`tests/e2e/spec-06.spec.ts:142` (selector Evento tras ArrowDown): `Expected: not ""`, `Received: ""`. Se reprodujo con el mismo error en una copia limpia de `origin/main` (`git archive`, `npm ci`, mismo runtime), por lo que es previo a Spec 8. No se modificó Spec 6. La suite completa NO queda verde en macOS por este único caso.

## Matriz requisito-prueba

| Requisito | Node | E2E |
|---|---|---|
| R1 sedes de la API, ilustración demo | identificadores, «Ilustración demo», «no es una fotografía» | sedes reales con dirección y alt; catálogo cargado |
| R2 editorial y procedencia | autoría, fuente, licencia, museo CC BY-SA 2.0, rutas locales existentes | crédito y enlaces del museo; ambientación sin función documentada |
| R3 filtros/contador | filtros, conteos, orden determinista | categorías, contador, vacío, «Ver todas» |
| R4 diálogo modal | vecinos sin ciclo, selección que desaparece | nombre accesible, `:modal`, Escape, Cerrar, foco inicial y devuelto, Tab/Shift+Tab cíclicos, extremos, clic en fondo |
| R5 estados | sin sedes conserva editorial | HTTP 500 con reintento, contrato inválido con reintento, vacío, imagen rota (1 solicitud), respuesta tardía abortada sin errores |
| R6 diseño | — | 320/375/768/1440 sin desbordamiento, `object-fit: cover`, foco 3 px vino, movimiento reducido |
| R7 perímetro | sin hotlinks, sin almacenamiento, `available: true` | sin claves en localStorage, Espacios/Artistas/Accesibilidad intactos, menú sin «No disponible» |

## Revisión visual y teclado

Capturas de Chromium (fuera del repositorio) a 320, 375, 768 y 1440 px de la cuadrícula, la página completa, el diálogo y el foco, revisadas manualmente. Se detectaron y corrigieron tres defectos: el diálogo quedaba pegado a la esquina por el reinicio de márgenes de Tailwind, el título heredaba el estilo global de `header` y el pie heredaba el color de `figcaption`. A 320 px la cabecera del shell (ajena) se apila sobre el logo; no se tocó.

Contrastes medidos de estilos computados: texto/superficie 14,23:1; marfil/vino (botones, chip activo, insignia) 10,98:1; enlaces de crédito telón/superficie 8,16:1; contador sobre marfil 12,82:1. Foco `3px solid rgb(89, 28, 55)` con halo de superficie. Teclado verificado con Tab, Shift+Tab, Enter, Space y Escape.

## Procedencia de recursos

| Recurso | Categoría | Autoría y fuente | Licencia |
|---|---|---|---|
| `images/telon.webp` | Ambientación | Monica Silvestre, Pexels | Pexels License |
| `images/danza.webp` | Ambientación | Marlon Ribeiro, Pexels | Pexels License |
| `images/musica.webp` | Ambientación | Caio Rosendo, Pexels | Pexels License |
| `images/museo-loja.jpg` | Archivo documental | Diego Tirira, Flickr (2003), solo Museo de la Cultura Lojana | CC BY-SA 2.0 |
| `art/cartel.svg`, `danza.svg`, `musica.svg`, `teatro.svg` | Ilustraciones y sedes | Dibujados para el prototipo (docs/assets.md) | Del proyecto |

No se descargaron ni añadieron recursos. Detalle y enlaces en `docs/assets.md`, sin modificar.

## Límites (NO VERIFICADO)

- Spec Kit: `specify` 1.3.1 instalado (la guía pide 1.4.3) y no hay `pwsh` en macOS; no se ejecutaron helpers ni `check-prerequisites.ps1`. Los cinco documentos se redactaron manualmente.
- Lector de pantalla (VoiceOver/NVDA/JAWS): NO VERIFICADO; solo roles, nombres y foco por Playwright.
- Revisión humana, otros navegadores y dispositivos físicos: NO VERIFICADO.
- Sin certificación WCAG.
- CI remoto: ver informe de entrega.
