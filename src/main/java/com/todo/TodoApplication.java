package com.todo;

import com.todo.entity.Category;
import com.todo.entity.Priority;
import com.todo.entity.Task;
import com.todo.entity.TaskStatus;
import com.todo.repository.TaskRepository;
import org.springframework.boot.CommandLineRunner;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.context.annotation.Bean;

import java.time.LocalDate;

/**
 * Entry point for the Smart To-Do List Spring Boot Application.
 */
@SpringBootApplication
public class TodoApplication {

    public static void main(String[] args) {
        SpringApplication.run(TodoApplication.class, args);
    }

    /**
     * Seeds initial realistic sample tasks if the database is empty.
     * This provides an immediate demonstration of dashboard metrics,
     * status pills, overdue alerts, and category badges for college evaluation.
     */
    @Bean
    CommandLineRunner initDatabase(TaskRepository repository) {
        return args -> {
            if (repository.count() == 0) {
                LocalDate today = LocalDate.now();

                // 1. Education Task - High Priority, Upcoming
                Task t1 = new Task();
                t1.setTitle("Submit Java Spring Boot Project Report");
                t1.setDescription("Finalize project documentation, class diagrams, and upload source code to college portal.");
                t1.setDueDate(today.plusDays(2));
                t1.setPriority(Priority.HIGH);
                t1.setCategory(Category.EDUCATION);
                t1.setStatus(TaskStatus.IN_PROGRESS);
                repository.save(t1);

                // 2. Work Task - Overdue Task for demonstration
                Task t2 = new Task();
                t2.setTitle("Review Database Indexing Architecture");
                t2.setDescription("Optimize MySQL query performance and verify foreign key constraints.");
                t2.setDueDate(today.minusDays(1)); // Overdue
                t2.setPriority(Priority.HIGH);
                t2.setCategory(Category.WORK);
                t2.setStatus(TaskStatus.PENDING);
                repository.save(t2);

                // 3. Health Task - Medium Priority, Today
                Task t3 = new Task();
                t3.setTitle("Evening Gym Session & 5km Run");
                t3.setDescription("Cardio and upper body workout routine at campus fitness center.");
                t3.setDueDate(today);
                t3.setPriority(Priority.MEDIUM);
                t3.setCategory(Category.HEALTH);
                t3.setStatus(TaskStatus.PENDING);
                repository.save(t3);

                // 4. Personal Task - Completed
                Task t4 = new Task();
                t4.setTitle("Renew College Library Card");
                t4.setDescription("Visit administration block and pay annual subscription fee.");
                t4.setDueDate(today.minusDays(3));
                t4.setPriority(Priority.LOW);
                t4.setCategory(Category.PERSONAL);
                t4.setStatus(TaskStatus.COMPLETED);
                repository.save(t4);

                // 5. Shopping Task - Low Priority, Upcoming
                Task t5 = new Task();
                t5.setTitle("Purchase Electronics Lab Kit & Sensors");
                t5.setDescription("Get Arduino Uno, breadboard, resistors, and jumper wires for IoT practicals.");
                t5.setDueDate(today.plusDays(5));
                t5.setPriority(Priority.LOW);
                t5.setCategory(Category.SHOPPING);
                t5.setStatus(TaskStatus.PENDING);
                repository.save(t5);

                // 6. Work Task - Completed
                Task t6 = new Task();
                t6.setTitle("Design REST API Endpoints Specification");
                t6.setDescription("Prepare Swagger/OpenAPI documentation for client-server integration.");
                t6.setDueDate(today.minusDays(2));
                t6.setPriority(Priority.MEDIUM);
                t6.setCategory(Category.WORK);
                t6.setStatus(TaskStatus.COMPLETED);
                repository.save(t6);

                System.out.println(">>> [Smart To-Do] Initial sample tasks seeded successfully into database.");
            }
        };
    }
}

