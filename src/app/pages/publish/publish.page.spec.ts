import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { PublishPage } from './publish.page';

describe('PublishPage', () => {
  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PublishPage],
      providers: [provideRouter([])],
    }).compileComponents();
  });

  it('shows validation errors when required fields are empty', () => {
    const fixture = TestBed.createComponent(PublishPage);
    fixture.detectChanges();

    fixture.nativeElement.querySelector('form').dispatchEvent(new Event('submit'));
    fixture.detectChanges();

    expect(fixture.componentInstance.form.invalid).toBe(true);
    expect(fixture.nativeElement.querySelectorAll('.field-error')).toHaveLength(5);
    expect(fixture.nativeElement.querySelector('[role="status"]')).toBeNull();
  });

  it('confirms a valid listing submission', () => {
    const fixture = TestBed.createComponent(PublishPage);
    fixture.componentInstance.form.setValue({
      title: 'Appartement lumineux',
      type: 'Appartement',
      city: 'Rabat',
      price: 1500000,
      email: 'proprietaire@example.com',
    });

    fixture.componentInstance.submit();
    fixture.detectChanges();

    expect(fixture.nativeElement.querySelector('[role="status"]')?.textContent).toContain(
      'Votre annonce a bien été envoyée',
    );
  });

  it('only accepts property types defined by the listing model', () => {
    const fixture = TestBed.createComponent(PublishPage);

    fixture.componentInstance.form.controls.type.setValue('Terrain' as never);

    expect(fixture.componentInstance.form.controls.type.hasError('propertyType')).toBe(true);
  });
});
