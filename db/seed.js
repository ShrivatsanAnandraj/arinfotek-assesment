import { neon } from '@neondatabase/serverless';

const sql = neon(process.env.DATABASE_URL);

async function seed() {
  await sql(`
    CREATE TABLE IF NOT EXISTS tests (
      id SERIAL PRIMARY KEY,
      title TEXT NOT NULL,
      subject TEXT NOT NULL DEFAULT 'General',
      course TEXT NOT NULL DEFAULT '',
      level TEXT NOT NULL DEFAULT '',
      topics JSONB NOT NULL DEFAULT '[]'::jsonb,
      test_code TEXT UNIQUE NOT NULL,
      duration_minutes INT NOT NULL DEFAULT 30
    )
  `);

  await sql(`
    CREATE TABLE IF NOT EXISTS questions (
      id SERIAL PRIMARY KEY,
      test_id INT REFERENCES tests(id) ON DELETE CASCADE,
      question_text TEXT NOT NULL,
      options JSONB NOT NULL,
      correct_answer INT NOT NULL
    )
  `);

  await sql(`
    CREATE TABLE IF NOT EXISTS attempts (
      id SERIAL PRIMARY KEY,
      test_id INT REFERENCES tests(id),
      student_name TEXT NOT NULL,
      student_email TEXT NOT NULL,
      score INT NOT NULL,
      total INT NOT NULL,
      answers JSONB NOT NULL,
      submitted_at TIMESTAMPTZ DEFAULT NOW()
    )
  `);

  await sql(`
    CREATE TABLE IF NOT EXISTS tab_flags (
      id SERIAL PRIMARY KEY,
      test_code TEXT NOT NULL,
      student_register_id TEXT NOT NULL,
      student_name TEXT NOT NULL,
      reason TEXT NOT NULL DEFAULT 'Tabs changing found',
      status TEXT NOT NULL DEFAULT 'flagged',
      created_at TIMESTAMPTZ DEFAULT NOW(),
      resolved_at TIMESTAMPTZ
    )
  `);

  await sql('DELETE FROM questions');
  await sql('DELETE FROM attempts');
  await sql('DELETE FROM tests');

  const testResult = await sql(
    `INSERT INTO tests (title, subject, course, level, topics, test_code, duration_minutes)
     VALUES ('Aptitude Test - Round 1', 'General Aptitude', 'General', 'Beginner', '[]'::jsonb, 'APT01', 30)
     RETURNING id`
  );
  const testId = testResult[0].id;

  const questions = [
    { q: 'What is 15% of 200?', opts: ['25', '30', '35', '40'], ans: 1 },
    { q: 'If a train travels 360 km in 4 hours, what is its speed?', opts: ['80 km/h', '90 km/h', '100 km/h', '75 km/h'], ans: 1 },
    { q: 'Which number is prime?', opts: ['21', '29', '33', '39'], ans: 1 },
    { q: 'Find the next term: 2, 6, 12, 20, ?', opts: ['28', '30', '32', '26'], ans: 1 },
    { q: 'A is twice as old as B. If A is 40, how old is B?', opts: ['15', '20', '25', '30'], ans: 1 },
    { q: 'What is the area of a rectangle with length 12 and width 5?', opts: ['50', '55', '60', '70'], ans: 2 },
    { q: 'Simplify: 3/4 + 2/3', opts: ['17/12', '5/7', '1', '13/12'], ans: 0 },
    { q: 'If 3x + 7 = 22, what is x?', opts: ['3', '4', '5', '6'], ans: 2 },
    { q: 'What is the square root of 144?', opts: ['11', '12', '13', '14'], ans: 1 },
    { q: 'A boat goes 30 km upstream in 5 hours. What is the speed?', opts: ['4 km/h', '6 km/h', '8 km/h', '5 km/h'], ans: 1 },
    { q: 'Which fraction is largest: 1/2, 2/5, 3/8, 1/3?', opts: ['1/2', '2/5', '3/8', '1/3'], ans: 0 },
    { q: 'A clock shows 3:15. What is the angle between hour and minute hands?', opts: ['0 degrees', '7.5 degrees', '15 degrees', '22.5 degrees'], ans: 1 },
    { q: 'If the ratio of A:B is 3:5 and B:C is 2:3, what is A:B:C?', opts: ['6:10:15', '3:5:8', '6:10:12', '9:15:10'], ans: 0 },
    { q: 'What is 2 raised to the power 8?', opts: ['128', '256', '512', '64'], ans: 1 },
    { q: 'The average of 5, 10, 15, 20, 25 is:', opts: ['12', '15', '18', '20'], ans: 1 },
  ];

  for (const item of questions) {
    await sql(
      `INSERT INTO questions (test_id, question_text, options, correct_answer)
       VALUES ($1, $2, $3, $4)`,
      [testId, item.q, JSON.stringify(item.opts), item.ans]
    );
  }

  console.log(`Seeded test "APT01" with ${questions.length} questions.`);
  process.exit(0);
}

seed().catch((e) => {
  console.error(e);
  process.exit(1);
});
