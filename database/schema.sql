-- Database
-- Table 1: Users Table
-- Everything here follow the Entity Relationship Diagram we submitted as a group for milestone 3.


CREATE TYPE hazard_category AS ENUM (
    'Infrastructure',
    'Blocked Access',
    'Safety Hazard',
    'Vandalism',
    'Other'
)

CREATE TYPE hazard_status AS ENUM (
    'Reported',
    'In Progress',
    'Fixed'
)

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
    category hazard_category NOT NULL,
    description TEXT NOT NULL,
    status hazard_status NOT NULL DEFAULT 'Reported', -- status of whether hazard is in progress or fixed
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL,
    latitude FLOAT NOT NULL CHECK (latitude BETWEEN -90 AND 90), 
    longitude FLOAT NOT NULL CHECK (longitude BETWEEN -180 AND 180)
);

-- Table 3: Status Table
CREATE TABLE IF NOT EXISTS status_updates (
    id SERIAL PRIMARY KEY,
    hazard_id INTEGER NOT NULL REFERENCES hazards (id) ON DELETE CASCADE, -- delete cascade used just in just so everything related to a deleted hazard is also deleted
    staff_user_id INTEGER NOT NULL REFERENCES users (id),
    old_status hazard_status NOT NULL,
    new_status hazard_status NOT NULL,
    note TEXT,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL
);