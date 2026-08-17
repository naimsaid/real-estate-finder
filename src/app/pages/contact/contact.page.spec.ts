import { TestBed } from '@angular/core/testing';
import { ActivatedRoute, provideRouter } from '@angular/router';
import { LISTING_REPOSITORY } from '../../repositories/listing.repository';
import { StaticListingRepository } from '../../repositories/static-listing.repository';
import { ContactPage } from './contact.page';

describe('ContactPage', () => {
  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ContactPage],
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

  it('shows validation errors when required fields are empty', () => {
    const fixture = TestBed.createComponent(ContactPage);
    fixture.detectChanges();

    fixture.nativeElement.querySelector('form').dispatchEvent(new Event('submit'));
    fixture.detectChanges();

    expect(fixture.componentInstance.form.invalid).toBe(true);
    expect(fixture.nativeElement.querySelectorAll('.field-error')).toHaveLength(3);
    expect(fixture.nativeElement.querySelector('[role="status"]')).toBeNull();
  });

  it('confirms a valid contact request', () => {
    const fixture = TestBed.createComponent(ContactPage);
    fixture.componentInstance.form.setValue({
      name: 'Samira Benali',
      email: 'samira@example.com',
      message: 'Je souhaite organiser une visite.',
    });

    fixture.componentInstance.submit();
    fixture.detectChanges();

    expect(fixture.nativeElement.querySelector('[role="status"]')?.textContent).toContain(
      'Votre message a bien été envoyé',
    );
  });
});
