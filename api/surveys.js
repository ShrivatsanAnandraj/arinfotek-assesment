import { neon } from '@neondatabase/serverless';

const TEMPLATES = {
  'Template 1': {
    name: 'IT Training Evaluation Survey',
    questions: [
      'Overall Course Satisfaction. How would you rate the overall quality and delivery of this training?',
      'Content Relevance to Job Role. The course topics and skills taught are directly applicable to my daily work responsibilities.',
      'Training Pacing. How did you find the speed and delivery rate of the instruction?',
      'Instructor Knowledge & Pedagogy. Rate the instructor\'s mastery of the subject matter and ability to explain complex concepts.',
      'Lab & Technical Environment Stability. The virtual environments, servers, and software tools functioned smoothly without issues.',
      'Self-Assessed Skill Increase. How would you rate your skill progression from before the course to now?',
      'Workplace Application Timeline. When do you anticipate applying these new IT skills in your active projects?',
      'Course Materials & Slide Utility. The reference guides, code repositories, and slide decks provided clear value.',
      'Most Valuable Section. Which specific technical module or exercise yielded the greatest benefit for you?',
      'Suggestions for Course Enhancement. What additional topics, tools, or changes would improve this training for future cohorts?'
    ]
  },
  'Template 2': {
    name: 'Technical & Practical Lab Survey',
    questions: [
      'Hands-on Exercise Quality. Rate the quality and real-world relevance of the practical lab assignments.',
      'Prerequisite Readiness. I possessed adequate technical background knowledge prior to joining this session.',
      'Lab Difficulty Level. How would you categorize the complexity of the practical labs?',
      'Troubleshooting & Instructor Support. Rate the quality of assistance provided during technical debugging and lab execution.',
      'Theory vs. Practical Balance. The ratio between lecture presentation and practical hands-on exercises was balanced effectively.',
      'Post-Training Confidence. How confident do you feel troubleshooting issues related to this technology independently?',
      'Sample Code & Repo Reusability. Rate the usefulness of the provided code samples, scripts, or configuration files.',
      'Learning Objective Achievement. The training successfully fulfilled all stated course objectives and learning outcomes.',
      'Challenging Lab Scenarios. Which specific lab or exercise was the most difficult to complete, and why?',
      'Additional Lab Environment Needs. What additional sandbox tools or lab environments would support your ongoing practice?'
    ]
  },
  'Template 3': {
    name: 'Trainee Skill Impact Survey',
    questions: [
      'Instructor Engagement & Clarity. Rate the instructor\'s communication skills and ability to keep the audience engaged.',
      'Time Allocated for Exercises. Was adequate time provided to comfortably finish each hands-on lab?',
      'Modernity of Technology Stack. The frameworks, tools, and technical concepts taught align with current industry standards.',
      'Peer Collaboration & Discussion. Rate the value of interactive Q&A sessions, group discussions, and peer interaction.',
      'Net Promoter Score (Recommendation). How likely are you to recommend this training session to a fellow engineer or team member?',
      'Quality of Documentation & Cheat Sheets. The technical documentation provided will serve as a valuable ongoing reference guide.',
      'Overall Learning Experience. Rate your complete experience across course structure, content, and execution.',
      'Follow-Up Training Requirements. What format of follow-up support would best assist your continued learning?',
      'Key Skill Takeaway. What primary skill or framework was your single most important takeaway from this course?',
      'Future Topic Requests. What other IT, Cloud, DevOps, or Software Engineering topics should be offered next?'
    ]
  }
};

export default async function handler(req, res) {
  const sql = neon(process.env.DATABASE_URL);

  if (req.method === 'GET') {
    try {
      const { test_code, action } = req.query;
      
      if (action === 'responses') {
        const responses = await sql(`
          SELECT sr.*, s.course, s.trainee, s.template_name, s.questions
          FROM survey_responses sr
          JOIN surveys s ON sr.survey_id = s.id
          ORDER BY sr.submitted_at DESC
        `);
        const parsed = responses.map(r => ({
          ...r,
          answers: typeof r.answers === 'string' ? JSON.parse(r.answers) : r.answers,
          questions: typeof r.questions === 'string' ? JSON.parse(r.questions) : r.questions
        }));
        return res.status(200).json({ responses: parsed });
      }
      
      if (test_code) {
        const surveys = await sql(
          'SELECT * FROM surveys WHERE test_code = $1 ORDER BY created_at DESC',
          [test_code.toUpperCase()]
        );
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

      const surveys = await sql('SELECT * FROM surveys ORDER BY created_at DESC');
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

        const result = await sql(
          'INSERT INTO surveys (test_code, course, trainee, no_of_days, template_name, questions) VALUES ($1, $2, $3, $4, $5, $6) RETURNING *',
          [test_code.toUpperCase(), course, trainee, no_of_days, template_name || 'Custom', JSON.stringify(surveyQuestions)]
        );

        return res.status(201).json({ survey: result[0] });
      }

      if (action === 'submit') {
        const { survey_id, student_name, student_register_id, test_code, answers } = req.body;
        
        if (!survey_id || !student_name || !student_register_id || !test_code || !answers) {
          return res.status(400).json({ error: 'Missing required fields' });
        }

        const result = await sql(
          'INSERT INTO survey_responses (survey_id, student_name, student_register_id, test_code, answers) VALUES ($1, $2, $3, $4, $5) RETURNING *',
          [survey_id, student_name, student_register_id, test_code.toUpperCase(), JSON.stringify(answers)]
        );

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
        await sql('DELETE FROM survey_responses WHERE id = $1', [id]);
        return res.status(200).json({ success: true });
      }

      if (action === 'by_test' && test_code) {
        await sql('DELETE FROM survey_responses WHERE test_code = $1', [test_code.toUpperCase()]);
        return res.status(200).json({ success: true });
      }

      if (action === 'all') {
        await sql('DELETE FROM survey_responses');
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
