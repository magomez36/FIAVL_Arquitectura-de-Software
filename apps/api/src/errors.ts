import type { Response } from 'express';
import type { ErrorCode } from '@fiavl/contracts';

export function sendError(res: Response, status: number, code: ErrorCode, message: string) {
  res.status(status).json({ error: { code, message } });
}
