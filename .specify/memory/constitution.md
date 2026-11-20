<!-- Sync Impact Report
Plantilla → 1.0.0. Adopción inicial de cinco principios, restricciones,
revisión y gobernanza. Sin secciones retiradas ni decisiones diferidas.
Retirar este comentario al aprobar la constitución.
-->
# FIAVL Explora Constitution

## Core Principles

### I. Tres capas con contratos explícitos
La interfaz consume HTTP; la API valida y traduce el dominio; SQLite conserva los datos.
Cada cambio público debe actualizar el contrato y su prueba.

### II. Demo reproducible
Las versiones y el lockfile deben permitir una instalación limpia. Los datos demo deben tener
identidad estable, fechas locales explícitas y sobrevivir al reinicio. La demo debe funcionar
sin cuentas ni secretos.

### III. Acceso y procedencia
Cada página debe permitir navegación por teclado, mantener foco visible, identificar los estados
de la información y señalar el carácter no oficial. Cada recurso debe tener origen documentado.

### IV. Propiedad por spec
Cada integrante debe usar una rama exclusiva, respetar los puntos de integración y añadir
migraciones numeradas sin reescribir las anteriores. Manuel revisa cambios de arquitectura.

### V. Evidencia de aceptación
Cada tarea marcada debe tener evidencia reproducible. Lint, tipos, pruebas, build y smoke
deben pasar antes de la aceptación. Cada limitación debe quedar explícita.

## Restricciones del proyecto

La pila acordada es React, TypeScript, Vite, Tailwind, React Router y Lucide, con Express 5,
Zod y node:sqlite sobre Node 24 LTS en npm workspaces. La edición demo usa America/Guayaquil.

## Flujo de revisión

Cada spec conserva sus historias, plan y tareas de Spec Kit. El responsable revisa el diff,
las pruebas y el impacto en contratos antes de publicar e integrar.

## Governance

Manuel aprueba enmiendas con motivo, impacto y transición documentados. SemVer distingue
cambios incompatibles de principios, ampliaciones y aclaraciones editoriales. Cada revisión
de integración contrasta el resultado con los cinco principios.

**Version**: 1.0.0 | **Ratified**: 2026-11-19 | **Last Amended**: 2026-11-19
