import { errorSchema } from '@fiavl/contracts';
import { HttpError } from '../../lib/http.ts';

/** POST JSON contra /api con el mismo manejo de errores que getResource (lib/http.ts). */
export async function postJson<T>(path: string, body: unknown, schema: { parse: (raw: unknown) => T }): Promise<T> {
  const response = await fetch('/api/' + path, {
    method: 'POST',
    headers: { Accept: 'application/json', ...(body === undefined ? {} : { 'Content-Type': 'application/json' }) },
    body: body === undefined ? undefined : JSON.stringify(body)
  });
  if (!response.ok) {
    const parsed = errorSchema.safeParse(await response.json().catch(() => null));
    throw new HttpError(response.status, parsed.data?.error.code ?? 'HTTP_ERROR',
      parsed.data?.error.message ?? 'No se pudo completar la operación.');
  }
  return schema.parse(await response.json());
}
