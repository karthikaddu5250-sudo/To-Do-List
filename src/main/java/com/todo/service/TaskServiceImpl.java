package com.todo.service;

import com.todo.dto.TaskStatsDto;
import com.todo.entity.Category;
import com.todo.entity.Priority;
import com.todo.entity.Task;
import com.todo.entity.TaskStatus;
import com.todo.exception.ResourceNotFoundException;
import com.todo.repository.TaskRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.util.Comparator;
import java.util.List;
import java.util.stream.Collectors;

/**
 * Implementation of TaskService handling all CRUD and business operations.
 */
@Service
@Transactional
public class TaskServiceImpl implements TaskService {

    private final TaskRepository taskRepository;

    @Autowired
    public TaskServiceImpl(TaskRepository taskRepository) {
        this.taskRepository = taskRepository;
    }

    @Override
    public Task createTask(Task task) {
        if (task.getStatus() == null) {
            task.setStatus(TaskStatus.PENDING);
        }
        if (task.getPriority() == null) {
            task.setPriority(Priority.MEDIUM);
        }
        if (task.getCategory() == null) {
            task.setCategory(Category.OTHERS);
        }
        return taskRepository.save(task);
    }

    @Override
    @Transactional(readOnly = true)
    public List<Task> getAllTasks() {
        return taskRepository.findAll();
    }

    @Override
    @Transactional(readOnly = true)
    public List<Task> getFilteredTasks(TaskStatus status, Priority priority, Category category, 
                                       String search, String sortBy, String sortDir) {
        List<Task> tasks = taskRepository.filterTasks(status, priority, category, search);

        // Sorting logic
        Comparator<Task> comparator;
        if ("priority".equalsIgnoreCase(sortBy)) {
            // High = 2, Medium = 1, Low = 0
            comparator = Comparator.comparingInt(t -> t.getPriority().ordinal());
        } else {
            // Default sort by dueDate
            comparator = Comparator.comparing(Task::getDueDate, Comparator.nullsLast(Comparator.naturalOrder()));
        }

        if ("desc".equalsIgnoreCase(sortDir)) {
            comparator = comparator.reversed();
        }

        return tasks.stream().sorted(comparator).collect(Collectors.toList());
    }

    @Override
    @Transactional(readOnly = true)
    public Task getTaskById(Long id) {
        return taskRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Task", "id", id));
    }

    @Override
    public Task updateTask(Long id, Task taskDetails) {
        Task existingTask = getTaskById(id);

        existingTask.setTitle(taskDetails.getTitle());
        existingTask.setDescription(taskDetails.getDescription());
        existingTask.setDueDate(taskDetails.getDueDate());

        if (taskDetails.getPriority() != null) {
            existingTask.setPriority(taskDetails.getPriority());
        }
        if (taskDetails.getCategory() != null) {
            existingTask.setCategory(taskDetails.getCategory());
        }
        if (taskDetails.getStatus() != null) {
            existingTask.setStatus(taskDetails.getStatus());
        }

        return taskRepository.save(existingTask);
    }

    @Override
    public void deleteTask(Long id) {
        Task task = getTaskById(id);
        taskRepository.delete(task);
    }

    @Override
    public Task markTaskAsCompleted(Long id) {
        Task task = getTaskById(id);
        task.setStatus(TaskStatus.COMPLETED);
        return taskRepository.save(task);
    }

    @Override
    @Transactional(readOnly = true)
    public TaskStatsDto getTaskStatistics() {
        LocalDate today = LocalDate.now();

        long total = taskRepository.count();
        long completed = taskRepository.countByStatus(TaskStatus.COMPLETED);
        long pending = taskRepository.countByStatus(TaskStatus.PENDING);
        long inProgress = taskRepository.countByStatus(TaskStatus.IN_PROGRESS);
        long overdue = taskRepository.countOverdueTasks(today);

        double percentage = total > 0 ? ((double) completed / total) * 100.0 : 0.0;
        percentage = Math.round(percentage * 10.0) / 10.0; // round to 1 decimal place

        return new TaskStatsDto(total, completed, pending, inProgress, overdue, percentage);
    }

    @Override
    @Transactional(readOnly = true)
    public List<Task> getRecentTasks() {
        return taskRepository.findTop5ByOrderByCreatedAtDesc();
    }

    @Override
    @Transactional(readOnly = true)
    public List<Task> getUpcomingTasks() {
        return taskRepository.findUpcomingTasks(LocalDate.now());
    }
}

