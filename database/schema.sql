-- Database
-- Table 1: Users Table
-- Everything here follow the Entity Relationship Diagram we submitted as a group for milestone 3.

CREATE TABLE IF NOT EXISTS users {
    id SERIAL PRIMARY KEY, -- serial to auto increment for tidier tables
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    role VARCHAR(50) NOT NULL, -- basically resident/ admin tag
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP -- read current time when new user is created
};