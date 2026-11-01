package com.todo.entity;

/**
 * Task statuses.
 */
public enum TaskStatus {
    PENDING("Pending"),
    IN_PROGRESS("In Progress"),
    COMPLETED("Completed");

    private final String displayName;

    TaskStatus(String displayName) {
        this.displayName = displayName;
    }

    public String getDisplayName() {
        return displayName;
    }

    public static TaskStatus fromString(String value) {
        if (value == null || value.trim().isEmpty()) {
            return PENDING;
        }
        for (TaskStatus s : TaskStatus.values()) {
            if (s.name().equalsIgnoreCase(value.trim()) 
                    || s.displayName.equalsIgnoreCase(value.trim())
                    || s.name().replace("_", " ").equalsIgnoreCase(value.trim())
                    || s.name().replace("_", "").equalsIgnoreCase(value.replace(" ", ""))) {
                return s;
            }
        }
        return PENDING;
    }
}

