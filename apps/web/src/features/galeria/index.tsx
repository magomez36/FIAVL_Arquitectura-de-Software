import { Unavailable } from '../../components/Status.tsx';
import type { Feature } from '../types.ts';

function Page() {
  return <Unavailable title="Galería" />;
}

export default { path: '/galeria', label: 'Galería', available: false, Page } satisfies Feature;
