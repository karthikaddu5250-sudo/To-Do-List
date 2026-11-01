package com.todo.repository;

import com.todo.entity.Category;
import com.todo.entity.Priority;
import com.todo.entity.Task;
import com.todo.entity.TaskStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.List;

/**
 * Task Repository for database operations via Spring Data JPA.
 */
@Repository
public interface TaskRepository extends JpaRepository<Task, Long> {

    // Find tasks by title (case-insensitive substring)
    List<Task> findByTitleContainingIgnoreCase(String title);

    // Find tasks by status
    List<Task> findByStatus(TaskStatus status);

    // Find tasks by category
    List<Task> findByCategory(Category category);

    // Find tasks by priority
    List<Task> findByPriority(Priority priority);

    // Count tasks by status
    long countByStatus(TaskStatus status);

    // Count overdue tasks (dueDate < today and status != COMPLETED)
    @Query("SELECT COUNT(t) FROM Task t WHERE t.dueDate < :today AND t.status != 'COMPLETED'")
    long countOverdueTasks(@Param("today") LocalDate today);

    // Retrieve recent tasks (order by createdAt descending)
    List<Task> findTop5ByOrderByCreatedAtDesc();

    // Retrieve upcoming tasks (dueDate >= today, status != COMPLETED, ordered by dueDate ascending)
    @Query("SELECT t FROM Task t WHERE t.dueDate >= :today AND t.status != 'COMPLETED' ORDER BY t.dueDate ASC")
    List<Task> findUpcomingTasks(@Param("today") LocalDate today);

    // Retrieve today's tasks
    @Query("SELECT t FROM Task t WHERE t.dueDate = :today ORDER BY t.priority DESC")
    List<Task> findTodayTasks(@Param("today") LocalDate today);

    // Dynamic search and filter query
    @Query("SELECT t FROM Task t WHERE " +
           "(:status IS NULL OR t.status = :status) AND " +
           "(:priority IS NULL OR t.priority = :priority) AND " +
           "(:category IS NULL OR t.category = :category) AND " +
           "(:search IS NULL OR LOWER(t.title) LIKE LOWER(CONCAT('%', :search, '%')) OR LOWER(t.description) LIKE LOWER(CONCAT('%', :search, '%')))")
    List<Task> filterTasks(@Param("status") TaskStatus status,
                           @Param("priority") Priority priority,
                           @Param("category") Category category,
                           @Param("search") String search);
}

