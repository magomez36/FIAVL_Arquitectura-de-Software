import { errorSchema } from '@fiavl/contracts';

export class HttpError extends Error {
  readonly status: number;
  readonly code: string;
  constructor(status: number, code: string, message: string) {
    super(message);
    this.status = status;
    this.code = code;
  }
}

export async function getResource<T>(path: string, schema: { parse: (raw: unknown) => T }, signal?: AbortSignal): Promise<T> {
  const response = await fetch('/api/' + path, { headers: { Accept: 'application/json' }, signal });
  if (!response.ok) {
    const body = errorSchema.safeParse(await response.json().catch(() => null));
    throw new HttpError(response.status, body.data?.error.code ?? 'HTTP_ERROR',
      body.data?.error.message ?? 'No se pudo consultar la programación.');
  }
  return schema.parse(await response.json());
}
