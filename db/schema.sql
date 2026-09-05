CREATE TABLE IF NOT EXISTS tests (
  id SERIAL PRIMARY KEY,
  title TEXT NOT NULL,
  subject TEXT NOT NULL DEFAULT 'General',
  course TEXT NOT NULL DEFAULT '',
  level TEXT NOT NULL DEFAULT '',
  topics JSONB NOT NULL DEFAULT '[]'::jsonb,
  test_code TEXT UNIQUE NOT NULL,
  duration_minutes INT NOT NULL DEFAULT 30
);

CREATE TABLE IF NOT EXISTS questions (
  id SERIAL PRIMARY KEY,
  test_id INT REFERENCES tests(id) ON DELETE CASCADE,
  question_text TEXT NOT NULL,
  options JSONB NOT NULL,
  correct_answer INT NOT NULL
);

CREATE TABLE IF NOT EXISTS attempts (
  id SERIAL PRIMARY KEY,
  test_id INT REFERENCES tests(id),
  student_name TEXT NOT NULL,
  student_register_id TEXT NOT NULL,
  score INT NOT NULL,
  total INT NOT NULL,
  answers JSONB NOT NULL,
  submitted_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS tab_flags (
  id SERIAL PRIMARY KEY,
  test_code TEXT NOT NULL,
  student_register_id TEXT NOT NULL,
  student_name TEXT NOT NULL,
  reason TEXT NOT NULL DEFAULT 'Tabs changing found',
  status TEXT NOT NULL DEFAULT 'flagged',
  violation_count INT NOT NULL DEFAULT 1,
  violations JSONB NOT NULL DEFAULT '[]'::jsonb,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  resolved_at TIMESTAMPTZ
);
