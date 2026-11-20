# Integración de FIAVL Explora

Manuel es el responsable humano de Spec 1, prioridad P0. La base se integra primero. Cada integrante parte después de main con Spec 1 revisada, desde un clon o worktree exclusivo y una rama feature/spec-N. Comprueba estado, rama y origin antes de escribir. Lee la constitución, el README y docs/contracts.md.

| Spec | Ruta | Entrada y propiedad |
|---|---|---|
| 1 · Manuel | / | apps/web/src/Home.tsx, shell, componentes y lib, API de lectura, packages/contracts, seed, 001_base.sql, tooling y documentación común |
| 2 · Agenda | /agenda | apps/web/src/features/agenda/index.tsx |
| 3 · Artistas | /artistas | apps/web/src/features/artistas/index.tsx |
| 4 · Espacios | /espacios | apps/web/src/features/espacios/index.tsx |
| 5 · Mi agenda | /mi-agenda | apps/web/src/features/mi-agenda/index.tsx |
| 6 · Reservas | /reservas | apps/web/src/features/reservas/index.tsx, apps/api/src/features/reservations.ts, apps/api/src/composition/reservations.ts y tests/reservations.test.ts |
| 7 · Rutas | /rutas | apps/web/src/features/rutas/index.tsx |
| 8 · Galería | /galeria | apps/web/src/features/galeria/index.tsx |
| 9 · Accesibilidad | /accesibilidad | apps/web/src/features/accesibilidad/index.tsx |
| 10 · Opiniones | /opiniones | apps/web/src/features/opiniones/index.tsx, apps/api/src/features/feedback.ts, apps/api/src/composition/feedback.ts y tests/feedback.test.ts |

Cada dueño reemplaza su página y cambia `available` a `true` cuando pasa su aceptación. El menú y las rutas se construyen desde esos módulos. El smoke común comprueba la navegación de todas las entradas y el aviso de las pendientes. Cada spec mantiene su UI y sus pruebas funcionales en archivos propios. Mi agenda y Reservas pueden leer el catálogo de Spec 1 directamente mediante el cliente HTTP compartido. Coordinar con Manuel antes de modificar archivos comunes, arquitectura o dependencias.

En el backend, cada router HTTP recibe operaciones de aplicación. El servicio valida y decide el resultado. El repositorio encapsula SQLite, las consultas y la conversión de filas. Los Specs 6 y 10 conectan estas piezas desde su archivo de `composition/` usando servicios y repositorios propios por capa. Al implementar su namespace, cada dueño sustituye su prueba de 501 por pruebas del contrato entregado. El montaje común y la prueba del otro propietario ya tienen entradas independientes.

Para persistencia adicional, agregar un archivo con número único de tres dígitos y nombre descriptivo. Reservar 006_reservations.sql para Spec 6 y 010_feedback.sql para Spec 10. Aplicación en orden numérico, registrada en migrations. Conservar las migraciones anteriores.

Usar Spec Kit 1.4.3 y su puntero local ignorado .specify/feature.json o SPECIFY_FEATURE_DIRECTORY. La constitución ya está inicializada. Conservar especificación, plan, tareas y evidencias por spec. Git se gestiona manualmente.

Antes de integrar: revisar cambios contractuales, ejecutar la [guía de contribución](docs/contributing.md), entregar diff y evidencias. El integrante autorizado publica y el responsable humano decide el merge.

## Entorno antes de desarrollar

En Windows ejecutar `.\fiavl.cmd setup` en la raíz; los procesos del agente no heredan el PATH de una invocación finalizada. Usar `.\fiavl.cmd check` para las puertas de calidad, o ejecutar comandos npm dentro de `.\fiavl.cmd shell`. En Linux/macOS seleccionar el runtime del README antes de ejecutar npm. Los scripts de entorno y el workflow pertenecen a Spec 1.

Para SDD, conservar la inicialización y las skills versionadas. Verificar `specify version` (1.4.3), rama propia y `FEATURE_DIR` con el helper check-prerequisites.ps1 -Json -PathsOnly. Usar las instrucciones del README para instalar el CLI cuando falte. El bootstrap de la aplicación funciona independientemente del CLI.
