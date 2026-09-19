import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { API_BASE_URL } from '../config/api';

const TeacherManagement = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [teachers, setTeachers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [formData, setFormData] = useState({ fullName: '', email: '', phone: '', username: '', password: '' });
  const [editingTeacher, setEditingTeacher] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });

  const token = user?.token || localStorage.getItem('token');

  const fetchTeachers = async () => {
    try {
      const res = await fetch(`${API_BASE_URL}/admin/teachers`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const result = await res.json();
      if (res.ok && result.status === 'success') {
        setTeachers(result.data || []);
      }
    } catch (err) {
      console.error('Error fetching teachers:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTeachers();
  }, []);

  const handleChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setMessage({ type: '', text: '' });

    const isEdit = !!editingTeacher;
    const url = isEdit
      ? `${API_BASE_URL}/admin/teachers/${editingTeacher.ID || editingTeacher.id}`
      : `${API_BASE_URL}/admin/teachers`;

    const method = isEdit ? 'PUT' : 'POST';

    try {
      const res = await fetch(url, {
        method: method,
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({
          full_name: formData.fullName,
          email: formData.email,
          phone: formData.phone,
          username: formData.username,
          ...(isEdit ? {} : { password: formData.password }),
        }),
      });

      const result = await res.json();
      if (res.ok && result.status === 'success') {
        setMessage({ type: 'success', text: isEdit ? 'Teacher updated successfully!' : 'Teacher registered successfully!' });
        setFormData({ fullName: '', email: '', phone: '', username: '', password: '' });
        setEditingTeacher(null);
        fetchTeachers();
      } else {
        setMessage({ type: 'error', text: result.message || 'Operation failed.' });
      }
    } catch (err) {
      setMessage({ type: 'error', text: 'Network connection error.' });
    } finally {
      setSubmitting(false);
    }
  };

  const handleEdit = (teacher) => {
    setEditingTeacher(teacher);
    setFormData({
      fullName: teacher.full_name || teacher.FullName || '',
      email: teacher.email || teacher.Email || '',
      phone: teacher.phone || teacher.Phone || '',
      username: teacher.username || teacher.Username || '',
      password: '',
    });
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this teacher?')) return;

    try {
      const res = await fetch(`${API_BASE_URL}/admin/teachers/${id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
      });
      const result = await res.json();
      if (res.ok && result.status === 'success') {
        setMessage({ type: 'success', text: 'Teacher deleted successfully.' });
        fetchTeachers();
      } else {
        setMessage({ type: 'error', text: result.message || 'Failed to delete.' });
      }
    } catch (err) {
      setMessage({ type: 'error', text: 'Network error.' });
    }
  };

  return (
    <div className="min-h-screen bg-slate-100 p-6 flex justify-center">
      <div className="max-w-5xl w-full space-y-6">
        <button onClick={() => navigate('/academic-dashboard')} className="text-slate-600 hover:text-slate-900 text-sm font-semibold flex items-center gap-2 cursor-pointer">
          <span>←</span> Back to Dashboard
        </button>

        <div className="bg-white p-6 md:p-8 rounded-2xl border border-slate-200 shadow-sm space-y-6">
          <div className="flex justify-between items-center border-b border-slate-100 pb-4">
            <div>
              <h2 className="text-2xl font-bold text-slate-800">{editingTeacher ? 'Edit Teacher' : 'Teacher Registration'}</h2>
              <p className="text-slate-500 text-sm mt-1">{editingTeacher ? 'Update teacher details below.' : 'Register new teaching staff accounts.'}</p>
            </div>
            {editingTeacher && (
              <button
                onClick={() => {
                  setEditingTeacher(null);
                  setFormData({ fullName: '', email: '', phone: '', username: '', password: '' });
                }}
                className="text-xs text-red-600 font-bold underline cursor-pointer"
              >
                Cancel Edit
              </button>
            )}
          </div>

          {message.text && (
            <div className={`p-4 rounded-xl text-xs font-semibold ${message.type === 'success' ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' : 'bg-red-50 text-red-600 border border-red-200'}`}>
              {message.text}
            </div>
          )}

          <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-600 uppercase mb-1">Full Name</label>
              <input type="text" name="fullName" required value={formData.fullName} onChange={handleChange} className="w-full px-4 py-2.5 rounded-xl text-sm border border-slate-300 bg-white" />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-600 uppercase mb-1">Email Address</label>
              <input type="email" name="email" required value={formData.email} onChange={handleChange} className="w-full px-4 py-2.5 rounded-xl text-sm border border-slate-300 bg-white" />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-600 uppercase mb-1">Phone Number</label>
              <input type="text" name="phone" value={formData.phone} onChange={handleChange} className="w-full px-4 py-2.5 rounded-xl text-sm border border-slate-300 bg-white" />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-600 uppercase mb-1">Username (Login)</label>
              <input type="text" name="username" required value={formData.username} onChange={handleChange} className="w-full px-4 py-2.5 rounded-xl text-sm border border-slate-300 bg-white" />
            </div>

            {!editingTeacher && (
              <div className="md:col-span-2">
                <label className="block text-xs font-bold text-slate-600 uppercase mb-1">Default Password</label>
                <input type="password" name="password" required value={formData.password} onChange={handleChange} className="w-full px-4 py-2.5 rounded-xl text-sm border border-slate-300 bg-white" />
              </div>
            )}

            <div className="md:col-span-2 pt-2">
              <button type="submit" disabled={submitting} className="bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs px-6 py-3 rounded-xl shadow-sm cursor-pointer disabled:opacity-50">
                {submitting ? 'Saving...' : editingTeacher ? 'Update Teacher' : 'Save Teacher Profile'}
              </button>
            </div>
          </form>
        </div>

        {/* Registered Teachers Table */}
        <div className="bg-white p-6 md:p-8 rounded-2xl border border-slate-200 shadow-sm space-y-4">
          <h3 className="text-lg font-bold text-slate-800">Registered Teachers ({teachers.length})</h3>
          {loading ? (
            <p className="text-slate-500 text-sm">Loading teachers list...</p>
          ) : teachers.length === 0 ? (
            <p className="text-slate-400 text-sm">No teachers registered yet.</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm text-slate-600">
                <thead className="bg-slate-50 text-slate-700 uppercase text-xs font-bold">
                  <tr>
                    <th className="p-3">#</th>
                    <th className="p-3">Full Name</th>
                    <th className="p-3">Email</th>
                    <th className="p-3">Phone</th>
                    <th className="p-3">Username</th>
                    <th className="p-3 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {teachers.map((t, idx) => (
                    <tr key={t.ID || t.id || idx} className="hover:bg-slate-50 transition">
                      <td className="p-3 font-semibold text-slate-800">{idx + 1}</td>
                      <td className="p-3 font-medium text-slate-900">{t.full_name || t.FullName}</td>
                      <td className="p-3">{t.email || t.Email}</td>
                      <td className="p-3">{t.phone || t.Phone}</td>
                      <td className="p-3 font-mono text-xs">{t.username || t.Username}</td>
                      <td className="p-3 text-right space-x-2">
                        <button onClick={() => handleEdit(t)} className="text-xs text-blue-600 hover:text-blue-800 font-bold bg-blue-50 px-3 py-1 rounded-lg">Edit</button>
                        <button onClick={() => handleDelete(t.ID || t.id)} className="text-xs text-red-600 hover:text-red-800 font-bold bg-red-50 px-3 py-1 rounded-lg">Delete</button>
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

export default TeacherManagement;
