import { TestBed } from '@angular/core/testing';
import { Router } from '@angular/router';
import { App } from './app';
import { appConfig } from './app.config';
import { HomePage } from './pages/home/home.page';

describe('App', () => {
  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [App],
      providers: appConfig.providers,
    }).compileComponents();
    await TestBed.inject(Router).navigateByUrl('/');
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
    fixture.detectChanges();
    const page = fixture.debugElement.query((element) => element.componentInstance instanceof HomePage)
      .componentInstance as HomePage;

    expect(page.filters().sortBy).toBe('relevance');
    expect(page.filteredListings().map((listing) => listing.id)).toEqual([1, 2, 5]);
  });

  it('should change the listing order when a price sort is selected', () => {
    const fixture = TestBed.createComponent(App);
    const compiled = fixture.nativeElement as HTMLElement;
    fixture.detectChanges();
    const page = fixture.debugElement.query((element) => element.componentInstance instanceof HomePage)
      .componentInstance as HomePage;

    const ascendingButton = compiled.querySelector<HTMLButtonElement>('[data-sort="priceAsc"]');
    ascendingButton?.click();
    fixture.detectChanges();

    expect(page.filters().sortBy).toBe('priceAsc');
    expect(page.filteredListings().map((listing) => listing.id)).toEqual([5, 1, 2]);

    const descendingButton = compiled.querySelector<HTMLButtonElement>('[data-sort="priceDesc"]');
    descendingButton?.click();
    fixture.detectChanges();

    expect(page.filters().sortBy).toBe('priceDesc');
    expect(page.filteredListings().map((listing) => listing.id)).toEqual([2, 1, 5]);
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
