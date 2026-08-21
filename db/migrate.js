import { neon } from '@neondatabase/serverless';

const sql = neon(process.env.DATABASE_URL);

async function migrate() {
  await sql('ALTER TABLE attempts DROP COLUMN IF EXISTS student_email');
  await sql("ALTER TABLE attempts ADD COLUMN IF NOT EXISTS student_register_id TEXT NOT NULL DEFAULT ''");
  console.log('Migrated: replaced student_email with student_register_id');
  process.exit(0);
}

migrate().catch((e) => {
  console.error(e);
  process.exit(1);
});
