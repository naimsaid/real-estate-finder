package com.realestatefinder.presentation.controller;

import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import com.realestatefinder.application.ListingCatalogService;
import com.realestatefinder.domain.Listing;
import com.realestatefinder.domain.ListingMode;
import com.realestatefinder.domain.PropertyType;
import com.realestatefinder.presentation.GlobalExceptionHandler;
import com.realestatefinder.presentation.dto.ListingResponse;
import com.realestatefinder.presentation.mapper.ListingResponseMapper;
import java.math.BigDecimal;
import java.time.Instant;
import java.util.List;
import java.util.Optional;
import java.util.Set;
import java.util.UUID;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.context.annotation.Import;
import org.springframework.test.web.servlet.MockMvc;

@WebMvcTest(ListingController.class)
@Import(GlobalExceptionHandler.class)
class ListingControllerIntegrationTest {

    private static final UUID LISTING_ID =
            UUID.fromString("10000000-0000-0000-0000-000000000001");

    @Autowired private MockMvc mockMvc;

    @MockBean private ListingCatalogService listingCatalogService;

    @MockBean private ListingResponseMapper listingResponseMapper;

    @Test
    void returnsAllListings() throws Exception {
        Listing listing = org.mockito.Mockito.mock(Listing.class);
        when(listingCatalogService.findAll()).thenReturn(List.of(listing));
        when(listingResponseMapper.toResponse(listing)).thenReturn(listingResponse());

        mockMvc.perform(get("/api/listings"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$[0].id").value(LISTING_ID.toString()))
                .andExpect(jsonPath("$[0].title").value("Appartement lumineux"))
                .andExpect(jsonPath("$[0].price").value(450000))
                .andExpect(jsonPath("$[0].city").value("Paris"));
    }

    @Test
    void returnsEmptyArrayWhenCatalogIsEmpty() throws Exception {
        when(listingCatalogService.findAll()).thenReturn(List.of());

        mockMvc.perform(get("/api/listings"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$").isArray())
                .andExpect(jsonPath("$").isEmpty());
    }

    @Test
    void returnsListingById() throws Exception {
        Listing listing = org.mockito.Mockito.mock(Listing.class);
        when(listingCatalogService.findById(LISTING_ID)).thenReturn(Optional.of(listing));
        when(listingResponseMapper.toResponse(listing)).thenReturn(listingResponse());

        mockMvc.perform(get("/api/listings/{id}", LISTING_ID))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.id").value(LISTING_ID.toString()))
                .andExpect(jsonPath("$.mode").value("SALE"));

        verify(listingCatalogService).findById(LISTING_ID);
    }

    @Test
    void returnsNotFoundWhenListingDoesNotExist() throws Exception {
        when(listingCatalogService.findById(LISTING_ID)).thenReturn(Optional.empty());

        mockMvc.perform(get("/api/listings/{id}", LISTING_ID))
                .andExpect(status().isNotFound())
                .andExpect(jsonPath("$.status").value(404))
                .andExpect(jsonPath("$.message").value("The requested resource was not found."));
    }

    @Test
    void returnsBadRequestWhenListingIdIsMalformed() throws Exception {
        mockMvc.perform(get("/api/listings/not-a-uuid"))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.status").value(400))
                .andExpect(jsonPath("$.message").value("The request is invalid."));
    }

    private static ListingResponse listingResponse() {
        Instant publishedAt = Instant.parse("2026-01-15T10:00:00Z");
        return new ListingResponse(
                LISTING_ID,
                "Appartement lumineux",
                "Au centre de Paris",
                ListingMode.SALE,
                BigDecimal.valueOf(450000),
                "EUR",
                PropertyType.APARTMENT,
                BigDecimal.valueOf(62),
                "Paris",
                "75001",
                "Louvre",
                3,
                2,
                1,
                Set.of(),
                90,
                List.of("https://example.test/listing.jpg"),
                publishedAt,
                publishedAt);
    }
}
