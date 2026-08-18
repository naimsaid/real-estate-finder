import { ChangeDetectionStrategy, Component, computed, inject } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { FavoriteService } from '../../services/favorite.service';

@Component({
  selector: 'app-header',
  imports: [RouterLink, RouterLinkActive],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <nav class="topbar" aria-label="Navigation principale">
      <a class="brand" routerLink="/"><span class="brand-mark">H</span><span>Habita</span></a>
      <div class="nav-links">
        <a routerLink="/" routerLinkActive="active" [routerLinkActiveOptions]="{ exact: true }"
          >Annonces</a
        ><a routerLink="/favoris" routerLinkActive="active"
          >Favoris
          <span class="favorites-count" aria-label="Nombre de favoris">{{
            favoriteCount()
          }}</span></a
        ><a href="#conseils">Conseils</a
        ><a routerLink="/compte/recherches" routerLinkActive="active">Mes recherches</a>
      </div>
      <a class="ghost-button" routerLink="/publier">Publier une annonce</a>
    </nav>
  `,
})
export class HeaderComponent {
  private readonly favorites = inject(FavoriteService);
  readonly favoriteCount = computed(() => this.favorites.favorites().length);
}
