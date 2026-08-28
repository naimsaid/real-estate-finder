package com.realestatefinder.presentation.controller;

import com.realestatefinder.application.AdviceApplicationService;
import com.realestatefinder.presentation.dto.AdviceResponse;
import com.realestatefinder.presentation.mapper.AdviceResponseMapper;
import java.util.List;
import java.util.UUID;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.server.ResponseStatusException;

/** REST endpoints exposing editorial advice. */
@RestController
@RequestMapping("/api/advice")
public class AdviceController {

    private final AdviceApplicationService adviceApplicationService;
    private final AdviceResponseMapper adviceResponseMapper;

    public AdviceController(
            AdviceApplicationService adviceApplicationService, AdviceResponseMapper adviceResponseMapper) {
        this.adviceApplicationService = adviceApplicationService;
        this.adviceResponseMapper = adviceResponseMapper;
    }

    @GetMapping
    public List<AdviceResponse> findAll() {
        return adviceApplicationService.findAll().stream().map(adviceResponseMapper::toResponse).toList();
    }

    @GetMapping("/{id}")
    public AdviceResponse findById(@PathVariable UUID id) {
        return adviceApplicationService
                .findById(id)
                .map(adviceResponseMapper::toResponse)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Advice not found"));
    }
}
