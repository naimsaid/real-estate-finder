import { FiltersPanelComponent } from './filters-panel.component';
import { ListingFilters } from '../../models/filter';

describe('FiltersPanelComponent', () => {
  const filters: ListingFilters = {
    mode: 'buy',
    city: 'Toutes les villes',
    propertyType: 'Tous',
    maxBudget: 4000000,
    minRooms: 1,
    minBedrooms: 0,
    minBathrooms: 0,
    minArea: 100,
    maxArea: 200,
    amenities: ['Parking'],
    newOnly: false,
    sortBy: 'relevance',
    query: '',
  };

  let component: FiltersPanelComponent;

  beforeEach(() => {
    component = new FiltersPanelComponent();
    component.filters = { ...filters, amenities: [...filters.amenities] };
  });

  it('emits filter patches', () => {
    const emitted: Partial<ListingFilters>[] = [];
    component.filtersChange.subscribe((value) => emitted.push(value));

    component.patch({ maxBudget: 2000000 });

    expect(emitted).toEqual([{ maxBudget: 2000000 }]);
  });

  it('adds and removes amenities without mutating the input', () => {
    const emitted: Partial<ListingFilters>[] = [];
    component.filtersChange.subscribe((value) => emitted.push(value));

    component.toggleAmenity('Terrasse');
    component.toggleAmenity('Parking');

    expect(emitted).toEqual([{ amenities: ['Parking', 'Terrasse'] }, { amenities: [] }]);
    expect(component.filters.amenities).toEqual(['Parking']);
  });

  it('keeps a minimum gap between surface bounds', () => {
    const emitted: Partial<ListingFilters>[] = [];
    component.filtersChange.subscribe((value) => emitted.push(value));

    component.setMinArea(250);
    component.setMaxArea(50);

    expect(emitted).toEqual([{ minArea: 190 }, { maxArea: 110 }]);
  });

  it('uses mode-specific budget limits', () => {
    expect([component.budgetMin, component.budgetMax, component.budgetStep]).toEqual([
      500000, 5000000, 50000,
    ]);

    component.filters = { ...component.filters, mode: 'rent' };

    expect([component.budgetMin, component.budgetMax, component.budgetStep]).toEqual([
      1000, 25000, 250,
    ]);
  });
});
