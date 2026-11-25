# CU-15 · Explorar un recorrido cultural

**Actor** Visitante (ACT-01). **Spec** 7. Recorrer una secuencia temática de sedes y conocer cada parada.

<!-- diagram: CU-15 -->

```mermaid
sequenceDiagram
actor V as Visitante
participant U as Rutas
participant H as getResource
participant A as API de catálogo
participant D as SQLite
V->>U: Abrir /rutas
loop Carga inicial o reintento solicitado
  U-->>V: Anunciar carga
  U->>H: Solicitar venues
  H-)A: GET /api/venues
  A->>D: Leer colección
  D-->>A: Filas
  A-->>H: JSON o error
  H->>H: Comprobar estado y validar esquema
  alt HTTP, JSON o contrato inválido
    H-->>U: Rechazar lectura
    U-->>V: Mostrar error y ofrecer reintento
  else Lectura vigente
    H-->>U: Datos validados
    alt Sin sedes, ocultar explorador
      U-->>V: Mostrar estado vacío
    else Con fichas
      U-->>V: Mostrar selección y primera parada
      loop Elegir recorrido o avanzar/retroceder dentro de límites
        V->>U: Cambiar selección o posición
        U->>U: Resolver stops por ID, reiniciar al cambiar recorrido
        U-->>V: Ficha demo o aviso de sede ausente
      end
    end
  end
end
opt Efecto sustituido o desmontado
  U->>H: Abortar lecturas pendientes
end
```

Lectura SQLite; itinerarios y estado en navegador.

[Catálogo detallado](../../analysis/02-actores-y-casos-de-uso.md) · [Vista de procesos](../README.md).
