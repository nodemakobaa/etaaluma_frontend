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
  const [evaluatedStudentIds, setEvaluatedStudentIds] = useState([]);
  
  const [selectedStudent, setSelectedStudent] = useState('');
  const [selectedExam, setSelectedExam] = useState('');
  
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });
  const [showEvaluatedList, setShowEvaluatedList] = useState(false);

  const [behaviorRatings, setBehaviorRatings] = useState({});
  const [classTeacherRemark, setClassTeacherRemark] = useState('');

  // 1. Kupakua Wanafunzi na Mitihani
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

        setStudents(studentData.data || studentData.students || []);
        setExams(examData.data || examData.exams || []);
      } catch (err) {
        console.error('Failed to load panel data', err);
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, [classId, token]);

  // 2. Kupakua orodha ya waliokwishajaziwa pindi Exam inapochaguliwa
  useEffect(() => {
    if (!selectedExam) {
      setEvaluatedStudentIds([]);
      return;
    }
    const fetchEvaluated = async () => {
      try {
        const res = await fetch(`${API_BASE_URL}/teacher/evaluated-students?exam_id=${selectedExam}&class_id=${classId || ''}`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        const data = await res.json();
        if (data.status === 'success') {
          const evaluatedIds = (data.data || []).map(item => item.StudentID || item.student_id);
          setEvaluatedStudentIds(evaluatedIds);
        }
      } catch (err) {
        console.error("Error fetching evaluated students", err);
      }
    };
    fetchEvaluated();
  }, [selectedExam, classId, token]);

  // 3. Kupakua data za mwanafunzi aliyechaguliwa (Kama tayari alijazwa, zimlete ili afanye Edit)
  useEffect(() => {
    if (!selectedStudent || !selectedExam) {
      setBehaviorRatings({});
      setClassTeacherRemark('');
      return;
    }

    const fetchStudentBehavior = async () => {
      try {
        const res = await fetch(`${API_BASE_URL}/teacher/behavior?student_id=${selectedStudent}&exam_id=${selectedExam}`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        const data = await res.json();
        if (data.status === 'success' && data.data) {
          try {
            setBehaviorRatings(JSON.parse(data.data.Ratings || data.data.ratings || '{}'));
          } catch {
            setBehaviorRatings({});
          }
          setClassTeacherRemark(data.data.ClassTeacherRemark || data.data.class_teacher_remark || '');
        } else {
          setBehaviorRatings({});
          setClassTeacherRemark('');
        }
      } catch (err) {
        console.error("Failed to fetch specific student behavior", err);
      }
    };
    fetchStudentBehavior();
  }, [selectedStudent, selectedExam, token]);

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
      const res = await fetch(`${API_BASE_URL}/teacher/behavior`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({
          student_id: Number(selectedStudent),
          exam_id: Number(selectedExam),
          ratings: JSON.stringify(behaviorRatings),
          class_teacher_remark: classTeacherRemark
        })
      });

      const data = await res.json();
      if (res.ok && data.status === 'success') {
        setMessage({ type: 'success', text: 'Taarifa za tabia na maoni zimehifadhiwa mafanikio makubwa!' });
        // Ongeza kwenye evaluated list papo hapo ili atoweke kwenye dropdown ya waliobakia
        if (!evaluatedStudentIds.includes(Number(selectedStudent))) {
          setEvaluatedStudentIds([...evaluatedStudentIds, Number(selectedStudent)]);
        }
      } else {
        throw new Error(data.message || 'Imeshindikana kuhifadhi.');
      }
    } catch (err) {
      setMessage({ type: 'error', text: err.message || 'Imeshindikana kuhifadhi taarifa.' });
    } finally {
      setSaving(false);
    }
  };

  // Kuchuja wanafunzi ambao bado hawajajazwa (isipokuwa yule ambaye yuko selected kwa sasa kwa ajili ya ku-edit)
  const availableStudents = students.filter(std => {
    const id = std.id || std.ID;
    return !evaluatedStudentIds.includes(id) || String(id) === String(selectedStudent);
  });

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-100 flex items-center justify-center font-sans">
        <div className="text-center space-y-2">
          <div className="inline-block w-8 h-8 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin"></div>
          <p className="text-slate-600 font-semibold text-xs">Inapakia Jopo la Mwalimu wa Darasa...</p>
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
          <div className="flex gap-2">
            <button
              onClick={() => setShowEvaluatedList(!showEvaluatedList)}
              className="px-4 py-2 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 rounded-xl text-xs font-bold transition cursor-pointer"
            >
              {showEvaluatedList ? 'Ficha Waliokwishajazwa' : `Waliokwishajazwa (${evaluatedStudentIds.length})`}
            </button>
            <button
              onClick={() => navigate('/teacher-dashboard')}
              className="px-4 py-2 bg-slate-200 hover:bg-slate-300 text-slate-700 rounded-xl text-xs font-bold transition cursor-pointer"
            >
              ← Rudi
            </button>
          </div>
        </div>

        {showEvaluatedList && (
          <div className="bg-indigo-50 border border-indigo-200 p-4 rounded-2xl text-xs space-y-2">
            <h4 className="font-bold text-indigo-900">Wanafunzi waliokwishajazwa tabia kwenye mtihani huu (Bofya ili Kuedit):</h4>
            <div className="flex flex-wrap gap-2">
              {evaluatedStudentIds.length === 0 ? (hakunaWaliokwishajazwaText => <p className="text-slate-500">Hakuna mwanafunzi aliyejazwa bado.</p>)() : null}
              {evaluatedStudentIds.map(id => {
                const std = students.find(s => (s.id || s.ID) === id);
                return std ? (
                  <button
                    key={id}
                    onClick={() => { setSelectedStudent(String(id)); setShowEvaluatedList(false); }}
                    className="px-3 py-1.5 bg-white border border-indigo-300 text-indigo-700 rounded-lg font-semibold hover:bg-indigo-600 hover:text-white transition shadow-xs"
                  >
                    {std.full_name || std.FullName}
                  </button>
                ) : null;
              })}
            </div>
          </div>
        )}

        {message.text && (
          <div className={`p-4 rounded-xl text-xs font-semibold text-center border ${message.type === 'success' ? 'bg-emerald-50 text-emerald-700 border-emerald-200' : 'bg-red-50 text-red-600 border-red-200'}`}>
            {message.text}
          </div>
        )}

        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200 space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-[11px] font-bold text-slate-500 uppercase mb-1">
                Chagua Mtihani / Muhula (Lazima)
              </label>
              <select
                value={selectedExam}
                onChange={(e) => { setSelectedExam(e.target.value); setSelectedStudent(''); }}
                className="w-full px-3.5 py-2.5 rounded-xl text-sm border border-slate-300 bg-white"
              >
                <option value="">-- Chagua Mtihani Kwanza --</option>
                {exams.map((ex, idx) => (
                  <option key={ex.id || ex.ID || idx} value={ex.id || ex.ID}>
                    {ex.exam_type || ex.ExamType} - {ex.month || ex.Month} {ex.year || ex.Year} ({ex.term || ex.Term})
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-[11px] font-bold text-slate-500 uppercase mb-1">
                Chagua Mwanafunzi ({availableStudents.length} wamebaki)
              </label>
              <select
                value={selectedStudent}
                onChange={(e) => setSelectedStudent(e.target.value)}
                disabled={!selectedExam}
                className="w-full px-3.5 py-2.5 rounded-xl text-sm border border-slate-300 bg-white disabled:bg-slate-100"
              >
                <option value="">-- Chagua Mwanafunzi --</option>
                {availableStudents.map((std, idx) => {
                  const id = std.id || std.ID;
                  const isAlreadyDone = evaluatedStudentIds.includes(id);
                  return (
                    <option key={id || idx} value={id}>
                      {std.full_name || std.FullName} {isAlreadyDone ? ' (Tayari imejazwa - Inahaririwa)' : ''}
                    </option>
                  );
                })}
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
                  {saving ? 'Inahifadhi...' : 'Hifadhi / Sasisha Alama na Maoni'}
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