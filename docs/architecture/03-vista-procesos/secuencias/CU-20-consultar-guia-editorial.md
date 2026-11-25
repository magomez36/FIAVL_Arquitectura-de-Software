# CU-20 · Consultar la guía editorial del FIAVL 2026

**Actor** Visitante (ACT-01). **Spec** 10. Identificar obras, artistas, horarios y sedes documentadas y acceder a la fuente.

<!-- diagram: CU-20 -->

```mermaid
sequenceDiagram
actor V as Visitante
participant F as FestivalProgram y FestivalVenues
participant E as Datos de festival2026.ts
participant N as Navegador
V->>F: Abrir la guía o sedes desde portada
F->>E: Leer shows, venues y links
E-->>F: Cuatro obras y cinco sedes editoriales
F-->>V: Mostrar programa y dos sedes de avance
opt Abrir «Ver las cinco sedes»
  V->>N: Navegar a /espacios
  N->>F: Cargar FestivalVenues completo
  F-->>V: Mostrar cinco sedes documentadas
end
F->>N: Solicitar /images/museo-loja.jpg
alt Recurso disponible
  N-->>V: Mostrar imagen con crédito
else Error de imagen
  F-->>V: Mostrar texto y conservar procedencia
end
opt Seguir fuente documental
  V->>N: Activar enlace externo
end
```

El objetivo se completa con datos o estado del navegador. Datos fuente en el código de presentación.

[Catálogo detallado](../../analysis/02-actores-y-casos-de-uso.md) · [Vista de procesos](../README.md).
