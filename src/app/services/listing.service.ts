import { computed, inject, Injectable } from '@angular/core';
import { ListingFilters } from '../models/filter';
import { PropertyListing } from '../models/listing';
import { LISTING_REPOSITORY } from '../repositories/listing.repository';

@Injectable({ providedIn: 'root' })
export class ListingService {
  private readonly repository = inject(LISTING_REPOSITORY);

  readonly listings = computed(() => this.repository.getListings());

  getListingById(id: number): PropertyListing | undefined {
    return this.repository.getListingById(id);
  }

  filter(listings: readonly PropertyListing[], filters: ListingFilters): PropertyListing[] {
    const query = filters.query.trim().toLowerCase();

    return listings
      .filter((listing) => listing.mode === filters.mode)
      .filter((listing) => filters.city === 'Toutes les villes' || listing.city === filters.city)
      .filter((listing) => filters.propertyType === 'Tous' || listing.type === filters.propertyType)
      .filter((listing) => listing.price <= filters.maxBudget)
      .filter((listing) => listing.rooms >= filters.minRooms)
      .filter((listing) => listing.bedrooms >= filters.minBedrooms)
      .filter((listing) => listing.bathrooms >= filters.minBathrooms)
      .filter((listing) => listing.area >= filters.minArea && listing.area <= filters.maxArea)
      .filter((listing) => !filters.newOnly || listing.isNew)
      .filter((listing) => filters.amenities.every((amenity) => listing.tags.includes(amenity)))
      .filter(
        (listing) =>
          !query ||
          [listing.title, listing.city, listing.district, listing.type, ...listing.tags]
            .join(' ')
            .toLowerCase()
            .includes(query),
      )
      .sort((a, b) =>
        filters.sortBy === 'priceAsc'
          ? a.price - b.price
          : filters.sortBy === 'priceDesc'
            ? b.price - a.price
            : b.score - a.score,
      );
  }
}
