import { z } from 'zod';

export const idSchema = z.string().regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/);
const text = z.string().min(1);
const image = z.string().regex(/^\/art\/[a-z0-9-]+\.svg$/);
const localTime = z.iso.datetime({ offset: true, precision: 0 }).refine(value => value.endsWith('-05:00'));

export const artistSchema = z.strictObject({
  id: idSchema, name: text, bio: text, country: text, discipline: text, image
});
export const venueSchema = z.strictObject({
  id: idSchema, name: text, address: text, description: text, accessibilityNotes: text, image
});
export const eventSchema = z.strictObject({
  id: idSchema, title: text, description: text, category: text,
  startAt: localTime, endAt: localTime, venueId: idSchema,
  artistIds: z.array(idSchema).refine(ids => new Set(ids).size === ids.length),
  priceCents: z.int().nonnegative(), capacity: z.int().nonnegative(),
  reservable: z.boolean(), image
}).refine(event => event.endAt > event.startAt);

export const eventsSchema = z.array(eventSchema);
export const healthSchema = z.strictObject({ status: z.literal('ok') });
export const errorSchema = z.strictObject({ error: z.strictObject({
  code: z.enum(['INVALID_ID', 'NOT_FOUND', 'NOT_IMPLEMENTED', 'INTERNAL_ERROR']), message: text
}) });
export type Event = z.infer<typeof eventSchema>;
export type Artist = z.infer<typeof artistSchema>;
export type Venue = z.infer<typeof venueSchema>;
export type ErrorCode = z.infer<typeof errorSchema>['error']['code'];
