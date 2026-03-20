-- Create Enums
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'hazard_category') THEN
        CREATE TYPE hazard_category AS ENUM (
            'Infrastructure',
            'Blocked Access',
            'Safety Hazard',
            'Vandalism',
            'Other'
        );
    END IF;

    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'hazard_status') THEN
        CREATE TYPE hazard_status AS ENUM (
            'Reported',
            'In Progress',
            'Fixed'
        );
    END IF;
END $$;

-- Users Table
CREATE TABLE IF NOT EXISTS users (
    id SERIAL PRIMARY KEY,
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    role VARCHAR(50) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL
);

-- Hazards Table (Includes Lat/Long and Enums)
CREATE TABLE IF NOT EXISTS hazards (
    id SERIAL PRIMARY KEY,
    reporter_user_id INTEGER NOT NULL REFERENCES users(id),
    category hazard_category NOT NULL,
    description TEXT NOT NULL,
    status hazard_status NOT NULL DEFAULT 'Reported',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL,
    latitude FLOAT NOT NULL CHECK (latitude BETWEEN -90 AND 90), 
    longitude FLOAT NOT NULL CHECK (longitude BETWEEN -180 AND 180)
);

-- Status Table
CREATE TABLE IF NOT EXISTS status_updates (
    id SERIAL PRIMARY KEY,
    hazard_id INTEGER NOT NULL REFERENCES hazards(id) ON DELETE CASCADE,
    staff_user_id INTEGER NOT NULL REFERENCES users(id),
    old_status hazard_status NOT NULL,
    new_status hazard_status NOT NULL,
    note TEXT,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL
);

-- Changes to Lat and Long
ALTER TABLE hazards 
ADD COLUMN IF NOT EXISTS latitude FLOAT,
ADD COLUMN IF NOT EXISTS longitude FLOAT;

ALTER TABLE hazards 
ADD COLUMN IF NOT EXISTS status hazard_status DEFAULT 'Reported';

ALTER TABLE hazards ADD COLUMN image_url TEXT;