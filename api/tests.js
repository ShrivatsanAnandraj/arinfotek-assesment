import { neon } from '@neondatabase/serverless';

const LEVEL_TOPICS = {
  basic: [
    'variables and constants',
    'data types and type conversion',
    'operators and expressions',
    'conditional statements (if / elif / else)',
    'loops (for and while)',
    'functions (definition, parameters, return)',
    'string, list and dictionary basics',
  ],
  intermediate: [
    'lists, tuples, sets and dictionaries',
    'list methods and slicing',
    'object-oriented programming (classes, objects, inheritance)',
    'exception handling (try / except)',
    'file handling (read / write)',
    'lambda and map / filter',
    'modules and import',
    'decorators',
  ],
  advanced: [
    'generators and yield',
    'list, dict and set comprehensions',
    'modules, packages and __name__',
    'context managers (with statement)',
    'async / await and asyncio',
    'functools and itertools',
  ],
};

const ALL_TOPICS = [
  ...new Set([
    ...LEVEL_TOPICS.basic,
    ...LEVEL_TOPICS.intermediate,
    ...LEVEL_TOPICS.advanced,
  ]),
];

const DEPTH_RULES = {
  basic: 'Question depth: NOT too deep - every question must be simple, direct and introductory, testing only basic understanding of each topic.',
  intermediate:
    'Question depth: a little depth - questions should be moderately challenging, combining only 2 related concepts with short code traces, and must NOT use advanced Python topics such as decorators, generators, async/await, comprehensions, or modules/packages.',
  advanced:
    'Question depth: FULL depth - questions must be advanced, covering multi-step code execution, output tracing, edge cases and reasoning.',
};

const GEMINI_MODEL = process.env.GEMINI_MODEL || 'gemini-3.5-flash';
const GEMINI_FALLBACK_MODEL = 'gemini-3.1-flash-lite-preview';

function shuffle(options) {
  const arr = [...options];
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

function resolveLevelKey(level) {
  if (!level) return 'basic';
  const l = level.toLowerCase();
  if (l.includes('interm')) return 'intermediate';
  if (l.includes('adv')) return 'advanced';
  return 'basic';
}

function buildPrompt(levelKey, topics, count) {
  const topicList =
    topics.filter((t) => typeof t === 'string' && t.trim()).join(', ') || ALL_TOPICS.join(', ');
  return `Generate a ${count} mark MCQ test paper for Python ${levelKey} level. Include all these topics: ${topicList}.

${DEPTH_RULES[levelKey] || DEPTH_RULES.basic}

Each question must:
- Be clear, specific and self-contained (no external code files).
- Where useful, include a short 1-3 line code snippet inside the question text.
- Have exactly 4 answer options (A-D). Only one must be correct.
- Vary the position of the correct answer across questions.
- Not repeat the same concept twice.

Return ONLY a JSON object (no markdown, no code fences) in this exact shape:
{"questions":[{"question":"...","options":["opt1","opt2","opt3","opt4"],"answer":0}]}
where "answer" is the 0-based index of the correct option.`;
}

async function generatePaperQuestions(apiKey, levelKey, topics, count) {
  const models = [GEMINI_MODEL, GEMINI_FALLBACK_MODEL];
  let lastErr;
  for (const model of models) {
    try {
      const res = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            contents: [{ role: 'user', parts: [{ text: buildPrompt(levelKey, topics, count) }] }],
            generationConfig: { responseMimeType: 'application/json', temperature: 0.9 },
          }),
        }
      );
      if (!res.ok) {
        const err = new Error(`Gemini ${model} failed with ${res.status}`);
        err.status = res.status;
        throw err;
      }
      const data = await res.json();
      const raw = data?.candidates?.[0]?.content?.parts?.[0]?.text;
      if (!raw) throw new Error(`Gemini ${model} returned an empty response`);
      const parsed = JSON.parse(raw);
      const list = Array.isArray(parsed?.questions) ? parsed.questions : null;
      if (!list) throw new Error('Gemini response missing "questions" array');
      return list;
    } catch (e) {
      lastErr = e;
      if (e.status && e.status !== 404 && e.status !== 429) break;
    }
  }
  throw lastErr || new Error('Failed to generate questions');
}

function normalizeQuestions(list) {
  return list
    .filter((q) => q && typeof q.question === 'string' && Array.isArray(q.options) && q.options.length >= 2)
    .slice(0, 25)
    .map((q, i) => {
      const options = q.options.slice(0, 4);
      while (options.length < 4) options.push(`Option ${options.length + 1}`);
      let answer;
      if (typeof q.answer === 'string') {
        const letter = q.answer.trim().toUpperCase().charCodeAt(0) - 65;
        answer = letter >= 0 && letter < options.length ? letter : 0;
      } else {
        answer = Number.isInteger(q.answer) && q.answer >= 0 && q.answer < options.length ? q.answer : 0;
      }
      const order = shuffle(options.map((_, idx) => idx));
      return {
        id: i,
        question_text: q.question.trim(),
        options: order.map((idx) => options[idx]),
        answer_index: order.indexOf(answer),
      };
    });
}

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { code, action, courses } = req.query;

  try {
    const sql = neon(process.env.DATABASE_URL);

    if (action === 'list') {
      if (!courses) {
        return res.status(400).json({ error: 'Courses are required' });
      }
      const list = courses.split(',').map((c) => c.trim()).filter(Boolean);
      if (list.length === 0) {
        return res.status(400).json({ error: 'Courses are required' });
      }
      const patterns = list.map((c) => `%${c}%`);
      const tests = await sql`SELECT id, title, subject, course, level, topics, test_code, duration_minutes FROM tests WHERE (course = ANY(${list}::text[]) OR title ILIKE ANY(${patterns}::text[])) ORDER BY id`;
      return res.status(200).json({ tests });
    }

    if (!code) {
      return res.status(400).json({ error: 'Test code is required' });
    }

    const upperCode = code.toUpperCase();

    const testResult = await sql`SELECT id, title, subject, course, level, topics, test_code, duration_minutes FROM tests WHERE test_code = ${upperCode}`;

    if (testResult.length === 0) {
      return res.status(404).json({ error: 'Invalid test code' });
    }

    const test = testResult[0];

    if (action === 'paper') {
      const { name, reg } = req.query;
      if (!name || !reg) {
        return res.status(400).json({ error: 'name and reg are required' });
      }

      const apiKey = process.env.GEMINI_API_KEY;
      if (!apiKey) {
        return res.status(500).json({ error: 'Gemini API key is not configured on the server' });
      }

      const count = Math.min(Math.max(Number(req.query.q) || 25, 5), 25);
      const levelKey = resolveLevelKey(test.level);
      const topics = Array.isArray(test.topics) ? test.topics : [];

      const rawQuestions = await generatePaperQuestions(apiKey, levelKey, topics, count);
      const questions = normalizeQuestions(rawQuestions);

      if (questions.length === 0) {
        return res.status(500).json({ error: 'Failed to generate valid questions' });
      }

      await sql(`
        CREATE TABLE IF NOT EXISTS question_papers (
          id SERIAL PRIMARY KEY,
          test_code TEXT NOT NULL REFERENCES tests(test_code) ON DELETE CASCADE,
          student_name TEXT NOT NULL,
          student_register_id TEXT NOT NULL,
          level TEXT NOT NULL DEFAULT '',
          question_count INT NOT NULL DEFAULT 10,
          questions JSONB NOT NULL,
          answer_key JSONB NOT NULL,
          created_at TIMESTAMPTZ DEFAULT NOW()
        )
      `);

      const safe = questions.map(({ id, question_text, options }) => ({ id, question_text, options }));
      const key = questions.map((q) => q.answer_index);

      const created = await sql`INSERT INTO question_papers (test_code, student_name, student_register_id, level, question_count, questions, answer_key) VALUES (${upperCode}, ${name}, ${reg}, ${levelKey}, ${questions.length}, ${JSON.stringify(safe)}::jsonb, ${JSON.stringify(key)}::jsonb) RETURNING id`;

      return res.status(200).json({ test, questions: safe, paperId: created[0].id, generated: true });
    }

    const questions = await sql`SELECT id, question_text, options FROM questions WHERE test_id = ${test.id} ORDER BY id`;

    return res.status(200).json({ test, questions });
  } catch (error) {
    console.error('Error fetching test:', error);
    return res.status(500).json({ error: 'Failed to fetch test' });
  }
}

export const config = {
  api: {
    bodyParser: false,
  },
  maxDuration: 120,
};