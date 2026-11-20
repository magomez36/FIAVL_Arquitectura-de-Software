import { Unavailable } from '../../components/Status.tsx';
import type { Feature } from '../types.ts';

function Page() {
  return <Unavailable title="Mi agenda" />;
}

export default { path: '/mi-agenda', label: 'Mi agenda', available: false, Page } satisfies Feature;
