# Feature Specification: Mi agenda (/mi-agenda)

**Rama**: `feature/spec-5` · **Directorio**: `specs/005-mi-agenda` · **Estado**: implementado, pendiente de auditoría

Fuente de datos: catálogo DEMO (`GET /api/events`, `/venues`). Persistencia local en `fiavl:agenda:v1` (IDs de eventos). Independiente de la UI de `/agenda`.

## Historia 1 — Armar mi agenda (P1)
1. **Dado** el catálogo demo, **cuando** abro `/mi-agenda` directamente, **entonces** veo mi programa (vacío al inicio) y la lista de eventos para agregar, ordenada por inicio e ID.
2. **Dado** un evento, **cuando** pulso «Agregar» **entonces** aparece en mi programa y su botón queda deshabilitado (sin duplicados).
3. **Dado** un evento en mi programa, **cuando** pulso «Quitar» **entonces** desaparece.
4. **Dado** mi programa vacío, **entonces** hay un estado vacío con enlace real a `/agenda`.

## Historia 2 — Orden y solapamientos (P1)
1. **Dado** varios eventos, **entonces** mi programa sale cronológico en hora de Loja.
2. **Dado** A y B con inicio A < fin B e inicio B < fin A, **entonces** ambos muestran «Se solapa con…». Si solo se tocan los extremos, no hay conflicto (`umbral-de-luz` y `el-rio-suena` sí se solapan).

## Historia 3 — Persistencia y tolerancia (P1)
1. **Dado** una agenda guardada, **cuando** recargo, **entonces** se recupera.
2. **Dado** datos corruptos, **entonces** la agenda empieza vacía sin romper la página.
3. **Dado** almacenamiento bloqueado, **cuando** agrego, **entonces** un aviso indica que no se pudo guardar.
4. **Dado** un ID guardado que ya no existe, **entonces** se avisa y se ofrece quitarlo; no se borra sin acción del usuario.

## Estados
Carga, error con «Reintentar» y vacío. No hay login, reservas, sincronización ni cupos.
