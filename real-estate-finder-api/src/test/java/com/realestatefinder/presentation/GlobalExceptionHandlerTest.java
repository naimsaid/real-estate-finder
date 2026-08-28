package com.realestatefinder.presentation;

import static org.assertj.core.api.Assertions.assertThat;

import com.realestatefinder.presentation.dto.ApiErrorResponse;
import org.junit.jupiter.api.Test;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.server.ResponseStatusException;

class GlobalExceptionHandlerTest {

    private final GlobalExceptionHandler handler = new GlobalExceptionHandler();

    @Test
    void returnsStructuredBadRequestResponse() {
        ResponseEntity<ApiErrorResponse> response = handler.handleInvalidSearchCriteria();

        assertResponse(response, HttpStatus.BAD_REQUEST, "The request is invalid.");
    }

    @Test
    void returnsStructuredNotFoundResponseWithoutExposingExceptionReason() {
        ResponseEntity<ApiErrorResponse> response =
                handler.handleResponseStatus(
                        new ResponseStatusException(HttpStatus.NOT_FOUND, "private listing data"));

        assertResponse(
                response, HttpStatus.NOT_FOUND, "The requested resource was not found.");
        assertThat(response.getBody().message()).doesNotContain("private listing data");
    }

    @Test
    void returnsStructuredInternalServerErrorResponse() {
        ResponseEntity<ApiErrorResponse> response = handler.handleUnexpectedException();

        assertResponse(
                response, HttpStatus.INTERNAL_SERVER_ERROR, "An unexpected error occurred.");
    }

    private static void assertResponse(
            ResponseEntity<ApiErrorResponse> response, HttpStatus status, String message) {
        assertThat(response.getStatusCode()).isEqualTo(status);
        assertThat(response.getBody()).isNotNull();
        assertThat(response.getBody().timestamp()).isNotNull();
        assertThat(response.getBody().status()).isEqualTo(status.value());
        assertThat(response.getBody().error()).isEqualTo(status.getReasonPhrase());
        assertThat(response.getBody().message()).isEqualTo(message);
    }
}
