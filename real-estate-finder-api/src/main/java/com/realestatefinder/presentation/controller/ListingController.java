package com.realestatefinder.presentation.controller;

import com.realestatefinder.application.ListingCatalogService;
import com.realestatefinder.presentation.dto.ListingResponse;
import com.realestatefinder.presentation.mapper.ListingResponseMapper;
import java.util.List;
import java.util.UUID;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.server.ResponseStatusException;

/** REST endpoints exposing listings. */
@RestController
@RequestMapping("/api/listings")
public class ListingController {

    private final ListingCatalogService listingCatalogService;
    private final ListingResponseMapper listingResponseMapper;

    public ListingController(
            ListingCatalogService listingCatalogService, ListingResponseMapper listingResponseMapper) {
        this.listingCatalogService = listingCatalogService;
        this.listingResponseMapper = listingResponseMapper;
    }

    @GetMapping
    public List<ListingResponse> findAll() {
        return listingCatalogService.findAll().stream().map(listingResponseMapper::toResponse).toList();
    }

    @GetMapping("/{id}")
    public ListingResponse findById(@PathVariable UUID id) {
        return listingCatalogService
                .findById(id)
                .map(listingResponseMapper::toResponse)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Listing not found"));
    }
}
