import { isPlatformBrowser } from '@angular/common';
import { Injectable, PLATFORM_ID, inject, signal } from '@angular/core';

const RECENTLY_VIEWED_STORAGE_KEY = 'real-estate-finder:recently-viewed';
const MAX_RECENTLY_VIEWED = 6;

@Injectable({ providedIn: 'root' })
export class RecentlyViewedService {
  private readonly isBrowser = isPlatformBrowser(inject(PLATFORM_ID));
  private readonly ids = signal<number[]>(this.load());
  readonly recentlyViewedIds = this.ids.asReadonly();

  record(id: number): void {
    if (!Number.isFinite(id)) return;
    const updated = [id, ...this.ids().filter((storedId) => storedId !== id)].slice(
      0,
      MAX_RECENTLY_VIEWED,
    );
    this.ids.set(updated);
    if (!this.isBrowser) return;
    try {
      localStorage.setItem(RECENTLY_VIEWED_STORAGE_KEY, JSON.stringify(updated));
    } catch {
      // Keep the session history available when browser storage is unavailable.
    }
  }

  private load(): number[] {
    if (!this.isBrowser) return [];
    try {
      const value: unknown = JSON.parse(localStorage.getItem(RECENTLY_VIEWED_STORAGE_KEY) ?? '[]');
      if (!Array.isArray(value) || !value.every(Number.isFinite)) return [];
      return [...new Set(value)].slice(0, MAX_RECENTLY_VIEWED);
    } catch {
      return [];
    }
  }
}
