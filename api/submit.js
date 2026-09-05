import { neon } from '@neondatabase/serverless';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const sql = neon(process.env.DATABASE_URL);
    const { testId, studentName, studentRegisterId, answers } = req.body;

    if (!testId || !studentName || !studentRegisterId || !answers) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    const correctRows = await sql`SELECT id, correct_answer FROM questions WHERE test_id = ${testId}`;

    let score = 0;
    const total = correctRows.length;

    for (const row of correctRows) {
      if (answers[row.id] !== undefined && Number(answers[row.id]) === row.correct_answer) {
        score++;
      }
    }

    const percentage = Math.round((score / total) * 100);
    const passed = percentage >= 40;

    await sql`INSERT INTO attempts (test_id, student_name, student_register_id, score, total, answers) VALUES (${testId}, ${studentName}, ${studentRegisterId}, ${score}, ${total}, ${JSON.stringify(answers)}::jsonb)`;

    const reviewRows = await sql`SELECT id, question_text, options, correct_answer FROM questions WHERE test_id = ${testId} ORDER BY id`;

    const review = reviewRows.map((row) => ({
      id: row.id,
      question: row.question_text,
      options: row.options,
      correctAnswer: row.correct_answer,
      selectedAnswer: answers[row.id] !== undefined ? Number(answers[row.id]) : null,
    }));

    return res.status(200).json({ score, total, percentage, passed, review });
  } catch (error) {
    console.error('Error submitting test:', error);
    return res.status(500).json({ error: 'Failed to submit test' });
  }
}
