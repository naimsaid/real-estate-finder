import { TestBed } from '@angular/core/testing';
import axe from 'axe-core';
import { appConfig } from '../../app.config';
import { HomePage } from './home.page';

describe('HomePage accessibility', () => {
  beforeEach(() => {
    localStorage.clear();
    TestBed.configureTestingModule({
      imports: [HomePage],
      providers: appConfig.providers,
    });
  });

  it('has no automatically detectable accessibility violations', async () => {
    const fixture = TestBed.createComponent(HomePage);
    fixture.detectChanges();
    await fixture.whenStable();

    const results = await axe.run(fixture.nativeElement as HTMLElement, {
      rules: {
        // JSDOM does not implement a layout engine, so this visual rule is covered in browser audits.
        'color-contrast': { enabled: false },
      },
    });

    expect(results.violations).toEqual([]);
  });
});
