import { ListingMode } from '../models/listing';

const numberFormatter = new Intl.NumberFormat('fr-FR', { maximumFractionDigits: 0 });

export function formatPrice(price: number, mode: ListingMode): string {
  const unit = mode === 'rent' ? ' MAD/mois' : ' MAD';
  return `${numberFormatter.format(price)}${unit}`;
}

export function formatSurface(area: number): string {
  return `${numberFormatter.format(area)} m²`;
}
