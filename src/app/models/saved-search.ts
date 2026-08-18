import { Filter } from './filter';

export interface SavedSearch {
  id: string;
  filters: Filter;
  createdAt: string;
  alertEmail: string;
}
