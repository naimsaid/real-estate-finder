import { signal } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { Filter } from '../models/filter';
import { Listing } from '../models/listing';
import { LISTING_REPOSITORY, ListingRepository } from '../repositories/listing.repository';
import { ListingService } from './listing.service';

describe('ListingService', () => {
  const listings: Listing[] = [
    {
      id: 1,
      title: 'Appartement test',
      city: 'Rabat',
      district: 'Agdal',
      mode: 'buy',
      type: 'Appartement',
      price: 1000000,
      area: 80,
      rooms: 3,
      bedrooms: 2,
      bathrooms: 1,
      image: 'test.jpg',
      images: ['test.jpg'],
      tags: ['Balcon'],
      description: 'Appartement utilisé pour les tests.',
      contactEmail: 'test@example.com',
      contactPhone: '+212500000001',
      isNew: true,
      updatedMinutesAgo: 2,
      score: 90,
      publishedAt: new Date(Date.now() - 12 * 60 * 60 * 1000).toISOString(),
      floor: 2,
      energyRating: 'B',
    },
    {
      id: 2,
      title: 'Maison test',
      city: 'Casablanca',
      district: 'Anfa',
      mode: 'buy',
      type: 'Maison',
      price: 2000000,
      area: 180,
      rooms: 5,
      bedrooms: 3,
      bathrooms: 2,
      image: 'test-2.jpg',
      images: ['test-2.jpg'],
      tags: ['Jardin'],
      description: 'Maison utilisée pour les tests.',
      contactEmail: 'test@example.com',
      contactPhone: '+212500000002',
      isNew: false,
      updatedMinutesAgo: 8,
      score: 80,
      publishedAt: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString(),
      floor: 0,
      energyRating: 'E',
    },
    {
      id: 3,
      title: 'Studio meuble avec fibre',
      city: 'Rabat',
      district: 'Hassan',
      mode: 'rent',
      type: 'Studio',
      price: 7000,
      area: 45,
      rooms: 2,
      bedrooms: 1,
      bathrooms: 1,
      image: 'test-3.jpg',
      images: ['test-3.jpg'],
      tags: ['Meuble', 'Fibre'],
      description: 'Studio utilisé pour les tests.',
      contactEmail: 'test@example.com',
      contactPhone: '+212500000003',
      isNew: true,
      updatedMinutesAgo: 1,
      score: 95,
      publishedAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
      floor: 5,
      energyRating: 'C',
    },
  ];
  const repository: ListingRepository = {
    getListings: () => listings,
    getListingById: (id) => listings.find((listing) => listing.id === id),
  };

  let service: ListingService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [ListingService, { provide: LISTING_REPOSITORY, useValue: repository }],
    });
    service = TestBed.inject(ListingService);
  });

  it('exposes repository listings through a readonly computed signal', () => {
    expect(service.listings()).toBe(listings);
    expect('set' in service.listings).toBe(false);
  });

  it('gets a listing by id through the repository', () => {
    expect(service.getListingById(2)).toEqual(listings[1]);
    expect(service.getListingById(99)).toBeUndefined();
  });

  it('exposes a computed search that reacts to filter changes', () => {
    const filters = signal<Filter>({
      mode: 'buy',
      city: 'Toutes les villes',
      propertyType: 'Tous',
      maxBudget: 3000000,
      minRooms: 1,
      minBedrooms: 0,
      minBathrooms: 0,
      minArea: 0,
      maxArea: 500,
      amenities: [],
      newOnly: false,
      sortBy: 'priceDesc',
      query: '',
      includeKeywords: '',
      excludeKeywords: '',
      publishedWithinDays: 0,
      minFloor: 0,
      maxFloor: 0,
      energyRatings: [],
    });
    const results = service.search(filters);

    expect(results().map(({ id }) => id)).toEqual([2, 1]);

    filters.update((value) => ({ ...value, city: 'Rabat' }));

    expect(results().map(({ id }) => id)).toEqual([1]);
    expect('set' in results).toBe(false);
  });

  it('filters and sorts listings without changing repository data', () => {
    const result = service.filter(listings, {
      mode: 'buy',
      city: 'Toutes les villes',
      propertyType: 'Tous',
      maxBudget: 3000000,
      minRooms: 1,
      minBedrooms: 0,
      minBathrooms: 0,
      minArea: 0,
      maxArea: 500,
      amenities: [],
      newOnly: false,
      sortBy: 'priceDesc',
      query: '',
      includeKeywords: '',
      excludeKeywords: '',
      publishedWithinDays: 0,
      minFloor: 0,
      maxFloor: 0,
      energyRatings: [],
    });

    expect(result.map((listing) => listing.id)).toEqual([2, 1]);
    expect(listings.map((listing) => listing.id)).toEqual([1, 2, 3]);
  });

  it('combines city, type, budget, rooms, surface, amenities, mode and novelty filters', () => {
    const result = service.filter(listings, {
      mode: 'buy',
      city: 'Rabat',
      propertyType: 'Appartement',
      maxBudget: 1500000,
      minRooms: 3,
      minBedrooms: 2,
      minBathrooms: 1,
      minArea: 70,
      maxArea: 90,
      amenities: ['Balcon'],
      newOnly: true,
      sortBy: 'relevance',
      query: '',
      includeKeywords: '',
      excludeKeywords: '',
      publishedWithinDays: 0,
      minFloor: 0,
      maxFloor: 0,
      energyRatings: [],
    });

    expect(result.map((listing) => listing.id)).toEqual([1]);
  });

  it.each([
    ['city', { city: 'Casablanca' }],
    ['property type', { propertyType: 'Maison' }],
    ['budget', { maxBudget: 1500000 }],
    ['rooms', { minRooms: 4 }],
    ['bedrooms', { minBedrooms: 3 }],
    ['bathrooms', { minBathrooms: 2 }],
    ['minimum surface', { minArea: 100 }],
    ['maximum surface', { maxArea: 100 }],
    ['amenities', { amenities: ['Jardin'] }],
    ['novelty', { newOnly: true }],
  ])('applies the %s filter', (_name, update) => {
    const result = service.filter(listings, {
      mode: 'buy',
      city: 'Toutes les villes',
      propertyType: 'Tous',
      maxBudget: 3000000,
      minRooms: 1,
      minBedrooms: 0,
      minBathrooms: 0,
      minArea: 0,
      maxArea: 500,
      amenities: [],
      newOnly: false,
      sortBy: 'relevance',
      query: '',
      includeKeywords: '',
      excludeKeywords: '',
      publishedWithinDays: 0,
      minFloor: 0,
      maxFloor: 0,
      energyRatings: [],
      ...(update as Partial<Filter>),
    });

    expect(result).toHaveLength(1);
  });

  it('filters by mode and performs a trimmed, case-insensitive text search across fields and tags', () => {
    const baseFilters = {
      mode: 'rent' as const,
      city: 'Toutes les villes',
      propertyType: 'Tous' as const,
      maxBudget: 10000,
      minRooms: 1,
      minBedrooms: 0,
      minBathrooms: 0,
      minArea: 0,
      maxArea: 500,
      amenities: [],
      newOnly: false,
      sortBy: 'relevance' as const,
      includeKeywords: '',
      excludeKeywords: '',
      publishedWithinDays: 0,
      minFloor: 0,
      maxFloor: 0,
      energyRatings: [],
    };

    expect(service.filter(listings, { ...baseFilters, query: '' }).map(({ id }) => id)).toEqual([
      3,
    ]);
    expect(
      service.filter(listings, { ...baseFilters, query: '  HASSAN ' }).map(({ id }) => id),
    ).toEqual([3]);
    expect(
      service.filter(listings, { ...baseFilters, query: 'fibre' }).map(({ id }) => id),
    ).toEqual([3]);
    expect(service.filter(listings, { ...baseFilters, query: 'introuvable' })).toEqual([]);
  });

  it('filters 10,000 listings within a basic performance budget', () => {
    const largeDataset = Array.from({ length: 10_000 }, (_, index) => ({
      ...listings[index % listings.length],
      id: index + 1,
    }));
    const startedAt = performance.now();

    const result = service.filter(largeDataset, {
      mode: 'buy',
      city: 'Toutes les villes',
      propertyType: 'Tous',
      maxBudget: 3000000,
      minRooms: 1,
      minBedrooms: 0,
      minBathrooms: 0,
      minArea: 0,
      maxArea: 500,
      amenities: [],
      newOnly: false,
      sortBy: 'relevance',
      query: 'test',
      includeKeywords: '',
      excludeKeywords: '',
      publishedWithinDays: 0,
      minFloor: 0,
      maxFloor: 0,
      energyRatings: [],
    });

    expect(result).toHaveLength(6667);
    expect(performance.now() - startedAt).toBeLessThan(1000);
  });

  it('combines inclusive and exclusive keywords, publication date, floor and DPE', () => {
    const result = service.filter(listings, {
      mode: 'buy',
      city: 'Toutes les villes',
      propertyType: 'Tous',
      maxBudget: 3000000,
      minRooms: 1,
      minBedrooms: 0,
      minBathrooms: 0,
      minArea: 0,
      maxArea: 500,
      amenities: [],
      newOnly: false,
      sortBy: 'relevance',
      query: '',
      includeKeywords: 'appartement, balcon',
      excludeKeywords: 'travaux',
      publishedWithinDays: 3,
      minFloor: 1,
      maxFloor: 4,
      energyRatings: ['A', 'B'],
    });

    expect(result.map(({ id }) => id)).toEqual([1]);
  });
});
