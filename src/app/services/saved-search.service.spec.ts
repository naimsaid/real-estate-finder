import { TestBed } from '@angular/core/testing';
import { Filter } from '../models/filter';
import { SavedSearchService } from './saved-search.service';

describe('SavedSearchService', () => {
  const filters: Filter = {
    mode: 'buy',
    city: 'Rabat',
    propertyType: 'Appartement',
    maxBudget: 2000000,
    minRooms: 3,
    minBedrooms: 2,
    minBathrooms: 1,
    minArea: 80,
    maxArea: 150,
    amenities: ['Balcon'],
    newOnly: false,
    sortBy: 'relevance',
    query: 'calme',
    includeKeywords: '',
    excludeKeywords: '',
    publishedWithinDays: 0,
    minFloor: 0,
    maxFloor: 0,
    energyRatings: [],
  };

  beforeEach(() => {
    localStorage.clear();
    TestBed.resetTestingModule();
  });

  it('stores selected criteria locally without duplicates', () => {
    const service = TestBed.inject(SavedSearchService);
    service.save(filters);
    service.save(filters);

    expect(service.savedSearches()).toHaveLength(1);
    expect(service.savedSearches()[0].filters).toEqual(filters);
    expect(
      JSON.parse(localStorage.getItem('real-estate-finder:saved-searches') ?? '[]'),
    ).toHaveLength(1);
  });

  it('stores an alert email and removes a saved search', () => {
    const service = TestBed.inject(SavedSearchService);
    const search = service.save(filters);

    service.setAlertEmail(search.id, ' user@example.com ');
    expect(service.savedSearches()[0].alertEmail).toBe('user@example.com');

    service.remove(search.id);
    expect(service.savedSearches()).toEqual([]);
  });

  it('restores searches from local storage', () => {
    const firstService = TestBed.inject(SavedSearchService);
    firstService.save(filters);
    TestBed.resetTestingModule();

    expect(TestBed.inject(SavedSearchService).savedSearches()[0].filters.city).toBe('Rabat');
  });
});
