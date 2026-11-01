package com.todo.entity;

/**
 * Predefined task categories.
 */
public enum Category {
    PERSONAL("Personal"),
    EDUCATION("Education"),
    WORK("Work"),
    SHOPPING("Shopping"),
    HEALTH("Health"),
    OTHERS("Others");

    private final String displayName;

    Category(String displayName) {
        this.displayName = displayName;
    }

    public String getDisplayName() {
        return displayName;
    }

    public static Category fromString(String value) {
        if (value == null || value.trim().isEmpty()) {
            return OTHERS;
        }
        for (Category c : Category.values()) {
            if (c.name().equalsIgnoreCase(value.trim()) || c.displayName.equalsIgnoreCase(value.trim())) {
                return c;
            }
        }
        return OTHERS;
    }
}

