import { useEffect, useState } from 'react';
import { eventsSchema, venueSchema, type Event, type Venue } from '@fiavl/contracts';
import { z } from 'zod';
import { Status } from '../../components/Status.tsx';
import { getResource } from '../../lib/http.ts';
import type { Feature } from '../types.ts';

const venuesSchema = z.array(venueSchema);
const schedule = new Intl.DateTimeFormat('es-EC', {
  dateStyle: 'long', timeStyle: 'short', timeZone: 'America/Guayaquil'
});
type Catalog = { venues: Venue[]; events: Event[] };

function searchable(value: string) {
  return value.normalize('NFD').replace(/\p{M}/gu, '').toLocaleLowerCase('es');
}

function VenueDetails({ venue, events }: { venue: Venue; events: Event[] }) {
  return <details className="rounded-lg border border-[var(--line)] bg-[#fffbf4] p-5">
    <summary className="cursor-pointer font-serif text-2xl">{venue.name}</summary>
    <div className="mt-5 grid gap-6 md:grid-cols-[1fr_2fr]">
      <img className="w-full rounded" src={venue.image} alt="" loading="lazy"/>
      <div className="space-y-4">
        <p>{venue.description}</p>
        <dl>
          <dt className="font-bold">Dirección demo</dt><dd>{venue.address}</dd>
          <dt className="mt-3 font-bold">Condiciones de acceso demo</dt><dd>{venue.accessibilityNotes}</dd>
        </dl>
        <h2 className="text-xl">Eventos en esta sede</h2>
        {events.length ? <ol className="space-y-3">{events.map(event =>
          <li key={event.id}><strong>{event.title}</strong><br/>
            <time dateTime={event.startAt}>{schedule.format(new Date(event.startAt))} · hora de Loja</time>
          </li>)}</ol> : <p>Esta sede aún no tiene eventos.</p>}
      </div>
    </div>
  </details>;
}

function Page() {
  const [catalog, setCatalog] = useState<Catalog>();
  const [failed, setFailed] = useState(false);
  const [attempt, setAttempt] = useState(0);
  const [query, setQuery] = useState('');
  useEffect(() => {
    const controller = new AbortController();
    Promise.all([
      getResource('venues', venuesSchema, controller.signal),
      getResource('events', eventsSchema, controller.signal)
    ]).then(([venues, events]) => {
      if (!controller.signal.aborted) setCatalog({ venues, events: events.sort((a, b) =>
        a.startAt.localeCompare(b.startAt) || a.id.localeCompare(b.id)) });
    }).catch(() => {
      if (!controller.signal.aborted) setFailed(true);
    });
    return () => controller.abort();
  }, [attempt]);

  const term = searchable(query.trim());
  const matches = catalog?.venues.filter(v => [v.name, v.address].some(value => searchable(value).includes(term)));
  return <section className="interior">
    <h1>Espacios culturales</h1>
    <p className="mb-7 max-w-prose">Las direcciones y condiciones de acceso son datos demo. Confirma las condiciones reales con la sede antes de visitarla.</p>
    {failed ? <Status message="No se pudo cargar el directorio." retry={() => {
      setFailed(false);
      setAttempt(value => value + 1);
    }}/> : !catalog ? <Status message="Cargando espacios…"/> : !catalog.venues.length ?
      <Status message="Aún no hay sedes en el directorio."/> : <>
        <label htmlFor="buscar-sede" className="block font-bold">Buscar por nombre o dirección</label>
        <input id="buscar-sede" type="search" className="mb-6 mt-2 w-full max-w-lg rounded border bg-white p-3"
          value={query} onChange={e => setQuery(e.target.value)}/>
        <div className="grid gap-3">{matches?.length ? matches.map(venue =>
          <VenueDetails key={venue.id} venue={venue} events={catalog.events.filter(e => e.venueId === venue.id)}/>
        ) : <Status message="Ninguna sede coincide con la búsqueda."/>}</div>
      </>}
  </section>;
}

export default { path: '/espacios', label: 'Espacios', available: true, Page } satisfies Feature;
