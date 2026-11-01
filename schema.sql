-- =====================================================================
-- Smart To-Do List Management Web Application
-- Database Setup Script for MySQL
-- Database Name: todo_db
-- =====================================================================

-- 1. Create Database if not exists
CREATE DATABASE IF NOT EXISTS todo_db CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- 2. Use the database
USE todo_db;

-- 3. Create 'tasks' table
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

-- 4. Sample Seed Data for immediate testing and college presentation
INSERT INTO tasks (title, description, due_date, priority, category, status, created_at, updated_at) VALUES
('Submit Java Spring Boot Project Report', 'Finalize project documentation, class diagrams, and upload source code to college portal.', CURDATE() + INTERVAL 2 DAY, 'HIGH', 'EDUCATION', 'IN_PROGRESS', NOW(), NOW()),
('Review Database Indexing Architecture', 'Optimize MySQL query performance and verify foreign key constraints.', CURDATE() - INTERVAL 1 DAY, 'HIGH', 'WORK', 'PENDING', NOW(), NOW()),
('Evening Gym Session & 5km Run', 'Cardio and upper body workout routine at campus fitness center.', CURDATE(), 'MEDIUM', 'HEALTH', 'PENDING', NOW(), NOW()),
('Renew College Library Card', 'Visit administration block and pay annual subscription fee.', CURDATE() - INTERVAL 3 DAY, 'LOW', 'PERSONAL', 'COMPLETED', NOW(), NOW()),
('Purchase Electronics Lab Kit & Sensors', 'Get Arduino Uno, breadboard, resistors, and jumper wires for IoT practicals.', CURDATE() + INTERVAL 5 DAY, 'LOW', 'SHOPPING', 'PENDING', NOW(), NOW()),
('Design REST API Endpoints Specification', 'Prepare Swagger/OpenAPI documentation for client-server integration.', CURDATE() - INTERVAL 2 DAY, 'MEDIUM', 'WORK', 'COMPLETED', NOW(), NOW());

-- 5. Verification Query
SELECT * FROM tasks ORDER BY due_date ASC;

