# CU-09 · Armar mi agenda personal

**Actor** Visitante (ACT-01). **Spec** 5. Guardar o quitar eventos de mi selección personal.

<!-- diagram: CU-09 -->

```mermaid
sequenceDiagram
actor V as Visitante
participant U as Mi agenda
participant L as Lógica de agenda
participant S as localStorage
V->>U: Agregar, quitar o limpiar IDs ausentes
alt Agregar
  U->>L: addId(ids, id)
  L-->>U: Selección sin duplicados
else Quitar uno o varios
  U->>L: removeId o filtrar IDs ausentes
  L-->>U: Selección reducida
end
U->>U: Actualizar ids en React
U->>S: writeLocal agenda con lista JSON
alt Guardado
  S-->>U: true
else Escritura bloqueada
  S-->>U: false
  U-->>V: Avisar que se perderá al recargar
end
U->>L: resolveAgenda y conflictsOf
L-->>U: Programa actualizado
U-->>V: Redibujar tarjetas y estado
```

El objetivo se completa con datos o estado del navegador. `fiavl:agenda:v1`, lista de IDs por origen de navegador.

[Catálogo detallado](../../analysis/02-actores-y-casos-de-uso.md) · [Vista de procesos](../README.md).
