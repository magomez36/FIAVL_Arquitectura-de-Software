# Arquitectura · Spec 09

```
UI /accesibilidad ──getResource('venues', z.array(venueSchema))──▶ API catálogo (GET /api/venues, existente)
       └── preferencias ──readLocal/writeLocal('accessibility')──▶ localStorage fiavl:accessibility:v1
```

Sin nuevas tablas, migraciones ni endpoints. Formato almacenado: `{"version":1,"textSize":"normal|large|xlarge","contrast":"standard|high"}`. Material aprovechable para vistas lógica/desarrollo/escenarios del documento 4+1; `docs/architecture.md` no se edita aquí.
