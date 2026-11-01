package com.todo.config;

import com.zaxxer.hikari.HikariDataSource;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.context.annotation.Primary;

import javax.sql.DataSource;
import java.sql.Connection;
import java.sql.DriverManager;

/**
 * Intelligent DataSource Configuration:
 * 1. Checks if the configured MySQL server (localhost:3306) is available.
 * 2. If MySQL is connected, it uses MySQL for full database persistence.
 * 3. If MySQL is not currently running, it automatically falls back to
 *    a local persistent file database (./data/tododb) so the web application
 *    starts up and opens immediately without crashing.
 */
@Configuration
public class DataSourceConfig {

    private static final Logger log = LoggerFactory.getLogger(DataSourceConfig.class);

    @Value("${spring.datasource.url:jdbc:mysql://localhost:3306/todo_db}")
    private String configuredUrl;

    @Value("${spring.datasource.username:root}")
    private String configuredUsername;

    @Value("${spring.datasource.password:root}")
    private String configuredPassword;

    @Bean
    @Primary
    public DataSource dataSource() {
        // If testing with an in-memory/H2 URL already specified (e.g. in tests)
        if (configuredUrl != null && configuredUrl.startsWith("jdbc:h2:")) {
            HikariDataSource ds = new HikariDataSource();
            ds.setJdbcUrl(configuredUrl);
            ds.setDriverClassName("org.h2.Driver");
            ds.setUsername(configuredUsername);
            ds.setPassword(configuredPassword);
            return ds;
        }

        // Test MySQL connectivity
        try {
            DriverManager.setLoginTimeout(2);
            log.info(">>> [Smart To-Do] Checking MySQL connection at {}...", configuredUrl);
            try (Connection conn = DriverManager.getConnection(configuredUrl, configuredUsername, configuredPassword)) {
                log.info(">>> [Smart To-Do] Successfully connected to MySQL database: {}", configuredUrl);
                HikariDataSource ds = new HikariDataSource();
                ds.setJdbcUrl(configuredUrl);
                ds.setUsername(configuredUsername);
                ds.setPassword(configuredPassword);
                ds.setDriverClassName("com.mysql.cj.jdbc.Driver");
                ds.setMaximumPoolSize(10);
                return ds;
            }
        } catch (Exception e) {
            log.warn(">>> [Smart To-Do] Notice: MySQL server is not detected on localhost:3306.");
            log.warn(">>> [Smart To-Do] Reason: {}", e.getMessage());
            log.warn(">>> [Smart To-Do] Starting embedded persistent storage (data/tododb) so http://localhost:8080 opens immediately!");
            
            HikariDataSource ds = new HikariDataSource();
            ds.setJdbcUrl("jdbc:h2:file:./data/tododb;DB_CLOSE_DELAY=-1;MODE=MySQL;CASE_INSENSITIVE_IDENTIFIERS=TRUE");
            ds.setDriverClassName("org.h2.Driver");
            ds.setUsername("sa");
            ds.setPassword("");
            ds.setMaximumPoolSize(10);
            return ds;
        }
    }
}
