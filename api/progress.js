import { neon } from '@neondatabase/serverless'

const sql = neon(process.env.DATABASE_URL)

export default async function handler(req, res) {
  const { method } = req
  const { user_id, language } = req.query

  if (method === 'GET') {
    try {
      const result = await sql`SELECT * FROM progress WHERE user_id = ${user_id} AND language = ${language}`
      return res.status(200).json({ progress: result })
    } catch (error) {
      console.error('Get progress error:', error)
      return res.status(500).json({ error: 'Failed to fetch progress' })
    }
  }

  if (method === 'POST') {
    const { topic, completed } = req.body
    try {
      const result = await sql`INSERT INTO progress (user_id, language, topic, completed, completed_at) VALUES (${user_id}, ${language}, ${topic}, ${completed}, CASE WHEN ${completed} THEN NOW() ELSE NULL END) ON CONFLICT (user_id, language, topic) DO UPDATE SET completed = EXCLUDED.completed, completed_at = EXCLUDED.completed_at RETURNING *`
      return res.status(200).json({ progress: result[0] })
    } catch (error) {
      console.error('Update progress error:', error)
      return res.status(500).json({ error: 'Failed to update progress' })
    }
  }

  return res.status(405).json({ error: 'Method not allowed' })
}
