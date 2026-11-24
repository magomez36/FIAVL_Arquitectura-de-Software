import type { Venue } from '@fiavl/contracts';

export type CategoryId = 'todas' | 'sedes' | 'ambientacion' | 'ilustraciones' | 'archivo';
export type ItemCategory = Exclude<CategoryId, 'todas'>;

export const CATEGORIES: ReadonlyArray<{ id: CategoryId; label: string; hint: string }> = [
  { id: 'todas', label: 'Todas', hint: 'Todas las imágenes de la colección' },
  { id: 'sedes', label: 'Sedes', hint: 'Ilustraciones demo del catálogo de sedes' },
  { id: 'ambientacion', label: 'Ambientación', hint: 'Fotografías de ambientación escénica' },
  { id: 'ilustraciones', label: 'Ilustraciones', hint: 'Ilustraciones dibujadas para el prototipo' },
  { id: 'archivo', label: 'Archivo documental', hint: 'Fotografía documental de una sede identificada' }
];

export type Credit =
  | { kind: 'photo'; author: string; sourceName: string; sourceUrl: string; licence: string; licenceUrl: string }
  | { kind: 'prototype'; text: string };

export interface GalleryItem {
  id: string;
  category: ItemCategory;
  title: string;
  caption: string;
  alt: string;
  src: string;
  width: number;
  height: number;
  credit: Credit;
}

const PEXELS = { licence: 'Pexels License', licenceUrl: 'https://www.pexels.com/license/', sourceName: 'Pexels' } as const;
const AMBIENT = 'Ambientación: fotografía genérica que no documenta una función del FIAVL.';
const PROTOTYPE = { kind: 'prototype', text: 'Ilustración dibujada para este prototipo académico.' } as const;

export const editorialItems: readonly GalleryItem[] = [
  {
    id: 'ambientacion-telon', category: 'ambientacion', title: 'Público ante el telón',
    caption: AMBIENT, alt: 'Siluetas del público frente a un telón rojo iluminado en un teatro', src: '/images/telon.webp',
    width: 1440, height: 900,
    credit: { kind: 'photo', author: 'Monica Silvestre', sourceUrl: 'https://www.pexels.com/photo/people-at-theater-713149/', ...PEXELS }
  },
  {
    id: 'ambientacion-danza', category: 'ambientacion', title: 'Bailarina bajo un foco',
    caption: AMBIENT, alt: 'Bailarina en escena bajo un foco de luz', src: '/images/danza.webp', width: 1440, height: 900,
    credit: { kind: 'photo', author: 'Marlon Ribeiro', sourceUrl: 'https://www.pexels.com/photo/a-ballerina-dancing-on-stage-4250534/', ...PEXELS }
  },
  {
    id: 'ambientacion-musica', category: 'ambientacion', title: 'Violinista en la orquesta',
    caption: AMBIENT, alt: 'Violinista de espaldas dentro de una orquesta sobre el escenario', src: '/images/musica.webp',
    width: 1440, height: 900,
    credit: { kind: 'photo', author: 'Caio Rosendo', sourceUrl: 'https://www.pexels.com/photo/orchestra-violinist-performing-on-stage-35358478/', ...PEXELS }
  },
  {
    id: 'archivo-museo-loja', category: 'archivo', title: 'Patio del Museo de la Cultura Lojana',
    caption: 'Fotografía de 2003 del patio del Museo de la Cultura Lojana, en Loja. Se atribuye solo a este museo.',
    alt: 'Patio interior de dos plantas con columnas, balcones y un suelo de piedra con césped', src: '/images/museo-loja.jpg',
    width: 534, height: 800,
    credit: {
      kind: 'photo', author: 'Diego Tirira', sourceName: 'Flickr',
      sourceUrl: 'https://www.flickr.com/photos/diegotirira/17295352441/',
      licence: 'CC BY-SA 2.0', licenceUrl: 'https://creativecommons.org/licenses/by-sa/2.0/'
    }
  },
  {
    id: 'ilustracion-cartel', category: 'ilustraciones', title: 'Cartel del prototipo',
    caption: 'Una bailarina entre telones y montañas, dibujada para el prototipo.',
    alt: 'Ilustración de una bailarina entre telones y montañas', src: '/art/cartel.svg', width: 460, height: 380, credit: PROTOTYPE
  },
  {
    id: 'ilustracion-danza', category: 'ilustraciones', title: 'Ilustración de danza',
    caption: 'Ilustración compartida por las fichas de danza del catálogo demo.',
    alt: 'Ilustración que representa la disciplina de danza', src: '/art/danza.svg', width: 460, height: 260, credit: PROTOTYPE
  },
  {
    id: 'ilustracion-musica', category: 'ilustraciones', title: 'Ilustración de música',
    caption: 'Ilustración compartida por las fichas de música del catálogo demo.',
    alt: 'Ilustración que representa la disciplina de música', src: '/art/musica.svg', width: 460, height: 260, credit: PROTOTYPE
  },
  {
    id: 'ilustracion-teatro', category: 'ilustraciones', title: 'Ilustración de teatro',
    caption: 'Ilustración compartida por las fichas de teatro del catálogo demo.',
    alt: 'Ilustración que representa la disciplina de teatro', src: '/art/teatro.svg', width: 460, height: 260, credit: PROTOTYPE
  }
];

/** Solo rutas absolutas del propio sitio: sin esquema, sin host, sin saltos de directorio. */
export function isLocalSrc(src: string): boolean {
  return /^\/(?!\/)/.test(src) && !src.split('/').includes('..') && !/[\\:]/.test(src);
}

const rank = (category: ItemCategory) => CATEGORIES.findIndex(c => c.id === category);
const compare = (a: GalleryItem, b: GalleryItem) =>
  rank(a.category) - rank(b.category) || a.title.localeCompare(b.title, 'es') || a.id.localeCompare(b.id);

function venueItem(venue: Venue): GalleryItem {
  return {
    id: 'sede-' + venue.id, category: 'sedes', title: venue.name,
    caption: `${venue.address}. Ilustración demo del catálogo; no es una fotografía de la sede.`,
    alt: `Ilustración demo de la sede ${venue.name}`, src: venue.image, width: 460, height: 260,
    credit: PROTOTYPE
  };
}

/** Une los recursos editoriales con las sedes del catálogo en un orden que no depende de la entrada. */
export function buildItems(venues: readonly Venue[]): GalleryItem[] {
  return [...editorialItems, ...venues.map(venueItem)].sort(compare);
}

export function filterItems(items: readonly GalleryItem[], category: CategoryId): GalleryItem[] {
  return category === 'todas' ? [...items] : items.filter(i => i.category === category);
}

export function categoryCounts(items: readonly GalleryItem[]): Record<CategoryId, number> {
  const counts: Record<CategoryId, number> = { todas: items.length, sedes: 0, ambientacion: 0, ilustraciones: 0, archivo: 0 };
  for (const item of items) counts[item.category] += 1;
  return counts;
}

/** Elemento adyacente dentro de los resultados; sin ciclo: en los extremos devuelve undefined. */
export function neighbour(results: readonly GalleryItem[], id: string, step: 1 | -1): GalleryItem | undefined {
  const at = results.findIndex(i => i.id === id);
  return at < 0 ? undefined : results[at + step];
}

export function selectionIn(results: readonly GalleryItem[], id: string | undefined): GalleryItem | undefined {
  return id === undefined ? undefined : results.find(i => i.id === id);
}
