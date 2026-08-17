import { CurrencyPipe } from '@angular/common';
import { ChangeDetectionStrategy, Component, EventEmitter, Input, Output } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { LucideAngularModule } from 'lucide-angular';
import { AmenityOption, ListingFilters, SelectOption, SortOption } from '../../models/filter';
import { PropertyType } from '../../models/listing';

@Component({
  selector: 'app-filters-panel',
  imports: [CurrencyPipe, FormsModule, LucideAngularModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <aside class="filters-panel" aria-label="Filtres avances"><details class="more-filters" open>
      <summary><span>Plus de criteres</span><b>+</b></summary>
      <div class="advanced-grid">
        <label class="range-field compact-range"><span class="field-label"><i-lucide class="criteria-icon" name="house" aria-hidden="true" />Budget maximum</span><strong>{{ filters.maxBudget | currency: (filters.mode === 'buy' ? 'MAD' : 'EUR') : 'symbol' : '1.0-0' }}</strong><input type="range" [min]="budgetMin" [max]="budgetMax" [step]="budgetStep" [ngModel]="filters.maxBudget" (ngModelChange)="patch({ maxBudget: +$event })" /></label>
        <div class="filter-group"><span class="field-label"><i-lucide class="criteria-icon" name="building-2" aria-hidden="true" />Types populaires</span><div class="chip-list"><button type="button" [class.selected]="filters.propertyType === 'Tous'" (click)="patch({ propertyType: 'Tous' })">Tous</button>@for (type of propertyTypes; track type) { <button type="button" [class.selected]="filters.propertyType === type" (click)="patch({ propertyType: type })">{{ type }}</button> }</div></div>
        <label><span class="field-label"><i-lucide class="criteria-icon" name="bed-double" aria-hidden="true" />Chambres min.</span><select [ngModel]="filters.minBedrooms" (ngModelChange)="patch({ minBedrooms: +$event })">@for (value of [0, 1, 2, 3, 4, 5]; track value) { <option [value]="value">{{ value === 0 ? 'Indifferent' : value + '+' }}</option> }</select></label>
        <label><span class="field-label"><i-lucide class="criteria-icon" name="bath" aria-hidden="true" />Salles de bain min.</span><select [ngModel]="filters.minBathrooms" (ngModelChange)="patch({ minBathrooms: +$event })">@for (value of [0, 1, 2, 3, 4]; track value) { <option [value]="value">{{ value === 0 ? 'Indifferent' : value + '+' }}</option> }</select></label>
        <label class="range-field compact-range area-range"><span class="field-label"><i-lucide class="criteria-icon" name="ruler" aria-hidden="true" />Surface</span><strong>{{ filters.minArea }} m2 - {{ filters.maxArea === 500 ? 'Illimitee' : filters.maxArea + ' m2' }}</strong><div class="dual-range"><input type="range" min="0" max="500" step="10" [ngModel]="filters.minArea" (ngModelChange)="setMinArea(+$event)" aria-label="Surface minimum" /><input type="range" min="0" max="500" step="10" [ngModel]="filters.maxArea" (ngModelChange)="setMaxArea(+$event)" aria-label="Surface maximum" /></div></label>
        <label><span class="field-label"><i-lucide class="criteria-icon" name="arrow-up-down" aria-hidden="true" />Trier par</span><select [ngModel]="filters.sortBy" (ngModelChange)="patch({ sortBy: $event })">@for (option of sortOptions; track option.value) { <option [value]="option.value">{{ option.label }}</option> }</select></label>
      </div>
      <label class="toggle-row"><input type="checkbox" [checked]="filters.newOnly" (change)="patch({ newOnly: $any($event.target).checked })" /><span><i-lucide class="criteria-icon" name="sparkles" aria-hidden="true" />Nouvelles annonces uniquement</span></label>
      <div class="filter-group"><span>Equipements et options</span><div class="amenity-list">@for (amenity of amenities; track amenity.label) { <button type="button" [class.selected]="filters.amenities.includes(amenity.label)" (click)="toggleAmenity(amenity.label)"><i-lucide class="criteria-icon" [name]="amenity.icon" aria-hidden="true" />{{ amenity.label }}</button> }</div></div>
      <button class="reset-button" type="button" (click)="resetFilters.emit()">Reinitialiser les criteres</button>
    </details></aside>
  `,
})
export class FiltersPanelComponent {
  @Input({ required: true }) filters!: ListingFilters;
  @Input({ required: true }) propertyTypes!: PropertyType[];
  @Input({ required: true }) amenities!: AmenityOption[];
  @Input({ required: true }) sortOptions!: SelectOption<SortOption>[];
  @Output() readonly filtersChange = new EventEmitter<Partial<ListingFilters>>();
  @Output() readonly resetFilters = new EventEmitter<void>();

  get budgetStep(): number { return this.filters.mode === 'buy' ? 50000 : 250; }
  get budgetMax(): number { return this.filters.mode === 'buy' ? 5000000 : 25000; }
  get budgetMin(): number { return this.filters.mode === 'buy' ? 500000 : 1000; }
  patch(update: Partial<ListingFilters>): void { this.filtersChange.emit(update); }
  setMinArea(value: number): void { this.patch({ minArea: Math.min(value, this.filters.maxArea - 10) }); }
  setMaxArea(value: number): void { this.patch({ maxArea: Math.max(value, this.filters.minArea + 10) }); }
  toggleAmenity(amenity: string): void { this.patch({ amenities: this.filters.amenities.includes(amenity) ? this.filters.amenities.filter((item) => item !== amenity) : [...this.filters.amenities, amenity] }); }
}
