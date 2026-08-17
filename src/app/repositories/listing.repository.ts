import { InjectionToken } from '@angular/core';
import { PropertyListing } from '../models/listing';

export interface ListingRepository {
  getListings(): readonly PropertyListing[];
  getListingById(id: number): PropertyListing | undefined;
}

export const LISTING_REPOSITORY = new InjectionToken<ListingRepository>('ListingRepository');
