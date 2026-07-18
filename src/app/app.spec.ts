import { TestBed } from '@angular/core/testing';
import { App } from './app';
import { appConfig } from './app.config';

describe('App', () => {
  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [App],
      providers: appConfig.providers,
    }).compileComponents();
  });

  it('should create the app', () => {
    const fixture = TestBed.createComponent(App);
    const app = fixture.componentInstance;
    expect(app).toBeTruthy();
  });

  it('should render the real estate search', async () => {
    const fixture = TestBed.createComponent(App);
    await fixture.whenStable();
    const compiled = fixture.nativeElement as HTMLElement;
    expect(compiled.querySelector('.search-panel')?.textContent).toContain(
      'Ville, quartier ou mot-cle',
    );
  });

  it('should sort listings by relevance by default', () => {
    const fixture = TestBed.createComponent(App);
    const app = fixture.componentInstance;

    expect(app.sortBy()).toBe('relevance');
    expect(app.filteredListings().map((listing) => listing.id)).toEqual([1, 2, 5]);
  });

  it('should change the listing order when a price sort is selected', () => {
    const fixture = TestBed.createComponent(App);
    const app = fixture.componentInstance;
    const compiled = fixture.nativeElement as HTMLElement;
    fixture.detectChanges();

    const ascendingButton = compiled.querySelector<HTMLButtonElement>('[data-sort="priceAsc"]');
    ascendingButton?.click();
    fixture.detectChanges();

    expect(app.sortBy()).toBe('priceAsc');
    expect(app.filteredListings().map((listing) => listing.id)).toEqual([5, 1, 2]);

    const descendingButton = compiled.querySelector<HTMLButtonElement>('[data-sort="priceDesc"]');
    descendingButton?.click();
    fixture.detectChanges();

    expect(app.sortBy()).toBe('priceDesc');
    expect(app.filteredListings().map((listing) => listing.id)).toEqual([2, 1, 5]);
  });

  it('should render the advice section linked from the navigation', async () => {
    const fixture = TestBed.createComponent(App);
    await fixture.whenStable();
    const compiled = fixture.nativeElement as HTMLElement;
    const adviceLink = compiled.querySelector<HTMLAnchorElement>('a[href="#conseils"]');
    const adviceSection = compiled.querySelector<HTMLElement>('#conseils');

    expect(adviceLink?.textContent?.trim()).toBe('Conseils');
    expect(adviceSection?.querySelectorAll('.advice-card')).toHaveLength(3);
    expect(adviceSection?.textContent).toContain('Des conseils pour avancer en confiance');
  });

  it('should render the neighborhoods section linked from the navigation', async () => {
    const fixture = TestBed.createComponent(App);
    await fixture.whenStable();
    const compiled = fixture.nativeElement as HTMLElement;
    const neighborhoodsLink = compiled.querySelector<HTMLAnchorElement>('a[href="#quartiers"]');
    const neighborhoodsSection = compiled.querySelector<HTMLElement>('#quartiers');

    expect(neighborhoodsLink?.textContent?.trim()).toBe('Quartiers');
    expect(neighborhoodsSection?.querySelectorAll('.neighborhood-card')).toHaveLength(6);
    expect(neighborhoodsSection?.textContent).toContain('Les quartiers disponibles');
  });

  it('should compute district summaries for each city and district', () => {
    const fixture = TestBed.createComponent(App);
    const app = fixture.componentInstance;

    expect(app.districtSummaries().length).toBe(6);

    const anfaSummary = app.districtSummaries().find((summary) => summary.district === 'Anfa');
    expect(anfaSummary?.city).toBe('Casablanca');
    expect(anfaSummary?.count).toBe(1);
    expect(anfaSummary?.avgPrice).toBe(2480000);
    expect(anfaSummary?.avgArea).toBe(128);
    expect(anfaSummary?.topType).toBe('Appartement');
    expect(anfaSummary?.dominantMode).toBe('buy');
  });

  it('should filter listings when a neighborhood button is clicked', async () => {
    const fixture = TestBed.createComponent(App);
    await fixture.whenStable();
    fixture.detectChanges();

    const app = fixture.componentInstance;
    const compiled = fixture.nativeElement as HTMLElement;
    const firstSummary = app.districtSummaries()[0];
    const neighborhoodButton = compiled.querySelector<HTMLButtonElement>('.neighborhood-button');

    neighborhoodButton?.click();
    fixture.detectChanges();

    expect(app.query()).toBe(firstSummary.district);
    expect(app.filteredListings().map((listing) => listing.id)).toEqual([
      app.listings().find((listing) => listing.district === firstSummary.district)?.id,
    ]);
  });
});
