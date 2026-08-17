import { ChangeDetectionStrategy, Component } from '@angular/core';

@Component({
  selector: 'app-header',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <nav class="topbar" aria-label="Navigation principale">
      <a class="brand" href="#"><span class="brand-mark">H</span><span>Habita</span></a>
      <div class="nav-links">
        <a href="#annonces">Annonces</a><a href="#quartiers">Quartiers</a><a href="#conseils">Conseils</a>
      </div>
      <button class="ghost-button" type="button">Publier une annonce</button>
    </nav>
  `,
})
export class HeaderComponent {}
