import { Unavailable } from '../../components/Status.tsx';
import type { Feature } from '../types.ts';

function Page() {
  return <Unavailable title="Reservas" />;
}

export default { path: '/reservas', label: 'Reservas', available: false, Page } satisfies Feature;
