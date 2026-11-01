package com.todo.entity;

/**
 * Priority levels for tasks.
 */
public enum Priority {
    LOW("Low"),
    MEDIUM("Medium"),
    HIGH("High");

    private final String displayName;

    Priority(String displayName) {
        this.displayName = displayName;
    }

    public String getDisplayName() {
        return displayName;
    }

    public static Priority fromString(String value) {
        if (value == null || value.trim().isEmpty()) {
            return MEDIUM;
        }
        for (Priority p : Priority.values()) {
            if (p.name().equalsIgnoreCase(value.trim()) || p.displayName.equalsIgnoreCase(value.trim())) {
                return p;
            }
        }
        return MEDIUM;
    }
}

