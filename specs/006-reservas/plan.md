# Plan de implementación · Spec 6

## Enfoque

Backend por capas, sin tocar archivos comunes:

1. `migrations/006_reservations.sql`: tabla `reservations` (STRICT, CHECK de cantidad 1–10, estado y coherencia de `cancelledAt`, FK a `events`, `referenceHash` único de 64 caracteres) e índice `(eventId, status)`. No depende de la tabla `feedback`, de modo que el registro por número aplica 006 tanto en el orden 001→006→010 como sobre una base que ya registró 001 y 010.
2. `repositories/reservations.ts`: único lugar con SQL (sentencias parametrizadas), conversión de filas y `atomically()` con `BEGIN IMMEDIATE`/`COMMIT`/`ROLLBACK`.
3. `services/reservations.ts`: Zod (`eventId` + `quantity` 1–10, referencia de 32 caracteres), decisión (no existe / no reservable / insuficiente / creada), cálculo de restantes, referencia aleatoria, SHA-256 y reloj inyectables, hora de Loja.
4. `features/reservations.ts`: router Express con operaciones inyectadas, `express.json({limit:'1kb'})`, mapeo de resultados a HTTP y `Cache-Control: no-store`.
5. `composition/reservations.ts`: conecta repositorio → servicio → router.

Frontend en `apps/web/src/features/reservas/`: `index.tsx` (página, `available: true` tras aceptación), `logic.ts` (esquemas, validación de cantidad, validador de `fiavl:reservations:v1`, formato), `client.ts` (POST con `HttpError` compartido), `reservas.css` (solo `.reservas*` con tokens `--stage-*`). Lee `GET /api/events` con `getResource` y la disponibilidad desde `GET /api/reservations/availability`.

## Decisiones

- Sin códigos nuevos en `errorSchema`: 409 y 422 comparten `INVALID_INPUT`; los clientes discriminan por estado (como indica docs/contracts.md).
- Cancelación idempotente (200 en la repetición) en lugar de 409: la UI y los reintentos de red no necesitan ramificar.
- Se guarda solo el hash de la referencia; una filtración de la base no permite cancelar.
- Esquemas Zod de reservas locales a cada capa (`services/` y `features/reservas/logic.ts`) hasta que Manuel autorice moverlos a `packages/contracts`.
- Las lecturas por referencia o disponibilidad individual usan la misma transacción por simplicidad.

## Constitución

Tres capas con contratos explícitos (I), demo reproducible sin cuentas ni secretos (II), teclado/foco/estados y aviso no oficial (III), propiedad respetada y migración nueva sin reescribir las previas (IV), evidencia en validation.md (V).

## Spec Kit

`specify` no está instalado en esta máquina (`specify version` no se reconoce). Se usaron los helpers locales: `check-prerequisites.ps1 -Json -PathsOnly` con `SPECIFY_FEATURE_DIRECTORY=specs/006-reservas` devolvió `FEATURE_DIR` correcto. Las fases (specify → plan → tasks → implement) se redactaron a mano siguiendo las plantillas; no se simuló la salida del CLI.
