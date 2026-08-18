import {
  ApplicationConfig,
  provideBrowserGlobalErrorListeners,
} from '@angular/core';
import { provideClientHydration, withEventReplay } from '@angular/platform-browser';
import { provideRouter } from '@angular/router';
import {
  LucideArrowUpDown,
  LucideBath,
  LucideBedDouble,
  LucideBuilding2,
  LucideHouse,
  LucideLandPlot,
  LucideRuler,
  LucideSofa,
  LucideSparkles,
  LucideSquareParking,
  LucideTrees,
  LucideWaves,
  LucideWifi,
  provideLucideIcons,
} from '@lucide/angular';

import { routes } from './app.routes';
import { LISTING_REPOSITORY } from './repositories/listing.repository';
import { StaticListingRepository } from './repositories/static-listing.repository';

export const appConfig: ApplicationConfig = {
  providers: [
    provideBrowserGlobalErrorListeners(),
    provideClientHydration(withEventReplay()),
    provideRouter(routes),
    { provide: LISTING_REPOSITORY, useExisting: StaticListingRepository },
    provideLucideIcons(
      LucideArrowUpDown,
      LucideBath,
      LucideBedDouble,
      LucideBuilding2,
      LucideHouse,
      LucideLandPlot,
      LucideRuler,
      LucideSofa,
      LucideSparkles,
      LucideSquareParking,
      LucideTrees,
      LucideWaves,
      LucideWifi,
    ),
  ],
};
