package com.realestatefinder.domain.ports;

import com.realestatefinder.domain.Listing;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

/** Port for listing persistence. */
public interface ListingRepository {

    Listing save(Listing listing);

    Optional<Listing> findById(UUID id);

    List<Listing> findAll();

    void deleteById(UUID id);
}
