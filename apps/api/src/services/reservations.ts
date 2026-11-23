import { createHash, randomBytes } from 'node:crypto';
import { z } from 'zod';
import { idSchema } from '@fiavl/contracts';

export const MAX_QUANTITY = 10;

export const reservationInputSchema = z.strictObject({
  eventId: idSchema,
  quantity: z.int().min(1).max(MAX_QUANTITY)
});
/** Referencia opaca: 24 bytes aleatorios en base64url (32 caracteres). */
export const referenceSchema = z.string().regex(/^[A-Za-z0-9_-]{32}$/);

export interface EventCapacity { id: string; capacity: number; reservable: boolean }
export interface ReservationRow {
  eventId: string; quantity: number; status: 'active' | 'cancelled'; createdAt: string; cancelledAt: string | null;
}
export interface Availability { eventId: string; capacity: number; reserved: number; remaining: number; reservable: boolean }
export interface ReservationView extends ReservationRow { reference: string }

/** Operaciones que el servicio puede ejecutar dentro de una única transacción. */
export interface ReservationStore {
  findEvent(eventId: string): EventCapacity | undefined;
  reservedFor(eventId: string): number;
  insert(referenceHash: string, eventId: string, quantity: number, createdAt: string): void;
  findByHash(referenceHash: string): ReservationRow | undefined;
  cancel(referenceHash: string, cancelledAt: string): void;
}
export interface ReservationRepository {
  listEvents(): (EventCapacity & { reserved: number })[];
  atomically<T>(work: (store: ReservationStore) => T): T;
}

export type CreateResult =
  | { kind: 'created'; reservation: ReservationView; remaining: number }
  | { kind: 'invalid' } | { kind: 'eventNotFound' } | { kind: 'notReservable' }
  | { kind: 'insufficient'; remaining: number };
export type ReservationResult = { kind: 'ok'; reservation: ReservationView } | { kind: 'invalidReference' } | { kind: 'notFound' };
export type AvailabilityResult = { kind: 'ok'; availability: Availability } | { kind: 'invalidId' } | { kind: 'notFound' };

export const hashReference = (reference: string) => createHash('sha256').update(reference).digest('hex');
/** Hora civil de Loja (UTC-5 sin horario de verano), con segundos. */
export const lojaTimestamp = (date: Date) => new Date(date.getTime() - 5 * 3600_000).toISOString().slice(0, 19) + '-05:00';

const toAvailability = (event: EventCapacity, reserved: number): Availability => ({
  eventId: event.id, capacity: event.capacity, reserved,
  remaining: Math.max(0, event.capacity - reserved), reservable: event.reservable
});

export function createReservationService(
  repository: ReservationRepository,
  clock: () => Date = () => new Date(),
  newReference: () => string = () => randomBytes(24).toString('base64url')
) {
  return {
    availability(): Availability[] {
      return repository.listEvents().map(event => toAvailability(event, event.reserved));
    },
    availabilityOf(eventId: unknown): AvailabilityResult {
      const id = idSchema.safeParse(eventId);
      if (!id.success) return { kind: 'invalidId' };
      return repository.atomically(store => {
        const event = store.findEvent(id.data);
        return event ? { kind: 'ok', availability: toAvailability(event, store.reservedFor(event.id)) } as const : { kind: 'notFound' } as const;
      });
    },
    create(raw: unknown): CreateResult {
      const input = reservationInputSchema.safeParse(raw);
      if (!input.success) return { kind: 'invalid' };
      const { eventId, quantity } = input.data;
      const reference = newReference();
      const createdAt = lojaTimestamp(clock());
      return repository.atomically((store): CreateResult => {
        const event = store.findEvent(eventId);
        if (!event) return { kind: 'eventNotFound' };
        if (!event.reservable) return { kind: 'notReservable' };
        const remaining = event.capacity - store.reservedFor(eventId);
        if (quantity > remaining) return { kind: 'insufficient', remaining: Math.max(0, remaining) };
        store.insert(hashReference(reference), eventId, quantity, createdAt);
        return {
          kind: 'created', remaining: remaining - quantity,
          reservation: { reference, eventId, quantity, status: 'active', createdAt, cancelledAt: null }
        };
      });
    },
    find(rawReference: unknown): ReservationResult {
      const reference = referenceSchema.safeParse(rawReference);
      if (!reference.success) return { kind: 'invalidReference' };
      const row = repository.atomically(store => store.findByHash(hashReference(reference.data)));
      return row ? { kind: 'ok', reservation: { reference: reference.data, ...row } } : { kind: 'notFound' };
    },
    /** Idempotente: cancelar de nuevo devuelve la misma reserva sin modificar el aforo. */
    cancel(rawReference: unknown): ReservationResult {
      const reference = referenceSchema.safeParse(rawReference);
      if (!reference.success) return { kind: 'invalidReference' };
      const hash = hashReference(reference.data);
      const cancelledAt = lojaTimestamp(clock());
      const row = repository.atomically(store => {
        const current = store.findByHash(hash);
        if (!current) return undefined;
        if (current.status === 'active') store.cancel(hash, cancelledAt);
        return store.findByHash(hash);
      });
      return row ? { kind: 'ok', reservation: { reference: reference.data, ...row } } : { kind: 'notFound' };
    }
  };
}
export type ReservationOperations = ReturnType<typeof createReservationService>;
