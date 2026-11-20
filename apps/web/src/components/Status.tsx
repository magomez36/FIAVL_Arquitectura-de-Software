import { ArrowLeft, RefreshCw } from 'lucide-react';
import { Link } from 'react-router-dom';

export function Status({ message, retry }: { message: string; retry?: () => void }) {
  return <div className="status" role={retry ? 'alert' : 'status'}>
    <p>{message}</p>
    {retry && <button className="action" onClick={retry}><RefreshCw size={16} />Reintentar</button>}
  </div>;
}

export function Unavailable({ title }: { title: string }) {
  return <section className="interior">
    <h1>{title}</h1><Status message="Función no disponible" />
    <Link className="action" to="/"><ArrowLeft size={18} />Volver al inicio</Link>
  </section>;
}
