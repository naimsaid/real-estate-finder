package com.realestatefinder.presentation;

import com.realestatefinder.domain.exception.InvalidSearchCriteriaException;
import com.realestatefinder.domain.exception.ListingNotFoundException;
import com.realestatefinder.presentation.dto.ApiErrorResponse;
import java.time.Instant;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.http.converter.HttpMessageNotReadableException;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.MissingServletRequestParameterException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;
import org.springframework.web.method.annotation.MethodArgumentTypeMismatchException;
import org.springframework.web.server.ResponseStatusException;
import org.springframework.web.servlet.resource.NoResourceFoundException;

/** Centralizes safe and consistent error responses for the REST API. */
@RestControllerAdvice
public class GlobalExceptionHandler {

    private static final Logger LOGGER = LoggerFactory.getLogger(GlobalExceptionHandler.class);
    private static final String BAD_REQUEST_MESSAGE = "The request is invalid.";
    private static final String NOT_FOUND_MESSAGE = "The requested resource was not found.";
    private static final String INTERNAL_ERROR_MESSAGE = "An unexpected error occurred.";

    @ExceptionHandler(InvalidSearchCriteriaException.class)
    public ResponseEntity<ApiErrorResponse> handleInvalidSearchCriteria() {
        return response(HttpStatus.BAD_REQUEST, BAD_REQUEST_MESSAGE);
    }

    @ExceptionHandler({
        MethodArgumentNotValidException.class,
        HttpMessageNotReadableException.class,
        MethodArgumentTypeMismatchException.class,
        MissingServletRequestParameterException.class
    })
    public ResponseEntity<ApiErrorResponse> handleInvalidRequest() {
        return response(HttpStatus.BAD_REQUEST, BAD_REQUEST_MESSAGE);
    }

    @ExceptionHandler(ListingNotFoundException.class)
    public ResponseEntity<ApiErrorResponse> handleListingNotFound() {
        return response(HttpStatus.NOT_FOUND, NOT_FOUND_MESSAGE);
    }

    @ExceptionHandler(NoResourceFoundException.class)
    public ResponseEntity<ApiErrorResponse> handleResourceNotFound() {
        return response(HttpStatus.NOT_FOUND, NOT_FOUND_MESSAGE);
    }

    @ExceptionHandler(ResponseStatusException.class)
    public ResponseEntity<ApiErrorResponse> handleResponseStatus(ResponseStatusException exception) {
        if (exception.getStatusCode().value() == HttpStatus.BAD_REQUEST.value()) {
            return response(HttpStatus.BAD_REQUEST, BAD_REQUEST_MESSAGE);
        }
        if (exception.getStatusCode().value() == HttpStatus.NOT_FOUND.value()) {
            return response(HttpStatus.NOT_FOUND, NOT_FOUND_MESSAGE);
        }
        return handleUnexpectedException();
    }

    @ExceptionHandler(Exception.class)
    public ResponseEntity<ApiErrorResponse> handleUnexpectedException() {
        LOGGER.error("An unexpected server error occurred");
        return response(HttpStatus.INTERNAL_SERVER_ERROR, INTERNAL_ERROR_MESSAGE);
    }

    private ResponseEntity<ApiErrorResponse> response(HttpStatus status, String message) {
        ApiErrorResponse body =
                new ApiErrorResponse(Instant.now(), status.value(), status.getReasonPhrase(), message);
        return ResponseEntity.status(status).body(body);
    }
}
