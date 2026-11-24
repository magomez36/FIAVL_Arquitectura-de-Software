import type { Event } from '@fiavl/contracts';

/** Parses stored data: a list of unique string IDs. Anything else is corrupt. */
export function parseIds(value: unknown): string[] {
  if (!Array.isArray(value) || value.some(id => typeof id !== 'string' || id === '')) throw new Error('Agenda corrupta');
  return [...new Set(value as string[])];
}

export const addId = (ids: readonly string[], id: string): string[] => ids.includes(id) ? [...ids] : [...ids, id];
export const removeId = (ids: readonly string[], id: string): string[] => ids.filter(x => x !== id);

/** Strict overlap: touching ends (A ends when B starts) is not a conflict. */
export const overlaps = (a: Event, b: Event) => a.startAt < b.endAt && b.startAt < a.endAt;

export function sortEvents(events: readonly Event[]): Event[] {
  return [...events].sort((a, b) => a.startAt === b.startAt ? a.id.localeCompare(b.id) : a.startAt.localeCompare(b.startAt));
}

/** Resolves saved IDs against the catalog; unknown IDs are returned separately. */
export function resolveAgenda(ids: readonly string[], catalog: readonly Event[]) {
  const byId = new Map(catalog.map(e => [e.id, e]));
  const found = sortEvents(ids.flatMap(id => byId.get(id) ?? []));
  const missing = ids.filter(id => !byId.has(id));
  return { found, missing };
}

export function conflictsOf(event: Event, agenda: readonly Event[]): Event[] {
  return agenda.filter(other => other.id !== event.id && overlaps(event, other));
}

export const formatTime = (iso: string) => new Intl.DateTimeFormat('es-EC', {
  dateStyle: 'long', timeStyle: 'short', timeZone: 'America/Guayaquil'
}).format(new Date(iso));
