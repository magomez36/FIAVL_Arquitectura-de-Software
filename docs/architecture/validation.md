# Validación documental y visual

## 1. Resultado

El modelo corresponde al código `ff11546da61896fc7f6d363f63ebb793aed2f3ea`. Esta revisión conserva los 22 casos de uso y los 33 diagramas. Los cambios de los modelos se limitan a presentación, separación de rótulos y distribución de etiquetas.

| Comprobación | Resultado |
|---|---|
| Originales Mermaid | 33 bloques canónicos analizados y renderizados con Mermaid 11.12.2 y Chromium. El tema `neutral` reemplaza las paletas personalizadas. |
| Sincronización | 33 MMD coinciden con sus bloques. Las 33 exportaciones SVG y las 33 PNG se regeneraron desde la misma fuente. `verify.mjs` comprobó inventario y enlaces relativos. |
| Markdown académico | Las 33 imágenes se referencian como archivos PNG locales con el ID correspondiente en el texto alternativo y en el título numerado. |
| PDF sin conexión | Chromium generó el PDF desde el Markdown con red bloqueada. Los 33 PNG se incrustaron como objetos de imagen. PDF.js comprobó dimensiones y coincidencia RGB píxel por píxel con el PNG original. |
| Render efectivo | Se rasterizaron las 37 páginas a 144 ppp. El verificador localizó la región ocupada por cada objeto de imagen, comprobó proporción y márgenes, y comparó el contenido rasterizado global y por franjas con su PNG. También comprobó el orden y la numeración de páginas. |
| Inspección visual | Se revisaron los 33 recortes del PDF agrupados en láminas de cuatro. Las figuras están completas y legibles. Se corrigieron las colisiones iniciales de CU-02 y TEC-01 y los rótulos envueltos en FIS-01 y ESC-01. |
| Formato | Texto negro, papel blanco, figuras en grises y títulos numerados. La maquetación elige A4 primero y usa formatos mayores cuando hace falta preservar el tamaño de los textos. |

El [Markdown académico](academico/FIAVL_Arquitectura_4plus1.md) y el [PDF](academico/FIAVL_Arquitectura_4plus1.pdf) presentan el mismo contenido. Las hojas de contacto cubren todas las páginas. [1–9](academico/validacion/contacto-1.png) · [10–18](academico/validacion/contacto-2.png) · [19–27](academico/validacion/contacto-3.png) · [28–36](academico/validacion/contacto-4.png) · [37](academico/validacion/contacto-5.png).

## 2. Registro de figuras

| Diagrama | Página | Revisión visual |
|---|---:|---|
| LOG-01 | 3 | Completo y legible |
| DES-01 | 4 | Completo y legible |
| DES-02 | 5 | Completo y legible |
| CU-01 | 6 | Completo y legible |
| CU-02 | 7 | Completo y legible |
| CU-03 | 8 | Completo y legible |
| CU-04 | 9 | Completo y legible |
| CU-05 | 10 | Completo y legible |
| CU-06 | 11 | Completo y legible |
| CU-07 | 12 | Completo y legible |
| CU-08 | 13 | Completo y legible |
| CU-09 | 14 | Completo y legible |
| CU-10 | 15 | Completo y legible |
| CU-11 | 16 | Completo y legible |
| CU-12 | 17 | Completo y legible |
| CU-13 | 18 | Completo y legible |
| CU-14 | 19 | Completo y legible |
| CU-15 | 20 | Completo y legible |
| CU-16 | 21 | Completo y legible |
| CU-17 | 22 | Completo y legible |
| CU-18 | 23 | Completo y legible |
| CU-19 | 24 | Completo y legible |
| CU-20 | 25 | Completo y legible |
| CU-21 | 26 | Completo y legible |
| CU-22 | 27 | Completo y legible |
| TEC-01 | 28 | Completo y legible |
| ACTV-01 | 29 | Completo y legible |
| ACTV-02 | 30 | Completo y legible |
| ACTV-03 | 31 | Completo y legible |
| ACTV-04 | 32 | Completo y legible |
| ACTV-05 | 33 | Completo y legible |
| FIS-01 | 34 | Completo y legible |
| ESC-01 | 35 | Completo y legible |

## 3. Reproducción

Con Chromium de Playwright y los módulos Mermaid 11.12.2, `marked` y PDF.js 5.4.624 disponibles en un directorio temporal, ejecuta desde la raíz:

```powershell
$renderDeps = Join-Path $env:TEMP 'fiavl-4plus1-mermaid'
node docs/architecture/tools/render.mjs "$renderDeps/node_modules/mermaid/dist/mermaid.min.js" node_modules/playwright/index.mjs docs/architecture/rendered/png
node docs/architecture/tools/verify.mjs
node docs/architecture/tools/academic-pdf.mjs "$renderDeps/node_modules/marked/lib/marked.esm.js" node_modules/playwright/index.mjs
node docs/architecture/tools/verify-pdf.mjs "$renderDeps/node_modules" "$renderDeps/pdf-qa-monocromo" docs/architecture/academico/validacion
```

`verify-pdf.mjs` deja en la carpeta temporal las páginas rasterizadas, los recortes y el inventario JSON. La inspección visual se realiza sobre esos recortes. El inventario general enlaza cada fuente canónica y sus exportaciones. [Inventario general](analysis/04-inventario-diagramas.md).
