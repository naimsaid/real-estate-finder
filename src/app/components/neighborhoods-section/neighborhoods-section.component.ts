import { ChangeDetectionStrategy, Component, Input } from '@angular/core';
import { RouterLink } from '@angular/router';
import { Listing } from '../../models/listing';

@Component({
  selector: 'app-neighborhoods-section',
  imports: [RouterLink],
  changeDetection: ChangeDetectionStrategy.OnPush,
  styleUrl: './neighborhoods-section.component.scss',
  template: `
    <section class="neighborhoods-section" id="quartiers" aria-labelledby="neighborhoods-title">
      <div class="neighborhoods-heading">
        <div>
          <p class="eyebrow">Explorez la ville autrement</p>
          <h2 id="neighborhoods-title">Trouvez le quartier qui vous ressemble</h2>
          <p>
            Découvrez les secteurs les plus recherchés et accédez directement aux biens disponibles
            dans chacun d’eux.
          </p>
        </div>
        <a href="#annonces">Voir toutes les annonces</a>
      </div>

      <div class="neighborhoods-grid">
        @for (listing of listings; track listing.district) {
          <article class="neighborhood-card">
            <img [src]="listing.image" [alt]="'Vue du quartier ' + listing.district" />
            <div class="neighborhood-overlay">
              <p>{{ listing.city }} · {{ listing.postalCode }}</p>
              <h3>{{ listing.district }}</h3>
              <a
                routerLink="/"
                [queryParams]="{
                  city: listing.district,
                  mode: listing.mode,
                  maxBudget: listing.mode === 'buy' ? 4000000 : 20000,
                }"
                fragment="annonces"
                [attr.aria-label]="'Voir les annonces à ' + listing.district"
              >
                Découvrir le quartier <span aria-hidden="true">→</span>
              </a>
            </div>
          </article>
        }
      </div>
    </section>
  `,
})
export class NeighborhoodsSectionComponent {
  @Input({ required: true }) listings!: readonly Listing[];
}
