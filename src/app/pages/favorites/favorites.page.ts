import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import { HeaderComponent } from '../../components/header/header.component';
import { ListingGridComponent } from '../../components/listing-grid/listing-grid.component';
import { SelectOption, SortOption } from '../../models/filter';
import { FavoriteService } from '../../services/favorite.service';
import { ListingService } from '../../services/listing.service';

@Component({
  selector: 'app-favorites-page',
  imports: [HeaderComponent, ListingGridComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <main class="app-shell">
      <app-header />
      <section class="page-content">
        <p class="eyebrow">Votre sélection</p>
        <h1>Mes favoris</h1>
        <app-listing-grid
          [listings]="favoriteListings()"
          [sortOptions]="sortOptions"
          [sortBy]="sortBy()"
          [favoriteIds]="favorites.favorites()"
          (sortChange)="sortBy.set($event)"
          (favoriteToggle)="favorites.toggle($event)"
        />
      </section>
    </main>
  `,
})
export class FavoritesPage {
  private readonly listings = inject(ListingService);
  readonly favorites = inject(FavoriteService);
  readonly sortBy = signal<SortOption>('relevance');
  readonly sortOptions: SelectOption<SortOption>[] = [
    { label: 'Pertinence', value: 'relevance' },
    { label: 'Prix croissant', value: 'priceAsc' },
    { label: 'Prix décroissant', value: 'priceDesc' },
  ];
  readonly favoriteListings = computed(() => {
    const favoriteIds = this.favorites.favorites();
    return this.listings.listings()
      .filter((listing) => favoriteIds.includes(listing.id))
      .sort((a, b) => this.sortBy() === 'priceAsc' ? a.price - b.price : this.sortBy() === 'priceDesc' ? b.price - a.price : b.score - a.score);
  });
}
