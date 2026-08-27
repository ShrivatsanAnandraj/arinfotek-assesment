import { neon } from '@neondatabase/serverless'

const sql = neon(process.env.DATABASE_URL)

export default async function handler(req, res) {
  const { method } = req
  const { user_id } = req.query

  if (method === 'GET') {
    try {
      const result = await sql`SELECT * FROM saved_files WHERE user_id = ${user_id} ORDER BY updated_at DESC`
      return res.status(200).json({ files: result })
    } catch (error) {
      console.error('Get files error:', error)
      return res.status(500).json({ error: 'Failed to fetch files' })
    }
  }

  if (method === 'POST') {
    const { filename, content, language } = req.body
    try {
      const result = await sql`INSERT INTO saved_files (user_id, filename, content, language) VALUES (${user_id}, ${filename}, ${content}, ${language}) RETURNING *`
      return res.status(201).json({ file: result[0] })
    } catch (error) {
      console.error('Save file error:', error)
      return res.status(500).json({ error: 'Failed to save file' })
    }
  }

  if (method === 'PUT') {
    const { id, content } = req.body
    try {
      const result = await sql`UPDATE saved_files SET content = ${content}, updated_at = NOW() WHERE id = ${id} AND user_id = ${user_id} RETURNING *`
      return res.status(200).json({ file: result[0] })
    } catch (error) {
      console.error('Update file error:', error)
      return res.status(500).json({ error: 'Failed to update file' })
    }
  }

  if (method === 'DELETE') {
    const { id } = req.query
    try {
      await sql`DELETE FROM saved_files WHERE id = ${id} AND user_id = ${user_id}`
      return res.status(200).json({ success: true })
    } catch (error) {
      console.error('Delete file error:', error)
      return res.status(500).json({ error: 'Failed to delete file' })
    }
  }

  return res.status(405).json({ error: 'Method not allowed' })
}
