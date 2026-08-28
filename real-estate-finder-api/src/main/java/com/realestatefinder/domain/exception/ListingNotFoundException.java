package com.realestatefinder.domain.exception;

/** Raised when a requested real-estate listing cannot be found. */
public final class ListingNotFoundException extends DomainException {

    private static final String MESSAGE = "The requested listing was not found.";

    public ListingNotFoundException() {
        super(MESSAGE);
    }
}
