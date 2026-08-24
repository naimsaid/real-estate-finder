import { describe, expect, it } from 'vitest';
import { formatPrice, formatSurface } from './listing-format';

describe('listing formatting', () => {
  it('formats a purchase price in MAD without a monthly unit', () => {
    expect(formatPrice(1_250_000, 'buy')).toBe('1 250 000 MAD');
  });

  it('formats a rental price in MAD per month', () => {
    expect(formatPrice(12_500, 'rent')).toBe('12 500 MAD/mois');
  });

  it('formats a surface in square metres', () => {
    expect(formatSurface(125)).toBe('125 m²');
  });
});
