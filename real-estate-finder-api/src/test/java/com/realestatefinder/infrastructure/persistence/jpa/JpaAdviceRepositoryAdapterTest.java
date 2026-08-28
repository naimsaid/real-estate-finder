package com.realestatefinder.infrastructure.persistence.jpa;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;

import com.realestatefinder.domain.Advice;
import java.time.Duration;
import java.time.LocalDate;
import java.util.List;
import java.util.UUID;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.orm.jpa.DataJpaTest;
import org.springframework.context.annotation.Import;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.test.context.TestPropertySource;

@DataJpaTest
@Import(JpaAdviceRepositoryAdapter.class)
@TestPropertySource(properties = "spring.jpa.hibernate.ddl-auto=create-drop")
class JpaAdviceRepositoryAdapterTest {

    @Autowired private JpaAdviceRepositoryAdapter adapter;

    @Autowired private SpringDataAdviceRepository springDataRepository;

    @Test
    void givenAdviceWhenSavingAndFindingThenAllDomainFieldsAreRestored() {
        // Given
        Advice advice = advice(UUID.randomUUID(), "Bien préparer son achat");

        // When
        Advice saved = adapter.save(advice);
        Advice found = adapter.findById(advice.id()).orElseThrow();

        // Then
        assertThat(saved).isEqualTo(advice);
        assertThat(found).isEqualTo(advice);
    }

    @Test
    void givenSeveralAdviceWhenFindingAllThenEveryAdviceIsMapped() {
        // Given
        Advice first = advice(UUID.randomUUID(), "Premier conseil");
        Advice second = advice(UUID.randomUUID(), "Second conseil");
        adapter.save(first);
        adapter.save(second);

        // When
        List<Advice> advice = adapter.findAll();

        // Then
        assertThat(advice).containsExactlyInAnyOrder(first, second);
    }

    @Test
    void givenExistingAdviceWhenSavingSameIdentifierThenAdviceIsUpdatedWithoutDuplicate() {
        // Given
        UUID id = UUID.randomUUID();
        adapter.save(advice(id, "Titre initial"));
        Advice updated = advice(id, "Titre actualisé");

        // When
        adapter.save(updated);
        List<Advice> advice = adapter.findAll();

        // Then
        assertThat(advice).containsExactly(updated);
    }

    @Test
    void givenExistingAdviceWhenDeletingThenItCanNoLongerBeFound() {
        // Given
        Advice advice = advice(UUID.randomUUID(), "Conseil à supprimer");
        adapter.save(advice);

        // When
        adapter.deleteById(advice.id());

        // Then
        assertThat(adapter.findById(advice.id())).isEmpty();
    }

    @Test
    void givenUnknownIdentifierWhenFindingThenEmptyOptionalIsReturned() {
        // Given
        UUID unknownId = UUID.randomUUID();

        // When
        var result = adapter.findById(unknownId);

        // Then
        assertThat(result).isEmpty();
    }

    @Test
    void givenCategoryExceedingDatabaseLimitWhenFlushingThenPersistenceErrorIsRaised() {
        // Given
        Advice advice = new Advice(
                UUID.randomUUID(),
                "x".repeat(81),
                "Conseil immobilier",
                "Description du conseil",
                Duration.ofMinutes(4),
                "https://images.test/advice.jpg",
                LocalDate.of(2026, 2, 5));
        adapter.save(advice);

        // When / Then
        assertThatThrownBy(springDataRepository::flush)
                .isInstanceOf(DataIntegrityViolationException.class);
    }

    @Test
    void givenPersistedAdviceWithInvalidReadingTimeWhenFindingThenDomainErrorIsRaised() {
        // Given
        UUID id = UUID.randomUUID();
        springDataRepository.saveAndFlush(new JpaAdviceEntity(
                id,
                "Financement",
                "Conseil invalide",
                "Description du conseil",
                0,
                "https://images.test/advice.jpg",
                LocalDate.of(2026, 2, 5)));

        // When / Then
        assertThatThrownBy(() -> adapter.findById(id))
                .isInstanceOf(IllegalArgumentException.class)
                .hasMessage("readingTime must be positive");
    }

    private static Advice advice(UUID id, String title) {
        return new Advice(
                id,
                "Financement",
                title,
                "Description du conseil",
                Duration.ofSeconds(245),
                "https://images.test/advice.jpg",
                LocalDate.of(2026, 2, 5));
    }
}
