import { neon } from '@neondatabase/serverless';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const sql = neon(process.env.DATABASE_URL);
    const { testId, paperId, studentName, studentRegisterId, answers } = req.body;

    if (!testId && !paperId) {
      return res.status(400).json({ error: 'Missing required fields' });
    }
    if (!studentName || !studentRegisterId || !answers) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    let score = 0;
    let total = 0;
    let review = [];
    let attemptTestId = testId || null;

    if (paperId) {
      const paperResult = await sql`SELECT id, test_code, questions, answer_key FROM question_papers WHERE id = ${Number(paperId)}`;

      if (paperResult.length === 0) {
        return res.status(404).json({ error: 'Paper not found' });
      }

      const paper = paperResult[0];
      const list = Array.isArray(paper.questions) ? paper.questions : [];
      const key = Array.isArray(paper.answer_key) ? paper.answer_key : [];
      total = list.length;

      list.forEach((q, i) => {
        if (answers[q.id] !== undefined && Number(answers[q.id]) === Number(key[i])) {
          score++;
        }
      });

      const testRows = await sql`SELECT id FROM tests WHERE test_code = ${paper.test_code}`;
      if (testRows.length > 0) {
        attemptTestId = testRows[0].id;
      }

      review = list.map((q, i) => ({
        id: q.id,
        question: q.question_text,
        options: q.options,
        correctAnswer: Number(key[i]),
        selectedAnswer: answers[q.id] !== undefined ? Number(answers[q.id]) : null,
      }));
    } else {
      const correctRows = await sql`SELECT id, correct_answer FROM questions WHERE test_id = ${testId}`;
      total = correctRows.length;

      for (const row of correctRows) {
        if (answers[row.id] !== undefined && Number(answers[row.id]) === row.correct_answer) {
          score++;
        }
      }

      const reviewRows = await sql`SELECT id, question_text, options, correct_answer FROM questions WHERE test_id = ${testId} ORDER BY id`;

      review = reviewRows.map((row) => ({
        id: row.id,
        question: row.question_text,
        options: row.options,
        correctAnswer: row.correct_answer,
        selectedAnswer: answers[row.id] !== undefined ? Number(answers[row.id]) : null,
      }));
    }

    const percentage = total > 0 ? Math.round((score / total) * 100) : 0;
    const passed = percentage >= 40;

    await sql`INSERT INTO attempts (test_id, student_name, student_register_id, score, total, answers) VALUES (${attemptTestId}, ${studentName}, ${studentRegisterId}, ${score}, ${total}, ${JSON.stringify(answers)}::jsonb)`;

    return res.status(200).json({ score, total, percentage, passed, review });
  } catch (error) {
    console.error('Error submitting test:', error);
    return res.status(500).json({ error: 'Failed to submit test' });
  }
}
