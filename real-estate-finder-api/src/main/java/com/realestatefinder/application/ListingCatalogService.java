package com.realestatefinder.application;

import com.realestatefinder.domain.Listing;
import com.realestatefinder.domain.ports.ListingRepository;
import java.util.List;
import java.util.Objects;
import java.util.Optional;
import java.util.UUID;

/** Provides listing data to the presentation layer. */
public final class ListingCatalogService {

    private final ListingRepository listingRepository;

    public ListingCatalogService(ListingRepository listingRepository) {
        this.listingRepository = Objects.requireNonNull(listingRepository);
    }

    public List<Listing> findAll() {
        return listingRepository.findAll();
    }

    public Optional<Listing> findById(UUID id) {
        return listingRepository.findById(id);
    }
}
