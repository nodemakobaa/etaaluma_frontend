import React, { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { API_BASE_URL } from '../config/api';

const AcademicViewMarks = () => {
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
        setError(`Unable to connect to server at ${API_BASE_URL}.`);
      } finally {
        setLoading(false);
      }
    };

    if (classId && subjectCode && examId) {
      fetchMarks();
    } else {
      setError('Missing required search parameters (class_id, subject_code, exam_id).');
      setLoading(false);
    }
  }, [classId, subjectCode, examId]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <div className="text-lg font-medium text-gray-600">Loading student examination marks...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-2xl mx-auto mt-12 p-6 bg-red-50 border border-red-200 rounded-lg text-center">
        <h3 className="text-xl font-bold text-red-700 mb-2">Connection Error</h3>
        <p className="text-red-600 mb-6">{error}</p>
        <button
          onClick={() => navigate('/academic/view-marks')}
          className="px-5 py-2.5 bg-red-600 text-white font-medium rounded-md hover:bg-red-700 transition"
        >
          Back to Marks Setup
        </button>
      </div>
    );
  }

  const { metadata, students } = marksData || {};

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-5xl mx-auto">
        <div className="flex justify-between items-center mb-6 print:hidden">
          <button
            onClick={() => navigate('/academic/view-marks')}
            className="text-sm font-medium text-gray-600 hover:text-gray-900 transition flex items-center gap-1"
          >
            ← Back to Marks Setup
          </button>
          <button
            onClick={() => window.print()}
            className="px-5 py-2 bg-emerald-600 text-white text-sm font-semibold rounded-md hover:bg-emerald-700 shadow-sm transition"
          >
            Print Results
          </button>
        </div>

        {/* Metadata Card */}
        <div className="bg-white p-8 rounded-xl shadow-sm border border-gray-100 mb-6 relative">
          <div className="flex flex-col md:flex-row items-center justify-between border-b border-gray-100 pb-6 mb-6">
            <div className="hidden md:block w-24"></div>
            <div className="text-center flex-1 my-2 md:my-0">
              <h1 className="text-3xl font-extrabold text-gray-900 uppercase tracking-wide">
                {metadata?.school_name || 'SCHOOL EXAMINATION SYSTEM'}
              </h1>
              <p className="text-sm font-medium text-gray-500 mt-1">
                Student Subject Examination Performance
              </p>
            </div>
            <div className="flex-shrink-0 mt-3 md:mt-0">
              {metadata?.school_logo ? (
                <img
                  src={metadata.school_logo}
                  alt="School Logo"
                  className="w-24 h-24 object-cover rounded-full border-2 border-gray-200 shadow-md"
                />
              ) : (
                <div className="w-24 h-24 rounded-full bg-emerald-100 border-2 border-emerald-400 flex items-center justify-center text-emerald-600 font-extrabold text-2xl shadow-md">
                  {metadata?.school_name ? metadata.school_name.charAt(0) : 'S'}
                </div>
              )}
            </div>
          </div>

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

        {/* Marks Table */}
        <div className="bg-white shadow-sm rounded-xl border border-gray-100 overflow-hidden">
          <table className="min-w-full divide-y divide-gray-200 text-left text-sm">
            <thead className="bg-gray-50 font-semibold text-gray-700">
              <tr>
                <th className="py-3.5 px-4">S/N</th>
                <th className="py-3.5 px-4">Index No</th>
                <th className="py-3.5 px-4">Full Name</th>
                <th className="py-3.5 px-4">Sex</th>
                <th className="py-3.5 px-4">Score (%)</th>
                <th className="py-3.5 px-4">Grade</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 text-gray-700">
              {students && students.length > 0 ? (
                students.map((student, index) => (
                  <tr key={student.student_id || index} className="hover:bg-gray-50/80 transition">
                    <td className="py-3.5 px-4 text-gray-500">{index + 1}</td>
                    <td className="py-3.5 px-4 font-mono text-gray-600 font-semibold">{student.index_no}</td>
                    <td className="py-3.5 px-4 font-semibold text-gray-900">{student.full_name}</td>
                    <td className="py-3.5 px-4">{student.sex}</td>
                    <td className="py-3.5 px-4 font-bold text-gray-800">
                      {student.score !== null && student.score !== undefined ? student.score : 'N/A'}
                    </td>
                    <td className="py-3.5 px-4">
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
                            : 'bg-gray-100 text-gray-600'
                        }`}
                      >
                        {student.grade}
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
    </div>
  );
};

export default AcademicViewMarks;