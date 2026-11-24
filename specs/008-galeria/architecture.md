# Arquitectura · Spec 08

```
UI /galeria ──getResource('venues', z.array(venueSchema), signal)──▶ API catálogo (GET /api/venues, existente)
   └── logic.ts: editorialItems (8 recursos locales) + sedes ──▶ buildItems ──▶ filterItems ──▶ neighbour
```

- Presentación: `index.tsx` (Page, Picture, Lightbox, CreditLine) y `galeria.css`.
- Negocio: `logic.ts`, puro y sin React; ordena por categoría, título (`es`) e id; ids estables (`sede-<id>`, `ambientacion-*`, `ilustracion-*`, `archivo-*`).
- Datos: solo la API de lectura existente; el navegador no accede a SQLite. Sin tablas, migraciones ni endpoints.
- Sin `localStorage` ni claves de otros módulos.

## Estados

`VenueState` = loading | failed(message) | ready(venues). Error de red/HTTP y `ZodError` producen mensajes distintos; ambos ofrecen `Reintentar` (`Status` con `role="alert"`). Una respuesta abortada no modifica estado.

## Procedencia

Ver tabla en `validation.md`. Todos los recursos son locales; `isLocalSrc` rechaza esquemas, hosts, `..` y barras invertidas.
