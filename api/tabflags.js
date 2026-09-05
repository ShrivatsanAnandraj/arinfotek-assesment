import { neon } from '@neondatabase/serverless';

export default async function handler(req, res) {
  const sql = neon(process.env.DATABASE_URL);

  try {
    if (req.method === 'POST') {
      const { action } = req.query;

      if (action === 'resolve') {
        const { id } = req.body || {};
        if (!id) return res.status(400).json({ error: 'Flag id is required' });

        const updated = await sql`UPDATE tab_flags SET status = 'approved', resolved_at = NOW() WHERE id = ${id} RETURNING id, status, test_code, student_register_id`;

        if (updated.length === 0) {
          return res.status(404).json({ error: 'Flag not found' });
        }

        return res.status(200).json({ flag: updated[0] });
      }

      const { test_code, student_register_id, student_name, reason } = req.body || {};

      if (!test_code || !student_register_id) {
        return res.status(400).json({ error: 'test_code and student_register_id are required' });
      }

      const now = new Date().toISOString();

      const existing = await sql`SELECT id, status, violation_count, violations FROM tab_flags WHERE test_code = ${test_code} AND student_register_id = ${student_register_id} AND status = 'flagged' LIMIT 1`;

      if (existing.length > 0) {
        const row = existing[0];
        const violations = Array.isArray(row.violations) ? row.violations : [];
        violations.push(now);
        const updated = await sql`UPDATE tab_flags SET violation_count = ${(row.violation_count || 0) + 1}, violations = ${JSON.stringify(violations)}::jsonb WHERE id = ${row.id} RETURNING id, status, violation_count`;
        return res.status(200).json({ flag: updated[0], already: true });
      }

      const created = await sql`INSERT INTO tab_flags (test_code, student_register_id, student_name, reason, violation_count, violations) VALUES (${test_code}, ${student_register_id}, ${student_name || ''}, ${reason || 'Tabs changing found'}, 1, ${JSON.stringify([now])}::jsonb) RETURNING id, status, violation_count`;

      return res.status(201).json({ flag: created[0] });
    }

    if (req.method === 'GET') {
      const { action, test_code, student_register_id } = req.query;

      if (action === 'status') {
        if (!test_code || !student_register_id) {
          return res.status(400).json({ error: 'test_code and student_register_id are required' });
        }

        const rows = await sql`SELECT id, status FROM tab_flags WHERE test_code = ${test_code} AND student_register_id = ${student_register_id} AND status IN ('flagged', 'approved') ORDER BY id DESC LIMIT 1`;

        return res.status(200).json({ status: rows.length > 0 ? rows[0].status : 'none' });
      }

      if (action === 'list') {
        const flags = await sql`SELECT id, test_code, student_register_id, student_name, reason, status, violation_count, violations, created_at, resolved_at FROM tab_flags WHERE status = 'flagged' ORDER BY id DESC`;
        return res.status(200).json({ flags });
      }

      return res.status(400).json({ error: 'Invalid action' });
    }

    return res.status(405).json({ error: 'Method not allowed' });
  } catch (error) {
    console.error('Tab flag error:', error);
    return res.status(500).json({ error: 'Failed to process tab flag' });
  }
}