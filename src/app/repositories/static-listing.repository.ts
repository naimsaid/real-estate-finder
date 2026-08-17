import { Injectable } from '@angular/core';
import { MOCK_LISTINGS } from '../data/mock-listings';
import { PropertyListing } from '../models/listing';
import { ListingRepository } from './listing.repository';

@Injectable({ providedIn: 'root' })
export class StaticListingRepository implements ListingRepository {
  getListings(): readonly PropertyListing[] {
    return MOCK_LISTINGS;
  }

  getListingById(id: number): PropertyListing | undefined {
    return MOCK_LISTINGS.find((listing) => listing.id === id);
  }
}
