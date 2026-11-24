# Guía de accesibilidad · Spec 09

Ruta `/accesibilidad`. Prototipo académico: los datos de sedes son demostrativos y no constituyen certificación.

## Historias y aceptación

**US1 · Consultar condiciones de acceso (P1).** Dado el catálogo demo, cuando abro la guía, entonces veo una tarjeta por sede con nombre, dirección y notas de acceso tal como las entrega `GET /api/venues`, rotuladas como datos demo, junto a la recomendación de confirmar con la sede.

**US2 · Buscar (P1).** Dada la lista, cuando escribo parte del nombre, dirección o notas (sin importar mayúsculas, tildes o espacios sobrantes), entonces veo solo las coincidentes. Si no hay ninguna, veo «Ninguna sede coincide con la búsqueda.»; al borrar recupero todas.

**US3 · Ajustar la lectura (P1).** Cuando elijo tamaño (normal/grande/extra grande) o contraste (estándar/elevado), entonces la guía y sus controles cambian de inmediato, el estado actual se indica y puedo restablecer. El efecto se limita a la guía.

**US4 · Conservar preferencias (P2).** Dado que recargo, entonces se restauran desde `fiavl:accessibility:v1` con aviso. Dados datos corruptos, uso valores predeterminados y aviso. Dado almacenamiento bloqueado, el ajuste se aplica y se advierte que no se guardó.

**US5 · Recuperarme de fallos (P2).** Con carga, error, catálogo vacío: veo estado explícito; el error ofrece Reintentar; las preferencias siguen operativas.

## Requisitos

- R1 Sedes solo de la API validada con `z.array(venueSchema)`, con AbortController. Sin datos ni capacidades inventados.
- R2 Búsqueda con etiqueta, contador anunciable y estado vacío.
- R3 Preferencias con esquema Zod estricto `{version:1,textSize,contrast}` vía `readLocal/writeLocal`.
- R4 CSS con ámbito `.a11y-guide` mediante `data-*`; sin cambios en html/body.
- R5 Foco visible (3 px + halo) en ambos contrastes; pares AA; `prefers-reduced-motion` sin animaciones.
- R6 Teclado, encabezados, labels y regiones `status`/`alert`. 375 y 1440 px sin desbordamiento.

## Exclusiones

Cuentas, pagos, nuevas APIs/tablas, filtros por capacidades deducidas, cambios globales del sitio, certificación WCAG, sustituir lectores de pantalla.
