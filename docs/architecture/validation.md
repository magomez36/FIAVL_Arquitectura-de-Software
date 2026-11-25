# Validación documental y de renderizado

**Referencia del código** `ff11546da61896fc7f6d363f63ebb793aed2f3ea`. La verificación es una autovalidación de documentos, diagramas y exportaciones. La referencia para comportamiento en ejecución es el código versionado, junto con las pruebas localizadas y las evidencias históricas de cada spec.

| Comprobación | Procedimiento | Resultado |
|---|---|---|
| Base integrada | `git status`, remoto, `git fetch origin --prune`, comparación de refs y `git log --first-parent origin/main`. Revisión de los módulos registrados en `features/index.ts`. | Diez merges y nueve rutas activas más la portada. La rama documental se creó desde `main` limpio y sincronizado. |
| Corrección arquitectónica | Contraste dirigido de contratos, migraciones, repositorios, servicios, composición, UI, configuración, scripts y pruebas. | Cinco vistas, siete tipos de diagrama, roles reales, multiplicidades, persistencias y topología local. La matriz cubre las diez specs. |
| Escenarios y secuencias | Revisión de los objetivos y comprobación reproducible de correspondencia por ID. | 22 casos ordinarios con una secuencia cada uno. TEC-01 amplía CU-12 y modela concurrencia y serialización. |
| Sintaxis y recursos | Mermaid JS 11.12.2, renderizado en Chromium mediante Playwright. Cada bloque canónico se analizó y exportó a SVG y PNG a escala 2. | 33 diagramas analizados y 33 exportaciones por formato. Los archivos `.mmd` se extrajeron de los bloques Markdown. |
| Legibilidad | Lectura de archivos y comprobación visual dirigida del material renderizado. Se redujo el ancho de componentes y paquetes, y se corrigió un bloque `opt` sin cierre detectado por Mermaid en CU-11. | Los SVG permiten ampliar las figuras extensas. La copia Markdown mantiene bloques Mermaid con sintaxis estándar para GitHub. |
| Enlaces y trazabilidad | `node docs/architecture/tools/verify.mjs`, comprobación de archivos y anclas locales, distribución, duplicados, sincronización de MMD y correspondencia académica. | 33 figuras, 22 casos, 10 specs y 42 archivos Markdown verificados. |
| Borrador académico | Chromium imprimió el Markdown con los 33 SVG. PDF.js rasterizó las páginas y verificó encabezados y márgenes. Se revisaron las hojas de contacto y las figuras de mayor densidad. | 38 páginas y 33 figuras. Se fijaron tamaños A3 y A2 para las figuras que requieren más espacio y se corrigió el salto que dividía las más altas. |
| Herramientas documentales | ESLint aplicado al directorio documental de scripts. | Salida 0. |
| Perímetro | `git diff --check` y revisión del listado de rutas del diff contra `origin/main`. | La entrega se concentra en `docs/architecture.md` y `docs/architecture/`. |

## Reproducción

Desde la raíz de un checkout con las dependencias de trabajo y Chromium de Playwright disponibles, prepara Mermaid fuera del repositorio. El paquete usado para transformar el Markdown académico es `marked`, instalado en ese mismo entorno temporal. Los scripts documentales reciben rutas de módulos explícitas.

```powershell
$renderDeps = Join-Path $env:TEMP 'fiavl-4plus1-mermaid'
npm.cmd install --prefix $renderDeps --no-audit --no-fund --ignore-scripts mermaid@11.12.2
node docs/architecture/tools/render.mjs "$renderDeps/node_modules/mermaid/dist/mermaid.min.js" node_modules/playwright/index.mjs docs/architecture/rendered/png
node docs/architecture/tools/verify.mjs
node docs/architecture/tools/academic-pdf.mjs "$renderDeps/node_modules/marked/lib/marked.esm.js" node_modules/playwright/index.mjs
npm.cmd install --prefix $renderDeps --no-audit --no-fund --ignore-scripts pdfjs-dist@5.4.624
node docs/architecture/tools/verify-pdf.mjs "$renderDeps/node_modules" "$renderDeps/pdf-qa"
```

Los bloques con marcador `<!-- diagram: ID -->` son la fuente canónica. `render.mjs` escribe las copias en `diagrams/`, `rendered/svg/` y la carpeta PNG indicada. `verify.mjs` valida la sincronización de los originales y la cobertura de los recursos. Las exportaciones pueden variar levemente según Chromium y las fuentes del anfitrión. El visor GitHub aplica sus propios estilos. [Inventario con rutas](analysis/04-inventario-diagramas.md), [documento académico](academico/FIAVL_Arquitectura_4plus1.md).

## Alcance

Las pruebas de aplicación citadas se identificaron en el repositorio. Su ejecución local completa pertenece a la validación del software y los resultados de CI se registran en el Pull Request. Las comprobaciones de esta fase se centran en coherencia del modelo, sintaxis, referencias y legibilidad. Las diferencias entre especificaciones, evidencias históricas y comportamiento actual quedan en [hallazgos](analysis/05-hallazgos-y-limitaciones.md).
