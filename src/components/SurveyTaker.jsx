import { useState } from 'react';

export default function SurveyTaker({ survey, studentInfo, testCode, onComplete }) {
  const [answers, setAnswers] = useState({});
  const [currentIndex, setCurrentIndex] = useState(0);
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const questions = survey.questions || [];
  const total = questions.length;

  const handleAnswer = (questionIndex, value) => {
    setAnswers(prev => ({ ...prev, [questionIndex]: value }));
  };

  const handleSubmit = async () => {
    setSubmitting(true);
    try {
      const res = await fetch('/api/surveys', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'submit',
          survey_id: survey.id,
          student_name: studentInfo.name,
          student_register_id: studentInfo.registerId,
          test_code: testCode,
          answers
        })
      });

      if (res.ok) {
        setSubmitted(true);
      } else {
        alert('Failed to submit survey. Please try again.');
      }
    } catch {
      alert('Failed to submit survey. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  const answeredCount = Object.keys(answers).length;
  const current = questions[currentIndex];

  if (submitted) {
    return (
      <div className="w-full max-w-2xl mx-auto">
        <div className="bg-white rounded-2xl shadow-xl border border-slate-100 p-6 sm:p-8 text-center">
          <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <h2 className="text-xl font-black text-slate-800 mb-2">Thank You!</h2>
          <p className="text-sm text-slate-500 mb-6">Your feedback has been submitted successfully.</p>
          <button
            onClick={onComplete}
            className="px-6 py-2.5 rounded-lg font-bold text-sm bg-gradient-to-r from-accent to-orange-600 text-white shadow-md hover:shadow-orange-200 transition"
          >
            Back to Home
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full max-w-3xl mx-auto">
      <div className="bg-white rounded-2xl shadow-xl border border-slate-100 overflow-hidden">
        <div className="bg-primary px-4 py-3 flex items-center justify-between text-white">
          <div>
            <div className="font-bold text-sm">{survey.template_name || 'Feedback Survey'}</div>
            <div className="text-xs text-slate-200">{survey.course}</div>
          </div>
          <div className="text-xs text-slate-200">
            {answeredCount}/{total} answered
          </div>
        </div>

        <div className="p-4 sm:p-6">
          <div className="w-full bg-slate-100 rounded-full h-2 mb-4">
            <div
              className="bg-gradient-to-r from-primary to-accent h-2 rounded-full transition-all"
              style={{ width: `${((currentIndex + 1) / total) * 100}%` }}
            />
          </div>

          <div className="mb-6">
            <div className="flex items-start gap-3 mb-4">
              <span className="bg-primary text-white text-xs font-bold rounded-lg px-2.5 py-1 shrink-0">
                Q{currentIndex + 1}
              </span>
              <h2 className="text-base font-semibold text-slate-800 leading-snug">{current}</h2>
            </div>

            <div className="grid gap-2 sm:gap-3">
              {['Very Poor', 'Poor', 'Average', 'Good', 'Excellent'].map((option) => (
                <button
                  key={option}
                  onClick={() => handleAnswer(currentIndex, option)}
                  className={`flex items-center gap-3 px-4 py-3 rounded-xl border-2 text-left transition-all cursor-pointer ${
                    answers[currentIndex] === option
                      ? 'border-primary bg-primary/5 shadow-sm'
                      : 'border-slate-100 hover:border-slate-300 hover:bg-slate-50'
                  }`}
                >
                  <span className={`w-5 h-5 rounded-full border-2 flex items-center justify-center shrink-0 ${
                    answers[currentIndex] === option
                      ? 'border-primary bg-primary'
                      : 'border-slate-300'
                  }`}>
                    {answers[currentIndex] === option && (
                      <span className="w-2 h-2 bg-white rounded-full" />
                    )}
                  </span>
                  <span className="text-sm text-slate-700">{option}</span>
                </button>
              ))}
            </div>
          </div>

          <div className="flex items-center justify-between gap-3">
            <button
              onClick={() => setCurrentIndex(i => i - 1)}
              disabled={currentIndex === 0}
              className="px-4 py-2.5 rounded-lg font-bold text-sm border-2 border-slate-200 text-slate-600 hover:bg-slate-50 disabled:opacity-30 disabled:cursor-not-allowed transition"
            >
              Previous
            </button>

            <div className="flex gap-2">
              {currentIndex === total - 1 ? (
                <button
                  onClick={handleSubmit}
                  disabled={submitting}
                  className="px-5 py-2.5 rounded-lg font-bold text-sm bg-gradient-to-r from-accent to-orange-600 text-white shadow-md hover:shadow-orange-200 transition disabled:opacity-50"
                >
                  {submitting ? 'Submitting...' : 'Submit Survey'}
                </button>
              ) : (
                <button
                  onClick={() => setCurrentIndex(i => i + 1)}
                  className="px-5 py-2.5 rounded-lg font-bold text-sm bg-primary text-white hover:bg-primary-dark transition"
                >
                  Next
                </button>
              )}
            </div>
          </div>
        </div>

        <div className="border-t border-slate-100 px-4 py-3">
          <div className="text-xs font-bold text-slate-500 mb-2">Question Palette</div>
          <div className="flex flex-wrap gap-2">
            {questions.map((_, i) => (
              <button
                key={i}
                onClick={() => setCurrentIndex(i)}
                className={`w-8 h-8 rounded-lg text-xs font-bold transition ${
                  i === currentIndex
                    ? 'bg-primary text-white ring-2 ring-primary/30'
                    : answers[i] !== undefined
                    ? 'bg-green-100 text-green-700 border border-green-200'
                    : 'bg-slate-100 text-slate-500 hover:bg-slate-200'
                }`}
              >
                {i + 1}
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
