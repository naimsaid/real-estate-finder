import { TestBed } from '@angular/core/testing';
import { Router } from '@angular/router';
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

  it('synchronizes advanced filters with query params and restores them', async () => {
    const router = TestBed.inject(Router);
    const page = TestBed.createComponent(HomePage).componentInstance;

    page.updateFilters({
      includeKeywords: 'terrasse, calme',
      excludeKeywords: 'travaux',
      publishedWithinDays: 7,
      minFloor: 2,
      maxFloor: 8,
      energyRatings: ['A', 'B'],
    });
    await router.navigateByUrl(router.url);

    expect(router.url).toContain('include=terrasse%2C%20calme');
    expect(router.url).toContain('exclude=travaux');
    expect(router.url).toContain('publishedWithinDays=7');
    expect(router.url).toContain('minFloor=2');
    expect(router.url).toContain('maxFloor=8');
    expect(router.url).toContain('dpe=A&dpe=B');

    await router.navigateByUrl(
      '/?include=balcon&exclude=bruyant&publishedWithinDays=3&minFloor=1&maxFloor=4&dpe=C',
    );
    expect(page.filters()).toMatchObject({
      includeKeywords: 'balcon',
      excludeKeywords: 'bruyant',
      publishedWithinDays: 3,
      minFloor: 1,
      maxFloor: 4,
      energyRatings: ['C'],
    });
  });

  it('saves the current search criteria', () => {
    const page = TestBed.createComponent(HomePage).componentInstance;
    page.updateFilters({ city: 'Rabat', minRooms: 3 });

    page.saveSearch();

    expect(page.savedSearches.savedSearches()).toHaveLength(1);
    expect(page.savedSearches.savedSearches()[0].filters).toMatchObject({
      city: 'Rabat',
      minRooms: 3,
    });
  });

  it('limits comparison to three listings and allows removing one', () => {
    const page = TestBed.createComponent(HomePage).componentInstance;
    [1, 2, 3, 4].forEach((id) => page.toggleComparison(id));

    expect(page.comparisonIds()).toEqual([1, 2, 3]);
    page.toggleComparison(2);
    expect(page.comparisonIds()).toEqual([1, 3]);
  });
});
