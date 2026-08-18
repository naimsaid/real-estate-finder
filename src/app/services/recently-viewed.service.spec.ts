import { TestBed } from '@angular/core/testing';
import { RecentlyViewedService } from './recently-viewed.service';

describe('RecentlyViewedService', () => {
  beforeEach(() => {
    localStorage.clear();
    TestBed.configureTestingModule({});
  });

  it('stocke les consultations localement, de la plus récente à la plus ancienne', () => {
    const service = TestBed.inject(RecentlyViewedService);
    service.record(1);
    service.record(2);
    service.record(1);

    expect(service.recentlyViewedIds()).toEqual([1, 2]);
    expect(JSON.parse(localStorage.getItem('real-estate-finder:recently-viewed') ?? '[]')).toEqual([
      1, 2,
    ]);
  });

  it('limite l’historique aux six dernières annonces', () => {
    const service = TestBed.inject(RecentlyViewedService);
    for (let id = 1; id <= 8; id += 1) service.record(id);

    expect(service.recentlyViewedIds()).toEqual([8, 7, 6, 5, 4, 3]);
  });
});
