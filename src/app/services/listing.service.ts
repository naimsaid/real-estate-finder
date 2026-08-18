import { computed, inject, Injectable, Signal, signal } from '@angular/core';
import { Filter } from '../models/filter';
import { Listing } from '../models/listing';
import { LISTING_REPOSITORY } from '../repositories/listing.repository';

export type ListingCriteria = Omit<Filter, 'sortBy'>;

@Injectable({ providedIn: 'root' })
export class ListingService {
  private readonly repository = inject(LISTING_REPOSITORY);
  private readonly listingState = signal<readonly Listing[]>([]);

  readonly listings = this.listingState.asReadonly();
  readonly isLoading = signal(true);
  readonly error = signal<string | null>(null);
  private readonly searchableText = new WeakMap<Listing, string>();

  constructor() {
    try {
      this.listingState.set(this.repository.getListings());
    } catch {
      this.error.set('Impossible de charger les annonces. Veuillez réessayer plus tard.');
    } finally {
      queueMicrotask(() => this.isLoading.set(false));
    }
  }

  getListingById(id: number): Listing | undefined {
    return this.repository.getListingById(id);
  }

  search(filters: Signal<Filter>): Signal<readonly Listing[]> {
    const criteria = computed(
      () => {
        const { sortBy, ...criteria } = filters();
        void sortBy;
        return criteria;
      },
      { equal: (a, b) => JSON.stringify(a) === JSON.stringify(b) },
    );
    const matches = computed(() => this.filterMatches(this.listings(), criteria()));

    return computed(() => this.sort(matches(), filters().sortBy));
  }

  filter(listings: readonly Listing[], filters: Filter): Listing[] {
    return this.sort(this.filterMatches(listings, filters), filters.sortBy);
  }

  filterMatches(
    listings: readonly Listing[],
    filters: ListingCriteria,
  ): Listing[] {
    const query = filters.query.trim().toLowerCase();

    return listings.filter((listing) => {
      if (
        listing.mode !== filters.mode ||
        (filters.city !== 'Toutes les villes' && listing.city !== filters.city) ||
        (filters.propertyType !== 'Tous' && listing.type !== filters.propertyType) ||
        listing.price > filters.maxBudget ||
        listing.rooms < filters.minRooms ||
        listing.bedrooms < filters.minBedrooms ||
        listing.bathrooms < filters.minBathrooms ||
        listing.area < filters.minArea ||
        listing.area > filters.maxArea ||
        (filters.newOnly && !listing.isNew) ||
        !filters.amenities.every((amenity) => listing.tags.includes(amenity))
      ) {
        return false;
      }

      if (!query) return true;

      let text = this.searchableText.get(listing);
      if (!text) {
        text = [listing.title, listing.city, listing.district, listing.type, ...listing.tags]
          .join(' ')
          .toLowerCase();
        this.searchableText.set(listing, text);
      }
      return text.includes(query);
    });
  }

  sort(
    listings: readonly Listing[],
    sortBy: Filter['sortBy'],
  ): Listing[] {
    return [...listings].sort((a, b) =>
      sortBy === 'priceAsc'
        ? a.price - b.price
        : sortBy === 'priceDesc'
          ? b.price - a.price
          : b.score - a.score,
    );
  }
}
