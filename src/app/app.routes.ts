import { Routes } from '@angular/router';
import { FavoritesPage } from './pages/favorites/favorites.page';
import { HomePage } from './pages/home/home.page';
import { ListingDetailPage } from './pages/listing-detail/listing-detail.page';

export const routes: Routes = [
  { path: '', component: HomePage, title: 'Annonces | Habita' },
  { path: 'annonces/:id', component: ListingDetailPage, title: 'Détail de l’annonce | Habita' },
  { path: 'favoris', component: FavoritesPage, title: 'Favoris | Habita' },
  { path: '**', redirectTo: '' },
];
