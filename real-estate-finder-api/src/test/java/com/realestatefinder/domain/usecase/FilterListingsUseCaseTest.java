package com.realestatefinder.domain.usecase;

import static org.assertj.core.api.Assertions.assertThat;

import com.realestatefinder.domain.Amenity;
import com.realestatefinder.domain.Listing;
import com.realestatefinder.domain.ListingMode;
import com.realestatefinder.domain.PropertyType;
import java.math.BigDecimal;
import java.time.Instant;
import java.util.List;
import java.util.Set;
import org.junit.jupiter.api.Test;

class FilterListingsUseCaseTest {

    private final FilterListingsUseCase useCase = new FilterListingsUseCase();

    @Test
    void givenCriteriaWhenFilteringThenReturnsOnlyListingsMatchingEveryCriterion() {
        // Given
        Listing match = listing("Paris", 400_000, 70, 3, Amenity.BALCONY);
        Listing tooExpensive = listing("Paris", 600_000, 70, 3, Amenity.BALCONY);
        Listing withoutBalcony = listing("Paris", 400_000, 70, 3, Amenity.PARKING);
        ListingFilter filter = new ListingFilter(
                ListingMode.SALE,
                "Paris",
                PropertyType.APARTMENT,
                BigDecimal.valueOf(500_000),
                BigDecimal.valueOf(60),
                3,
                Set.of(Amenity.BALCONY));

        // When
        List<Listing> result = useCase.execute(List.of(match, tooExpensive, withoutBalcony), filter);

        // Then
        assertThat(result).containsExactly(match);
    }

    @Test
    void givenNoCriteriaWhenFilteringThenReturnsEveryListing() {
        // Given
        Listing listing = listing("Lyon", 200_000, 40, 2);

        // When
        List<Listing> result = useCase.execute(List.of(listing), ListingFilter.none());

        // Then
        assertThat(result).containsExactly(listing);
    }

    private Listing listing(String city, int price, int surface, int rooms, Amenity... amenities) {
        return ListingFixture.listing(
                "Appartement",
                ListingMode.SALE,
                PropertyType.APARTMENT,
                city,
                "Centre",
                price,
                surface,
                rooms,
                50,
                Instant.parse("2026-01-01T00:00:00Z"),
                amenities);
    }
}
