import { TestBed } from '@angular/core/testing';
import { appConfig } from '../../app.config';
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
});
