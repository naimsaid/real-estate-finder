import { Routes } from '@angular/router';
import { FavoritesPage } from './pages/favorites/favorites.page';
import { HomePage } from './pages/home/home.page';
import { ListingDetailPage } from './pages/listing-detail/listing-detail.page';
import { ContactPage } from './pages/contact/contact.page';
import { PublishPage } from './pages/publish/publish.page';

export const routes: Routes = [
  { path: '', component: HomePage, title: 'Annonces | Habita' },
  { path: 'annonces/:id', component: ListingDetailPage, title: 'Détail de l’annonce | Habita' },
  { path: 'favoris', component: FavoritesPage, title: 'Favoris | Habita' },
  { path: 'publier', component: PublishPage, title: 'Publier une annonce | Habita' },
  { path: 'contact/:id', component: ContactPage, title: 'Contacter l’agence | Habita' },
  { path: '**', redirectTo: '' },
];
