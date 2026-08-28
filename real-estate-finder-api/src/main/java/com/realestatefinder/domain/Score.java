package com.realestatefinder.domain;

/** A listing score between zero and one hundred. */
public record Score(int value) {

    public Score {
        if (value < 0 || value > 100) {
            throw new IllegalArgumentException("value must be between 0 and 100");
        }
    }
}
