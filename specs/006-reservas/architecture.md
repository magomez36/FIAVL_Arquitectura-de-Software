# Arquitectura de Reservas · Spec 6

```text
Navegador  ──HTTP /api──►  features/reservations.ts (router, sin SQL)
 /reservas                       │ ReservationOperations
 getResource / postJson          ▼
                         services/reservations.ts (Zod, decisión, referencia, reloj)
                                 │ ReservationRepository.atomically(store => …)
                                 ▼
                         repositories/reservations.ts (SQL parametrizado, BEGIN IMMEDIATE)
                                 ▼
                              SQLite: events (lectura) · reservations (006)
composition/reservations.ts conecta las tres piezas con la conexión de composition.ts.
```

## Escenario: dos reservas simultáneas por las últimas 2 plazas

1. Dos POST con `quantity: 2` llegan casi juntos (misma conexión o dos conexiones/procesos).
2. Cada servicio abre `atomically`: `BEGIN IMMEDIATE` toma el bloqueo de escritura antes de leer; la segunda espera (`busy_timeout` 5 s).
3. La primera lee restantes = 3, inserta, `COMMIT`. La segunda lee restantes = 1 < 2 y devuelve `insufficient` → 409; su transacción termina sin escribir.
4. Cualquier excepción provoca `ROLLBACK` y el error 500 común; ninguna reserva parcial.

## Modelo de seguridad

La referencia es una capacidad al portador: 192 bits aleatorios, nunca derivada del ID secuencial, almacenada como SHA-256 y enviada solo al crear. No sustituye un sistema de identidad: quien la conozca puede ver y cancelar esa reserva; quien la pierda no puede recuperarla. No hay cuentas, datos personales ni limitación de frecuencia. Los IDs internos (`id INTEGER`) no se exponen.

## Cambios comunes

Realizado (autorizado por Manuel): `docs/contracts.md` documenta los endpoints reales, límites, estados HTTP, `error.code` y la clave `fiavl:reservations:v1`; la fila 501 de la tabla de errores queda como «reservado, ya no lo emite ningún namespace».

Decisión B: 409 (plazas) y 422 (no reservable) conservan `INVALID_INPUT`. El estado HTTP ya distingue los casos (como exige contracts.md), la UI no necesita otro código y evita tocar `packages/contracts`. Si una spec futura necesita discriminar por `error.code`, `CONFLICT` puede añadirse de forma retrocompatible en `errorSchema`.

Pendiente, sin autorización: mover los esquemas Zod de reservas a `packages/contracts` y referenciar este documento desde `docs/architecture.md`/`adr.md`.

## Dependencias

Se importa `zod` desde la API y la web igual que ya hacen otras features (hoisting de npm workspaces); no se modificó ningún `package.json`.
