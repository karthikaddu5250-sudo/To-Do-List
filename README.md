# 📋 Smart To-Do List Management Web Application

> **College Java Project**  
> A complete, modern, responsive, and full-stack To-Do List Web Application built with **Vanilla HTML5, CSS3, JavaScript** on the frontend and **Java Spring Boot, Spring Data JPA, Hibernate, and MySQL** on the backend.

---

## 🚀 1. Technology Stack

- **Frontend:**
  - **HTML5:** Semantic document structure for dashboard and task management pages.
  - **CSS3:** Custom responsive layout, CSS variables for theme switching, flexbox/grid, and modern glassmorphic accents.
  - **Vanilla JavaScript:** Native Fetch API, asynchronous event-driven state updates, form validation, debounce search, modal management.
  - **Zero External JS Frameworks:** No React, Angular, Vue, or jQuery.
- **Backend:**
  - **Java 17+**
  - **Spring Boot 3.3.x:** Enterprise Java web framework.
  - **Spring Web (MVC):** High-performance RESTful APIs.
  - **Spring Data JPA & Hibernate ORM:** Object-Relational Mapping and repository layer.
  - **Jakarta Bean Validation:** Server-side request validation (`@NotBlank`, `@NotNull`).
- **Database:**
  - **MySQL 8.x:** Persistent relational database.
  - Connection pooling with **HikariCP**.

---

## 🎨 2. Application Architecture & Layered Design

The backend follows the clean enterprise **Layered Architecture**:

```text
com.todo/
├── config/
│   └── CorsConfig.java               # Global Cross-Origin Resource Sharing configuration
├── controller/
│   └── TaskController.java           # REST Controller handling HTTP requests
├── dto/
│   └── TaskStatsDto.java             # Dashboard metrics transfer object
├── entity/
│   ├── Category.java                 # Enum: Personal, Education, Work, Shopping, Health, Others
│   ├── Priority.java                 # Enum: Low, Medium, High
│   ├── Task.java                     # JPA Entity mapping to MySQL 'tasks' table
│   └── TaskStatus.java               # Enum: Pending, In Progress, Completed
├── exception/
│   ├── GlobalExceptionHandler.java   # Centralized error handler returning structured JSON
│   └── ResourceNotFoundException.java # Custom 404 RuntimeException
├── repository/
│   └── TaskRepository.java           # Spring Data JPA Repository with custom JPQL queries
├── service/
│   ├── TaskService.java              # Service layer interface
│   └── TaskServiceImpl.java          # Service implementation with transactional logic
└── TodoApplication.java              # Spring Boot Main Class with sample data seeder
```

---

## 📊 3. Database Schema & Setup Instructions

### Database Details:
- **Database Name:** `todo_db`
- **Table Name:** `tasks`

### MySQL Setup Instructions:

1. Open your terminal or MySQL Workbench / phpMyAdmin / XAMPP.
2. Log into MySQL:
   ```bash
   mysql -u root -p
   ```
3. Run the following SQL script (also saved in `schema.sql`):
   ```sql
   CREATE DATABASE IF NOT EXISTS todo_db CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
   USE todo_db;

   CREATE TABLE IF NOT EXISTS tasks (
       id BIGINT AUTO_INCREMENT PRIMARY KEY,
       title VARCHAR(200) NOT NULL,
       description TEXT,
       due_date DATE NOT NULL,
       priority ENUM('LOW', 'MEDIUM', 'HIGH') NOT NULL DEFAULT 'MEDIUM',
       category ENUM('PERSONAL', 'EDUCATION', 'WORK', 'SHOPPING', 'HEALTH', 'OTHERS') NOT NULL DEFAULT 'OTHERS',
       status ENUM('PENDING', 'IN_PROGRESS', 'COMPLETED') NOT NULL DEFAULT 'PENDING',
       created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL,
       updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP NOT NULL,
       INDEX idx_tasks_status (status),
       INDEX idx_tasks_priority (priority),
       INDEX idx_tasks_category (category),
       INDEX idx_tasks_due_date (due_date)
   ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
   ```
4. Update `src/main/resources/application.properties` with your MySQL credentials:
   ```properties
   spring.datasource.url=jdbc:mysql://localhost:3306/todo_db?useSSL=false&serverTimezone=UTC&allowPublicKeyRetrieval=true
   spring.datasource.username=root
   spring.datasource.password=YOUR_MYSQL_PASSWORD
   ```

---

## ⚡ 4. How to Run the Application

### Option A: Using the Command Line (Terminal / Command Prompt)

1. **Run directly using the included Maven Wrapper:**
   - **macOS / Linux:**
     ```bash
     ./mvnw spring-boot:run
     ```
   - **Windows:**
     ```cmd
     mvnw.cmd spring-boot:run
     ```
2. **Or run the packaged JAR file:**
   ```bash
   java -jar target/smart-todo-app-1.0.0.jar
   ```
3. Open your browser and navigate to:
   - **Dashboard:** [http://localhost:8080](http://localhost:8080) or [http://localhost:8080/index.html](http://localhost:8080/index.html)
   - **Tasks Management:** [http://localhost:8080/tasks.html](http://localhost:8080/tasks.html)

---

### Option B: Running in VS Code

1. Install the recommended VS Code extensions:
   - **Extension Pack for Java** (Microsoft)
   - **Spring Boot Extension Pack** (VMware)
   - *(Optional)* **Live Server**
2. Open the project root folder in VS Code:
   ```bash
   code .
   ```
3. Navigate to `src/main/java/com/todo/TodoApplication.java`.
4. Click **Run** or press `F5` to start the application with debugging.
5. In your browser, open `http://localhost:8080`.

---

### Option C: Running in IntelliJ IDEA

1. Open IntelliJ IDEA.
2. Select **File -> Open...** and choose the `to do list` project folder.
3. IntelliJ will automatically detect the `pom.xml` as a Maven project and index the dependencies.
4. Locate `src/main/java/com/todo/TodoApplication.java`.
5. Click the green **Run (▶)** icon beside `public class TodoApplication`.
6. Open your browser at `http://localhost:8080`.

---

## 🌐 5. REST API Endpoints Specification

All backend endpoints are prefixed with `/api/tasks`:

| Method | Endpoint | Description | Request Body |
| :--- | :--- | :--- | :--- |
| `POST` | `/api/tasks` | Create a new task in MySQL | `{ "title": "...", "description": "...", "dueDate": "YYYY-MM-DD", "priority": "HIGH", "category": "WORK", "status": "PENDING" }` |
| `GET` | `/api/tasks` | Retrieve all tasks (supports query filters) | *None* (query params: `status`, `priority`, `category`, `search`, `sortBy`, `sortDir`) |
| `GET` | `/api/tasks/{id}` | Retrieve specific task by ID | *None* |
| `PUT` | `/api/tasks/{id}` | Update existing task | Task JSON payload |
| `DELETE` | `/api/tasks/{id}` | Delete task permanently from MySQL | *None* |
| `PATCH` | `/api/tasks/{id}/complete` | Mark task as completed | *None* |
| `GET` | `/api/tasks/stats` | Aggregated dashboard statistics (Total, Completed, Pending, Overdue, %) | *None* |
| `GET` | `/api/tasks/recent` | Retrieve 5 most recently created/updated tasks | *None* |
| `GET` | `/api/tasks/upcoming`| Retrieve upcoming deadline tasks | *None* |

---

## 🖥️ 6. Frontend Features Breakdown

### 1. Dashboard (`index.html`)
- **Dynamic Metrics Cards:** Total Tasks, Completed Tasks, Pending Tasks, and Overdue Tasks fetched in real-time from MySQL.
- **Visual Progress Bar:** Real-time completion percentage calculation and animated gradient indicator.
- **Recent Tasks & Upcoming Deadlines:** Two-column split layout displaying urgent due dates and latest actions.
- **Quick Complete Button:** Instant one-click task completion directly from the dashboard.

### 2. Task Management (`tasks.html`)
- **Real-Time Live Search:** Substring search on title and description with 300ms debounce.
- **Multi-Factor Filtering:** Filter simultaneously by Status (`Pending`, `In Progress`, `Completed`), Priority (`High`, `Medium`, `Low`), and Category (`Personal`, `Education`, `Work`, `Shopping`, `Health`, `Others`).
- **Sorting Options:** Sort ascending/descending by Due Date or Priority.
- **Modals:**
  - **Add Task Modal:** Validated inputs for title, description, due date, priority, category, and status.
  - **Edit Task Modal:** Pre-populates selected task values for instant editing.
  - **Delete Confirmation Modal:** Protects against accidental deletion.
- **Visual Indicators:**
  - High Priority: Red tag
  - Medium Priority: Amber tag
  - Low Priority: Green tag
  - Overdue: Pulsing red badge with overdue day counter.

### 3. Extra Capabilities
- **Dark Mode / Light Mode:** Instant toggle with smooth CSS variable transitions and `localStorage` persistence.
- **Non-Intrusive Toast System:** Success, Info, and Error alert banners with auto-dismiss.
- **Responsive Layout:** Laptop-first desktop interface with collapsible hamburger drawer on mobile and tablet screens.

---

## 🎓 7. Viva / Presentation Talking Points

1. **Architecture:** Emphasize the clean **Layered Architecture** (Controller → Service → Repository → Entity). Explain how separation of concerns makes the code testable, maintainable, and enterprise-grade.
2. **JPA & Hibernate:** Explain how Spring Data JPA abstracts boilerplate SQL, and how Hibernate automatically generates queries and updates tables via `@Entity`, `@Table`, and `@PrePersist` / `@PreUpdate`.
3. **Decoupled Frontend:** Highlight that the frontend is completely decoupled from the backend and communicates exclusively via asynchronous HTTP Fetch requests using standard RESTful conventions (`GET`, `POST`, `PUT`, `PATCH`, `DELETE`).
4. **Validation & Exception Handling:** Demonstrate input validation with `@NotBlank` and how `@RestControllerAdvice` captures errors gracefully, returning clean JSON instead of server stack traces.

