import { isPlatformBrowser } from '@angular/common';
import { Injectable, PLATFORM_ID, inject, signal } from '@angular/core';
import { Filter } from '../models/filter';
import { SavedSearch } from '../models/saved-search';

const STORAGE_KEY = 'real-estate-finder:saved-searches';

@Injectable({ providedIn: 'root' })
export class SavedSearchService {
  private readonly isBrowser = isPlatformBrowser(inject(PLATFORM_ID));
  private readonly searches = signal<SavedSearch[]>(this.load());
  readonly savedSearches = this.searches.asReadonly();

  isSaved(filters: Filter): boolean {
    return this.searches().some((search) => this.sameFilters(search.filters, filters));
  }

  save(filters: Filter): SavedSearch {
    const existing = this.searches().find((search) => this.sameFilters(search.filters, filters));
    if (existing) return existing;
    const search: SavedSearch = {
      id: `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`,
      filters: structuredClone(filters),
      createdAt: new Date().toISOString(),
      alertEmail: '',
    };
    this.update([search, ...this.searches()]);
    return search;
  }

  remove(id: string): void {
    this.update(this.searches().filter((search) => search.id !== id));
  }

  setAlertEmail(id: string, alertEmail: string): void {
    this.update(
      this.searches().map((search) =>
        search.id === id ? { ...search, alertEmail: alertEmail.trim() } : search,
      ),
    );
  }

  private load(): SavedSearch[] {
    if (!this.isBrowser) return [];
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored === null) return [];
      const parsed: unknown = JSON.parse(stored);
      return Array.isArray(parsed) ? parsed.filter(this.isValid) : [];
    } catch {
      return [];
    }
  }

  private readonly isValid = (value: unknown): value is SavedSearch => {
    if (!value || typeof value !== 'object') return false;
    const search = value as Partial<SavedSearch>;
    return (
      typeof search.id === 'string' &&
      typeof search.createdAt === 'string' &&
      typeof search.alertEmail === 'string' &&
      !!search.filters &&
      typeof search.filters === 'object'
    );
  };

  private sameFilters(first: Filter, second: Filter): boolean {
    return JSON.stringify(first) === JSON.stringify(second);
  }

  private update(searches: SavedSearch[]): void {
    this.searches.set(searches);
    if (!this.isBrowser) return;
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(searches));
    } catch {
      // The in-memory state remains usable when browser storage is unavailable.
    }
  }
}
