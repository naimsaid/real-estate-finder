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
import { MapPoint, MapZone } from '../../models/map-zone';
import { formatPrice, formatSurface } from '../../utils/listing-format';

interface LeafletLayer {
  addTo(map: LeafletMap): LeafletLayer;
  bindTooltip?(content: string, options?: object): LeafletLayer;
  on?(event: string, callback: () => void): LeafletLayer;
  remove?(): void;
}

interface LeafletMouseEvent {
  latlng: { lat: number; lng: number };
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
  polygon(positions: [number, number][], options?: object): LeafletLayer;
  polyline(positions: [number, number][], options?: object): LeafletLayer;
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
        <div class="map-action-buttons">
          <button
            type="button"
            class="draw-button"
            [class.active]="drawingMode !== null"
            [attr.aria-pressed]="drawingMode !== null"
            (click)="toggleDrawing()"
          >
            {{
              drawingMode === 'polygon' && draftPoints.length >= 3
                ? 'Terminer la zone'
                : drawingMode
                  ? 'Annuler le dessin'
                  : 'Dessiner ma zone'
            }}
          </button>
          @if (drawingMode === null && !zone) {
            <button type="button" class="shape-button" (click)="startDrawing('circle')">
              Dessiner un cercle
            </button>
          }
          @if (zone) {
            <button type="button" class="reset-zone-button" (click)="resetZone()">
              Réinitialiser la zone
            </button>
          }
          <button
            type="button"
            class="location-button"
            [disabled]="locating"
            (click)="locateUser()"
          >
            {{ locating ? 'Localisation…' : 'Autour de moi' }}
          </button>
        </div>
      </div>
      @if (drawingMode) {
        <p class="drawing-help" role="status">
          @if (drawingMode === 'polygon') {
            Placez au moins 3 points à la souris ou au tactile, puis choisissez « Terminer la zone
            ».
          } @else {
            Placez le centre puis un point sur le bord du cercle à la souris ou au tactile.
          }
        </p>
      }
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
  private drawingLayer?: LeafletLayer;

  @ViewChild('mapContainer') private mapContainer?: ElementRef<HTMLElement>;
  @Input({ required: true }) listings: readonly Listing[] = [];
  @Input() zone: MapZone | null = null;
  @Output() readonly visibleListingsChange = new EventEmitter<readonly Listing[]>();
  @Output() readonly zoneChange = new EventEmitter<MapZone | null>();
  selectedListing?: Listing;
  visibleListingCount = 0;
  mapLoading = true;
  mapError = '';
  locating = false;
  locationMessage = '';
  drawingMode: 'polygon' | 'circle' | null = null;
  draftPoints: MapPoint[] = [];

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
      this.map.on('click', this.handleMapClick);
      this.renderZone(leaflet);
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
    if (changes['zone'] && this.map && window.L) this.renderZone(window.L);
  }

  ngOnDestroy(): void {
    this.map?.off('moveend', this.handleMapMove);
    this.map?.off('click', this.handleMapClick);
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

  toggleDrawing(): void {
    if (this.drawingMode === 'polygon' && this.draftPoints.length >= 3) {
      this.finishPolygon();
    } else if (this.drawingMode) {
      this.cancelDrawing();
    } else {
      this.startDrawing('polygon');
    }
  }

  startDrawing(mode: 'polygon' | 'circle'): void {
    this.drawingMode = mode;
    this.draftPoints = [];
    this.drawingLayer?.remove?.();
    this.drawingLayer = undefined;
    this.changeDetector.markForCheck();
  }

  resetZone(): void {
    this.cancelDrawing();
    this.zoneChange.emit(null);
  }

  private cancelDrawing(): void {
    this.drawingMode = null;
    this.draftPoints = [];
    this.drawingLayer?.remove?.();
    this.drawingLayer = undefined;
    if (this.map && window.L) this.renderZone(window.L);
    this.changeDetector.markForCheck();
  }

  private readonly handleMapClick = (event?: LeafletMouseEvent): void => {
    if (!this.drawingMode || !event || !window.L) return;
    const point = { latitude: event.latlng.lat, longitude: event.latlng.lng };
    this.draftPoints = [...this.draftPoints, point];
    if (this.drawingMode === 'circle' && this.draftPoints.length === 2) {
      const [center, edge] = this.draftPoints;
      this.zoneChange.emit({
        type: 'circle',
        center,
        radiusMeters: this.distanceInMeters(center, edge),
      });
      this.cancelDrawing();
      return;
    }
    this.renderDraft(window.L);
    this.changeDetector.markForCheck();
  };

  private finishPolygon(): void {
    this.zoneChange.emit({ type: 'polygon', points: [...this.draftPoints] });
    this.cancelDrawing();
  }

  private renderDraft(leaflet: LeafletApi): void {
    if (!this.map) return;
    this.drawingLayer?.remove?.();
    const positions = this.draftPoints.map(
      ({ latitude, longitude }) => [latitude, longitude] as [number, number],
    );
    this.drawingLayer = leaflet
      .polyline(positions, { color: '#285ee8', dashArray: '7 7', weight: 3 })
      .addTo(this.map);
  }

  private renderZone(leaflet: LeafletApi): void {
    if (!this.map || this.drawingMode) return;
    this.drawingLayer?.remove?.();
    this.drawingLayer = undefined;
    if (!this.zone) return;
    const style = { color: '#285ee8', fillColor: '#285ee8', fillOpacity: 0.16, weight: 3 };
    this.drawingLayer =
      this.zone.type === 'circle'
        ? leaflet.circle([this.zone.center.latitude, this.zone.center.longitude], {
            ...style,
            radius: this.zone.radiusMeters,
          })
        : leaflet.polygon(
            this.zone.points.map(
              ({ latitude, longitude }) => [latitude, longitude] as [number, number],
            ),
            style,
          );
    this.drawingLayer.addTo(this.map);
  }

  private distanceInMeters(first: MapPoint, second: MapPoint): number {
    const radians = (degrees: number): number => (degrees * Math.PI) / 180;
    const latitudeDelta = radians(second.latitude - first.latitude);
    const longitudeDelta = radians(second.longitude - first.longitude);
    const latitude1 = radians(first.latitude);
    const latitude2 = radians(second.latitude);
    const haversine =
      Math.sin(latitudeDelta / 2) ** 2 +
      Math.cos(latitude1) * Math.cos(latitude2) * Math.sin(longitudeDelta / 2) ** 2;
    return 6_371_000 * 2 * Math.atan2(Math.sqrt(haversine), Math.sqrt(1 - haversine));
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
