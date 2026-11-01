package com.todo.controller;

import com.todo.dto.TaskStatsDto;
import com.todo.entity.Category;
import com.todo.entity.Priority;
import com.todo.entity.Task;
import com.todo.entity.TaskStatus;
import com.todo.service.TaskService;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

/**
 * REST Controller exposing endpoints for Task Management.
 */
@RestController
@RequestMapping("/api/tasks")
@CrossOrigin(origins = "*", allowedHeaders = "*", methods = {
        RequestMethod.GET, RequestMethod.POST, RequestMethod.PUT,
        RequestMethod.PATCH, RequestMethod.DELETE, RequestMethod.OPTIONS
})
public class TaskController {

    private final TaskService taskService;

    @Autowired
    public TaskController(TaskService taskService) {
        this.taskService = taskService;
    }

    /**
     * POST /api/tasks - Add a new task.
     */
    @PostMapping
    public ResponseEntity<Task> createTask(@Valid @RequestBody Task task) {
        Task createdTask = taskService.createTask(task);
        return new ResponseEntity<>(createdTask, HttpStatus.CREATED);
    }

    /**
     * GET /api/tasks - Retrieve tasks with optional filtering, searching, and sorting.
     */
    @GetMapping
    public ResponseEntity<List<Task>> getAllTasks(
            @RequestParam(required = false) String status,
            @RequestParam(required = false) String priority,
            @RequestParam(required = false) String category,
            @RequestParam(required = false) String search,
            @RequestParam(defaultValue = "dueDate") String sortBy,
            @RequestParam(defaultValue = "asc") String sortDir
    ) {
        TaskStatus statusEnum = (status != null && !status.isEmpty()) ? TaskStatus.fromString(status) : null;
        Priority priorityEnum = (priority != null && !priority.isEmpty()) ? Priority.fromString(priority) : null;
        Category categoryEnum = (category != null && !category.isEmpty()) ? Category.fromString(category) : null;

        List<Task> tasks = taskService.getFilteredTasks(statusEnum, priorityEnum, categoryEnum, search, sortBy, sortDir);
        return ResponseEntity.ok(tasks);
    }

    /**
     * GET /api/tasks/{id} - Retrieve a specific task by ID.
     */
    @GetMapping("/{id}")
    public ResponseEntity<Task> getTaskById(@PathVariable Long id) {
        Task task = taskService.getTaskById(id);
        return ResponseEntity.ok(task);
    }

    /**
     * PUT /api/tasks/{id} - Update an existing task.
     */
    @PutMapping("/{id}")
    public ResponseEntity<Task> updateTask(@PathVariable Long id, @Valid @RequestBody Task taskDetails) {
        Task updatedTask = taskService.updateTask(id, taskDetails);
        return ResponseEntity.ok(updatedTask);
    }

    /**
     * DELETE /api/tasks/{id} - Delete a task by ID.
     */
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteTask(@PathVariable Long id) {
        taskService.deleteTask(id);
        return ResponseEntity.noContent().build();
    }

    /**
     * PATCH /api/tasks/{id}/complete - Mark a task as completed.
     */
    @PatchMapping("/{id}/complete")
    public ResponseEntity<Task> markTaskAsCompleted(@PathVariable Long id) {
        Task completedTask = taskService.markTaskAsCompleted(id);
        return ResponseEntity.ok(completedTask);
    }

    /**
     * GET /api/tasks/stats - Get dynamic statistics for dashboard cards and progress bar.
     */
    @GetMapping("/stats")
    public ResponseEntity<TaskStatsDto> getTaskStatistics() {
        TaskStatsDto stats = taskService.getTaskStatistics();
        return ResponseEntity.ok(stats);
    }

    /**
     * GET /api/tasks/recent - Get recent tasks for dashboard.
     */
    @GetMapping("/recent")
    public ResponseEntity<List<Task>> getRecentTasks() {
        return ResponseEntity.ok(taskService.getRecentTasks());
    }

    /**
     * GET /api/tasks/upcoming - Get upcoming deadline tasks.
     */
    @GetMapping("/upcoming")
    public ResponseEntity<List<Task>> getUpcomingTasks() {
        return ResponseEntity.ok(taskService.getUpcomingTasks());
    }
}

