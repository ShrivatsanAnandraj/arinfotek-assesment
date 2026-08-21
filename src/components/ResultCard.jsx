import { useState, useEffect } from 'react';

export default function ResultCard({ result, studentInfo, testName, onRetake }) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!result._raw) {
      setData(result);
      setLoading(false);
      return;
    }

    const submit = async () => {
      try {
        const res = await fetch('/api/submit', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            testId: result.testId,
            studentName: result.studentName,
            studentEmail: result.studentEmail,
            answers: result.answers,
          }),
        });
        const json = await res.json();
        setData(json);
      } catch {
        setData({ error: 'Failed to submit. Please try again.' });
      } finally {
        setLoading(false);
      }
    };
    submit();
  }, [result]);

  if (loading) {
    return (
      <div className="w-full max-w-lg text-center py-20">
        <div className="animate-spin w-10 h-10 border-4 border-primary border-t-transparent rounded-full mx-auto" />
        <p className="text-slate-500 text-sm mt-4">Submitting your answers...</p>
      </div>
    );
  }

  if (data?.error) {
    return (
      <div className="w-full max-w-lg text-center py-20">
        <p className="text-red-500 mb-4">{data.error}</p>
        <button onClick={onRetake} className="px-6 py-2.5 rounded-lg font-bold bg-primary text-white">
          Try Again
        </button>
      </div>
    );
  }

  const { score, total, percentage, passed, review } = data;
  const labels = ['A', 'B', 'C', 'D'];

  return (
    <div className="w-full max-w-3xl">
      {/* Score card */}
      <div className="bg-white rounded-2xl shadow-xl border border-slate-100 p-8 text-center mb-6">
        <div className={`w-28 h-28 rounded-full mx-auto flex items-center justify-center mb-4 border-4 ${passed ? 'border-green-400 bg-green-50' : 'border-red-400 bg-red-50'}`}>
          <div>
            <div className={`text-3xl font-black ${passed ? 'text-green-600' : 'text-red-500'}`}>{percentage}%</div>
          </div>
        </div>

        <h2 className="text-2xl font-black text-slate-800 mb-1">
          {passed ? 'Congratulations!' : 'Better Luck Next Time'}
        </h2>
        <p className="text-sm text-slate-500 mb-4">
          {studentInfo?.name} &mdash; {testName}
        </p>

        <div className="flex justify-center gap-6 mb-6">
          <div className="text-center">
            <div className="text-2xl font-black text-primary">{score}</div>
            <div className="text-xs text-slate-500">Correct</div>
          </div>
          <div className="w-px bg-slate-200" />
          <div className="text-center">
            <div className="text-2xl font-black text-red-400">{total - score}</div>
            <div className="text-xs text-slate-500">Incorrect</div>
          </div>
          <div className="w-px bg-slate-200" />
          <div className="text-center">
            <div className="text-2xl font-black text-slate-600">{total}</div>
            <div className="text-xs text-slate-500">Total</div>
          </div>
        </div>

        <div className={`inline-block px-4 py-1.5 rounded-full text-sm font-bold ${passed ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-600'}`}>
          {passed ? 'PASSED' : 'NOT PASSED'}
        </div>
      </div>

      {/* Review */}
      <div className="bg-white rounded-2xl shadow-xl border border-slate-100 p-6 md:p-8 mb-6">
        <h3 className="text-lg font-black text-slate-800 mb-6">Answer Review</h3>
        <div className="space-y-6">
          {review?.map((item, i) => {
            const isCorrect = item.selectedAnswer === item.correctAnswer;
            return (
              <div key={item.id} className={`rounded-xl border-2 p-5 ${isCorrect ? 'border-green-200 bg-green-50/50' : 'border-red-200 bg-red-50/50'}`}>
                <div className="flex items-start gap-3 mb-3">
                  <span className={`text-xs font-bold rounded-lg px-2.5 py-1 shrink-0 ${isCorrect ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-600'}`}>
                    Q{i + 1}
                  </span>
                  <span className="text-sm font-semibold text-slate-800">{item.question}</span>
                </div>
                <div className="grid gap-2 ml-8">
                  {item.options.map((opt, j) => {
                    const isThisCorrect = j === item.correctAnswer;
                    const isThisSelected = j === item.selectedAnswer;
                    return (
                      <div
                        key={j}
                        className={`flex items-center gap-2 text-sm px-3 py-2 rounded-lg ${
                          isThisCorrect
                            ? 'bg-green-100 text-green-700 font-bold'
                            : isThisSelected
                            ? 'bg-red-100 text-red-600 line-through'
                            : 'text-slate-500'
                        }`}
                      >
                        <span className="font-bold">{labels[j]}.</span>
                        {opt}
                        {isThisCorrect && <span className="ml-auto text-green-600 text-xs">Correct</span>}
                        {isThisSelected && !isThisCorrect && <span className="ml-auto text-red-500 text-xs">Your answer</span>}
                      </div>
                    );
                  })}
                </div>
                {item.selectedAnswer === null && (
                  <div className="ml-8 mt-2 text-xs text-slate-400 italic">Not answered</div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      <div className="text-center">
        <button
          onClick={onRetake}
          className="px-8 py-3 rounded-lg font-bold bg-gradient-to-r from-accent to-orange-600 text-white shadow-md hover:shadow-orange-200 transition"
        >
          Take Another Test
        </button>
      </div>
    </div>
  );
}
