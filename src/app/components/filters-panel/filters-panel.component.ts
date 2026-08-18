import { CurrencyPipe } from '@angular/common';
import { ChangeDetectionStrategy, Component, EventEmitter, Input, Output } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { LucideDynamicIcon } from '@lucide/angular';
import { AmenityOption, EnergyRating, Filter, SelectOption, SortOption } from '../../models/filter';
import { PropertyType } from '../../models/listing';

@Component({
  selector: 'app-filters-panel',
  imports: [CurrencyPipe, FormsModule, LucideDynamicIcon],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <aside class="filters-panel" aria-label="Filtres avances">
      <details class="more-filters" open>
        <summary><span>Plus de criteres</span><b>+</b></summary>
        <div class="advanced-grid">
          <label class="range-field compact-range"
            ><span class="field-label"
              ><svg class="criteria-icon" lucideIcon="house" aria-hidden="true"></svg>Budget
              maximum</span
            ><strong>{{
              filters.maxBudget
                | currency: (filters.mode === 'buy' ? 'MAD' : 'EUR') : 'symbol' : '1.0-0'
            }}</strong
            ><input
              type="range"
              [min]="budgetMin"
              [max]="budgetMax"
              [step]="budgetStep"
              [ngModel]="filters.maxBudget"
              (ngModelChange)="patch({ maxBudget: +$event })"
          /></label>
          <div class="filter-group">
            <span class="field-label"
              ><svg class="criteria-icon" lucideIcon="building-2" aria-hidden="true"></svg>Types
              populaires</span
            >
            <div class="chip-list">
              <button
                type="button"
                [class.selected]="filters.propertyType === 'Tous'"
                (click)="patch({ propertyType: 'Tous' })"
              >
                Tous
              </button>
              @for (type of propertyTypes; track type) {
                <button
                  type="button"
                  [class.selected]="filters.propertyType === type"
                  (click)="patch({ propertyType: type })"
                >
                  {{ type }}
                </button>
              }
            </div>
          </div>
          <label
            ><span class="field-label"
              ><svg class="criteria-icon" lucideIcon="bed-double" aria-hidden="true"></svg>Chambres
              min.</span
            ><select
              [ngModel]="filters.minBedrooms"
              (ngModelChange)="patch({ minBedrooms: +$event })"
            >
              @for (value of [0, 1, 2, 3, 4, 5]; track value) {
                <option [value]="value">{{ value === 0 ? 'Indifferent' : value + '+' }}</option>
              }
            </select></label
          >
          <label
            ><span class="field-label"
              ><svg class="criteria-icon" lucideIcon="bath" aria-hidden="true"></svg>Salles de bain
              min.</span
            ><select
              [ngModel]="filters.minBathrooms"
              (ngModelChange)="patch({ minBathrooms: +$event })"
            >
              @for (value of [0, 1, 2, 3, 4]; track value) {
                <option [value]="value">{{ value === 0 ? 'Indifferent' : value + '+' }}</option>
              }
            </select></label
          >
          <div class="range-field compact-range area-range">
            <span class="field-label"
              ><svg class="criteria-icon" lucideIcon="ruler" aria-hidden="true"></svg>Surface</span
            ><strong id="area-range-value"
              >{{ filters.minArea }} m2 -
              {{ filters.maxArea === 500 ? 'Illimitee' : filters.maxArea + ' m2' }}</strong
            >
            <div
              class="dual-range"
              role="group"
              aria-label="Plage de surface"
              aria-describedby="area-range-value"
              [style.--range-start]="minAreaPercent + '%'"
              [style.--range-end]="maxAreaPercent + '%'"
            >
              <input
                type="range"
                min="0"
                max="500"
                step="10"
                [ngModel]="filters.minArea"
                (ngModelChange)="setMinArea(+$event)"
                aria-label="Surface minimum en metres carres"
                [attr.aria-valuemax]="filters.maxArea - 10"
                [attr.aria-valuetext]="filters.minArea + ' metres carres minimum'"
              /><input
                type="range"
                min="0"
                max="500"
                step="10"
                [ngModel]="filters.maxArea"
                (ngModelChange)="setMaxArea(+$event)"
                aria-label="Surface maximum en metres carres"
                [attr.aria-valuemin]="filters.minArea + 10"
                [attr.aria-valuetext]="
                  filters.maxArea === 500
                    ? 'Surface maximum illimitee'
                    : filters.maxArea + ' metres carres maximum'
                "
              />
            </div>
          </div>
          <label
            ><span class="field-label"
              ><svg class="criteria-icon" lucideIcon="arrow-up-down" aria-hidden="true"></svg>Trier
              par</span
            ><select [ngModel]="filters.sortBy" (ngModelChange)="patch({ sortBy: $event })">
              @for (option of sortOptions; track option.value) {
                <option [value]="option.value">{{ option.label }}</option>
              }
            </select></label
          >
          <label
            ><span class="field-label">Mots-cles inclus</span
            ><input
              type="text"
              placeholder="Ex. terrasse, calme"
              [ngModel]="filters.includeKeywords"
              (ngModelChange)="patch({ includeKeywords: $event })"
          /></label>
          <label
            ><span class="field-label">Mots-cles exclus</span
            ><input
              type="text"
              placeholder="Ex. rez-de-chaussee, travaux"
              [ngModel]="filters.excludeKeywords"
              (ngModelChange)="patch({ excludeKeywords: $event })"
          /></label>
          <label
            ><span class="field-label">Publie depuis</span
            ><select
              [ngModel]="filters.publishedWithinDays"
              (ngModelChange)="patch({ publishedWithinDays: +$event })"
            >
              <option [value]="0">Indifferent</option>
              <option [value]="1">24 heures</option>
              <option [value]="3">3 jours</option>
              <option [value]="7">7 jours</option>
              <option [value]="30">30 jours</option>
            </select></label
          >
          <label
            ><span class="field-label">Etage minimum</span
            ><select [ngModel]="filters.minFloor" (ngModelChange)="setMinFloor(+$event)">
              @for (value of [0, 1, 2, 3, 4, 5, 10]; track value) {
                <option [value]="value">{{ value === 0 ? 'Indifferent' : value }}</option>
              }
            </select></label
          >
          <label
            ><span class="field-label">Etage maximum</span
            ><select [ngModel]="filters.maxFloor" (ngModelChange)="setMaxFloor(+$event)">
              <option [value]="0">Indifferent</option>
              @for (value of [1, 2, 3, 4, 5, 10, 20]; track value) {
                <option [value]="value">{{ value }}</option>
              }
            </select></label
          >
        </div>
        <div class="filter-group">
          <span>Performance energetique (si renseignee)</span>
          <div class="chip-list">
            @for (rating of energyRatingOptions; track rating) {
              <button
                type="button"
                [class.selected]="filters.energyRatings.includes(rating)"
                (click)="toggleEnergyRating(rating)"
              >
                {{ rating }}
              </button>
            }
          </div>
        </div>
        <label class="toggle-row"
          ><input
            type="checkbox"
            [checked]="filters.newOnly"
            (change)="onNewOnlyChange($event)"
          /><span
            ><svg class="criteria-icon" lucideIcon="sparkles" aria-hidden="true"></svg>Nouvelles annonces
            uniquement</span
          ></label
        >
        <div class="filter-group">
          <span>Equipements et options</span>
          <div class="amenity-list">
            @for (amenity of amenities; track amenity.label) {
              <button
                type="button"
                [class.selected]="filters.amenities.includes(amenity.label)"
                (click)="toggleAmenity(amenity.label)"
              >
                <svg class="criteria-icon" [lucideIcon]="amenity.icon" aria-hidden="true"></svg>{{
                  amenity.label
                }}
              </button>
            }
          </div>
        </div>
        <button class="reset-button" type="button" (click)="resetFilters.emit()">
          Reinitialiser les criteres
        </button>
      </details>
    </aside>
  `,
})
export class FiltersPanelComponent {
  readonly energyRatingOptions: EnergyRating[] = ['A', 'B', 'C', 'D', 'E', 'F', 'G'];
  @Input({ required: true }) filters!: Filter;
  @Input({ required: true }) propertyTypes!: PropertyType[];
  @Input({ required: true }) amenities!: AmenityOption[];
  @Input({ required: true }) sortOptions!: SelectOption<SortOption>[];
  @Output() readonly filtersChange = new EventEmitter<Partial<Filter>>();
  @Output() readonly resetFilters = new EventEmitter<void>();

  get budgetStep(): number {
    return this.filters.mode === 'buy' ? 50000 : 250;
  }
  get budgetMax(): number {
    return this.filters.mode === 'buy' ? 5000000 : 25000;
  }
  get budgetMin(): number {
    return this.filters.mode === 'buy' ? 500000 : 1000;
  }
  get minAreaPercent(): number {
    return (this.filters.minArea / 500) * 100;
  }
  get maxAreaPercent(): number {
    return (this.filters.maxArea / 500) * 100;
  }
  patch(update: Partial<Filter>): void {
    this.filtersChange.emit(update);
  }
  onNewOnlyChange(event: Event): void {
    if (event.target instanceof HTMLInputElement) {
      this.patch({ newOnly: event.target.checked });
    }
  }
  setMinArea(value: number): void {
    this.patch({ minArea: Math.min(value, this.filters.maxArea - 10) });
  }
  setMaxArea(value: number): void {
    this.patch({ maxArea: Math.max(value, this.filters.minArea + 10) });
  }
  setMinFloor(value: number): void {
    this.patch({
      minFloor: this.filters.maxFloor > 0 ? Math.min(value, this.filters.maxFloor) : value,
    });
  }
  setMaxFloor(value: number): void {
    this.patch({ maxFloor: value > 0 ? Math.max(value, this.filters.minFloor) : 0 });
  }
  toggleEnergyRating(rating: EnergyRating): void {
    this.patch({
      energyRatings: this.filters.energyRatings.includes(rating)
        ? this.filters.energyRatings.filter((value) => value !== rating)
        : [...this.filters.energyRatings, rating],
    });
  }
  toggleAmenity(amenity: string): void {
    this.patch({
      amenities: this.filters.amenities.includes(amenity)
        ? this.filters.amenities.filter((item) => item !== amenity)
        : [...this.filters.amenities, amenity],
    });
  }
}
