import { useEffect, useState, type FormEvent } from 'react';
import { feedbackInputSchema, feedbackReceiptSchema, feedbackSummarySchema, type FeedbackSummary } from '@fiavl/contracts';
import { Status } from '../../components/Status.tsx';
import { StageButton, StageHeading, StageSection } from '../../components/Stage.tsx';
import { getResource } from '../../lib/http.ts';
import type { Feature } from '../types.ts';

const stars = [1, 2, 3, 4, 5];

function Summary({ revision }: { revision: number }) {
  const [summary, setSummary] = useState<FeedbackSummary>();
  const [failed, setFailed] = useState(false);
  const [attempt, setAttempt] = useState(0);
  useEffect(() => {
    const controller = new AbortController();
    getResource('feedback/summary', feedbackSummarySchema, controller.signal).then(data => {
      if (!controller.signal.aborted) { setSummary(data); setFailed(false); }
    }).catch(() => { if (!controller.signal.aborted) setFailed(true); });
    return () => controller.abort();
  }, [revision, attempt]);
  return <section className="stage-results" aria-label="Resumen de la encuesta">
    <StageHeading>La voz del público</StageHeading>
    {failed ? <Status message="No se pudo leer el resumen." retry={() => {
      setFailed(false); setSummary(undefined); setAttempt(n => n + 1);
    }}/> : !summary ? <Status message="Cargando resultados…"/> : <>
      <p>Respuestas recibidas: {summary.total}</p>
      <p className="stage-average">{summary.average === null ? 'Aún no hay valoraciones.' :
        'Promedio: ' + summary.average.toLocaleString('es-EC', { minimumFractionDigits: 1 }) + ' de 5'}</p>
      <ol>{summary.distribution.map((count, i) => <li key={i}>
        <span>{i + 1} {i === 0 ? 'estrella' : 'estrellas'}</span>
        <meter aria-label={'Proporción con ' + (i + 1) + ' estrellas'} value={count} max={summary.total || 1}/>
        <strong>{count}</strong>
      </li>)}</ol>
    </>}
  </section>;
}

function Page() {
  const [rating, setRating] = useState<number>();
  const [comment, setComment] = useState('');
  const [sending, setSending] = useState(false);
  const [error, setError] = useState('');
  const [confirmed, setConfirmed] = useState(false);
  const [revision, setRevision] = useState(0);

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (sending) return;
    const input = feedbackInputSchema.safeParse({ rating, comment });
    if (!input.success) { setError('Elige de 1 a 5 estrellas y revisa el límite del comentario.'); return; }
    setSending(true);
    setError('');
    try {
      const response = await fetch('/api/feedback', { method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(input.data) });
      if (response.status !== 201) throw new Error();
      feedbackReceiptSchema.parse(await response.json());
      setConfirmed(true);
      setRevision(n => n + 1);
    } catch {
      setError('No pudimos confirmar el envío. Puedes volver a intentarlo.');
    } finally { setSending(false); }
  }

  return <StageSection className="interior stage-survey">
    <div className="festival-inner-hero festival-survey-head"><p className="festival-label">A la salida del teatro</p>
      <h1>Tu experiencia en Loja</h1><p>¿Qué te dejó esta edición demo? Comparte tu valoración con el público del prototipo.</p>
      <small>Fotografía de ambientación · Monica Silvestre</small></div>
    <div className="stage-survey-grid">
      {confirmed ? <div role="status" className="stage-form"><StageHeading>Gracias por compartir tu experiencia.</StageHeading>
        <p>Tu valoración ya forma parte del resumen.</p></div> :
        <form className="stage-form" onSubmit={submit}>
          <fieldset disabled={sending}><legend>¿Cómo valorarías la experiencia?</legend>
            <div className="stage-ratings">{stars.map(n => <label key={n}>
              <input type="radio" name="rating" required value={n} checked={rating === n}
                aria-label={n + (n === 1 ? ' estrella' : ' estrellas')} onChange={() => setRating(n)}/>{n} ★
            </label>)}</div>
          </fieldset>
          <label htmlFor="comentario">Comentario opcional</label>
          <p id="ayuda">Hasta 500 caracteres. Omite nombres y datos de contacto.</p>
          <textarea id="comentario" rows={4} maxLength={500} disabled={sending} aria-describedby="ayuda"
            value={comment} onChange={event => setComment(event.target.value)}/>
          {error && <p role="alert">{error}</p>}
          <StageButton type="submit" disabled={sending}>{sending ? 'Enviando…' : 'Enviar valoración'}</StageButton>
        </form>}
      <Summary revision={revision}/>
    </div>
  </StageSection>;
}

export default { path: '/opiniones', label: 'Opiniones', available: true, Page } satisfies Feature;
