import { neon } from '@neondatabase/serverless';

export default async function handler(req, res) {
  const sql = neon(process.env.DATABASE_URL);

  if (req.method === 'GET') {
    try {
      const tests = await sql('SELECT id, title, subject, course, level, topics, test_code, duration_minutes FROM tests ORDER BY id');
      const testsWithQuestions = [];
      for (const t of tests) {
        const questions = await sql(
          'SELECT id, question_text, options, correct_answer FROM questions WHERE test_id = $1 ORDER BY id',
          [t.id]
        );
        testsWithQuestions.push({ ...t, questions });
      }
      return res.status(200).json({ tests: testsWithQuestions });
    } catch (error) {
      console.error('Error fetching tests:', error);
      return res.status(500).json({ error: 'Failed to fetch tests' });
    }
  }

  if (req.method === 'POST') {
    try {
      const { title, test_code, duration_minutes, questions, subject, course, level, topics } = req.body;

      if (!title || !test_code || !questions || questions.length === 0) {
        return res.status(400).json({ error: 'Missing required fields' });
      }

      const existing = await sql('SELECT id FROM tests WHERE test_code = $1', [test_code.toUpperCase()]);
      if (existing.length > 0) {
        return res.status(400).json({ error: 'Test code already exists' });
      }

      const testResult = await sql(
        'INSERT INTO tests (title, subject, course, level, topics, test_code, duration_minutes) VALUES ($1, $2, $3, $4, $5::jsonb, $6, $7) RETURNING id',
        [title, subject || course || 'General', course || '', level || '', JSON.stringify(topics || []), test_code.toUpperCase(), duration_minutes || 30]
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

  if (req.method === 'DELETE') {
    try {
      const { test_code } = req.body;

      if (!test_code) {
        return res.status(400).json({ error: 'Test code is required' });
      }

      const testResult = await sql('SELECT id FROM tests WHERE test_code = $1', [test_code.toUpperCase()]);
      if (testResult.length === 0) {
        return res.status(404).json({ error: 'Test not found' });
      }

      const testId = testResult[0].id;
      await sql('DELETE FROM questions WHERE test_id = $1', [testId]);
      await sql('DELETE FROM attempts WHERE test_id = $1', [testId]);
      await sql('DELETE FROM survey_responses WHERE test_code = $1', [test_code.toUpperCase()]);
      await sql('DELETE FROM surveys WHERE test_code = $1', [test_code.toUpperCase()]);
      await sql('DELETE FROM tests WHERE id = $1', [testId]);

      return res.status(200).json({ success: true });
    } catch (error) {
      console.error('Error deleting test:', error);
      return res.status(500).json({ error: 'Failed to delete test' });
    }
  }

  return res.status(405).json({ error: 'Method not allowed' });
}
