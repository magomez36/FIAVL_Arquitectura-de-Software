# Registro de decisiones

| ADR y estado | Contexto y decisión | Consecuencia |
|---|---|---|
| 001 · Adoptada | La demo debe arrancar desde un clon limpio. Usamos un repositorio npm workspaces, Node/npm exactos y lock único | Una instalación prepara web, API, contratos y herramientas |
| 002 · Adoptada | El catálogo necesita relaciones y persistencia local. Elegimos node:sqlite, migraciones por archivo y transacciones | No requiere servidor de base de datos. Las consultas síncronas se limitan al catálogo demo |
| 003 · Adoptada | Los integrantes trabajan en paralelo. Cada página exporta metadatos y los servicios 6 y 10 tienen routers propios | Una página se activa desde su módulo. El contrato compartido se revisa con Manuel |
| 004 · Adoptada | La edición debe seguir siendo demostrable cualquier día. Conservamos ISO con offset -05:00 y orden cronológico estable | Los consumidores muestran America/Guayaquil y no descartan eventos por fecha actual |
| 005 · Adoptada | Se adopta Layered Architecture en un modelo cliente-servidor. Presentación, negocio y persistencia son tres capas lógicas. El catálogo comparte operaciones y persistencia entre recursos, por lo que la unidad de organización es la responsabilidad técnica. | El arranque inyecta el repositorio en el servicio y entrega operaciones a Express. SQLite se ejecuta dentro del backend. Reservas y opiniones podrán conectar sus operaciones desde archivos de composición propios. |
