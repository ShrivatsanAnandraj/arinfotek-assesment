import { neon } from '@neondatabase/serverless'

const sql = neon(process.env.DATABASE_URL)

const statements = [
  `CREATE TABLE IF NOT EXISTS users (
    id SERIAL PRIMARY KEY,
    username VARCHAR(50) UNIQUE NOT NULL,
    email VARCHAR(100) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW()
  )`,
  `CREATE TABLE IF NOT EXISTS saved_files (
    id SERIAL PRIMARY KEY,
    user_id INT REFERENCES users(id) ON DELETE CASCADE,
    filename VARCHAR(255) NOT NULL,
    content TEXT NOT NULL,
    language VARCHAR(50) NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
  )`,
  `CREATE TABLE IF NOT EXISTS progress (
    id SERIAL PRIMARY KEY,
    user_id INT REFERENCES users(id) ON DELETE CASCADE,
    language VARCHAR(50) NOT NULL,
    topic VARCHAR(100) NOT NULL,
    completed BOOLEAN DEFAULT FALSE,
    completed_at TIMESTAMPTZ,
    UNIQUE(user_id, language, topic)
  )`,
  `CREATE TABLE IF NOT EXISTS stats (
    id SERIAL PRIMARY KEY,
    user_id INT REFERENCES users(id) ON DELETE CASCADE,
    total_time_seconds INT DEFAULT 0,
    tutorials_completed INT DEFAULT 0,
    code_runs INT DEFAULT 0,
    last_active TIMESTAMPTZ DEFAULT NOW()
  )`,
  `CREATE INDEX IF NOT EXISTS idx_saved_files_user_id ON saved_files(user_id)`,
  `CREATE INDEX IF NOT EXISTS idx_progress_user_id ON progress(user_id)`,
  `CREATE INDEX IF NOT EXISTS idx_stats_user_id ON stats(user_id)`
]

async function migrate() {
  try {
    console.log('Running database migration...')
    
    for (let i = 0; i < statements.length; i++) {
      console.log(`Executing statement ${i + 1}/${statements.length}...`)
      await sql.query(statements[i])
    }
    
    console.log('Migration completed successfully!')
    process.exit(0)
  } catch (error) {
    console.error('Migration failed:', error)
    process.exit(1)
  }
}

migrate()
