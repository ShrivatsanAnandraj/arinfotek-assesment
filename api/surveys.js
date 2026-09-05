import { neon } from '@neondatabase/serverless';

const TEMPLATES = {
  'Template 1': {
    name: 'IT Training Feedback Survey - Set 1',
    questions: [
      { text: 'How would you rate your overall experience with the Power BI course?', options: ['Poor', 'Fair', 'Good', 'Very Good', 'Excellent'] },
      { text: 'How would you rate the quality, relevance, and usefulness of the topics covered in the course?', options: ['Poor', 'Fair', 'Good', 'Very Good', 'Excellent'] },
      { text: 'How much has your knowledge of Power BI improved after completing the course?', options: ['Very little', 'A little', 'Moderate', 'A lot', 'Very significantly'] },
      { text: 'How useful were the hands-on exercises and practical activities for understanding Power BI?', options: ['Not useful', 'Slightly useful', 'Moderately useful', 'Useful', 'Very useful'] },
      { text: "How would you rate the trainer's subject knowledge and expertise?", options: ['Poor', 'Fair', 'Good', 'Very Good', 'Excellent'] },
      { text: 'How clearly did the trainer explain the concepts and demonstrate the practical steps?', options: ['Not clear', 'Slightly clear', 'Moderately clear', 'Clear', 'Very clear'] },
      { text: 'How effectively did the trainer address questions, doubts, and difficulties during the sessions?', options: ['Not effective', 'Slightly effective', 'Moderately effective', 'Effective', 'Very effective'] },
      { text: 'How confident are you now in using Power BI for real-world data analysis and dashboard development?', options: ['Not confident', 'Slightly confident', 'Moderately confident', 'Confident', 'Very confident'] },
      { text: 'How likely are you to recommend this Power BI course to your friends, colleagues, or classmates?', options: ['0','1','2','3','4','5','6','7','8','9','10'], nps: true },
      { text: 'How satisfied are you with the overall course, trainer, learning experience, and practical exposure?', options: ['Very dissatisfied', 'Dissatisfied', 'Neutral', 'Satisfied', 'Very satisfied'] }
    ]
  },
  'Template 2': {
    name: 'IT Training Feedback Survey - Set 2',
    questions: [
      { text: 'Quality of Practice Exercises. Rate the quality and real-life usefulness of the hands-on lab exercises.' },
      { text: 'Were You Ready for This Course. I had enough background knowledge before starting this course.' },
      { text: 'Difficulty of the Labs. How would you describe the difficulty level of the practice labs?' },
      { text: 'Help With Problems. Rate how helpful the trainer was when you faced problems or errors during the labs.' },
      { text: 'Balance of Theory and Practice. The balance between lectures and hands-on practice was good.' },
      { text: 'Confidence After Training. How confident do you feel solving problems on your own after this training?' },
      { text: 'Usefulness of Sample Code. Rate how useful the sample code, scripts, or files given to you were.' },
      { text: 'Did the Course Meet Its Goals. This training covered everything it promised to teach.' },
      { text: 'Hardest Lab or Exercise. Which lab or exercise was the hardest for you to complete, and why?' },
      { text: 'More Practice Tools Needed. What other practice tools or lab setups would help you learn better?' }
    ]
  },
  'Template 3': {
    name: 'IT Training Feedback Survey - Set 3',
    questions: [
      { text: "Trainer's Communication. Rate how clearly the trainer spoke and how well they kept the class interested." },
      { text: 'Time Given for Exercises. Was there enough time to comfortably finish each hands-on activity?' },
      { text: 'Up-to-date Technology. The tools and technical ideas taught match what is used in the industry today.' },
      { text: 'Group Work & Discussions. Rate how useful the Q&A sessions, group discussions, and interaction with classmates were.' },
      { text: 'Would You Recommend This Course. How likely are you to recommend this training to a friend or classmate?' },
      { text: 'Quality of Notes & Guides. The notes and reference guides given will be useful to you later on.' },
      { text: 'Overall Learning Experience. Rate your overall experience with the course structure, content, and teaching.' },
      { text: 'Support After the Course. What kind of extra help or follow-up support would help you continue learning?' },
      { text: 'Most Important Thing You Learned. What is the one most important skill or idea you learned from this course?' },
      { text: 'Topics You Want Next. What other IT, Cloud, DevOps, or Software topics would you like to learn next?' }
    ]
  }
};

export default async function handler(req, res) {
  const sql = neon(process.env.DATABASE_URL);

  if (req.method === 'GET') {
    try {
      const { test_code, action } = req.query;
      
      if (action === 'responses') {
        const responses = await sql`
          SELECT sr.*, s.course, s.trainee, s.template_name, s.questions
          FROM survey_responses sr
          JOIN surveys s ON sr.survey_id = s.id
          ORDER BY sr.submitted_at DESC
        `;
        const parsed = responses.map(r => ({
          ...r,
          answers: typeof r.answers === 'string' ? JSON.parse(r.answers) : r.answers,
          questions: typeof r.questions === 'string' ? JSON.parse(r.questions) : r.questions
        }));
        return res.status(200).json({ responses: parsed });
      }
      
      if (test_code) {
        const surveys = await sql`SELECT * FROM surveys WHERE test_code = ${test_code.toUpperCase()} ORDER BY created_at DESC`;
        const parsed = surveys.map(s => ({
          ...s,
          questions: typeof s.questions === 'string' ? JSON.parse(s.questions) : s.questions
        }));
        return res.status(200).json({ surveys: parsed });
      }

      if (action === 'template_details') {
        const details = {};
        for (const [key, val] of Object.entries(TEMPLATES)) {
          details[key] = { name: val.name, questions: val.questions };
        }
        return res.status(200).json({ templates: details });
      }

      const surveys = await sql`SELECT * FROM surveys ORDER BY created_at DESC`;
      const parsedAll = surveys.map(s => ({
        ...s,
        questions: typeof s.questions === 'string' ? JSON.parse(s.questions) : s.questions
      }));
      return res.status(200).json({ surveys: parsedAll, templates: Object.keys(TEMPLATES) });
    } catch (error) {
      console.error('Error fetching surveys:', error);
      return res.status(500).json({ error: 'Failed to fetch surveys' });
    }
  }

  if (req.method === 'POST') {
    try {
      const { action } = req.body;

      if (action === 'create') {
        const { test_code, course, trainee, no_of_days, template_name, questions } = req.body;
        
        if (!test_code || !course || !trainee || !no_of_days) {
          return res.status(400).json({ error: 'Missing required fields' });
        }

        let surveyQuestions = questions;
        
        if (template_name && TEMPLATES[template_name]) {
          surveyQuestions = TEMPLATES[template_name].questions;
        }

        if (!surveyQuestions || surveyQuestions.length === 0) {
          return res.status(400).json({ error: 'Questions are required' });
        }

        const result = await sql`INSERT INTO surveys (test_code, course, trainee, no_of_days, template_name, questions) VALUES (${test_code.toUpperCase()}, ${course}, ${trainee}, ${no_of_days}, ${template_name || 'Custom'}, ${JSON.stringify(surveyQuestions)}::jsonb) RETURNING *`;

        return res.status(201).json({ survey: result[0] });
      }

      if (action === 'submit') {
        const { survey_id, student_name, student_register_id, test_code, answers } = req.body;
        
        if (!survey_id || !student_name || !student_register_id || !test_code || !answers) {
          return res.status(400).json({ error: 'Missing required fields' });
        }

        const result = await sql`INSERT INTO survey_responses (survey_id, student_name, student_register_id, test_code, answers) VALUES (${survey_id}, ${student_name}, ${student_register_id}, ${test_code.toUpperCase()}, ${JSON.stringify(answers)}::jsonb) RETURNING *`;

        return res.status(201).json({ response: result[0] });
      }

      if (action === 'save_template') {
        const { template_name, questions } = req.body;
        if (!template_name || !questions || !Array.isArray(questions)) {
          return res.status(400).json({ error: 'Missing template_name or questions' });
        }
        if (TEMPLATES[template_name]) {
          TEMPLATES[template_name].questions = questions;
        }
        return res.status(200).json({ success: true, templates: Object.keys(TEMPLATES) });
      }

      return res.status(400).json({ error: 'Invalid action' });
    } catch (error) {
      console.error('Error:', error);
      return res.status(500).json({ error: 'Failed to process request' });
    }
  }

  if (req.method === 'DELETE') {
    try {
      const { action, id, test_code } = req.body;

      if (action === 'single' && id) {
        await sql`DELETE FROM survey_responses WHERE id = ${id}`;
        return res.status(200).json({ success: true });
      }

      if (action === 'by_test' && test_code) {
        await sql`DELETE FROM survey_responses WHERE test_code = ${test_code.toUpperCase()}`;
        return res.status(200).json({ success: true });
      }

      if (action === 'all') {
        await sql`DELETE FROM survey_responses`;
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
