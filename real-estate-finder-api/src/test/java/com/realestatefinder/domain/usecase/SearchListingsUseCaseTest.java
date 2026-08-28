package com.realestatefinder.domain.usecase;

import static org.assertj.core.api.Assertions.assertThat;
import static org.junit.jupiter.api.Assertions.assertThrows;

import com.realestatefinder.domain.Listing;
import com.realestatefinder.domain.ListingMode;
import com.realestatefinder.domain.PropertyType;
import java.time.Instant;
import java.util.List;
import org.junit.jupiter.api.Test;

class SearchListingsUseCaseTest {

    private final SearchListingsUseCase useCase = new SearchListingsUseCase();

    @Test
    void givenListingsWhenSearchingIgnoringCaseThenReturnsMatchingListings() {
        // Given
        Listing paris = listing("Appartement lumineux", "Paris", "Montmartre");
        Listing lyon = listing("Maison familiale", "Lyon", "Croix-Rousse");

        // When
        List<Listing> result = useCase.execute(List.of(paris, lyon), "  MONTMARTRE ");

        // Then
        assertThat(result).containsExactly(paris);
    }

    @Test
    void givenListingsWhenSearchingWithBlankQueryThenReturnsImmutableCopy() {
        // Given
        Listing listing = listing("Loft", "Paris", "Bastille");

        // When
        List<Listing> result = useCase.execute(List.of(listing), " ");

        // Then
        assertThat(result).containsExactly(listing);
        assertThrows(UnsupportedOperationException.class, () -> result.add(listing));
    }

    private Listing listing(String title, String city, String district) {
        return ListingFixture.listing(
                title,
                ListingMode.SALE,
                PropertyType.APARTMENT,
                city,
                district,
                300_000,
                50,
                2,
                50,
                Instant.parse("2026-01-01T00:00:00Z"));
    }
}
