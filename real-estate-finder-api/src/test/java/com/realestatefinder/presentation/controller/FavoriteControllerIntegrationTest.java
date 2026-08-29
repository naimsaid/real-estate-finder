package com.realestatefinder.presentation.controller;

import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.put;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import com.realestatefinder.application.ListingApplicationService;
import com.realestatefinder.domain.exception.ListingNotFoundException;
import com.realestatefinder.presentation.GlobalExceptionHandler;
import java.util.Set;
import java.util.UUID;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.context.annotation.Import;
import org.springframework.test.web.servlet.MockMvc;

@WebMvcTest(FavoriteController.class)
@Import(GlobalExceptionHandler.class)
class FavoriteControllerIntegrationTest {

    private static final UUID LISTING_ID =
            UUID.fromString("30000000-0000-0000-0000-000000000003");

    @Autowired private MockMvc mockMvc;

    @MockBean private ListingApplicationService listingApplicationService;

    @Test
    void returnsAllFavorites() throws Exception {
        when(listingApplicationService.favorites()).thenReturn(Set.of(LISTING_ID));

        mockMvc.perform(get("/api/favorites"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$[0].listingId").value(LISTING_ID.toString()))
                .andExpect(jsonPath("$[0].favorite").value(true));
    }

    @Test
    void returnsEmptyArrayWhenThereAreNoFavorites() throws Exception {
        when(listingApplicationService.favorites()).thenReturn(Set.of());

        mockMvc.perform(get("/api/favorites"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$").isEmpty());
    }

    @Test
    void returnsFavoriteStateForListing() throws Exception {
        when(listingApplicationService.isFavorite(LISTING_ID)).thenReturn(false);

        mockMvc.perform(get("/api/favorites/{listingId}", LISTING_ID))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.listingId").value(LISTING_ID.toString()))
                .andExpect(jsonPath("$.favorite").value(false));
    }

    @Test
    void togglesFavoriteState() throws Exception {
        when(listingApplicationService.toggleFavorite(LISTING_ID)).thenReturn(true);

        mockMvc.perform(put("/api/favorites/{listingId}", LISTING_ID))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.listingId").value(LISTING_ID.toString()))
                .andExpect(jsonPath("$.favorite").value(true));

        verify(listingApplicationService).toggleFavorite(LISTING_ID);
    }

    @Test
    void returnsNotFoundWhenToggledListingDoesNotExist() throws Exception {
        when(listingApplicationService.toggleFavorite(LISTING_ID))
                .thenThrow(new ListingNotFoundException());

        mockMvc.perform(put("/api/favorites/{listingId}", LISTING_ID))
                .andExpect(status().isNotFound())
                .andExpect(jsonPath("$.status").value(404))
                .andExpect(jsonPath("$.message").value("The requested resource was not found."));
    }

    @Test
    void returnsBadRequestWhenFavoriteIdIsMalformed() throws Exception {
        mockMvc.perform(get("/api/favorites/not-a-uuid"))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.status").value(400))
                .andExpect(jsonPath("$.message").value("The request is invalid."));
    }
}
