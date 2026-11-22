import type { Event } from '@fiavl/contracts';

export type Filters = { query: string; date: string; category: string; price: 'all' | 'free' | 'paid' };
/** Demo edition: 12–22 November 2026 (America/Guayaquil civil days). */
export const editionDays = Array.from({ length: 11 }, (_, i) => '2026-11-' + String(12 + i));

export const emptyFilters: Filters = { query: '', date: '', category: '', price: 'all' };

export const formatTime = (iso: string) => new Intl.DateTimeFormat('es-EC', {
  dateStyle: 'long', timeStyle: 'short', timeZone: 'America/Guayaquil'
}).format(new Date(iso));

export const formatPrice = (cents: number) => cents === 0 ? 'Gratuito' :
  new Intl.NumberFormat('es-EC', { style: 'currency', currency: 'USD' }).format(cents / 100);

/** Local calendar day in Loja, read from the -05:00 string so the machine zone never shifts it. */
export const localDay = (iso: string) => iso.slice(0, 10);

const norm = (value: string) => value.normalize('NFD').replace(/\p{M}/gu, '').toLocaleLowerCase('es');

export function sortEvents(events: readonly Event[]): Event[] {
  return [...events].sort((a, b) =>
    a.startAt === b.startAt ? a.id.localeCompare(b.id) : a.startAt.localeCompare(b.startAt));
}

export function filterEvents(events: readonly Event[], f: Filters, names: (e: Event) => string): Event[] {
  const q = norm(f.query.trim());
  return sortEvents(events).filter(e =>
    (!q || norm(e.title + ' ' + e.description + ' ' + e.category + ' ' + names(e)).includes(q)) &&
    (!f.date || localDay(e.startAt) === f.date) &&
    (!f.category || e.category === f.category) &&
    (f.price === 'all' || (f.price === 'free') === (e.priceCents === 0)));
}
