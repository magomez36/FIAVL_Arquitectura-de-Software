# Plan y nota arquitectónica

En la capa React, itinerarios.ts conserva nombre, propósito y secuencia de IDs. La entrada index.tsx consume getResource('venues') con z.array(venueSchema). El orden parte de la selección editorial y la ficha se resuelve por ID. Una referencia ausente ocupa su lugar con un aviso. El selector nativo conserva el foco y reinicia el índice. Dos botones respetan los extremos.

## Constitución e integración

Express recibe la lectura, el servicio común solicita las sedes al repositorio y este consulta SQLite. La presentación reúne ambos conjuntos de datos. Los recursos visuales provienen de Venue.image, documentados en docs/assets.md. Se conservan contratos y propiedad de Spec 1. Probar primero la ruta directa, activar su entrada tras aceptación y verificar la integración del menú.

## Entorno y alcance

Windows, Node 24.22.3 y npm 11.17.0. Código en apps/web/src/features/rutas/, pruebas en tests/e2e/spec-07.spec.ts y evidencias en este directorio.
