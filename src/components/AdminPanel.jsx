import { useState, useEffect, useRef } from 'react';
import * as XLSX from 'xlsx';
import jsPDF from 'jspdf';
import jsPDFautotable from 'jspdf-autotable';

export default function AdminPanel() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [view, setView] = useState('create');
  const [scores, setScores] = useState([]);
  const [tests, setTests] = useState([]);
  const [selectedTest, setSelectedTest] = useState('all');
  const [loadingScores, setLoadingScores] = useState(false);
  const fileInputRef = useRef(null);

  const [testTitle, setTestTitle] = useState('');
  const [testCode, setTestCode] = useState('');
  const [testDuration, setTestDuration] = useState(30);
  const [questions, setQuestions] = useState([
    { question_text: '', options: ['', '', '', ''], correct_answer: 0 },
  ]);
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);

  const fetchScores = async () => {
    setLoadingScores(true);
    try {
      const res = await fetch('/api/scores');
      const data = await res.json();
      if (res.ok) {
        setScores(data.attempts || []);
        setTests(data.tests || []);
      }
    } catch {
      console.error('Failed to fetch scores');
    } finally {
      setLoadingScores(false);
    }
  };

  useEffect(() => {
    if (view === 'scores') {
      fetchScores();
    }
  }, [view]);

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
          test_code: testCode.toUpperCase(),
          duration_minutes: Number(testDuration),
          questions,
        }),
      });
      const data = await res.json();
      if (res.ok) {
        setMessage(`Success! Test "${testCode.toUpperCase()}" created with ${questions.length} questions.`);
        setTestTitle('');
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

  const handleExcelImport = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (evt) => {
      try {
        const wb = XLSX.read(evt.target.result, { type: 'binary' });
        const ws = wb.Sheets[wb.SheetNames[0]];
        const data = XLSX.utils.sheet_to_json(ws);

        if (data.length === 0) {
          setMessage('Error: Excel file is empty.');
          return;
        }

        const requiredCols = ['question', 'optiona', 'optionb', 'optionc', 'optiond'];
        const firstRow = Object.keys(data[0]).map(k => k.toLowerCase().trim());

        for (const col of requiredCols) {
          if (!firstRow.includes(col)) {
            setMessage('Error: Wrong format. Required columns: Question, OptionA, OptionB, OptionC, OptionD');
            return;
          }
        }

        const qCol = firstRow.find(k => k === 'question');
        const optCols = ['optiona', 'optionb', 'optionc', 'optiond'].map(c => firstRow.find(k => k === c));

        const imported = data.map((row) => {
          const opts = optCols.map(c => String(row[Object.keys(row).find(k => k.toLowerCase().trim() === c)] || '').trim());
          return {
            question_text: String(row[Object.keys(row).find(k => k.toLowerCase().trim() === qCol)] || '').trim(),
            options: opts,
            correct_answer: 0,
          };
        });

        setQuestions(imported);
        setMessage(`Imported ${imported.length} questions from Excel.`);
      } catch {
        setMessage('Error: Failed to parse Excel file. Check the format.');
      }
    };
    reader.readAsBinaryString(file);
    e.target.value = '';
  };

  const getFilteredScores = () => {
    let filtered = selectedTest === 'all' ? scores : scores.filter(s => s.test_code === selectedTest);
    return filtered.sort((a, b) => a.student_name.localeCompare(b.student_name));
  };

  const printScores = () => {
    const data = getFilteredScores();
    const printWindow = window.open('', '_blank');
    printWindow.document.write(`
      <html><head><title>Student Scores</title>
      <style>body{font-family:sans-serif;padding:20px}table{width:100%;border-collapse:collapse}th,td{border:1px solid #ddd;padding:8px;text-align:left}th{background:#1e5aa8;color:white}tr:nth-child(even){background:#f9f9f9}</style>
      </head><body>
      <h2>AR INFOTEK - Student Scores</h2>
      <p>Test: ${selectedTest === 'all' ? 'All Tests' : selectedTest}</p>
      <table><thead><tr><th>Name</th><th>Register ID</th><th>Test</th><th>Score</th><th>%</th><th>Date</th></tr></thead><tbody>
      ${data.map(s => {
        const pct = Math.round((s.score / s.total) * 100);
        return `<tr><td>${s.student_name}</td><td>${s.student_register_id}</td><td>${s.test_code}</td><td>${s.score}/${s.total}</td><td>${pct}%</td><td>${new Date(s.submitted_at).toLocaleDateString()}</td></tr>`;
      }).join('')}
      </tbody></table></body></html>
    `);
    printWindow.document.close();
    printWindow.print();
  };

  const downloadPDF = () => {
    const data = getFilteredScores();
    const doc = new jsPDF();
    doc.setFontSize(16);
    doc.text('AR INFOTEK - Student Scores', 14, 15);
    doc.setFontSize(10);
    doc.text('Test: ' + (selectedTest === 'all' ? 'All Tests' : selectedTest), 14, 22);

    const tableData = data.map(s => [
      s.student_name,
      s.student_register_id,
      s.test_code,
      s.score + '/' + s.total,
      Math.round((s.score / s.total) * 100) + '%',
      new Date(s.submitted_at).toLocaleDateString(),
    ]);

    jsPDFautotable(doc, {
      startY: 28,
      head: [['Name', 'Register ID', 'Test', 'Score', '%', 'Date']],
      body: tableData,
    });

    doc.save('student-scores.pdf');
  };

  const downloadExcel = () => {
    const data = getFilteredScores();
    const ws = XLSX.utils.json_to_sheet(data.map(s => ({
      Name: s.student_name,
      'Register ID': s.student_register_id,
      Test: s.test_code,
      Score: `${s.score}/${s.total}`,
      Percentage: `${Math.round((s.score / s.total) * 100)}%`,
      Date: new Date(s.submitted_at).toLocaleDateString(),
    })));
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Scores');
    XLSX.writeFile(wb, 'student-scores.xlsx');
  };

  return (
    <div className="w-full max-w-3xl mx-auto py-10 px-4">
      <div className="bg-white rounded-2xl shadow-xl border border-slate-100 p-8">
        {view === 'create' && (
          <div className="flex items-center justify-between mb-8">
            <div>
              <h1 className="text-2xl font-black text-slate-800">Admin Panel</h1>
              <p className="text-sm text-slate-500 mt-1">Create tests and add questions</p>
            </div>
            <div className="relative">
              <button
                onClick={() => setMenuOpen(!menuOpen)}
                className="p-2 rounded-lg hover:bg-slate-100 transition text-slate-600"
              >
                <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                  <circle cx="12" cy="5" r="2" />
                  <circle cx="12" cy="12" r="2" />
                  <circle cx="12" cy="19" r="2" />
                </svg>
              </button>
              {menuOpen && (
                <div className="absolute right-0 top-12 bg-white rounded-xl shadow-xl border border-slate-100 py-2 w-56 z-10">
                  <button
                    onClick={() => { setView('create'); setMenuOpen(false); }}
                    className="w-full text-left px-4 py-2.5 text-sm font-bold text-slate-400 hover:text-primary hover:bg-slate-50 transition"
                  >
                    Create Test
                  </button>
                  <button
                    onClick={() => { fileInputRef.current?.click(); setMenuOpen(false); }}
                    className="w-full text-left px-4 py-2.5 text-sm font-bold text-slate-400 hover:text-primary hover:bg-slate-50 transition"
                  >
                    Import Questions from Excel
                  </button>
                  <button
                    onClick={() => { setView('scores'); setMenuOpen(false); }}
                    className="w-full text-left px-4 py-2.5 text-sm font-bold text-slate-400 hover:text-primary hover:bg-slate-50 transition"
                  >
                    View Scores
                  </button>
                </div>
              )}
            </div>
          </div>
        )}

        {view === 'scores' && (
          <div className="mb-6">
            <div className="flex items-center justify-between mb-4">
              <button
                onClick={() => setView('create')}
                className="flex items-center gap-2 text-sm font-bold text-slate-600 hover:text-primary transition"
              >
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
                </svg>
                Back
              </button>
              <h1 className="text-2xl font-black text-slate-800">Student Scores</h1>
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <label className="text-sm font-bold text-slate-600">Filter:</label>
                <select
                  value={selectedTest}
                  onChange={(e) => setSelectedTest(e.target.value)}
                  className="px-4 py-2 rounded-lg border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
                >
                  <option value="all">All Tests</option>
                  {tests.map((t) => (
                    <option key={t.id} value={t.test_code}>{t.test_code} - {t.title}</option>
                  ))}
                </select>
              </div>
              <div className="flex gap-2">
                <button onClick={printScores} className="flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-bold bg-primary text-white hover:bg-primary-dark transition">
                  <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" /></svg>
                  Print
                </button>
                <button onClick={downloadPDF} className="flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-bold bg-red-500 text-white hover:bg-red-600 transition">
                  <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>
                  PDF
                </button>
                <button onClick={downloadExcel} className="flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-bold bg-green-600 text-white hover:bg-green-700 transition">
                  <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>
                  Excel
                </button>
              </div>
            </div>
          </div>
        )}

        <input
          ref={fileInputRef}
          type="file"
          accept=".xlsx,.xls,.csv"
          onChange={handleExcelImport}
          className="hidden"
        />

        {view === 'create' && (
          <form onSubmit={handleSubmit} className="space-y-6">
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
            </div>

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
              <div className={`text-sm px-4 py-3 rounded-lg border ${message.startsWith('Success') || message.startsWith('Imported') ? 'bg-green-50 text-green-700 border-green-200' : 'bg-red-50 text-red-600 border-red-100'}`}>
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
        )}

        {view === 'scores' && (
          <div>
            {loadingScores ? (
              <div className="text-center py-10">
                <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full mx-auto" />
                <p className="text-sm text-slate-500 mt-3">Loading...</p>
              </div>
            ) : getFilteredScores().length === 0 ? (
              <div className="text-center py-10 text-slate-500">
                <p className="text-sm">No submissions yet.</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-slate-200">
                      <th className="text-left py-3 px-2 font-bold text-slate-600">Name</th>
                      <th className="text-left py-3 px-2 font-bold text-slate-600">Register ID</th>
                      <th className="text-left py-3 px-2 font-bold text-slate-600">Test</th>
                      <th className="text-center py-3 px-2 font-bold text-slate-600">Score</th>
                      <th className="text-center py-3 px-2 font-bold text-slate-600">%</th>
                      <th className="text-left py-3 px-2 font-bold text-slate-600">Date</th>
                    </tr>
                  </thead>
                  <tbody>
                    {getFilteredScores().map((s) => {
                      const pct = Math.round((s.score / s.total) * 100);
                      return (
                        <tr key={s.id} className="border-b border-slate-100 hover:bg-slate-50">
                          <td className="py-3 px-2 font-bold text-slate-800">{s.student_name}</td>
                          <td className="py-3 px-2 text-slate-600">{s.student_register_id}</td>
                          <td className="py-3 px-2 text-slate-600">{s.test_code}</td>
                          <td className="py-3 px-2 text-center font-bold text-primary">{s.score}/{s.total}</td>
                          <td className="py-3 px-2 text-center">
                            <span className={`font-bold px-2 py-0.5 rounded-full text-xs ${pct >= 40 ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-600'}`}>
                              {pct}%
                            </span>
                          </td>
                          <td className="py-3 px-2 text-slate-500 text-xs">
                            {new Date(s.submitted_at).toLocaleDateString()}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
