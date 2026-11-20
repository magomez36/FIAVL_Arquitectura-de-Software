# Plan y nota arquitectónica

En feature/spec-4, sustituir la página pendiente por un directorio de React. Leer ambos recursos en paralelo mediante getResource y validar cada lista antes de presentar resultados. Cancelar solicitudes al desmontar. Filtrar por nombre y dirección en memoria. Usar details/summary para consultar la ficha con teclado.

## Constitución y propiedad

La presentación consume el catálogo HTTP de Spec 1. Express delega en el servicio de catálogo y su repositorio SQLite. La unión por venueId solo prepara la vista. Reutilizar los contratos, los estilos del shell y las ilustraciones documentadas en docs/assets.md. La integración consiste en activar la entrada propia tras probarla.

## Secuencia

Definir primero los escenarios Playwright. Construir la página en apps/web/src/features/espacios/index.tsx, comprobarla con el seed y respuestas controladas, activar la entrada y ejecutar las puertas comunes.
