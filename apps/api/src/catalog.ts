import { idSchema, type Artist, type Event, type Venue } from '@fiavl/contracts';

export type Collection = 'events' | 'artists' | 'venues';
type CatalogItem = Event | Artist | Venue;

export interface CatalogRepository {
  checkReadable(): void;
  read(collection: Collection, id?: string): CatalogItem[];
}

type Detail = { kind: 'invalidId' } | { kind: 'notFound' } | { kind: 'found'; item: CatalogItem };

export function createCatalogService(repository: CatalogRepository) {
  return {
    health() {
      repository.checkReadable();
      return { status: 'ok' } as const;
    },
    list(collection: Collection) {
      return repository.read(collection);
    },
    detail(collection: Collection, id: unknown): Detail {
      const parsed = idSchema.safeParse(id);
      if (!parsed.success) return { kind: 'invalidId' };
      const [item] = repository.read(collection, parsed.data);
      return item ? { kind: 'found', item } : { kind: 'notFound' };
    }
  };
}

export type CatalogService = ReturnType<typeof createCatalogService>;
