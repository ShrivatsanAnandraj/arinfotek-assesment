import { neon } from '@neondatabase/serverless';

const sql = neon(process.env.DATABASE_URL);

async function migrate() {
  await sql(`
    CREATE TABLE IF NOT EXISTS surveys (
      id SERIAL PRIMARY KEY,
      test_code TEXT NOT NULL,
      course TEXT NOT NULL,
      trainee TEXT NOT NULL,
      no_of_days INTEGER NOT NULL,
      template_name TEXT NOT NULL,
      questions JSONB NOT NULL,
      created_at TIMESTAMP DEFAULT NOW()
    )
  `);

  await sql(`
    CREATE TABLE IF NOT EXISTS survey_responses (
      id SERIAL PRIMARY KEY,
      survey_id INTEGER REFERENCES surveys(id),
      student_name TEXT NOT NULL,
      student_register_id TEXT NOT NULL,
      test_code TEXT NOT NULL,
      answers JSONB NOT NULL,
      submitted_at TIMESTAMP DEFAULT NOW()
    )
  `);

  console.log('Migration complete: surveys and survey_responses tables created');
  process.exit(0);
}

migrate().catch((e) => {
  console.error(e);
  process.exit(1);
});
