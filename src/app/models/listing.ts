export type ListingMode = 'buy' | 'rent';

export const PROPERTY_TYPES = ['Appartement', 'Maison', 'Villa', 'Studio', 'Loft'] as const;
export type PropertyType = (typeof PROPERTY_TYPES)[number];

export interface Listing {
  id: number;
  title: string;
  city: string;
  district: string;
  postalCode?: string;
  mode: ListingMode;
  type: PropertyType;
  price: number;
  area: number;
  rooms: number;
  bedrooms: number;
  bathrooms: number;
  image: string;
  images: string[];
  tags: string[];
  description: string;
  contactEmail: string;
  contactPhone: string;
  isNew: boolean;
  updatedMinutesAgo: number;
  score: number;
  publishedAt?: string;
  floor?: number;
  energyRating?: 'A' | 'B' | 'C' | 'D' | 'E' | 'F' | 'G';
  latitude: number;
  longitude: number;
}
