import { ListingMode, PropertyType } from './listing';

export type SortOption = 'relevance' | 'priceAsc' | 'priceDesc';

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
}

export interface SelectOption<T> {
  label: string;
  value: T;
}

export interface AmenityOption {
  label: string;
  icon: string;
}
