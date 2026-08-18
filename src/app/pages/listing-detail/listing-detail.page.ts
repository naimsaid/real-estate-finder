import {
  ChangeDetectionStrategy,
  Component,
  ElementRef,
  HostListener,
  inject,
} from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { HeaderComponent } from '../../components/header/header.component';
import { FavoriteService } from '../../services/favorite.service';
import { ListingService } from '../../services/listing.service';
import { RecentlyViewedService } from '../../services/recently-viewed.service';
import { formatPrice, formatSurface } from '../../utils/listing-format';

@Component({
  selector: 'app-listing-detail-page',
  imports: [HeaderComponent, RouterLink],
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
                <button
                  #galleryTrigger
                  class="gallery-item"
                  type="button"
                  (click)="openLightbox(index, galleryTrigger)"
                  [attr.aria-label]="
                    'Agrandir la photo ' + (index + 1) + ' sur ' + item.images.length
                  "
                >
                  <img
                    [src]="image"
                    [attr.loading]="index === 0 ? 'eager' : 'lazy'"
                    [alt]="
                      'Photo ' + (index + 1) + ' du bien « ' + item.title + ' » à ' + item.city
                    "
                    (error)="useFallbackImage($event)"
                  />
                </button>
              }
            </section>
            <div class="detail-copy">
              <p class="eyebrow">{{ item.type }} · {{ item.city }}</p>
              <h1>{{ item.title }}</h1>
              <strong class="detail-price">{{ formatPrice(item.price, item.mode) }}</strong>
              <dl class="features detail-features">
                <div>
                  <dt>Surface</dt>
                  <dd>{{ formatSurface(item.area) }}</dd>
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
          @if (lightboxOpen) {
            <div
              class="lightbox"
              role="dialog"
              aria-modal="true"
              aria-label="Galerie photos en plein écran"
              (click)="closeFromBackdrop($event)"
              (keydown)="handleLightboxKeyboard($event)"
            >
              <button
                #lightboxClose
                class="lightbox-close"
                type="button"
                aria-label="Fermer la galerie"
                (click)="closeLightbox()"
              >
                ×
              </button>
              <button
                class="lightbox-arrow lightbox-previous"
                type="button"
                aria-label="Photo précédente"
                (click)="showPreviousImage()"
              >
                ‹
              </button>
              <figure>
                <img
                  [src]="item.images[activeImageIndex]"
                  [alt]="
                    'Photo ' +
                    (activeImageIndex + 1) +
                    ' du bien « ' +
                    item.title +
                    ' » à ' +
                    item.city
                  "
                  (error)="useFallbackImage($event)"
                />
                <figcaption>{{ activeImageIndex + 1 }} / {{ item.images.length }}</figcaption>
              </figure>
              <button
                class="lightbox-arrow lightbox-next"
                type="button"
                aria-label="Photo suivante"
                (click)="showNextImage()"
              >
                ›
              </button>
            </div>
          }
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
  readonly formatPrice = formatPrice;
  readonly formatSurface = formatSurface;
  private readonly fallbackImage = '/assets/fallback-property.jpg';
  private readonly elementRef = inject(ElementRef<HTMLElement>);
  private readonly route = inject(ActivatedRoute);
  private readonly listings = inject(ListingService);
  private readonly recentlyViewed = inject(RecentlyViewedService);
  private lightboxTrigger?: HTMLElement;
  readonly favorites = inject(FavoriteService);
  readonly listing = this.listings.getListingById(Number(this.route.snapshot.paramMap.get('id')));
  lightboxOpen = false;
  activeImageIndex = 0;

  constructor() {
    if (this.listing) this.recentlyViewed.record(this.listing.id);
  }

  openLightbox(index: number, trigger?: HTMLElement): void {
    this.activeImageIndex = index;
    this.lightboxTrigger = trigger;
    this.lightboxOpen = true;
    queueMicrotask(() =>
      (this.elementRef.nativeElement as HTMLElement)
        .querySelector<HTMLElement>('.lightbox-close')
        ?.focus(),
    );
  }

  closeLightbox(): void {
    this.lightboxOpen = false;
    this.lightboxTrigger?.focus();
    this.lightboxTrigger = undefined;
  }

  closeFromBackdrop(event: MouseEvent): void {
    if (event.target === event.currentTarget) this.closeLightbox();
  }

  showPreviousImage(): void {
    const imageCount = this.listing?.images.length ?? 0;
    if (imageCount) this.activeImageIndex = (this.activeImageIndex - 1 + imageCount) % imageCount;
  }

  showNextImage(): void {
    const imageCount = this.listing?.images.length ?? 0;
    if (imageCount) this.activeImageIndex = (this.activeImageIndex + 1) % imageCount;
  }

  @HostListener('document:keydown', ['$event'])
  handleKeyboard(event: KeyboardEvent): void {
    if (!this.lightboxOpen) return;

    if (event.key === 'Escape') {
      event.preventDefault();
      this.closeLightbox();
    } else if (event.key === 'ArrowLeft') {
      event.preventDefault();
      this.showPreviousImage();
    } else if (event.key === 'ArrowRight') {
      event.preventDefault();
      this.showNextImage();
    } else if (event.key === 'Tab') {
      this.trapFocus(event);
    }
  }

  handleLightboxKeyboard(event: KeyboardEvent): void {
    event.stopPropagation();
    this.handleKeyboard(event);
  }

  private trapFocus(event: KeyboardEvent): void {
    const controls = Array.from(
      (this.elementRef.nativeElement as HTMLElement).querySelectorAll<HTMLElement>(
        '.lightbox button',
      ),
    );
    if (!controls.length) return;

    const first = controls[0];
    const last = controls[controls.length - 1];
    if (event.shiftKey && document.activeElement === first) {
      event.preventDefault();
      last.focus();
    } else if (!event.shiftKey && document.activeElement === last) {
      event.preventDefault();
      first.focus();
    }
  }

  useFallbackImage(event: Event): void {
    const image = event.target as HTMLImageElement;
    if (!image.src.endsWith(this.fallbackImage)) image.src = this.fallbackImage;
  }
}
