import { DatePipe } from '@angular/common';
import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { HeaderComponent } from '../../components/header/header.component';
import { Filter } from '../../models/filter';
import { SavedSearch } from '../../models/saved-search';
import { SavedSearchService } from '../../services/saved-search.service';
import { formatPrice, formatSurface } from '../../utils/listing-format';

@Component({
  selector: 'app-saved-searches-page',
  imports: [DatePipe, FormsModule, HeaderComponent, RouterLink],
  changeDetection: ChangeDetectionStrategy.OnPush,
  styleUrl: './saved-searches.page.scss',
  template: `
    <main class="app-shell">
      <app-header />
      <section class="page-content saved-searches-page">
        <p class="eyebrow">Votre compte</p>
        <h1>Mes recherches sauvegardées</h1>
        <p class="saved-searches-intro">
          Retrouvez vos critères et activez une adresse email pour vos futures alertes.
        </p>
        @if (searches.savedSearches().length === 0) {
          <div class="empty-searches">
            <h2>Aucune recherche sauvegardée</h2>
            <p>Lancez une recherche puis utilisez le bouton « Enregistrer cette recherche ».</p>
            <a class="ghost-button" routerLink="/">Rechercher un bien</a>
          </div>
        } @else {
          <div class="saved-searches-list">
            @for (search of searches.savedSearches(); track search.id) {
              <article class="saved-search-card">
                <div class="saved-search-heading">
                  <div>
                    <p class="saved-search-mode">
                      {{ search.filters.mode === 'buy' ? 'Achat' : 'Location' }}
                    </p>
                    <h2>{{ title(search.filters) }}</h2>
                    <p class="saved-search-date">
                      Enregistrée le {{ search.createdAt | date: 'dd/MM/yyyy' }}
                    </p>
                  </div>
                  <button class="delete-search" type="button" (click)="searches.remove(search.id)">
                    Supprimer
                  </button>
                </div>
                <ul class="criteria-list" aria-label="Critères de la recherche">
                  @for (criterion of criteria(search.filters); track criterion) {
                    <li>{{ criterion }}</li>
                  }
                </ul>
                <div class="saved-search-actions">
                  <a class="ghost-button" routerLink="/" [queryParams]="queryParams(search.filters)"
                    >Voir les annonces</a
                  >
                  <form class="alert-form" novalidate (submit)="saveEmail($event, search)">
                    <label [for]="'alert-email-' + search.id"
                      >Email pour les alertes (optionnel)</label
                    >
                    <div>
                      <input
                        type="email"
                        [id]="'alert-email-' + search.id"
                        name="alertEmail"
                        placeholder="vous@exemple.com"
                        [ngModel]="search.alertEmail"
                        [attr.aria-invalid]="emailErrors()[search.id] ? 'true' : null"
                        [attr.aria-describedby]="
                          emailErrors()[search.id] ? 'alert-email-error-' + search.id : null
                        "
                        (ngModelChange)="updateEmailDraft(search.id, $event)"
                      />
                      <button type="submit">
                        {{ search.alertEmail ? 'Modifier' : 'Activer' }}
                      </button>
                    </div>
                    @if (emailErrors()[search.id]; as error) {
                      <small
                        class="alert-message alert-message--error"
                        [id]="'alert-email-error-' + search.id"
                        role="alert"
                        >{{ error }}</small
                      >
                    }
                    @if (confirmedId() === search.id) {
                      <small class="alert-message alert-message--success" role="status"
                        >Adresse enregistrée. Aucun email ne sera envoyé depuis cette démo.</small
                      >
                    }
                  </form>
                </div>
              </article>
            }
          </div>
        }
      </section>
    </main>
  `,
})
export class SavedSearchesPage {
  readonly searches = inject(SavedSearchService);
  readonly confirmedId = signal('');
  readonly emailErrors = signal<Record<string, string>>({});
  readonly emailDrafts: Record<string, string> = {};

  private readonly emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

  title(filters: Filter): string {
    return `${filters.propertyType === 'Tous' ? 'Tous les biens' : filters.propertyType} · ${filters.city}`;
  }

  criteria(filters: Filter): string[] {
    const criteria = [
      `Budget max. ${formatPrice(filters.maxBudget, filters.mode)}`,
      `${filters.minRooms}+ pièce${filters.minRooms > 1 ? 's' : ''}`,
    ];
    if (filters.minArea > 0) criteria.push(`Dès ${formatSurface(filters.minArea)}`);
    if (filters.amenities.length) criteria.push(...filters.amenities);
    if (filters.query) criteria.push(`Mot-clé : ${filters.query}`);
    return criteria;
  }

  queryParams(filters: Filter): Record<string, string | string[]> {
    return {
      mode: filters.mode,
      city: filters.city,
      type: filters.propertyType,
      maxBudget: String(filters.maxBudget),
      minRooms: String(filters.minRooms),
      minBedrooms: String(filters.minBedrooms),
      minBathrooms: String(filters.minBathrooms),
      minArea: String(filters.minArea),
      maxArea: String(filters.maxArea),
      amenity: filters.amenities,
      newOnly: String(filters.newOnly),
      sortBy: filters.sortBy,
      query: filters.query,
      include: filters.includeKeywords,
      exclude: filters.excludeKeywords,
      publishedWithinDays: String(filters.publishedWithinDays),
      minFloor: String(filters.minFloor),
      maxFloor: String(filters.maxFloor),
      dpe: filters.energyRatings,
    };
  }

  saveEmail(event: Event, search: SavedSearch): void {
    event.preventDefault();
    const email = (this.emailDrafts[search.id] ?? search.alertEmail).trim();

    if (!this.emailPattern.test(email)) {
      this.setEmailError(
        search.id,
        email ? 'Saisissez une adresse email valide.' : 'Saisissez une adresse email.',
      );
      return;
    }

    if (email.toLowerCase() === search.alertEmail.trim().toLowerCase()) {
      this.setEmailError(search.id, 'Une alerte est déjà activée avec cette adresse email.');
      return;
    }

    this.clearEmailError(search.id);
    this.searches.setAlertEmail(search.id, email);
    this.emailDrafts[search.id] = email;
    this.confirmedId.set(search.id);
  }

  updateEmailDraft(searchId: string, email: string): void {
    this.emailDrafts[searchId] = email;
    this.clearEmailError(searchId);
    if (this.confirmedId() === searchId) this.confirmedId.set('');
  }

  private setEmailError(searchId: string, message: string): void {
    this.confirmedId.set('');
    this.emailErrors.update((errors) => ({ ...errors, [searchId]: message }));
  }

  private clearEmailError(searchId: string): void {
    this.emailErrors.update(({ [searchId]: _removed, ...errors }) => errors);
  }
}
