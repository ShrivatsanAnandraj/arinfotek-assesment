import { neon } from '@neondatabase/serverless';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const sql = neon(process.env.DATABASE_URL);
    const { title, subject, test_code, duration_minutes, questions } = req.body;

    if (!title || !test_code || !questions || questions.length === 0) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    const schema = `
      CREATE TABLE IF NOT EXISTS tests (
        id SERIAL PRIMARY KEY,
        title TEXT NOT NULL,
        subject TEXT NOT NULL DEFAULT 'General',
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
        student_email TEXT NOT NULL,
        score INT NOT NULL,
        total INT NOT NULL,
        answers JSONB NOT NULL,
        submitted_at TIMESTAMPTZ DEFAULT NOW()
      );
    `;
    await sql(schema);

    const existing = await sql('SELECT id FROM tests WHERE test_code = $1', [test_code.toUpperCase()]);
    if (existing.length > 0) {
      return res.status(400).json({ error: 'Test code already exists' });
    }

    const [test] = await sql(
      'INSERT INTO tests (title, subject, test_code, duration_minutes) VALUES ($1, $2, $3, $4) RETURNING id',
      [title, subject || 'General', test_code.toUpperCase(), duration_minutes || 30]
    );

    for (const q of questions) {
      await sql(
        'INSERT INTO questions (test_id, question_text, options, correct_answer) VALUES ($1, $2, $3, $4)',
        [test.id, q.question_text, JSON.stringify(q.options), q.correct_answer]
      );
    }

    return res.status(200).json({ success: true, testId: test.id });
  } catch (error) {
    console.error('Error creating test:', error);
    return res.status(500).json({ error: 'Failed to create test: ' + error.message });
  }
}
