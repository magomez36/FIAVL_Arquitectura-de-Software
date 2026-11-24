import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { eventsSchema, venueSchema, type Event, type Venue } from '@fiavl/contracts';
import { z } from 'zod';
import { Status } from '../../components/Status.tsx';
import { StageBadge, StageButton, StageCard, StageHeading, StageSection } from '../../components/Stage.tsx';
import { getResource } from '../../lib/http.ts';
import { readLocal, writeLocal } from '../../lib/storage.ts';
import type { Feature } from '../types.ts';
import './mi-agenda.css';
import { addId, conflictsOf, formatTime, removeId, resolveAgenda, sortEvents, parseIds } from './logic.ts';

type Catalog = { events: Event[]; venues: Venue[] };

function Page() {
  const [catalog, setCatalog] = useState<Catalog>();
  const [failed, setFailed] = useState(false);
  const [attempt, setAttempt] = useState(0);
  const [ids, setIds] = useState<string[]>(() => readLocal('agenda', parseIds) ?? []);
  const [saveFailed, setSaveFailed] = useState(false);

  useEffect(() => {
    const controller = new AbortController();
    const { signal } = controller;
    Promise.all([getResource('events', eventsSchema, signal), getResource('venues', z.array(venueSchema), signal)])
      .then(([events, venues]) => { if (!signal.aborted) { setCatalog({ events, venues }); setFailed(false); } })
      .catch(() => { if (!signal.aborted) setFailed(true); });
    return () => controller.abort();
  }, [attempt]);

  const venueName = useMemo(() => new Map(catalog?.venues.map(v => [v.id, v.name])), [catalog]);
  const { found, missing } = useMemo(() => resolveAgenda(ids, catalog?.events ?? []), [ids, catalog]);
  const update = (next: string[]) => { setIds(next); setSaveFailed(!writeLocal('agenda', next)); };

  return <StageSection className="mi-agenda" aria-labelledby="mi-agenda-title">
    <h1 id="mi-agenda-title" className="stage-heading mi-agenda-title">Mi agenda</h1>
    <p><StageBadge>Prototipo académico no oficial · Datos demo</StageBadge> Tus eventos se guardan solo en este navegador.</p>
    {saveFailed && <p role="alert" className="mi-agenda-notice">No se pudo guardar tu agenda en este navegador. Tus cambios se perderán al recargar.</p>}
    {failed ? <Status message="No se pudo cargar la programación." retry={() => { setFailed(false); setAttempt(n => n + 1); }}/> :
    !catalog ? <Status message="Cargando programación…"/> : <>
      {missing.length > 0 && <div role="status" className="mi-agenda-notice">
        <p>{missing.length} {missing.length === 1 ? 'evento guardado ya no existe' : 'eventos guardados ya no existen'} en el catálogo demo.</p>
        <StageButton onClick={() => update(ids.filter(id => !missing.includes(id)))}>Quitar los que no existen</StageButton>
      </div>}
      <StageHeading>Tu programa</StageHeading>
      {found.length === 0 ? <div className="mi-agenda-notice">
        <p>Tu agenda está vacía. Elige eventos más abajo o explora la <Link className="action" to="/agenda">programación cultural</Link>.</p>
      </div> : <ol className="mi-agenda-list" aria-label="Eventos de mi agenda">{found.map(e => {
        const clashes = conflictsOf(e, found);
        return <li key={e.id}><StageCard>
          <h3 className="mi-agenda-card-title">{e.title}</h3>
          <p><StageBadge>{e.category}</StageBadge></p>
          <p><time dateTime={e.startAt}>{formatTime(e.startAt)}</time> · {venueName.get(e.venueId)}</p>
          {clashes.length > 0 && <p role="status" className="mi-agenda-conflict">Se solapa con: {clashes.map(c => c.title).join(', ')}.</p>}
          <StageButton aria-label={`Quitar: ${e.title}`} onClick={() => update(removeId(ids, e.id))}>Quitar</StageButton>
        </StageCard></li>;
      })}</ol>}
      <StageHeading>Agregar eventos</StageHeading>
      {catalog.events.length === 0 ? <Status message="El catálogo no tiene eventos por ahora."/> :
      <ol className="mi-agenda-list" aria-label="Eventos disponibles">{sortEvents(catalog.events).map(e => {
        const saved = ids.includes(e.id);
        return <li key={e.id}><StageCard>
          <h3 className="mi-agenda-card-title">{e.title}</h3>
          <p><time dateTime={e.startAt}>{formatTime(e.startAt)}</time> · {venueName.get(e.venueId)}</p>
          <StageButton disabled={saved} aria-label={`${saved ? 'Ya está en tu agenda' : 'Agregar'}: ${e.title}`} onClick={() => update(addId(ids, e.id))}>
            {saved ? 'Ya está en tu agenda' : 'Agregar'}</StageButton>
        </StageCard></li>;
      })}</ol>}
    </>}
  </StageSection>;
}

export default { path: '/mi-agenda', label: 'Mi agenda', available: true, Page } satisfies Feature;
