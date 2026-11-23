import { useEffect, useMemo, useState } from 'react';
import { venueSchema, type Venue } from '@fiavl/contracts';
import { z } from 'zod';
import { Status } from '../../components/Status.tsx';
import { StageBadge, StageCard, StageHeading, StageSection } from '../../components/Stage.tsx';
import { getResource } from '../../lib/http.ts';
import { readLocal, writeLocal } from '../../lib/storage.ts';
import type { Feature } from '../types.ts';
import './accesibilidad.css';
import {
  contrastLabels, contrasts, defaultPreferences, filterVenues, isDefault, parsePreferences, textSizeLabels, textSizes,
  type Contrast, type Preferences, type TextSize
} from './logic.ts';

const venuesSchema = z.array(venueSchema);
type Restore = 'restored' | 'corrupt' | 'none';

/** readLocal oculta los fallos de parseo; se marca aquí para distinguir «dañado» de «sin datos». */
function restore(): { prefs: Preferences; restore: Restore } {
  let corrupt = false;
  const stored = readLocal('accessibility', value => {
    try { return parsePreferences(value); } catch (error) { corrupt = true; throw error; }
  });
  if (stored) return { prefs: stored, restore: 'restored' };
  return { prefs: defaultPreferences, restore: corrupt ? 'corrupt' : 'none' };
}

function VenueCard({ venue }: { venue: Venue }) {
  return <li><StageCard aria-labelledby={`sede-${venue.id}`}>
    <StageBadge>Dato demo</StageBadge>
    <h3 id={`sede-${venue.id}`}>{venue.name}</h3>
    <dl>
      <dt>Dirección demo</dt><dd>{venue.address}</dd>
      <dt>Condiciones de acceso demo</dt><dd>{venue.accessibilityNotes}</dd>
    </dl>
  </StageCard></li>;
}

function Page() {
  const [initial] = useState(restore);
  const [prefs, setPrefs] = useState(initial.prefs);
  const [saveFailed, setSaveFailed] = useState(false);
  const [message, setMessage] = useState(initial.restore === 'restored' ? 'Preferencias restauradas desde este navegador.' : '');
  const [venues, setVenues] = useState<Venue[]>();
  const [failed, setFailed] = useState(false);
  const [attempt, setAttempt] = useState(0);
  const [query, setQuery] = useState('');

  useEffect(() => {
    const controller = new AbortController();
    getResource('venues', venuesSchema, controller.signal).then(list => {
      if (!controller.signal.aborted) setVenues(list);
    }).catch(() => {
      if (!controller.signal.aborted) setFailed(true);
    });
    return () => controller.abort();
  }, [attempt]);

  function update(next: Preferences, text: string) {
    setPrefs(next);
    const saved = writeLocal('accessibility', next);
    setSaveFailed(!saved);
    setMessage(text);
  }
  const chooseSize = (textSize: TextSize) => update({ ...prefs, textSize },
    `Tamaño del texto: ${textSizeLabels[textSize]}.`);
  const chooseContrast = (contrast: Contrast) => update({ ...prefs, contrast },
    `Contraste: ${contrastLabels[contrast]}.`);
  const reset = () => update(defaultPreferences, 'Preferencias restablecidas a los valores predeterminados.');

  const matches = useMemo(() => venues ? filterVenues(venues, query) : [], [venues, query]);

  return <section className="interior">
    <div className="a11y-guide" data-text-size={prefs.textSize} data-contrast={prefs.contrast}>
      <h1>Guía de accesibilidad</h1>
      <p>Consulta las condiciones de acceso que registra el catálogo demo de cada sede y ajusta la lectura de esta página.</p>
      <p className="a11y-notice" role="note"><strong>Prototipo académico.</strong> Los datos de las sedes son demostrativos:
        no son certificaciones oficiales ni compromisos del festival. Antes de visitar una sede, confirma sus condiciones reales
        directamente con ella.</p>

      <StageSection aria-labelledby="a11y-lectura">
        <StageHeading id="a11y-lectura">Ayudas de lectura de esta página</StageHeading>
        <p>Estos ajustes solo cambian esta guía y sus controles; no modifican el resto del sitio ni sustituyen un lector de
          pantalla o los ajustes de tu navegador. No implican conformidad WCAG certificada.</p>
        <div className="a11y-prefs">
          <fieldset>
            <legend>Tamaño del texto</legend>
            <div className="a11y-options">{textSizes.map(size => <label key={size}>
              <input type="radio" name="a11y-size" value={size} checked={prefs.textSize === size}
                onChange={() => chooseSize(size)}/>{textSizeLabels[size]}</label>)}</div>
          </fieldset>
          <fieldset>
            <legend>Contraste</legend>
            <div className="a11y-options">{contrasts.map(c => <label key={c}>
              <input type="radio" name="a11y-contrast" value={c} checked={prefs.contrast === c}
                onChange={() => chooseContrast(c)}/>{contrastLabels[c]}</label>)}</div>
          </fieldset>
          <p data-testid="a11y-current">Estado actual: texto {textSizeLabels[prefs.textSize].toLowerCase()}, contraste {contrastLabels[prefs.contrast].toLowerCase()}.</p>
          <button type="button" className="a11y-btn" onClick={reset} disabled={isDefault(prefs)}>Restablecer preferencias</button>
          <p role="status" aria-live="polite" className="a11y-muted">{message}</p>
          {saveFailed && <p className="a11y-notice a11y-warning" role="alert">No se pudieron guardar las preferencias en este
            navegador (almacenamiento bloqueado). Se aplican ahora, pero se perderán al recargar.</p>}
          {initial.restore === 'corrupt' && <p className="a11y-notice a11y-warning" role="note">Las preferencias guardadas
            no eran válidas y se usaron los valores predeterminados.</p>}
        </div>
      </StageSection>

      <StageSection aria-labelledby="a11y-sedes">
        <StageHeading id="a11y-sedes">Condiciones de acceso por sede</StageHeading>
        <div className="a11y-two">
          <div><h3>Información física de las sedes</h3>
            <p>Proviene únicamente del catálogo demo: nombre, dirección y notas de acceso. La guía no añade ni deduce rampas,
              ascensores u otras características que el registro no mencione.</p></div>
          <div><h3>Herramientas de lectura</h3>
            <p>Son los controles de tamaño y contraste de arriba. Afectan a cómo lees esta página, no a las sedes.</p></div>
        </div>
        {failed ? <Status message="No se pudo cargar el catálogo de sedes." retry={() => {
          setFailed(false);
          setAttempt(value => value + 1);
        }}/> : !venues ? <Status message="Cargando sedes…"/> : !venues.length ?
          <Status message="Aún no hay sedes en el catálogo."/> : <>
            <label htmlFor="a11y-buscar"><strong>Buscar por nombre, dirección o notas de acceso</strong></label>
            <input id="a11y-buscar" type="search" className="a11y-search" value={query} autoComplete="off"
              onChange={e => setQuery(e.target.value)} aria-describedby="a11y-count"/>
            <p id="a11y-count" role="status" aria-live="polite" className="a11y-muted">
              {matches.length ? `${matches.length} de ${venues.length} sedes.` : ''}</p>
            {matches.length ? <ul className="a11y-grid" aria-label="Sedes">{matches.map(v => <VenueCard key={v.id} venue={v}/>)}</ul>
              : <Status message="Ninguna sede coincide con la búsqueda."/>}
          </>}
      </StageSection>
    </div>
  </section>;
}

export default { path: '/accesibilidad', label: 'Accesibilidad', available: true, Page } satisfies Feature;
