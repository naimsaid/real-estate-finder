import { Injectable, signal } from '@angular/core';

const FAVORITES_STORAGE_KEY = 'real-estate-finder:favorites';
const DEFAULT_FAVORITE_IDS = [1, 5];

@Injectable({ providedIn: 'root' })
export class FavoriteService {
  private readonly favoriteIds = signal<number[]>(this.loadFavorites());
  readonly favorites = this.favoriteIds.asReadonly();

  isFavorite(id: number): boolean {
    return this.favoriteIds().includes(id);
  }

  addFavorite(id: number): void {
    if (this.isFavorite(id)) return;

    this.updateFavorites([...this.favoriteIds(), id]);
  }

  removeFavorite(id: number): void {
    if (!this.isFavorite(id)) return;

    this.updateFavorites(this.favoriteIds().filter((favoriteId) => favoriteId !== id));
  }

  toggleFavorite(id: number): void {
    if (this.isFavorite(id)) {
      this.removeFavorite(id);
    } else {
      this.addFavorite(id);
    }
  }

  private loadFavorites(): number[] {
    try {
      const storedFavorites = localStorage.getItem(FAVORITES_STORAGE_KEY);
      if (storedFavorites === null) return [...DEFAULT_FAVORITE_IDS];

      const parsedFavorites: unknown = JSON.parse(storedFavorites);
      if (!Array.isArray(parsedFavorites) || !parsedFavorites.every(Number.isFinite)) {
        return [...DEFAULT_FAVORITE_IDS];
      }

      return [...new Set(parsedFavorites)];
    } catch {
      return [...DEFAULT_FAVORITE_IDS];
    }
  }

  private updateFavorites(ids: number[]): void {
    this.favoriteIds.set(ids);

    try {
      localStorage.setItem(FAVORITES_STORAGE_KEY, JSON.stringify(ids));
    } catch {
      // The in-memory state remains usable when browser storage is unavailable.
    }
  }
}
