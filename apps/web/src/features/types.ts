import type { ComponentType } from 'react';
export interface Feature {
  path: string;
  label: string;
  available: boolean;
  Page: ComponentType;
}
