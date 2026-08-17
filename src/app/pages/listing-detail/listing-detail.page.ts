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
                <img [src]="image" [alt]="item.title + ' — photo ' + (index + 1)" />
              }
            </section>
            <div class="detail-copy">
              <p class="eyebrow">{{ item.type }} · {{ item.city }}</p>
              <h1>{{ item.title }}</h1>
              <p class="detail-location">{{ item.district }}, {{ item.city }}</p>
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
              <div class="detail-actions">
                <a
                  class="ghost-button"
                  [href]="'mailto:' + item.contactEmail + '?subject=Annonce : ' + item.title"
                  [attr.aria-label]="'Contacter l’agence par e-mail pour ' + item.title"
                  >Contacter</a
                >
                <a
                  class="phone-link"
                  [href]="'tel:' + item.contactPhone"
                  [attr.aria-label]="'Appeler l’agence au ' + item.contactPhone"
                  >{{ item.contactPhone }}</a
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
  private readonly route = inject(ActivatedRoute);
  private readonly listings = inject(ListingService);
  readonly favorites = inject(FavoriteService);
  readonly listing = this.listings.getListingById(Number(this.route.snapshot.paramMap.get('id')));
}
