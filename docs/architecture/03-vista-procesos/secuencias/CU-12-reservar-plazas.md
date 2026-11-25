# CU-12 · Reservar plazas demostrativas

**Actor** Visitante (ACT-01). **Spec** 6. Obtener una reserva activa y una referencia para recuperarla o cancelarla.

<!-- diagram: CU-12 -->

```mermaid
sequenceDiagram
actor V as Visitante
participant U as Reservas
participant A as Router de reservas
participant S as Servicio de reservas
participant R as Repositorio de reservas
participant D as SQLite
participant L as localStorage
V->>U: Elegir evento y cantidad, enviar
U->>U: checkQuantity con el saldo visible
alt Entrada local inválida
  U-->>V: Mostrar error de campo
else Formulario válido
  U-)A: postJson · POST /api/reservations
  A->>A: Analizar JSON de hasta 1 KiB
  alt JSON inválido o excesivo
    A-->>U: 400 o 413
  else JSON procesado
    A->>S: create(body)
    S->>S: Validar esquema estricto, generar referencia y hora
    alt Entrada fuera de contrato
      S-->>A: invalid
      A-->>U: 400 INVALID_INPUT
    else Entrada válida
      S->>R: atomically
      R->>D: BEGIN IMMEDIATE
      Note over R,D: Si falla BEGIN, devolver 500 sin rollback
      R->>D: Leer evento y sumar reservas activas si procede
      D-->>R: Datos para decidir
      R-->>S: Capacidad, reservabilidad y plazas activas
      alt Evento ausente, no reservable o saldo insuficiente
        S-->>R: Resultado sin inserción
        R->>D: COMMIT
        A-->>U: 404, 422 o 409 según resultado
      else Hay plazas
        S->>R: insert(hash, eventId, quantity, createdAt)
        R->>D: INSERT reserva activa
        R->>D: COMMIT
        R-->>S: Confirmar resultado
        S-->>A: created con referencia y remaining
        A-->>U: 201
      else Excepción tras BEGIN
        R->>D: ROLLBACK
        A-->>U: 500 INTERNAL_ERROR
      end
    end
  end
  alt 201 válido
    U->>L: Intentar guardar referencia
    U-->>V: Confirmar, enfocar encabezado y avisar si no se guardó localmente
  else Error o respuesta no confirmada
    U-->>V: Mostrar error y permitir nueva acción
  end
  opt Éxito o HttpError
    U-)A: GET /api/reservations/availability
    A-->>U: Saldo actualizado si la lectura tiene éxito
  end
end
```

SQLite y copia local `{reference,eventId,quantity}` si está disponible.

[Catálogo detallado](../../analysis/02-actores-y-casos-de-uso.md) · [Vista de procesos](../README.md).
