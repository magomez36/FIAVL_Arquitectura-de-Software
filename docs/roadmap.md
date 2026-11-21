# Roadmap de integración

| Orden | Entrega | Dependencia y puerta de entrada |
|---|---|---|
| 1 · P0 | Base, catálogo y portada | Revisión humana de contratos, CI y smoke |
| 2–4 | Agenda, artistas, espacios | Lectura de events, artists y venues |
| 5 | Mi agenda | IDs estables y almacenamiento del navegador |
| 6 | Reservas | Namespace reservations y migración propia |
| 7–9 | Rutas, galería y accesibilidad | Sedes, assets locales y shell común |
| 10 | Opiniones | Namespace feedback y migración propia |

Cada equipo define la aceptación detallada de su spec después de la integración de la base.

Spec 10 reúne la encuesta persistente de /opiniones y la base visual transversal «La ciudad abre el telón». La fase A entrega portada, carrusel y componentes documentados en [el sistema de diseño](design-system.md). La fase B integra valoración y resumen en las tres capas. Ambas se validan en specs/010-encuesta.
