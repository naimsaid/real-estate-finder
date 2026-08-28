package com.realestatefinder.presentation.dto;

import static org.assertj.core.api.Assertions.assertThat;

import com.realestatefinder.domain.Amenity;
import com.realestatefinder.domain.ListingMode;
import com.realestatefinder.domain.PropertyType;
import jakarta.validation.ConstraintViolation;
import jakarta.validation.Validation;
import jakarta.validation.Validator;
import jakarta.validation.ValidatorFactory;
import java.math.BigDecimal;
import java.util.List;
import java.util.Set;
import org.junit.jupiter.api.AfterAll;
import org.junit.jupiter.api.Test;

class ListingRequestValidationTest {

    private static final ValidatorFactory VALIDATOR_FACTORY =
            Validation.buildDefaultValidatorFactory();
    private static final Validator VALIDATOR = VALIDATOR_FACTORY.getValidator();

    @AfterAll
    static void closeValidatorFactory() {
        VALIDATOR_FACTORY.close();
    }

    @Test
    void acceptsAValidRequest() {
        assertThat(VALIDATOR.validate(validRequest())).isEmpty();
    }

    @Test
    void rejectsMissingRequiredFields() {
        ListingRequest request = new ListingRequest(
                " ",
                null,
                null,
                null,
                " ",
                null,
                null,
                "",
                null,
                " ",
                1,
                0,
                0,
                null,
                null);

        assertThat(invalidProperties(request))
                .containsExactlyInAnyOrder(
                        "title",
                        "description",
                        "mode",
                        "price",
                        "currency",
                        "propertyType",
                        "surface",
                        "city",
                        "postalCode",
                        "district",
                        "amenities",
                        "imageUrls");
    }

    @Test
    void rejectsInvalidBudgetSurfaceAndRoomCounts() {
        ListingRequest request = copyWithValues(
                new BigDecimal("-0.01"), BigDecimal.ZERO, 0, -1, -1, "euro", List.of(" "));

        assertThat(invalidProperties(request))
                .containsExactlyInAnyOrder(
                        "price",
                        "surface",
                        "rooms",
                        "bedrooms",
                        "bathrooms",
                        "currency",
                        "imageUrls[0].<list element>");
    }

    private static Set<String> invalidProperties(ListingRequest request) {
        return VALIDATOR.validate(request).stream()
                .map(ConstraintViolation::getPropertyPath)
                .map(Object::toString)
                .collect(java.util.stream.Collectors.toSet());
    }

    private static ListingRequest validRequest() {
        return copyWithValues(
                new BigDecimal("350000"),
                new BigDecimal("72.5"),
                3,
                2,
                1,
                "EUR",
                List.of("https://example.com/listing.jpg"));
    }

    private static ListingRequest copyWithValues(
            BigDecimal price,
            BigDecimal surface,
            int rooms,
            int bedrooms,
            int bathrooms,
            String currency,
            List<String> imageUrls) {
        return new ListingRequest(
                "Appartement lumineux",
                "Appartement proche du centre-ville",
                ListingMode.SALE,
                price,
                currency,
                PropertyType.APARTMENT,
                surface,
                "Lyon",
                "69002",
                "Presqu'île",
                rooms,
                bedrooms,
                bathrooms,
                Set.of(Amenity.BALCONY),
                imageUrls);
    }
}
