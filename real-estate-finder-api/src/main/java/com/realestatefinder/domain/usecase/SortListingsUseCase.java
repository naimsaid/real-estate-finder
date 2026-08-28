package com.realestatefinder.domain.usecase;

import com.realestatefinder.domain.Listing;
import java.util.Comparator;
import java.util.List;
import java.util.Objects;

/** Sorts listings without mutating the source collection. */
public final class SortListingsUseCase {

    public List<Listing> execute(List<Listing> listings, ListingSort sort) {
        Objects.requireNonNull(listings, "listings must not be null");
        Objects.requireNonNull(sort, "sort must not be null");
        return listings.stream().sorted(comparator(sort)).toList();
    }

    private Comparator<Listing> comparator(ListingSort sort) {
        return switch (sort) {
            case RELEVANCE -> Comparator.comparingInt((Listing listing) -> listing.score().value()).reversed();
            case PRICE_ASCENDING -> Comparator.comparing(listing -> listing.price().amount());
            case PRICE_DESCENDING ->
                Comparator.comparing((Listing listing) -> listing.price().amount()).reversed();
            case NEWEST -> Comparator.comparing(Listing::publishedAt).reversed();
        };
    }
}
