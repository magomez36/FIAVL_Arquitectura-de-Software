import { Unavailable } from '../../components/Status.tsx';
import type { Feature } from '../types.ts';

function Page() {
  return <Unavailable title="Espacios" />;
}

export default { path: '/espacios', label: 'Espacios', available: false, Page } satisfies Feature;
