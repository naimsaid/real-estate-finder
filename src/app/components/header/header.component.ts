import { ChangeDetectionStrategy, Component } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';

@Component({
  selector: 'app-header',
  imports: [RouterLink, RouterLinkActive],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <nav class="topbar" aria-label="Navigation principale">
      <a class="brand" routerLink="/"><span class="brand-mark">H</span><span>Habita</span></a>
      <div class="nav-links">
        <a routerLink="/" routerLinkActive="active" [routerLinkActiveOptions]="{ exact: true }">Annonces</a><a routerLink="/favoris" routerLinkActive="active">Favoris</a><a href="#conseils">Conseils</a>
      </div>
      <button class="ghost-button" type="button">Publier une annonce</button>
    </nav>
  `,
})
export class HeaderComponent {}
