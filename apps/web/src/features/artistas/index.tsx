import { useEffect, useId, useMemo, useState } from 'react';
import { artistSchema, eventsSchema, venueSchema, type Artist, type Event, type Venue } from '@fiavl/contracts';
import { z } from 'zod';
import { Status } from '../../components/Status.tsx';
import { StageBadge, StageButton, StageCard, StageHeading, StageSection } from '../../components/Stage.tsx';
import { getResource } from '../../lib/http.ts';
import type { Feature } from '../types.ts';
import './artistas.css';
import { countries, disciplines, emptyFilters, filterArtists, formatWhen, performancesOf, type Filters } from './logic.ts';

type Catalog = { artists: Artist[]; events: Event[]; venues: Venue[] };

function ArtistCard({ artist, catalog }: { artist: Artist; catalog: Catalog }) {
  const [open, setOpen] = useState(false);
  const detailId = useId();
  const shows = useMemo(() => performancesOf(artist.id, catalog.events, catalog.venues), [artist.id, catalog]);
  return <StageCard>
    <img src={artist.image} alt="" loading="lazy" width={320}/>
    <StageHeading>{artist.name}</StageHeading>
    <p><StageBadge>{artist.discipline}</StageBadge><StageBadge>{artist.country}</StageBadge></p>
    <p>{artist.bio}</p>
    <StageButton aria-expanded={open} aria-controls={detailId} onClick={() => setOpen(o => !o)}>
      {open ? 'Ocultar detalle' : 'Ver detalle'}<span className="artistas-sr">: {artist.name}</span>
    </StageButton>
    {open && <div id={detailId} className="artistas-detail" role="region" aria-label={`Detalle de ${artist.name}`}>
      <dl>
        <dt>País</dt><dd>{artist.country}</dd>
        <dt>Disciplina</dt><dd>{artist.discipline}</dd>
        <dt>Biografía</dt><dd>{artist.bio}</dd>
      </dl>
      <h3>Actuaciones</h3>
      {shows.length === 0 ? <p>Este artista no tiene actuaciones programadas.</p> :
        <ul className="artistas-shows">{shows.map(({ event, venue }) => <li key={event.id}>
          <strong>{event.title}</strong><br/>
          <time dateTime={event.startAt}>{formatWhen(event.startAt)}</time>{venue && <> · {venue.name}</>}
        </li>)}</ul>}
    </div>}
  </StageCard>;
}

function Page() {
  const [catalog, setCatalog] = useState<Catalog>();
  const [failed, setFailed] = useState(false);
  const [attempt, setAttempt] = useState(0);
  const [filters, setFilters] = useState<Filters>(emptyFilters);

  useEffect(() => {
    const controller = new AbortController();
    const { signal } = controller;
    Promise.all([
      getResource('artists', z.array(artistSchema), signal),
      getResource('events', eventsSchema, signal),
      getResource('venues', z.array(venueSchema), signal)
    ]).then(([artists, events, venues]) => {
      if (!signal.aborted) { setCatalog({ artists, events, venues }); setFailed(false); }
    }).catch(() => { if (!signal.aborted) setFailed(true); });
    return () => controller.abort();
  }, [attempt]);

  const visible = useMemo(() => catalog ? filterArtists(catalog.artists, filters) : [], [catalog, filters]);
  const set = (patch: Partial<Filters>) => setFilters(f => ({ ...f, ...patch }));

  return <StageSection className="artistas" aria-labelledby="artistas-title">
    <h1 id="artistas-title" className="stage-heading artistas-title">Artistas</h1>
    <p><StageBadge>Prototipo académico no oficial · Datos demo</StageBadge> Quienes actúan en la edición demo del 12 al 22 de noviembre de 2026, hora de Loja.</p>
    {failed ? <Status message="No se pudo cargar el catálogo de artistas." retry={() => { setFailed(false); setAttempt(n => n + 1); }}/> :
    !catalog ? <Status message="Cargando artistas…"/> :
    catalog.artists.length === 0 ? <Status message="Aún no hay artistas en el catálogo."/> : <>
      <form className="artistas-filters" role="search" onSubmit={e => e.preventDefault()}>
        <label>Buscar por nombre<input type="search" value={filters.query} onChange={e => set({ query: e.target.value })}/></label>
        <label>País<select value={filters.country} onChange={e => set({ country: e.target.value })}>
          <option value="">Todos</option>{countries(catalog.artists).map(c => <option key={c} value={c}>{c}</option>)}</select></label>
        <label>Disciplina<select value={filters.discipline} onChange={e => set({ discipline: e.target.value })}>
          <option value="">Todas</option>{disciplines(catalog.artists).map(d => <option key={d} value={d}>{d}</option>)}</select></label>
        <StageButton onClick={() => setFilters(emptyFilters)}>Limpiar filtros</StageButton>
      </form>
      <p role="status">{visible.length} {visible.length === 1 ? 'artista' : 'artistas'}</p>
      {visible.length === 0 ? <Status message="No hay artistas que coincidan con los filtros."/> :
        <ul className="artistas-list">{visible.map(a => <li key={a.id}><ArtistCard artist={a} catalog={catalog}/></li>)}</ul>}
    </>}
  </StageSection>;
}

export default { path: '/artistas', label: 'Artistas', available: true, Page } satisfies Feature;
