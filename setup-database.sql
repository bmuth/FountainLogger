-- FountainLogger Database Setup Script
-- Run this script as MySQL/MariaDB root user to initialize the database

-- Create database
CREATE DATABASE IF NOT EXISTS fountain_logs
  CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- Switch to database
USE fountain_logs;

-- Create logs table
CREATE TABLE IF NOT EXISTS logs (
  id INT AUTO_INCREMENT PRIMARY KEY,
  timestamp DATETIME(3) NOT NULL,
  fountain SMALLINT NOT NULL,
  message VARCHAR(1024) NOT NULL,
  INDEX idx_timestamp (timestamp),
  INDEX idx_fountain (fountain)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Display result
SELECT 'Database setup complete!' AS status;
SHOW TABLES;
DESCRIBE logs;
