import { API_BASE_URL } from '../config/api';
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

const ViewMarksModal = ({ exam, onClose, token: propToken }) => {
  const navigate = useNavigate();
  const [selectedClass, setSelectedClass] = useState('Form 1');
  const classList = ['Form 1', 'Form 2', 'Form 3', 'Form 4'];
  const [loading, setLoading] = useState(false);
  const [matrixData, setMatrixData] = useState({ subjects: [], students: [] });

  // Pata token kwa usahihi kutoka kwa user object iliyohifadhiwa
  const getAuthToken = () => {
    if (propToken) return propToken;
    try {
      const savedUser = localStorage.getItem('school_user');
      if (savedUser) {
        const parsed = JSON.parse(savedUser);
        if (parsed?.token) return parsed.token;
      }
    } catch (e) {
      console.error('Failed to parse token from localStorage', e);
    }
    return localStorage.getItem('token') || '';
  };

  const token = getAuthToken();

  const handleClose = () => {
    if (onClose) {
      onClose();
    } else {
      navigate(-1);
    }
  };

  const fetchMarksMatrix = async () => {
    const examId = exam?.id || exam?.ID;
    if (!examId || !selectedClass) return;
    setLoading(true);

    try {
      const res = await fetch(
        `${API_BASE_URL}/admin/exams/marks-matrix?exam_id=${examId}&class_name=${encodeURIComponent(selectedClass)}`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      const result = await res.json().catch(() => ({}));
      if (res.ok && result.data) {
        setMatrixData(result.data);
      } else {
        setMatrixData({ subjects: [], students: [] });
      }
    } catch (err) {
      console.error('Error fetching marks matrix:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMarksMatrix();
  }, [selectedClass, exam]);

  return (
    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4 z-50">
      <div className="bg-white w-full max-w-6xl max-h-[90vh] rounded-2xl shadow-2xl flex flex-col overflow-hidden">
        {/* Header */}
        <div className="p-6 border-b border-slate-100 flex flex-wrap justify-between items-center gap-4 bg-slate-50">
          <div>
            <h3 className="text-xl font-bold text-slate-800">
              Entered Marks:{' '}
              <span className="text-purple-600">
                {exam?.exam_type ? `${exam.exam_type} (${exam.month} ${exam.year})` : 'All Exams'}
              </span>
            </h3>
            <p className="text-xs text-slate-500 mt-1">
              Select class to view entered marks matrix for all assigned subjects.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <select
              value={selectedClass}
              onChange={(e) => setSelectedClass(e.target.value)}
              className="px-4 py-2 rounded-xl text-sm font-semibold border border-slate-300 bg-white shadow-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
            >
              {classList.map((cls) => (
                <option key={cls} value={cls}>{cls}</option>
              ))}
            </select>

            <button
              type="button"
              onClick={handleClose}
              className="px-4 py-2 text-xs font-bold text-slate-600 bg-slate-200 hover:bg-slate-300 rounded-xl cursor-pointer transition"
            >
              Close
            </button>
          </div>
        </div>

        {/* Content Body */}
        <div className="p-6 overflow-auto flex-1">
          {loading ? (
            <div className="py-12 text-center text-slate-500 font-medium">Loading marks sheet...</div>
          ) : !matrixData?.students || matrixData.students.length === 0 ? (
            <div className="py-12 text-center text-slate-400">
              No students or marks records found for {selectedClass}.
            </div>
          ) : (
            <div className="overflow-x-auto rounded-xl border border-slate-200">
              <table className="w-full text-left text-xs border-collapse">
                <thead className="bg-slate-100 text-slate-700 font-bold uppercase sticky top-0 border-b border-slate-200">
                  <tr>
                    <th className="p-3 border-r border-slate-200 min-w-[50px]">#</th>
                    <th className="p-3 border-r border-slate-200 min-w-[120px]">Index No</th>
                    <th className="p-3 border-r border-slate-200 min-w-[180px]">Full Name</th>
                    <th className="p-3 border-r border-slate-200 min-w-[60px] text-center">Sex</th>

                    {matrixData.subjects.map((sub) => (
                      <th
                        key={sub.code}
                        title={sub.name || sub.code}
                        className="p-3 border-r border-slate-200 text-center min-w-[65px] bg-purple-50 text-purple-800"
                      >
                        {sub.short_name || sub.code}
                      </th>
                    ))}
                  </tr>
                </thead>

                <tbody className="divide-y divide-slate-100 text-slate-700">
                  {matrixData.students.map((std, idx) => (
                    <tr key={std.registration_no || idx} className="hover:bg-slate-50 transition">
                      <td className="p-3 border-r border-slate-200 font-semibold">{idx + 1}</td>
                      <td className="p-3 border-r border-slate-200 font-medium text-slate-900">{std.registration_no}</td>
                      <td className="p-3 border-r border-slate-200 font-semibold text-slate-800">{std.full_name || std.student_name}</td>
                      <td className="p-3 border-r border-slate-200 text-center uppercase font-bold">{std.sex}</td>

                      {matrixData.subjects.map((sub) => {
                        const val = std.marks ? (std.marks[sub.code] || std.marks[sub.short_name] || '-') : '-';
                        return (
                          <td
                            key={sub.code}
                            className={`p-3 border-r border-slate-200 text-center font-bold ${
                              val === '-' ? 'text-slate-300' : 'text-emerald-700'
                            }`}
                          >
                            {val}
                          </td>
                        );
                      })}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ViewMarksModal;


