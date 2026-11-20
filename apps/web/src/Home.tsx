import { useEffect, useState } from 'react';
import { ArrowDown, CalendarDays, MapPin } from 'lucide-react';
import { eventsSchema, type Event } from '@fiavl/contracts';
import { getResource } from './lib/http.ts';
import { Status } from './components/Status.tsx';

const date = new Intl.DateTimeFormat('es-EC', { day: 'numeric', month: 'short', timeZone: 'America/Guayaquil' });
const time = new Intl.DateTimeFormat('es-EC', { hour: '2-digit', minute: '2-digit', hourCycle: 'h23', timeZone: 'America/Guayaquil' });

function EventCard({ event }: { event: Event }) {
  const start = new Date(event.startAt);
  return <article>
    <div className="card-art"><img src={event.image} alt="" /><span className="category">{event.category}</span></div>
    <div className="card-body"><p className="schedule"><CalendarDays size={15} aria-hidden="true" />
      <time dateTime={event.startAt}>{date.format(start)} · {time.format(start)}</time></p>
      <h3>{event.title}</h3><p>{event.description}</p>
    </div>
  </article>;
}

function Selection() {
  const [attempt, setAttempt] = useState(0);
  const [items, setItems] = useState<Event[]>();
  const [failed, setFailed] = useState(false);
  useEffect(() => {
    const controller = new AbortController();
    getResource('events', eventsSchema, controller.signal).then(events => {
      if (!controller.signal.aborted) setItems(events.slice(0, 3));
    }).catch(() => { if (!controller.signal.aborted) setFailed(true); });
    return () => controller.abort();
  }, [attempt]);
  return <section className="selection" id="seleccion" tabIndex={-1} aria-labelledby="selection-title">
    <p className="kicker"><span /> Programación</p>
    <h2 id="selection-title">Selección del festival</h2>
    {failed ? <Status message="No se pudo cargar la programación." retry={() => { setFailed(false); setAttempt(attempt + 1); }} />
      : items === undefined ? <Status message="Cargando programación…" />
      : items.length === 0 ? <Status message="Aún no hay eventos en la programación." />
      : <div className="cards">{items.map(event => <EventCard key={event.id} event={event} />)}</div>}
  </section>;
}

export function Home() {
  return <>
    <section className="hero" aria-labelledby="hero-title">
      <div className="hero-copy">
        <p className="kicker"><span /> Artes vivas · Edición 2026</p>
        <h1 id="hero-title">Loja en<br/><em>escena.</em></h1>
        <p className="intro">Descubre la música, la danza y el teatro del Festival Internacional de Artes Vivas de Loja.</p>
        <div className="details"><span><CalendarDays size={17}/>12–22 nov 2026</span><span><MapPin size={17}/>Loja, Ecuador</span></div>
        <a className="action" href="#seleccion">Ver selección <ArrowDown size={17}/></a>
      </div>
      <figure className="poster"><img src="/art/cartel.svg" alt="Ilustración de una bailarina entre telones, con montañas al fondo."/>
        <figcaption><b>FIAVL</b><span>ARTES VIVAS<br/>LOJA · 2026</span></figcaption>
      </figure>
    </section>
    <Selection />
  </>;
}
