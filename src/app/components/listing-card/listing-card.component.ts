import { CurrencyPipe } from '@angular/common';
import { ChangeDetectionStrategy, Component, EventEmitter, Input, Output } from '@angular/core';
import { RouterLink } from '@angular/router';
import { PropertyListing } from '../../models/listing';

@Component({
  selector: 'app-listing-card',
  imports: [CurrencyPipe, RouterLink],
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
        <div class="price-row">
          <strong>{{
            listing.price | currency: (listing.mode === 'buy' ? 'MAD' : 'EUR') : 'symbol' : '1.0-0'
          }}</strong
          ><span>{{ listing.mode === 'rent' ? '/ mois' : '' }}</span>
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
            <dd>{{ listing.area }} m2</dd>
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
  private readonly fallbackImage = '/assets/fallback-property.jpg';
  @Input({ required: true }) listing!: PropertyListing;
  @Input() favorite = false;
  @Output() readonly favoriteToggle = new EventEmitter<number>();

  useFallbackImage(event: Event): void {
    const image = event.target as HTMLImageElement;
    if (!image.src.endsWith(this.fallbackImage)) image.src = this.fallbackImage;
  }
}
