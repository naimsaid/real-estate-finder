import { ChangeDetectionStrategy, Component, EventEmitter, Input, Output } from '@angular/core';
import { RouterLink } from '@angular/router';
import { Listing } from '../../models/listing';
import { formatPrice, formatSurface } from '../../utils/listing-format';

@Component({
  selector: 'app-listing-card',
  imports: [RouterLink],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <article class="property-card">
      <div class="photo-wrap">
        <img
          [src]="listing.image"
          [alt]="'Photo du bien « ' + listing.title + ' » à ' + listing.city"
          (error)="useFallbackImage($event)"
        />
        <div class="photo-badges">
          @if (listing.isNew) {
            <span>Nouveau</span>
          }
          <span>Score {{ listing.score }}</span>
        </div>
        <button
          class="favorite"
          type="button"
          [class.saved]="favorite"
          [attr.aria-label]="favorite ? 'Retirer des favoris' : 'Ajouter aux favoris'"
          (click)="favoriteToggle.emit(listing.id)"
        >
          {{ favorite ? 'Favori' : 'Sauver' }}
        </button>
      </div>
      <div class="card-body">
        <label class="compare-control">
          <input
            type="checkbox"
            [checked]="selectedForComparison"
            [disabled]="comparisonDisabled && !selectedForComparison"
            (change)="comparisonToggle.emit(listing.id)"
          />
          <span>Comparer</span>
        </label>
        <div class="price-row">
          <strong>{{ formatPrice(listing.price, listing.mode) }}</strong>
        </div>
        <h3>
          <a
            class="listing-link card-link"
            [routerLink]="['/annonces', listing.id]"
            [attr.aria-label]="'Voir le détail de ' + listing.title"
            >{{ listing.title }}</a
          >
        </h3>
        <p>{{ listing.type }} a {{ listing.city }}, {{ listing.district }}</p>
        <dl class="features">
          <div>
            <dt>Surface</dt>
            <dd>{{ formatSurface(listing.area) }}</dd>
          </div>
          <div>
            <dt>Pieces</dt>
            <dd>{{ listing.rooms }}</dd>
          </div>
          <div>
            <dt>Chambres</dt>
            <dd>{{ listing.bedrooms }}</dd>
          </div>
          <div>
            <dt>Sdb</dt>
            <dd>{{ listing.bathrooms }}</dd>
          </div>
        </dl>
        <div class="tags">
          @for (tag of listing.tags; track tag) {
            <span>{{ tag }}</span>
          }
        </div>
        <div class="card-footer">
          <span>Maj il y a {{ listing.updatedMinutesAgo }} min</span
          ><a class="detail-link" [routerLink]="['/annonces', listing.id]">Voir l’annonce</a>
        </div>
      </div>
    </article>
  `,
})
export class ListingCardComponent {
  readonly formatPrice = formatPrice;
  readonly formatSurface = formatSurface;
  private readonly fallbackImage = '/assets/fallback-property.jpg';
  @Input({ required: true }) listing!: Listing;
  @Input() favorite = false;
  @Input() selectedForComparison = false;
  @Input() comparisonDisabled = false;
  @Output() readonly favoriteToggle = new EventEmitter<number>();
  @Output() readonly comparisonToggle = new EventEmitter<number>();

  useFallbackImage(event: Event): void {
    const image = event.target as HTMLImageElement;
    if (!image.src.endsWith(this.fallbackImage)) image.src = this.fallbackImage;
  }
}
