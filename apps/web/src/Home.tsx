import { useEffect, useState } from 'react';
import { ArrowRight, CalendarDays } from 'lucide-react';
import { eventsSchema, type Event } from '@fiavl/contracts';
import { getResource } from './lib/http.ts';
import { Status } from './components/Status.tsx';

import { StageBadge, StageCard, StageHeading, StageSection } from './components/Stage.tsx';
import { StageCarousel } from './components/StageCarousel.tsx';
import { FestivalProgram, FestivalVenues } from './components/FestivalGuide.tsx';
import { features } from './features/index.ts';

const date = new Intl.DateTimeFormat('es-EC', { day: 'numeric', month: 'short', timeZone: 'America/Guayaquil' });
const time = new Intl.DateTimeFormat('es-EC', { hour: '2-digit', minute: '2-digit', hourCycle: 'h23', timeZone: 'America/Guayaquil' });

function EventCard({ event }: { event: Event }) {
  const start = new Date(event.startAt);
  const art: Record<string, string> = { danza: 'danza', teatro: 'telon', música: 'musica' };
  const photo = art[event.category.toLocaleLowerCase('es')];
  return <StageCard>
    <div className="card-art stage-art"><img loading="lazy" src={photo ? "/images/" + photo + ".webp" : event.image} alt="" /><StageBadge>{event.category}</StageBadge>{photo && <small className="stage-photo-credit">Ambientación</small>}</div>
    <div className="card-body"><p className="schedule"><CalendarDays size={15} aria-hidden="true" />
      <time dateTime={event.startAt}>{date.format(start)} · {time.format(start)}</time></p>
      <h3>{event.title}</h3><p>{event.description}</p>
    </div>
  </StageCard>;
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
  return <StageSection className="selection" id="seleccion" tabIndex={-1} aria-labelledby="selection-title">
    <p className="kicker"><span /> Datos demo</p>
    <StageHeading id="selection-title">Cartelera del prototipo</StageHeading>
    {failed ? <Status message="No se pudo cargar la programación." retry={() => { setFailed(false); setAttempt(attempt + 1); }} />
      : items === undefined ? <Status message="Cargando programación…" />
      : items.length === 0 ? <Status message="Aún no hay eventos en la programación." />
      : <div className="cards">{items.map(event => <EventCard key={event.id} event={event} />)}</div>}
  </StageSection>;
}

export function Home() {
  return <>
    <StageCarousel agendaAvailable={features.some(f => f.path === '/agenda' && f.available)}/>
    <div className="stage-bill">
      <a href="#guia-festival">Guía FIAVL 2026</a>
      <a href="#sedes-festival">Sedes de Loja</a>
      <a href="#seleccion">Ver selección <ArrowRight size={16}/></a>
    </div>
    <FestivalProgram/>
    <FestivalVenues preview/>
    <Selection/>
    <StageSection aria-label="Explorar Loja" className="stage-pair">
      <a href="/espacios"><span>Directorio de sedes</span><h2>Descubrir espacios</h2><ArrowRight/></a>
      <a href="/rutas"><span>Itinerarios culturales</span><h2>Recorrer Loja</h2><ArrowRight/></a>
    </StageSection>
  </>;
}
