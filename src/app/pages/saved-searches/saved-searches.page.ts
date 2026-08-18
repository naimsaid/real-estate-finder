import { DatePipe } from '@angular/common';
import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { HeaderComponent } from '../../components/header/header.component';
import { Filter } from '../../models/filter';
import { SavedSearch } from '../../models/saved-search';
import { SavedSearchService } from '../../services/saved-search.service';

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
                  <form class="alert-form" (submit)="saveEmail($event, search)">
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
                        (ngModelChange)="emailDrafts[search.id] = $event"
                      />
                      <button type="submit">
                        {{ search.alertEmail ? 'Modifier' : 'Activer' }}
                      </button>
                    </div>
                    @if (confirmedId() === search.id) {
                      <small role="status"
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
  readonly emailDrafts: Record<string, string> = {};

  title(filters: Filter): string {
    return `${filters.propertyType === 'Tous' ? 'Tous les biens' : filters.propertyType} · ${filters.city}`;
  }

  criteria(filters: Filter): string[] {
    const criteria = [
      `Budget max. ${new Intl.NumberFormat('fr-FR').format(filters.maxBudget)} ${filters.mode === 'buy' ? 'MAD' : 'MAD/mois'}`,
      `${filters.minRooms}+ pièce${filters.minRooms > 1 ? 's' : ''}`,
    ];
    if (filters.minArea > 0) criteria.push(`Dès ${filters.minArea} m²`);
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
    this.searches.setAlertEmail(search.id, this.emailDrafts[search.id] ?? search.alertEmail);
    this.confirmedId.set(search.id);
  }
}
