import { neon } from '@neondatabase/serverless';

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { code, action, courses } = req.query;

  try {
    const sql = neon(process.env.DATABASE_URL);

    if (action === 'list') {
      if (!courses) {
        return res.status(400).json({ error: 'Courses are required' });
      }
      const list = courses.split(',').map((c) => c.trim()).filter(Boolean);
      if (list.length === 0) {
        return res.status(400).json({ error: 'Courses are required' });
      }
      const tests = await sql(
        'SELECT id, title, subject, course, level, topics, test_code, duration_minutes FROM tests WHERE course = ANY($1::text[]) ORDER BY id',
        [list]
      );
      return res.status(200).json({ tests });
    }

    if (!code) {
      return res.status(400).json({ error: 'Test code is required' });
    }

    const upperCode = code.toUpperCase();

    const testResult = await sql(
      'SELECT id, title, subject, course, level, topics, test_code, duration_minutes FROM tests WHERE test_code = $1',
      [upperCode]
    );

    if (testResult.length === 0) {
      return res.status(404).json({ error: 'Invalid test code' });
    }

    const test = testResult[0];

    const questions = await sql(
      'SELECT id, question_text, options FROM questions WHERE test_id = $1 ORDER BY id',
      [test.id]
    );

    return res.status(200).json({ test, questions });
  } catch (error) {
    console.error('Error fetching test:', error);
    return res.status(500).json({ error: 'Failed to fetch test' });
  }
}

export const config = {
  api: {
    bodyParser: false,
  },
};