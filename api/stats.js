import { neon } from '@neondatabase/serverless'

const sql = neon(process.env.DATABASE_URL)

export default async function handler(req, res) {
  const { method } = req
  const { user_id } = req.query

  if (method === 'GET') {
    try {
      const stats = await sql`SELECT * FROM stats WHERE user_id = ${user_id}`
      const progress = await sql`SELECT * FROM progress WHERE user_id = ${user_id}`
      const files = await sql`SELECT COUNT(*) as count FROM saved_files WHERE user_id = ${user_id}`

      return res.status(200).json({
        stats: stats[0] || { total_time_seconds: 0, tutorials_completed: 0, code_runs: 0 },
        progress,
        filesCount: files[0]?.count || 0
      })
    } catch (error) {
      console.error('Get stats error:', error)
      return res.status(500).json({ error: 'Failed to fetch stats' })
    }
  }

  if (method === 'POST') {
    const { total_time_seconds, tutorials_completed, code_runs } = req.body
    try {
      const result = await sql`INSERT INTO stats (user_id, total_time_seconds, tutorials_completed, code_runs) VALUES (${user_id}, ${total_time_seconds || 0}, ${tutorials_completed || 0}, ${code_runs || 0}) ON CONFLICT (user_id) DO UPDATE SET total_time_seconds = stats.total_time_seconds + EXCLUDED.total_time_seconds, tutorials_completed = stats.tutorials_completed + EXCLUDED.tutorials_completed, code_runs = stats.code_runs + EXCLUDED.code_runs, last_active = NOW() RETURNING *`
      return res.status(200).json({ stats: result[0] })
    } catch (error) {
      console.error('Update stats error:', error)
      return res.status(500).json({ error: 'Failed to update stats' })
    }
  }

  return res.status(405).json({ error: 'Method not allowed' })
}
