# CU-17 · Ampliar y recorrer imágenes de la galería

**Actor** Visitante (ACT-01). **Spec** 8. Examinar una imagen ampliada y sus créditos, y recorrer resultados vecinos.

<!-- diagram: CU-17 -->

```mermaid
---
config:
  theme: neutral
---
sequenceDiagram
actor V as Visitante
participant U as Galería
participant L as Lightbox
participant N as Diálogo del navegador
V->>U: Activar Ampliar
U->>U: Guardar botón de origen y seleccionar ID
U->>L: Renderizar selección válida
L->>N: showModal y enfocar Cerrar
N-->>V: Imagen, descripción y créditos
loop Recorrer resultados o navegar con Tab
  V->>L: Activar vecino o pulsar Tab / Shift+Tab
  L->>L: neighbour sin ciclo o trapTab
  L-->>V: Actualizar selección o mantener foco dentro
end
opt Recurso de imagen roto
  L-->>V: Alternativa de Picture
end
V->>N: Cerrar con botón, Escape o fondo
N->>U: onClose
U->>U: Limpiar ID y programar retorno del foco
alt Botón de origen conectado
  U-->>V: Enfocar botón de origen
else Botón ausente
  U-->>V: Enfocar encabezado Colección
end
```

El objetivo se completa con datos o estado del navegador. Estado temporal del navegador.

[Catálogo detallado](../../analysis/02-actores-y-casos-de-uso.md) · [Vista de procesos](../README.md).
