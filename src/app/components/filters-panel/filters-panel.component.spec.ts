import { FiltersPanelComponent } from './filters-panel.component';
import { Filter } from '../../models/filter';

describe('FiltersPanelComponent', () => {
  const filters: Filter = {
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
    includeKeywords: '',
    excludeKeywords: '',
    publishedWithinDays: 0,
    minFloor: 0,
    maxFloor: 0,
    energyRatings: [],
  };

  let component: FiltersPanelComponent;

  beforeEach(() => {
    component = new FiltersPanelComponent();
    component.filters = { ...filters, amenities: [...filters.amenities] };
  });

  it('emits filter patches', () => {
    const emitted: Partial<Filter>[] = [];
    component.filtersChange.subscribe((value) => emitted.push(value));

    component.patch({ maxBudget: 2000000 });

    expect(emitted).toEqual([{ maxBudget: 2000000 }]);
  });

  it('adds and removes amenities without mutating the input', () => {
    const emitted: Partial<Filter>[] = [];
    component.filtersChange.subscribe((value) => emitted.push(value));

    component.toggleAmenity('Terrasse');
    component.toggleAmenity('Parking');

    expect(emitted).toEqual([{ amenities: ['Parking', 'Terrasse'] }, { amenities: [] }]);
    expect(component.filters.amenities).toEqual(['Parking']);
  });

  it('keeps a minimum gap between surface bounds', () => {
    const emitted: Partial<Filter>[] = [];
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

  it('handles the new-only checkbox without template casts', () => {
    const emitted: Partial<Filter>[] = [];
    component.filtersChange.subscribe((value) => emitted.push(value));
    const checkbox = document.createElement('input');
    checkbox.type = 'checkbox';
    checkbox.checked = true;

    component.onNewOnlyChange(new Event('change', { bubbles: true }));
    component.onNewOnlyChange({ target: checkbox } as unknown as Event);

    expect(emitted).toEqual([{ newOnly: true }]);
  });

  it('exposes surface bounds as track percentages', () => {
    expect(component.minAreaPercent).toBe(20);
    expect(component.maxAreaPercent).toBe(40);
  });

  it('keeps floor bounds coherent and toggles DPE ratings', () => {
    const emitted: Partial<Filter>[] = [];
    component.filters = { ...component.filters, minFloor: 2, maxFloor: 5 };
    component.filtersChange.subscribe((value) => emitted.push(value));

    component.setMinFloor(10);
    component.setMaxFloor(1);
    component.toggleEnergyRating('B');

    expect(emitted).toEqual([{ minFloor: 5 }, { maxFloor: 2 }, { energyRatings: ['B'] }]);
  });
});
