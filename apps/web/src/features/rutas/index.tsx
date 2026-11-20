import { Unavailable } from '../../components/Status.tsx';
import type { Feature } from '../types.ts';

function Page() {
  return <Unavailable title="Rutas" />;
}

export default { path: '/rutas', label: 'Rutas', available: false, Page } satisfies Feature;
