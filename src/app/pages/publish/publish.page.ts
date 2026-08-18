import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { AbstractControl, FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { HeaderComponent } from '../../components/header/header.component';
import { PROPERTY_TYPES, PropertyType } from '../../models/listing';

@Component({
  selector: 'app-publish-page',
  imports: [HeaderComponent, ReactiveFormsModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <main class="app-shell">
      <app-header />
      <section class="page-content form-page">
        <div>
          <p class="eyebrow">Propriétaires</p>
          <h1>Publier une annonce</h1>
          <p class="form-intro">
            Décrivez votre bien. Cette démonstration n’enregistre aucune donnée.
          </p>
        </div>

        @if (sent()) {
          <div class="form-success" role="status">
            <strong>Votre annonce a bien été envoyée.</strong>
            <p>Notre équipe la vérifiera avant sa publication.</p>
          </div>
        } @else {
          <form class="habita-form" [formGroup]="form" (ngSubmit)="submit()" novalidate>
            <label>
              <span>Titre de l’annonce *</span>
              <input formControlName="title" autocomplete="off" />
              @if (invalid('title')) {
                <small class="field-error">Le titre est obligatoire.</small>
              }
            </label>
            <label>
              <span>Type de bien *</span>
              <select formControlName="type">
                <option value="">Sélectionnez un type</option>
                @for (propertyType of propertyTypes; track propertyType) {
                  <option [value]="propertyType">{{ propertyType }}</option>
                }
              </select>
              @if (invalid('type')) {
                <small class="field-error">Le type de bien est obligatoire.</small>
              }
            </label>
            <label>
              <span>Ville *</span>
              <input formControlName="city" autocomplete="address-level2" />
              @if (invalid('city')) {
                <small class="field-error">La ville est obligatoire.</small>
              }
            </label>
            <label>
              <span>Prix *</span>
              <input type="number" min="1" formControlName="price" />
              @if (invalid('price')) {
                <small class="field-error">Saisissez un prix supérieur à zéro.</small>
              }
            </label>
            <label class="form-wide">
              <span>E-mail de contact *</span>
              <input type="email" formControlName="email" autocomplete="email" />
              @if (invalid('email')) {
                <small class="field-error">Saisissez une adresse e-mail valide.</small>
              }
            </label>
            <button class="ghost-button form-submit" type="submit">Envoyer l’annonce</button>
          </form>
        }
      </section>
    </main>
  `,
})
export class PublishPage {
  private readonly formBuilder = inject(FormBuilder);
  readonly sent = signal(false);
  readonly propertyTypes = PROPERTY_TYPES;
  readonly form = this.formBuilder.nonNullable.group({
    title: ['', Validators.required],
    type: [
      '' as PropertyType | '',
      [
        Validators.required,
        (control: AbstractControl<PropertyType | ''>) =>
          PROPERTY_TYPES.includes(control.value as PropertyType) ? null : { propertyType: true },
      ],
    ],
    city: ['', Validators.required],
    price: [0, [Validators.required, Validators.min(1)]],
    email: ['', [Validators.required, Validators.email]],
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
