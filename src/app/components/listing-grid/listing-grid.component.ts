import { ChangeDetectionStrategy, Component, EventEmitter, Input, Output } from '@angular/core';
import { SelectOption, SortOption } from '../../models/filter';
import { Listing } from '../../models/listing';
import { ListingCardComponent } from '../listing-card/listing-card.component';

@Component({
  selector: 'app-listing-grid',
  imports: [ListingCardComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <section class="results-zone">
      <div class="results-heading">
        <div>
          <p class="eyebrow">Resultats</p>
          <h2 aria-live="polite" aria-atomic="true">
            {{ totalListings ?? listings.length }} logements disponibles
          </h2>
        </div>
        <div class="sort-control" role="group" aria-label="Trier les annonces">
          <span>Triés par</span>
          @for (option of sortOptions; track option.value) {
            <button
              class="sort-option"
              type="button"
              [class.active]="sortBy === option.value"
              [attr.aria-pressed]="sortBy === option.value"
              [attr.data-sort]="option.value"
              (click)="sortChange.emit(option.value)"
            >
              {{ option.label }}
            </button>
          }
        </div>
      </div>
      @if (loading) {
        <div
          class="listing-grid skeleton-grid"
          aria-busy="true"
          aria-label="Chargement des annonces"
        >
          @for (item of skeletonItems; track item) {
            <div class="property-card skeleton-card" aria-hidden="true">
              <div class="skeleton-photo"></div>
              <div class="skeleton-body"><span></span><span></span><span></span><span></span></div>
            </div>
          }
        </div>
      } @else if (error) {
        <div class="empty-state error-state" role="alert">
          <strong>Une erreur est survenue.</strong>
          <p>{{ error }}</p>
        </div>
      } @else if (listings.length) {
        <div class="listing-grid">
          @for (listing of listings; track listing.id) {
            <app-listing-card
              [listing]="listing"
              [favorite]="favoriteIds.includes(listing.id)"
              (favoriteToggle)="favoriteToggle.emit($event)"
            />
          }
        </div>
        @if (totalPages > 1) {
          <nav class="pagination" aria-label="Pagination des annonces">
            <button
              type="button"
              [disabled]="currentPage === 1"
              (click)="pageChange.emit(currentPage - 1)"
            >
              Précédent
            </button>
            <span>Page {{ currentPage }} sur {{ totalPages }}</span>
            <button
              type="button"
              [disabled]="currentPage === totalPages"
              (click)="pageChange.emit(currentPage + 1)"
            >
              Suivant
            </button>
          </nav>
        }
      } @else {
        <div class="empty-state">
          <strong>Aucun logement ne correspond a ces filtres.</strong>
          <p>Elargissez le budget ou choisissez une autre ville pour retrouver des annonces.</p>
        </div>
      }
    </section>
  `,
})
export class ListingGridComponent {
  @Input({ required: true }) listings!: Listing[];
  @Input() totalListings?: number;
  @Input() currentPage = 1;
  @Input() totalPages = 1;
  @Input() loading = false;
  @Input() error: string | null = null;
  @Input({ required: true }) sortOptions!: SelectOption<SortOption>[];
  @Input({ required: true }) sortBy!: SortOption;
  @Input() favoriteIds: number[] = [];
  @Output() readonly sortChange = new EventEmitter<SortOption>();
  @Output() readonly favoriteToggle = new EventEmitter<number>();
  @Output() readonly pageChange = new EventEmitter<number>();
  readonly skeletonItems = [1, 2, 3, 4];
}
