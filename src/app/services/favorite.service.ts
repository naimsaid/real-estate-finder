import { Injectable, signal } from '@angular/core';

@Injectable({ providedIn: 'root' })
export class FavoriteService {
  private readonly favoriteIds = signal<number[]>([1, 5]);
  readonly favorites = this.favoriteIds.asReadonly();

  isFavorite(id: number): boolean {
    return this.favoriteIds().includes(id);
  }

  toggle(id: number): void {
    this.favoriteIds.update((ids) => ids.includes(id) ? ids.filter((item) => item !== id) : [...ids, id]);
  }
}
