import { useEffect, useMemo, useState } from 'react';
import { artistSchema, eventsSchema, venueSchema, type Artist, type Event, type Venue } from '@fiavl/contracts';
import { z } from 'zod';
import { Status } from '../../components/Status.tsx';
import { StageBadge, StageButton, StageCard, StageHeading, StageSection } from '../../components/Stage.tsx';
import { getResource } from '../../lib/http.ts';
import type { Feature } from '../types.ts';
import './agenda.css';
import { editionDays, emptyFilters, filterEvents, formatPrice, formatTime, type Filters } from './logic.ts';

type Catalog = { events: Event[]; artists: Artist[]; venues: Venue[] };

function Page() {
  const [catalog, setCatalog] = useState<Catalog>();
  const [failed, setFailed] = useState(false);
  const [attempt, setAttempt] = useState(0);
  const [filters, setFilters] = useState<Filters>(emptyFilters);
  const [selected, setSelected] = useState<string>();

  useEffect(() => {
    const controller = new AbortController();
    const { signal } = controller;
    Promise.all([
      getResource('events', eventsSchema, signal),
      getResource('artists', z.array(artistSchema), signal),
      getResource('venues', z.array(venueSchema), signal)
    ]).then(([events, artists, venues]) => {
      if (!signal.aborted) { setCatalog({ events, artists, venues }); setFailed(false); }
    }).catch(() => { if (!signal.aborted) setFailed(true); });
    return () => controller.abort();
  }, [attempt]);

  const artistName = useMemo(() => new Map(catalog?.artists.map(a => [a.id, a.name])), [catalog]);
  const venueName = useMemo(() => new Map(catalog?.venues.map(v => [v.id, v.name])), [catalog]);
  const names = (e: Event) => e.artistIds.map(id => artistName.get(id) ?? '').join(' ') + ' ' + (venueName.get(e.venueId) ?? '');
  const categories = useMemo(() => [...new Set(catalog?.events.map(e => e.category))].sort(), [catalog]);
  const visible = useMemo(() => catalog ? filterEvents(catalog.events, filters, names) : [], [catalog, filters]);
  const detail = catalog?.events.find(e => e.id === selected);
  const set = (patch: Partial<Filters>) => setFilters(f => ({ ...f, ...patch }));

  return <StageSection className="agenda" aria-labelledby="agenda-title">
    <h1 id="agenda-title" className="stage-heading agenda-title">Programación cultural</h1>
    <p><StageBadge>Prototipo académico no oficial · Datos demo</StageBadge> Edición demo del 12 al 22 de noviembre de 2026, hora de Loja.</p>
    {failed ? <Status message="No se pudo cargar la programación." retry={() => { setFailed(false); setAttempt(n => n + 1); }}/> :
    !catalog ? <Status message="Cargando programación…"/> : <>
      <form className="agenda-filters stage-card" role="search" onSubmit={e => e.preventDefault()}>
        <label>Buscar<input type="search" value={filters.query} onChange={e => set({ query: e.target.value })}/></label>
        <label>Fecha<select value={filters.date} onChange={e => set({ date: e.target.value })}>
          <option value="">Todas</option>{editionDays.map(d => <option key={d} value={d}>{d}</option>)}</select></label>
        <label>Categoría<select value={filters.category} onChange={e => set({ category: e.target.value })}>
          <option value="">Todas</option>{categories.map(c => <option key={c} value={c}>{c}</option>)}</select></label>
        <label>Precio<select value={filters.price} onChange={e => set({ price: e.target.value as Filters['price'] })}>
          <option value="all">Todos</option><option value="free">Gratuito</option><option value="paid">De pago</option></select></label>
        <StageButton onClick={() => setFilters(emptyFilters)}>Limpiar filtros</StageButton>
      </form>
      <p role="status">{visible.length} {visible.length === 1 ? 'evento' : 'eventos'}</p>
      {visible.length === 0 ? <Status message="No hay eventos que coincidan con los filtros."/> :
        <ol className="agenda-list">{visible.map(e => <li key={e.id}><StageCard>
          <img src={e.image} alt="" loading="lazy" width={320}/>
          <StageHeading>{e.title}</StageHeading>
          <p><StageBadge>{e.category}</StageBadge> <StageBadge>{formatPrice(e.priceCents)}</StageBadge></p>
          <p><time dateTime={e.startAt}>{formatTime(e.startAt)}</time> · {venueName.get(e.venueId)}</p>
          <StageButton aria-expanded={selected === e.id} onClick={() => setSelected(selected === e.id ? undefined : e.id)}>
            {selected === e.id ? 'Ocultar detalle' : 'Ver detalle'}<span className="agenda-sr">: {e.title}</span></StageButton>
          {detail?.id === e.id && <div className="agenda-detail">
            <p>{e.description}</p>
            <dl>
              <dt>Disciplina</dt><dd>{e.category}</dd>
              <dt>Horario</dt><dd><time dateTime={e.startAt}>{formatTime(e.startAt)}</time> a <time dateTime={e.endAt}>{formatTime(e.endAt)}</time></dd>
              <dt>Sede</dt><dd>{venueName.get(e.venueId)}</dd>
              <dt>Artistas</dt><dd>{e.artistIds.map(id => artistName.get(id)).filter(Boolean).join(', ') || 'Por confirmar'}</dd>
              <dt>Precio</dt><dd>{formatPrice(e.priceCents)} (USD, demo)</dd>
            </dl>
          </div>}
        </StageCard></li>)}</ol>}
    </>}
  </StageSection>;
}

export default { path: '/agenda', label: 'Agenda', available: true, Page } satisfies Feature;
