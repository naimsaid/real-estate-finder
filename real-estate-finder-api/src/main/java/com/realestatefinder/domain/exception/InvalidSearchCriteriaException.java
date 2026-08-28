package com.realestatefinder.domain.exception;

/** Raised when listing search criteria are invalid. */
public final class InvalidSearchCriteriaException extends DomainException {

    private static final String MESSAGE = "The provided search criteria are invalid.";

    public InvalidSearchCriteriaException() {
        super(MESSAGE);
    }
}
