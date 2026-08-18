import { TestBed } from '@angular/core/testing';
import { ActivatedRoute, provideRouter } from '@angular/router';
import { LISTING_REPOSITORY } from '../../repositories/listing.repository';
import { StaticListingRepository } from '../../repositories/static-listing.repository';
import { ListingDetailPage } from './listing-detail.page';

describe('ListingDetailPage gallery', () => {
  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ListingDetailPage],
      providers: [
        provideRouter([]),
        { provide: LISTING_REPOSITORY, useExisting: StaticListingRepository },
        {
          provide: ActivatedRoute,
          useValue: { snapshot: { paramMap: { get: () => '1' } } },
        },
      ],
    }).compileComponents();
  });

  it('charge les miniatures en lazy loading et ouvre la lightbox', () => {
    const fixture = TestBed.createComponent(ListingDetailPage);
    fixture.detectChanges();
    const page = fixture.nativeElement as HTMLElement;
    const images = page.querySelectorAll<HTMLImageElement>('.detail-gallery img');

    expect(images[0].getAttribute('loading')).toBe('eager');
    expect(images[1].getAttribute('loading')).toBe('lazy');

    page.querySelectorAll<HTMLButtonElement>('.gallery-item')[1].click();
    fixture.detectChanges();

    expect(page.querySelector('.lightbox')).not.toBeNull();
    expect(fixture.componentInstance.activeImageIndex).toBe(1);
  });

  it('navigue au clavier et ferme la lightbox avec Échap', () => {
    const fixture = TestBed.createComponent(ListingDetailPage);
    fixture.detectChanges();
    fixture.componentInstance.openLightbox(0);
    fixture.detectChanges();

    document.dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowRight' }));
    expect(fixture.componentInstance.activeImageIndex).toBe(1);

    document.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape' }));
    fixture.detectChanges();
    expect(fixture.componentInstance.lightboxOpen).toBe(false);
  });

  it('navigue par swipe tactile et ignore les gestes trop courts', () => {
    const fixture = TestBed.createComponent(ListingDetailPage);
    fixture.componentInstance.openLightbox(0);

    fixture.componentInstance.onTouchStart({
      changedTouches: [{ clientX: 240 }],
    } as unknown as TouchEvent);
    fixture.componentInstance.onTouchEnd({
      changedTouches: [{ clientX: 120 }],
    } as unknown as TouchEvent);
    expect(fixture.componentInstance.activeImageIndex).toBe(1);

    fixture.componentInstance.onTouchStart({
      changedTouches: [{ clientX: 120 }],
    } as unknown as TouchEvent);
    fixture.componentInstance.onTouchEnd({
      changedTouches: [{ clientX: 140 }],
    } as unknown as TouchEvent);
    expect(fixture.componentInstance.activeImageIndex).toBe(1);
  });

  it('affiche le plan disponible et réserve la haute définition à la lightbox', () => {
    const fixture = TestBed.createComponent(ListingDetailPage);
    fixture.detectChanges();
    const page = fixture.nativeElement as HTMLElement;

    expect(page.querySelector('.media-badge')?.textContent).toContain('Plan d’étage');
    expect(page.querySelector<HTMLImageElement>('.detail-gallery img')?.src).toContain('w=640');

    fixture.componentInstance.openLightbox(0);
    fixture.detectChanges();
    expect(page.querySelector<HTMLImageElement>('.lightbox img')?.src).toContain('w=1600');
    expect(page.querySelector('.lightbox figcaption')?.textContent).toContain('1 / 4');
  });

  it('piège le focus dans la lightbox puis le restitue au déclencheur', async () => {
    const fixture = TestBed.createComponent(ListingDetailPage);
    fixture.detectChanges();
    const page = fixture.nativeElement as HTMLElement;
    const trigger = page.querySelector<HTMLButtonElement>('.gallery-item')!;

    trigger.click();
    fixture.detectChanges();
    await fixture.whenStable();

    const controls = page.querySelectorAll<HTMLButtonElement>('.lightbox button');
    expect(document.activeElement).toBe(controls[0]);

    document.dispatchEvent(new KeyboardEvent('keydown', { key: 'Tab', shiftKey: true }));
    expect(document.activeElement).toBe(controls[controls.length - 1]);

    document.dispatchEvent(new KeyboardEvent('keydown', { key: 'Tab' }));
    expect(document.activeElement).toBe(controls[0]);

    document.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape' }));
    fixture.detectChanges();
    expect(document.activeElement).toBe(trigger);
  });

  it('remplace une image indisponible par le fallback local', () => {
    const fixture = TestBed.createComponent(ListingDetailPage);
    const image = document.createElement('img');

    fixture.componentInstance.useFallbackImage({ target: image } as unknown as Event);

    expect(image.src).toContain('/assets/fallback-property.jpg');
  });

  it('utilise le partage natif avec une URL trackée', async () => {
    const fixture = TestBed.createComponent(ListingDetailPage);
    const share = vi.fn().mockResolvedValue(undefined);
    Object.defineProperty(window.navigator, 'share', { configurable: true, value: share });

    await fixture.componentInstance.shareListing();

    expect(share).toHaveBeenCalledWith(
      expect.objectContaining({
        title: fixture.componentInstance.listing?.title,
        url: expect.stringContaining(
          '/annonces/1?utm_source=habita&utm_medium=web_share&utm_campaign=listing_share',
        ),
      }),
    );
    expect(fixture.componentInstance.shareFeedback).toBe('Annonce partagée.');
  });

  it('copie le lien tracké quand le partage natif est indisponible', async () => {
    const fixture = TestBed.createComponent(ListingDetailPage);
    const writeText = vi.fn().mockResolvedValue(undefined);
    Object.defineProperty(window.navigator, 'share', { configurable: true, value: undefined });
    Object.defineProperty(window.navigator, 'clipboard', {
      configurable: true,
      value: { writeText },
    });

    await fixture.componentInstance.shareListing();

    expect(writeText).toHaveBeenCalledWith(
      expect.stringContaining(
        '/annonces/1?utm_source=habita&utm_medium=clipboard&utm_campaign=listing_share',
      ),
    );
    expect(fixture.componentInstance.shareFeedback).toBe('Lien copié dans le presse-papiers.');
  });
});
