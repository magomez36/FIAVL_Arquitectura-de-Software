import { useCallback, useEffect, useRef, useState, type FormEvent } from 'react';
import { eventsSchema, type Event } from '@fiavl/contracts';
import { Status } from '../../components/Status.tsx';
import { StageBadge, StageButton, StageCard, StageHeading, StageSection } from '../../components/Stage.tsx';
import { HttpError, getResource } from '../../lib/http.ts';
import { readLocal, writeLocal } from '../../lib/storage.ts';
import type { Feature } from '../types.ts';
import { postJson } from './client.ts';
import './reservas.css';
import {
  availabilityListSchema, checkQuantity, disponibles, formatWhen, parseStored, plazas, remainingOf, remember, reservableEvents,
  reservationSchema, serializeStored, type Availability, type ReservationDto, type StoredItem
} from './logic.ts';

type Data = { events: Event[]; availability: Availability[] };
type Detail = ReservationDto | 'missing';

const messageOf = (error: unknown) => error instanceof HttpError ? error.message : 'No se pudo conectar con el servidor. Reintenta.';

function Page() {
  const [data, setData] = useState<Data>();
  const [failed, setFailed] = useState(false);
  const [attempt, setAttempt] = useState(0);
  const [mine, setMine] = useState<StoredItem[]>(() => readLocal('reservations', parseStored) ?? []);
  const [storageOk, setStorageOk] = useState(true);
  const [details, setDetails] = useState<Record<string, Detail>>({});
  const [eventId, setEventId] = useState('');
  const [quantity, setQuantity] = useState('1');
  const [error, setError] = useState('');
  const [notice, setNotice] = useState('');
  const [busy, setBusy] = useState(false);
  const [confirmation, setConfirmation] = useState<ReservationDto>();
  const [manual, setManual] = useState('');
  const [manualError, setManualError] = useState('');
  const confirmationHeading = useRef<HTMLHeadingElement>(null);

  useEffect(() => {
    const controller = new AbortController();
    const { signal } = controller;
    Promise.all([
      getResource('events', eventsSchema, signal),
      getResource('reservations/availability', availabilityListSchema, signal)
    ]).then(([events, availability]) => {
      if (!signal.aborted) { setData({ events, availability }); setFailed(false); }
    }).catch(() => { if (!signal.aborted) setFailed(true); });
    return () => controller.abort();
  }, [attempt]);

  const refreshAvailability = useCallback(async () => {
    try {
      const availability = await getResource('reservations/availability', availabilityListSchema);
      setData(current => current && { ...current, availability });
    } catch { /* La próxima acción o el reintento vuelve a consultar. */ }
  }, []);

  // Estado de cada referencia guardada, siempre leído del servidor.
  useEffect(() => {
    const controller = new AbortController();
    for (const { reference } of mine) {
      getResource('reservations/' + reference, reservationSchema, controller.signal)
        .then(detail => setDetails(d => ({ ...d, [reference]: detail })))
        .catch(e => { if (e instanceof HttpError && e.status === 404) setDetails(d => ({ ...d, [reference]: 'missing' })); });
    }
    return () => controller.abort();
    // Solo al abrir: las altas y cancelaciones actualizan details directamente.
  }, []);

  useEffect(() => { if (confirmation) confirmationHeading.current?.focus(); }, [confirmation]);

  const persist = (items: StoredItem[]) => {
    setMine(items);
    setStorageOk(writeLocal('reservations', serializeStored(items)));
  };

  const titleOf = (id: string) => data?.events.find(e => e.id === id)?.title ?? id;
  const reservable = data ? reservableEvents(data.events) : [];
  const selectedRemaining = data ? remainingOf(data.availability, eventId) : 0;

  async function submit(e: FormEvent) {
    e.preventDefault();
    setNotice('');
    if (!eventId) return setError('Elige un evento para reservar.');
    const check = checkQuantity(quantity, selectedRemaining);
    if (!check.ok) return setError(check.message);
    setError('');
    setBusy(true);
    try {
      const created = await postJson('reservations', { eventId, quantity: check.quantity }, reservationSchema);
      setConfirmation(created);
      setDetails(d => ({ ...d, [created.reference]: created }));
      persist(remember(mine, { reference: created.reference, eventId: created.eventId, quantity: created.quantity }));
      setQuantity('1');
      await refreshAvailability();
    } catch (failure) {
      setError(messageOf(failure));
      if (failure instanceof HttpError) await refreshAvailability();
    } finally { setBusy(false); }
  }

  async function cancel(reference: string, fromManual = false) {
    setNotice('');
    setBusy(true);
    try {
      const done = await postJson(`reservations/${reference}/cancel`, undefined, reservationSchema);
      setDetails(d => ({ ...d, [reference]: done }));
      if (confirmation?.reference === reference) setConfirmation(done);
      setNotice(`Reserva de ${titleOf(done.eventId)} cancelada. Las plazas volvieron a estar disponibles.`);
      if (fromManual) { setManual(''); setManualError(''); }
      await refreshAvailability();
    } catch (failure) {
      const message = failure instanceof HttpError && failure.status === 404 ? 'No existe una reserva con esa referencia.'
        : failure instanceof HttpError && failure.code === 'INVALID_ID' ? 'La referencia no tiene el formato correcto.' : messageOf(failure);
      if (fromManual) setManualError(message); else setError(message);
    } finally { setBusy(false); }
  }

  return <StageSection className="reservas" aria-labelledby="reservas-title">
    <h1 id="reservas-title" className="stage-heading reservas-title">Reservas</h1>
    <p><StageBadge>Prototipo académico no oficial · Datos demo</StageBadge> Reserva demostrativa; no equivale a una entrada oficial. Sin cuentas, pagos ni datos personales. Horarios de Loja (America/Guayaquil).</p>
    <p className="reservas-live" role="status">{notice}</p>
    {failed ? <Status message="No se pudo cargar la disponibilidad de reservas." retry={() => { setFailed(false); setAttempt(n => n + 1); }}/> :
    !data ? <Status message="Cargando disponibilidad…"/> :
    reservable.length === 0 ? <Status message="Aún no hay eventos con reserva disponible."/> : <>
      <h2 className="stage-heading">Plazas disponibles</h2>
      <ul className="reservas-list">{reservable.map(ev => {
        const remaining = remainingOf(data.availability, ev.id);
        return <li key={ev.id}><StageCard>
          <StageHeading>{ev.title}</StageHeading>
          <p><time dateTime={ev.startAt}>{formatWhen(ev.startAt)}</time></p>
          <p>{remaining === 0 ? <StageBadge className="reservas-out">Aforo agotado</StageBadge> :
            <strong>{disponibles(remaining)}</strong>} <span>de {ev.capacity}</span></p>
        </StageCard></li>;
      })}</ul>

      <form className="reservas-panel" onSubmit={submit} noValidate aria-labelledby="reservas-form-title">
        <h2 id="reservas-form-title" className="stage-heading">Reservar plazas</h2>
        <label>Evento
          <select value={eventId} onChange={e => { setEventId(e.target.value); setError(''); }} aria-describedby={error ? 'reservas-error' : undefined}>
            <option value="">Elige un evento</option>
            {reservable.map(ev => {
              const remaining = remainingOf(data.availability, ev.id);
              return <option key={ev.id} value={ev.id} disabled={remaining === 0}>
                {ev.title} · {remaining === 0 ? 'Aforo agotado' : plazas(remaining)}</option>;
            })}
          </select>
        </label>
        <label>Cantidad de plazas
          <input type="number" inputMode="numeric" min={1} max={10} step={1} value={quantity}
            onChange={e => { setQuantity(e.target.value); setError(''); }} aria-describedby={error ? 'reservas-error' : undefined}/>
        </label>
        {error && <p id="reservas-error" className="reservas-error" role="alert">{error}</p>}
        <StageButton type="submit" disabled={busy}>{busy ? 'Reservando…' : 'Reservar'}</StageButton>
      </form>
    </>}

    {confirmation && <div className="reservas-panel reservas-confirmation">
      <h2 ref={confirmationHeading} tabIndex={-1} className="stage-heading">
        {confirmation.status === 'active' ? 'Reserva demostrativa creada' : 'Reserva cancelada'}</h2>
      <p>{titleOf(confirmation.eventId)} · {plazas(confirmation.quantity)}</p>
      <p>Referencia de confirmación (guárdala: es lo único que permite cancelar):</p>
      <p><code className="reservas-ref">{confirmation.reference}</code></p>
      <p>Reserva demostrativa; no equivale a una entrada oficial.</p>
    </div>}

    <div className="reservas-panel" role="region" aria-labelledby="reservas-mine-title">
      <h2 id="reservas-mine-title" className="stage-heading">Mis reservas en este navegador</h2>
      {!storageOk && <p role="alert">Este navegador no permite guardar tus referencias. Anota la referencia de cada reserva para poder cancelarla.</p>}
      {mine.length === 0 ? <p>No hay reservas guardadas en este navegador.</p> : <ul className="reservas-mine">
        {mine.map(item => {
          const detail = details[item.reference];
          const state = detail === 'missing' ? 'Reserva no encontrada' : detail?.status === 'cancelled' ? 'Cancelada' : detail ? 'Activa' : 'Consultando…';
          return <li key={item.reference}>
            <strong>{titleOf(item.eventId)}</strong> · {plazas(item.quantity)} · <StageBadge className="reservas-state">{state}</StageBadge>
            <br/><code className="reservas-ref">{item.reference}</code>
            <div className="reservas-actions">
              {detail && detail !== 'missing' && detail.status === 'active' &&
                <StageButton disabled={busy} onClick={() => cancel(item.reference)}>Cancelar reserva<span className="reservas-sr">: {titleOf(item.eventId)}</span></StageButton>}
              {(detail === 'missing' || (detail && detail.status === 'cancelled')) &&
                <StageButton onClick={() => persist(mine.filter(i => i.reference !== item.reference))}>Quitar de la lista<span className="reservas-sr">: {titleOf(item.eventId)}</span></StageButton>}
            </div>
          </li>;
        })}
      </ul>}
      <form className="reservas-manual" onSubmit={e => { e.preventDefault(); if (manual.trim()) void cancel(manual.trim(), true); else setManualError('Escribe la referencia de la reserva.'); }} noValidate>
        <label>Cancelar con una referencia
          <input type="text" autoComplete="off" spellCheck={false} value={manual} onChange={e => { setManual(e.target.value); setManualError(''); }}
            aria-describedby={manualError ? 'reservas-manual-error' : undefined}/>
        </label>
        {manualError && <p id="reservas-manual-error" className="reservas-error" role="alert">{manualError}</p>}
        <StageButton type="submit" disabled={busy}>Cancelar con referencia</StageButton>
      </form>
    </div>
  </StageSection>;
}

export default { path: '/reservas', label: 'Reservas', available: true, Page } satisfies Feature;
