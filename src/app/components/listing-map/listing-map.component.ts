import { isPlatformBrowser } from '@angular/common';
import {
  AfterViewInit,
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  ElementRef,
  Input,
  OnChanges,
  OnDestroy,
  Output,
  PLATFORM_ID,
  SimpleChanges,
  ViewChild,
  ViewEncapsulation,
  EventEmitter,
  inject,
} from '@angular/core';
import { RouterLink } from '@angular/router';
import { Listing } from '../../models/listing';
import { formatPrice, formatSurface } from '../../utils/listing-format';

interface LeafletLayer {
  addTo(map: LeafletMap): LeafletLayer;
  bindTooltip?(content: string, options?: object): LeafletLayer;
  on?(event: string, callback: () => void): LeafletLayer;
  remove?(): void;
}

interface LeafletBounds {
  contains(position: [number, number]): boolean;
}

interface LeafletMap {
  fitBounds(bounds: [number, number][], options?: object): void;
  invalidateSize(): void;
  remove(): void;
  setView(center: [number, number], zoom: number): void;
  getBounds(): LeafletBounds;
  getZoom(): number;
  on(event: string, callback: () => void): void;
  off(event: string, callback: () => void): void;
}

interface LeafletApi {
  map(element: HTMLElement, options?: object): LeafletMap;
  tileLayer(url: string, options?: object): LeafletLayer;
  marker(position: [number, number], options?: object): LeafletLayer;
  circle(position: [number, number], options?: object): LeafletLayer;
  divIcon(options: object): object;
}

declare global {
  interface Window {
    L?: LeafletApi;
  }
}

@Component({
  selector: 'app-listing-map',
  imports: [RouterLink],
  changeDetection: ChangeDetectionStrategy.OnPush,
  styleUrl: './listing-map.component.scss',
  encapsulation: ViewEncapsulation.None,
  template: `
    <section class="map-results" aria-label="Carte des annonces">
      <div class="map-actions">
        <p>{{ visibleListingCount }} annonces dans cette zone</p>
        <button type="button" class="location-button" [disabled]="locating" (click)="locateUser()">
          {{ locating ? 'Localisation…' : 'Autour de moi' }}
        </button>
      </div>
      @if (locationMessage) {
        <p class="location-message" role="status">{{ locationMessage }}</p>
      }
      <div
        #mapContainer
        class="listings-map"
        [attr.aria-busy]="mapLoading"
        aria-label="Emplacement des annonces"
      ></div>
      @if (mapLoading) {
        <div class="map-loading" role="status">Chargement de la carte…</div>
      }
      @if (mapError) {
        <div class="empty-state error-state" role="alert">{{ mapError }}</div>
      }
      @if (selectedListing; as listing) {
        <article class="map-preview" aria-live="polite">
          <img [src]="listing.image" [alt]="'Photo de ' + listing.title" />
          <div>
            <p>{{ listing.type }} · {{ listing.city }}, {{ listing.district }}</p>
            <h3>{{ listing.title }}</h3>
            <strong>{{ formatPrice(listing.price, listing.mode) }}</strong>
            <span>{{ formatSurface(listing.area) }} · {{ listing.rooms }} pièces</span>
            <a class="detail-link" [routerLink]="['/annonces', listing.id]">Voir l’annonce</a>
          </div>
          <button
            type="button"
            class="preview-close"
            aria-label="Fermer l’aperçu"
            (click)="clearSelection()"
          >
            ×
          </button>
        </article>
      }
    </section>
  `,
})
export class ListingMapComponent implements AfterViewInit, OnChanges, OnDestroy {
  readonly formatPrice = formatPrice;
  readonly formatSurface = formatSurface;
  private static leafletPromise?: Promise<LeafletApi>;
  private readonly platformId = inject(PLATFORM_ID);
  private readonly changeDetector = inject(ChangeDetectorRef);
  private map?: LeafletMap;
  private markers: LeafletLayer[] = [];
  private userLayers: LeafletLayer[] = [];

  @ViewChild('mapContainer') private mapContainer?: ElementRef<HTMLElement>;
  @Input({ required: true }) listings: readonly Listing[] = [];
  @Output() readonly visibleListingsChange = new EventEmitter<readonly Listing[]>();
  selectedListing?: Listing;
  visibleListingCount = 0;
  mapLoading = true;
  mapError = '';
  locating = false;
  locationMessage = '';

  async ngAfterViewInit(): Promise<void> {
    if (!isPlatformBrowser(this.platformId)) return;
    try {
      const leaflet = await this.loadLeaflet();
      if (!this.mapContainer) return;
      this.map = leaflet.map(this.mapContainer.nativeElement, { zoomControl: true });
      leaflet
        .tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
          attribution: '&copy; OpenStreetMap contributors',
          maxZoom: 19,
        })
        .addTo(this.map);
      this.mapLoading = false;
      this.visibleListingCount = this.listings.length;
      this.renderMarkers(leaflet, true);
      this.map.on('moveend', this.handleMapMove);
      queueMicrotask(() => this.map?.invalidateSize());
    } catch {
      this.mapLoading = false;
      this.mapError = 'Impossible de charger la carte pour le moment.';
    }
    this.changeDetector.markForCheck();
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['listings']) {
      this.visibleListingCount = this.listings.length;
      if (this.selectedListing) {
        this.selectedListing = this.listings.find(({ id }) => id === this.selectedListing?.id);
      }
      if (this.map && window.L) this.renderMarkers(window.L, true);
    }
  }

  ngOnDestroy(): void {
    this.map?.off('moveend', this.handleMapMove);
    this.map?.remove();
  }

  locateUser(): void {
    if (!navigator.geolocation || !this.map || !window.L) {
      this.locationMessage = 'La géolocalisation n’est pas disponible sur cet appareil.';
      return;
    }
    this.locating = true;
    this.locationMessage = '';
    navigator.geolocation.getCurrentPosition(
      ({ coords }) => {
        const position: [number, number] = [coords.latitude, coords.longitude];
        this.userLayers.forEach((layer) => layer.remove?.());
        this.userLayers = [
          window
            .L!.circle(position, {
              radius: Math.max(coords.accuracy, 100),
              color: '#285ee8',
            })
            .addTo(this.map!),
          window.L!.marker(position).addTo(this.map!),
        ];
        this.map!.setView(position, 13);
        this.locating = false;
        this.locationMessage = 'La carte est centrée sur votre position.';
        this.changeDetector.markForCheck();
      },
      () => {
        this.locating = false;
        this.locationMessage = 'Votre position n’a pas pu être récupérée.';
        this.changeDetector.markForCheck();
      },
      { enableHighAccuracy: true, timeout: 10000 },
    );
  }

  clearSelection(): void {
    this.selectedListing = undefined;
    if (window.L) this.renderMarkers(window.L);
  }

  private readonly handleMapMove = (): void => {
    if (!this.map || !window.L) return;
    this.renderMarkers(window.L);
    const bounds = this.map.getBounds();
    const visibleListings = this.listings.filter(({ latitude, longitude }) =>
      bounds.contains([latitude, longitude]),
    );
    this.visibleListingCount = visibleListings.length;
    this.visibleListingsChange.emit(visibleListings);
    this.changeDetector.markForCheck();
  };

  private renderMarkers(leaflet: LeafletApi, fitToListings = false): void {
    if (!this.map) return;
    this.markers.forEach((marker) => marker.remove?.());
    const currentZoom = this.map.getZoom();
    const zoom = Number.isFinite(currentZoom) ? currentZoom : 5;
    const groups = this.clusterListings(zoom);
    this.markers = groups.map((group) => {
      if (group.length > 1) {
        const latitude =
          group.reduce((total, listing) => total + listing.latitude, 0) / group.length;
        const longitude =
          group.reduce((total, listing) => total + listing.longitude, 0) / group.length;
        const marker = leaflet.marker([latitude, longitude], {
          icon: leaflet.divIcon({
            className: 'cluster-marker-shell',
            html: `<span class="cluster-marker" aria-label="${group.length} annonces">${group.length}</span>`,
            iconSize: [46, 46],
            iconAnchor: [23, 23],
          }),
        });
        marker.bindTooltip?.(`${group.length} annonces`, { direction: 'top', offset: [0, -20] });
        marker.on?.('click', () =>
          this.map?.setView([latitude, longitude], Math.min(zoom + 2, 18)),
        );
        marker.addTo(this.map!);
        return marker;
      }

      const listing = group[0];
      const selected = listing.id === this.selectedListing?.id;
      const marker = leaflet.marker([listing.latitude, listing.longitude], {
        icon: leaflet.divIcon({
          className: `price-marker-shell${selected ? ' selected' : ''}`,
          html: `<span class="price-marker">${this.shortPrice(listing.price)}</span>`,
          iconSize: [72, 34],
          iconAnchor: [36, 34],
        }),
      });
      marker.bindTooltip?.(listing.title, { direction: 'top', offset: [0, -28] });
      marker.on?.('click', () => {
        this.selectedListing = listing;
        this.renderMarkers(leaflet);
        this.changeDetector.markForCheck();
      });
      marker.addTo(this.map!);
      return marker;
    });
    const bounds = this.listings.map(
      ({ latitude, longitude }) => [latitude, longitude] as [number, number],
    );
    if (fitToListings) {
      if (bounds.length) this.map.fitBounds(bounds, { padding: [45, 45], maxZoom: 13 });
      else this.map.setView([33.6, -7.6], 5);
    }
  }

  private clusterListings(zoom: number): Listing[][] {
    if (zoom >= 13) return this.listings.map((listing) => [listing]);
    const cellSize = (360 / (256 * 2 ** zoom)) * 80;
    const cells = new Map<string, Listing[]>();
    for (const listing of this.listings) {
      const key = `${Math.floor(listing.latitude / cellSize)}:${Math.floor(listing.longitude / cellSize)}`;
      const cell = cells.get(key);
      if (cell) cell.push(listing);
      else cells.set(key, [listing]);
    }
    return [...cells.values()];
  }

  private shortPrice(price: number): string {
    return price >= 1_000_000
      ? `${(price / 1_000_000).toLocaleString('fr-FR', { maximumFractionDigits: 1 })} M`
      : price >= 1_000
        ? `${Math.round(price / 1_000)} k`
        : String(price);
  }

  private loadLeaflet(): Promise<LeafletApi> {
    if (window.L) return Promise.resolve(window.L);
    if (ListingMapComponent.leafletPromise) return ListingMapComponent.leafletPromise;
    ListingMapComponent.leafletPromise = new Promise((resolve, reject) => {
      const stylesheet = document.createElement('link');
      stylesheet.rel = 'stylesheet';
      stylesheet.href = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.css';
      document.head.appendChild(stylesheet);
      const script = document.createElement('script');
      script.src = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.js';
      script.integrity = 'sha256-20nQCchB9co0qIjJZRGuk2/Z9VM+kNiyxNV1lvTlZBo=';
      script.crossOrigin = '';
      script.onload = () => (window.L ? resolve(window.L) : reject());
      script.onerror = () => reject();
      document.head.appendChild(script);
    });
    return ListingMapComponent.leafletPromise;
  }
}
