import React, { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { API_BASE_URL } from '../config/api';

const getId = (item) => item?.id ?? item?.ID;
const getClassName = (item) => item?.class_name ?? item?.ClassName ?? item?.name ?? '';
const getStudentName = (item) => item?.full_name ?? item?.FullName ?? item?.name ?? '';
const getExamLabel = (exam) => {
  const type = exam?.exam_type ?? exam?.ExamType ?? 'Exam';
  const month = exam?.month ?? exam?.Month ?? '';
  const year = exam?.year ?? exam?.Year ?? '';
  const term = exam?.term ?? exam?.Term ?? '';
  return `${year}${month ? ` - ${month}` : ''} - ${term} (${type})`.toUpperCase();
};

const sortClasses = (items) =>
  [...items].sort((a, b) => {
    const aName = getClassName(a).toLowerCase();
    const bName = getClassName(b).toLowerCase();
    const aNum = Number(aName.match(/\d+/)?.[0] || 999);
    const bNum = Number(bName.match(/\d+/)?.[0] || 999);
    if (aNum !== bNum) return aNum - bNum;
    return aName.localeCompare(bName);
  });

const behaviorsList = [
  "Kufanya kazi kwa bidii na maarifa",
  "Uhuru na kiasi cha kazi aliyoifanya",
  "Kupenda kuthamini na kuheshimu kazi",
  "Uangalifu wa mali ya umma",
  "Uelewano na ushirikiano",
  "Heshima kwa wazee, walimu na wanafunzi wengine",
  "Wenzake kufuata ushauri wake na kuvutiwa naye",
  "Usafi binafsi",
  "Uaminifu",
  "Kushiriki katika michezo na shughuli za utamaduni"
];

const StudentReport = () => {
  const { user } = useAuth();
  const token = user?.token || localStorage.getItem('token') || localStorage.getItem('jwt') || '';
  const headers = useMemo(
    () => ({ Authorization: token.startsWith('Bearer ') ? token : `Bearer ${token}` }),
    [token]
  );

  const [classes, setClasses] = useState([]);
  const [students, setStudents] = useState([]);
  const [exams, setExams] = useState([]);
  const [selectedClass, setSelectedClass] = useState('');
  const [selectedStudent, setSelectedStudent] = useState('all');
  const [selectedExam, setSelectedExam] = useState('');
  const [reports, setReports] = useState([]);
  const [annualProgress, setAnnualProgress] = useState(null);
  const [loading, setLoading] = useState(false);
  const [loadingOptions, setLoadingOptions] = useState(true);
  const [loadingProgress, setLoadingProgress] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    const loadOptions = async () => {
      if (!token) {
        setError('Please log in again to view reports.');
        setLoadingOptions(false);
        return;
      }

      try {
        const [classRes, examRes] = await Promise.all([
          fetch(`${API_BASE_URL}/admin/classes`, { headers }),
          fetch(`${API_BASE_URL}/admin/exams`, { headers }),
        ]);

        const classData = classRes.ok ? await classRes.json() : {};
        const examData = examRes.ok ? await examRes.json() : {};
        setClasses(sortClasses(classData.data || classData || []));
        setExams(examData.data || examData || []);

        if (!classRes.ok || !examRes.ok) {
          setError('Failed to fetch classes or exams.');
        }
      } catch (err) {
        console.error(err);
        setError('Network error while loading filter options.');
      } finally {
        setLoadingOptions(false);
      }
    };

    loadOptions();
  }, [token, headers]);

  useEffect(() => {
    if (!selectedClass) {
      setStudents([]);
      setSelectedStudent('all');
      return;
    }

    const loadStudents = async () => {
      try {
        const res = await fetch(
          `${API_BASE_URL}/admin/students?class_id=${encodeURIComponent(selectedClass)}`,
          { headers }
        );
        const data = res.ok ? await res.json() : {};
        const list = data.data || data || [];
        setStudents(
          [...list].sort((a, b) =>
            getStudentName(a).toLowerCase().localeCompare(getStudentName(b).toLowerCase())
          )
        );
      } catch (err) {
        console.error(err);
        setStudents([]);
      }
    };

    loadStudents();
  }, [selectedClass, headers]);

  const filteredExams = useMemo(() => {
    return [...exams].sort((a, b) => {
      const ay = Number(a?.year ?? a?.Year ?? 0);
      const by = Number(b?.year ?? b?.Year ?? 0);
      if (ay !== by) return by - ay;
      return Number(getId(b) || 0) - Number(getId(a) || 0);
    });
  }, [exams]);

  const handleGenerateReport = async (event) => {
    event.preventDefault();
    if (!selectedClass || !selectedExam) {
      setError('Please select Class and Examination.');
      return;
    }

    setLoading(true);
    setError('');
    setReports([]);
    setAnnualProgress(null);

    try {
      const url = new URL(`${API_BASE_URL}/admin/reports`);
      url.searchParams.set('class_id', selectedClass);
      url.searchParams.set('exam_id', selectedExam);
      url.searchParams.set('student_id', selectedStudent);

      const res = await fetch(url.toString(), { headers });
      const data = await res.json().catch(() => ({}));
      if (!res.ok || data.status !== 'success') {
        throw new Error(data.message || 'Failed to generate student reports.');
      }
      setReports(data.data || []);

      if ((data.data || []).length === 0) {
        setError('No students found for the selected class and exam.');
      }
    } catch (err) {
      console.error(err);
      setError(err.message || 'Failed to generate report.');
    } finally {
      setLoading(false);
    }
  };

  const loadAnnualProgress = async (report) => {
    if (!report?.id || !report?.year) return;
    setLoadingProgress(true);
    try {
      const url = new URL(`${API_BASE_URL}/admin/reports/annual-progress`);
      url.searchParams.set('student_id', report.id);
      url.searchParams.set('year', report.year);
      const res = await fetch(url.toString(), { headers });
      const data = await res.json().catch(() => ({}));
      if (!res.ok || data.status !== 'success') {
        throw new Error(data.message || 'Failed to load annual progress.');
      }
      setAnnualProgress(data.data || null);
    } catch (err) {
      console.error(err);
      setAnnualProgress(null);
    } finally {
      setLoadingProgress(false);
    }
  };

  const renderProgressGraph = () => {
    if (!annualProgress || !annualProgress.exams?.length) {
      return (
        <div className="rounded-xl border border-slate-200 bg-slate-50 p-5 text-sm text-slate-500 font-sans">
          No exam records found for this student in {annualProgress?.year || 'the selected year'}.
        </div>
      );
    }

    const width = 760;
    const height = 300;
    const left = 55;
    const right = 25;
    const top = 25;
    const bottom = 65;
    const chartW = width - left - right;
    const chartH = height - top - bottom;
    const max = 100;
    const points = annualProgress.exams.map((exam, index) => {
      const x = annualProgress.exams.length === 1
        ? left + chartW / 2
        : left + (index / (annualProgress.exams.length - 1)) * chartW;
      const y = top + chartH - (Math.min(Number(exam.average) || 0, max) / max) * chartH;
      return { ...exam, x, y };
    });

    const line = points.map((p) => `${p.x},${p.y}`).join(' ');

    return (
      <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm font-sans">
        <div className="flex flex-wrap justify-between items-start gap-3 mb-4">
          <div>
            <h3 className="font-bold text-slate-800">Annual Academic Progress</h3>
            <p className="text-xs text-slate-500 mt-1">
              Average performance across examinations in year {annualProgress.year}.
            </p>
          </div>
          <span className="text-xs font-semibold bg-emerald-50 text-emerald-700 px-3 py-1.5 rounded-full">
            {annualProgress.full_name}
          </span>
        </div>

        <div className="overflow-x-auto">
          <svg viewBox={`0 0 ${width} ${height}`} className="w-full min-w-[650px] h-[300px]" role="img">
            {[0, 25, 50, 75, 100].map((value) => {
              const y = top + chartH - (value / max) * chartH;
              return (
                <g key={value}>
                  <line x1={left} y1={y} x2={width - right} y2={y} stroke="currentColor" className="text-slate-200" strokeWidth="1" />
                  <text x={left - 10} y={y + 4} textAnchor="end" fontSize="11" className="fill-slate-500">{value}</text>
                </g>
              );
            })}
            <line x1={left} y1={top + chartH} x2={width - right} y2={top + chartH} stroke="currentColor" className="text-slate-400" />
            {points.length > 1 && <polyline fill="none" stroke="currentColor" className="text-emerald-600" strokeWidth="3" points={line} />}
            {points.map((point) => (
              <g key={point.exam_id}>
                <circle cx={point.x} cy={point.y} r="5" fill="currentColor" className="text-emerald-600" />
                <text x={point.x} y={point.y - 12} textAnchor="middle" fontSize="11" fontWeight="700" className="fill-slate-700">
                  {Number(point.average).toFixed(1)}%
                </text>
                <text x={point.x} y={height - 40} textAnchor="middle" fontSize="10" className="fill-slate-600">
                  {point.exam_type}
                </text>
                <text x={point.x} y={height - 25} textAnchor="middle" fontSize="10" className="fill-slate-500">
                  {point.month}
                </text>
              </g>
            ))}
          </svg>
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-slate-100 p-4 sm:p-6 print:bg-white print:p-0 print:min-h-0">
      {/* Strict CSS rules for A4 Single Page Print layout */}
      <style>{`
        @media print {
          @page {
            size: A4 portrait;
            margin: 5mm;
          }
          html, body {
            height: auto !important;
            background: #fff !important;
            color: #000 !important;
            -webkit-print-color-adjust: exact;
            margin: 0 !important;
            padding: 0 !important;
          }
          .report-page {
            page-break-after: always !important;
            break-after: page !important;
            page-break-inside: avoid !important;
            break-inside: avoid !important;
            width: 100% !important;
            max-width: 200mm !important;
            box-sizing: border-box !important;
            padding: 2mm !important;
            margin: 0 auto !important;
            border: none !important;
            overflow: hidden !important;
          }
        }
      `}</style>

      <div className="max-w-7xl mx-auto space-y-6 print:max-w-none print:space-y-0 print:m-0">
        {/* Navigation & Actions */}
        <div className="flex items-center justify-between print:hidden font-sans">
          <Link to="/academic-dashboard" className="text-sm font-bold text-slate-600 hover:text-emerald-600 flex items-center gap-1">
            ← Back to Dashboard
          </Link>
          {reports.length > 0 && (
            <button 
              onClick={() => window.print()} 
              className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-bold transition-all shadow-sm"
            >
              🖨️ Print All Reports ({reports.length})
            </button>
          )}
        </div>

        {/* Filter Card */}
        <section className="bg-slate-50 border border-slate-200 rounded-xl shadow-sm p-5 print:hidden font-sans">
          <div className="mb-4 border-b border-slate-200 pb-3">
            <h1 className="text-base font-bold text-slate-800 flex items-center gap-2">
              🔍 Select Student & Examination Type
            </h1>
          </div>

          {error && (
            <div className="mb-4 p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs font-semibold">
              {error}
            </div>
          )}

          <form onSubmit={handleGenerateReport} className="grid grid-cols-1 md:grid-cols-4 gap-4 items-end">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">1. Class:</label>
              <select
                value={selectedClass}
                onChange={(e) => {
                  setSelectedClass(e.target.value);
                  setSelectedStudent('all');
                  setReports([]);
                  setAnnualProgress(null);
                }}
                disabled={loadingOptions}
                required
                className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg text-slate-800 text-xs font-medium focus:ring-2 focus:ring-emerald-500 outline-none"
              >
                <option value="">-- Select Class --</option>
                {classes.map((item) => <option key={getId(item)} value={getId(item)}>{getClassName(item)}</option>)}
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">2. Student:</label>
              <select
                value={selectedStudent}
                onChange={(e) => setSelectedStudent(e.target.value)}
                disabled={!selectedClass}
                className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg text-slate-800 text-xs font-medium focus:ring-2 focus:ring-emerald-500 outline-none disabled:bg-slate-100 disabled:opacity-60"
              >
                <option value="all">-- All Students (Print All) --</option>
                {students.map((item) => <option key={getId(item)} value={getId(item)}>{getStudentName(item)}</option>)}
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">3. Examination / Term:</label>
              <select
                value={selectedExam}
                onChange={(e) => {
                  setSelectedExam(e.target.value);
                  setReports([]);
                  setAnnualProgress(null);
                }}
                required
                className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg text-slate-800 text-xs font-medium focus:ring-2 focus:ring-emerald-500 outline-none"
              >
                <option value="">-- Select Examination --</option>
                {filteredExams.map((exam) => <option key={getId(exam)} value={getId(exam)}>{getExamLabel(exam)}</option>)}
              </select>
            </div>

            <button
              type="submit"
              disabled={loading || loadingOptions}
              className="px-4 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-sm transition-all disabled:opacity-50 h-[38px]"
            >
              {loading ? 'Generating...' : 'Generate Report'}
            </button>
          </form>
        </section>

        {/* Progress Chart Action */}
        {reports.length > 0 && selectedStudent !== 'all' && (
          <section className="print:hidden font-sans">
            <div className="flex justify-end mb-3">
              <button
                onClick={() => loadAnnualProgress(reports[0])}
                disabled={loadingProgress}
                className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold disabled:opacity-50 shadow-sm transition-all"
              >
                {loadingProgress ? 'Loading Progress...' : 'View Annual Progress Chart'}
              </button>
            </div>
            {annualProgress && renderProgressGraph()}
          </section>
        )}

        {/* Printable Official Swahili Single-Page Report Forms */}
        {reports.length > 0 ? reports.map((report) => (
          <article 
            key={report.id} 
            className="report-page w-[200mm] mx-auto bg-white border border-black p-4 box-border shadow-sm print:shadow-none print:border-none print:p-0 text-black text-[11px] leading-tight font-serif overflow-hidden"
          >
            {/* Header section with school logo */}
            <header className="flex justify-between items-center mb-1">
              <div className="w-[60px]" />
              <div className="text-center flex-1 leading-tight">
                <h3 className="font-bold text-[11px] uppercase m-0">OFISI YA RAIS – TAMISEMI</h3>
                <h3 className="font-bold text-[11px] uppercase m-0">{report.school_name || 'SHULE YA SEKONDARI'}</h3>
                <p className="text-[10px] font-bold mt-0.5 m-0">{report.school_address}</p>
              </div>
              <div className="w-[60px] h-[60px] flex items-center justify-center shrink-0">
                {report.school_logo ? (
                  <img src={report.school_logo} alt="School Logo" className="max-w-full max-h-full object-contain" />
                ) : (
                  <div className="w-[55px] h-[55px] border border-dashed border-slate-400 rounded-full" />
                )}
              </div>
            </header>

            <div className="text-center mb-1">
              <h3 className="font-bold text-[11px] underline uppercase m-0">
                RIPOTI YA MAENDELEO YA MWANAFUNZI KATIKA MASOMO NA TABIA
              </h3>
            </div>

            <div className="mb-1 text-[11px] leading-tight">
              <strong>Jina la mwanafunzi:</strong> {report.full_name} &nbsp;&nbsp;&nbsp;&nbsp;
              <strong>Kidato:</strong> {report.class_name || '-'} <br />
              <strong>Muhula:</strong> {report.term_name || '-'} &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;
              <strong>Mwaka:</strong> {report.year}
            </div>

            <p className="font-bold text-[11px] underline uppercase mt-0.5 mb-0.5">
              A: MATOKEO YA MTIHANI ({(report.exam_type || '').replace(/_/g, ' ').toUpperCase()})
            </p>
            
            <table className="w-full border-collapse border border-black text-[10.5px] mb-1">
              <thead>
                <tr className="bg-gray-100">
                  <th className="border border-black p-0.5 w-[5%] text-center">Na</th>
                  <th className="border border-black p-0.5 text-left">SOMO</th>
                  <th className="border border-black p-0.5 w-[15%] text-center">ALAMA (%)</th>
                  <th className="border border-black p-0.5 w-[12%] text-center">DARAJA</th>
                  <th className="border border-black p-0.5 w-[30%] text-center">MAONI YA MWALIMU</th>
                </tr>
              </thead>
              <tbody>
                {(report.results || []).length > 0 ? (
                  <>
                    {report.results.map((result, index) => (
                      <tr key={`${result.subject_code}-${index}`}>
                        <td className="border border-black p-0.5 text-center">{index + 1}</td>
                        <td className="border border-black p-0.5">{result.subject_name}</td>
                        <td className="border border-black p-0.5 text-center font-bold">{Number(result.marks).toFixed(2)}</td>
                        <td className="border border-black p-0.5 text-center font-bold">{result.grade}</td>
                        <td className="border border-black p-0.5 text-center">{result.remark}</td>
                      </tr>
                    ))}
                    <tr className="font-bold bg-gray-50">
                      <td colSpan="2" className="border border-black p-0.5 text-right">JUMLA / WASTANI:</td>
                      <td className="border border-black p-0.5 text-center">{report.total_marks}</td>
                      <td className="border border-black p-0.5 text-center">{report.average}% ({report.overall_grade})</td>
                      <td className="border border-black p-0.5 text-center">
                        {report.overall_grade === 'A' ? 'Bora sana' : report.overall_grade === 'B' ? 'Vizuri sana' : report.overall_grade === 'C' ? 'Vizuri' : report.overall_grade === 'D' ? 'Inaridhisha' : 'Feli'}
                      </td>
                    </tr>
                  </>
                ) : (
                  <tr>
                    <td colSpan="5" className="border border-black p-1 text-center">Hakuna matokeo yaliyopatikana kwa mtihani huu.</td>
                  </tr>
                )}
              </tbody>
            </table>

            <p className="font-bold text-[10px] underline uppercase mt-0.5 mb-0.5">
              B: UPIMAJI WA TABIA, KAZI NA MAENDELEO YAKE
            </p>
            
            <table className="w-full border-collapse border border-black text-[9px] mb-1">
              <thead>
                <tr className="bg-gray-100">
                  <th className="border border-black p-0.5 w-[5%] text-center">Na</th>
                  <th className="border border-black p-0.5 text-left">MAELEZO</th>
                  <th className="border border-black p-0.5 w-[20%] text-center">ALAMA / DARAJA</th>
                </tr>
              </thead>
              <tbody>
                {behaviorsList.map((desc, idx) => (
                  <tr key={idx}>
                    <td className="border border-black p-0.5 text-center">{idx + 1}</td>
                    <td className="border border-black p-0.5">{desc}</td>
                    <td className="border border-black p-0.5"></td>
                  </tr>
                ))}
              </tbody>
            </table>

            <div className="border border-black p-0.5 my-0.5 text-[9.5px] bg-gray-50 font-sans">
              <div className="grid grid-cols-3 text-center font-bold">
                <div>DIVISION: {report.division}</div>
                <div>POINTS: {report.points}</div>
                <div>
                  NAFASI DARASANI: {
                    report.position_str || 
                    (report.position && report.total_students ? `${report.position} / ${report.total_students}` : report.position) || 
                    (report.rank ? `${report.rank} / ${report.total_students || '-'}` : '-')
                  }
                </div>
              </div>
            </div>

            <p className="font-bold text-[10px] underline uppercase mt-0.5 mb-0.5">MAELEZO MENGINEYO MUHIMU</p>
            <ol className="text-[9.5px] leading-tight pl-4 my-0.5 space-y-0.5 list-decimal">
              <li>Maoni ya Mwl. wa Darasa: .................................................................................................................</li>
              <li>Shule imefungwa tarehe ......./......./{report.year} na itafunguliwa tarehe ......./......./{report.year}.</li>
              <li>Shule itakapofunguliwa mwanao/mwanafunzi aje shuleni bila kukosa.</li>
              <li>Maoni ya Mkuu wa Shule: ....................................................................................................................</li>
            </ol>

            <p className="text-[9.5px] my-0.5">
              Tarehe: ........../........../{report.year} &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; 
              Sahihi: .....................................
            </p>

            <p className="text-[9.5px] leading-tight my-0.5">
              Mimi (Mzazi/Mlezi): .........................................................................................................................<br />
              Nimepokea matokeo ya mwanafunzi, nitafuatilia maendeleo yake ya taaluma nyumbani na shuleni.<br />
              Sahihi: ..................................... &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; 
              Namba ya Simu: ...........................................
            </p>

            {/* Swahili Math Advice Block to Parents */}
            {report.math_comment && (
              <div 
                className="border border-slate-400 bg-slate-50 p-1 mt-0.5 rounded text-[9.5px] leading-snug font-sans"
                dangerouslySetInnerHTML={{ __html: report.math_comment }}
              />
            )}
          </article>
        )) : !loading && (
          <div className="bg-white border border-dashed border-slate-300 rounded-2xl p-12 text-center text-slate-500 print:hidden font-sans text-xs font-semibold">
            Please select <strong>Class</strong> and <strong>Examination</strong>, then click <strong>Generate Report</strong>.
          </div>
        )}
      </div>
    </div>
  );
};

export default StudentReport;