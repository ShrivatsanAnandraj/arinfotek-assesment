import { neon } from '@neondatabase/serverless';

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const sql = neon(process.env.DATABASE_URL);

    const tests = await sql('SELECT id, title, test_code, subject, duration_minutes FROM tests ORDER BY id');

    const attempts = await sql(`
      SELECT a.id, a.student_name, a.student_email, a.score, a.total, a.submitted_at,
             t.title as test_title, t.test_code
      FROM attempts a
      JOIN tests t ON a.test_id = t.id
      ORDER BY a.submitted_at DESC
    `);

    return res.status(200).json({ tests, attempts });
  } catch (error) {
    console.error('Error fetching data:', error);
    return res.status(500).json({ error: 'Failed to fetch data' });
  }
}
