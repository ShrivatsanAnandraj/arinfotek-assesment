import { neon } from '@neondatabase/serverless';

export default async function handler(req, res) {
  const sql = neon(process.env.DATABASE_URL);

  if (req.method === 'GET') {
    try {
      const tests = await sql('SELECT id, title, test_code, duration_minutes FROM tests ORDER BY id');

      const attempts = await sql(`
        SELECT a.id, a.student_name, a.student_register_id, a.score, a.total, a.submitted_at,
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

  if (req.method === 'DELETE') {
    try {
      const { action, id, test_code } = req.body;

      if (action === 'single' && id) {
        await sql('DELETE FROM attempts WHERE id = $1', [id]);
        return res.status(200).json({ success: true });
      }

      if (action === 'by_test' && test_code) {
        const testResult = await sql('SELECT id FROM tests WHERE test_code = $1', [test_code.toUpperCase()]);
        if (testResult.length > 0) {
          await sql('DELETE FROM attempts WHERE test_id = $1', [testResult[0].id]);
        }
        return res.status(200).json({ success: true });
      }

      if (action === 'all') {
        await sql('DELETE FROM attempts');
        return res.status(200).json({ success: true });
      }

      return res.status(400).json({ error: 'Invalid action' });
    } catch (error) {
      console.error('Error deleting:', error);
      return res.status(500).json({ error: 'Failed to delete' });
    }
  }

  return res.status(405).json({ error: 'Method not allowed' });
}
