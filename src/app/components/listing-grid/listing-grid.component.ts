import { ChangeDetectionStrategy, Component, EventEmitter, Input, Output } from '@angular/core';
import { SelectOption, SortOption } from '../../models/filter';
import { PropertyListing } from '../../models/listing';
import { ListingCardComponent } from '../listing-card/listing-card.component';

@Component({
  selector: 'app-listing-grid',
  imports: [ListingCardComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <section class="results-zone">
      <div class="results-heading"><div><p class="eyebrow">Resultats</p><h2>{{ listings.length }} logements disponibles</h2></div>
        <div class="sort-control" role="group" aria-label="Trier les annonces"><span>Triés par</span>@for (option of sortOptions; track option.value) { <button class="sort-option" type="button" [class.active]="sortBy === option.value" [attr.aria-pressed]="sortBy === option.value" [attr.data-sort]="option.value" (click)="sortChange.emit(option.value)">{{ option.label }}</button> }</div>
      </div>
      @if (listings.length) { <div class="listing-grid">@for (listing of listings; track listing.id) { <app-listing-card [listing]="listing" [favorite]="favoriteIds.includes(listing.id)" (favoriteToggle)="favoriteToggle.emit($event)" /> }</div> }
      @else { <div class="empty-state"><strong>Aucun logement ne correspond a ces filtres.</strong><p>Elargissez le budget ou choisissez une autre ville pour retrouver des annonces.</p></div> }
    </section>
  `,
})
export class ListingGridComponent {
  @Input({ required: true }) listings!: PropertyListing[];
  @Input({ required: true }) sortOptions!: SelectOption<SortOption>[];
  @Input({ required: true }) sortBy!: SortOption;
  @Input() favoriteIds: number[] = [];
  @Output() readonly sortChange = new EventEmitter<SortOption>();
  @Output() readonly favoriteToggle = new EventEmitter<number>();
}
