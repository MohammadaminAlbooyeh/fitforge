package com.fitforge.subscriptions.model;

public enum Plan {

    FREE(0),
    PRO(1);

    private final int tier;

    Plan(int tier) {
        this.tier = tier;
    }

    public int getTier() {
        return tier;
    }

    public boolean includes(Plan other) {
        return other.tier <= this.tier;
    }
}