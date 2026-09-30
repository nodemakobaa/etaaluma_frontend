import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { API_BASE_URL } from '../config/api';

const monthsList = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December',
];

const examTypes = ['Test', 'Monthly Test', 'Mid-Term', 'Terminal', 'Mock', 'Pre-Mock', 'Pre-necta', 'Annual'];
const terms = ['First Term', 'Second Term'];

const toLocalDateTimeInput = (date) => {
  const d = new Date(date);
  if (Number.isNaN(d.getTime())) return '';
  const pad = (n) => String(n).padStart(2, '0');
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
};

const formatDeadline = (value) => {
  if (!value) return 'Not set';
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return 'Invalid date';
  return d.toLocaleString([], { dateStyle: 'medium', timeStyle: 'short' });
};

const ExamManagement = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const token = user?.token || JSON.parse(localStorage.getItem('school_user') || '{}')?.token || localStorage.getItem('token');

  const [exams, setExams] = useState([]);
  const [year, setYear] = useState(new Date().getFullYear());
  const [month, setMonth] = useState('');
  const [term, setTerm] = useState('');
  const [examType, setExamType] = useState('');
  const [deadline, setDeadline] = useState('');

  const [editingExam, setEditingExam] = useState(null);
  const [editYear, setEditYear] = useState('');
  const [editMonth, setEditMonth] = useState('');
  const [editTerm, setEditTerm] = useState('');
  const [editExamType, setEditExamType] = useState('');
  const [editDeadline, setEditDeadline] = useState('');

  const [unlockingExam, setUnlockingExam] = useState(null);
  const [unlockDeadline, setUnlockDeadline] = useState('');

  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });

  const headers = useMemo(() => ({ Authorization: `Bearer ${token}` }), [token]);

  const fetchExams = async () => {
    setLoading(true);
    try {
      const res = await fetch(`${API_BASE_URL}/admin/exams`, { headers });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data.message || 'Failed to fetch exams.');
      setExams(data.data || []);
    } catch (err) {
      console.error('Fetch exams error:', err);
      setMessage({ type: 'error', text: err.message || 'Failed to connect to backend.' });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchExams();
  }, []);

  const handleRegisterExam = async (e) => {
    e.preventDefault();
    if (!year || !month || !term || !examType || !deadline) {
      setMessage({ type: 'error', text: 'Please fill all required fields, including the marks entry deadline.' });
      return;
    }

    setSubmitting(true);
    setMessage({ type: '', text: '' });
    try {
      const res = await fetch(`${API_BASE_URL}/admin/exams`, {
        method: 'POST',
        headers: { ...headers, 'Content-Type': 'application/json' },
        body: JSON.stringify({
          year: Number(year),
          month,
          term,
          exam_type: examType,
          marks_entry_deadline: deadline,
        }),
      });
      const result = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(result.message || 'Failed to register exam.');

      setMessage({ type: 'success', text: 'Exam registered successfully!' });
      setMonth('');
      setTerm('');
      setExamType('');
      setDeadline('');
      await fetchExams();
    } catch (err) {
      setMessage({ type: 'error', text: err.message || 'Network connection error.' });
    } finally {
      setSubmitting(false);
    }
  };

  const handleEditClick = (exam) => {
    setEditingExam(exam);
    setEditYear(exam.year);
    setEditMonth(exam.month);
    setEditTerm(exam.term);
    setEditExamType(exam.exam_type);
    setEditDeadline(toLocalDateTimeInput(exam.marks_entry_deadline));
  };

  const handleUpdateExam = async (e) => {
    e.preventDefault();
    const examId = editingExam?.id || editingExam?.ID;
    if (!examId) return;

    setSubmitting(true);
    setMessage({ type: '', text: '' });
    try {
      const res = await fetch(`${API_BASE_URL}/admin/exams/${examId}`, {
        method: 'PUT',
        headers: { ...headers, 'Content-Type': 'application/json' },
        body: JSON.stringify({
          year: Number(editYear),
          month: editMonth,
          term: editTerm,
          exam_type: editExamType,
          marks_entry_deadline: editDeadline,
        }),
      });
      const result = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(result.message || 'Failed to update exam.');

      setMessage({ type: 'success', text: 'Exam updated successfully!' });
      setEditingExam(null);
      await fetchExams();
    } catch (err) {
      setMessage({ type: 'error', text: err.message || 'Failed to update exam.' });
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this exam entry?')) return;
    try {
      const res = await fetch(`${API_BASE_URL}/admin/exams/${id}`, { method: 'DELETE', headers });
      const result = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(result.message || 'Failed to delete exam.');
      setMessage({ type: 'success', text: 'Exam deleted successfully.' });
      await fetchExams();
    } catch (err) {
      setMessage({ type: 'error', text: err.message || 'Failed to delete exam.' });
    }
  };

  const handleLock = async (exam) => {
    const id = exam.id || exam.ID;
    if (!window.confirm(`Lock ${exam.exam_type} (${exam.month} ${exam.year})? Teachers will no longer be able to enter or edit marks.`)) return;
    try {
      const res = await fetch(`${API_BASE_URL}/admin/exams/${id}/lock`, { method: 'POST', headers });
      const result = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(result.message || 'Failed to lock exam.');
      setMessage({ type: 'success', text: 'Exam locked successfully.' });
      await fetchExams();
    } catch (err) {
      setMessage({ type: 'error', text: err.message || 'Failed to lock exam.' });
    }
  };

  const openUnlock = (exam) => {
    setUnlockingExam(exam);
    setUnlockDeadline('');
  };

  const handleUnlock = async (e) => {
    e.preventDefault();
    const id = unlockingExam?.id || unlockingExam?.ID;
    if (!id || !unlockDeadline) {
      setMessage({ type: 'error', text: 'Please select a new marks entry deadline.' });
      return;
    }
    setSubmitting(true);
    try {
      const res = await fetch(`${API_BASE_URL}/admin/exams/${id}/unlock`, {
        method: 'POST',
        headers: { ...headers, 'Content-Type': 'application/json' },
        body: JSON.stringify({ new_deadline: unlockDeadline }),
      });
      const result = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(result.message || 'Failed to unlock exam.');
      setMessage({ type: 'success', text: 'Exam unlocked successfully with the new deadline.' });
      setUnlockingExam(null);
      setUnlockDeadline('');
      await fetchExams();
    } catch (err) {
      setMessage({ type: 'error', text: err.message || 'Failed to unlock exam.' });
    } finally {
      setSubmitting(false);
    }
  };

  const canUnlock = (exam) => {
    if (!exam.is_locked || !exam.locked_at) return false;
    return Date.now() <= new Date(exam.locked_at).getTime() + 48 * 60 * 60 * 1000;
  };

  return (
    <div className="min-h-screen bg-slate-100 p-6 flex justify-center">
      <div className="max-w-7xl w-full space-y-6">
        <button onClick={() => navigate('/academic-dashboard')} className="text-slate-600 hover:text-slate-900 text-sm font-semibold flex items-center gap-2">
          <span>←</span> Back to Dashboard
        </button>

        <div className="bg-white p-6 md:p-8 rounded-2xl border border-slate-200 shadow-sm space-y-6">
          <div className="border-b border-slate-100 pb-4">
            <h2 className="text-2xl font-bold text-slate-800">Examination Management</h2>
            <p className="text-slate-500 text-sm mt-1">Create examinations and control the marks entry deadline.</p>
          </div>

          {message.text && (
            <div className={`p-4 rounded-xl text-xs font-semibold ${message.type === 'success' ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' : 'bg-red-50 text-red-600 border border-red-200'}`}>
              {message.text}
            </div>
          )}

          <form onSubmit={handleRegisterExam} className="grid grid-cols-1 md:grid-cols-5 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-600 uppercase mb-1">Academic Year</label>
              <input type="number" min="2000" max="2100" required value={year} onChange={(e) => setYear(e.target.value)} className="w-full px-4 py-2.5 rounded-xl text-sm border border-slate-300 bg-white" />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-600 uppercase mb-1">Exam Month</label>
              <select required value={month} onChange={(e) => setMonth(e.target.value)} className="w-full px-4 py-2.5 rounded-xl text-sm border border-slate-300 bg-white">
                <option value="">-- Select Month --</option>
                {monthsList.map((m) => <option key={m} value={m}>{m}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-600 uppercase mb-1">Term</label>
              <select required value={term} onChange={(e) => setTerm(e.target.value)} className="w-full px-4 py-2.5 rounded-xl text-sm border border-slate-300 bg-white">
                <option value="">-- Choose Term --</option>
                {terms.map((t) => <option key={t} value={t}>{t}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-600 uppercase mb-1">Exam Category</label>
              <select required value={examType} onChange={(e) => setExamType(e.target.value)} className="w-full px-4 py-2.5 rounded-xl text-sm border border-slate-300 bg-white">
                <option value="">-- Choose Category --</option>
                {examTypes.map((t) => <option key={t} value={t}>{t}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-600 uppercase mb-1">Marks Entry Deadline</label>
              <input type="datetime-local" required value={deadline} onChange={(e) => setDeadline(e.target.value)} className="w-full px-4 py-2.5 rounded-xl text-sm border border-slate-300 bg-white" />
            </div>
            <div className="md:col-span-5 pt-2">
              <button type="submit" disabled={submitting} className="bg-purple-600 hover:bg-purple-500 text-white font-bold text-xs px-6 py-3 rounded-xl shadow-sm disabled:opacity-50">
                {submitting ? 'Registering...' : 'Register Examination'}
              </button>
            </div>
          </form>
        </div>

        <div className="bg-white p-6 md:p-8 rounded-2xl border border-slate-200 shadow-sm space-y-4">
          <h3 className="text-lg font-bold text-slate-800">Registered Examinations ({exams.length})</h3>
          {loading ? <p className="text-slate-500 text-sm">Loading exams...</p> : exams.length === 0 ? <p className="text-slate-400 text-sm">No exams registered yet.</p> : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm text-slate-600">
                <thead className="bg-slate-50 text-slate-700 uppercase text-xs font-bold">
                  <tr>
                    <th className="p-3">#</th><th className="p-3">Year</th><th className="p-3">Month</th><th className="p-3">Term</th><th className="p-3">Exam</th><th className="p-3">Deadline</th><th className="p-3">Status</th><th className="p-3 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {exams.map((item, idx) => {
                    const id = item.id || item.ID;
                    const locked = Boolean(item.is_locked);
                    return (
                      <tr key={id || idx} className="hover:bg-slate-50">
                        <td className="p-3 font-semibold">{idx + 1}</td>
                        <td className="p-3">{item.year}</td>
                        <td className="p-3">{item.month}</td>
                        <td className="p-3">{item.term}</td>
                        <td className="p-3 font-semibold text-purple-700">{item.exam_type}</td>
                        <td className="p-3 text-xs">{formatDeadline(item.marks_entry_deadline)}</td>
                        <td className="p-3">
                          <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold ${locked ? 'bg-red-50 text-red-700 border border-red-200' : 'bg-emerald-50 text-emerald-700 border border-emerald-200'}`}>
                            {locked ? 'LOCKED' : 'OPEN'}
                          </span>
                        </td>
                        <td className="p-3 text-right space-x-1.5 whitespace-nowrap">
                          {/* BUTTON YA VIEW MARKS IMEONDOLEWA HAPA KWA MAHITAJI YAKO */}
                          {!locked && <button onClick={() => handleEditClick(item)} className="text-xs text-blue-600 bg-blue-50 px-2.5 py-1.5 rounded-lg font-bold">Edit</button>}
                          {!locked ? <button onClick={() => handleLock(item)} className="text-xs text-orange-700 bg-orange-50 px-2.5 py-1.5 rounded-lg font-bold">Lock</button> : canUnlock(item) ? <button onClick={() => openUnlock(item)} className="text-xs text-emerald-700 bg-emerald-50 px-2.5 py-1.5 rounded-lg font-bold">Unlock</button> : <span className="text-[10px] font-bold text-slate-400">Unlock window expired</span>}
                          {!locked && <button onClick={() => handleDelete(id)} className="text-xs text-red-600 bg-red-50 px-2.5 py-1.5 rounded-lg font-bold">Delete</button>}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {editingExam && (
          <div className="fixed inset-0 bg-slate-900/50 flex items-center justify-center p-4 z-50">
            <form onSubmit={handleUpdateExam} className="bg-white rounded-2xl shadow-2xl p-6 w-full max-w-lg space-y-4">
              <h3 className="text-xl font-bold text-slate-800">Edit Examination</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <input type="number" min="2000" max="2100" required value={editYear} onChange={(e) => setEditYear(e.target.value)} className="px-4 py-2.5 rounded-xl border border-slate-300" />
                <select required value={editMonth} onChange={(e) => setEditMonth(e.target.value)} className="px-4 py-2.5 rounded-xl border border-slate-300">{monthsList.map((m) => <option key={m}>{m}</option>)}</select>
                <select required value={editTerm} onChange={(e) => setEditTerm(e.target.value)} className="px-4 py-2.5 rounded-xl border border-slate-300">{terms.map((t) => <option key={t}>{t}</option>)}</select>
                <select required value={editExamType} onChange={(e) => setEditExamType(e.target.value)} className="px-4 py-2.5 rounded-xl border border-slate-300">{examTypes.map((t) => <option key={t}>{t}</option>)}</select>
              </div>
              <label className="block text-xs font-bold text-slate-600 uppercase">Marks Entry Deadline</label>
              <input type="datetime-local" required value={editDeadline} onChange={(e) => setEditDeadline(e.target.value)} className="w-full px-4 py-2.5 rounded-xl border border-slate-300" />
              <div className="flex justify-end gap-2">
                <button type="button" onClick={() => setEditingExam(null)} className="px-4 py-2 rounded-xl bg-slate-100 text-xs font-bold">Cancel</button>
                <button type="submit" disabled={submitting} className="px-4 py-2 rounded-xl bg-purple-600 text-white text-xs font-bold">{submitting ? 'Saving...' : 'Save Changes'}</button>
              </div>
            </form>
          </div>
        )}

        {unlockingExam && (
          <div className="fixed inset-0 bg-slate-900/50 flex items-center justify-center p-4 z-50">
            <form onSubmit={handleUnlock} className="bg-white rounded-2xl shadow-2xl p-6 w-full max-w-lg space-y-4">
              <h3 className="text-xl font-bold text-slate-800">Unlock Examination</h3>
              <p className="text-sm text-slate-500">You can unlock this examination only within 48 hours of the lock time. A new future deadline is required.</p>
              <label className="block text-xs font-bold text-slate-600 uppercase">New Marks Entry Deadline</label>
              <input type="datetime-local" required value={unlockDeadline} onChange={(e) => setUnlockDeadline(e.target.value)} className="w-full px-4 py-2.5 rounded-xl border border-slate-300" />
              <div className="flex justify-end gap-2">
                <button type="button" onClick={() => setUnlockingExam(null)} className="px-4 py-2 rounded-xl bg-slate-100 text-xs font-bold">Cancel</button>
                <button type="submit" disabled={submitting} className="px-4 py-2 rounded-xl bg-emerald-600 text-white text-xs font-bold">{submitting ? 'Unlocking...' : 'Unlock Examination'}</button>
              </div>
            </form>
          </div>
        )}
      </div>
    </div>
  );
};

export default ExamManagement;