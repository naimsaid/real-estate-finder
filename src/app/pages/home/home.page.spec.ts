import { TestBed } from '@angular/core/testing';
import { appConfig } from '../../app.config';
import { MOCK_LISTINGS } from '../../data/mock-listings';
import { LISTING_REPOSITORY } from '../../repositories/listing.repository';
import { ListingService } from '../../services/listing.service';
import { HomePage } from './home.page';

describe('HomePage', () => {
  beforeEach(() => {
    localStorage.clear();
    TestBed.configureTestingModule({
      imports: [HomePage],
      providers: appConfig.providers,
    });
  });

  it('recomputes filteredListings when filters are combined and updated', () => {
    const fixture = TestBed.createComponent(HomePage);
    const page = fixture.componentInstance;

    page.updateFilters({
      city: 'Casablanca',
      propertyType: 'Appartement',
      maxBudget: 2500000,
      minRooms: 4,
      minBedrooms: 3,
      minBathrooms: 2,
      minArea: 100,
      maxArea: 150,
      amenities: ['Terrasse', 'Parking'],
      newOnly: true,
      query: 'lumineux',
    });

    expect(page.filteredListings().map(({ id }) => id)).toEqual([1]);

    page.updateFilters({ query: 'aucun resultat' });

    expect(page.filteredListings()).toEqual([]);
  });

  it('changes mode with the appropriate budget and exposes rental results', () => {
    const page = TestBed.createComponent(HomePage).componentInstance;

    page.changeMode('rent');

    expect(page.filters().mode).toBe('rent');
    expect(page.filters().maxBudget).toBe(12000);
    expect(page.filteredListings().map(({ id }) => id)).toEqual([3, 6]);
  });

  it('resets only advanced filters', () => {
    const page = TestBed.createComponent(HomePage).componentInstance;
    page.updateFilters({
      city: 'Rabat',
      minBedrooms: 3,
      minBathrooms: 2,
      minArea: 80,
      maxArea: 200,
      amenities: ['Jardin'],
      newOnly: true,
      sortBy: 'priceDesc',
    });

    page.resetAdvancedFilters();

    expect(page.filters()).toMatchObject({
      city: 'Rabat',
      minBedrooms: 0,
      minBathrooms: 0,
      minArea: 0,
      maxArea: 500,
      amenities: [],
      newOnly: false,
      sortBy: 'relevance',
    });
  });

  it('paginates client-side by 12 and resets the page when filters change', () => {
    const listings = Array.from({ length: 25 }, (_, index) => ({
      ...MOCK_LISTINGS[0],
      id: index + 1,
      score: 100 - index,
    }));
    TestBed.overrideProvider(LISTING_REPOSITORY, {
      useValue: {
        getListings: () => listings,
        getListingById: (id: number) => listings.find((listing) => listing.id === id),
      },
    });
    const page = TestBed.createComponent(HomePage).componentInstance;

    expect(page.paginatedListings()).toHaveLength(12);
    expect(page.totalPages()).toBe(3);

    page.changePage(3);
    expect(page.paginatedListings()).toHaveLength(1);

    page.updateFilters({ sortBy: 'priceAsc' });
    expect(page.currentPage()).toBe(1);
  });

  it('does not repeat criterion filtering when only sort or page changes', () => {
    const page = TestBed.createComponent(HomePage).componentInstance;
    const filterSpy = vi.spyOn(TestBed.inject(ListingService), 'filterMatches');

    page.paginatedListings();
    expect(filterSpy).toHaveBeenCalledTimes(1);

    page.updateFilters({ sortBy: 'priceDesc' });
    page.paginatedListings();
    page.changePage(1);
    page.paginatedListings();

    expect(filterSpy).toHaveBeenCalledTimes(1);
  });
});
