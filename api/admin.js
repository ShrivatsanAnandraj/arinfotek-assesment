import { neon } from '@neondatabase/serverless';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const sql = neon(process.env.DATABASE_URL);
    const { title, test_code, duration_minutes, questions } = req.body;

    if (!title || !test_code || !questions || questions.length === 0) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    const existing = await sql('SELECT id FROM tests WHERE test_code = $1', [test_code.toUpperCase()]);
    if (existing.length > 0) {
      return res.status(400).json({ error: 'Test code already exists' });
    }

    const testResult = await sql(
      'INSERT INTO tests (title, subject, test_code, duration_minutes) VALUES ($1, $2, $3, $4) RETURNING id',
      [title, 'General', test_code.toUpperCase(), duration_minutes || 30]
    );
    const testId = testResult[0].id;

    for (const q of questions) {
      await sql(
        'INSERT INTO questions (test_id, question_text, options, correct_answer) VALUES ($1, $2, $3, $4)',
        [testId, q.question_text, JSON.stringify(q.options), q.correct_answer]
      );
    }

    return res.status(200).json({ success: true, testId });
  } catch (error) {
    console.error('Error creating test:', error);
    return res.status(500).json({ error: 'Failed to create test: ' + error.message });
  }
}
