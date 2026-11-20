import { Unavailable } from '../../components/Status.tsx';
import type { Feature } from '../types.ts';

function Page() {
  return <Unavailable title="Opiniones" />;
}

export default { path: '/opiniones', label: 'Opiniones', available: false, Page } satisfies Feature;
