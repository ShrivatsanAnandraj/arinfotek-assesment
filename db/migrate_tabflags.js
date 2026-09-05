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
  console.log('Migrated: created tab_flags table');
  process.exit(0);
}

migrate().catch((e) => {
  console.error(e);
  process.exit(1);
});