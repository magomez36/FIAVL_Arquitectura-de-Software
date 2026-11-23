import { z } from 'zod';
import { idSchema, type Event } from '@fiavl/contracts';

export const MAX_QUANTITY = 10;
export const MAX_STORED = 20;

const reference = z.string().regex(/^[A-Za-z0-9_-]{32}$/);
const timestamp = z.string().regex(/-05:00$/);

export const availabilitySchema = z.strictObject({
  eventId: idSchema, capacity: z.int().nonnegative(), reserved: z.int().nonnegative(),
  remaining: z.int().nonnegative(), reservable: z.boolean()
});
export const availabilityListSchema = z.array(availabilitySchema);
export const reservationSchema = z.strictObject({
  reference, eventId: idSchema, quantity: z.int().min(1).max(MAX_QUANTITY),
  status: z.enum(['active', 'cancelled']), createdAt: timestamp, cancelledAt: timestamp.nullable(),
  remaining: z.int().nonnegative().optional()
});
export type Availability = z.infer<typeof availabilitySchema>;
export type ReservationDto = z.infer<typeof reservationSchema>;

/** Contenido de fiavl:reservations:v1. Solo referencias opacas; sin nombre, correo ni teléfono. */
const storedSchema = z.strictObject({
  version: z.literal(1),
  items: z.array(z.strictObject({ reference, eventId: idSchema, quantity: z.int().min(1).max(MAX_QUANTITY) })).max(MAX_STORED)
});
export type StoredItem = z.infer<typeof storedSchema>['items'][number];

/** Lanza ante cualquier forma inesperada; readLocal lo traduce a «sin datos». */
export function parseStored(value: unknown): StoredItem[] {
  const { items } = storedSchema.parse(value);
  if (new Set(items.map(i => i.reference)).size !== items.length) throw new Error('Referencias duplicadas');
  return items;
}
export const serializeStored = (items: StoredItem[]) => ({ version: 1 as const, items: items.slice(0, MAX_STORED) });
export const remember = (items: StoredItem[], item: StoredItem) =>
  [item, ...items.filter(i => i.reference !== item.reference)].slice(0, MAX_STORED);

export type QuantityCheck = { ok: true; quantity: number } | { ok: false; message: string };
/** Valida la cantidad escrita: entero positivo, tope por reserva y plazas restantes. */
export function checkQuantity(raw: string, remaining: number): QuantityCheck {
  const text = raw.trim();
  if (!/^\d+$/.test(text)) return { ok: false, message: 'Indica una cantidad entera positiva, sin decimales.' };
  const quantity = Number(text);
  if (quantity < 1) return { ok: false, message: 'La cantidad mínima es 1.' };
  if (quantity > MAX_QUANTITY) return { ok: false, message: `Puedes reservar hasta ${MAX_QUANTITY} plazas por vez.` };
  if (quantity > remaining) return { ok: false, message: remaining === 0 ? 'Aforo agotado para este evento.'
    : remaining === 1 ? 'Solo queda 1 plaza.' : `Solo quedan ${remaining} plazas.` };
  return { ok: true, quantity };
}

export const reservableEvents = (events: readonly Event[]) => events.filter(e => e.reservable);
export const remainingOf = (availability: readonly Availability[], eventId: string) =>
  availability.find(a => a.eventId === eventId)?.remaining ?? 0;

export const formatWhen = (iso: string) => new Intl.DateTimeFormat('es-EC', {
  dateStyle: 'long', timeStyle: 'short', hourCycle: 'h23', timeZone: 'America/Guayaquil'
}).format(new Date(iso));

export const plazas = (n: number) => n === 1 ? '1 plaza' : `${n} plazas`;
export const disponibles = (n: number) => n === 1 ? '1 plaza disponible' : `${n} plazas disponibles`;
