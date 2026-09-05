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
  const [testSubject, setTestSubject] = useState('');
  const [testCourse, setTestCourse] = useState('');
  const [testLevel, setTestLevel] = useState('');
  const [testTopics, setTestTopics] = useState('');
  const [returnUrl, setReturnUrl] = useState('');
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
  const [showSurveyReport, setShowSurveyReport] = useState(false);
  const [reportTestCode, setReportTestCode] = useState('');
  const [reportData, setReportData] = useState(null);

  const [allTestsQuestions, setAllTestsQuestions] = useState([]);
  const [loadingQuestions, setLoadingQuestions] = useState(false);
  const [expandedQuestionTest, setExpandedQuestionTest] = useState(null);

  const [showTemplateModal, setShowTemplateModal] = useState(false);
  const [templateDetails, setTemplateDetails] = useState({});
  const [loadingTemplateDetails, setLoadingTemplateDetails] = useState(false);
  const [viewingTemplate, setViewingTemplate] = useState(null);
  const [editingTemplate, setEditingTemplate] = useState(null);
  const [editedQuestions, setEditedQuestions] = useState([]);
  const [savingTemplate, setSavingTemplate] = useState(false);

  const [showFeedbackPdfModal, setShowFeedbackPdfModal] = useState(false);
  const [feedbackPdfStudent, setFeedbackPdfStudent] = useState('');
  const [showReportPdfModal, setShowReportPdfModal] = useState(false);
  const [reportPdfStudent, setReportPdfStudent] = useState('');
  const [showDataAnalysis, setShowDataAnalysis] = useState(false);
  const [dataAnalysisTestCode, setDataAnalysisTestCode] = useState('');
  const [dataAnalysisResult, setDataAnalysisResult] = useState(null);
  const [flags, setFlags] = useState([]);

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
    if (typeof window === 'undefined') return;
    const params = new URLSearchParams(window.location.search);
    const code = params.get('test_code');
    const subject = params.get('subject');
    const course = params.get('course');
    const level = params.get('level');
    const topics = params.get('topics');
    const ret = params.get('return');
    if (code) setTestCode(code);
    if (subject) setTestSubject(subject);
    if (course) setTestCourse(course);
    if (level) setTestLevel(level);
    if (topics) setTestTopics(topics);
    if (ret) setReturnUrl(decodeURIComponent(ret));
  }, []);

  const fetchFlags = async () => {
    try {
      const res = await fetch('/api/tabflags?action=list');
      const data = await res.json();
      if (res.ok) setFlags(data.flags || []);
    } catch {}
  };

  useEffect(() => {
    fetchFlags();
    const id = setInterval(fetchFlags, 5000);
    return () => clearInterval(id);
  }, []);

  const approveFlag = async (id) => {
    try {
      const res = await fetch('/api/tabflags?action=resolve', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id }),
      });
      const data = await res.json();
      if (res.ok) {
        setFlags((prev) => prev.filter((f) => f.id !== id));
      }
    } catch {}
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

  const fetchAllQuestions = async () => {
    setLoadingQuestions(true);
    try {
      const res = await fetch('/api/admin');
      const data = await res.json();
      if (res.ok) {
        setAllTestsQuestions(data.tests || []);
      }
    } catch {
      console.error('Failed to fetch questions');
    } finally {
      setLoadingQuestions(false);
    }
  };

  useEffect(() => {
    if (view === 'viewquestions') {
      fetchAllQuestions();
    }
  }, [view]);

  const handleTemplateSelect = (template) => {
    setSurveyTemplateName(template);
  };

  const fetchTemplateDetails = async () => {
    setLoadingTemplateDetails(true);
    try {
      const res = await fetch('/api/surveys?action=template_details');
      const data = await res.json();
      if (res.ok) {
        setTemplateDetails(data.templates || {});
      }
    } catch {
      console.error('Failed to fetch template details');
    } finally {
      setLoadingTemplateDetails(false);
    }
  };

  const handleViewTemplate = (templateName) => {
    setViewingTemplate(templateName);
    setEditingTemplate(null);
  };

  const handleEditTemplate = (templateName) => {
    setEditingTemplate(templateName);
    setViewingTemplate(null);
    setEditedQuestions([...(templateDetails[templateName]?.questions || [])]);
  };

  const handleSaveTemplate = async () => {
    setSavingTemplate(true);
    try {
      const res = await fetch('/api/surveys', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'save_template',
          template_name: editingTemplate,
          questions: editedQuestions
        })
      });
      if (res.ok) {
        setTemplateDetails(prev => ({
          ...prev,
          [editingTemplate]: {
            ...prev[editingTemplate],
            questions: editedQuestions
          }
        }));
        setEditingTemplate(null);
        setEditedQuestions([]);
      }
    } catch {
      console.error('Failed to save template');
    } finally {
      setSavingTemplate(false);
    }
  };

  const handleEditedQuestionChange = (index, value) => {
    const updated = [...editedQuestions];
    updated[index] = value;
    setEditedQuestions(updated);
  };

  const handleAddEditedQuestion = () => {
    setEditedQuestions([...editedQuestions, '']);
  };

  const handleRemoveEditedQuestion = (index) => {
    if (editedQuestions.length <= 1) return;
    setEditedQuestions(editedQuestions.filter((_, i) => i !== index));
  };

  const generateFeedbackPdf = (testCode, studentName) => {
    const doc = new jsPDF();
    const responses = feedbackResponses.filter(r => r.test_code === testCode);
    const filtered = studentName ? responses.filter(r => r.student_name.toLowerCase().includes(studentName.toLowerCase())) : responses;
    if (filtered.length === 0) { alert('No responses found.'); return; }
    doc.setFontSize(16);
    doc.text(`AR INFOTEK - Feedback (${testCode})`, 14, 15);
    if (studentName) doc.text(`Student: ${studentName}`, 14, 22);
    let y = studentName ? 30 : 22;
    const grouped = {};
    filtered.forEach(r => {
      const key = r.student_register_id;
      if (!grouped[key]) grouped[key] = [];
      grouped[key].push(r);
    });
    Object.entries(grouped).forEach(([regId, resps]) => {
      if (y > 260) { doc.addPage(); y = 15; }
      doc.setFontSize(11);
      doc.setFont(undefined, 'bold');
      doc.text(`${resps[0].student_name} (${regId})`, 14, y);
      y += 7;
      resps.forEach(resp => {
        const qList = resp.questions || [];
        const ans = resp.answers || {};
        qList.forEach((q, i) => {
          if (y > 270) { doc.addPage(); y = 15; }
          const qText = typeof q === 'string' ? q : q.text;
          doc.setFontSize(9);
          doc.setFont(undefined, 'bold');
          doc.text(`Q${i + 1}: ${qText}`, 18, y);
          y += 5;
          doc.setFont(undefined, 'normal');
          doc.text(`Answer: ${ans[i] || 'Not answered'}`, 18, y);
          y += 6;
        });
        y += 3;
      });
      y += 5;
    });
    doc.save(`AR_INFOTEK_Feedback_${testCode}${studentName ? '_' + studentName : ''}.pdf`);
  };

  const generateReportPdf = (testCode, studentName) => {
    const doc = new jsPDF();
    const responses = feedbackResponses.filter(r => r.test_code === testCode);
    const filtered = studentName ? responses.filter(r => r.student_name.toLowerCase().includes(studentName.toLowerCase())) : responses;
    if (filtered.length === 0) { alert('No responses found.'); return; }
    doc.setFontSize(16);
    doc.text(`AR INFOTEK - Survey Report (${testCode})`, 14, 15);
    if (studentName) doc.text(`Student: ${studentName}`, 14, 22);
    doc.setFontSize(10);
    doc.text(`Total Responses: ${filtered.length}`, 14, studentName ? 29 : 22);
    let y = studentName ? 37 : 30;
    const questions = filtered[0].questions || [];
    questions.forEach((q, i) => {
      const qText = typeof q === 'string' ? q : q.text;
      const qOptions = typeof q === 'string' ? ['Very Poor', 'Poor', 'Average', 'Good', 'Excellent'] : (q.options || []);
      const ratings = filtered.map(r => r.answers?.[i]).filter(Boolean);
      const counts = {};
      qOptions.forEach(opt => { counts[opt] = 0; });
      ratings.forEach(r => { if (counts[r] !== undefined) counts[r]++; });
      if (y > 250) { doc.addPage(); y = 15; }
      doc.setFontSize(10);
      doc.setFont(undefined, 'bold');
      doc.text(`Q${i + 1}: ${qText}`, 14, y);
      y += 6;
      doc.setFont(undefined, 'normal');
      qOptions.forEach(opt => {
        doc.text(`  ${opt}: ${counts[opt]}`, 18, y);
        y += 5;
      });
      y += 3;
    });
    doc.save(`AR_INFOTEK_Report_${testCode}${studentName ? '_' + studentName : ''}.pdf`);
  };

  const generateDataAnalysis = (testCode) => {
    const responses = feedbackResponses.filter(r => r.test_code === testCode);
    if (responses.length === 0) { setDataAnalysisResult({ error: 'No responses found.' }); return; }
    const questions = responses[0].questions || [];
    const positives = [];
    const improvements = [];
    const negatives = [];
    questions.forEach((q, i) => {
      const qText = typeof q === 'string' ? q : q.text;
      const qOptions = typeof q === 'string' ? ['Very Poor', 'Poor', 'Average', 'Good', 'Excellent'] : (q.options || []);
      const ratings = responses.map(r => r.answers?.[i]).filter(Boolean);
      const counts = {};
      qOptions.forEach(opt => { counts[opt] = 0; });
      ratings.forEach(r => { if (counts[r] !== undefined) counts[r]++; });
      const total = ratings.length;
      const positiveOpts = qOptions.slice(Math.ceil(qOptions.length * 0.6));
      const negativeOpts = qOptions.slice(0, Math.floor(qOptions.length * 0.4));
      const posCount = positiveOpts.reduce((s, o) => s + (counts[o] || 0), 0);
      const negCount = negativeOpts.reduce((s, o) => s + (counts[o] || 0), 0);
      const posPct = total > 0 ? Math.round((posCount / total) * 100) : 0;
      const negPct = total > 0 ? Math.round((negCount / total) * 100) : 0;
      if (posPct >= 60) positives.push({ q: qText, pct: posPct });
      if (negPct >= 40) negatives.push({ q: qText, pct: negPct });
      if (posPct < 60 && negPct < 40) improvements.push({ q: qText, posPct, negPct });
    });
    setDataAnalysisResult({
      testCode,
      totalResponses: responses.length,
      positives,
      negatives,
      improvements,
      overallSentiment: positives.length > negatives.length ? 'Mostly Positive' : positives.length < negatives.length ? 'Needs Improvement' : 'Mixed'
    });
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
          subject: testSubject || testCourse || 'General',
          course: testCourse,
          level: testLevel,
          topics: testTopics.split(',').map(t => t.trim()).filter(Boolean),
          questions,
        }),
      });
      const data = await res.json();
      if (res.ok) {
        if (returnUrl) {
          window.location.href = returnUrl;
          return;
        }
        setMessage(`Success! Test "${testCode.toUpperCase()}" created with ${questions.length} questions.`);
        setTestTitle('');
        setTestCode('');
        setTestDuration(30);
        setTestSubject('');
        setTestCourse('');
        setTestLevel('');
        setTestTopics('');
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

  const deleteTest = async (test_code) => {
    if (!confirm(`Are you sure you want to delete test "${test_code}" and all its data?`)) return;
    try {
      const res = await fetch('/api/admin', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ test_code })
      });
      if (res.ok) fetchAllQuestions();
    } catch {
      alert('Failed to delete test');
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
                className="p-2 rounded-lg hover:bg-slate-100 transition text-slate-600 relative"
              >
                <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                  <circle cx="12" cy="5" r="2" />
                  <circle cx="12" cy="12" r="2" />
                  <circle cx="12" cy="19" r="2" />
                </svg>
                {flags.length > 0 && (
                  <span className="absolute -top-1.5 -right-1.5 min-w-5 h-5 px-1 rounded-full bg-red-500 text-white text-[10px] font-black flex items-center justify-center">
                    {flags.length}
                  </span>
                )}
              </button>
              {menuOpen && (
                <div className="absolute right-0 top-12 bg-white rounded-xl shadow-xl border border-slate-100 py-2 w-56 z-10">
                  <button
                    onClick={() => { setView('viewquestions'); setMenuOpen(false); }}
                    className="w-full text-left px-4 py-2.5 text-sm font-bold text-slate-400 hover:text-primary transition-colors duration-200"
                    onMouseEnter={(e) => e.target.style.color = '#1e5aa8'}
                    onMouseLeave={(e) => e.target.style.color = ''}
                  >
                    View Questions
                  </button>
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
                    onClick={() => { setView('tabflags'); setMenuOpen(false); }}
                    className="w-full text-left px-4 py-2.5 text-sm font-bold text-slate-400 hover:text-primary transition-colors duration-200"
                    onMouseEnter={(e) => e.target.style.color = '#1e5aa8'}
                    onMouseLeave={(e) => e.target.style.color = ''}
                  >
                    Tab Flags
                    {flags.length > 0 && (
                      <span className="inline-flex items-center justify-center ml-2 min-w-5 h-5 px-1 rounded-full bg-red-500 text-white text-[10px] font-black align-middle">
                        {flags.length}
                      </span>
                    )}
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

        {view === 'viewquestions' && (
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
              <h1 className="text-2xl font-black text-slate-800">View Questions</h1>
              <button
                onClick={fetchAllQuestions}
                className="px-3 py-2 rounded-lg text-xs font-bold bg-primary text-white hover:bg-primary-dark transition"
              >
                Refresh
              </button>
            </div>

            {loadingQuestions ? (
              <div className="text-center py-10">
                <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full mx-auto" />
                <p className="text-sm text-slate-500 mt-3">Loading...</p>
              </div>
            ) : allTestsQuestions.length === 0 ? (
              <div className="text-center py-10 text-slate-500">
                <p className="text-sm">No tests found.</p>
              </div>
            ) : (
              <div className="space-y-3 max-h-[65vh] overflow-y-auto">
                {allTestsQuestions.map((test) => {
                  const isExpanded = expandedQuestionTest === test.test_code;
                  return (
                    <div key={test.test_code} className="bg-slate-50 rounded-xl overflow-hidden border border-slate-100">
                      <div className="flex items-center justify-between px-4 py-3">
                        <button
                          onClick={() => setExpandedQuestionTest(isExpanded ? null : test.test_code)}
                          className="flex items-center gap-3 flex-1 text-left hover:bg-slate-100 transition rounded-lg px-2 py-1 -ml-2"
                        >
                          <span className="bg-primary text-white text-xs font-bold rounded-lg px-2.5 py-1 font-mono">{test.test_code}</span>
                          <div className="flex-1">
                            <span className="text-sm font-bold text-slate-800">{test.title}</span>
                            <span className="text-xs text-slate-400 ml-2">({test.questions.length} questions)</span>
                          </div>
                          <svg className={`w-5 h-5 text-slate-400 transition-transform ${isExpanded ? 'rotate-180' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
                          </svg>
                        </button>
                        <button
                          onClick={() => deleteTest(test.test_code)}
                          className="ml-2 px-3 py-1.5 rounded-lg text-xs font-bold bg-red-500 text-white hover:bg-red-600 transition"
                        >
                          Delete
                        </button>
                      </div>

                      {isExpanded && (
                        <div className="border-t border-slate-200 p-4 space-y-3">
                          {test.questions.map((q, qi) => {
                            const options = typeof q.options === 'string' ? JSON.parse(q.options) : q.options;
                            return (
                              <div key={q.id} className="bg-white rounded-lg p-3 border border-slate-100">
                                <div className="flex items-start gap-2">
                                  <span className="font-bold text-primary text-sm shrink-0">Q{qi + 1}.</span>
                                  <p className="text-sm text-slate-700 font-medium">{q.question_text}</p>
                                </div>
                                <div className="mt-2 ml-6 grid grid-cols-1 sm:grid-cols-2 gap-1.5">
                                  {options.map((opt, oi) => (
                                    <div
                                      key={oi}
                                      className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm ${
                                        q.correct_answer === oi
                                          ? 'bg-green-100 text-green-700 font-bold border border-green-200'
                                          : 'bg-slate-50 text-slate-600'
                                      }`}
                                    >
                                      <span className="font-mono text-xs">{String.fromCharCode(65 + oi)}.</span>
                                      <span>{opt}</span>
                                      {q.correct_answer === oi && (
                                        <svg className="w-3.5 h-3.5 text-green-600 ml-auto shrink-0" fill="currentColor" viewBox="0 0 20 20">
                                          <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                                        </svg>
                                      )}
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
                  {tests.filter(t => scores.some(s => s.test_code === t.test_code)).map((t) => (
                    <option key={t.id} value={t.test_code}>{t.test_code} - {t.title}</option>
                  ))}
                </select>
              {selectedTest !== 'all' && (
                <button onClick={() => deleteScore('by_test', null, selectedTest)} className="px-3 py-2 rounded-lg text-xs font-bold bg-red-500 text-white hover:bg-red-600 transition">
                  Delete ({selectedTest})
                </button>
              )}
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

        {view === 'tabflags' && (
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
              <h1 className="text-2xl font-black text-slate-800">Tab Flags</h1>
              <button
                onClick={fetchFlags}
                className="px-3 py-2 rounded-lg text-xs font-bold bg-primary text-white hover:bg-primary-dark transition"
              >
                Refresh
              </button>
            </div>

            {flags.length === 0 ? (
              <div className="text-center py-10 text-slate-500">
                <p className="text-sm">No flagged attempts right now.</p>
              </div>
            ) : (
              <div className="space-y-3 max-h-[65vh] overflow-y-auto">
                {flags.map((flag) => (
                  <div key={flag.id} className="bg-slate-50 rounded-xl border border-slate-100 p-4 flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg bg-red-100 flex items-center justify-center shrink-0">
                      <svg className="w-5 h-5 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z" />
                      </svg>
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="bg-primary text-white text-xs font-bold rounded-lg px-2.5 py-1 font-mono shrink-0">{flag.test_code}</span>
                        <span className="text-sm font-bold text-slate-800 truncate">{flag.student_name}</span>
                      </div>
                      <p className="text-xs text-slate-500 mt-1">
                        Reg ID: <span className="font-mono">{flag.student_register_id}</span> &middot; {flag.reason} &middot; {new Date(flag.created_at).toLocaleString()}
                      </p>
                    </div>
                    <button
                      onClick={() => approveFlag(flag.id)}
                      className="shrink-0 px-4 py-2 rounded-lg text-xs font-bold bg-green-500 text-white hover:bg-green-600 transition"
                    >
                      Continue
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {view === 'feedback' && (
          <div className="mb-6">
            <div className="flex items-center justify-between mb-4">
              <button
                onClick={() => { setView('create'); setSelectedFeedbackTest('all'); setExpandedStudent(null); setShowSurveyReport(false); setReportData(null); }}
                className="flex items-center gap-2 text-sm font-bold text-slate-600 hover:text-primary transition"
              >
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
                </svg>
                Back
              </button>
              <h1 className="text-2xl font-black text-slate-800">Survey Feedback</h1>
              <div className="flex gap-2">
                <button
                  onClick={() => setShowFeedbackPdfModal(true)}
                  className="px-3 py-2 rounded-lg text-xs font-bold bg-green-600 text-white hover:bg-green-700 transition"
                >
                  Download PDF
                </button>
                <button
                  onClick={() => setShowDataAnalysis(!showDataAnalysis)}
                  className="px-3 py-2 rounded-lg text-xs font-bold bg-orange-600 text-white hover:bg-orange-700 transition"
                >
                  {showDataAnalysis ? 'Close Analysis' : 'Data Analysis'}
                </button>
                <button
                  onClick={() => setShowSurveyReport(!showSurveyReport)}
                  className="px-3 py-2 rounded-lg text-xs font-bold bg-primary text-white hover:bg-primary-dark transition"
                >
                  {showSurveyReport ? 'Close Report' : 'Survey Report'}
                </button>
              </div>
            </div>

            {showSurveyReport && (
              <div className="bg-slate-50 rounded-xl p-4 mb-4">
                <div className="flex items-center gap-3">
                  <input
                    type="text"
                    value={reportTestCode}
                    onChange={(e) => setReportTestCode(e.target.value.toUpperCase())}
                    placeholder="Enter test code (e.g. APT01)"
                    className="flex-1 px-4 py-2.5 rounded-lg border border-slate-200 text-sm font-mono uppercase focus:outline-none focus:ring-2 focus:ring-primary/30"
                  />
                  <button
                    onClick={() => {
                      const responses = feedbackResponses.filter(r => r.test_code === reportTestCode);
                      if (responses.length === 0) {
                        setReportData({ error: 'No responses found for this test code.' });
                        return;
                      }
                      const questions = responses[0].questions || [];
                      const stats = questions.map((q, i) => {
                        const qObj = typeof q === 'string' ? { text: q, options: ['Very Poor', 'Poor', 'Average', 'Good', 'Excellent'] } : q;
                        const qText = qObj.text || q;
                        const qOptions = qObj.options || ['Very Poor', 'Poor', 'Average', 'Good', 'Excellent'];
                        const ratings = responses.map(r => {
                          const ans = r.answers || {};
                          return ans[i] || null;
                        }).filter(Boolean);
                        const counts = {};
                        qOptions.forEach(opt => { counts[opt] = 0; });
                        ratings.forEach(r => { if (counts[r] !== undefined) counts[r]++; });
                        const total = ratings.length;
                        const avg = total > 0 ? (ratings.reduce((sum, r) => {
                          const idx = qOptions.indexOf(r);
                          return sum + (idx >= 0 ? idx + 1 : 0);
                        }, 0) / total).toFixed(1) : 0;
                        return { question: qText, options: qOptions, counts, total, avg };
                      });
                      setReportData({ testCode: reportTestCode, totalResponses: responses.length, stats });
                    }}
                    className="px-4 py-2.5 rounded-lg font-bold text-sm bg-accent text-white hover:bg-orange-600 transition"
                  >
                    Generate
                  </button>
                </div>

                {reportData && reportData.error && (
                  <p className="text-sm text-red-500 mt-3">{reportData.error}</p>
                )}

                {reportData && reportData.stats && (
                  <div className="mt-4 space-y-3 max-h-[50vh] overflow-y-auto">
                    <div className="flex items-center gap-4 mb-3">
                      <span className="text-sm font-bold text-slate-700">Test Code: <span className="text-primary">{reportData.testCode}</span></span>
                      <span className="text-sm font-bold text-slate-700">Total Responses: <span className="text-primary">{reportData.totalResponses}</span></span>
                    </div>
                    {reportData.stats.map((s, i) => (
                      <div key={i} className="bg-white rounded-lg p-3">
                        <div className="text-sm font-bold text-slate-700 mb-2">Q{i + 1}. {s.question}</div>
                        <div className={`grid gap-2 text-center ${s.options.length <= 5 ? 'grid-cols-5' : 'grid-cols-11'}`}>
                          {s.options.map((label) => (
                            <div key={label} className="text-center">
                              <div className="text-xs font-bold text-slate-600">{s.counts[label] || 0}</div>
                              <div className="text-[10px] text-slate-400">{label}</div>
                            </div>
                          ))}
                        </div>
                        <div className="mt-2 flex items-center gap-2">
                          <div className="flex-1 bg-slate-100 rounded-full h-2">
                            <div className="bg-gradient-to-r from-primary to-accent h-2 rounded-full" style={{ width: `${(s.avg / s.options.length) * 100}%` }} />
                          </div>
                          <span className="text-xs font-bold text-primary">{s.avg}/{s.options.length}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
                {reportData && reportData.stats && (
                  <button
                    onClick={() => setShowReportPdfModal(true)}
                    className="mt-3 w-full py-2.5 rounded-lg font-bold text-sm bg-green-600 text-white hover:bg-green-700 transition"
                  >
                    Download Report PDF
                  </button>
                )}
              </div>
            )}

            {showDataAnalysis && (
              <div className="bg-slate-50 rounded-xl p-4 mb-4">
                <div className="flex items-center gap-3 mb-4">
                  <input
                    type="text"
                    value={dataAnalysisTestCode}
                    onChange={(e) => setDataAnalysisTestCode(e.target.value.toUpperCase())}
                    placeholder="Enter test code (e.g. APT01)"
                    className="flex-1 px-4 py-2.5 rounded-lg border border-slate-200 text-sm font-mono uppercase focus:outline-none focus:ring-2 focus:ring-primary/30"
                  />
                  <button
                    onClick={() => generateDataAnalysis(dataAnalysisTestCode)}
                    className="px-4 py-2.5 rounded-lg font-bold text-sm bg-orange-600 text-white hover:bg-orange-700 transition"
                  >
                    Generate
                  </button>
                </div>
                {dataAnalysisResult && dataAnalysisResult.error && (
                  <p className="text-sm text-red-500">{dataAnalysisResult.error}</p>
                )}
                {dataAnalysisResult && !dataAnalysisResult.error && (
                  <div className="space-y-4">
                    <div className="flex items-center gap-4">
                      <span className="text-sm font-bold text-slate-700">Test Code: <span className="text-primary">{dataAnalysisResult.testCode}</span></span>
                      <span className="text-sm font-bold text-slate-700">Responses: <span className="text-primary">{dataAnalysisResult.totalResponses}</span></span>
                      <span className={`text-sm font-bold px-3 py-1 rounded-full ${dataAnalysisResult.overallSentiment === 'Mostly Positive' ? 'bg-blue-100 text-blue-700' : dataAnalysisResult.overallSentiment === 'Needs Improvement' ? 'bg-red-100 text-red-600' : 'bg-yellow-100 text-yellow-700'}`}>
                        {dataAnalysisResult.overallSentiment}
                      </span>
                    </div>
                    {dataAnalysisResult.positives.length > 0 && (
                      <div className="bg-blue-50 rounded-lg p-4 border border-blue-200">
                        <h4 className="text-sm font-bold text-blue-700 mb-2">Strengths & Positives</h4>
                        {dataAnalysisResult.positives.map((p, i) => (
                          <div key={i} className="flex items-center gap-2 text-sm text-blue-600 mb-1">
                            <svg className="w-4 h-4 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" /></svg>
                            <span>{p.q} <span className="font-bold">({p.pct}% positive)</span></span>
                          </div>
                        ))}
                      </div>
                    )}
                    {dataAnalysisResult.negatives.length > 0 && (
                      <div className="bg-red-50 rounded-lg p-4 border border-red-200">
                        <h4 className="text-sm font-bold text-red-700 mb-2">Areas of Concern</h4>
                        {dataAnalysisResult.negatives.map((n, i) => (
                          <div key={i} className="flex items-center gap-2 text-sm text-red-600 mb-1">
                            <svg className="w-4 h-4 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" /></svg>
                            <span>{n.q} <span className="font-bold">({n.pct}% negative)</span></span>
                          </div>
                        ))}
                      </div>
                    )}
                    {dataAnalysisResult.improvements.length > 0 && (
                      <div className="bg-yellow-50 rounded-lg p-4 border border-yellow-200">
                        <h4 className="text-sm font-bold text-yellow-700 mb-2">Fields for Improvement</h4>
                        {dataAnalysisResult.improvements.map((imp, i) => (
                          <div key={i} className="text-sm text-yellow-600 mb-1">
                            {imp.q} <span className="font-bold">(Positive: {imp.posPct}%, Negative: {imp.negPct}%)</span>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}
              </div>
            )}

            <div className="flex flex-wrap items-center gap-3 mb-4">
              <div className="w-full sm:w-auto">
                <label className="block text-sm font-bold text-slate-600 mb-1.5">Select Test Code</label>
                <div className="relative">
                  <select
                    value={selectedFeedbackTest}
                    onChange={(e) => { setSelectedFeedbackTest(e.target.value); setExpandedStudent(null); }}
                    className="w-full sm:w-64 px-4 py-2.5 pr-10 rounded-xl border-2 border-slate-200 text-sm font-semibold text-slate-700 bg-white focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition appearance-none cursor-pointer hover:border-slate-300"
                  >
                    <option value="all">-- Choose Test Code --</option>
                    {[...new Set(feedbackResponses.map(r => r.test_code))].map(tc => (
                      <option key={tc} value={tc}>{tc}</option>
                    ))}
                  </select>
                  <svg className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
                  </svg>
                </div>
              </div>
              {selectedFeedbackTest !== 'all' && (
                <button onClick={() => deleteFeedback('by_test', null, selectedFeedbackTest)} className="px-3 py-2.5 rounded-xl text-xs font-bold bg-red-500 text-white hover:bg-red-600 transition mt-6">
                  Delete ({selectedFeedbackTest})
                </button>
              )}
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
                                  <div className="flex flex-wrap items-center gap-2 mb-2">
                                    <span className="text-xs text-slate-500">Template: {resp.template_name}</span>
                                    <span className="text-[11px] text-slate-400">{new Date(resp.submitted_at).toLocaleDateString()}</span>
                                  </div>
                                  <div className="space-y-1.5">
                                    {qList.map((q, i) => {
                                      const qText = typeof q === 'string' ? q : q.text;
                                      const qOptions = typeof q === 'string' ? null : q.options;
                                      return (
                                        <div key={i} className="flex items-start gap-2 text-sm">
                                          <span className="font-bold text-primary shrink-0">Q{i + 1}.</span>
                                          <div className="flex-1">
                                            <p className="text-slate-700 font-medium">{qText}</p>
                                            {qOptions && (
                                              <div className="mt-1 flex flex-wrap gap-1">
                                                {qOptions.map((opt) => (
                                                  <span key={opt} className={`px-1.5 py-0.5 rounded text-[10px] font-bold ${ans[i] === opt ? 'bg-green-100 text-green-700' : 'bg-slate-100 text-slate-500'}`}>{opt}</span>
                                                ))}
                                              </div>
                                            )}
                                            <p className="text-green-600 font-bold mt-0.5">Answer: {ans[i] || 'Not answered'}</p>
                                          </div>
                                        </div>
                                      );
                                    })}
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
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-600 mb-1">Course / Subject</label>
                  <input
                    type="text"
                    value={testCourse}
                    onChange={(e) => setTestCourse(e.target.value)}
                    placeholder="e.g. python"
                    className="w-full px-3 sm:px-3.5 py-2 sm:py-2.5 rounded-lg border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-600 mb-1">Level</label>
                  <input
                    type="text"
                    value={testLevel}
                    onChange={(e) => setTestLevel(e.target.value)}
                    placeholder="e.g. Beginner"
                    className="w-full px-3 sm:px-3.5 py-2 sm:py-2.5 rounded-lg border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
                  />
                </div>
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-600 mb-1">Topics <span className="text-slate-400 font-normal">(comma separated)</span></label>
                <input
                  type="text"
                  value={testTopics}
                  onChange={(e) => setTestTopics(e.target.value)}
                  placeholder="e.g. Arrays, Loops, Functions"
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
                    <button
                      type="button"
                      onClick={() => { setShowTemplateModal(true); fetchTemplateDetails(); }}
                      className="mt-3 px-4 py-2 text-sm font-bold text-primary hover:text-primary/80 border border-primary/30 rounded-lg hover:bg-primary/5 transition"
                    >
                      View Templates
                    </button>
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

      {showTemplateModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm overflow-y-auto p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full mx-auto my-auto max-h-[85vh] flex flex-col">
            <div className="flex items-center justify-between p-5 border-b border-slate-200">
              <h2 className="text-xl font-black text-slate-800">
                {editingTemplate ? `Editing: ${editingTemplate}` : viewingTemplate ? viewingTemplate : 'Survey Templates'}
              </h2>
              <button
                onClick={() => { setShowTemplateModal(false); setViewingTemplate(null); setEditingTemplate(null); }}
                className="w-8 h-8 rounded-full hover:bg-slate-100 flex items-center justify-center transition"
              >
                <svg className="w-5 h-5 text-slate-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <div className="overflow-y-auto flex-1 p-5">
              {loadingTemplateDetails ? (
                <div className="text-center py-10">
                  <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full mx-auto" />
                  <p className="text-sm text-slate-500 mt-3">Loading templates...</p>
                </div>
              ) : viewingTemplate ? (
                <div>
                  <h3 className="text-lg font-bold text-slate-800 mb-1">{templateDetails[viewingTemplate]?.name}</h3>
                  <p className="text-xs text-slate-400 mb-4">{templateDetails[viewingTemplate]?.questions?.length || 0} Questions</p>
                  <div className="space-y-3">
                    {templateDetails[viewingTemplate]?.questions?.map((q, i) => {
                      const qText = typeof q === 'string' ? q : q.text;
                      const qOptions = typeof q === 'string' ? null : q.options;
                      return (
                        <div key={i} className="bg-slate-50 rounded-xl p-4 border border-slate-200">
                          <div className="flex items-start gap-3">
                            <span className="w-7 h-7 rounded-full bg-primary text-white text-xs font-bold flex items-center justify-center shrink-0 mt-0.5">
                              {i + 1}
                            </span>
                            <div className="flex-1">
                              <p className="text-sm text-slate-700 leading-relaxed">{qText}</p>
                              {qOptions && (
                                <div className="mt-2 flex flex-wrap gap-1.5">
                                  {qOptions.map((opt) => (
                                    <span key={opt} className="px-2 py-0.5 rounded-full bg-primary/10 text-primary text-[10px] font-bold">{opt}</span>
                                  ))}
                                </div>
                              )}
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                  <div className="flex gap-3 mt-6">
                    <button
                      onClick={() => setViewingTemplate(null)}
                      className="flex-1 py-2.5 rounded-lg font-bold text-sm border-2 border-slate-200 text-slate-600 hover:bg-slate-50 transition"
                    >
                      Back to Templates
                    </button>
                    <button
                      onClick={() => handleEditTemplate(viewingTemplate)}
                      className="flex-1 py-2.5 rounded-lg font-bold text-sm bg-gradient-to-r from-accent to-orange-600 text-white transition"
                    >
                      Edit Template
                    </button>
                  </div>
                </div>
              ) : editingTemplate ? (
                <div>
                  <h3 className="text-lg font-bold text-slate-800 mb-1">{templateDetails[editingTemplate]?.name}</h3>
                  <p className="text-xs text-slate-400 mb-4">{editedQuestions.length} Questions</p>
                  <div className="space-y-3">
                    {editedQuestions.map((q, i) => {
                      const qText = typeof q === 'string' ? q : q.text;
                      const qOptions = typeof q === 'string' ? null : q.options;
                      return (
                        <div key={i} className="bg-slate-50 rounded-xl p-4 border border-slate-200">
                          <div className="flex items-start gap-3">
                            <span className="w-7 h-7 rounded-full bg-primary text-white text-xs font-bold flex items-center justify-center shrink-0 mt-0.5">
                              {i + 1}
                            </span>
                            <div className="flex-1 flex gap-2">
                              <input
                                type="text"
                                value={qText}
                                onChange={(e) => handleEditedQuestionChange(i, e.target.value)}
                                className="flex-1 px-3 py-2 rounded-lg border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
                              />
                              <button
                                onClick={() => handleRemoveEditedQuestion(i)}
                                className="w-8 h-8 rounded-lg hover:bg-red-50 flex items-center justify-center text-red-400 hover:text-red-600 transition shrink-0"
                              >
                                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                  <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                </svg>
                              </button>
                            </div>
                          </div>
                          {qOptions && (
                            <div className="mt-2 ml-10 flex flex-wrap gap-1.5">
                              {qOptions.map((opt) => (
                                <span key={opt} className="px-2 py-0.5 rounded-full bg-primary/10 text-primary text-[10px] font-bold">{opt}</span>
                              ))}
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                  <button
                    onClick={handleAddEditedQuestion}
                    className="mt-3 w-full py-2.5 rounded-lg border-2 border-dashed border-slate-300 text-sm font-bold text-slate-500 hover:border-primary hover:text-primary transition"
                  >
                    + Add Question
                  </button>
                  <div className="flex gap-3 mt-6">
                    <button
                      onClick={() => { setEditingTemplate(null); setEditedQuestions([]); }}
                      className="flex-1 py-2.5 rounded-lg font-bold text-sm border-2 border-slate-200 text-slate-600 hover:bg-slate-50 transition"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={handleSaveTemplate}
                      disabled={savingTemplate}
                      className="flex-1 py-2.5 rounded-lg font-bold text-sm bg-gradient-to-r from-accent to-orange-600 text-white transition disabled:opacity-50"
                    >
                      {savingTemplate ? 'Saving...' : 'Save Changes'}
                    </button>
                  </div>
                </div>
              ) : (
                <div className="space-y-3">
                  {Object.entries(templateDetails).map(([key, tpl]) => (
                    <div key={key} className="bg-slate-50 rounded-xl p-4 border border-slate-200 flex items-center justify-between">
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-bold text-slate-800">{key}</p>
                        <p className="text-xs text-slate-500 truncate">{tpl.name} &middot; {tpl.questions?.length || 0} questions</p>
                      </div>
                      <div className="flex gap-2 ml-3">
                        <button
                          onClick={() => handleViewTemplate(key)}
                          className="px-3 py-1.5 rounded-lg text-xs font-bold bg-primary/10 text-primary hover:bg-primary/20 transition"
                        >
                          View
                        </button>
                        <button
                          onClick={() => handleEditTemplate(key)}
                          className="px-3 py-1.5 rounded-lg text-xs font-bold bg-gradient-to-r from-accent to-orange-600 text-white transition"
                        >
                          Edit
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {showFeedbackPdfModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-sm w-full p-6">
            <h3 className="text-lg font-black text-slate-800 mb-4">Download Feedback PDF</h3>
            <p className="text-sm text-slate-500 mb-4">Choose what to download for <span className="font-bold text-primary">{selectedFeedbackTest}</span></p>
            <div className="space-y-3">
              <button
                onClick={() => { generateFeedbackPdf(selectedFeedbackTest, ''); setShowFeedbackPdfModal(false); }}
                className="w-full py-3 rounded-xl font-bold text-sm bg-primary text-white hover:bg-primary-dark transition"
              >
                Full Test Code PDF
              </button>
              <div className="border-t border-slate-200 pt-3">
                <label className="block text-xs font-bold text-slate-600 mb-1">Or enter student name</label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={feedbackPdfStudent}
                    onChange={(e) => setFeedbackPdfStudent(e.target.value)}
                    placeholder="Student name"
                    className="flex-1 px-3 py-2 rounded-lg border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
                  />
                  <button
                    onClick={() => { generateFeedbackPdf(selectedFeedbackTest, feedbackPdfStudent); setShowFeedbackPdfModal(false); setFeedbackPdfStudent(''); }}
                    className="px-4 py-2 rounded-lg font-bold text-sm bg-gradient-to-r from-accent to-orange-600 text-white transition"
                  >
                    Download
                  </button>
                </div>
              </div>
            </div>
            <button
              onClick={() => { setShowFeedbackPdfModal(false); setFeedbackPdfStudent(''); }}
              className="w-full mt-4 py-2 rounded-lg font-bold text-sm border-2 border-slate-200 text-slate-600 hover:bg-slate-50 transition"
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      {showReportPdfModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-sm w-full p-6">
            <h3 className="text-lg font-black text-slate-800 mb-4">Download Report PDF</h3>
            <p className="text-sm text-slate-500 mb-4">Choose what to download for <span className="font-bold text-primary">{reportTestCode}</span></p>
            <div className="space-y-3">
              <button
                onClick={() => { generateReportPdf(reportTestCode, ''); setShowReportPdfModal(false); }}
                className="w-full py-3 rounded-xl font-bold text-sm bg-primary text-white hover:bg-primary-dark transition"
              >
                Full Test Code Report
              </button>
              <div className="border-t border-slate-200 pt-3">
                <label className="block text-xs font-bold text-slate-600 mb-1">Or enter student name</label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={reportPdfStudent}
                    onChange={(e) => setReportPdfStudent(e.target.value)}
                    placeholder="Student name"
                    className="flex-1 px-3 py-2 rounded-lg border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
                  />
                  <button
                    onClick={() => { generateReportPdf(reportTestCode, reportPdfStudent); setShowReportPdfModal(false); setReportPdfStudent(''); }}
                    className="px-4 py-2 rounded-lg font-bold text-sm bg-gradient-to-r from-accent to-orange-600 text-white transition"
                  >
                    Download
                  </button>
                </div>
              </div>
            </div>
            <button
              onClick={() => { setShowReportPdfModal(false); setReportPdfStudent(''); }}
              className="w-full mt-4 py-2 rounded-lg font-bold text-sm border-2 border-slate-200 text-slate-600 hover:bg-slate-50 transition"
            >
              Cancel
            </button>
          </div>
        </div>
      )}

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
