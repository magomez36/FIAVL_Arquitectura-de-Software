import { useEffect, useRef, useState } from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter, Link, NavLink, Route, Routes, useLocation } from 'react-router-dom';
import { Menu, X } from 'lucide-react';
import { Home } from './Home.tsx';
import { features } from './features/index.ts';
import './style.css';

function Header() {
  const [open, setOpen] = useState(false);
  const button = useRef<HTMLButtonElement>(null);
  const header = useRef<HTMLElement>(null);
  useEffect(() => {
    if (!open) return;
    const key = (e: KeyboardEvent) => {
      if (e.key === 'Escape') { setOpen(false); button.current?.focus(); }
    };
    const outside = (e: PointerEvent) => {
      if (!header.current?.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener('keydown', key);
    document.addEventListener('pointerdown', outside);
    return () => {
      document.removeEventListener('keydown', key);
      document.removeEventListener('pointerdown', outside);
    };
  }, [open]);
  return <header className="stage-header" ref={header}>
    <div className="bar flex items-center justify-between">
      <Link className="brand flex items-center" to="/" onClick={() => setOpen(false)}>
        <img src="/art/logo.svg" alt="" width="38" height="38"/><strong>FIAVL <i>Explora</i></strong>
      </Link>
      <div className="bar-tools flex items-center">
        <span className="edition">Prototipo académico no oficial · Datos demo</span>
        <button className="menu-toggle" ref={button} aria-expanded={open} aria-controls="nav" onClick={() => setOpen(!open)}>
          {open ? <X size={18}/> : <Menu size={18}/>} Menú
        </button>
      </div>
      <nav id="nav" aria-label="Navegación principal" hidden={!open} onBlur={e => {
        if (e.relatedTarget && !header.current?.contains(e.relatedTarget as Node)) setOpen(false);
      }}>
        <NavLink to="/" end onClick={() => setOpen(false)}>Inicio</NavLink>
        {features.map(f => <NavLink key={f.path} to={f.path} onClick={() => setOpen(false)}>
          {f.label}{!f.available && <small>No disponible</small>}
        </NavLink>)}
      </nav>
    </div>
  </header>;
}

function App() {
  const { pathname } = useLocation();
  const previous = useRef(pathname);
  const main = useRef<HTMLElement>(null);
  useEffect(() => {
    document.title = (features.find(f => f.path === pathname)?.label ?? (pathname === '/' ? 'La ciudad abre el telón' : 'Página no encontrada')) + ' · FIAVL Explora';
    if (previous.current !== pathname) {
      main.current?.focus();
      window.scrollTo(0, 0);
      previous.current = pathname;
    }
  }, [pathname]);
  return <>
    <a className="skip" href="#contenido">Saltar al contenido</a>
    <Header/>
    <main ref={main} id="contenido" tabIndex={-1}><Routes>
      <Route path="/" element={<Home/>}/>
      {features.map(({ path, Page }) => <Route key={path} path={path} element={<Page/>}/>)}
      <Route path="*" element={<section className="interior"><h1>Página no encontrada</h1><Link className="action" to="/">Volver al inicio</Link></section>}/>
    </Routes></main>
    <footer className="stage-footer"><div className="footer-inner"><strong>FIAVL Explora</strong><span>Prototipo no oficial · Datos demo</span><div className="stage-sources"><b>Fuentes del programa</b><a href="https://festivaldeloja.com/">Festival de Loja ↗</a>
      <a href="https://cultura.ec/festival/artes-vivas-loja">Cultura.ec ↗</a>
      <a href="https://cultura.ec/festival/artes-vivas-loja/entrada-libre">Actividades de entrada libre ↗</a></div></div></footer>
  </>;
}

createRoot(document.getElementById('root')!).render(<BrowserRouter><App/></BrowserRouter>);
