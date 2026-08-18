import { TestBed, fakeAsync, tick } from '@angular/core/testing';
import { SearchPanelComponent } from './search-panel.component';

describe('SearchPanelComponent', () => {
  const locations = [
    {
      label: 'Casablanca',
      value: 'Casablanca',
      type: 'city' as const,
      city: 'Casablanca',
      postalCode: '20000',
    },
    {
      label: 'Anfa',
      value: 'Anfa',
      type: 'district' as const,
      city: 'Casablanca',
      postalCode: '20000',
    },
  ];

  function createComponent() {
    const fixture = TestBed.createComponent(SearchPanelComponent);
    fixture.componentRef.setInput('modes', [{ label: 'Acheter', value: 'buy' }]);
    fixture.componentRef.setInput('locations', locations);
    fixture.componentRef.setInput('propertyTypes', ['Appartement']);
    fixture.componentRef.setInput('selectedMode', 'buy');
    fixture.componentRef.setInput('selectedCity', 'Toutes les villes');
    fixture.componentRef.setInput('selectedType', 'Tous');
    fixture.componentRef.setInput('minRooms', 1);
    fixture.detectChanges();
    return fixture;
  }

  it('debounces location suggestions by 200 ms and groups them', fakeAsync(() => {
    const fixture = createComponent();
    const component = fixture.componentInstance;

    component.searchLocation('an');
    tick(199);
    expect(component.results()).toEqual([]);
    tick(1);

    expect(component.cityResults()).toEqual([]);
    expect(component.districtResults().map(({ label }) => label)).toEqual(['Anfa']);
  }));

  it('selects the active suggestion with the keyboard', () => {
    const fixture = createComponent();
    const component = fixture.componentInstance;
    const cityChange = vi.spyOn(component.cityChange, 'emit');
    component.showSuggestions();

    component.handleLocationKeydown(new KeyboardEvent('keydown', { key: 'ArrowDown' }));
    component.handleLocationKeydown(new KeyboardEvent('keydown', { key: 'Enter' }));

    expect(cityChange).toHaveBeenCalledWith('Casablanca');
    expect(component.open()).toBe(false);
  });
});
