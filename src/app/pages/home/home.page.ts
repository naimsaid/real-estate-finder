import {
  ChangeDetectionStrategy,
  Component,
  DestroyRef,
  ElementRef,
  HostListener,
  ViewChild,
  computed,
  inject,
  signal,
} from '@angular/core';
import { RouterLink } from '@angular/router';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { ActivatedRoute, ParamMap, Router } from '@angular/router';
import { AdviceSectionComponent } from '../../components/advice-section/advice-section.component';
import { FiltersPanelComponent } from '../../components/filters-panel/filters-panel.component';
import { HeaderComponent } from '../../components/header/header.component';
import { ListingGridComponent } from '../../components/listing-grid/listing-grid.component';
import { ListingMapComponent } from '../../components/listing-map/listing-map.component';
import { SearchPanelComponent } from '../../components/search-panel/search-panel.component';
import {
  AmenityOption,
  EnergyRating,
  Filter,
  LocationOption,
  SelectOption,
  SortOption,
} from '../../models/filter';
import { Listing, ListingMode, PROPERTY_TYPES, PropertyType } from '../../models/listing';
import { AdviceService } from '../../services/advice.service';
import { FavoriteService } from '../../services/favorite.service';
import { ListingService } from '../../services/listing.service';
import { SavedSearchService } from '../../services/saved-search.service';
import { RecentlyViewedService } from '../../services/recently-viewed.service';
import { formatPrice, formatSurface } from '../../utils/listing-format';

const PAGE_SIZE = 12;
// Virtual scroll was evaluated for result sets above 100 listings. Pagination already limits
// the rendered DOM to 12 cards, so adding a virtualization dependency would only grow the bundle.
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
    RouterLink,
    AdviceSectionComponent,
    FiltersPanelComponent,
    HeaderComponent,
    ListingGridComponent,
    ListingMapComponent,
    SearchPanelComponent,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
  styleUrl: './home.page.scss',
  template: `
    <main class="app-shell">
      <app-header />
      <app-search-panel
        [modes]="modes"
        [locations]="locations()"
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
        <button
          #filtersTrigger
          class="mobile-filters-trigger"
          type="button"
          aria-controls="mobile-filters"
          [attr.aria-expanded]="filtersOpen()"
          (click)="openFilters()"
        >
          <span>Filtres</span>
          @if (activeFilterCount() > 0) {
            <span class="filter-count" aria-label="Nombre de filtres actifs">{{
              activeFilterCount()
            }}</span>
            <span class="active-filter-summary">{{ activeFilterSummary() }}</span>
          }
        </button>
        @if (filtersOpen()) {
          <button
            class="filters-backdrop"
            type="button"
            aria-label="Fermer les filtres"
            (click)="closeFilters()"
          ></button>
        }
        <div
          #filtersDrawer
          id="mobile-filters"
          class="filters-drawer"
          [class.open]="filtersOpen()"
          [attr.role]="isMobile() ? 'dialog' : null"
          [attr.aria-modal]="isMobile() ? 'true' : null"
          [attr.aria-labelledby]="isMobile() ? 'filters-drawer-title' : null"
          [attr.inert]="isMobile() && !filtersOpen() ? '' : null"
        >
          <div class="filters-drawer-heading">
            <div>
              <h2 id="filters-drawer-title">Filtres</h2>
              <span class="filters-summary" aria-live="polite">
                {{ activeFilterCount() }} filtre{{ activeFilterCount() > 1 ? 's' : '' }} actif{{
                  activeFilterCount() > 1 ? 's' : ''
                }}
              </span>
            </div>
            <button class="sheet-reset" type="button" (click)="resetAdvancedFilters()">
              Tout reinitialiser
            </button>
            <button type="button" aria-label="Fermer les filtres" (click)="closeFilters()">
              ✕
            </button>
          </div>
          <app-filters-panel
            [filters]="filters()"
            [propertyTypes]="propertyTypes"
            [amenities]="amenities"
            [sortOptions]="sortOptions"
            (filtersChange)="updateFilters($event)"
            (resetFilters)="resetAdvancedFilters()"
          />
        </div>
        <div class="results-column">
          <div class="view-toggle" role="group" aria-label="Mode d’affichage">
            <button
              class="save-search-button"
              type="button"
              [class.saved]="savedSearches.isSaved(filters())"
              [disabled]="savedSearches.isSaved(filters())"
              (click)="saveSearch()"
            >
              {{
                savedSearches.isSaved(filters())
                  ? 'Recherche enregistrée'
                  : 'Enregistrer cette recherche'
              }}
            </button>
            <button
              type="button"
              [class.active]="viewMode() === 'list'"
              [attr.aria-pressed]="viewMode() === 'list'"
              (click)="viewMode.set('list')"
            >
              Liste
            </button>
            <button
              type="button"
              [class.active]="viewMode() === 'map'"
              [attr.aria-pressed]="viewMode() === 'map'"
              (click)="viewMode.set('map')"
            >
              Carte
            </button>
          </div>
          @if (viewMode() === 'list') {
            <app-listing-grid
              [listings]="paginatedListings()"
              [totalListings]="listedListings().length"
              [currentPage]="currentPage()"
              [totalPages]="totalPages()"
              [loading]="listings.isLoading()"
              [error]="listings.error()"
              [sortOptions]="sortOptions"
              [sortBy]="filters().sortBy"
              [favoriteIds]="favorites.favorites()"
              [comparisonIds]="comparisonIds()"
              (sortChange)="updateFilters({ sortBy: $event })"
              (pageChange)="changePage($event)"
              (favoriteToggle)="favorites.toggleFavorite($event)"
              (comparisonToggle)="toggleComparison($event)"
            />
          } @else {
            <app-listing-map
              [listings]="sortedListings()"
              (visibleListingsChange)="updateVisibleMapListings($event)"
            />
          }
        </div>
      </section>
      @if (comparisonListings().length >= 2) {
        <section class="comparison-section" aria-labelledby="comparison-title">
          <div class="section-heading">
            <div>
              <p class="eyebrow">Votre sélection</p>
              <h2 id="comparison-title">Comparer les biens</h2>
            </div>
            <button type="button" (click)="clearComparison()">Effacer la sélection</button>
          </div>
          <div class="comparison-scroll">
            <table>
              <thead>
                <tr>
                  <th scope="col">Critère</th>
                  @for (item of comparisonListings(); track item.id) {
                    <th scope="col">
                      <a [routerLink]="['/annonces', item.id]">{{ item.title }}</a>
                    </th>
                  }
                </tr>
              </thead>
              <tbody>
                <tr>
                  <th scope="row">Prix</th>
                  @for (item of comparisonListings(); track item.id) {
                    <td>
                      {{ formatPrice(item.price, item.mode) }}
                    </td>
                  }
                </tr>
                <tr>
                  <th scope="row">Localisation</th>
                  @for (item of comparisonListings(); track item.id) {
                    <td>{{ item.district }}, {{ item.city }}</td>
                  }
                </tr>
                <tr>
                  <th scope="row">Type</th>
                  @for (item of comparisonListings(); track item.id) {
                    <td>{{ item.type }}</td>
                  }
                </tr>
                <tr>
                  <th scope="row">Surface</th>
                  @for (item of comparisonListings(); track item.id) {
                    <td>{{ formatSurface(item.area) }}</td>
                  }
                </tr>
                <tr>
                  <th scope="row">Pièces</th>
                  @for (item of comparisonListings(); track item.id) {
                    <td>{{ item.rooms }}</td>
                  }
                </tr>
                <tr>
                  <th scope="row">Chambres</th>
                  @for (item of comparisonListings(); track item.id) {
                    <td>{{ item.bedrooms }}</td>
                  }
                </tr>
                <tr>
                  <th scope="row">Salles de bain</th>
                  @for (item of comparisonListings(); track item.id) {
                    <td>{{ item.bathrooms }}</td>
                  }
                </tr>
              </tbody>
            </table>
          </div>
        </section>
      }
      @if (recentlyViewedListings().length) {
        <section class="recently-viewed" aria-labelledby="recently-viewed-title">
          <p class="eyebrow">Votre historique</p>
          <h2 id="recently-viewed-title">Vu récemment</h2>
          <div class="recent-list">
            @for (item of recentlyViewedListings(); track item.id) {
              <article>
                <img [src]="item.image" [alt]="'Photo de ' + item.title" />
                <div>
                  <h3>
                    <a [routerLink]="['/annonces', item.id]">{{ item.title }}</a>
                  </h3>
                  <p>{{ item.city }} · {{ formatSurface(item.area) }}</p>
                  <strong>{{ formatPrice(item.price, item.mode) }}</strong>
                </div>
              </article>
            }
          </div>
        </section>
      }
      <app-advice-section [advice]="advice" />
    </main>
  `,
})
export class HomePage {
  readonly formatPrice = formatPrice;
  readonly formatSurface = formatSurface;
  @ViewChild('filtersDrawer') private filtersDrawer?: ElementRef<HTMLElement>;
  @ViewChild('filtersTrigger') private filtersTrigger?: ElementRef<HTMLButtonElement>;
  readonly listings = inject(ListingService);
  readonly favorites = inject(FavoriteService);
  readonly savedSearches = inject(SavedSearchService);
  readonly recentlyViewed = inject(RecentlyViewedService);
  private readonly adviceService = inject(AdviceService);
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly destroyRef = inject(DestroyRef);

  readonly modes: SelectOption<ListingMode>[] = [
    { label: 'Acheter', value: 'buy' },
    { label: 'Louer', value: 'rent' },
  ];
  readonly propertyTypes: PropertyType[] = [...PROPERTY_TYPES];
  readonly locations = computed<LocationOption[]>(() => {
    const listings = this.listings.listings();
    const cities = new Map<string, LocationOption>();
    const districts = new Map<string, LocationOption>();

    for (const listing of listings) {
      if (!cities.has(listing.city)) {
        cities.set(listing.city, {
          label: listing.city,
          value: listing.city,
          type: 'city',
          city: listing.city,
          postalCode: listing.postalCode ?? '',
        });
      }
      if (!districts.has(listing.district)) {
        districts.set(listing.district, {
          label: listing.district,
          value: listing.district,
          type: 'district',
          city: listing.city,
          postalCode: listing.postalCode ?? '',
        });
      }
    }

    return [...cities.values(), ...districts.values()];
  });
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
  readonly viewMode = signal<'list' | 'map'>('list');
  readonly visibleMapListings = signal<readonly Listing[] | null>(null);
  readonly comparisonIds = signal<number[]>([]);
  readonly filtersOpen = signal(false);
  readonly isMobile = signal(false);
  readonly activeFilterCount = computed(() => this.countActiveFilters(this.filters()));
  readonly activeFilterSummary = computed(() => this.summarizeActiveFilters(this.filters()));
  readonly filteredListings = this.listings.search(this.filters);
  readonly sortedListings = this.filteredListings;
  readonly listedListings = computed(() => {
    const visibleListings = this.visibleMapListings();
    if (!visibleListings) return this.sortedListings();
    const visibleIds = new Set(visibleListings.map(({ id }) => id));
    return this.sortedListings().filter(({ id }) => visibleIds.has(id));
  });
  readonly totalPages = computed(() =>
    Math.max(1, Math.ceil(this.listedListings().length / PAGE_SIZE)),
  );
  readonly paginatedListings = computed(() => {
    const start = (this.currentPage() - 1) * PAGE_SIZE;
    return this.listedListings().slice(start, start + PAGE_SIZE);
  });
  readonly comparisonListings = computed(() => this.resolveListings(this.comparisonIds()));
  readonly recentlyViewedListings = computed(() =>
    this.resolveListings(this.recentlyViewed.recentlyViewedIds()),
  );

  constructor() {
    const mobileQuery = window.matchMedia?.('(max-width: 767px)');
    const updateViewport = (): void => {
      this.isMobile.set(mobileQuery?.matches ?? false);
      if (!mobileQuery?.matches) this.filtersOpen.set(false);
    };
    updateViewport();
    mobileQuery?.addEventListener('change', updateViewport);
    this.destroyRef.onDestroy(() => mobileQuery?.removeEventListener('change', updateViewport));

    this.route.queryParamMap.pipe(takeUntilDestroyed(this.destroyRef)).subscribe((params) => {
      const filters = this.filtersFromParams(params);
      if (JSON.stringify(filters) !== JSON.stringify(this.filters())) {
        this.filters.set(filters);
        this.currentPage.set(1);
      }
    });
  }

  openFilters(): void {
    this.filtersOpen.set(true);
    setTimeout(() => this.focusableFilterElements()[0]?.focus());
  }

  closeFilters(): void {
    this.filtersOpen.set(false);
    setTimeout(() => this.filtersTrigger?.nativeElement.focus());
  }

  @HostListener('document:keydown', ['$event'])
  handleDrawerKeydown(event: KeyboardEvent): void {
    if (!this.isMobile() || !this.filtersOpen()) return;
    if (event.key === 'Escape') {
      event.preventDefault();
      this.closeFilters();
      return;
    }
    if (event.key !== 'Tab') return;

    const focusable = this.focusableFilterElements();
    if (!focusable.length) return;
    const first = focusable[0];
    const last = focusable[focusable.length - 1];
    if (event.shiftKey && document.activeElement === first) {
      event.preventDefault();
      last.focus();
    } else if (!event.shiftKey && document.activeElement === last) {
      event.preventDefault();
      first.focus();
    }
  }

  private focusableFilterElements(): HTMLElement[] {
    return Array.from(
      this.filtersDrawer?.nativeElement.querySelectorAll<HTMLElement>(
        'button:not([disabled]), input:not([disabled]), select:not([disabled]), summary, [tabindex]:not([tabindex="-1"])',
      ) ?? [],
    ).filter(
      (element) =>
        element.getClientRects().length > 0 || getComputedStyle(element).display !== 'none',
    );
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
  updateVisibleMapListings(listings: readonly Listing[]): void {
    this.visibleMapListings.set(listings);
    this.currentPage.set(1);
  }
  changeMode(mode: ListingMode): void {
    this.updateFilters({ mode, maxBudget: mode === 'buy' ? 4000000 : 12000 });
  }
  resetAdvancedFilters(): void {
    this.updateFilters({
      propertyType: 'Tous',
      maxBudget: this.filters().mode === 'buy' ? 4000000 : 12000,
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

  private countActiveFilters(filters: Filter): number {
    return [
      filters.city !== DEFAULT_FILTERS.city,
      filters.propertyType !== DEFAULT_FILTERS.propertyType,
      filters.maxBudget !== (filters.mode === 'buy' ? 4000000 : 12000),
      filters.minRooms !== DEFAULT_FILTERS.minRooms,
      filters.minBedrooms > 0,
      filters.minBathrooms > 0,
      filters.minArea > 0 || filters.maxArea < 500,
      filters.amenities.length > 0,
      filters.newOnly,
      filters.query.trim().length > 0,
      filters.includeKeywords.trim().length > 0,
      filters.excludeKeywords.trim().length > 0,
      filters.publishedWithinDays > 0,
      filters.minFloor > 0 || filters.maxFloor > 0,
      filters.energyRatings.length > 0,
    ].filter(Boolean).length;
  }

  private summarizeActiveFilters(filters: Filter): string {
    const labels = [
      filters.city !== DEFAULT_FILTERS.city ? filters.city : '',
      filters.propertyType !== DEFAULT_FILTERS.propertyType ? filters.propertyType : '',
      filters.minRooms !== DEFAULT_FILTERS.minRooms ? `${filters.minRooms}+ pieces` : '',
      filters.minBedrooms > 0 ? `${filters.minBedrooms}+ chambres` : '',
      filters.amenities.length ? filters.amenities.join(', ') : '',
      filters.energyRatings.length ? `DPE ${filters.energyRatings.join(', ')}` : '',
    ].filter(Boolean);
    return labels.slice(0, 2).join(' · ') || 'Criteres personnalises';
  }

  saveSearch(): void {
    this.savedSearches.save(this.filters());
  }

  toggleComparison(id: number): void {
    this.comparisonIds.update((ids) =>
      ids.includes(id)
        ? ids.filter((itemId) => itemId !== id)
        : ids.length < 3
          ? [...ids, id]
          : ids,
    );
  }

  clearComparison(): void {
    this.comparisonIds.set([]);
  }

  private resolveListings(ids: number[]): Listing[] {
    return ids.flatMap((id) => {
      const listing = this.listings.getListingById(id);
      return listing ? [listing] : [];
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
