import { neon } from '@neondatabase/serverless';

const sql = neon(process.env.DATABASE_URL);

async function migrate() {
  await sql(`
    CREATE TABLE IF NOT EXISTS question_papers (
      id SERIAL PRIMARY KEY,
      test_code TEXT NOT NULL REFERENCES tests(test_code) ON DELETE CASCADE,
      student_name TEXT NOT NULL,
      student_register_id TEXT NOT NULL,
      level TEXT NOT NULL DEFAULT '',
      question_count INT NOT NULL DEFAULT 10,
      questions JSONB NOT NULL,
      answer_key JSONB NOT NULL,
      created_at TIMESTAMPTZ DEFAULT NOW()
    )
  `);
  console.log('Migrated: created question_papers table');
  process.exit(0);
}

migrate().catch((e) => {
  console.error(e);
  process.exit(1);
});