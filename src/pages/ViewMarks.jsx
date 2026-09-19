import { API_BASE_URL } from '../config/api';
import React, { useState, useEffect, useMemo } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';

const ViewMarks = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  const classId = searchParams.get('class_id');
  const subjectCode = searchParams.get('subject_code');
  const examId = searchParams.get('exam_id');

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [marksData, setMarksData] = useState(null);

  useEffect(() => {
    const fetchMarks = async () => {
      try {
        setLoading(true);
        setError(null);

        const token = localStorage.getItem('token') || localStorage.getItem('jwt');

        const response = await fetch(
          `${API_BASE_URL}/teacher/mark-entry-students?class_id=${classId}&subject_code=${subjectCode}&exam_id=${examId}`,
          {
            method: 'GET',
            headers: {
              'Content-Type': 'application/json',
              Authorization: token ? `Bearer ${token}` : '',
            },
          }
        );

        if (!response.ok) {
          throw new Error(`Server returned HTTP ${response.status}`);
        }

        const resData = await response.json();

        if (resData.status === 'success') {
          setMarksData(resData);
        } else {
          setError(resData.message || 'Failed to retrieve examination marks.');
        }
      } catch (err) {
        console.error('Fetch error:', err);
        setError(
          `Unable to connect to server at ${API_BASE_URL}. Please ensure backend server is running and CORS is enabled.`
        );
      } finally {
        setLoading(false);
      }
    };

    if (classId && subjectCode && examId) {
      fetchMarks();
    } else {
      setError('Missing required search parameters.');
      setLoading(false);
    }
  }, [classId, subjectCode, examId]);

  const { metadata, students } = marksData || {};

  // Kukokotoa muhtasari wa A, B, C, D, F, na Incomplete (INC)
  const gradeSummary = useMemo(() => {
    const counts = {
      A: 0,
      B: 0,
      C: 0,
      D: 0,
      F: 0,
      INC: 0,
      total: 0,
    };

    if (!students || students.length === 0) return counts;

    counts.total = students.length;

    students.forEach((st) => {
      const score = st.score;
      const grade = String(st.grade || '').toUpperCase();

      // Ikiwa hana alama au alama haipo au daraja ni "-" au "N/A"
      if (
        score === null ||
        score === undefined ||
        score === '' ||
        score === '-' ||
        grade === '-' ||
        grade === 'N/A' ||
        grade === 'INC'
      ) {
        counts.INC += 1;
      } else if (grade === 'A') {
        counts.A += 1;
      } else if (grade === 'B') {
        counts.B += 1;
      } else if (grade === 'C') {
        counts.C += 1;
      } else if (grade === 'D') {
        counts.D += 1;
      } else if (grade === 'F') {
        counts.F += 1;
      } else {
        counts.INC += 1;
      }
    });

    return counts;
  }, [students]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50 font-sans">
        <div className="text-lg font-medium text-gray-600 animate-pulse">
          Loading student examination marks...
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-2xl mx-auto mt-12 p-6 bg-red-50 border border-red-200 rounded-lg text-center font-sans">
        <h3 className="text-xl font-bold text-red-700 mb-2">Connection Error</h3>
        <p className="text-red-600 mb-6">{error}</p>
        <button
          onClick={() => navigate('/teacher-dashboard')}
          className="px-5 py-2.5 bg-red-600 text-white font-medium rounded-md hover:bg-red-700 transition cursor-pointer"
        >
          Back to Dashboard
        </button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4 sm:px-6 lg:px-8 font-sans">
      <div className="max-w-5xl mx-auto space-y-6">
        {/* Header Actions */}
        <div className="flex justify-between items-center print:hidden">
          <button
            onClick={() => navigate('/teacher-dashboard')}
            className="text-sm font-medium text-gray-600 hover:text-gray-900 transition flex items-center gap-1 cursor-pointer"
          >
            ← Back to Dashboard
          </button>
          <button
            onClick={() => window.print()}
            className="px-5 py-2 bg-indigo-600 text-white text-sm font-semibold rounded-md hover:bg-indigo-700 shadow-sm transition cursor-pointer"
          >
            🖨️ Print Results
          </button>
        </div>

        {/* Metadata Card - Centered Header with Circular Logo */}
        <div className="bg-white p-8 rounded-xl shadow-sm border border-gray-100 relative">
          <div className="flex flex-col md:flex-row items-center justify-between border-b border-gray-100 pb-6 mb-6">
            <div className="hidden md:block w-24"></div>

            {/* School Name & Performance Title - Center Aligned */}
            <div className="text-center flex-1 my-2 md:my-0">
              <h1 className="text-2xl md:text-3xl font-extrabold text-gray-900 uppercase tracking-wide">
                {metadata?.school_name || 'BUNGWA SECONDARY SCHOOL'}
              </h1>
              <p className="text-sm font-medium text-gray-500 mt-1">
                Student Subject Examination Performance
              </p>
            </div>

            {/* Circular & Larger Logo Section */}
            <div className="flex-shrink-0 mt-3 md:mt-0">
              {metadata?.school_logo ? (
                <img
                  src={metadata.school_logo}
                  alt="School Logo"
                  className="w-24 h-24 object-cover rounded-full border-2 border-gray-200 shadow-md"
                />
              ) : (
                <div className="w-24 h-24 rounded-full bg-orange-100 border-2 border-orange-400 flex items-center justify-center text-orange-600 font-extrabold text-2xl shadow-md">
                  {metadata?.school_name ? metadata.school_name.charAt(0) : 'S'}
                </div>
              )}
            </div>
          </div>

          {/* Details Row - Center Aligned */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 text-center text-sm">
            <div className="bg-gray-50/50 p-3 rounded-lg border border-gray-100">
              <span className="text-gray-500 block text-xs uppercase font-medium">Class</span>
              <span className="font-bold text-gray-800 text-base">{metadata?.class_name || 'N/A'}</span>
            </div>
            <div className="bg-gray-50/50 p-3 rounded-lg border border-gray-100">
              <span className="text-gray-500 block text-xs uppercase font-medium">Subject</span>
              <span className="font-bold text-gray-800 text-base">
                {metadata?.subject_name} ({metadata?.subject_code})
              </span>
            </div>
            <div className="bg-gray-50/50 p-3 rounded-lg border border-gray-100">
              <span className="text-gray-500 block text-xs uppercase font-medium">Examination</span>
              <span className="font-bold text-gray-800 text-base">{metadata?.exam_name || 'N/A'}</span>
            </div>
          </div>
        </div>

        {/* 1. Student Marks Table */}
        <div className="bg-white shadow-sm rounded-xl border border-gray-100 overflow-hidden">
          <div className="p-4 border-b border-gray-100 bg-gray-50/50 flex justify-between items-center">
            <h3 className="font-bold text-gray-800 text-sm uppercase tracking-wide">
              1. Detailed Student Scores
            </h3>
            <span className="text-xs text-gray-500 font-medium">
              Total Enrolled: <strong className="text-gray-800">{students?.length || 0}</strong>
            </span>
          </div>

          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200 text-left text-sm">
              <thead className="bg-gray-50 font-semibold text-gray-700">
                <tr>
                  <th className="py-3.5 px-4 w-12 text-center">S/N</th>
                  <th className="py-3.5 px-4 w-32">Index No</th>
                  <th className="py-3.5 px-4">Full Name</th>
                  <th className="py-3.5 px-4 w-16 text-center">Sex</th>
                  <th className="py-3.5 px-4 w-28 text-center">Score (%)</th>
                  <th className="py-3.5 px-4 w-24 text-center">Grade</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 text-gray-700 font-medium">
                {students && students.length > 0 ? (
                  students.map((student, index) => (
                    <tr key={student.student_id || index} className="hover:bg-gray-50/80 transition">
                      <td className="py-3.5 px-4 text-center text-gray-500 text-xs">{index + 1}</td>
                      <td className="py-3.5 px-4 font-mono text-gray-600 font-semibold text-xs">
                        {student.index_no}
                      </td>
                      <td className="py-3.5 px-4 font-semibold text-gray-900">{student.full_name}</td>
                      <td className="py-3.5 px-4 text-center font-bold">{student.sex}</td>
                      <td className="py-3.5 px-4 text-center font-bold text-gray-800">
                        {student.score !== null && student.score !== undefined ? student.score : '-'}
                      </td>
                      <td className="py-3.5 px-4 text-center">
                        <span
                          className={`inline-block px-3 py-1 text-xs font-bold rounded-full ${
                            student.grade === 'A'
                              ? 'bg-green-100 text-green-800'
                              : student.grade === 'B'
                              ? 'bg-blue-100 text-blue-800'
                              : student.grade === 'C'
                              ? 'bg-yellow-100 text-yellow-800'
                              : student.grade === 'D'
                              ? 'bg-orange-100 text-orange-800'
                              : student.grade === 'F'
                              ? 'bg-red-100 text-red-800'
                              : 'bg-purple-100 text-purple-700'
                          }`}
                        >
                          {student.grade === '-' || !student.grade ? 'INC' : student.grade}
                        </span>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={6} className="py-8 text-center text-gray-500 font-medium">
                      No examination marks recorded for this selection.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* 2. JEDWALI JIPYA: GRADE PERFORMANCE BREAKDOWN & INCOMPLETE (INC) TABLE */}
        <div className="bg-white shadow-sm rounded-xl border border-gray-100 overflow-hidden">
          <div className="p-4 border-b border-gray-100 bg-gray-50/50">
            <h3 className="font-bold text-gray-800 text-sm uppercase tracking-wide">
              2. Subject Grade Breakdown & Incomplete (INC) Summary
            </h3>
            <p className="text-xs text-gray-500 mt-0.5">
              General summary showing counts of grades (A, B, C, D, F) and students with missing marks (INC).
            </p>
          </div>

          <div className="overflow-x-auto">
            <table className="min-w-full text-center text-xs border-collapse">
              <thead>
                <tr className="bg-slate-100 text-slate-800 font-bold border-b border-slate-200">
                  <th className="p-3 border-r border-slate-200 bg-emerald-50 text-emerald-800 font-extrabold">
                    A (75 - 100)
                  </th>
                  <th className="p-3 border-r border-slate-200 bg-blue-50 text-blue-800 font-extrabold">
                    B (65 - 74)
                  </th>
                  <th className="p-3 border-r border-slate-200 bg-amber-50 text-amber-800 font-extrabold">
                    C (45 - 64)
                  </th>
                  <th className="p-3 border-r border-slate-200 bg-orange-50 text-orange-800 font-extrabold">
                    D (30 - 44)
                  </th>
                  <th className="p-3 border-r border-slate-200 bg-rose-50 text-rose-800 font-extrabold">
                    F (0 - 29)
                  </th>
                  <th className="p-3 border-r border-slate-200 bg-purple-50 text-purple-800 font-extrabold">
                    INC (-)
                  </th>
                  <th className="p-3 bg-slate-200 text-slate-900 font-extrabold">
                    TOTAL STUDENTS
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-sm font-extrabold">
                <tr className="hover:bg-slate-50 transition">
                  <td className="p-3.5 border-r border-slate-200 text-emerald-700 bg-emerald-50/40">
                    <span className="text-base">{gradeSummary.A}</span>
                    <span className="block text-[10px] text-gray-400 font-normal">
                      {gradeSummary.total > 0
                        ? `${((gradeSummary.A / gradeSummary.total) * 100).toFixed(1)}%`
                        : '0%'}
                    </span>
                  </td>

                  <td className="p-3.5 border-r border-slate-200 text-blue-700 bg-blue-50/40">
                    <span className="text-base">{gradeSummary.B}</span>
                    <span className="block text-[10px] text-gray-400 font-normal">
                      {gradeSummary.total > 0
                        ? `${((gradeSummary.B / gradeSummary.total) * 100).toFixed(1)}%`
                        : '0%'}
                    </span>
                  </td>

                  <td className="p-3.5 border-r border-slate-200 text-amber-700 bg-amber-50/40">
                    <span className="text-base">{gradeSummary.C}</span>
                    <span className="block text-[10px] text-gray-400 font-normal">
                      {gradeSummary.total > 0
                        ? `${((gradeSummary.C / gradeSummary.total) * 100).toFixed(1)}%`
                        : '0%'}
                    </span>
                  </td>

                  <td className="p-3.5 border-r border-slate-200 text-orange-700 bg-orange-50/40">
                    <span className="text-base">{gradeSummary.D}</span>
                    <span className="block text-[10px] text-gray-400 font-normal">
                      {gradeSummary.total > 0
                        ? `${((gradeSummary.D / gradeSummary.total) * 100).toFixed(1)}%`
                        : '0%'}
                    </span>
                  </td>

                  <td className="p-3.5 border-r border-slate-200 text-rose-700 bg-rose-50/40">
                    <span className="text-base">{gradeSummary.F}</span>
                    <span className="block text-[10px] text-gray-400 font-normal">
                      {gradeSummary.total > 0
                        ? `${((gradeSummary.F / gradeSummary.total) * 100).toFixed(1)}%`
                        : '0%'}
                    </span>
                  </td>

                  <td className="p-3.5 border-r border-slate-200 text-purple-700 bg-purple-50/40">
                    <span className="text-base">{gradeSummary.INC}</span>
                    <span className="block text-[10px] text-gray-400 font-normal">
                      {gradeSummary.total > 0
                        ? `${((gradeSummary.INC / gradeSummary.total) * 100).toFixed(1)}%`
                        : '0%'}
                    </span>
                  </td>

                  <td className="p-3.5 bg-slate-100 text-slate-900">
                    <span className="text-base">{gradeSummary.total}</span>
                    <span className="block text-[10px] text-gray-500 font-medium">100%</span>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ViewMarks;