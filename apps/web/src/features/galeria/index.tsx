import { useCallback, useEffect, useMemo, useRef, useState, type KeyboardEvent } from 'react';
import { venueSchema, type Venue } from '@fiavl/contracts';
import { z } from 'zod';
import { Status } from '../../components/Status.tsx';
import { StageBadge, StageButton, StageCard, StageSection } from '../../components/Stage.tsx';
import { getResource } from '../../lib/http.ts';
import type { Feature } from '../types.ts';
import './galeria.css';
import {
  CATEGORIES, buildItems, categoryCounts, filterItems, isLocalSrc, neighbour, selectionIn,
  type CategoryId, type Credit, type GalleryItem
} from './logic.ts';

const venuesSchema = z.array(venueSchema);

type VenueState =
  | { kind: 'loading' }
  | { kind: 'failed'; message: string }
  | { kind: 'ready'; venues: Venue[] };

function failureMessage(error: unknown) {
  return error instanceof z.ZodError
    ? 'Las sedes llegaron con un formato no válido. Las imágenes locales siguen disponibles.'
    : 'No se pudo cargar el catálogo de sedes. Las imágenes locales siguen disponibles.';
}

function CreditLine({ credit }: { credit: Credit }) {
  if (credit.kind === 'prototype') return <small className="galeria-credit">{credit.text}</small>;
  return <small className="galeria-credit">Foto: {credit.author} · <a href={credit.sourceUrl} rel="noopener noreferrer">{credit.sourceName}</a> · <a href={credit.licenceUrl} rel="noopener noreferrer">{credit.licence}</a></small>;
}

function Picture({ item, broken, onBroken, className }: {
  item: GalleryItem; broken: boolean; onBroken: (id: string) => void; className: string;
}) {
  if (broken || !isLocalSrc(item.src)) {
    return <div className={className + ' galeria-fallback'} role="img" aria-label={`Imagen no disponible: ${item.alt}`}>
      <span aria-hidden="true">Imagen no disponible<br/>{item.title}</span>
    </div>;
  }
  return <img className={className} src={item.src} alt={item.alt} width={item.width} height={item.height}
    loading="lazy" decoding="async" onError={() => onBroken(item.id)}/>;
}

/** Confina Tab y Shift+Tab dentro del diálogo en lugar de dejar que el foco salte a la interfaz del navegador. */
function trapTab(event: KeyboardEvent<HTMLDialogElement>) {
  if (event.key !== 'Tab') return;
  const stops = [...event.currentTarget.querySelectorAll<HTMLElement>('button:not(:disabled), a[href]')];
  const first = stops[0];
  const last = stops[stops.length - 1];
  if (!first || !last) return;
  const active = document.activeElement;
  if (event.shiftKey && active === first) { event.preventDefault(); last.focus(); }
  else if (!event.shiftKey && active === last) { event.preventDefault(); first.focus(); }
}

function Lightbox({ item, results, broken, onBroken, onSelect, onClose }: {
  item: GalleryItem; results: readonly GalleryItem[]; broken: ReadonlySet<string>;
  onBroken: (id: string) => void; onSelect: (id: string) => void; onClose: () => void;
}) {
  const dialog = useRef<HTMLDialogElement>(null);
  const closeButton = useRef<HTMLButtonElement>(null);
  const previous = neighbour(results, item.id, -1);
  const next = neighbour(results, item.id, 1);
  const position = results.findIndex(r => r.id === item.id) + 1;

  useEffect(() => {
    const node = dialog.current;
    if (node && !node.open) node.showModal();
    closeButton.current?.focus();
    return () => { if (node?.open) node.close(); };
  }, []);

  // Si el botón enfocado queda deshabilitado en un extremo, el foco pasa a Cerrar.
  useEffect(() => {
    const active = document.activeElement;
    if (active instanceof HTMLButtonElement && active.disabled) closeButton.current?.focus();
  }, [item.id]);

  return <dialog ref={dialog} className="galeria-dialog" aria-labelledby="galeria-dialog-title"
    aria-describedby="galeria-dialog-caption" onClose={onClose} onKeyDown={trapTab}
    onClick={event => { if (event.target === event.currentTarget) dialog.current?.close(); }}>
    <div className="galeria-dialog-body">
      <div className="galeria-dialog-head">
        <h2 id="galeria-dialog-title">{item.title}</h2>
        <button ref={closeButton} type="button" className="stage-button" onClick={() => dialog.current?.close()}>Cerrar</button>
      </div>
      <figure>
        <Picture item={item} broken={broken.has(item.id)} onBroken={onBroken} className="galeria-large"/>
        <figcaption>
          <p id="galeria-dialog-caption">{item.caption}</p>
          <CreditLine credit={item.credit}/>
        </figcaption>
      </figure>
      <div className="galeria-dialog-nav">
        <StageButton disabled={!previous} onClick={() => previous && onSelect(previous.id)}>Anterior</StageButton>
        <p role="status">Imagen {position} de {results.length}</p>
        <StageButton disabled={!next} onClick={() => next && onSelect(next.id)}>Siguiente</StageButton>
      </div>
    </div>
  </dialog>;
}

function Page() {
  const [venues, setVenues] = useState<VenueState>({ kind: 'loading' });
  const [attempt, setAttempt] = useState(0);
  const [category, setCategory] = useState<CategoryId>('todas');
  const [openId, setOpenId] = useState<string>();
  const [broken, setBroken] = useState<ReadonlySet<string>>(() => new Set());
  const opener = useRef<HTMLElement | null>(null);
  const heading = useRef<HTMLHeadingElement>(null);

  useEffect(() => {
    const controller = new AbortController();
    getResource('venues', venuesSchema, controller.signal)
      .then(list => { if (!controller.signal.aborted) setVenues({ kind: 'ready', venues: list }); })
      .catch((error: unknown) => {
        if (!controller.signal.aborted) setVenues({ kind: 'failed', message: failureMessage(error) });
      });
    return () => controller.abort();
  }, [attempt]);

  const retry = useCallback(() => { setVenues({ kind: 'loading' }); setAttempt(n => n + 1); }, []);
  const markBroken = useCallback((id: string) => setBroken(prev => prev.has(id) ? prev : new Set(prev).add(id)), []);

  const items = useMemo(() => buildItems(venues.kind === 'ready' ? venues.venues : []), [venues]);
  const counts = useMemo(() => categoryCounts(items), [items]);
  const results = useMemo(() => filterItems(items, category), [items, category]);
  const selected = selectionIn(results, openId);
  const venuesPending = venues.kind !== 'ready';
  const emptyVenues = venues.kind === 'ready' && venues.venues.length === 0;

  const close = useCallback(() => {
    setOpenId(undefined);
    queueMicrotask(() => {
      const target = opener.current;
      (target?.isConnected ? target : heading.current)?.focus();
      opener.current = null;
    });
  }, []);

  const choose = (id: CategoryId) => { setCategory(id); setOpenId(undefined); };
  const total = CATEGORIES.find(c => c.id === category)?.label ?? '';

  return <section className="interior galeria">
    <h1>Galería</h1>
    <p className="galeria-lede">Imágenes de la edición demo: ilustraciones del prototipo, fotografías de ambientación y un archivo documental de Loja. Proyecto académico no oficial; no es la galería del festival.</p>
    <StageSection aria-labelledby="galeria-coleccion">
      <h2 id="galeria-coleccion" className="stage-heading" ref={heading} tabIndex={-1}>Colección</h2>
      <div role="group" aria-label="Filtrar por categoría" className="galeria-filters">
        {CATEGORIES.map(c => {
          const unknown = c.id === 'sedes' && venuesPending;
          return <button key={c.id} type="button" className="galeria-chip" aria-pressed={category === c.id}
            title={c.hint} onClick={() => choose(c.id)}>
            {c.label}{unknown ? '' : ` (${counts[c.id]})`}
          </button>;
        })}
      </div>
      <p className="galeria-count" role="status">
        {category === 'sedes' && venuesPending ? 'Las sedes aún no están disponibles.' :
          `Mostrando ${results.length} de ${items.length} imágenes · ${total}`}
      </p>
      {venues.kind === 'loading' && <Status message="Cargando sedes…"/>}
      {venues.kind === 'failed' && <Status message={venues.message} retry={retry}/>}
      {emptyVenues && category !== 'ilustraciones' && category !== 'ambientacion' && category !== 'archivo' &&
        <Status message="El catálogo no tiene sedes todavía. Las demás imágenes siguen disponibles."/>}
      {results.length === 0 && !venuesPending ? <div className="galeria-empty">
        <p>No hay imágenes en esta categoría.</p>
        <StageButton onClick={() => choose('todas')}>Ver todas las imágenes</StageButton>
      </div> : <ul className="galeria-grid">
        {results.map(item => <li key={item.id}>
          <StageCard>
            <div className="galeria-media">
              <Picture item={item} broken={broken.has(item.id)} onBroken={markBroken} className="galeria-thumb"/>
              <StageBadge>{CATEGORIES.find(c => c.id === item.category)?.label}</StageBadge>
            </div>
            <div className="galeria-card-body">
              <h3>{item.title}</h3>
              <p>{item.caption}</p>
              <CreditLine credit={item.credit}/>
              <StageButton aria-haspopup="dialog" aria-label={`Ampliar: ${item.title}`}
                onClick={event => { opener.current = event.currentTarget; setOpenId(item.id); }}>Ampliar</StageButton>
            </div>
          </StageCard>
        </li>)}
      </ul>}
    </StageSection>
    {selected && <Lightbox item={selected} results={results} broken={broken} onBroken={markBroken}
      onSelect={setOpenId} onClose={close}/>}
  </section>;
}

export default { path: '/galeria', label: 'Galería', available: true, Page } satisfies Feature;
