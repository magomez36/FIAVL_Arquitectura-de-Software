export const storageKeys = {
  agenda: 'fiavl:agenda:v1',
  reservations: 'fiavl:reservations:v1',
  accessibility: 'fiavl:accessibility:v1',
  feedback: 'fiavl:feedback:v1'
} as const;
type Feature = keyof typeof storageKeys;

export function readLocal<T>(feature: Feature, parse: (value: unknown) => T): T | undefined {
  try {
    const raw = window.localStorage.getItem(storageKeys[feature]);
    if (raw !== null) return parse(JSON.parse(raw));
  } catch { /* El navegador puede bloquear el almacenamiento. */ }
  return undefined;
}

export function writeLocal(feature: Feature, value: unknown): boolean {
  try {
    const raw = JSON.stringify(value);
    if (raw === undefined) return false;
    window.localStorage.setItem(storageKeys[feature], raw);
    return true;
  } catch {
    return false;
  }
}
