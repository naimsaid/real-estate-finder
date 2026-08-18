import {
  ChangeDetectionStrategy,
  Component,
  DestroyRef,
  computed,
  inject,
  signal,
} from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { ActivatedRoute, ParamMap, Router } from '@angular/router';
import { AdviceSectionComponent } from '../../components/advice-section/advice-section.component';
import { FiltersPanelComponent } from '../../components/filters-panel/filters-panel.component';
import { HeaderComponent } from '../../components/header/header.component';
import { ListingGridComponent } from '../../components/listing-grid/listing-grid.component';
import { SearchPanelComponent } from '../../components/search-panel/search-panel.component';
import { AmenityOption, EnergyRating, Filter, SelectOption, SortOption } from '../../models/filter';
import { ListingMode, PropertyType } from '../../models/listing';
import { AdviceService } from '../../services/advice.service';
import { FavoriteService } from '../../services/favorite.service';
import { ListingService } from '../../services/listing.service';

const PAGE_SIZE = 12;
const DEFAULT_FILTERS: Filter = {
  mode: 'buy',
  city: 'Toutes les villes',
  propertyType: 'Tous',
  maxBudget: 4000000,
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
};

@Component({
  selector: 'app-home-page',
  imports: [
    AdviceSectionComponent,
    FiltersPanelComponent,
    HeaderComponent,
    ListingGridComponent,
    SearchPanelComponent,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <main class="app-shell">
      <app-header />
      <app-search-panel
        [modes]="modes"
        [cities]="cities"
        [propertyTypes]="propertyTypes"
        [selectedMode]="filters().mode"
        [selectedCity]="filters().city"
        [selectedType]="filters().propertyType"
        [minRooms]="filters().minRooms"
        [query]="filters().query"
        (modeChange)="changeMode($event)"
        (cityChange)="updateFilters({ city: $event })"
        (typeChange)="updateFilters({ propertyType: $event })"
        (roomsChange)="updateFilters({ minRooms: $event })"
        (queryChange)="updateFilters({ query: $event })"
      />
      <section class="content-grid" id="annonces">
        <app-filters-panel
          [filters]="filters()"
          [propertyTypes]="propertyTypes"
          [amenities]="amenities"
          [sortOptions]="sortOptions"
          (filtersChange)="updateFilters($event)"
          (resetFilters)="resetAdvancedFilters()"
        /><app-listing-grid
          [listings]="paginatedListings()"
          [totalListings]="sortedListings().length"
          [currentPage]="currentPage()"
          [totalPages]="totalPages()"
          [loading]="listings.isLoading()"
          [error]="listings.error()"
          [sortOptions]="sortOptions"
          [sortBy]="filters().sortBy"
          [favoriteIds]="favorites.favorites()"
          (sortChange)="updateFilters({ sortBy: $event })"
          (pageChange)="changePage($event)"
          (favoriteToggle)="favorites.toggleFavorite($event)"
        />
      </section>
      <app-advice-section [advice]="advice" />
    </main>
  `,
})
export class HomePage {
  readonly listings = inject(ListingService);
  readonly favorites = inject(FavoriteService);
  private readonly adviceService = inject(AdviceService);
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly destroyRef = inject(DestroyRef);

  readonly modes: SelectOption<ListingMode>[] = [
    { label: 'Acheter', value: 'buy' },
    { label: 'Louer', value: 'rent' },
  ];
  readonly propertyTypes: PropertyType[] = ['Appartement', 'Maison', 'Villa', 'Studio', 'Loft'];
  readonly cities = [
    'Toutes les villes',
    'Casablanca',
    'Rabat',
    'Marrakech',
    'Tanger',
    'Agadir',
    'Paris',
  ];
  readonly amenities: AmenityOption[] = [
    { label: 'Terrasse', icon: 'land-plot' },
    { label: 'Balcon', icon: 'building-2' },
    { label: 'Parking', icon: 'square-parking' },
    { label: 'Ascenseur', icon: 'building-2' },
    { label: 'Jardin', icon: 'trees' },
    { label: 'Piscine', icon: 'waves' },
    { label: 'Meuble', icon: 'sofa' },
    { label: 'Vue mer', icon: 'waves' },
    { label: 'Neuf', icon: 'sparkles' },
    { label: 'Fibre', icon: 'wifi' },
  ];
  readonly sortOptions: SelectOption<SortOption>[] = [
    { label: 'Pertinence', value: 'relevance' },
    { label: 'Prix croissant', value: 'priceAsc' },
    { label: 'Prix décroissant', value: 'priceDesc' },
  ];
  readonly advice = this.adviceService.getAdvice();
  readonly filters = signal<Filter>(this.filtersFromParams(this.route.snapshot.queryParamMap));
  readonly currentPage = signal(1);
  readonly filteredListings = this.listings.search(this.filters);
  readonly sortedListings = this.filteredListings;
  readonly totalPages = computed(() =>
    Math.max(1, Math.ceil(this.sortedListings().length / PAGE_SIZE)),
  );
  readonly paginatedListings = computed(() => {
    const start = (this.currentPage() - 1) * PAGE_SIZE;
    return this.sortedListings().slice(start, start + PAGE_SIZE);
  });

  constructor() {
    this.route.queryParamMap.pipe(takeUntilDestroyed(this.destroyRef)).subscribe((params) => {
      const filters = this.filtersFromParams(params);
      if (JSON.stringify(filters) !== JSON.stringify(this.filters())) {
        this.filters.set(filters);
        this.currentPage.set(1);
      }
    });
  }

  updateFilters(update: Partial<Filter>): void {
    this.filters.update((filters) => ({ ...filters, ...update }));
    this.currentPage.set(1);
    void this.router.navigate([], {
      relativeTo: this.route,
      queryParams: this.paramsFromFilters(this.filters()),
      replaceUrl: true,
    });
  }
  changePage(page: number): void {
    if (page >= 1 && page <= this.totalPages()) this.currentPage.set(page);
  }
  changeMode(mode: ListingMode): void {
    this.updateFilters({ mode, maxBudget: mode === 'buy' ? 4000000 : 12000 });
  }
  resetAdvancedFilters(): void {
    this.updateFilters({
      minBedrooms: 0,
      minBathrooms: 0,
      minArea: 0,
      maxArea: 500,
      amenities: [],
      newOnly: false,
      sortBy: 'relevance',
      includeKeywords: '',
      excludeKeywords: '',
      publishedWithinDays: 0,
      minFloor: 0,
      maxFloor: 0,
      energyRatings: [],
    });
  }

  private filtersFromParams(params: ParamMap): Filter {
    const number = (name: string, fallback: number) => {
      const value = Number(params.get(name));
      return params.has(name) && Number.isFinite(value) && value >= 0 ? value : fallback;
    };
    const allowedRatings: EnergyRating[] = ['A', 'B', 'C', 'D', 'E', 'F', 'G'];
    const mode = params.get('mode') === 'rent' ? 'rent' : 'buy';
    return {
      ...DEFAULT_FILTERS,
      mode,
      maxBudget: number('maxBudget', mode === 'rent' ? 12000 : DEFAULT_FILTERS.maxBudget),
      city: params.get('city') || DEFAULT_FILTERS.city,
      propertyType: this.propertyTypes.includes(params.get('type') as PropertyType)
        ? (params.get('type') as PropertyType)
        : 'Tous',
      minRooms: number('minRooms', DEFAULT_FILTERS.minRooms),
      minBedrooms: number('minBedrooms', 0),
      minBathrooms: number('minBathrooms', 0),
      minArea: number('minArea', 0),
      maxArea: number('maxArea', 500),
      amenities: params.getAll('amenity'),
      newOnly: params.get('newOnly') === 'true',
      sortBy: ['priceAsc', 'priceDesc'].includes(params.get('sortBy') ?? '')
        ? (params.get('sortBy') as SortOption)
        : 'relevance',
      query: params.get('query') ?? '',
      includeKeywords: params.get('include') ?? '',
      excludeKeywords: params.get('exclude') ?? '',
      publishedWithinDays: number('publishedWithinDays', 0),
      minFloor: number('minFloor', 0),
      maxFloor: number('maxFloor', 0),
      energyRatings: params
        .getAll('dpe')
        .filter((value): value is EnergyRating => allowedRatings.includes(value as EnergyRating)),
    };
  }

  private paramsFromFilters(filters: Filter): Record<string, string | string[]> {
    return {
      mode: filters.mode,
      city: filters.city,
      type: filters.propertyType,
      maxBudget: String(filters.maxBudget),
      minRooms: String(filters.minRooms),
      minBedrooms: String(filters.minBedrooms),
      minBathrooms: String(filters.minBathrooms),
      minArea: String(filters.minArea),
      maxArea: String(filters.maxArea),
      amenity: filters.amenities,
      newOnly: String(filters.newOnly),
      sortBy: filters.sortBy,
      query: filters.query,
      include: filters.includeKeywords,
      exclude: filters.excludeKeywords,
      publishedWithinDays: String(filters.publishedWithinDays),
      minFloor: String(filters.minFloor),
      maxFloor: String(filters.maxFloor),
      dpe: filters.energyRatings,
    };
  }
}
