import { Unavailable } from '../../components/Status.tsx';
import type { Feature } from '../types.ts';

function Page() {
  return <Unavailable title="Accesibilidad" />;
}

export default { path: '/accesibilidad', label: 'Accesibilidad', available: false, Page } satisfies Feature;
