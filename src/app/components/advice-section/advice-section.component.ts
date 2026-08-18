import { ChangeDetectionStrategy, Component, Input } from '@angular/core';
import { Advice } from '../../models/advice';

@Component({
  selector: 'app-advice-section',
  changeDetection: ChangeDetectionStrategy.OnPush,
  styleUrl: './advice-section.component.scss',
  template: `
    <section class="advice-section" id="conseils" aria-labelledby="advice-title">
      <div class="advice-heading"><div><p class="eyebrow">Guides immobiliers</p><h2 id="advice-title">Des conseils pour avancer en confiance</h2><p>Préparez votre projet, comparez vos options et prenez les bonnes décisions à chaque étape.</p></div><a class="advice-link" href="#annonces">Explorer les annonces</a></div>
      <div class="advice-grid">@for (article of advice; track article.title) { <article class="advice-card"><img [src]="article.image" [alt]="article.title" /><div class="advice-card-content"><span class="advice-category">{{ article.category }}</span><h3>{{ article.title }}</h3><p>{{ article.description }}</p><span class="reading-time">{{ article.readingTime }}</span></div></article> }</div>
    </section>
  `,
})
export class AdviceSectionComponent {
  @Input({ required: true }) advice!: Advice[];
}
