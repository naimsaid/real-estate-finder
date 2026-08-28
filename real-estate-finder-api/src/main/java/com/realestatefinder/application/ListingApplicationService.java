package com.realestatefinder.application;

import com.realestatefinder.domain.Listing;
import com.realestatefinder.domain.usecase.FilterListingsUseCase;
import com.realestatefinder.domain.usecase.ListingFilter;
import com.realestatefinder.domain.usecase.ListingSort;
import com.realestatefinder.domain.usecase.SearchListingsUseCase;
import com.realestatefinder.domain.usecase.SortListingsUseCase;
import com.realestatefinder.domain.usecase.ToggleFavoriteUseCase;
import java.util.List;
import java.util.Objects;
import java.util.Set;
import java.util.UUID;

/** Orchestrates listing domain use cases. */
public final class ListingApplicationService {

    private final SearchListingsUseCase searchListingsUseCase;
    private final FilterListingsUseCase filterListingsUseCase;
    private final SortListingsUseCase sortListingsUseCase;
    private final ToggleFavoriteUseCase toggleFavoriteUseCase;

    public ListingApplicationService(
            SearchListingsUseCase searchListingsUseCase,
            FilterListingsUseCase filterListingsUseCase,
            SortListingsUseCase sortListingsUseCase,
            ToggleFavoriteUseCase toggleFavoriteUseCase) {
        this.searchListingsUseCase = Objects.requireNonNull(searchListingsUseCase);
        this.filterListingsUseCase = Objects.requireNonNull(filterListingsUseCase);
        this.sortListingsUseCase = Objects.requireNonNull(sortListingsUseCase);
        this.toggleFavoriteUseCase = Objects.requireNonNull(toggleFavoriteUseCase);
    }

    public List<Listing> search(List<Listing> listings, String query) {
        return searchListingsUseCase.execute(listings, query);
    }

    public List<Listing> filter(List<Listing> listings, ListingFilter filter) {
        return filterListingsUseCase.execute(listings, filter);
    }

    public List<Listing> sort(List<Listing> listings, ListingSort sort) {
        return sortListingsUseCase.execute(listings, sort);
    }

    public boolean toggleFavorite(UUID listingId) {
        return toggleFavoriteUseCase.execute(listingId);
    }

    public boolean isFavorite(UUID listingId) {
        return toggleFavoriteUseCase.isFavorite(listingId);
    }

    public Set<UUID> favorites() {
        return toggleFavoriteUseCase.favorites();
    }
}
