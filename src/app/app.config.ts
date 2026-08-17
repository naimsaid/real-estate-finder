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
import { LISTING_REPOSITORY } from './repositories/listing.repository';
import { StaticListingRepository } from './repositories/static-listing.repository';

export const appConfig: ApplicationConfig = {
  providers: [
    provideBrowserGlobalErrorListeners(),
    provideRouter(routes),
    { provide: LISTING_REPOSITORY, useExisting: StaticListingRepository },
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
