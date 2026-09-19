import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { API_BASE_URL } from '../config/api';

const AcademicGenerateResults = () => {
  const { user } = useAuth();

  const [classes, setClasses] = useState([]);
  const [exams, setExams] = useState([]);

  const [selectedClassId, setSelectedClassId] = useState('');
  const [selectedExamId, setSelectedExamId] = useState('');
  const [viewType, setViewType] = useState('division');

  const [reportData, setReportData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState(null);

  const token =
    user?.token ||
    localStorage.getItem('token') ||
    localStorage.getItem('jwt') ||
    localStorage.getItem('accessToken');

  const parseArray = (data) => (Array.isArray(data) ? data : data?.data || []);

  useEffect(() => {
    const fetchInitialData = async () => {
      if (!token) return;

      const headers = {
        'Content-Type': 'application/json',
        Authorization: token.startsWith('Bearer ') ? token : `Bearer ${token}`,
      };

      try {
        const [resCls, resEx] = await Promise.all([
          fetch(`${API_BASE_URL}/admin/classes`, { headers }),
          fetch(`${API_BASE_URL}/admin/exams`, { headers }),
        ]);

        if (resCls.ok) setClasses(parseArray(await resCls.json()));
        if (resEx.ok) setExams(parseArray(await resEx.json()));
      } catch (err) {
        console.error('Error loading filters:', err);
      }
    };

    fetchInitialData();
  }, [token]);

  const handleGenerateResults = async (e) => {
    if (e) e.preventDefault();

    if (!selectedClassId || !selectedExamId) {
      setErrorMessage('Tafadhali chagua Darasa na Mtihani.');
      return;
    }

    try {
      setLoading(true);
      setErrorMessage(null);

      const headers = {
        'Content-Type': 'application/json',
        Authorization: token.startsWith('Bearer ') ? token : `Bearer ${token}`,
      };

      const queryUrl = `${API_BASE_URL}/admin/exams/generate-results?class_id=${selectedClassId}&exam_id=${selectedExamId}&view_type=${viewType}`;

      const res = await fetch(queryUrl, { headers });
      const resData = await res.json();

      if (res.ok && resData.status === 'success') {
        setReportData(resData);
      } else {
        setErrorMessage(resData.message || 'Imeshindikana kupata matokeo.');
      }
    } catch (err) {
      console.error(err);
      setErrorMessage('Matatizo ya mtandao kufikia server. Hakikisha backend inakimbia.');
    } finally {
      setLoading(false);
    }
  };

  const logoUrl =
    reportData?.header?.school_logo ||
    user?.school_logo ||
    user?.data?.school_logo;

  return (
    <div className="min-h-screen bg-[#F4F6F9] text-slate-800 p-4 sm:p-6 lg:p-8 font-sans">
      <div className="max-w-7xl mx-auto space-y-6">
        
        {/* Navigation */}
        <div className="no-print">
          <Link
            to="/academic-dashboard"
            className="inline-flex items-center gap-1.5 text-sm font-bold text-slate-600 hover:text-emerald-600 transition"
          >
            ← Back to Dashboard
          </Link>
        </div>

        {/* Setup Card */}
        <div className="bg-white border border-slate-200 p-6 md:p-8 rounded-2xl shadow-sm space-y-6 no-print">
          <h2 className="text-xl md:text-2xl font-extrabold text-[#0D2A4A] flex items-center gap-2">
            📊 Generate Examination Results 
          </h2>

          {errorMessage && (
            <div className="p-3 text-xs bg-rose-50 border border-rose-200 text-rose-700 rounded-xl font-semibold">
              ⚠️ {errorMessage}
            </div>
          )}

          <form onSubmit={handleGenerateResults} className="grid grid-cols-1 md:grid-cols-4 gap-4 items-end">
            <div>
              <label className="block text-xs font-bold text-slate-600 uppercase mb-2">SELECT CLASS</label>
              <select
                value={selectedClassId}
                onChange={(e) => setSelectedClassId(e.target.value)}
                required
                className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium text-slate-800 focus:bg-white focus:ring-2 focus:ring-emerald-500 outline-none transition"
              >
                <option value="">-- Choose Class --</option>
                {classes.map((cls) => (
                  <option key={cls.ID || cls.id} value={cls.ID || cls.id}>
                    {cls.class_name || cls.ClassName}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-600 uppercase mb-2">SELECT EXAM SESSION</label>
              <select
                value={selectedExamId}
                onChange={(e) => setSelectedExamId(e.target.value)}
                required
                className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium text-slate-800 focus:bg-white focus:ring-2 focus:ring-emerald-500 outline-none transition"
              >
                <option value="">-- Choose Exam --</option>
                {exams.map((ex) => (
                  <option key={ex.ID || ex.id} value={ex.ID || ex.id}>
                    {ex.year || ex.Year} - {ex.month || ex.Month} ({ex.exam_type || ex.ExamType})
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-600 uppercase mb-2">VIEW TYPE</label>
              <select
                value={viewType}
                onChange={(e) => setViewType(e.target.value)}
                className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium text-slate-800 focus:bg-white focus:ring-2 focus:ring-emerald-500 outline-none transition"
              >
                <option value="division">By Division (NECTA)</option>
                <option value="rank">By Rank / Position (Average)</option>
              </select>
            </div>

            <div>
              <button
                type="submit"
                className="w-full py-3 bg-[#00A65A] hover:bg-[#008d4c] text-white font-bold text-sm rounded-xl shadow-sm transition cursor-pointer"
              >
                Generate Results
              </button>
            </div>
          </form>
        </div>

        {/* Loading State */}
        {loading && (
          <div className="bg-white p-12 rounded-2xl text-center border border-slate-200 shadow-sm">
            <p className="text-[#00A65A] font-bold animate-pulse text-base">
              🔄 Processing & Calculating NECTA Divisions & Ranks...
            </p>
          </div>
        )}

        {/* REPORT SHEET CONTAINER */}
        {reportData && !loading && (
          <div className="bg-white text-slate-900 p-6 md:p-10 rounded-2xl border border-slate-200 shadow-md font-mono relative printable-sheet">
            
            {/* Print Button */}
            <div className="absolute right-6 top-6 no-print">
              <button
                onClick={() => window.print()}
                className="px-4 py-2 bg-[#00A65A] hover:bg-[#008d4c] text-white font-bold text-xs rounded-lg shadow-sm flex items-center gap-2 cursor-pointer transition"
              >
                🖨️ Print Results Sheet
              </button>
            </div>

            {/* HEADER */}
            <div className="flex items-center justify-between border-b-2 border-slate-800 pb-4 mb-6">
              <div className="w-24 hidden md:block"></div>

              <div className="text-center flex-1 space-y-1">
                <h3 className="text-xs font-bold text-slate-600 uppercase tracking-widest">
                  THE UNITED REPUBLIC OF TANZANIA
                </h3>
                <h4 className="text-xs font-bold text-slate-600 uppercase">
                  PRESIDENT'S OFFICE REGIONAL ADMINISTRATION AND LOCAL GOVERNMENT
                </h4>
                <h1 className="text-xl md:text-2xl font-extrabold uppercase text-slate-900 tracking-wide mt-1">
                  {reportData.header.school_name || 'MPWAYUNGU SECONDARY SCHOOL'}
                </h1>
                <p className="text-sm font-bold text-slate-800 uppercase underline">
                  EXAMINATION RESULTS SUMMARY ({viewType.toUpperCase()})
                </p>
                <p className="text-xs font-medium text-slate-700">
                  Class: <span className="font-bold">{reportData.header.class_name}</span> | Exam:{' '}
                  <span className="font-bold">{reportData.header.month_year} ({reportData.header.exam_type})</span>
                </p>
              </div>

              {/* LOGO IN CIRCLE */}
              <div className="w-24 flex justify-end items-center">
                {logoUrl ? (
                  <img
                    src={logoUrl}
                    alt="School Logo"
                    className="h-20 w-20 object-cover rounded-full border-2 border-slate-400 shadow-sm"
                  />
                ) : (
                  <div className="h-20 w-20 rounded-full border-2 border-dashed border-slate-400 flex items-center justify-center text-slate-400 text-xs font-bold text-center p-1">
                    LOGO
                  </div>
                )}
              </div>
            </div>

            {/* 1. SUMMARY OF PERFORMANCE TABLE (WITH INC & ABS) */}
            <div className="mb-6">
              <h4 className="text-xs font-extrabold text-slate-900 uppercase mb-2">
                1. SUMMARY OF PERFORMANCE
              </h4>
              <table className="w-full md:w-2/3 text-xs border-collapse border border-slate-800 text-center">
                <thead>
                  <tr className="bg-slate-100 text-slate-900 font-bold">
                    <th className="border border-slate-800 p-1.5">SEX</th>
                    <th className="border border-slate-800 p-1.5">REG</th>
                    <th className="border border-slate-800 p-1.5">I</th>
                    <th className="border border-slate-800 p-1.5">II</th>
                    <th className="border border-slate-800 p-1.5">III</th>
                    <th className="border border-slate-800 p-1.5">IV</th>
                    <th className="border border-slate-800 p-1.5">FAIL</th>
                    <th className="border border-slate-800 p-1.5">INC</th>
                    <th className="border border-slate-800 p-1.5">ABS</th>
                    <th className="border border-slate-800 p-1.5">TOTAL</th>
                  </tr>
                </thead>
                <tbody>
                  {['F', 'M'].map((sex) => {
                    const row = reportData.division_summary[sex] || {};
                    return (
                      <tr key={sex}>
                        <td className="border border-slate-800 p-1 font-bold">
                          {sex === 'F' ? 'FEMALE' : 'MALE'}
                        </td>
                        <td className="border border-slate-800 p-1">{row.total || 0}</td>
                        <td className="border border-slate-800 p-1">{row.i || 0}</td>
                        <td className="border border-slate-800 p-1">{row.ii || 0}</td>
                        <td className="border border-slate-800 p-1">{row.iii || 0}</td>
                        <td className="border border-slate-800 p-1">{row.iv || 0}</td>
                        <td className="border border-slate-800 p-1">{row.fail || 0}</td>
                        <td className="border border-slate-800 p-1">{row.inc || 0}</td>
                        <td className="border border-slate-800 p-1">{row.abs || 0}</td>
                        <td className="border border-slate-800 p-1 font-bold">{row.total || 0}</td>
                      </tr>
                    );
                  })}
                  <tr className="bg-slate-50 font-extrabold">
                    <td className="border border-slate-800 p-1">TOTAL</td>
                    <td className="border border-slate-800 p-1">
                      {(reportData.division_summary.F?.total || 0) + (reportData.division_summary.M?.total || 0)}
                    </td>
                    <td className="border border-slate-800 p-1">
                      {(reportData.division_summary.F?.i || 0) + (reportData.division_summary.M?.i || 0)}
                    </td>
                    <td className="border border-slate-800 p-1">
                      {(reportData.division_summary.F?.ii || 0) + (reportData.division_summary.M?.ii || 0)}
                    </td>
                    <td className="border border-slate-800 p-1">
                      {(reportData.division_summary.F?.iii || 0) + (reportData.division_summary.M?.iii || 0)}
                    </td>
                    <td className="border border-slate-800 p-1">
                      {(reportData.division_summary.F?.iv || 0) + (reportData.division_summary.M?.iv || 0)}
                    </td>
                    <td className="border border-slate-800 p-1">
                      {(reportData.division_summary.F?.fail || 0) + (reportData.division_summary.M?.fail || 0)}
                    </td>
                    <td className="border border-slate-800 p-1">
                      {(reportData.division_summary.F?.inc || 0) + (reportData.division_summary.M?.inc || 0)}
                    </td>
                    <td className="border border-slate-800 p-1">
                      {(reportData.division_summary.F?.abs || 0) + (reportData.division_summary.M?.abs || 0)}
                    </td>
                    <td className="border border-slate-800 p-1">
                      {(reportData.division_summary.F?.total || 0) + (reportData.division_summary.M?.total || 0)}
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>

            {/* 2. DETAILED CANDIDATES RESULTS TABLE */}
            <div className="mb-6">
              <h4 className="text-xs font-extrabold text-slate-900 uppercase mb-2">
                2. DETAILED CANDIDATES RESULTS
              </h4>
              <div className="overflow-x-auto">
                <table className="w-full text-xs border-collapse border border-slate-800 text-center">
                  <thead>
                    <tr className="bg-slate-100 text-slate-900 font-bold">
                      <th className="border border-slate-800 p-1.5 w-28">INDEX NO</th>
                      <th className="border border-slate-800 p-1.5 text-left min-w-[180px]">STUDENT NAME</th>
                      <th className="border border-slate-800 p-1.5 w-12">SEX</th>

                      {/* AVG & POS zitaonekana pale tu viewType inapokuwa 'rank' */}
                      {viewType === 'rank' && (
                        <>
                          <th className="border border-slate-800 p-1.5 w-16">AVG</th>
                          <th className="border border-slate-800 p-1.5 w-12">POS</th>
                        </>
                      )}

                      <th className="border border-slate-800 p-1.5 w-16">POINTS</th>
                      <th className="border border-slate-800 p-1.5 w-16">DIV</th>
                      <th className="border border-slate-800 p-1.5 text-left">DETAILED SUBJECTS</th>
                    </tr>
                  </thead>
                  <tbody>
                    {reportData.student_results.map((st, idx) => (
                      <tr key={idx} className="hover:bg-slate-50 transition">
                        <td className="border border-slate-800 p-1 font-mono">{st.cno}</td>
                        <td className="border border-slate-800 p-1 text-left font-bold">{st.full_name}</td>
                        <td className="border border-slate-800 p-1">{st.gender}</td>

                        {/* Render AVG & POS columns tu under Rank mode */}
                        {viewType === 'rank' && (
                          <>
                            <td className="border border-slate-800 p-1 font-bold">
                              {st.average ? st.average.toFixed(2) : '0.00'}
                            </td>
                            <td className="border border-slate-800 p-1 font-extrabold text-emerald-700">
                              {st.position}
                            </td>
                          </>
                        )}

                        <td className="border border-slate-800 p-1 font-bold">{st.points}</td>
                        <td className="border border-slate-800 p-1 font-extrabold">{st.division}</td>
                        <td className="border border-slate-800 p-1 text-left font-mono text-[11px]">
                          {st.details}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* 3. SUBJECT PERFORMANCE SUMMARY & SCHOOL GPA */}
            <div>
              <h4 className="text-xs font-extrabold text-slate-900 uppercase mb-2">
                3. SUBJECT PERFORMANCE SUMMARY & SCHOOL GPA
              </h4>
              <div className="overflow-x-auto">
                <table className="w-full md:w-3/4 text-xs border-collapse border border-slate-800 text-center">
                  <thead>
                    <tr className="bg-slate-100 text-slate-900 font-bold">
                      <th className="border border-slate-800 p-1.5 text-left">SUBJECT NAME</th>
                      <th className="border border-slate-800 p-1.5">CODE</th>
                      <th className="border border-slate-800 p-1.5">A</th>
                      <th className="border border-slate-800 p-1.5">B</th>
                      <th className="border border-slate-800 p-1.5">C</th>
                      <th className="border border-slate-800 p-1.5">D</th>
                      <th className="border border-slate-800 p-1.5">F</th>
                      <th className="border border-slate-800 p-1.5">TOTAL SEATED</th>
                      <th className="border border-slate-800 p-1.5">SUBJECT GPA</th>
                    </tr>
                  </thead>
                  <tbody>
                    {reportData.subject_stats.map((sub, idx) => (
                      <tr key={idx}>
                        <td className="border border-slate-800 p-1 text-left font-bold">{sub.name}</td>
                        {/* HAPA: Tunasoma subject_code halisi (mfano 041, 011) badala ya short name */}
                        <td className="border border-slate-800 p-1 font-mono font-bold">
                          {sub.subject_code || sub.code}
                        </td>
                        <td className="border border-slate-800 p-1">{sub.a}</td>
                        <td className="border border-slate-800 p-1">{sub.b}</td>
                        <td className="border border-slate-800 p-1">{sub.c}</td>
                        <td className="border border-slate-800 p-1">{sub.d}</td>
                        <td className="border border-slate-800 p-1">{sub.f}</td>
                        <td className="border border-slate-800 p-1 font-bold">{sub.total}</td>
                        <td className="border border-slate-800 p-1 font-extrabold">{sub.subject_gpa}</td>
                      </tr>
                    ))}
                    <tr className="bg-slate-50 font-extrabold text-sm">
                      <td colSpan="8" className="border border-slate-800 p-2 text-right">
                        OVERALL SCHOOL GPA:
                      </td>
                      <td className="border border-slate-800 p-2 text-emerald-700">
                        {reportData.overall_gpa}
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>

          </div>
        )}
      </div>

      {/* PRINT STYLES */}
      <style>{`
        @media print {
          @page {
            size: A4 landscape;
            margin: 8mm;
          }
          body {
            background: #ffffff !important;
            color: #000000 !important;
          }
          .no-print {
            display: none !important;
          }
          .printable-sheet {
            box-shadow: none !important;
            padding: 0 !important;
            border: none !important;
          }
        }
      `}</style>
    </div>
  );
};

export default AcademicGenerateResults;