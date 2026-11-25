# CU-06 · Consultar la trayectoria y actuaciones de un artista

**Actor** Visitante (ACT-01). **Spec** 3. Leer la biografía y saber en qué eventos participa un artista.

<!-- diagram: CU-06 -->

```mermaid
sequenceDiagram
actor V as Visitante
participant P as Página Artistas
participant C as ArtistCard
participant L as performancesOf
P->>C: Montar tarjeta con artista y catálogos
C->>L: Resolver actuaciones por artistIds
L-->>C: Actuaciones ordenadas y sede opcional
V->>C: Activar Ver detalle
C->>C: Alternar open
alt Se abre
  C-->>V: Biografía y actuaciones en hora de Loja
  opt No hay actuaciones
    C-->>V: Mostrar aviso
  end
else Se cierra o deja de estar visible por filtro
  C-->>V: Ocultar detalle
end
```

El objetivo se completa con datos o estado del navegador. Memoria del navegador.

[Catálogo detallado](../../analysis/02-actores-y-casos-de-uso.md) · [Vista de procesos](../README.md).
