import { useEffect, useRef, useState, type ReactNode } from 'react';
import { ArrowRight, ArrowUpRight } from 'lucide-react';
import { links, shows, venues } from '../lib/festival2026.ts';

function Reveal({ children }: { children: ReactNode }) {
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const node = ref.current;
    if (!node || !('IntersectionObserver' in window)) return;
    const observer = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting) {
        node.classList.add('festival-enter');
        observer.disconnect();
      }
    });
    observer.observe(node);
    return () => observer.disconnect();
  }, []);
  return <div ref={ref}>{children}</div>;
}

export function FestivalProgram() {
  return <section id="guia-festival" aria-labelledby="festival-program-title" className="festival-program">
    <div className="festival-program-intro">
      <p className="festival-label">Selección verificada · Edición XI</p>
      <h2 id="festival-program-title">Funciones del FIAVL 2026</h2>
      <p>Del oficio de la tramoya en Cuenca al teatro de La Mona Ilustre de Chile. Cuatro obras de los últimos tres días del festival.</p>
      <a href={links.program}>Programa en Cultura.ec <ArrowUpRight size={16}/></a>
    </div>
    <Reveal><ul className="festival-shows">{shows.map(show => {
      const [day, hours] = show.date.split(' · ');
      return <li key={show.source}>
        <div className="festival-date"><b>{day.split(' ')[0]}</b><span>NOV</span></div>
        <div><span className="festival-time">{hours} · {show.venue}</span>
          <h3><a href={show.source}>{show.title} <ArrowUpRight size={16}/></a></h3>
          <p>{show.artist}</p></div>
      </li>;
    })}</ul></Reveal>
  </section>;
}

function MuseumPhoto() {
  const [failed, setFailed] = useState(false);
  return <figure className="festival-archive">
    {failed ? <p>Fotografía de archivo del Museo de Loja. Consulta el original enlazado.</p> :
      <img src="/images/museo-loja.jpg" alt="Edificio del Museo de Loja en una fotografía de archivo de 2003."
        width={534} height={800} onError={() => setFailed(true)}/>}
    <figcaption>Museo de Loja · Archivo, 2003<br/>
      <a href="https://www.flickr.com/photos/diegotirira/17295352441/">Diego Tirira</a> · <a href="https://creativecommons.org/licenses/by-sa/2.0/">CC BY-SA 2.0</a>
    </figcaption>
  </figure>;
}

export function FestivalVenues({ preview = false }: { preview?: boolean }) {
  const places = preview ? venues.filter(v => ['Museo de Loja', 'Teatro Bolívar'].includes(v.name)) : venues;
  return <section id="sedes-festival" aria-labelledby="festival-venues-title" className="festival-venues">
    <MuseumPhoto/>
    <div><p className="festival-label">Archivo de la ciudad · Loja, Ecuador</p>
      <h2 id="festival-venues-title">Sedes del FIAVL 2026</h2>
      <Reveal><ul>{places.map(place => <li key={place.name}>
        <h3><a href={place.source}>{place.name} <ArrowUpRight size={15}/></a></h3>
        <p>{place.context}</p>
      </li>)}</ul></Reveal>
      {preview ? <a className="stage-button" href="/espacios">Ver las cinco sedes <ArrowRight size={16}/></a> :
        <a className="festival-source" href={links.festival}>Escenarios en la web del festival ↗</a>}
    </div>
  </section>;
}
