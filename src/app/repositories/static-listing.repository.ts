import { Injectable } from '@angular/core';
import { MOCK_LISTINGS } from '../data/mock-listings';
import { Listing } from '../models/listing';
import { ListingRepository } from './listing.repository';

@Injectable({ providedIn: 'root' })
export class StaticListingRepository implements ListingRepository {
  getListings(): readonly Listing[] {
    return MOCK_LISTINGS;
  }

  getListingById(id: number): Listing | undefined {
    return MOCK_LISTINGS.find((listing) => listing.id === id);
  }
}
