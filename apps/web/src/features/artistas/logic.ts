import type { Artist, Event, Venue } from '@fiavl/contracts';

export type Filters = { query: string; country: string; discipline: string };
export const emptyFilters: Filters = { query: '', country: '', discipline: '' };

export type Performance = { event: Event; venue?: Venue };

const fold = (text: string) => text.normalize('NFD').replace(/\p{M}/gu, '').toLowerCase().trim();

export function filterArtists(artists: Artist[], filters: Filters): Artist[] {
  const query = fold(filters.query);
  return artists.filter(a =>
    (!query || fold(a.name).includes(query)) &&
    (!filters.country || a.country === filters.country) &&
    (!filters.discipline || a.discipline === filters.discipline));
}

const unique = (values: string[]) => [...new Set(values)].sort((a, b) => a.localeCompare(b, 'es'));
export const countries = (artists: Artist[]) => unique(artists.map(a => a.country));
export const disciplines = (artists: Artist[]) => unique(artists.map(a => a.discipline));

/** Eventos cuyo artistIds incluye el artista, por inicio e id, con su sede si existe. */
export function performancesOf(artistId: string, events: Event[], venues: Venue[]): Performance[] {
  const venueById = new Map(venues.map(v => [v.id, v]));
  return events
    .filter(e => e.artistIds.includes(artistId))
    .sort((a, b) => a.startAt.localeCompare(b.startAt) || a.id.localeCompare(b.id))
    .map(event => ({ event, venue: venueById.get(event.venueId) }));
}

const when = new Intl.DateTimeFormat('es-EC', {
  timeZone: 'America/Guayaquil', weekday: 'long', day: 'numeric', month: 'long',
  hour: '2-digit', minute: '2-digit', hourCycle: 'h23'
});
export const formatWhen = (iso: string) => when.format(new Date(iso));
