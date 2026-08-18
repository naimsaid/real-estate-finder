import { TestBed } from '@angular/core/testing';
import { Router } from '@angular/router';
import { App } from './app';
import { appConfig } from './app.config';
import { routes } from './app.routes';
import { FavoritesPage } from './pages/favorites/favorites.page';
import { HomePage } from './pages/home/home.page';
import { ListingDetailPage } from './pages/listing-detail/listing-detail.page';

describe('application routes', () => {
  let router: Router;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [App],
      providers: appConfig.providers,
    }).compileComponents();

    router = TestBed.inject(Router);
  });

  async function navigateTo(url: string): Promise<HTMLElement> {
    const fixture = TestBed.createComponent(App);
    await router.navigateByUrl(url);
    fixture.detectChanges();
    await fixture.whenStable();
    return fixture.nativeElement as HTMLElement;
  }

  it('affiche la liste sur /', async () => {
    const page = await navigateTo('/');

    expect(page.querySelector('app-home-page')).not.toBeNull();
    expect(page.querySelector('.listing-grid')).not.toBeNull();
  });

  it('affiche la fiche complète sur /annonces/:id', async () => {
    const page = await navigateTo('/annonces/1');

    expect(page.querySelector('app-listing-detail-page')).not.toBeNull();
    expect(page.querySelectorAll('.detail-gallery img')).toHaveLength(3);
    expect(page.textContent).toContain('Description');
    expect(page.textContent).toContain('Équipements');
    expect(page.textContent).toContain('Localisation');
    expect(page.textContent).toContain('Contact');
  });

  it('affiche les favoris sur /favoris', async () => {
    const page = await navigateTo('/favoris');

    expect(page.querySelector('app-favorites-page')).not.toBeNull();
    expect(page.textContent).toContain('Mes favoris');
  });

  it('redirige une URL inconnue vers /', async () => {
    await navigateTo('/page-inconnue');

    expect(router.url).toBe('/');
  });

  it('associe les routes aux pages attendues', () => {
    expect(routes.find((route) => route.path === '')?.component).toBe(HomePage);
    expect(routes.find((route) => route.path === 'annonces/:id')?.component).toBe(
      ListingDetailPage,
    );
    expect(routes.find((route) => route.path === 'favoris')?.component).toBe(FavoritesPage);
  });
});
