package com.realestatefinder.domain.usecase;

import static org.assertj.core.api.Assertions.assertThat;

import com.realestatefinder.domain.Listing;
import com.realestatefinder.domain.ListingMode;
import com.realestatefinder.domain.PropertyType;
import java.time.Instant;
import java.util.ArrayList;
import java.util.List;
import org.junit.jupiter.api.Test;

class SortListingsUseCaseTest {

    private final SortListingsUseCase useCase = new SortListingsUseCase();

    @Test
    void givenListingsWhenSortingByAscendingPriceThenReturnsOrderedCopy() {
        // Given
        Listing expensive = listing(500_000, 40, "2026-01-01T00:00:00Z");
        Listing affordable = listing(200_000, 80, "2026-02-01T00:00:00Z");
        List<Listing> source = new ArrayList<>(List.of(expensive, affordable));

        // When
        List<Listing> result = useCase.execute(source, ListingSort.PRICE_ASCENDING);

        // Then
        assertThat(result).containsExactly(affordable, expensive);
        assertThat(source).containsExactly(expensive, affordable);
    }

    @Test
    void givenListingsWhenSortingByRelevanceThenReturnsHighestScoreFirst() {
        // Given
        Listing lowScore = listing(200_000, 30, "2026-02-01T00:00:00Z");
        Listing highScore = listing(500_000, 90, "2026-01-01T00:00:00Z");

        // When
        List<Listing> result = useCase.execute(List.of(lowScore, highScore), ListingSort.RELEVANCE);

        // Then
        assertThat(result).containsExactly(highScore, lowScore);
    }

    private Listing listing(int price, int score, String publishedAt) {
        return ListingFixture.listing(
                "Appartement",
                ListingMode.SALE,
                PropertyType.APARTMENT,
                "Paris",
                "Centre",
                price,
                50,
                2,
                score,
                Instant.parse(publishedAt));
    }
}
