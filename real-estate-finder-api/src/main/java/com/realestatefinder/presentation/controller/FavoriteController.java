package com.realestatefinder.presentation.controller;

import com.realestatefinder.application.ListingApplicationService;
import com.realestatefinder.presentation.dto.FavoriteResponse;
import java.util.List;
import java.util.UUID;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

/** REST endpoints managing listing favorites. */
@RestController
@RequestMapping("/api/favorites")
public class FavoriteController {

    private final ListingApplicationService listingApplicationService;

    public FavoriteController(ListingApplicationService listingApplicationService) {
        this.listingApplicationService = listingApplicationService;
    }

    @GetMapping
    public List<FavoriteResponse> findAll() {
        return listingApplicationService.favorites().stream()
                .map(id -> new FavoriteResponse(id, true))
                .toList();
    }

    @GetMapping("/{listingId}")
    public FavoriteResponse find(@PathVariable UUID listingId) {
        return new FavoriteResponse(listingId, listingApplicationService.isFavorite(listingId));
    }

    @PutMapping("/{listingId}")
    public FavoriteResponse toggle(@PathVariable UUID listingId) {
        return new FavoriteResponse(listingId, listingApplicationService.toggleFavorite(listingId));
    }
}
