import { useState, useEffect, useCallback, useRef } from 'react';

export default function TestRunner({ testData, studentInfo, onSubmit }) {
  const { test, questions } = testData;
  const total = questions.length;

  const [currentIndex, setCurrentIndex] = useState(0);
  const [answers, setAnswers] = useState({});
  const [secondsLeft, setSecondsLeft] = useState(test.duration_minutes * 60);
  const [showConfirm, setShowConfirm] = useState(false);
  const [frozen, setFrozen] = useState(false);
  const frozenRef = useRef(false);

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
    if (frozen) return;
    if (secondsLeft <= 0) {
      submitTest();
      return;
    }
    const timer = setInterval(() => setSecondsLeft((s) => s - 1), 1000);
    return () => clearInterval(timer);
  }, [secondsLeft, submitTest, frozen]);

  const flagViolation = useCallback(() => {
    if (frozenRef.current) return;
    fetch('/api/tabflags', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        test_code: test.test_code,
        student_register_id: studentInfo.registerId,
        student_name: studentInfo.name,
        reason: 'Tabs changing found',
      }),
    })
      .then((r) => r.json())
      .then((data) => {
        if (data.flag) {
          frozenRef.current = true;
          setFrozen(true);
        }
      })
      .catch(() => {});
  }, [test.test_code, studentInfo.registerId, studentInfo.name]);

  useEffect(() => {
    const handleVisibility = () => {
      if (document.hidden) flagViolation();
    };
    const handleBlur = () => flagViolation();

    document.addEventListener('visibilitychange', handleVisibility);
    window.addEventListener('blur', handleBlur);
    return () => {
      document.removeEventListener('visibilitychange', handleVisibility);
      window.removeEventListener('blur', handleBlur);
    };
  }, [flagViolation]);

  useEffect(() => {
    if (!frozen) return;
    const poll = setInterval(async () => {
      try {
        const res = await fetch(
          `/api/tabflags?action=status&test_code=${test.test_code}&student_register_id=${studentInfo.registerId}`
        );
        const data = await res.json();
        if (data.status === 'approved') {
          frozenRef.current = false;
          setFrozen(false);
        }
      } catch (e) {}
    }, 2000);
    return () => clearInterval(poll);
  }, [frozen, test.test_code, studentInfo.registerId]);

  const selectAnswer = (questionId, optionIndex) => {
    setAnswers((prev) => ({ ...prev, [questionId]: optionIndex }));
  };

  const formatTime = (s) => {
    const m = Math.floor(s / 60);
    const sec = s % 60;
    return `${m.toString().padStart(2, '0')}:${sec.toString().padStart(2, '0')}`;
  };

  const answeredCount = Object.keys(answers).length;

  if (questions.length === 0) return null;

  const current = questions[currentIndex];
  const isFirst = currentIndex === 0;
  const isLast = currentIndex === total - 1;

  return (
    <div className="w-full max-w-4xl mx-auto">
      <div className="bg-white rounded-2xl shadow-xl border border-slate-100 overflow-hidden">
        <div className="bg-primary px-3 sm:px-5 py-2 flex items-center justify-between gap-2 text-white">
          <div className="font-bold text-[11px] sm:text-sm truncate">{test.title}</div>
          <div className="flex items-center gap-2 sm:gap-4 shrink-0">
            <span className="text-[11px] sm:text-xs text-slate-200 whitespace-nowrap">
              {answeredCount}/{total} answered
            </span>
            <div
              className={`font-mono font-bold text-xs sm:text-lg px-2 sm:px-3 py-0.5 sm:py-1 rounded-md sm:rounded-lg ${
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

        <div className="p-3 sm:p-5 md:p-7">
          <div className="w-full bg-slate-100 rounded-full h-1.5 sm:h-2 mb-3 sm:mb-5">
            <div
              className="bg-gradient-to-r from-primary to-accent h-1.5 sm:h-2 rounded-full transition-all"
              style={{ width: `${((currentIndex + 1) / total) * 100}%` }}
            />
          </div>

          <div className="mb-4 sm:mb-6">
            <div className="flex items-start gap-2 sm:gap-3 mb-4 sm:mb-6">
              <span className="bg-primary text-white text-xs sm:text-sm font-bold rounded-lg px-2.5 py-1 shrink-0">
                Q{currentIndex + 1}
              </span>
              <h2 className="text-[15px] sm:text-lg font-semibold text-slate-800 leading-snug">{current.question_text}</h2>
            </div>

            <div className="grid gap-2 sm:gap-3">
              {current.options.map((opt, i) => {
                const isSelected = answers[current.id] === i;
                const labels = ['A', 'B', 'C', 'D'];
                return (
                  <button
                    key={i}
                    onClick={() => selectAnswer(current.id, i)}
                    className={`flex items-center gap-2.5 px-3 sm:px-4 py-2 sm:py-3 rounded-lg sm:rounded-xl border-2 text-left transition-all cursor-pointer ${
                      isSelected
                        ? 'border-primary bg-primary/5 shadow-sm'
                        : 'border-slate-100 hover:border-slate-300 hover:bg-slate-50'
                    }`}
                  >
                    <span
                      className={`w-7 h-7 sm:w-8 sm:h-8 rounded-full flex items-center justify-center text-xs sm:text-sm font-bold shrink-0 ${
                        isSelected
                          ? 'bg-primary text-white'
                          : 'bg-slate-100 text-slate-500'
                      }`}
                    >
                      {labels[i]}
                    </span>
                    <span className="text-sm text-slate-700">{opt}</span>
                  </button>
                );
              })}
            </div>
          </div>

          <div className="flex flex-wrap items-center justify-between gap-3">
            <button
              onClick={() => setCurrentIndex((i) => i - 1)}
              disabled={isFirst}
              className="px-4 py-2 sm:py-2.5 rounded-lg font-bold text-xs sm:text-sm border-2 border-slate-200 text-slate-600 hover:bg-slate-50 disabled:opacity-30 disabled:cursor-not-allowed transition"
            >
              Previous
            </button>

            <div className="flex gap-2">
              {isLast ? (
                <button
                  onClick={() => setShowConfirm(true)}
                  className="px-5 py-2 sm:py-2.5 rounded-lg font-bold text-xs sm:text-sm bg-gradient-to-r from-accent to-orange-600 text-white shadow-md hover:shadow-orange-200 transition"
                >
                  Submit Test
                </button>
              ) : (
                <button
                  onClick={() => setCurrentIndex((i) => i + 1)}
                  className="px-5 py-2 sm:py-2.5 rounded-lg font-bold text-xs sm:text-sm bg-primary text-white hover:bg-primary-dark transition"
                >
                  Next
                </button>
              )}
            </div>
          </div>
        </div>

        <div className="border-t border-slate-100 px-3 sm:px-5 py-2.5 sm:py-3.5">
          <div className="text-[11px] sm:text-xs font-bold text-slate-500 mb-1.5 sm:mb-2">Question Palette</div>
          <div className="flex flex-wrap gap-1.5 sm:gap-2">
            {questions.map((q, i) => (
              <button
                key={q.id}
                onClick={() => setCurrentIndex(i)}
                className={`w-7 h-7 sm:w-9 sm:h-9 rounded-md sm:rounded-lg text-[11px] sm:text-xs font-bold transition ${
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

      {frozen && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
          <div className="bg-white rounded-2xl shadow-2xl p-5 sm:p-8 max-w-md w-full mx-auto text-center">
            <div className="w-14 h-14 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-7 h-7 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z" />
              </svg>
            </div>
            <h3 className="text-lg font-black text-slate-800 mb-2">Tabs changing found</h3>
            <p className="text-sm text-slate-500 leading-relaxed">
              Your test has been paused because a tab or window change was detected. Your answers are safe and your timer is frozen.
            </p>
            <div className="mt-5 flex items-center justify-center gap-2 text-xs text-slate-400">
              <svg className="w-4 h-4 animate-spin text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                <path strokeLinecap="round" d="M4 12a8 8 0 018-8v4" />
              </svg>
              Waiting for admin approval to continue...
            </div>
          </div>
        </div>
      )}

      {showConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm overflow-y-auto p-4">
          <div className="bg-white rounded-2xl shadow-2xl p-5 sm:p-8 max-w-sm w-full mx-auto my-auto text-center">
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
