import { neon } from '@neondatabase/serverless'

const sql = neon(process.env.DATABASE_URL)

export default async function handler(req, res) {
  const { method } = req

  if (method === 'POST') {
    const { action, username, email, password } = req.body

    if (action === 'signup') {
      try {
        const existing = await sql`SELECT id FROM users WHERE username = ${username} OR email = ${email}`
        
        if (existing.length > 0) {
          return res.status(400).json({ error: 'Username or email already exists' })
        }

        const passwordHash = Buffer.from(password).toString('base64')

        const result = await sql`INSERT INTO users (username, email, password_hash) VALUES (${username}, ${email}, ${passwordHash}) RETURNING id, username, email, created_at`

        const user = result[0]

        await sql`INSERT INTO stats (user_id) VALUES (${user.id})`

        return res.status(201).json({ 
          user: { id: user.id, username: user.username, email: user.email } 
        })
      } catch (error) {
        console.error('Signup error:', error)
        return res.status(500).json({ error: 'Failed to create user' })
      }
    }

    if (action === 'login') {
      try {
        const passwordHash = Buffer.from(password).toString('base64')
        
        const result = await sql`SELECT id, username, email FROM users WHERE username = ${username} AND password_hash = ${passwordHash}`

        if (result.length === 0) {
          return res.status(401).json({ error: 'Invalid username or password' })
        }

        const user = result[0]

        await sql`UPDATE stats SET last_active = NOW() WHERE user_id = ${user.id}`

        return res.status(200).json({ 
          user: { id: user.id, username: user.username, email: user.email } 
        })
      } catch (error) {
        console.error('Login error:', error)
        return res.status(500).json({ error: 'Failed to login' })
      }
    }
  }

  return res.status(405).json({ error: 'Method not allowed' })
}
