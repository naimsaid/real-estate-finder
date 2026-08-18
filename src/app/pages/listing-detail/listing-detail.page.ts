import {
  ChangeDetectionStrategy,
  Component,
  ElementRef,
  HostListener,
  OnDestroy,
  inject,
} from '@angular/core';
import { DOCUMENT } from '@angular/common';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { DomSanitizer, Meta, SafeResourceUrl, Title } from '@angular/platform-browser';
import { HeaderComponent } from '../../components/header/header.component';
import { FavoriteService } from '../../services/favorite.service';
import { ListingService } from '../../services/listing.service';
import { RecentlyViewedService } from '../../services/recently-viewed.service';
import { formatPrice, formatSurface } from '../../utils/listing-format';

interface GalleryMedia {
  kind: 'photo' | 'floor-plan' | 'virtual-tour';
  src: string;
}

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
              @for (media of galleryMedia; track media.src; let index = $index) {
                <button
                  #galleryTrigger
                  class="gallery-item"
                  type="button"
                  (click)="openLightbox(index, galleryTrigger)"
                  [attr.aria-label]="
                    mediaLabel(media) + ' ' + (index + 1) + ' sur ' + galleryMedia.length
                  "
                >
                  @if (media.kind === 'virtual-tour') {
                    <span class="virtual-tour-preview" aria-hidden="true">360°</span>
                  } @else {
                    <img
                      [src]="thumbnailUrl(media.src)"
                      [attr.loading]="index === 0 ? 'eager' : 'lazy'"
                      [alt]="mediaAlt(media, index)"
                      (error)="useFallbackImage($event)"
                    />
                  }
                  @if (media.kind !== 'photo') {
                    <span class="media-badge">{{ mediaLabel(media) }}</span>
                  }
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
                <button
                  class="share-detail"
                  type="button"
                  (click)="shareListing()"
                  [attr.aria-label]="'Partager l’annonce ' + item.title"
                >
                  Partager l’annonce
                </button>
              </div>
              @if (shareFeedback) {
                <p class="share-feedback" role="status" aria-live="polite">
                  {{ shareFeedback }}
                </p>
              }
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
              (touchstart)="onTouchStart($event)"
              (touchend)="onTouchEnd($event)"
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
                @if (activeMedia; as media) {
                  @if (media.kind === 'virtual-tour') {
                    <iframe
                      class="virtual-tour-frame"
                      [src]="trustedVirtualTourUrl(media.src)"
                      title="Visite virtuelle 360°"
                      allowfullscreen
                    ></iframe>
                  } @else {
                    <img
                      [src]="media.src"
                      [alt]="mediaAlt(media, activeImageIndex)"
                      (error)="useFallbackImage($event)"
                    />
                  }
                  <figcaption aria-live="polite">
                    {{ mediaLabel(media) }} · {{ activeImageIndex + 1 }} / {{ galleryMedia.length }}
                  </figcaption>
                }
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
export class ListingDetailPage implements OnDestroy {
  readonly formatPrice = formatPrice;
  readonly formatSurface = formatSurface;
  private readonly fallbackImage = '/assets/fallback-property.jpg';
  private readonly document = inject(DOCUMENT);
  private readonly elementRef = inject(ElementRef<HTMLElement>);
  private readonly route = inject(ActivatedRoute);
  private readonly listings = inject(ListingService);
  private readonly recentlyViewed = inject(RecentlyViewedService);
  private readonly sanitizer = inject(DomSanitizer);
  private readonly title = inject(Title);
  private readonly meta = inject(Meta);
  private structuredDataElement?: HTMLScriptElement;
  private lightboxTrigger?: HTMLElement;
  readonly favorites = inject(FavoriteService);
  readonly listing = this.listings.getListingById(Number(this.route.snapshot.paramMap.get('id')));
  lightboxOpen = false;
  activeImageIndex = 0;
  shareFeedback = '';
  private touchStartX?: number;

  readonly galleryMedia: readonly GalleryMedia[] = this.listing
    ? [
        ...this.listing.images.map((src) => ({ kind: 'photo' as const, src })),
        ...(this.listing.floorPlans ?? []).map((src) => ({ kind: 'floor-plan' as const, src })),
        ...(this.listing.virtualTourUrl
          ? [{ kind: 'virtual-tour' as const, src: this.listing.virtualTourUrl }]
          : []),
      ]
    : [];

  get activeMedia(): GalleryMedia | undefined {
    return this.galleryMedia[this.activeImageIndex];
  }

  constructor() {
    if (this.listing) {
      this.recentlyViewed.record(this.listing.id);
      this.setListingMetadata();
    }
  }

  ngOnDestroy(): void {
    this.structuredDataElement?.remove();
  }

  private setListingMetadata(): void {
    if (!this.listing) return;
    const listing = this.listing;
    const description = `${listing.type} ${listing.mode === 'buy' ? 'à vendre' : 'à louer'} à ${listing.city}, ${listing.district} — ${listing.area} m², ${listing.rooms} pièces. ${listing.description}`;
    const canonicalUrl = new URL(`/annonces/${listing.id}`, this.document.location.origin).toString();

    this.title.setTitle(`${listing.title} à ${listing.city} | Habita`);
    this.meta.updateTag({ name: 'description', content: description });
    this.meta.updateTag({ property: 'og:type', content: 'website' });
    this.meta.updateTag({ property: 'og:title', content: `${listing.title} à ${listing.city}` });
    this.meta.updateTag({ property: 'og:description', content: description });
    this.meta.updateTag({ property: 'og:image', content: listing.image });
    this.meta.updateTag({ property: 'og:url', content: canonicalUrl });

    const structuredData = {
      '@context': 'https://schema.org',
      '@type': 'RealEstateListing',
      name: listing.title,
      description: listing.description,
      url: canonicalUrl,
      image: listing.images,
      datePosted: listing.publishedAt,
      offers: {
        '@type': 'Offer',
        price: listing.price,
        priceCurrency: listing.city === 'Paris' ? 'EUR' : 'MAD',
        availability: 'https://schema.org/InStock',
      },
      address: {
        '@type': 'PostalAddress',
        streetAddress: listing.district,
        addressLocality: listing.city,
        postalCode: listing.postalCode,
      },
      geo: {
        '@type': 'GeoCoordinates',
        latitude: listing.latitude,
        longitude: listing.longitude,
      },
      floorSize: { '@type': 'QuantitativeValue', value: listing.area, unitCode: 'MTK' },
      numberOfRooms: listing.rooms,
      numberOfBedrooms: listing.bedrooms,
    };
    const script = this.document.createElement('script');
    script.type = 'application/ld+json';
    script.dataset['listingStructuredData'] = 'true';
    script.textContent = JSON.stringify(structuredData).replace(/</g, '\\u003c');
    this.document.head.appendChild(script);
    this.structuredDataElement = script;
  }

  async shareListing(): Promise<void> {
    if (!this.listing) return;

    this.shareFeedback = '';
    const navigator = this.document.defaultView?.navigator;
    if (!navigator) return;

    if (typeof navigator.share === 'function') {
      try {
        await navigator.share({
          title: this.listing.title,
          text: `Découvrez cette annonce à ${this.listing.city} sur Habita.`,
          url: this.shareUrl('web_share'),
        });
        this.shareFeedback = 'Annonce partagée.';
        return;
      } catch (error) {
        if (error instanceof DOMException && error.name === 'AbortError') return;
      }
    }

    try {
      await navigator.clipboard.writeText(this.shareUrl('clipboard'));
      this.shareFeedback = 'Lien copié dans le presse-papiers.';
    } catch {
      this.shareFeedback = 'Impossible de copier le lien.';
    }
  }

  private shareUrl(medium: 'web_share' | 'clipboard'): string {
    const url = new URL(`/annonces/${this.listing?.id}`, this.document.location.origin);
    url.searchParams.set('utm_source', 'habita');
    url.searchParams.set('utm_medium', medium);
    url.searchParams.set('utm_campaign', 'listing_share');
    return url.toString();
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
    const imageCount = this.galleryMedia.length;
    if (imageCount) this.activeImageIndex = (this.activeImageIndex - 1 + imageCount) % imageCount;
  }

  showNextImage(): void {
    const imageCount = this.galleryMedia.length;
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

  onTouchStart(event: TouchEvent): void {
    this.touchStartX = event.changedTouches[0]?.clientX;
  }

  onTouchEnd(event: TouchEvent): void {
    const endX = event.changedTouches[0]?.clientX;
    if (this.touchStartX === undefined || endX === undefined) return;

    const distance = endX - this.touchStartX;
    this.touchStartX = undefined;
    if (Math.abs(distance) < 50) return;
    if (distance > 0) this.showPreviousImage();
    else this.showNextImage();
  }

  thumbnailUrl(src: string): string {
    if (!src.includes('images.unsplash.com')) return src;
    const url = new URL(src);
    url.searchParams.set('w', '640');
    url.searchParams.set('q', '60');
    return url.toString();
  }

  mediaLabel(media: GalleryMedia): string {
    if (media.kind === 'floor-plan') return 'Plan d’étage';
    if (media.kind === 'virtual-tour') return 'Visite 360°';
    return 'Photo';
  }

  mediaAlt(media: GalleryMedia, index: number): string {
    if (!this.listing) return '';
    return `${this.mediaLabel(media)} ${index + 1} du bien « ${this.listing.title} » à ${this.listing.city}`;
  }

  trustedVirtualTourUrl(src: string): SafeResourceUrl {
    return this.sanitizer.bypassSecurityTrustResourceUrl(src);
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
