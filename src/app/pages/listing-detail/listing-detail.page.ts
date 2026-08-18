import { CurrencyPipe } from '@angular/common';
import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { HeaderComponent } from '../../components/header/header.component';
import { FavoriteService } from '../../services/favorite.service';
import { ListingService } from '../../services/listing.service';

@Component({
  selector: 'app-listing-detail-page',
  imports: [CurrencyPipe, HeaderComponent, RouterLink],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <main class="app-shell">
      <app-header />
      <section class="page-content detail-page">
        <a class="back-link" routerLink="/">← Retour aux annonces</a>
        @if (listing; as item) {
          <article class="listing-detail">
            <section class="detail-gallery" aria-label="Galerie photos de l’annonce">
              @for (image of item.images; track image; let index = $index) {
                <img
                  [src]="image"
                  [alt]="'Photo ' + (index + 1) + ' du bien « ' + item.title + ' » à ' + item.city"
                  (error)="useFallbackImage($event)"
                />
              }
            </section>
            <div class="detail-copy">
              <p class="eyebrow">{{ item.type }} · {{ item.city }}</p>
              <h1>{{ item.title }}</h1>
              <strong class="detail-price"
                >{{
                  item.price | currency: (item.mode === 'buy' ? 'MAD' : 'EUR') : 'symbol' : '1.0-0'
                }}{{ item.mode === 'rent' ? ' / mois' : '' }}</strong
              >
              <dl class="features detail-features">
                <div>
                  <dt>Surface</dt>
                  <dd>{{ item.area }} m2</dd>
                </div>
                <div>
                  <dt>Pièces</dt>
                  <dd>{{ item.rooms }}</dd>
                </div>
                <div>
                  <dt>Chambres</dt>
                  <dd>{{ item.bedrooms }}</dd>
                </div>
                <div>
                  <dt>Sdb</dt>
                  <dd>{{ item.bathrooms }}</dd>
                </div>
              </dl>
              <section class="detail-section" aria-labelledby="amenities-title">
                <h2 id="amenities-title">Équipements</h2>
                <div class="tags">
                  @for (tag of item.tags; track tag) {
                    <span>{{ tag }}</span>
                  }
                </div>
              </section>
              <section class="detail-section" aria-labelledby="description-title">
                <h2 id="description-title">Description</h2>
                <p class="detail-description">{{ item.description }}</p>
              </section>
              <section class="detail-section" aria-labelledby="location-title">
                <h2 id="location-title">Localisation</h2>
                <p class="detail-location">{{ item.district }}, {{ item.city }}</p>
              </section>
              <section class="detail-section" aria-labelledby="contact-title">
                <h2 id="contact-title">Contact</h2>
                <a [href]="'mailto:' + item.contactEmail">{{ item.contactEmail }}</a>
                <a
                  class="phone-link"
                  [href]="'tel:' + item.contactPhone"
                  [attr.aria-label]="'Appeler l’agence au ' + item.contactPhone"
                  >{{ item.contactPhone }}</a
                >
              </section>
              <div class="detail-actions">
                <a
                  class="ghost-button"
                  [routerLink]="['/contact', item.id]"
                  [attr.aria-label]="'Contacter l’agence pour ' + item.title"
                  >Contacter</a
                >
                <button
                  class="favorite-detail"
                  type="button"
                  (click)="favorites.toggleFavorite(item.id)"
                  [attr.aria-label]="
                    favorites.isFavorite(item.id)
                      ? 'Retirer cette annonce des favoris'
                      : 'Ajouter cette annonce aux favoris'
                  "
                >
                  {{
                    favorites.isFavorite(item.id) ? 'Retirer des favoris' : 'Ajouter aux favoris'
                  }}
                </button>
              </div>
            </div>
          </article>
        } @else {
          <div class="empty-state">
            <strong>Cette annonce est introuvable.</strong>
            <p>Elle a peut-être été retirée.</p>
            <a routerLink="/">Voir toutes les annonces</a>
          </div>
        }
      </section>
    </main>
  `,
})
export class ListingDetailPage {
  private readonly fallbackImage = '/assets/fallback-property.jpg';
  private readonly route = inject(ActivatedRoute);
  private readonly listings = inject(ListingService);
  readonly favorites = inject(FavoriteService);
  readonly listing = this.listings.getListingById(Number(this.route.snapshot.paramMap.get('id')));

  useFallbackImage(event: Event): void {
    const image = event.target as HTMLImageElement;
    if (!image.src.endsWith(this.fallbackImage)) image.src = this.fallbackImage;
  }
}
