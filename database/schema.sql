-- Database
-- Table 1: Users Table
-- Everything here follow the Entity Relationship Diagram we submitted as a group for milestone 3.

CREATE Database IF NOT EXISTS future_frameworks; 

CREATE TABLE IF NOT EXISTS users (
    id SERIAL PRIMARY KEY, -- serial to auto increment for tidier tables
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    role VARCHAR(50) NOT NULL, -- basically resident/ admin tag
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL-- read current time when new user is created
);

-- Table 2: Hazards Table
CREATE TABLE IF NOT EXISTS hazards (
    id SERIAL PRIMARY KEY,
    reporter_user_id INTEGER NOT NULL REFERENCES users(id),
    category VARCHAR (100) NOT NULL,
    description TEXT NOT NULL,
    status VARCHAR(50) NOT NULL, -- status of whether hazard is in progress or fixed
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL
);

-- Table 3: Status Table
CREATE TABLE IF NOT EXISTS status_updates (
    id SERIAL PRIMARY KEY,
    hazard_id INTEGER NOT NULL REFERENCES hazards (id) ON DELETE CASCADE, -- delete cascade used just in just so everything related to a deleted hazard is also deleted
    staff_user_id INTEGER NOT NULL REFERENCES users (id),
    old_status VARCHAR(50) NOT NULL,
    new_status VARCHAR(50) NOT NULL,
    note TEXT,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL
);