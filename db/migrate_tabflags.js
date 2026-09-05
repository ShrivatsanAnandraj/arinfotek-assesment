import { neon } from '@neondatabase/serverless';

const sql = neon(process.env.DATABASE_URL);

async function migrate() {
  await sql(`
    CREATE TABLE IF NOT EXISTS tab_flags (
      id SERIAL PRIMARY KEY,
      test_code TEXT NOT NULL,
      student_register_id TEXT NOT NULL,
      student_name TEXT NOT NULL,
      reason TEXT NOT NULL DEFAULT 'Tabs changing found',
      status TEXT NOT NULL DEFAULT 'flagged',
      created_at TIMESTAMPTZ DEFAULT NOW(),
      resolved_at TIMESTAMPTZ
    )
  `);
  await sql("ALTER TABLE tab_flags ADD COLUMN IF NOT EXISTS violation_count INT NOT NULL DEFAULT 1");
  await sql("ALTER TABLE tab_flags ADD COLUMN IF NOT EXISTS violations JSONB NOT NULL DEFAULT '[]'::jsonb");
  console.log('Migrated: created tab_flags table and added violation tracking');
  process.exit(0);
}

migrate().catch((e) => {
  console.error(e);
  process.exit(1);
});