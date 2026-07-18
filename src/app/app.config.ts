import {
  ApplicationConfig,
  importProvidersFrom,
  provideBrowserGlobalErrorListeners,
} from '@angular/core';
import { provideRouter } from '@angular/router';
import {
  ArrowUpDown,
  Bath,
  BedDouble,
  Building2,
  House,
  LandPlot,
  LucideAngularModule,
  Ruler,
  Sofa,
  Sparkles,
  SquareParking,
  Trees,
  Waves,
  Wifi,
} from 'lucide-angular';

import { routes } from './app.routes';

export const appConfig: ApplicationConfig = {
  providers: [
    provideBrowserGlobalErrorListeners(),
    provideRouter(routes),
    importProvidersFrom(
      LucideAngularModule.pick({
        ArrowUpDown,
        Bath,
        BedDouble,
        Building2,
        House,
        LandPlot,
        Ruler,
        Sofa,
        Sparkles,
        SquareParking,
        Trees,
        Waves,
        Wifi,
      }),
    ),
  ],
};
