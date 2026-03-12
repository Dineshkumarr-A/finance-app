-- Personal Financial Planner Schema

-- Users table
CREATE TABLE IF NOT EXISTS users (
  id SERIAL PRIMARY KEY,
  email TEXT UNIQUE NOT NULL,
  password_hash TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Plan table: one plan per user
CREATE TABLE IF NOT EXISTS planner_plan (
  id SERIAL PRIMARY KEY,
  plan_data JSONB NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Add user_id column if not already present (nullable to preserve existing data)
ALTER TABLE planner_plan ADD COLUMN IF NOT EXISTS user_id INT REFERENCES users(id) ON DELETE CASCADE;

-- Drop old singleton constraint if present
DROP INDEX IF EXISTS planner_plan_singleton;

-- Add per-user unique constraint (allows NULL so existing orphaned row is kept)
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'planner_plan_user_unique') THEN
    ALTER TABLE planner_plan ADD CONSTRAINT planner_plan_user_unique UNIQUE (user_id);
  END IF;
END $$;
