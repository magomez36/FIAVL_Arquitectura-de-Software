# Galería · Spec 08

Ruta `/galeria`. Prototipo académico no oficial con datos de demostración. No es la galería del festival.

## Fuente de los requisitos

En la revisión inicial no existía `specs/008-galeria` ni un enunciado del Taller 5 en el checkout. El roadmap solo fija sedes, recursos locales y shell común como dependencias. Los criterios siguientes son el alcance mínimo propuesto por el Prompt 01 de Manuel, no una especificación docente oficial. Si el equipo aporta requisitos originales, deben registrarse aquí con su fuente.

## Historias y aceptación

**US1 · Explorar (P1).** Dado `/galeria` (entrada directa, menú o recarga), veo una colección con imagen local, título, pie descriptivo, categoría y texto alternativo. Las sedes proceden de `GET /api/venues` (`getResource('venues', z.array(venueSchema), signal)`); se añade una selección editorial de recursos locales acreditados. Las sedes comparten una ilustración y se presentan como «Ilustración demo», nunca como fotografía de la sede.

**US2 · Filtrar y consultar (P1).** Puedo elegir Todas, Sedes, Ambientación, Ilustraciones o Archivo documental, con contador «Mostrando N de M imágenes». Una categoría vacía muestra «No hay imágenes en esta categoría.» y «Ver todas las imágenes». «Ampliar» abre una vista con imagen grande, descripción y crédito; puedo cerrar y volver a la cuadrícula. Anterior/Siguiente recorren los resultados filtrados sin ciclo (deshabilitados en los extremos). Orden determinista (categoría, título, id). Sin carrusel automático.

**US3 · Accesibilidad (P1).** h1/h2/h3 coherentes; botones nativos con nombre accesible; foco visible. La ampliación es un `<dialog>` modal (`showModal`) con nombre accesible, descripción, Escape, botón Cerrar visible, foco inicial en Cerrar, Tab/Shift+Tab confinados, y devolución del foco al botón que la abrió (o al encabezado «Colección» si ya no existe). Las imágenes no son controles.

**US4 · Robustez (P1).** Carga, error de red o de contrato con «Reintentar», catálogo de sedes vacío, categoría vacía e imagen rota con alternativa textual local (sin bucle de `onError`). Un fallo de sedes no oculta los recursos locales válidos. `AbortController`; sin `setState` tras abortar.

**US5 · Identidad y procedencia (P2).** Sistema «La ciudad abre el telón» (Stage*, Status, Georgia, tokens). Las fotos de `telon`, `danza` y `musica` son ambientación genérica; `museo-loja.jpg` solo se atribuye al Museo de la Cultura Lojana (Diego Tirira, CC BY-SA 2.0). Sin recursos nuevos, hotlinks ni logos oficiales.

## Requisitos

- R1 Sedes solo de la API validada; sin asociaciones inventadas (US1).
- R2 Catálogo editorial fijo de 8 recursos locales con procedencia (US1, US5).
- R3 Filtro por categoría, contador y estado vacío (US2).
- R4 Vista ampliada modal accesible con navegación acotada (US2, US3).
- R5 Estados carga/error/contrato/vacío/imagen rota con recuperación (US4).
- R6 Diseño responsive sin desbordamiento a 320, 375, 768 y 1440 px; contraste y foco AA; `prefers-reduced-motion` (US3).
- R7 Sin almacenamiento, sin API/migraciones/dependencias nuevas, sin cambios fuera del perímetro (US4, US5).

## Exclusiones

Carrusel automático, cuentas, pagos, reservas, nuevas APIs, preferencias persistentes, descarga de imágenes nuevas, certificación WCAG, eventos/artistas (no duplicar sus fichas).
