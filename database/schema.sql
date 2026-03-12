-- 1. Do is used instead for safety to avoid errors if the type already exists
-- aka ENUM creation caused a bug just now so this is the loophole around it
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

-- 2. Users Table
CREATE TABLE IF NOT EXISTS users (
    id SERIAL PRIMARY KEY,
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    role VARCHAR(50) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL
);

-- 3. Hazards Table 
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

-- 4. Status Table
CREATE TABLE IF NOT EXISTS status_updates (
    id SERIAL PRIMARY KEY,
    hazard_id INTEGER NOT NULL REFERENCES hazards(id) ON DELETE CASCADE,
    staff_user_id INTEGER NOT NULL REFERENCES users(id),
    old_status hazard_status NOT NULL,
    new_status hazard_status NOT NULL,
    note TEXT,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL
);