import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { API_BASE_URL } from '../config/api';

const SubjectManagement = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [subjects, setSubjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [subjectName, setSubjectName] = useState('');
  const [subjectCode, setSubjectCode] = useState('');
  const [shortName, setShortName] = useState('');
  const [category, setCategory] = useState('Core');
  const [editingSubject, setEditingSubject] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });

  const token = user?.token || localStorage.getItem('token');

  const fetchSubjects = async () => {
    try {
      const res = await fetch(`${API_BASE_URL}/admin/subjects`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const result = await res.json();
      if (res.ok && result.status === 'success') setSubjects(result.data || []);
    } catch (err) {
      console.error('Error fetching subjects:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSubjects();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setMessage({ type: '', text: '' });

    const isEdit = !!editingSubject;
    const url = isEdit
      ? `${API_BASE_URL}/admin/subjects/${editingSubject.ID || editingSubject.id}`
      : `${API_BASE_URL}/admin/subjects`;

    try {
      const res = await fetch(url, {
        method: isEdit ? 'PUT' : 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({
          subject_name: subjectName,
          subject_code: subjectCode,
          short_name: shortName,
          category: category,
        }),
      });

      const result = await res.json();
      if (res.ok && result.status === 'success') {
        setMessage({
          type: 'success',
          text: isEdit ? 'Subject updated successfully!' : 'Subject created successfully!',
        });
        resetForm();
        fetchSubjects();
      } else {
        setMessage({ type: 'error', text: result.message || 'Operation failed.' });
      }
    } catch (err) {
      setMessage({ type: 'error', text: 'Network connection error.' });
    } finally {
      setSubmitting(false);
    }
  };

  const resetForm = () => {
    setSubjectName('');
    setSubjectCode('');
    setShortName('');
    setCategory('Core');
    setEditingSubject(null);
  };

  const handleEdit = (s) => {
    setEditingSubject(s);
    setSubjectName(s.subject_name || s.SubjectName || '');
    setSubjectCode(s.subject_code || s.SubjectCode || '');
    setShortName(s.short_name || s.ShortName || '');
    setCategory(s.category || s.Category || 'Core');
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this subject?')) return;

    try {
      const res = await fetch(`${API_BASE_URL}/admin/subjects/${id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
      });
      const result = await res.json();
      if (res.ok && result.status === 'success') {
        setMessage({ type: 'success', text: 'Subject deleted successfully.' });
        fetchSubjects();
      }
    } catch (err) {
      setMessage({ type: 'error', text: 'Network error.' });
    }
  };

  return (
    <div className="min-h-screen bg-slate-100 p-6 flex justify-center">
      <div className="max-w-4xl w-full space-y-6">
        <button
          onClick={() => navigate('/academic-dashboard')}
          className="text-slate-600 hover:text-slate-900 text-sm font-semibold flex items-center gap-2 cursor-pointer"
        >
          <span>←</span> Back to Dashboard
        </button>

        <div className="bg-white p-6 md:p-8 rounded-2xl border border-slate-200 shadow-sm space-y-6">
          <div className="flex justify-between items-center border-b border-slate-100 pb-4">
            <div>
              <h2 className="text-2xl font-bold text-slate-800">
                {editingSubject ? 'Edit Subject' : 'Subject Registration'}
              </h2>
              <p className="text-slate-500 text-sm mt-1">Configure subjects, abbreviations, and codes.</p>
            </div>
            {editingSubject && (
              <button
                onClick={resetForm}
                className="text-xs text-red-600 font-bold underline cursor-pointer"
              >
                Cancel Edit
              </button>
            )}
          </div>

          {message.text && (
            <div
              className={`p-4 rounded-xl text-xs font-semibold ${
                message.type === 'success'
                  ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                  : 'bg-red-50 text-red-600 border border-red-200'
              }`}
            >
              {message.text}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4 max-w-lg">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-600 uppercase mb-1">Subject Name</label>
                <input
                  type="text"
                  required
                  value={subjectName}
                  onChange={(e) => setSubjectName(e.target.value)}
                  placeholder="Basic Mathematics"
                  className="w-full px-4 py-2.5 rounded-xl text-sm border border-slate-300 outline-none focus:ring-2 focus:ring-purple-500"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-600 uppercase mb-1">Short Name</label>
                <input
                  type="text"
                  required
                  value={shortName}
                  onChange={(e) => setShortName(e.target.value)}
                  placeholder="B/MATH"
                  className="w-full px-4 py-2.5 rounded-xl text-sm border border-slate-300 outline-none focus:ring-2 focus:ring-purple-500"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-600 uppercase mb-1">Subject Code</label>
                <input
                  type="text"
                  required
                  value={subjectCode}
                  onChange={(e) => setSubjectCode(e.target.value)}
                  placeholder="041"
                  className="w-full px-4 py-2.5 rounded-xl text-sm border border-slate-300 outline-none focus:ring-2 focus:ring-purple-500"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-600 uppercase mb-1">Category</label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl text-sm border border-slate-300 outline-none focus:ring-2 focus:ring-purple-500"
                >
                  <option value="Core">Core</option>
                  <option value="Elective">Elective</option>
                  <option value="Optional">Optional</option>
                </select>
              </div>
            </div>

            <div className="pt-2">
              <button
                type="submit"
                disabled={submitting}
                className="bg-purple-600 hover:bg-purple-500 text-white font-bold text-xs px-6 py-3 rounded-xl shadow-sm cursor-pointer disabled:opacity-50"
              >
                {submitting ? 'Saving...' : editingSubject ? 'Update Subject' : 'Save Subject'}
              </button>
            </div>
          </form>
        </div>

        {/* Subjects Table */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4">
          <h3 className="text-lg font-bold text-slate-800">Registered Subjects ({subjects.length})</h3>
          {loading ? (
            <p className="text-slate-500 text-sm">Loading subjects...</p>
          ) : subjects.length === 0 ? (
            <p className="text-slate-400 text-sm">No subjects registered yet.</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm text-slate-600">
                <thead className="bg-slate-50 text-slate-700 uppercase text-xs font-bold">
                  <tr>
                    <th className="p-3">#</th>
                    <th className="p-3">Subject Name</th>
                    <th className="p-3">Short Name</th>
                    <th className="p-3">Code</th>
                    <th className="p-3">Category</th>
                    <th className="p-3 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {subjects.map((s, idx) => (
                    <tr key={s.ID || s.id || idx} className="hover:bg-slate-50 transition">
                      <td className="p-3 font-semibold text-slate-800">{idx + 1}</td>
                      <td className="p-3 font-medium text-slate-900">{s.subject_name || s.SubjectName}</td>
                      <td className="p-3 font-bold text-slate-700">{s.short_name || s.ShortName || '-'}</td>
                      <td className="p-3 font-mono text-purple-700 font-bold">{s.subject_code || s.SubjectCode}</td>
                      <td className="p-3">{s.category || s.Category || 'Core'}</td>
                      <td className="p-3 text-right space-x-2">
                        <button
                          onClick={() => handleEdit(s)}
                          className="text-xs text-blue-600 hover:text-blue-800 font-bold bg-blue-50 px-3 py-1 rounded-lg cursor-pointer"
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => handleDelete(s.ID || s.id)}
                          className="text-xs text-red-600 hover:text-red-800 font-bold bg-red-50 px-3 py-1 rounded-lg cursor-pointer"
                        >
                          Delete
                        </button>
                      </td>
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

export default SubjectManagement;
