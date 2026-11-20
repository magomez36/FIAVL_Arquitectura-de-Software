# Contrato de diseño

GET /api/health devuelve {status:"ok"} tras leer SQLite. GET /api/events, /api/artists y /api/venues devuelven arrays; añadir /:id devuelve una ficha. Eventos ordenados por startAt,id; artistas y sedes por id. Ver [modelo](../data-model.md). Error uniforme {error:{code,message}}: 400 INVALID_ID, 404 NOT_FOUND, 501 NOT_IMPLEMENTED, 500 INTERNAL_ERROR. Las dos familias reservadas /api/reservations y /api/feedback devuelven 501. La referencia de integración con ejemplos y fixtures vive en [docs/contracts.md](../../../docs/contracts.md).
