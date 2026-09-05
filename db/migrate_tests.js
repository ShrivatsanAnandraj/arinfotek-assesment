import { neon } from '@neondatabase/serverless';

const sql = neon(process.env.DATABASE_URL);

async function migrate() {
  await sql("ALTER TABLE tests ADD COLUMN IF NOT EXISTS course TEXT NOT NULL DEFAULT ''");
  await sql("ALTER TABLE tests ADD COLUMN IF NOT EXISTS level TEXT NOT NULL DEFAULT ''");
  await sql("ALTER TABLE tests ADD COLUMN IF NOT EXISTS topics JSONB NOT NULL DEFAULT '[]'::jsonb");
  console.log('Migrated: added course, level, topics to tests');
  process.exit(0);
}

migrate().catch((e) => {
  console.error(e);
  process.exit(1);
});