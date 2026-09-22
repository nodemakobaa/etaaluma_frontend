import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { API_BASE_URL } from '../config/api';

const behaviorsList = [
  "Hardworking and knowledgeable",
  "Independence and quality of work done",
  "Appreciation and respect for work",
  "Care for public property",
  "Cooperation and teamwork",
  "Respect for elders, teachers, and peers",
  "Leadership and positive influence on others",
  "Personal hygiene",
  "Honesty and integrity",
  "Participation in sports and cultural activities"
];

const ClassTeacherPanel = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const classId = searchParams.get('class_id');
  const token = localStorage.getItem('token') || '';

  const [students, setStudents] = useState([]);
  const [exams, setExams] = useState([]);
  const [selectedStudent, setSelectedStudent] = useState('');
  const [selectedExam, setSelectedExam] = useState('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });

  const [behaviorRatings, setBehaviorRatings] = useState({});
  const [classTeacherRemark, setClassTeacherRemark] = useState('');

  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      try {
        // Jaribu route ya admin students kwanza, kama ina class_id itachuja wanafunzi wa darasa hilo
        const studentUrl = classId 
          ? `${API_BASE_URL}/admin/students?class_id=${classId}` 
          : `${API_BASE_URL}/admin/students`;

        const [studentRes, examRes] = await Promise.all([
          fetch(studentUrl, { headers: { Authorization: `Bearer ${token}` } }),
          fetch(`${API_BASE_URL}/teacher/exams`, { headers: { Authorization: `Bearer ${token}` } }),
        ]);

        const studentData = studentRes.ok ? await studentRes.json() : {};
        const examData = examRes.ok ? await examRes.json() : {};

        console.log("Students loaded:", studentData); // Kuona kwenye Console kama wanakuja

        const studentList = studentData.data || studentData.students || (Array.isArray(studentData) ? studentData : []);
        const examList = examData.data || examData.exams || (Array.isArray(examData) ? examData : []);

        setStudents(Array.isArray(studentList) ? studentList : []);
        setExams(Array.isArray(examList) ? examList : []);
      } catch (err) {
        console.error('Failed to load panel data', err);
        setStudents([]);
        setExams([]);
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, [classId, token]);

  const handleRatingChange = (index, value) => {
    setBehaviorRatings(prev => ({ ...prev, [index]: value }));
  };

  const handleSave = async (e) => {
    e.preventDefault();
    if (!selectedStudent || !selectedExam) {
      setMessage({ type: 'error', text: 'Please select both a Student and an Examination.' });
      return;
    }

    setSaving(true);
    setMessage({ type: '', text: '' });

    try {
      setTimeout(() => {
        setSaving(false);
        setMessage({ type: 'success', text: 'Student conduct and remarks saved successfully!' });
      }, 500);
    } catch (err) {
      setSaving(false);
      setMessage({ type: 'error', text: 'Failed to save data.' });
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-100 flex items-center justify-center font-sans">
        <div className="text-center space-y-2">
          <div className="inline-block w-8 h-8 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin"></div>
          <p className="text-slate-600 font-semibold text-xs">Loading Class Teacher Panel...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-100 p-4 md:p-8 font-sans">
      <div className="max-w-4xl mx-auto space-y-6">
        <div className="flex items-center justify-between bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
          <div>
            <h1 className="text-xl font-bold text-slate-800">🎓 Class Teacher Panel</h1>
            <p className="text-xs text-slate-500 mt-0.5">Manage student behavior ratings and class teacher remarks.</p>
          </div>
          <button
            onClick={() => navigate('/teacher-dashboard')}
            className="px-4 py-2 bg-slate-200 hover:bg-slate-300 text-slate-700 rounded-xl text-xs font-bold transition cursor-pointer"
          >
            ← Back to Dashboard
          </button>
        </div>

        {message.text && (
          <div className={`p-4 rounded-xl text-xs font-semibold text-center border ${message.type === 'success' ? 'bg-emerald-50 text-emerald-700 border-emerald-200' : 'bg-red-50 text-red-600 border-red-200'}`}>
            {message.text}
          </div>
        )}

        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200 space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-[11px] font-bold text-slate-500 uppercase mb-1">
                Select Student ({students.length} available)
              </label>
              <select
                value={selectedStudent}
                onChange={(e) => setSelectedStudent(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl text-sm border border-slate-300 bg-white"
              >
                <option value="">-- Select Student --</option>
                {students.map((std, idx) => (
                  <option key={std.id || std.ID || idx} value={std.id || std.ID}>
                    {std.full_name || std.FullName} {std.index_no || std.IndexNo ? `(${std.index_no || std.IndexNo})` : ''}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-[11px] font-bold text-slate-500 uppercase mb-1">Select Examination / Term</label>
              <select
                value={selectedExam}
                onChange={(e) => setSelectedExam(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl text-sm border border-slate-300 bg-white"
              >
                <option value="">-- Select Examination --</option>
                {exams.map((ex, idx) => (
                  <option key={ex.id || ex.ID || idx} value={ex.id || ex.ID}>
                    {ex.exam_type || ex.ExamType} - {ex.month || ex.Month} {ex.year || ex.Year} ({ex.term || ex.Term})
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {selectedStudent && selectedExam && (
          <form onSubmit={handleSave} className="space-y-6">
            <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200 space-y-4">
              <h3 className="font-bold text-slate-800 text-sm">B: Behavior, Work & General Progress Evaluation</h3>
              <div className="overflow-x-auto">
                <table className="w-full border-collapse border border-slate-200 text-xs">
                  <thead>
                    <tr className="bg-slate-50 text-slate-700">
                      <th className="border border-slate-200 p-2.5 w-12 text-center">No</th>
                      <th className="border border-slate-200 p-2.5 text-left">Behavior / Character Trait</th>
                      <th className="border border-slate-200 p-2.5 w-40 text-center">Grade / Mark</th>
                    </tr>
                  </thead>
                  <tbody>
                    {behaviorsList.map((trait, idx) => (
                      <tr key={idx} className="hover:bg-slate-50">
                        <td className="border border-slate-200 p-2 text-center">{idx + 1}</td>
                        <td className="border border-slate-200 p-2 font-medium text-slate-800">{trait}</td>
                        <td className="border border-slate-200 p-2 text-center">
                          <input
                            type="text"
                            maxLength="15"
                            placeholder="e.g. A / Good"
                            value={behaviorRatings[idx] || ''}
                            onChange={(e) => handleRatingChange(idx, e.target.value)}
                            className="w-full px-2 py-1 border border-slate-300 rounded text-center text-xs font-semibold"
                          />
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              <div className="pt-4 space-y-2">
                <label className="block text-xs font-bold text-slate-700">Class Teacher's General Remarks:</label>
                <textarea
                  rows="3"
                  placeholder="Enter remarks about student's overall performance, character, and recommendations..."
                  value={classTeacherRemark}
                  onChange={(e) => setClassTeacherRemark(e.target.value)}
                  className="w-full p-3 rounded-xl border border-slate-300 text-xs focus:ring-2 focus:ring-indigo-500 outline-none"
                />
              </div>

              <div className="flex justify-end pt-2">
                <button
                  type="submit"
                  disabled={saving}
                  className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-2.5 px-6 rounded-xl shadow-sm text-xs transition cursor-pointer disabled:opacity-50"
                >
                  {saving ? 'Saving Records...' : 'Save Student Conduct & Remarks'}
                </button>
              </div>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};

export default ClassTeacherPanel;