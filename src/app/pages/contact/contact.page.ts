import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { HeaderComponent } from '../../components/header/header.component';
import { ListingService } from '../../services/listing.service';

@Component({
  selector: 'app-contact-page',
  imports: [HeaderComponent, ReactiveFormsModule, RouterLink],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <main class="app-shell">
      <app-header />
      <section class="page-content form-page">
        <div>
          <a class="back-link" [routerLink]="listing ? ['/annonces', listing.id] : '/'"
            >← Retour à l’annonce</a
          >
          <p class="eyebrow form-eyebrow">Prendre contact</p>
          <h1>Contacter l’agence</h1>
          @if (listing) {
            <p class="form-intro">À propos de « {{ listing.title }} »</p>
          }
        </div>

        @if (sent()) {
          <div class="form-success" role="status">
            <strong>Votre message a bien été envoyé.</strong>
            <p>L’agence reviendra vers vous prochainement.</p>
          </div>
        } @else {
          <form class="habita-form" [formGroup]="form" (ngSubmit)="submit()" novalidate>
            <label>
              <span>Nom *</span>
              <input formControlName="name" autocomplete="name" />
              @if (invalid('name')) {
                <small class="field-error">Le nom est obligatoire.</small>
              }
            </label>
            <label>
              <span>E-mail *</span>
              <input type="email" formControlName="email" autocomplete="email" />
              @if (invalid('email')) {
                <small class="field-error">Saisissez une adresse e-mail valide.</small>
              }
            </label>
            <label class="form-wide">
              <span>Message *</span>
              <textarea rows="6" formControlName="message"></textarea>
              @if (invalid('message')) {
                <small class="field-error">Le message est obligatoire.</small>
              }
            </label>
            <button class="ghost-button form-submit" type="submit">Envoyer le message</button>
          </form>
        }
      </section>
    </main>
  `,
})
export class ContactPage {
  private readonly formBuilder = inject(FormBuilder);
  private readonly route = inject(ActivatedRoute);
  private readonly listings = inject(ListingService);
  readonly listing = this.listings.getListingById(Number(this.route.snapshot.paramMap.get('id')));
  readonly sent = signal(false);
  readonly form = this.formBuilder.nonNullable.group({
    name: ['', Validators.required],
    email: ['', [Validators.required, Validators.email]],
    message: ['', Validators.required],
  });

  invalid(controlName: keyof typeof this.form.controls): boolean {
    const control = this.form.controls[controlName];
    return control.invalid && control.touched;
  }

  submit(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }
    this.sent.set(true);
  }
}
