import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import { AdviceSectionComponent } from '../../components/advice-section/advice-section.component';
import { FiltersPanelComponent } from '../../components/filters-panel/filters-panel.component';
import { HeaderComponent } from '../../components/header/header.component';
import { ListingGridComponent } from '../../components/listing-grid/listing-grid.component';
import { SearchPanelComponent } from '../../components/search-panel/search-panel.component';
import { AmenityOption, ListingFilters, SelectOption, SortOption } from '../../models/filter';
import { ListingMode, PropertyType } from '../../models/listing';
import { AdviceService } from '../../services/advice.service';
import { FavoriteService } from '../../services/favorite.service';
import { ListingService } from '../../services/listing.service';

@Component({
  selector: 'app-home-page',
  imports: [AdviceSectionComponent, FiltersPanelComponent, HeaderComponent, ListingGridComponent, SearchPanelComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <main class="app-shell">
      <app-header />
      <app-search-panel [modes]="modes" [cities]="cities" [propertyTypes]="propertyTypes" [selectedMode]="filters().mode" [selectedCity]="filters().city" [selectedType]="filters().propertyType" [minRooms]="filters().minRooms" [query]="filters().query" (modeChange)="changeMode($event)" (cityChange)="updateFilters({ city: $event })" (typeChange)="updateFilters({ propertyType: $event })" (roomsChange)="updateFilters({ minRooms: $event })" (queryChange)="updateFilters({ query: $event })" />
      <section class="content-grid" id="annonces"><app-filters-panel [filters]="filters()" [propertyTypes]="propertyTypes" [amenities]="amenities" [sortOptions]="sortOptions" (filtersChange)="updateFilters($event)" (resetFilters)="resetAdvancedFilters()" /><app-listing-grid [listings]="filteredListings()" [sortOptions]="sortOptions" [sortBy]="filters().sortBy" [favoriteIds]="favorites.favorites()" (sortChange)="updateFilters({ sortBy: $event })" (favoriteToggle)="favorites.toggle($event)" /></section>
      <app-advice-section [advice]="advice" />
    </main>
  `,
})
export class HomePage {
  private readonly listings = inject(ListingService);
  readonly favorites = inject(FavoriteService);
  private readonly adviceService = inject(AdviceService);

  readonly modes: SelectOption<ListingMode>[] = [{ label: 'Acheter', value: 'buy' }, { label: 'Louer', value: 'rent' }];
  readonly propertyTypes: PropertyType[] = ['Appartement', 'Maison', 'Villa', 'Studio', 'Loft'];
  readonly cities = ['Toutes les villes', 'Casablanca', 'Rabat', 'Marrakech', 'Tanger', 'Agadir', 'Paris'];
  readonly amenities: AmenityOption[] = [{ label: 'Terrasse', icon: 'land-plot' }, { label: 'Balcon', icon: 'building-2' }, { label: 'Parking', icon: 'square-parking' }, { label: 'Ascenseur', icon: 'building-2' }, { label: 'Jardin', icon: 'trees' }, { label: 'Piscine', icon: 'waves' }, { label: 'Meuble', icon: 'sofa' }, { label: 'Vue mer', icon: 'waves' }, { label: 'Neuf', icon: 'sparkles' }, { label: 'Fibre', icon: 'wifi' }];
  readonly sortOptions: SelectOption<SortOption>[] = [{ label: 'Pertinence', value: 'relevance' }, { label: 'Prix croissant', value: 'priceAsc' }, { label: 'Prix décroissant', value: 'priceDesc' }];
  readonly advice = this.adviceService.getAdvice();
  readonly filters = signal<ListingFilters>({ mode: 'buy', city: 'Toutes les villes', propertyType: 'Tous', maxBudget: 4000000, minRooms: 1, minBedrooms: 0, minBathrooms: 0, minArea: 0, maxArea: 500, amenities: [], newOnly: false, sortBy: 'relevance', query: '' });
  readonly filteredListings = computed(() => this.listings.filter(this.listings.listings(), this.filters()));

  updateFilters(update: Partial<ListingFilters>): void { this.filters.update((filters) => ({ ...filters, ...update })); }
  changeMode(mode: ListingMode): void { this.updateFilters({ mode, maxBudget: mode === 'buy' ? 4000000 : 12000 }); }
  resetAdvancedFilters(): void { this.updateFilters({ minBedrooms: 0, minBathrooms: 0, minArea: 0, maxArea: 500, amenities: [], newOnly: false, sortBy: 'relevance' }); }
}
