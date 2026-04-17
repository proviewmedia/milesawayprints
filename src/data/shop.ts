import { PrintType, GalleryItem } from './prints';

export interface DesignSummary {
  id?: string;
  slug: string;
  name: string;
  location: string;
  type: PrintType;
  description?: string;
  tags?: string[];
  values: Record<string, string>;
  image_url?: string;
  room_mockup_url?: string;
}

export interface Collection {
  id?: string;
  slug: string;
  name: string;
  description?: string;
  hero_image_url?: string;
  designs: DesignSummary[];
}

export type GalleryItemWithMeta = GalleryItem & {
  slug?: string;
  description?: string;
  tags?: string[];
  room_mockup_url?: string;
  print_type_slug?: PrintType;
};

/** Turn a DB gallery_items row into a DesignSummary for the UI */
export function toDesignSummary(item: GalleryItemWithMeta, fallbackType?: PrintType): DesignSummary {
  const type = (item.print_type_slug ?? fallbackType) as PrintType;
  return {
    id: item.id,
    slug: item.slug ?? slugifyFallback(item.name),
    name: item.name,
    location: item.location,
    type,
    description: item.description,
    tags: item.tags,
    values: item.values ?? {},
    image_url: item.image_url,
    room_mockup_url: item.room_mockup_url,
  };
}

function slugifyFallback(input: string): string {
  return input.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '');
}
