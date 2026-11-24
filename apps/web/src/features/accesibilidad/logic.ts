import { z } from 'zod';
import type { Venue } from '@fiavl/contracts';

export const textSizes = ['normal', 'large', 'xlarge'] as const;
export const contrasts = ['standard', 'high'] as const;

export const preferencesSchema = z.strictObject({
  version: z.literal(1),
  textSize: z.enum(textSizes),
  contrast: z.enum(contrasts)
});
export type Preferences = z.infer<typeof preferencesSchema>;
export type TextSize = Preferences['textSize'];
export type Contrast = Preferences['contrast'];

export const defaultPreferences: Preferences = { version: 1, textSize: 'normal', contrast: 'standard' };

export const textSizeLabels: Record<TextSize, string> = { normal: 'Normal', large: 'Grande', xlarge: 'Extra grande' };
export const contrastLabels: Record<Contrast, string> = { standard: 'Estándar', high: 'Elevado' };

export function isDefault(p: Preferences) {
  return p.textSize === defaultPreferences.textSize && p.contrast === defaultPreferences.contrast;
}

/** Lectura estricta: lanza si el valor no cumple el esquema versionado. */
export function parsePreferences(value: unknown): Preferences {
  return preferencesSchema.parse(value);
}

/** Texto sin mayúsculas, tildes ni espacios sobrantes para comparar. */
export function searchable(value: string) {
  return value.normalize('NFD').replace(/\p{M}/gu, '').toLocaleLowerCase('es').replace(/\s+/g, ' ').trim();
}

export function filterVenues(venues: Venue[], query: string): Venue[] {
  const term = searchable(query);
  if (!term) return venues;
  return venues.filter(v => searchable([v.name, v.address, v.accessibilityNotes].join(' ')).includes(term));
}

/** Contraste WCAG 2.x entre dos colores #rrggbb. */
export function contrastRatio(a: string, b: string) {
  const lum = (hex: string) => {
    const [r, g, bl] = [1, 3, 5].map(i => {
      const c = parseInt(hex.slice(i, i + 2), 16) / 255;
      return c <= 0.03928 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4;
    });
    return 0.2126 * r! + 0.7152 * g! + 0.0722 * bl!;
  };
  const [hi, lo] = [lum(a), lum(b)].sort((x, y) => y - x);
  return (hi! + 0.05) / (lo! + 0.05);
}
