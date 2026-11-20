import { Unavailable } from '../../components/Status.tsx';
import type { Feature } from '../types.ts';

function Page() {
  return <Unavailable title="Agenda" />;
}

export default { path: '/agenda', label: 'Agenda', available: false, Page } satisfies Feature;
