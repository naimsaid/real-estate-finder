import { ListingMode, PropertyType } from './listing';

export type SortOption = 'relevance' | 'priceAsc' | 'priceDesc';
export type EnergyRating = 'A' | 'B' | 'C' | 'D' | 'E' | 'F' | 'G';

export interface Filter {
  mode: ListingMode;
  city: string;
  propertyType: PropertyType | 'Tous';
  maxBudget: number;
  minRooms: number;
  minBedrooms: number;
  minBathrooms: number;
  minArea: number;
  maxArea: number;
  amenities: string[];
  newOnly: boolean;
  sortBy: SortOption;
  query: string;
  includeKeywords: string;
  excludeKeywords: string;
  publishedWithinDays: number;
  minFloor: number;
  maxFloor: number;
  energyRatings: EnergyRating[];
}

export interface SelectOption<T> {
  label: string;
  value: T;
}

export interface LocationOption {
  label: string;
  value: string;
  type: 'city' | 'district';
  city: string;
  postalCode: string;
}

export interface AmenityOption {
  label: string;
  icon: string;
}
