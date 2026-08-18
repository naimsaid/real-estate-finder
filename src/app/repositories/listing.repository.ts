import { InjectionToken } from '@angular/core';
import { Listing } from '../models/listing';

export interface ListingRepository {
  getListings(): readonly Listing[];
  getListingById(id: number): Listing | undefined;
}

export const LISTING_REPOSITORY = new InjectionToken<ListingRepository>('ListingRepository');
