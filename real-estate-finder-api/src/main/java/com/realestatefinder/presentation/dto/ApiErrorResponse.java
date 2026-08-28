package com.realestatefinder.presentation.dto;

import java.time.Instant;

/** Structured response returned when the API cannot complete a request. */
public record ApiErrorResponse(Instant timestamp, int status, String error, String message) {}
