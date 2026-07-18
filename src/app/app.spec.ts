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
});
