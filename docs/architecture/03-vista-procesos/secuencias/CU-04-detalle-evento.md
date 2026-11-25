# CU-04 · Consultar el detalle de un evento

**Actor** Visitante (ACT-01). **Spec** 2. Conocer descripción, horario completo, sede, artistas y precio de un evento.

<!-- diagram: CU-04 -->

```mermaid
---
config:
  theme: neutral
---
sequenceDiagram
actor V as Visitante
participant U as Agenda
participant M as Catálogo en memoria
V->>U: Activar Ver detalle en una tarjeta visible
U->>U: Cambiar selected y aria-expanded
alt Ficha abierta
  U->>M: Resolver artista y sede por ID
  M-->>U: Nombres disponibles
  U-->>V: Descripción, disciplina, horario, sede y precio
  opt Sin nombres de artistas resueltos
    U-->>V: Por confirmar
  end
else Misma ficha ya abierta
  U-->>V: Colapsar el detalle
end
```

El objetivo se completa con datos o estado del navegador. Memoria del navegador.

[Catálogo detallado](../../analysis/02-actores-y-casos-de-uso.md) · [Vista de procesos](../README.md).
