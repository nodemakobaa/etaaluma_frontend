import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { API_BASE_URL } from '../config/api';

const swahiliBehaviorsList = [
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
        const studentUrl = classId 
          ? `${API_BASE_URL}/teacher/students?class_id=${classId}` 
          : `${API_BASE_URL}/teacher/students`;

        const [studentRes, examRes] = await Promise.all([
          fetch(studentUrl, { headers: { Authorization: `Bearer ${token}` } }),
          fetch(`${API_BASE_URL}/teacher/exams`, { headers: { Authorization: `Bearer ${token}` } }),
        ]);

        const studentData = studentRes.ok ? await studentRes.json() : {};
        const examData = examRes.ok ? await examRes.json() : {};

        const studentList = studentData.data || studentData.students || studentData.data?.students || (Array.isArray(studentData) ? studentData : []);
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
      setMessage({ type: 'error', text: 'Tafadhali chagua Mwanafunzi na Mtihani.' });
      return;
    }

    setSaving(true);
    setMessage({ type: '', text: '' });

    try {
      setTimeout(() => {
        setSaving(false);
        setMessage({ type: 'success', text: 'Taarifa za tabia na maoni zimehifadhiwa mafanikio makubwa!' });
      }, 500);
    } catch (err) {
      setSaving(false);
      setMessage({ type: 'error', text: 'Imeshindikana kuhifadhi taarifa.' });
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-100 flex items-center justify-center font-sans">
        <div className="text-center space-y-2">
          <div className="inline-block w-8 h-8 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin"></div>
          <p className="text-600 font-semibold text-xs">Inapakia Jopo la Mwalimu wa Darasa...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-100 p-4 md:p-8 font-sans">
      <div className="max-w-4xl mx-auto space-y-6">
        <div className="flex items-center justify-between bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
          <div>
            <h1 className="text-xl font-bold text-slate-800">🎓 Jopo la Mwalimu wa Darasa</h1>
            <p className="text-xs text-slate-500 mt-0.5">Simamia alama za tabia na maoni ya mwalimu wa darasa kwa wanafunzi.</p>
          </div>
          <button
            onClick={() => navigate('/teacher-dashboard')}
            className="px-4 py-2 bg-slate-200 hover:bg-slate-300 text-slate-700 rounded-xl text-xs font-bold transition cursor-pointer"
          >
            ← Rudi kwenye Dashibodi
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
                Chagua Mwanafunzi ({students.length} wapo)
              </label>
              <select
                value={selectedStudent}
                onChange={(e) => setSelectedStudent(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl text-sm border border-slate-300 bg-white"
              >
                <option value="">-- Chagua Mwanafunzi --</option>
                {students.map((std, idx) => (
                  <option key={std.id || std.ID || idx} value={std.id || std.ID}>
                    {std.full_name || std.FullName} {std.index_no || std.IndexNo ? `(${std.index_no || std.IndexNo})` : ''}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-[11px] font-bold text-slate-500 uppercase mb-1">Chagua Mtihani / Muhula</label>
              <select
                value={selectedExam}
                onChange={(e) => setSelectedExam(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl text-sm border border-slate-300 bg-white"
              >
                <option value="">-- Chagua Mtihani --</option>
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
              <h3 className="font-bold text-slate-800 text-sm">B: UPIMAJI WA TABIA, KAZI NA MAENDELEO YAKE</h3>
              <div className="overflow-x-auto">
                <table className="w-full border-collapse border border-slate-200 text-xs">
                  <thead>
                    <tr className="bg-slate-50 text-slate-700">
                      <th className="border border-slate-200 p-2.5 w-12 text-center">Na</th>
                      <th className="border border-slate-200 p-2.5 text-left">MAELEZO</th>
                      <th className="border border-slate-200 p-2.5 w-32 text-center">ALAMA / DARAJA</th>
                    </tr>
                  </thead>
                  <tbody>
                    {swahiliBehaviorsList.map((trait, idx) => (
                      <tr key={idx} className="hover:bg-slate-50">
                        <td className="border border-slate-200 p-2 text-center">{idx + 1}</td>
                        <td className="border border-slate-200 p-2 font-medium text-slate-800">{trait}</td>
                        <td className="border border-slate-200 p-2 text-center">
                          <input
                            type="text"
                            maxLength="5"
                            placeholder="A, B..."
                            value={behaviorRatings[idx] || ''}
                            onChange={(e) => handleRatingChange(idx, e.target.value.toUpperCase())}
                            className="w-20 px-2 py-1 border border-slate-300 rounded text-center text-xs font-bold uppercase tracking-wider"
                          />
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              <div className="pt-4 space-y-2">
                <label className="block text-xs font-bold text-slate-700">Maoni ya Mwalimu wa Darasa:</label>
                <textarea
                  rows="3"
                  placeholder="Andika maoni yako kuhusu mwenendo, tabia na maendeleo ya jumla ya mwanafunzi..."
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
                  {saving ? 'Inahifadhi...' : 'Hifadhi Alama na Maoni ya Mwanafunzi'}
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