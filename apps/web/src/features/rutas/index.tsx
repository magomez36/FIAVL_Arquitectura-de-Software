import { useEffect, useState } from 'react';
import { type Venue, venueSchema } from '@fiavl/contracts';
import { z } from 'zod';
import { Status } from '../../components/Status.tsx';
import { getResource } from '../../lib/http.ts';
import type { Feature } from '../types.ts';
import { itinerarios } from './itinerarios.ts';

const venuesSchema = z.array(venueSchema);

function Recorrido({ venues }: { venues: Venue[] }) {
  const [selection, setSelection] = useState(0);
  const [position, setPosition] = useState(0);
  const recorrido = itinerarios[selection];
  const stops = recorrido.stops.map(id => venues.find(venue => venue.id === id));
  const venue = stops[position];
  return <>
    <label className="block font-bold" htmlFor="recorrido">Elegir recorrido</label>
    <select id="recorrido" className="mt-2 mb-4 max-w-full rounded border bg-white p-3"
      value={selection} onChange={event => {
        setSelection(Number(event.target.value));
        setPosition(0);
      }}>
      {itinerarios.map((item, i) => <option key={item.name} value={i}>{item.name}</option>)}
    </select>
    <p className="mb-6 max-w-prose">{recorrido.purpose}</p>
    <div className="grid items-start gap-6 md:grid-cols-[1fr_2fr]">
      <section aria-label="Secuencia del recorrido">
        <h2 className="mb-2 text-2xl">Paradas</h2>
        <ol className="list-decimal space-y-2 pl-6">{stops.map((stop, i) =>
          <li key={recorrido.stops[i]} aria-current={position === i ? 'step' : undefined}
            className={position === i ? 'font-bold text-[var(--accent)]' : undefined}>
            {stop?.name ?? 'Sede ausente'}
          </li>)}</ol>
      </section>
      <div>
        <article className="card-body" aria-live="polite" aria-atomic="true">
          <p className="schedule">Parada {position + 1} de {stops.length}</p>
          {venue ? <>
            <h2 className="my-2 text-3xl">{venue.name}</h2>
            <img src={venue.image} alt="" className="my-4 max-h-40 w-full rounded object-cover"/>
            <p>{venue.description}</p>
            <dl className="mt-4">
              <dt className="font-bold">Dirección demo</dt><dd>{venue.address}</dd>
              <dt className="mt-3 font-bold">Acceso demo</dt><dd>{venue.accessibilityNotes}</dd>
            </dl>
          </> : <p>Esta sede no figura en el catálogo.</p>}
        </article>
        <div className="mt-4 flex flex-wrap gap-3">
          <button className="action disabled:opacity-50" disabled={position === 0}
            onClick={() => setPosition(position - 1)}>Parada anterior</button>
          <button className="action disabled:opacity-50" disabled={position === stops.length - 1}
            onClick={() => setPosition(position + 1)}>Siguiente parada</button>
        </div>
      </div>
    </div>
  </>;
}

function Page() {
  const [venues, setVenues] = useState<Venue[]>();
  const [failed, setFailed] = useState(false);
  const [attempt, setAttempt] = useState(0);
  useEffect(() => {
    const controller = new AbortController();
    getResource('venues', venuesSchema, controller.signal).then(result => {
      if (!controller.signal.aborted) setVenues(result);
    }).catch(() => {
      if (!controller.signal.aborted) setFailed(true);
    });
    return () => controller.abort();
  }, [attempt]);

  return <section className="interior">
    <h1>Recorridos culturales</h1>
    <p className="mb-6 max-w-prose">Explora las sedes de la edición demo por tema. Las direcciones y notas de acceso son ilustrativas.</p>
    {failed ? <Status message="No se pudieron cargar las sedes." retry={() => {
      setFailed(false);
      setAttempt(value => value + 1);
    }}/> : !venues ? <Status message="Cargando sedes…"/> : venues.length ?
      <Recorrido venues={venues}/> : <Status message="Aún no hay sedes en el catálogo."/>}
  </section>;
}

export default { path: '/rutas', label: 'Rutas', available: true, Page } satisfies Feature;
