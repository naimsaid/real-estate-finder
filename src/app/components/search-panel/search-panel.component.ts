import {
  ChangeDetectionStrategy,
  Component,
  DestroyRef,
  EventEmitter,
  Input,
  OnChanges,
  Output,
  SimpleChanges,
  inject,
  signal,
} from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Subject, debounceTime } from 'rxjs';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { LocationOption, SelectOption } from '../../models/filter';
import { ListingMode, PropertyType } from '../../models/listing';

@Component({
  selector: 'app-search-panel',
  imports: [FormsModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <section class="search-section" aria-label="Recherche immobiliere">
      <div class="search-panel">
        <div class="search-topline">
          <div class="mode-switch" role="group" aria-label="Type de transaction">
            @for (mode of modes; track mode.value) {
              <button
                type="button"
                [class.active]="selectedMode === mode.value"
                (click)="modeChange.emit(mode.value)"
              >
                {{ mode.label }}
              </button>
            }
          </div>
          <label class="search-field"
            ><span>Ville, quartier ou mot-cle</span>
            <input
              type="search"
              placeholder="Ex: Anfa, terrasse, vue mer..."
              [ngModel]="query"
              (ngModelChange)="queryChange.emit($event)"
            />
          </label>
        </div>
        <div class="search-bottomline">
          <div class="quick-filters">
            <div class="location-field">
              <label for="location-search">Ville, quartier ou code postal</label>
              <input
                id="location-search"
                type="search"
                role="combobox"
                autocomplete="off"
                placeholder="Ex : Casablanca, Anfa, 20000"
                [ngModel]="locationSearch()"
                [attr.aria-expanded]="open()"
                aria-autocomplete="list"
                aria-controls="location-results"
                [attr.aria-activedescendant]="activeOptionId()"
                (ngModelChange)="searchLocation($event)"
                (focus)="showSuggestions()"
                (blur)="hideSuggestions()"
                (keydown)="handleLocationKeydown($event)"
              />
              @if (open()) {
                <div
                  id="location-results"
                  class="location-results"
                  role="listbox"
                  aria-label="Suggestions de localisation"
                >
                  @if (cityResults().length) {
                    <div
                      class="location-group"
                      role="group"
                      aria-labelledby="location-cities-label"
                    >
                      <div id="location-cities-label" class="location-group-label">Villes</div>
                      @for (location of cityResults(); track location.value; let index = $index) {
                        <button
                          type="button"
                          role="option"
                          [id]="optionId(index)"
                          [attr.aria-selected]="activeIndex() === index"
                          [class.active]="activeIndex() === index"
                          (mousedown)="$event.preventDefault()"
                          (click)="selectLocation(location)"
                        >
                          <span>{{ location.label }}</span
                          ><small>{{ location.postalCode }}</small>
                        </button>
                      }
                    </div>
                  }
                  @if (districtResults().length) {
                    <div
                      class="location-group"
                      role="group"
                      aria-labelledby="location-districts-label"
                    >
                      <div id="location-districts-label" class="location-group-label">
                        Quartiers
                      </div>
                      @for (
                        location of districtResults();
                        track location.value;
                        let index = $index
                      ) {
                        <button
                          type="button"
                          role="option"
                          [id]="optionId(cityResults().length + index)"
                          [attr.aria-selected]="activeIndex() === cityResults().length + index"
                          [class.active]="activeIndex() === cityResults().length + index"
                          (mousedown)="$event.preventDefault()"
                          (click)="selectLocation(location)"
                        >
                          <span>{{ location.label }}</span
                          ><small>{{ location.city }} · {{ location.postalCode }}</small>
                        </button>
                      }
                    </div>
                  }
                  @if (!results().length) {
                    <p class="location-empty" role="status">Aucune localisation trouvée</p>
                  }
                </div>
              }
              <span class="visually-hidden" aria-live="polite">{{ resultAnnouncement() }}</span>
            </div>
            <label
              ><span>Type</span
              ><select [ngModel]="selectedType" (ngModelChange)="typeChange.emit($event)">
                <option value="Tous">Tous</option>
                @for (type of propertyTypes; track type) {
                  <option [value]="type">{{ type }}</option>
                }
              </select></label
            >
            <label
              ><span>Pieces min.</span
              ><select [ngModel]="minRooms" (ngModelChange)="roomsChange.emit(+$event)">
                @for (room of [1, 2, 3, 4, 5]; track room) {
                  <option [value]="room">{{ room }}+</option>
                }
              </select></label
            >
          </div>
          <a class="search-button" href="#annonces">Rechercher</a>
        </div>
      </div>
    </section>
  `,
})
export class SearchPanelComponent implements OnChanges {
  @Input({ required: true }) modes!: SelectOption<ListingMode>[];
  @Input({ required: true }) locations!: LocationOption[];
  @Input({ required: true }) propertyTypes!: PropertyType[];
  @Input({ required: true }) selectedMode!: ListingMode;
  @Input({ required: true }) selectedCity!: string;
  @Input({ required: true }) selectedType!: PropertyType | 'Tous';
  @Input({ required: true }) minRooms!: number;
  @Input() query = '';
  @Output() readonly modeChange = new EventEmitter<ListingMode>();
  @Output() readonly cityChange = new EventEmitter<string>();
  @Output() readonly typeChange = new EventEmitter<PropertyType | 'Tous'>();
  @Output() readonly roomsChange = new EventEmitter<number>();
  @Output() readonly queryChange = new EventEmitter<string>();

  readonly locationSearch = signal('');
  readonly results = signal<LocationOption[]>([]);
  readonly open = signal(false);
  readonly activeIndex = signal(-1);
  readonly cityResults = signal<LocationOption[]>([]);
  readonly districtResults = signal<LocationOption[]>([]);
  readonly resultAnnouncement = signal('');
  private readonly searchTerms = new Subject<string>();
  private readonly destroyRef = inject(DestroyRef);

  constructor() {
    this.searchTerms
      .pipe(debounceTime(200), takeUntilDestroyed(this.destroyRef))
      .subscribe((term) => this.updateResults(term));
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['selectedCity']) {
      this.locationSearch.set(this.selectedCity === 'Toutes les villes' ? '' : this.selectedCity);
    }
  }

  searchLocation(value: string): void {
    this.locationSearch.set(value);
    this.open.set(true);
    this.activeIndex.set(-1);
    if (!value.trim()) this.cityChange.emit('Toutes les villes');
    this.searchTerms.next(value);
  }

  showSuggestions(): void {
    this.open.set(true);
    this.updateResults(this.locationSearch());
  }

  hideSuggestions(): void {
    this.open.set(false);
    this.activeIndex.set(-1);
  }

  selectLocation(location: LocationOption): void {
    this.locationSearch.set(location.label);
    this.cityChange.emit(location.value);
    this.hideSuggestions();
  }

  handleLocationKeydown(event: KeyboardEvent): void {
    if (event.key === 'Escape') {
      this.hideSuggestions();
      return;
    }
    if (!['ArrowDown', 'ArrowUp', 'Enter'].includes(event.key)) return;
    event.preventDefault();
    const results = this.results();
    if (!this.open()) this.showSuggestions();
    if (!results.length) return;
    if (event.key === 'Enter') {
      if (this.activeIndex() >= 0) this.selectLocation(results[this.activeIndex()]);
      return;
    }
    const direction = event.key === 'ArrowDown' ? 1 : -1;
    this.activeIndex.update((index) => (index + direction + results.length) % results.length);
  }

  optionId(index: number): string {
    return `location-option-${index}`;
  }

  activeOptionId(): string | null {
    return this.activeIndex() >= 0 ? this.optionId(this.activeIndex()) : null;
  }

  private updateResults(term: string): void {
    const normalized = this.normalize(term);
    const results = this.locations.filter((location) =>
      this.normalize(`${location.label} ${location.city} ${location.postalCode}`).includes(
        normalized,
      ),
    );
    const cities = results.filter(({ type }) => type === 'city');
    const districts = results.filter(({ type }) => type === 'district');
    this.results.set([...cities, ...districts]);
    this.cityResults.set(cities);
    this.districtResults.set(districts);
    this.resultAnnouncement.set(`${results.length} suggestion${results.length > 1 ? 's' : ''}`);
  }

  private normalize(value: string): string {
    return value
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .toLowerCase()
      .trim();
  }
}
