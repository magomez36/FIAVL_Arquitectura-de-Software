# CU-16 · Explorar la galería por categorías

**Actor** Visitante (ACT-01). **Spec** 8. Encontrar imágenes y reconocer su procedencia.

<!-- diagram: CU-16 -->

```mermaid
sequenceDiagram
actor V as Visitante
participant U as Galería
participant I as buildItems y Picture
participant H as getResource
participant A as API de catálogo
participant D as SQLite
V->>U: Abrir /galeria
U->>I: Construir cuadrícula con recursos editoriales
I-->>V: Mostrar imágenes locales y créditos
loop Carga o reintento
  U->>H: Obtener sedes con AbortSignal
  H-)A: GET /api/venues
  A->>D: Leer sedes
  D-->>A: Filas
  A-->>H: JSON o error
  H->>H: Validar Venue[]
  alt Respuesta válida y vigente
    H-->>U: Sedes
    U->>I: Combinar con recursos locales y contar
    I-->>V: Cuadrícula, o aviso de sedes vacías
  else Red o formato inválido
    U-->>V: Alerta, reintento y parte editorial visible
  end
end
loop Cambiar categoría
  V->>U: Elegir categoría
  U->>I: filterItems
  I-->>V: Resultados y contador o volver a Todas
end
opt Imagen rota
  I->>U: onError marca el ID
  U-->>V: Mostrar alternativa textual
end
```

Lectura SQLite para sedes; inventario y filtros en memoria.

[Catálogo detallado](../../analysis/02-actores-y-casos-de-uso.md) · [Vista de procesos](../README.md).
