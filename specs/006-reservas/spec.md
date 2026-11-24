# Reservas demostrativas · Spec 6

Prototipo académico NO oficial con datos DEMO. Una reserva de este spec no es una entrada FIAVL, no implica pago ni cuenta y no debe presentarse como tal. La UI lo dice en cada vista: «Reserva demostrativa; no equivale a una entrada oficial» y «Prototipo académico no oficial · Datos demo». Horarios en America/Guayaquil.

## Historias y aceptación

### US1 · Reservar plazas (P1)

Dado un evento reservable con plazas restantes, cuando elijo evento y una cantidad entera positiva y envío el formulario, entonces el servidor crea la reserva, devuelve una referencia opaca y la UI muestra la confirmación, anuncia el resultado, mueve el foco al encabezado de confirmación y actualiza las plazas restantes.

Dado un evento sin plazas suficientes, evento inexistente, no reservable, o cantidad cero, negativa, decimal, mayor de 10 o con campos adicionales, cuando envío la reserva, entonces no se guarda nada, el aforo no cambia y se muestra un error anunciable en español.

### US2 · Consultar plazas restantes (P1)

Dada la edición demo, cuando abro /reservas, entonces veo para cada evento reservable las plazas RESTANTES (capacidad menos reservas activas, calculadas en el servidor) y «Aforo agotado» cuando son 0. Capacity nunca se presenta como plazas disponibles. Los eventos no reservables no se pueden seleccionar.

### US3 · Cancelar con la referencia (P1)

Dada una reserva activa, cuando la cancelo con su referencia (desde «Mis reservas en este navegador» o escribiéndola), entonces queda cancelada y sus plazas vuelven al aforo exactamente una vez. Cancelar de nuevo es idempotente y no libera plazas otra vez. Un identificador secuencial, una referencia con formato inválido (400) o desconocida (404) no cancelan nada: nadie puede cancelar la reserva de otra persona sin conocer su referencia de 192 bits.

### US4 · Recuperar el servicio (P2)

Dada una consulta pendiente veo la carga; dado un fallo veo una alerta con «Reintentar»; dado que no hay eventos reservables veo un aviso de vacío. Dado un `localStorage` corrupto o bloqueado, la reserva sigue funcionando y la UI avisa de que debo anotar la referencia.

### US5 · Concurrencia y persistencia (P1)

Dadas dos reservas simultáneas cuya suma supera el saldo, cuando se procesan (en una o varias conexiones SQLite), entonces solo se acepta la que cabe. Dada una base reabierta, las reservas y los saldos persisten.

## Contrato REST (`/api/reservations`)

Cuerpos JSON UTF-8, `Cache-Control: no-store`. Errores con el envoltorio común `{"error":{"code","message"}}` y los códigos ya definidos en `@fiavl/contracts` (no se añadió ninguno; ver architecture.md).

| Método y ruta | Cuerpo | Éxito | Errores |
|---|---|---|---|
| GET /availability | — | 200 `[{eventId, capacity, reserved, remaining, reservable}]` en orden startAt, id (todos los eventos) | — |
| GET /availability/:eventId | — | 200 `{eventId, capacity, reserved, remaining, reservable}` | 400 INVALID_ID, 404 NOT_FOUND |
| POST / | `{"eventId": id, "quantity": 1..10}` (exacto, máx. 1 KiB, application/json) | 201 `{reference, eventId, quantity, status:"active", createdAt, cancelledAt:null, remaining}` | 400 INVALID_INPUT (forma, JSON, tipo/valor, campos extra, sin Content-Type JSON), 404 NOT_FOUND (evento), 409 INVALID_INPUT (plazas insuficientes o agotadas), 413 INVALID_INPUT, 422 INVALID_INPUT (evento no reservable) |
| GET /:reference | — | 200 `{reference, eventId, quantity, status, createdAt, cancelledAt}` | 400 INVALID_ID, 404 NOT_FOUND |
| POST /:reference/cancel | — | 200 la reserva con `status:"cancelled"` y `cancelledAt` (idempotente) | 400 INVALID_ID, 404 NOT_FOUND |

`reference` = 24 bytes aleatorios en base64url (32 caracteres `[A-Za-z0-9_-]`). Solo se guarda su SHA-256. Marcas de tiempo ISO con segundos y `-05:00`. Rutas o métodos no definidos bajo el namespace devuelven el 404 común.

## Requisitos

- R1. Aforo restante en servidor; nunca equiparar capacity con plazas disponibles.
- R2. Sin sobreventa: comprobar y escribir en una transacción `BEGIN IMMEDIATE`/`COMMIT`/`ROLLBACK`.
- R3. SQL parametrizado solo en el repositorio; decisiones en el servicio; handlers sin SQL ni conexión; `composition/reservations.ts` inyecta.
- R4. Migración `006_reservations.sql` independiente, aplicable antes o después de 010 sin tocar feedback.
- R5. Sin cuentas, pagos, datos personales ni servicios externos. La referencia es una capacidad al portador, no un sistema de identidad.
- R6. UI con componentes Stage*, tokens --stage-*, formularios nativos, foco visible, teclado, movimiento reducido y estados loading/error/reintento/vacío/agotado.
- R7. Clave `fiavl:reservations:v1` con validador estricto, sin datos personales, tolerante a corrupción y bloqueo.

## Éxito medible

- E1. 0 reservas aceptadas por encima de capacidad en pruebas con 2 reservas simultáneas en 1 y 2 conexiones y 6 solicitudes sobre 2 plazas (exactamente 2 aceptadas).
- E2. 100 % de las entradas inválidas listadas rechazadas con 4xx y sin cambio de aforo.
- E3. Doble cancelación: el aforo restante es idéntico tras la primera y la segunda.
- E4. 375 y 1440 px sin desbordamiento horizontal.
- E5. Migración sobre BD limpia (001→006→010) y sobre BD con 001+010 aplicadas: los registros y el resumen de feedback quedan idénticos.

## Matriz de impacto de `available: true`

| Superficie | Efecto | Verificación |
|---|---|---|
| Menú y rutas (`features/index.ts`, `main.tsx`) | Se quita «No disponible» de Reservas; el título pasa a «Reservas · FIAVL Explora» | home.spec «menú y nueve rutas» y spec-06 (menú) |
| Smoke común | Ya no espera el aviso «Función no disponible» en /reservas (lo calcula desde el menú); el test «entradas activas independientes» sustituye el módulo por uno de prueba | home.spec (sin cambios) |
| Portada y carrusel | Solo dependen de `/agenda`; sin efecto | spec-10 e2e |
| Agenda, Artistas, Espacios, Rutas, Opiniones | Sin cambios; `/api/events` no se toca | tests existentes verdes |
| Mi agenda (Spec 5, pendiente) | Sin dependencia de su UI o código; puede leer `GET /api/reservations/availability` | — |
| API común | `/api/reservations` deja de responder 501; sus rutas desconocidas dan 404 | tests/reservations.test.ts |
| Contratos y docs comunes | `docs/contracts.md` actualizado (edición mínima autorizada); `packages/contracts` sin cambios | revisión del diff |

## Supuestos y límites

No se filtra por reloj (el contrato común prohíbe filtrar listas por hora): también se puede reservar un evento ya pasado. No hay límite de frecuencia ni autenticación: la referencia aleatoria es el único secreto. Máximo 10 plazas por reserva y 20 referencias guardadas por navegador.
