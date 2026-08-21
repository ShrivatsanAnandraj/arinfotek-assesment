import { useState } from 'react';

export default function AdminPanel() {
  const [testTitle, setTestTitle] = useState('');
  const [testSubject, setTestSubject] = useState('');
  const [testCode, setTestCode] = useState('');
  const [testDuration, setTestDuration] = useState(30);
  const [questions, setQuestions] = useState([
    { question_text: '', options: ['', '', '', ''], correct_answer: 0 },
  ]);
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);

  const addQuestion = () => {
    setQuestions([...questions, { question_text: '', options: ['', '', '', ''], correct_answer: 0 }]);
  };

  const removeQuestion = (index) => {
    if (questions.length === 1) return;
    setQuestions(questions.filter((_, i) => i !== index));
  };

  const updateQuestion = (index, field, value) => {
    const updated = [...questions];
    updated[index][field] = value;
    setQuestions(updated);
  };

  const updateOption = (qIndex, oIndex, value) => {
    const updated = [...questions];
    updated[qIndex].options[oIndex] = value;
    setQuestions(updated);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage('');

    if (!testTitle || !testCode) {
      setMessage('Error: Test title and code are required.');
      return;
    }

    for (let i = 0; i < questions.length; i++) {
      if (!questions[i].question_text) {
        setMessage(`Error: Question ${i + 1} text is empty.`);
        return;
      }
      for (let j = 0; j < 4; j++) {
        if (!questions[i].options[j]) {
          setMessage(`Error: Question ${i + 1}, Option ${String.fromCharCode(65 + j)} is empty.`);
          return;
        }
      }
    }

    setLoading(true);
    try {
      const res = await fetch('/api/admin', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: testTitle,
          subject: testSubject || 'General',
          test_code: testCode.toUpperCase(),
          duration_minutes: Number(testDuration),
          questions,
        }),
      });
      const data = await res.json();
      if (res.ok) {
        setMessage(`Success! Test "${testCode.toUpperCase()}" created with ${questions.length} questions.`);
        setTestTitle('');
        setTestSubject('');
        setTestCode('');
        setTestDuration(30);
        setQuestions([{ question_text: '', options: ['', '', '', ''], correct_answer: 0 }]);
      } else {
        setMessage('Error: ' + (data.error || 'Failed to create test'));
      }
    } catch {
      setMessage('Error: Failed to connect to server.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full max-w-3xl mx-auto py-10 px-4">
      <div className="bg-white rounded-2xl shadow-xl border border-slate-100 p-8">
        <div className="text-center mb-8">
          <h1 className="text-2xl font-black text-slate-800">Admin Panel</h1>
          <p className="text-sm text-slate-500 mt-1">Create tests and add questions</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Test details */}
          <div className="bg-slate-50 rounded-xl p-5 space-y-4">
            <h3 className="font-bold text-slate-700">Test Details</h3>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-600 mb-1">Test Code</label>
                <input
                  type="text"
                  value={testCode}
                  onChange={(e) => setTestCode(e.target.value)}
                  placeholder="e.g. APT01"
                  className="w-full px-4 py-2.5 rounded-lg border border-slate-200 text-sm font-mono uppercase focus:outline-none focus:ring-2 focus:ring-primary/30"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-600 mb-1">Duration (min)</label>
                <input
                  type="number"
                  value={testDuration}
                  onChange={(e) => setTestDuration(e.target.value)}
                  min="1"
                  className="w-full px-4 py-2.5 rounded-lg border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
                />
              </div>
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-600 mb-1">Test Title</label>
              <input
                type="text"
                value={testTitle}
                onChange={(e) => setTestTitle(e.target.value)}
                placeholder="e.g. Aptitude Test - Round 1"
                className="w-full px-4 py-2.5 rounded-lg border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-600 mb-1">Subject</label>
              <input
                type="text"
                value={testSubject}
                onChange={(e) => setTestSubject(e.target.value)}
                placeholder="e.g. General Aptitude"
                className="w-full px-4 py-2.5 rounded-lg border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
              />
            </div>
          </div>

          {/* Questions */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="font-bold text-slate-700">Questions ({questions.length})</h3>
              <button
                type="button"
                onClick={addQuestion}
                className="px-4 py-2 rounded-lg font-bold text-sm bg-primary text-white hover:bg-primary-dark transition"
              >
                + Add Question
              </button>
            </div>

            {questions.map((q, qi) => (
              <div key={qi} className="bg-slate-50 rounded-xl p-5 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-sm text-primary">Q{qi + 1}</span>
                  {questions.length > 1 && (
                    <button
                      type="button"
                      onClick={() => removeQuestion(qi)}
                      className="text-red-400 hover:text-red-600 text-sm font-bold"
                    >
                      Remove
                    </button>
                  )}
                </div>
                <input
                  type="text"
                  value={q.question_text}
                  onChange={(e) => updateQuestion(qi, 'question_text', e.target.value)}
                  placeholder="Enter question text"
                  className="w-full px-4 py-2.5 rounded-lg border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
                />
                <div className="grid grid-cols-2 gap-3">
                  {q.options.map((opt, oi) => (
                    <div key={oi} className="flex items-center gap-2">
                      <input
                        type="text"
                        value={opt}
                        onChange={(e) => updateOption(qi, oi, e.target.value)}
                        placeholder={`Option ${String.fromCharCode(65 + oi)}`}
                        className="flex-1 px-3 py-2 rounded-lg border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
                      />
                      <input
                        type="radio"
                        name={`correct-${qi}`}
                        checked={q.correct_answer === oi}
                        onChange={() => updateQuestion(qi, 'correct_answer', oi)}
                        className="w-4 h-4 accent-green-600"
                        title="Correct answer"
                      />
                    </div>
                  ))}
                </div>
                <p className="text-xs text-slate-400">Select the correct answer with the radio button</p>
              </div>
            ))}
          </div>

          {message && (
            <div className={`text-sm px-4 py-3 rounded-lg border ${message.startsWith('Success') ? 'bg-green-50 text-green-700 border-green-200' : 'bg-red-50 text-red-600 border-red-100'}`}>
              {message}
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3.5 rounded-xl font-bold text-lg bg-gradient-to-r from-accent to-orange-600 text-white shadow-lg hover:shadow-orange-200 transition disabled:opacity-50"
          >
            {loading ? 'Creating...' : 'Create Test'}
          </button>
        </form>
      </div>
    </div>
  );
}
