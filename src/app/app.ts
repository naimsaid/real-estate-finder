import { Component, OnDestroy, inject, ViewEncapsulation } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { CoreWebVitalsService } from './services/core-web-vitals.service';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet],
  templateUrl: './app.html',
  styleUrl: './app.scss',
  encapsulation: ViewEncapsulation.None,
})
export class App implements OnDestroy {
  private readonly coreWebVitals = inject(CoreWebVitalsService);

  constructor() {
    this.coreWebVitals.start();
  }

  ngOnDestroy(): void {
    this.coreWebVitals.stop();
  }
}
