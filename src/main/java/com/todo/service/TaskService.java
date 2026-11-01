package com.todo.service;

import com.todo.dto.TaskStatsDto;
import com.todo.entity.Category;
import com.todo.entity.Priority;
import com.todo.entity.Task;
import com.todo.entity.TaskStatus;

import java.util.List;

/**
 * Service interface defining task management business logic.
 */
public interface TaskService {

    // Create a new task
    Task createTask(Task task);

    // Retrieve all tasks
    List<Task> getAllTasks();

    // Filter, search and sort tasks
    List<Task> getFilteredTasks(TaskStatus status, Priority priority, Category category, String search, String sortBy, String sortDir);

    // Retrieve a task by ID
    Task getTaskById(Long id);

    // Update an existing task
    Task updateTask(Long id, Task taskDetails);

    // Delete a task by ID
    void deleteTask(Long id);

    // Mark a task as completed
    Task markTaskAsCompleted(Long id);

    // Get aggregated dashboard statistics
    TaskStatsDto getTaskStatistics();

    // Get recent tasks for dashboard
    List<Task> getRecentTasks();

    // Get upcoming deadline tasks
    List<Task> getUpcomingTasks();
}

