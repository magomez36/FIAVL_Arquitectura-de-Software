import { Unavailable } from '../../components/Status.tsx';
import type { Feature } from '../types.ts';

function Page() {
  return <Unavailable title="Artistas" />;
}

export default { path: '/artistas', label: 'Artistas', available: false, Page } satisfies Feature;
