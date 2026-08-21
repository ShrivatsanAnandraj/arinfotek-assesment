import { useState, useEffect, useCallback } from 'react';

export default function TestRunner({ testData, studentInfo, onSubmit }) {
  const { test, questions } = testData;
  const total = questions.length;

  const [currentIndex, setCurrentIndex] = useState(0);
  const [answers, setAnswers] = useState({});
  const [secondsLeft, setSecondsLeft] = useState(test.duration_minutes * 60);
  const [showConfirm, setShowConfirm] = useState(false);
  const [shuffled, setShuffled] = useState([]);

  useEffect(() => {
    const indexed = questions.map((q, i) => ({ ...q, origIndex: i }));
    const optionShuffled = indexed.map((q) => {
      const opts = [...q.options];
      const indices = opts.map((_, i) => i);
      for (let j = indices.length - 1; j > 0; j--) {
        const k = Math.floor(Math.random() * (j + 1));
        [indices[j], indices[k]] = [indices[k], indices[j]];
      }
      return {
        ...q,
        shuffledOptions: indices.map((si) => ({ text: opts[si], originalIndex: si })),
        shuffleMap: indices,
      };
    });
    setShuffled(optionShuffled);
  }, [questions]);

  const submitTest = useCallback(() => {
    onSubmit({
      score: null,
      total,
      answers,
      testId: test.id,
      studentName: studentInfo.name,
      studentRegisterId: studentInfo.registerId,
      _raw: true,
    });
  }, [answers, total, test.id, studentInfo, onSubmit]);

  useEffect(() => {
    if (secondsLeft <= 0) {
      submitTest();
      return;
    }
    const timer = setInterval(() => setSecondsLeft((s) => s - 1), 1000);
    return () => clearInterval(timer);
  }, [secondsLeft, submitTest]);

  const selectAnswer = (questionId, originalOptionIndex) => {
    setAnswers((prev) => ({ ...prev, [questionId]: originalOptionIndex }));
  };

  const formatTime = (s) => {
    const m = Math.floor(s / 60);
    const sec = s % 60;
    return `${m.toString().padStart(2, '0')}:${sec.toString().padStart(2, '0')}`;
  };

  const answeredCount = Object.keys(answers).length;

  if (shuffled.length === 0) return null;

  const current = shuffled[currentIndex];
  const isFirst = currentIndex === 0;
  const isLast = currentIndex === total - 1;

  return (
    <div className="w-full max-w-4xl mx-auto">
      <div className="bg-white rounded-2xl shadow-xl border border-slate-100 overflow-hidden">
        <div className="bg-primary px-6 py-3 flex items-center justify-between text-white">
          <div className="font-bold text-sm">{test.title}</div>
          <div className="flex items-center gap-4">
            <span className="text-xs text-slate-200">
              {answeredCount}/{total} answered
            </span>
            <div
              className={`font-mono font-bold text-lg px-3 py-1 rounded-lg ${
                secondsLeft <= 60
                  ? 'bg-red-500 animate-pulse'
                  : secondsLeft <= 300
                  ? 'bg-yellow-500'
                  : 'bg-white/20'
              }`}
            >
              {formatTime(secondsLeft)}
            </div>
          </div>
        </div>

        <div className="p-6 md:p-8">
          <div className="w-full bg-slate-100 rounded-full h-2 mb-6">
            <div
              className="bg-gradient-to-r from-primary to-accent h-2 rounded-full transition-all"
              style={{ width: `${((currentIndex + 1) / total) * 100}%` }}
            />
          </div>

          <div className="mb-8">
            <div className="flex items-start gap-3 mb-6">
              <span className="bg-primary text-white text-sm font-bold rounded-lg px-3 py-1 shrink-0">
                Q{currentIndex + 1}
              </span>
              <h2 className="text-lg font-semibold text-slate-800">{current.question_text}</h2>
            </div>

            <div className="grid gap-3">
              {current.shuffledOptions.map((opt, i) => {
                const isSelected = answers[current.id] === opt.originalIndex;
                const labels = ['A', 'B', 'C', 'D'];
                return (
                  <button
                    key={i}
                    onClick={() => selectAnswer(current.id, opt.originalIndex)}
                    className={`flex items-center gap-3 px-5 py-3.5 rounded-xl border-2 text-left transition-all cursor-pointer ${
                      isSelected
                        ? 'border-primary bg-primary/5 shadow-sm'
                        : 'border-slate-100 hover:border-slate-300 hover:bg-slate-50'
                    }`}
                  >
                    <span
                      className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold shrink-0 ${
                        isSelected
                          ? 'bg-primary text-white'
                          : 'bg-slate-100 text-slate-500'
                      }`}
                    >
                      {labels[i]}
                    </span>
                    <span className="text-sm text-slate-700">{opt.text}</span>
                  </button>
                );
              })}
            </div>
          </div>

          <div className="flex items-center justify-between">
            <button
              onClick={() => setCurrentIndex((i) => i - 1)}
              disabled={isFirst}
              className="px-5 py-2.5 rounded-lg font-bold text-sm border-2 border-slate-200 text-slate-600 hover:bg-slate-50 disabled:opacity-30 disabled:cursor-not-allowed transition"
            >
              Previous
            </button>

            <div className="flex gap-2">
              {isLast ? (
                <button
                  onClick={() => setShowConfirm(true)}
                  className="px-6 py-2.5 rounded-lg font-bold text-sm bg-gradient-to-r from-accent to-orange-600 text-white shadow-md hover:shadow-orange-200 transition"
                >
                  Submit Test
                </button>
              ) : (
                <button
                  onClick={() => setCurrentIndex((i) => i + 1)}
                  className="px-6 py-2.5 rounded-lg font-bold text-sm bg-primary text-white hover:bg-primary-dark transition"
                >
                  Next
                </button>
              )}
            </div>
          </div>
        </div>

        <div className="border-t border-slate-100 px-6 py-4">
          <div className="text-xs font-bold text-slate-500 mb-2">Question Palette</div>
          <div className="flex flex-wrap gap-2">
            {shuffled.map((q, i) => (
              <button
                key={q.id}
                onClick={() => setCurrentIndex(i)}
                className={`w-9 h-9 rounded-lg text-xs font-bold transition ${
                  i === currentIndex
                    ? 'bg-primary text-white ring-2 ring-primary/30'
                    : answers[q.id] !== undefined
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

      {showConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm">
          <div className="bg-white rounded-2xl shadow-2xl p-8 max-w-sm w-full mx-4 text-center">
            <div className="w-14 h-14 bg-accent/10 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-7 h-7 text-accent" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z" />
              </svg>
            </div>
            <h3 className="text-lg font-black text-slate-800 mb-2">Are you sure you want to submit?</h3>
            <p className="text-sm text-slate-500 mb-1">
              You have answered <span className="font-bold text-primary">{answeredCount}</span> of <span className="font-bold">{total}</span> questions.
            </p>
            {answeredCount < total && (
              <p className="text-sm text-red-500 mb-4">
                {total - answeredCount} question(s) unanswered!
              </p>
            )}
            {answeredCount === total && <div className="mb-4" />}
            <div className="flex gap-3">
              <button
                onClick={() => setShowConfirm(false)}
                className="flex-1 py-2.5 rounded-lg font-bold text-sm border-2 border-slate-200 text-slate-600 hover:bg-slate-50 transition"
              >
                No
              </button>
              <button
                onClick={submitTest}
                className="flex-1 py-2.5 rounded-lg font-bold text-sm bg-gradient-to-r from-accent to-orange-600 text-white shadow-md transition"
              >
                Yes, Submit
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
