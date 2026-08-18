export type ListingMode = 'buy' | 'rent';

export type PropertyType = 'Appartement' | 'Maison' | 'Villa' | 'Studio' | 'Loft';

export interface Listing {
  id: number;
  title: string;
  city: string;
  district: string;
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
