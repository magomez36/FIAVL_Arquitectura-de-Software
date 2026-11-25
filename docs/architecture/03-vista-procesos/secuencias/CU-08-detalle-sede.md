# CU-08 · Consultar una sede demo y sus actividades

**Actor** Visitante (ACT-01). **Spec** 4. Conocer dónde está una sede, sus notas demo de acceso y sus actividades.

<!-- diagram: CU-08 -->

```mermaid
sequenceDiagram
actor V as Visitante
participant P as Espacios
participant C as VenueDetails
participant N as details/summary nativo
P->>P: Asociar eventos precargados por venueId
P->>C: Renderizar Venue y eventos ordenados
V->>N: Abrir ficha con teclado o puntero
N-->>V: Mostrar descripción, ilustración y acceso demo
alt Con actividades
  C-->>V: Exponer lista y horario de Loja
else Sin actividades
  C-->>V: Exponer aviso
end
opt Plegar ficha
  V->>N: Activar summary otra vez
end
```

El objetivo se completa con datos o estado del navegador. Memoria del navegador.

[Catálogo detallado](../../analysis/02-actores-y-casos-de-uso.md) · [Vista de procesos](../README.md).
