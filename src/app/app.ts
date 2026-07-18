import { CurrencyPipe } from '@angular/common';
import { Component, computed, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { LucideAngularModule } from 'lucide-angular';

type ListingMode = 'buy' | 'rent';
type PropertyType = 'Appartement' | 'Maison' | 'Villa' | 'Studio' | 'Loft';
type SortOption = 'relevance' | 'priceAsc' | 'priceDesc';

interface PropertyListing {
  id: number;
  title: string;
  city: string;
  district: string;
  mode: ListingMode;
  type: PropertyType;
  price: number;
  area: number;
  rooms: number;
  bedrooms: number;
  bathrooms: number;
  image: string;
  tags: string[];
  isNew: boolean;
  updatedMinutesAgo: number;
  score: number;
}

interface Advice {
  category: string;
  title: string;
  description: string;
  readingTime: string;
  image: string;
}

interface DistrictSummary {
  key: string;
  district: string;
  city: string;
  count: number;
  avgPrice: number;
  avgArea: number;
  topType: string;
  dominantMode: ListingMode;
}

@Component({
  selector: 'app-root',
  imports: [CurrencyPipe, FormsModule, LucideAngularModule],
  templateUrl: './app.html',
  styleUrl: './app.scss',
})
export class App {
  readonly modes: { label: string; value: ListingMode }[] = [
    { label: 'Acheter', value: 'buy' },
    { label: 'Louer', value: 'rent' },
  ];

  readonly propertyTypes: PropertyType[] = ['Appartement', 'Maison', 'Villa', 'Studio', 'Loft'];
  readonly cities = [
    'Toutes les villes',
    'Casablanca',
    'Rabat',
    'Marrakech',
    'Tanger',
    'Agadir',
    'Paris',
  ];
  readonly amenities = [
    { label: 'Terrasse', icon: 'land-plot' },
    { label: 'Balcon', icon: 'building-2' },
    { label: 'Parking', icon: 'square-parking' },
    { label: 'Ascenseur', icon: 'building-2' },
    { label: 'Jardin', icon: 'trees' },
    { label: 'Piscine', icon: 'waves' },
    { label: 'Meuble', icon: 'sofa' },
    { label: 'Vue mer', icon: 'waves' },
    { label: 'Neuf', icon: 'sparkles' },
    { label: 'Fibre', icon: 'wifi' },
  ];

  readonly sortOptions: { label: string; value: SortOption }[] = [
    { label: 'Pertinence', value: 'relevance' },
    { label: 'Prix croissant', value: 'priceAsc' },
    { label: 'Prix décroissant', value: 'priceDesc' },
  ];

  readonly advice: Advice[] = [
    {
      category: 'Bien acheter',
      title: 'Les 6 étapes pour préparer votre achat immobilier',
      description:
        'Définissez votre budget, anticipez les frais et organisez vos visites avec une méthode simple.',
      readingTime: '6 min de lecture',
      image:
        'https://images.unsplash.com/photo-1560518883-ce09059eeffa?auto=format&fit=crop&w=900&q=80',
    },
    {
      category: 'Location',
      title: 'Constituer un dossier locataire solide',
      description:
        'Les documents à prévoir et les bonnes pratiques pour présenter un dossier clair et complet.',
      readingTime: '4 min de lecture',
      image:
        'https://images.unsplash.com/photo-1560185007-cde436f6a4d0?auto=format&fit=crop&w=900&q=80',
    },
    {
      category: 'Investissement',
      title: 'Évaluer le potentiel d’un quartier',
      description:
        'Transports, services, demande locative : les indicateurs qui vous aident à choisir sereinement.',
      readingTime: '7 min de lecture',
      image:
        'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?auto=format&fit=crop&w=900&q=80',
    },
  ];

  readonly listings = signal<PropertyListing[]>([
    {
      id: 1,
      title: 'Appartement lumineux avec terrasse',
      city: 'Casablanca',
      district: 'Anfa',
      mode: 'buy',
      type: 'Appartement',
      price: 2480000,
      area: 128,
      rooms: 4,
      bedrooms: 3,
      bathrooms: 2,
      image:
        'https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?auto=format&fit=crop&w=1200&q=80',
      tags: ['Terrasse', 'Parking', 'Ascenseur'],
      isNew: true,
      updatedMinutesAgo: 3,
      score: 98,
    },
    {
      id: 2,
      title: 'Maison familiale proche des écoles',
      city: 'Rabat',
      district: 'Hay Riad',
      mode: 'buy',
      type: 'Maison',
      price: 3950000,
      area: 220,
      rooms: 6,
      bedrooms: 4,
      bathrooms: 3,
      image:
        'https://images.unsplash.com/photo-1564013799919-ab600027ffc6?auto=format&fit=crop&w=1200&q=80',
      tags: ['Jardin', 'Suite parentale', 'Calme'],
      isNew: false,
      updatedMinutesAgo: 12,
      score: 95,
    },
    {
      id: 3,
      title: 'Studio meuble au coeur du quartier',
      city: 'Paris',
      district: 'Bastille',
      mode: 'rent',
      type: 'Studio',
      price: 1390,
      area: 31,
      rooms: 1,
      bedrooms: 1,
      bathrooms: 1,
      image:
        'https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?auto=format&fit=crop&w=1200&q=80',
      tags: ['Meuble', 'Metro', 'Fibre'],
      isNew: true,
      updatedMinutesAgo: 1,
      score: 92,
    },
    {
      id: 4,
      title: 'Villa contemporaine avec piscine',
      city: 'Marrakech',
      district: 'Route de l Ourika',
      mode: 'rent',
      type: 'Villa',
      price: 18500,
      area: 360,
      rooms: 7,
      bedrooms: 5,
      bathrooms: 4,
      image:
        'https://images.unsplash.com/photo-1613490493576-7fde63acd811?auto=format&fit=crop&w=1200&q=80',
      tags: ['Piscine', 'Gardien', 'Domotique'],
      isNew: false,
      updatedMinutesAgo: 18,
      score: 90,
    },
    {
      id: 5,
      title: 'Loft design face a la marina',
      city: 'Tanger',
      district: 'Marina',
      mode: 'buy',
      type: 'Loft',
      price: 1740000,
      area: 96,
      rooms: 3,
      bedrooms: 2,
      bathrooms: 2,
      image:
        'https://images.unsplash.com/photo-1600566753190-17f0baa2a6c3?auto=format&fit=crop&w=1200&q=80',
      tags: ['Vue mer', 'Neuf', 'Conciergerie'],
      isNew: true,
      updatedMinutesAgo: 6,
      score: 89,
    },
    {
      id: 6,
      title: 'Appartement premium meuble',
      city: 'Agadir',
      district: 'Founty',
      mode: 'rent',
      type: 'Appartement',
      price: 8200,
      area: 84,
      rooms: 3,
      bedrooms: 2,
      bathrooms: 2,
      image:
        'https://images.unsplash.com/photo-1600210492493-0946911123ea?auto=format&fit=crop&w=1200&q=80',
      tags: ['Meuble', 'Balcon', 'Plage'],
      isNew: false,
      updatedMinutesAgo: 24,
      score: 87,
    },
  ]);

  readonly selectedMode = signal<ListingMode>('buy');
  readonly selectedCity = signal('Toutes les villes');
  readonly selectedType = signal<PropertyType | 'Tous'>('Tous');
  readonly maxBudget = signal(4000000);
  readonly minRooms = signal(1);
  readonly minBedrooms = signal(0);
  readonly minBathrooms = signal(0);
  readonly minArea = signal(0);
  readonly maxArea = signal(500);
  readonly selectedAmenities = signal<string[]>([]);
  readonly newOnly = signal(false);
  readonly sortBy = signal<SortOption>('relevance');
  readonly query = signal('');
  readonly favorites = signal<number[]>([1, 5]);

  readonly filteredListings = computed(() => {
    const query = this.query().trim().toLowerCase();

    return this.listings()
      .filter((listing) => listing.mode === this.selectedMode())
      .filter(
        (listing) =>
          this.selectedCity() === 'Toutes les villes' || listing.city === this.selectedCity(),
      )
      .filter((listing) => this.selectedType() === 'Tous' || listing.type === this.selectedType())
      .filter((listing) => listing.price <= this.maxBudget())
      .filter((listing) => listing.rooms >= this.minRooms())
      .filter((listing) => listing.bedrooms >= this.minBedrooms())
      .filter((listing) => listing.bathrooms >= this.minBathrooms())
      .filter((listing) => listing.area >= this.minArea())
      .filter((listing) => listing.area <= this.maxArea())
      .filter((listing) => !this.newOnly() || listing.isNew)
      .filter((listing) =>
        this.selectedAmenities().every((amenity) => listing.tags.includes(amenity)),
      )
      .filter((listing) => {
        if (!query) {
          return true;
        }

        return [listing.title, listing.city, listing.district, listing.type, ...listing.tags]
          .join(' ')
          .toLowerCase()
          .includes(query);
      })
      .sort((a, b) => {
        switch (this.sortBy()) {
          case 'priceAsc':
            return a.price - b.price;
          case 'priceDesc':
            return b.price - a.price;
          default:
            return b.score - a.score;
        }
      });
  });

  readonly sortLabel = computed(
    () => this.sortOptions.find((option) => option.value === this.sortBy())?.label ?? 'Pertinence',
  );

  readonly districtSummaries = computed<DistrictSummary[]>(() => {
    const groups = new Map<string, PropertyListing[]>();

    for (const listing of this.listings()) {
      const key = `${listing.city}::${listing.district}`;
      if (!groups.has(key)) {
        groups.set(key, []);
      }
      groups.get(key)!.push(listing);
    }

    return [...groups.values()]
      .map((items) => {
        const first = items[0];
        const count = items.length;
        const avgPrice = Math.round(items.reduce((sum, item) => sum + item.price, 0) / count);
        const avgArea = Math.round(items.reduce((sum, item) => sum + item.area, 0) / count);
        const typeCounts = new Map<string, number>();
        const modeCounts = new Map<ListingMode, number>();
        for (const item of items) {
          typeCounts.set(item.type, (typeCounts.get(item.type) ?? 0) + 1);
          modeCounts.set(item.mode, (modeCounts.get(item.mode) ?? 0) + 1);
        }
        const topType = [...typeCounts.entries()].sort((a, b) => b[1] - a[1])[0][0];
        const dominantMode = [...modeCounts.entries()].sort((a, b) => b[1] - a[1])[0][0];

        return {
          key: `${first.city}::${first.district}`,
          district: first.district,
          city: first.city,
          count,
          avgPrice,
          avgArea,
          topType,
          dominantMode,
        };
      })
      .sort((a, b) => b.count - a.count || a.district.localeCompare(b.district));
  });

  get budgetStep(): number {
    return this.selectedMode() === 'buy' ? 50000 : 250;
  }

  get budgetMax(): number {
    return this.selectedMode() === 'buy' ? 5000000 : 25000;
  }

  get budgetMin(): number {
    return this.selectedMode() === 'buy' ? 500000 : 1000;
  }

  changeMode(mode: ListingMode): void {
    this.selectedMode.set(mode);
    this.maxBudget.set(mode === 'buy' ? 4000000 : 12000);
  }

  toggleFavorite(id: number): void {
    this.favorites.update((current) =>
      current.includes(id) ? current.filter((favoriteId) => favoriteId !== id) : [...current, id],
    );
  }

  isFavorite(id: number): boolean {
    return this.favorites().includes(id);
  }

  toggleAmenity(amenity: string): void {
    this.selectedAmenities.update((current) =>
      current.includes(amenity)
        ? current.filter((item) => item !== amenity)
        : [...current, amenity],
    );
  }

  setMinArea(value: number): void {
    this.minArea.set(Math.min(value, this.maxArea() - 10));
  }

  setMaxArea(value: number): void {
    this.maxArea.set(Math.max(value, this.minArea() + 10));
  }

  filterByDistrict(summary: DistrictSummary): void {
    this.query.set(summary.district);
  }

  resetAdvancedFilters(): void {
    this.minBedrooms.set(0);
    this.minBathrooms.set(0);
    this.minArea.set(0);
    this.maxArea.set(500);
    this.selectedAmenities.set([]);
    this.newOnly.set(false);
    this.sortBy.set('relevance');
  }
}
