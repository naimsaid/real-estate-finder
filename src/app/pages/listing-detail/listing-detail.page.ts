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
            <img [src]="item.image" [alt]="item.title" />
            <div class="detail-copy">
              <p class="eyebrow">{{ item.type }} · {{ item.city }}</p>
              <h1>{{ item.title }}</h1>
              <p class="detail-location">{{ item.district }}, {{ item.city }}</p>
              <strong class="detail-price">{{ item.price | currency: (item.mode === 'buy' ? 'MAD' : 'EUR') : 'symbol' : '1.0-0' }}{{ item.mode === 'rent' ? ' / mois' : '' }}</strong>
              <dl class="features detail-features"><div><dt>Surface</dt><dd>{{ item.area }} m2</dd></div><div><dt>Pièces</dt><dd>{{ item.rooms }}</dd></div><div><dt>Chambres</dt><dd>{{ item.bedrooms }}</dd></div><div><dt>Sdb</dt><dd>{{ item.bathrooms }}</dd></div></dl>
              <div class="tags">@for (tag of item.tags; track tag) { <span>{{ tag }}</span> }</div>
              <button class="ghost-button" type="button" (click)="favorites.toggle(item.id)">{{ favorites.isFavorite(item.id) ? 'Retirer des favoris' : 'Ajouter aux favoris' }}</button>
            </div>
          </article>
        } @else {
          <div class="empty-state"><strong>Cette annonce est introuvable.</strong><p>Elle a peut-être été retirée.</p><a routerLink="/">Voir toutes les annonces</a></div>
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
