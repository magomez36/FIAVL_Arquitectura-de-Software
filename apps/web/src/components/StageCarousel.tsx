import { useEffect, useRef, useState } from 'react';
import { ArrowRight, ChevronLeft, ChevronRight, Pause, Play } from 'lucide-react';

const scenes = [
  { image: 'telon', title: 'La ciudad abre', accent: 'el telón', credit: 'Monica Silvestre',
    text: 'Del teatro a la plaza, Loja celebra once ediciones de artes vivas. Explora la guía del festival y la cartelera del prototipo.', action: 'Explorar programación', href: '#seleccion' },
  { image: 'danza', title: 'El cuerpo habita', accent: 'la escena', credit: 'Marlon Ribeiro',
    text: 'Del ensayo a la función, cada espacio propone otra forma de acercarse a las artes vivas.', action: 'Descubrir espacios', href: '/espacios' },
  { image: 'musica', title: 'La ciudad también', accent: 'se escucha', credit: 'Caio Rosendo',
    text: 'Descubre los recorridos que conectan talleres, patios y plazas a través del sonido.', action: 'Recorrer Loja', href: '/rutas' }
];

export function StageCarousel({ agendaAvailable }: { agendaAvailable: boolean }) {
  const touch = useRef<{ x: number; y: number } | null>(null);
  const [index, setIndex] = useState(0);
  const [paused, setPaused] = useState(false);
  const [hover, setHover] = useState(false);
  const [focus, setFocus] = useState(false);
  const [hidden, setHidden] = useState(document.hidden);
  const [reduced, setReduced] = useState(() => matchMedia('(prefers-reduced-motion: reduce)').matches);
  useEffect(() => {
    const query = matchMedia('(prefers-reduced-motion: reduce)');
    const motion = () => setReduced(query.matches);
    const visibility = () => setHidden(document.hidden);
    query.addEventListener('change', motion);
    document.addEventListener('visibilitychange', visibility);
    return () => {
      query.removeEventListener('change', motion);
      document.removeEventListener('visibilitychange', visibility);
    };
  }, []);
  const stopped = paused || hover || focus || hidden || reduced;
  useEffect(() => {
    if (stopped) return;
    const timer = window.setTimeout(() => setIndex(i => (i + 1) % scenes.length), 7000);
    return () => clearTimeout(timer);
  }, [stopped, index]);
  const scene = scenes[index];
  const advance = (step: number) => setIndex(i => (i + step + scenes.length) % scenes.length);
  return <section className="stage-hero" aria-label="Cartel de escenas" aria-roledescription="carrusel"
    onTouchStart={event => {
      const point = event.touches[0];
      touch.current = event.touches.length === 1 && !(event.target as Element).closest('a,button')
        ? { x: point.clientX, y: point.clientY } : null;
    }}
    onTouchCancel={() => { touch.current = null; }}
    onTouchEnd={event => {
      const start = touch.current;
      touch.current = null;
      if (!start || event.touches.length) return;
      const dx = event.changedTouches[0].clientX - start.x;
      const dy = event.changedTouches[0].clientY - start.y;
      if (Math.abs(dx) >= 60 && Math.abs(dx) > Math.abs(dy) * 2) advance(dx < 0 ? 1 : -1);
    }}
    data-hidden={hidden} onMouseEnter={() => setHover(true)} onMouseLeave={() => setHover(false)}
    onFocus={() => setFocus(true)} onBlur={e => setFocus(e.currentTarget.contains(e.relatedTarget))}>
    <img key={scene.image} className="stage-photo" src={'/images/' + scene.image + '.webp'} alt="" fetchPriority="high"/>
    <div className="stage-shade"/>
    <div className="stage-hero-copy" aria-live={stopped ? 'polite' : 'off'}>
      <p className="stage-eyebrow">XI FIAVL · Loja · 12–22 noviembre 2026</p>
      <h1>{scene.title} <em>{scene.accent}</em></h1>
      <p className="stage-intro">{scene.text}</p>
      <a className="stage-button stage-gold" href={index === 0 && agendaAvailable ? '/agenda' : scene.href}>{scene.action}<ArrowRight size={18}/></a>
    </div>
    <div className="stage-playback">
      <span>{reduced ? 'Escenas a tu ritmo' : paused ? 'Pausa manual' : focus ? 'En pausa mientras usas los controles' :
        hover ? 'En pausa mientras el puntero está aquí' : hidden ? 'Pestaña en pausa' : 'Autoavance · 7 s'}</span>
      <div className="stage-clock" aria-hidden="true">{!stopped && <i key={index}/>}</div>
    </div>
    <div className="stage-console">
      <div className="stage-controls">
        <button aria-label="Escena anterior" onClick={() => advance(-1)}><ChevronLeft/></button>
        <span className="stage-count">{String(index + 1).padStart(2, '0')} / 03</span>
        <button aria-label="Siguiente escena" onClick={() => advance(1)}><ChevronRight/></button>
        <div className="stage-indicators">{scenes.map((s, i) => <button key={s.image} aria-label={'Ir a escena ' + (i + 1)}
          aria-current={i === index} onClick={() => setIndex(i)}/>)}</div>
        <button disabled={reduced} onClick={() => setPaused(value => !value)}>
          {paused || reduced ? <Play size={15}/> : <Pause size={15}/>}
          {reduced ? 'Movimiento reducido' : paused ? 'Reanudar' : 'Pausar'}
        </button>
      </div>
      <small>Ambientación · {scene.credit}</small>
    </div>
  </section>;
}
