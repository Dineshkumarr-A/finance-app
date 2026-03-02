-- Personal Financial Planner Schema
-- Single JSONB table stores the entire plan state

CREATE TABLE IF NOT EXISTS planner_plan (
  id SERIAL PRIMARY KEY,
  plan_data JSONB NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Ensure only one plan row exists via a partial unique index on a constant
CREATE UNIQUE INDEX IF NOT EXISTS planner_plan_singleton ON planner_plan ((true));
