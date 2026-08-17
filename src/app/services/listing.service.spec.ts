import { TestBed } from '@angular/core/testing';
import { PropertyListing } from '../models/listing';
import { LISTING_REPOSITORY, ListingRepository } from '../repositories/listing.repository';
import { ListingService } from './listing.service';

describe('ListingService', () => {
  const listings: PropertyListing[] = [
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
      tags: ['Balcon'],
      isNew: true,
      updatedMinutesAgo: 2,
      score: 90,
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
      tags: ['Jardin'],
      isNew: false,
      updatedMinutesAgo: 8,
      score: 80,
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
    });

    expect(result.map((listing) => listing.id)).toEqual([2, 1]);
    expect(listings.map((listing) => listing.id)).toEqual([1, 2]);
  });
});
