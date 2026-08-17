import { TestBed } from '@angular/core/testing';
import { FavoriteService } from './favorite.service';

describe('FavoriteService', () => {
  const storageKey = 'real-estate-finder:favorites';

  beforeEach(() => {
    localStorage.clear();
    TestBed.resetTestingModule();
  });

  it('adds a favorite and persists it', () => {
    const service = TestBed.inject(FavoriteService);

    service.addFavorite(3);

    expect(service.isFavorite(3)).toBe(true);
    expect(JSON.parse(localStorage.getItem(storageKey) ?? '[]')).toEqual([1, 5, 3]);
  });

  it('removes a favorite and persists the removal', () => {
    const service = TestBed.inject(FavoriteService);

    service.removeFavorite(1);

    expect(service.isFavorite(1)).toBe(false);
    expect(JSON.parse(localStorage.getItem(storageKey) ?? '[]')).toEqual([5]);
  });

  it('restores persisted favorites in a new service instance', () => {
    localStorage.setItem(storageKey, JSON.stringify([2, 4]));

    const service = TestBed.inject(FavoriteService);

    expect(service.favorites()).toEqual([2, 4]);
  });

  it('falls back to the initial favorites when stored JSON is invalid', () => {
    localStorage.setItem(storageKey, '{invalid');

    const service = TestBed.inject(FavoriteService);

    expect(service.favorites()).toEqual([1, 5]);
  });

  it('toggles favorites through the service', () => {
    const service = TestBed.inject(FavoriteService);

    service.toggleFavorite(1);
    service.toggleFavorite(3);

    expect(service.favorites()).toEqual([5, 3]);
  });
});
