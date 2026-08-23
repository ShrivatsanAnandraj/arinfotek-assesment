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
  const [showImportModal, setShowImportModal] = useState(false);
  const fileInputRef = useRef(null);

  const [testTitle, setTestTitle] = useState('');
  const [testCode, setTestCode] = useState('');
  const [testDuration, setTestDuration] = useState(30);
  const [questions, setQuestions] = useState([
    { question_text: '', options: ['', '', '', ''], correct_answer: 0 },
  ]);
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);

  const [surveyTestCode, setSurveyTestCode] = useState('');
  const [surveyCourse, setSurveyCourse] = useState('');
  const [surveyTrainee, setSurveyTrainee] = useState('');
  const [surveyNoOfDays, setSurveyNoOfDays] = useState('');
  const [surveyTemplateName, setSurveyTemplateName] = useState('');
  const [surveyQuestions, setSurveyQuestions] = useState([]);
  const [templates, setTemplates] = useState([]);
  const [surveyMessage, setSurveyMessage] = useState('');
  const [loadingSurvey, setLoadingSurvey] = useState(false);

  const [feedbackResponses, setFeedbackResponses] = useState([]);
  const [loadingFeedback, setLoadingFeedback] = useState(false);
  const [selectedFeedbackTest, setSelectedFeedbackTest] = useState('all');
  const [expandedStudent, setExpandedStudent] = useState(null);

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

  const fetchTemplates = async () => {
    try {
      const res = await fetch('/api/surveys');
      const data = await res.json();
      if (res.ok) {
        setTemplates(data.templates || []);
      }
    } catch {
      console.error('Failed to fetch templates');
    }
  };

  useEffect(() => {
    if (view === 'createsurvey') {
      fetchTemplates();
    }
  }, [view]);

  const fetchFeedback = async () => {
    setLoadingFeedback(true);
    try {
      const res = await fetch('/api/surveys?action=responses');
      const data = await res.json();
      if (res.ok) {
        setFeedbackResponses(data.responses || []);
      }
    } catch {
      console.error('Failed to fetch feedback');
    } finally {
      setLoadingFeedback(false);
    }
  };

  useEffect(() => {
    if (view === 'feedback') {
      fetchFeedback();
    }
  }, [view]);

  const handleTemplateSelect = (template) => {
    setSurveyTemplateName(template);
  };

  const handleSubmitSurvey = async (e) => {
    e.preventDefault();
    setSurveyMessage('');

    if (!surveyTestCode || !surveyCourse || !surveyTrainee || !surveyNoOfDays) {
      setSurveyMessage('Error: All fields are required.');
      return;
    }

    if (!surveyTemplateName) {
      setSurveyMessage('Error: Please select a template.');
      return;
    }

    setLoadingSurvey(true);
    try {
      const res = await fetch('/api/surveys', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'create',
          test_code: surveyTestCode,
          course: surveyCourse,
          trainee: surveyTrainee,
          no_of_days: Number(surveyNoOfDays),
          template_name: surveyTemplateName
        })
      });
      const data = await res.json();
      if (res.ok) {
        setSurveyMessage('Success! Survey created for test code: ' + surveyTestCode.toUpperCase());
        setSurveyTestCode('');
        setSurveyCourse('');
        setSurveyTrainee('');
        setSurveyNoOfDays('');
        setSurveyTemplateName('');
      } else {
        setSurveyMessage('Error: ' + (data.error || 'Failed to create survey'));
      }
    } catch {
      setSurveyMessage('Error: Failed to connect to server.');
    } finally {
      setLoadingSurvey(false);
    }
  };

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

        const requiredCols = ['question', 'optiona', 'optionb', 'optionc', 'optiond', 'correctoption'];
        const firstRow = Object.keys(data[0]).map(k => k.toLowerCase().trim());

        for (const col of requiredCols) {
          if (!firstRow.includes(col)) {
            setMessage('Error: Wrong format. Required columns: question, optiona, optionb, optionc, optiond, correctoption');
            return;
          }
        }

        const imported = data.map((row) => {
          const keys = Object.keys(row);
          const getCol = (name) => keys.find(k => k.toLowerCase().trim() === name);
          const opts = ['optiona', 'optionb', 'optionc', 'optiond'].map(c => String(row[getCol(c)] || '').trim());
          const correct = String(row[getCol('correctoption')] || '').trim().toUpperCase();
          const correctIndex = ['A', 'B', 'C', 'D'].indexOf(correct);
          return {
            question_text: String(row[getCol('question')] || '').trim(),
            options: opts,
            correct_answer: correctIndex >= 0 ? correctIndex : 0,
          };
        });

        setQuestions(imported);
        setShowImportModal(false);
        setMessage(`Imported ${imported.length} questions from Excel.`);
      } catch {
        setMessage('Error: Failed to parse Excel file. Check the format.');
      }
    };
    reader.readAsBinaryString(file);
    e.target.value = '';
  };

  const downloadTemplate = () => {
    const ws = XLSX.utils.aoa_to_sheet([
      ['question', 'optiona', 'optionb', 'optionc', 'optiond', 'correctoption'],
    ]);
    ws['!cols'] = [
      { wch: 40 },
      { wch: 20 },
      { wch: 20 },
      { wch: 20 },
      { wch: 20 },
      { wch: 15 },
    ];
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Questions');
    XLSX.writeFile(wb, 'arinfotek-question-template.xlsx');
  };

  const getFilteredScores = () => {
    let filtered = selectedTest === 'all' ? scores : scores.filter(s => s.test_code === selectedTest);
    return filtered.sort((a, b) => a.student_name.localeCompare(b.student_name));
  };

  const deleteScore = async (action, id, test_code) => {
    if (!confirm('Are you sure you want to delete?')) return;
    try {
      const res = await fetch('/api/scores', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action, id, test_code })
      });
      if (res.ok) fetchScores();
    } catch {
      alert('Failed to delete');
    }
  };

  const deleteFeedback = async (action, id, test_code) => {
    if (!confirm('Are you sure you want to delete?')) return;
    try {
      const res = await fetch('/api/surveys', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action, id, test_code })
      });
      if (res.ok) fetchFeedback();
    } catch {
      alert('Failed to delete');
    }
  };

  const getScoresTitle = () => {
    if (selectedTest === 'all') return 'AR INFOTEK - Assessment';
    return 'AR INFOTEK - Assessment (' + selectedTest + ')';
  };

  const printScores = () => {
    const data = getFilteredScores();
    const printWindow = window.open('', '_blank');
    printWindow.document.write(`
      <html><head><title>${getScoresTitle()}</title>
      <style>body{font-family:sans-serif;padding:20px}table{width:100%;border-collapse:collapse}th,td{border:1px solid #ddd;padding:8px;text-align:left}th{background:#1e5aa8;color:white}tr:nth-child(even){background:#f9f9f9}</style>
      </head><body>
      <h2>${getScoresTitle()}</h2>
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
    doc.text(getScoresTitle(), 14, 15);

    const tableData = data.map(s => [
      s.student_name,
      s.student_register_id,
      s.test_code,
      s.score + '/' + s.total,
      Math.round((s.score / s.total) * 100) + '%',
      new Date(s.submitted_at).toLocaleDateString(),
    ]);

    jsPDFautotable(doc, {
      startY: 22,
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
    <div className="w-full max-w-3xl mx-auto py-0 md:py-8">
      <div className="bg-white rounded-2xl shadow-xl border border-slate-100 p-3.5 sm:p-5 md:p-7">
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
                    onClick={() => { setView('feedback'); setMenuOpen(false); }}
                    className="w-full text-left px-4 py-2.5 text-sm font-bold text-slate-400 hover:text-primary transition-colors duration-200"
                    onMouseEnter={(e) => e.target.style.color = '#1e5aa8'}
                    onMouseLeave={(e) => e.target.style.color = ''}
                  >
                    View Feedback
                  </button>
                  <button
                    onClick={() => { setView('create'); setMenuOpen(false); }}
                    className="w-full text-left px-4 py-2.5 text-sm font-bold text-slate-400 hover:text-primary transition-colors duration-200"
                    onMouseEnter={(e) => e.target.style.color = '#1e5aa8'}
                    onMouseLeave={(e) => e.target.style.color = ''}
                  >
                    Create Test
                  </button>
                  <button
                    onClick={() => { setShowImportModal(true); setMenuOpen(false); }}
                    className="w-full text-left px-4 py-2.5 text-sm font-bold text-slate-400 hover:text-primary transition-colors duration-200"
                    onMouseEnter={(e) => e.target.style.color = '#1e5aa8'}
                    onMouseLeave={(e) => e.target.style.color = ''}
                  >
                    Import Questions from Excel
                  </button>
                  <button
                    onClick={() => { setView('scores'); setMenuOpen(false); }}
                    className="w-full text-left px-4 py-2.5 text-sm font-bold text-slate-400 hover:text-primary transition-colors duration-200"
                    onMouseEnter={(e) => e.target.style.color = '#1e5aa8'}
                    onMouseLeave={(e) => e.target.style.color = ''}
                  >
                    View Scores
                  </button>
                  <button
                    onClick={() => { setView('createsurvey'); setMenuOpen(false); }}
                    className="w-full text-left px-4 py-2.5 text-sm font-bold text-slate-400 hover:text-primary transition-colors duration-200"
                    onMouseEnter={(e) => e.target.style.color = '#1e5aa8'}
                    onMouseLeave={(e) => e.target.style.color = ''}
                  >
                    Create Survey
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
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                <label className="text-sm font-bold text-slate-600">Filter:</label>
                <select
                  value={selectedTest}
                  onChange={(e) => setSelectedTest(e.target.value)}
                  className="px-3 sm:px-4 py-2 rounded-lg border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 max-w-[60vw] sm:max-w-none"
                >
                  <option value="all">All Tests</option>
                  {tests.map((t) => (
                    <option key={t.id} value={t.test_code}>{t.test_code} - {t.title}</option>
                  ))}
                </select>
                {selectedTest !== 'all' && (
                  <button onClick={() => deleteScore('by_test', null, selectedTest)} className="px-3 py-2 rounded-lg text-xs font-bold bg-red-500 text-white hover:bg-red-600 transition">
                    Delete All ({selectedTest})
                  </button>
                )}
                <button onClick={() => deleteScore('all')} className="px-3 py-2 rounded-lg text-xs font-bold bg-red-600 text-white hover:bg-red-700 transition">
                  Delete All Scores
                </button>
              </div>
              <div className="flex flex-wrap gap-2">
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

        {view === 'feedback' && (
          <div className="mb-6">
            <div className="flex items-center justify-between mb-4">
              <button
                onClick={() => { setView('create'); setSelectedFeedbackTest('all'); setExpandedStudent(null); }}
                className="flex items-center gap-2 text-sm font-bold text-slate-600 hover:text-primary transition"
              >
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
                </svg>
                Back
              </button>
              <h1 className="text-2xl font-black text-slate-800">Survey Feedback</h1>
            </div>
            <div className="flex flex-wrap items-center gap-3 mb-4">
              <label className="text-sm font-bold text-slate-600">Select Test Code:</label>
              <select
                value={selectedFeedbackTest}
                onChange={(e) => { setSelectedFeedbackTest(e.target.value); setExpandedStudent(null); }}
                className="px-3 sm:px-4 py-2 rounded-lg border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 max-w-[60vw] sm:max-w-none"
              >
                <option value="all">-- Choose Test Code --</option>
                {[...new Set(feedbackResponses.map(r => r.test_code))].map(tc => (
                  <option key={tc} value={tc}>{tc}</option>
                ))}
              </select>
              {selectedFeedbackTest !== 'all' && (
                <button onClick={() => deleteFeedback('by_test', null, selectedFeedbackTest)} className="px-3 py-2 rounded-lg text-xs font-bold bg-red-500 text-white hover:bg-red-600 transition">
                  Delete All ({selectedFeedbackTest})
                </button>
              )}
              <button onClick={() => deleteFeedback('all')} className="px-3 py-2 rounded-lg text-xs font-bold bg-red-600 text-white hover:bg-red-700 transition">
                Delete All Feedback
              </button>
            </div>
            {loadingFeedback ? (
              <div className="text-center py-10">
                <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full mx-auto" />
                <p className="text-sm text-slate-500 mt-3">Loading...</p>
              </div>
            ) : selectedFeedbackTest === 'all' ? (
              <div className="text-center py-10 text-slate-500">
                <p className="text-sm">Please select a test code to view feedback.</p>
              </div>
            ) : (
              <div className="space-y-2 max-h-[60vh] overflow-y-auto">
                {[...new Set(feedbackResponses
                  .filter(r => r.test_code === selectedFeedbackTest)
                  .map(r => r.student_register_id))].map(regId => {
                    const student = feedbackResponses.find(r => r.student_register_id === regId && r.test_code === selectedFeedbackTest);
                    const allResponses = feedbackResponses.filter(r => r.student_register_id === regId && r.test_code === selectedFeedbackTest);
                    const isExpanded = expandedStudent === regId;
                    return (
                      <div key={regId} className="bg-slate-50 rounded-xl overflow-hidden">
                        <button
                          onClick={() => setExpandedStudent(isExpanded ? null : regId)}
                          className="w-full flex items-center justify-between px-4 py-3 text-left hover:bg-slate-100 transition"
                        >
                          <div className="flex items-center gap-3">
                            <span className="bg-primary text-white text-xs font-bold rounded-lg px-2.5 py-1">{student.student_name}</span>
                            <span className="text-xs text-slate-500">Reg: {regId}</span>
                            <span className="text-[11px] text-slate-400">{allResponses.length} response(s)</span>
                          </div>
                          <svg className={`w-5 h-5 text-slate-400 transition-transform ${isExpanded ? 'rotate-180' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
                          </svg>
                        </button>
                        {isExpanded && (
                          <div className="border-t border-slate-200 p-4 space-y-3">
                            {allResponses.map((resp) => {
                              const qList = resp.questions || [];
                              const ans = resp.answers || {};
                              return (
                                <div key={resp.id} className="bg-white rounded-lg p-3">
                                  <div className="flex flex-wrap items-center justify-between gap-2 mb-2">
                                    <div className="flex items-center gap-2">
                                      <span className="text-xs text-slate-500">Template: {resp.template_name}</span>
                                      <span className="text-[11px] text-slate-400">{new Date(resp.submitted_at).toLocaleDateString()}</span>
                                    </div>
                                    <button onClick={() => deleteFeedback('single', resp.id)} className="text-red-400 hover:text-red-600 text-xs font-bold">Delete</button>
                                  </div>
                                  <div className="space-y-1.5">
                                    {qList.map((q, i) => (
                                      <div key={i} className="flex items-start gap-2 text-sm">
                                        <span className="font-bold text-primary shrink-0">Q{i + 1}.</span>
                                        <div className="flex-1">
                                          <p className="text-slate-700 font-medium">{q}</p>
                                          <p className="text-green-600 font-bold mt-0.5">Answer: {ans[i] || 'Not answered'}</p>
                                        </div>
                                      </div>
                                    ))}
                                  </div>
                                </div>
                              );
                            })}
                          </div>
                        )}
                      </div>
                    );
                  })}
              </div>
            )}
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
          <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-5">
            <div className="bg-slate-50 rounded-xl p-3.5 sm:p-5 space-y-3 sm:space-y-4">
              <h3 className="font-bold text-sm sm:text-base text-slate-700">Test Details</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
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
                    className="w-full px-3 sm:px-3.5 py-2 sm:py-2.5 rounded-lg border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
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
                  className="w-full px-3 sm:px-3.5 py-2 sm:py-2.5 rounded-lg border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
                />
              </div>
            </div>

            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="font-bold text-sm sm:text-base text-slate-700">Questions ({questions.length})</h3>
                <button
                  type="button"
                  onClick={addQuestion}
                  className="px-3 sm:px-4 py-1.5 sm:py-2 rounded-lg font-bold text-xs sm:text-sm bg-primary text-white hover:bg-primary-dark transition"
                >
                  + Add Question
                </button>
              </div>

              {questions.map((q, qi) => (
                <div key={qi} className="bg-slate-50 rounded-xl p-3.5 sm:p-5 space-y-2.5 sm:space-y-3">
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
                    className="w-full px-3 sm:px-3.5 py-2 sm:py-2.5 rounded-lg border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
                  />
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
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
              className="w-full py-3 sm:py-3.5 rounded-xl font-bold text-base sm:text-lg bg-gradient-to-r from-accent to-orange-600 text-white shadow-lg hover:shadow-orange-200 transition disabled:opacity-50"
            >
              {loading ? 'Creating...' : 'Create Test'}
            </button>
          </form>
        )}

        {view === 'createsurvey' && (
          <div>
            <div className="flex items-center justify-between mb-6">
              <button
                onClick={() => setView('create')}
                className="flex items-center gap-2 text-sm font-bold text-slate-600 hover:text-primary transition"
              >
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
                </svg>
                Back
              </button>
              <h1 className="text-2xl font-black text-slate-800">Create Survey</h1>
            </div>

            <form onSubmit={handleSubmitSurvey} className="space-y-4">
              <div className="bg-slate-50 rounded-xl p-5 space-y-4">
                <h3 className="font-bold text-base text-slate-700">Survey Details</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-600 mb-1">Test Code</label>
                    <input
                      type="text"
                      value={surveyTestCode}
                      onChange={(e) => setSurveyTestCode(e.target.value)}
                      placeholder="e.g. APT01"
                      className="w-full px-4 py-2.5 rounded-lg border border-slate-200 text-sm font-mono uppercase focus:outline-none focus:ring-2 focus:ring-primary/30"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-600 mb-1">Course</label>
                    <input
                      type="text"
                      value={surveyCourse}
                      onChange={(e) => setSurveyCourse(e.target.value)}
                      placeholder="e.g. IT Training"
                      className="w-full px-4 py-2.5 rounded-lg border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
                    />
                  </div>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-600 mb-1">Trainee</label>
                    <input
                      type="text"
                      value={surveyTrainee}
                      onChange={(e) => setSurveyTrainee(e.target.value)}
                      placeholder="e.g. John Doe"
                      className="w-full px-4 py-2.5 rounded-lg border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-600 mb-1">No. of Days</label>
                    <input
                      type="number"
                      value={surveyNoOfDays}
                      onChange={(e) => setSurveyNoOfDays(e.target.value)}
                      min="1"
                      placeholder="e.g. 5"
                      className="w-full px-4 py-2.5 rounded-lg border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-600 mb-2">Select Template</label>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    {templates.map((template) => (
                      <button
                        key={template}
                        type="button"
                        onClick={() => handleTemplateSelect(template)}
                        className={`p-3 rounded-xl border-2 text-left transition-all ${
                          surveyTemplateName === template
                            ? 'border-primary bg-primary/5 shadow-sm'
                            : 'border-slate-200 hover:border-slate-300 hover:bg-slate-50'
                        }`}
                      >
                        <div className="flex items-center gap-2">
                          <span className={`w-4 h-4 rounded-full border-2 flex items-center justify-center ${
                            surveyTemplateName === template
                              ? 'border-primary bg-primary'
                              : 'border-slate-300'
                          }`}>
                            {surveyTemplateName === template && (
                              <span className="w-2 h-2 bg-white rounded-full" />
                            )}
                          </span>
                          <span className="text-sm font-bold text-slate-700">{template}</span>
                        </div>
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {surveyMessage && (
                <div className={`text-sm px-4 py-3 rounded-lg border ${surveyMessage.startsWith('Success') ? 'bg-green-50 text-green-700 border-green-200' : 'bg-red-50 text-red-600 border-red-100'}`}>
                  {surveyMessage}
                </div>
              )}

              <button
                type="submit"
                disabled={loadingSurvey}
                className="w-full py-3.5 rounded-xl font-bold text-lg bg-gradient-to-r from-accent to-orange-600 text-white shadow-lg hover:shadow-orange-200 transition disabled:opacity-50"
              >
                {loadingSurvey ? 'Creating...' : 'Create Survey'}
              </button>
            </form>
          </div>
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
                <table className="w-full text-xs sm:text-sm">
                  <thead>
                    <tr className="border-b border-slate-200">
                      <th className="text-left py-2 sm:py-3 px-1.5 sm:px-2 font-bold text-slate-600">Name</th>
                      <th className="text-left py-2 sm:py-3 px-1.5 sm:px-2 font-bold text-slate-600">Register ID</th>
                      <th className="text-left py-2 sm:py-3 px-1.5 sm:px-2 font-bold text-slate-600">Test</th>
                      <th className="text-center py-2 sm:py-3 px-1.5 sm:px-2 font-bold text-slate-600">Score</th>
                      <th className="text-center py-2 sm:py-3 px-1.5 sm:px-2 font-bold text-slate-600">%</th>
                      <th className="text-left py-2 sm:py-3 px-1.5 sm:px-2 font-bold text-slate-600">Date</th>
                      <th className="text-left py-2 sm:py-3 px-1.5 sm:px-2 font-bold text-slate-600"></th>
                    </tr>
                  </thead>
                  <tbody>
                    {getFilteredScores().map((s) => {
                      const pct = Math.round((s.score / s.total) * 100);
                      return (
                        <tr key={s.id} className="border-b border-slate-100 hover:bg-slate-50">
                          <td className="py-2 sm:py-3 px-1.5 sm:px-2 font-bold text-slate-800">{s.student_name}</td>
                          <td className="py-2 sm:py-3 px-1.5 sm:px-2 text-slate-600">{s.student_register_id}</td>
                          <td className="py-2 sm:py-3 px-1.5 sm:px-2 text-slate-600">{s.test_code}</td>
                          <td className="py-2 sm:py-3 px-1.5 sm:px-2 text-center font-bold text-primary">{s.score}/{s.total}</td>
                          <td className="py-2 sm:py-3 px-1.5 sm:px-2 text-center">
                            <span className={`font-bold px-2 py-0.5 rounded-full text-[11px] sm:text-xs ${pct >= 40 ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-600'}`}>
                              {pct}%
                            </span>
                          </td>
                          <td className="py-2 sm:py-3 px-1.5 sm:px-2 text-slate-500 text-[11px] sm:text-xs">
                            {new Date(s.submitted_at).toLocaleDateString()}
                          </td>
                          <td className="py-2 sm:py-3 px-1.5 sm:px-2">
                            <button onClick={() => deleteScore('single', s.id)} className="text-red-400 hover:text-red-600 text-xs font-bold">Delete</button>
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

      {showImportModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm overflow-y-auto p-4">
          <div className="bg-white rounded-2xl shadow-2xl p-5 sm:p-8 max-w-sm w-full mx-auto my-auto text-center">
            <div className="w-14 h-14 bg-accent/10 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-7 h-7 text-accent" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
            </div>
            <h3 className="text-lg font-black text-slate-800 mb-2">Import Questions</h3>
            <p className="text-sm text-slate-500 mb-6">Upload an Excel file or download the template first</p>
            <div className="flex flex-col sm:flex-row gap-2 sm:gap-3">
              <button
                onClick={() => setShowImportModal(false)}
                className="flex-1 py-2.5 rounded-lg font-bold text-sm border-2 border-slate-200 text-slate-600 hover:bg-slate-50 transition"
              >
                Cancel
              </button>
              <button
                onClick={downloadTemplate}
                className="flex-1 py-2.5 rounded-lg font-bold text-sm bg-primary text-white hover:bg-primary-dark transition"
              >
                Download Template
              </button>
              <button
                onClick={() => fileInputRef.current?.click()}
                className="flex-1 py-2.5 rounded-lg font-bold text-sm bg-gradient-to-r from-accent to-orange-600 text-white shadow-md transition"
              >
                Upload File
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
