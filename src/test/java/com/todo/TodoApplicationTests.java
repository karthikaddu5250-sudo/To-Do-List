package com.todo;

import com.todo.controller.TaskController;
import com.todo.entity.Category;
import com.todo.entity.Priority;
import com.todo.entity.Task;
import com.todo.entity.TaskStatus;
import com.todo.service.TaskService;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;

import java.time.LocalDate;

import static org.junit.jupiter.api.Assertions.assertNotNull;

@SpringBootTest(properties = {
    "spring.datasource.url=jdbc:h2:mem:todotest;DB_CLOSE_DELAY=-1",
    "spring.datasource.driver-class-name=org.h2.Driver",
    "spring.datasource.username=sa",
    "spring.datasource.password=",
    "spring.jpa.properties.hibernate.dialect=org.hibernate.dialect.H2Dialect",
    "spring.jpa.hibernate.ddl-auto=create-drop"
})
class TodoApplicationTests {

    @Autowired
    private TaskController taskController;

    @Autowired
    private TaskService taskService;

    @Test
    void contextLoads() {
        assertNotNull(taskController, "TaskController should load in Spring context");
        assertNotNull(taskService, "TaskService should load in Spring context");
    }

    @Test
    void testTaskServiceCrud() {
        Task task = new Task("Test Task", "Testing Service", LocalDate.now().plusDays(1), Priority.HIGH, Category.WORK, TaskStatus.PENDING);
        Task saved = taskService.createTask(task);
        assertNotNull(saved.getId(), "Saved task should have a generated ID");

        Task completed = taskService.markTaskAsCompleted(saved.getId());
        assertNotNull(completed);
    }
}

