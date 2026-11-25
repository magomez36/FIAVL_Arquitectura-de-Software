# Vista de procesos

Cada caso de uso tiene una secuencia canónica. Las peticiones HTTP del navegador son asíncronas. Los servicios y repositorios del backend ejecutan sus operaciones de SQLite de forma síncrona. Los bloques `par` representan interacciones independientes que pueden solaparse, como los efectos de portada, las lecturas iniciadas con `Promise.all` o la llegada de peticiones de dos clientes. Los detalles precargados, la edición de preferencias y el diálogo de galería se resuelven en el navegador. [Inventario técnico](../analysis/01-inventario-arquitectonico.md).

## Secuencias por caso de uso

| Caso | Objetivo | Spec |
|---|---|---|
| [CU-01](secuencias/CU-01-descubrir-edicion.md) | Descubrir la edición demo | 1 |
| [CU-02](secuencias/CU-02-consultar-catalogo-api.md) | Consultar el catálogo mediante la API pública | 1 |
| [CU-03](secuencias/CU-03-explorar-programacion.md) | Explorar la programación cultural | 2 |
| [CU-04](secuencias/CU-04-detalle-evento.md) | Consultar el detalle de un evento | 2 |
| [CU-05](secuencias/CU-05-explorar-artistas.md) | Explorar el catálogo de artistas | 3 |
| [CU-06](secuencias/CU-06-detalle-artista.md) | Consultar la trayectoria y actuaciones de un artista | 3 |
| [CU-07](secuencias/CU-07-buscar-sede.md) | Encontrar una sede en el directorio demo | 4 |
| [CU-08](secuencias/CU-08-detalle-sede.md) | Consultar una sede demo y sus actividades | 4 |
| [CU-09](secuencias/CU-09-armar-agenda.md) | Armar mi agenda personal | 5 |
| [CU-10](secuencias/CU-10-revisar-agenda.md) | Revisar mi programa y sus solapamientos | 5 |
| [CU-11](secuencias/CU-11-consultar-plazas.md) | Consultar plazas disponibles | 6 |
| [CU-12](secuencias/CU-12-reservar-plazas.md) | Reservar plazas demostrativas | 6 |
| [CU-13](secuencias/CU-13-consultar-reservas.md) | Consultar mis reservas por referencia | 6 |
| [CU-14](secuencias/CU-14-cancelar-reserva.md) | Cancelar una reserva mediante referencia | 6 |
| [CU-15](secuencias/CU-15-explorar-recorrido.md) | Explorar un recorrido cultural | 7 |
| [CU-16](secuencias/CU-16-explorar-galeria.md) | Explorar la galería por categorías | 8 |
| [CU-17](secuencias/CU-17-ampliar-galeria.md) | Ampliar y recorrer imágenes de la galería | 8 |
| [CU-18](secuencias/CU-18-consultar-acceso.md) | Consultar condiciones demo de acceso a sedes | 9 |
| [CU-19](secuencias/CU-19-personalizar-lectura.md) | Personalizar la lectura de la guía | 9 |
| [CU-20](secuencias/CU-20-consultar-guia-editorial.md) | Consultar la guía editorial del FIAVL 2026 | 10 |
| [CU-21](secuencias/CU-21-enviar-valoracion.md) | Enviar una valoración sobre la experiencia | 10 |
| [CU-22](secuencias/CU-22-consultar-resumen.md) | Consultar el resumen de valoraciones | 10 |

## Actividades

| ID | Proceso | Casos |
|---|---|---|
| [ACTV-01](actividades/ACTV-01-planificar-agenda.md) | Planificar la agenda y detectar conflictos | CU-09, CU-10 |
| [ACTV-02](actividades/ACTV-02-crear-reserva.md) | Validar y confirmar una reserva | CU-12 |
| [ACTV-03](actividades/ACTV-03-cancelar-reserva.md) | Cancelar una reserva de forma idempotente | CU-14 |
| [ACTV-04](actividades/ACTV-04-ajustar-accesibilidad.md) | Restaurar y ajustar preferencias de lectura | CU-19 |
| [ACTV-05](actividades/ACTV-05-enviar-valoracion.md) | Validar y confirmar una valoración | CU-21 |

La programación se consulta y filtra dentro de la secuencia CU-03. La elección de criterios y su combinación se entienden allí con un ciclo y una alternativa. Las actividades de esta vista se concentran en decisiones que cambian datos, resultan en distintos estados persistentes o admiten recuperación diferenciada.

## Escenario técnico de concurrencia

[TEC-01](secuencias/TEC-01-reservas-concurrentes.md) muestra dos clientes que solicitan el mismo aforo, la adquisición del bloqueo mediante `BEGIN IMMEDIATE`, el recálculo del saldo en cada transacción y las respuestas posibles. Es una ampliación técnica de CU-12.
