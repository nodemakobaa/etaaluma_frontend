import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { API_BASE_URL } from '../config/api';

const ClassManagement = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [classes, setClasses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [className, setClassName] = useState('');
  const [editingClass, setEditingClass] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });

  const token = user?.token || localStorage.getItem('token');

  const fetchClasses = async () => {
    try {
      const res = await fetch(`${API_BASE_URL}/admin/classes`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const result = await res.json();
      if (res.ok && result.status === 'success') {
        const sortedClasses = [...(result.data || [])].sort((a, b) => {
          const aName = a.class_name || a.ClassName || '';
          const bName = b.class_name || b.ClassName || '';
          const aMatch = aName.match(/(\d+)/);
          const bMatch = bName.match(/(\d+)/);
          if (aMatch && bMatch && Number(aMatch[1]) !== Number(bMatch[1])) {
            return Number(aMatch[1]) - Number(bMatch[1]);
          }
          return aName.localeCompare(bName, undefined, { numeric: true, sensitivity: 'base' });
        });
        setClasses(sortedClasses);
      }
    } catch (err) {
      console.error('Error fetching classes:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchClasses();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setMessage({ type: '', text: '' });

    const isEdit = !!editingClass;
    const url = isEdit
      ? `${API_BASE_URL}/admin/classes/${editingClass.ID || editingClass.id}`
      : `${API_BASE_URL}/admin/classes`;

    try {
      const res = await fetch(url, {
        method: isEdit ? 'PUT' : 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ class_name: className }),
      });

      const result = await res.json();
      if (res.ok && result.status === 'success') {
        setMessage({ type: 'success', text: isEdit ? 'Class updated successfully!' : 'Class created successfully!' });
        setClassName('');
        setEditingClass(null);
        fetchClasses();
      } else {
        setMessage({ type: 'error', text: result.message || 'Operation failed.' });
      }
    } catch (err) {
      setMessage({ type: 'error', text: 'Network connection error.' });
    } finally {
      setSubmitting(false);
    }
  };

  const handleEdit = (c) => {
    setEditingClass(c);
    setClassName(c.class_name || c.ClassName || '');
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this class?')) return;

    try {
      const res = await fetch(`${API_BASE_URL}/admin/classes/${id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
      });
      const result = await res.json();
      if (res.ok && result.status === 'success') {
        setMessage({ type: 'success', text: 'Class deleted successfully.' });
        fetchClasses();
      }
    } catch (err) {
      setMessage({ type: 'error', text: 'Network error.' });
    }
  };

  return (
    <div className="min-h-screen bg-slate-100 p-6 flex justify-center">
      <div className="max-w-4xl w-full space-y-6">
        <button onClick={() => navigate('/academic-dashboard')} className="text-slate-600 hover:text-slate-900 text-sm font-semibold flex items-center gap-2 cursor-pointer">
          <span>←</span> Back to Dashboard
        </button>

        <div className="bg-white p-6 md:p-8 rounded-2xl border border-slate-200 shadow-sm space-y-6">
          <div className="flex justify-between items-center border-b border-slate-100 pb-4">
            <div>
              <h2 className="text-2xl font-bold text-slate-800">{editingClass ? 'Edit Class' : 'Class Management'}</h2>
              <p className="text-slate-500 text-sm mt-1">Add or edit general school classes (e.g. Form 1, Form 2).</p>
            </div>
            {editingClass && (
              <button onClick={() => { setEditingClass(null); setClassName(''); }} className="text-xs text-red-600 font-bold underline cursor-pointer">
                Cancel Edit
              </button>
            )}
          </div>

          {message.text && (
            <div className={`p-4 rounded-xl text-xs font-semibold ${message.type === 'success' ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' : 'bg-red-50 text-red-600 border border-red-200'}`}>
              {message.text}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4 max-w-lg">
            <div>
              <label className="block text-xs font-bold text-slate-600 uppercase mb-1">Class Name (e.g. Form 1)</label>
              <input type="text" required value={className} onChange={(e) => setClassName(e.target.value)} placeholder="Form 1" className="w-full px-4 py-2.5 rounded-xl text-sm border border-slate-300 focus:ring-2 focus:ring-emerald-500 outline-none" />
            </div>

            <div className="pt-2">
              <button type="submit" disabled={submitting} className="bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs px-6 py-3 rounded-xl shadow-sm cursor-pointer disabled:opacity-50">
                {submitting ? 'Saving...' : editingClass ? 'Update Class' : 'Save Class'}
              </button>
            </div>
          </form>
        </div>

        {/* Classes List */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4">
          <h3 className="text-lg font-bold text-slate-800">Registered Classes ({classes.length})</h3>
          {loading ? (
            <p className="text-slate-500 text-sm">Loading classes...</p>
          ) : classes.length === 0 ? (
            <p className="text-slate-400 text-sm">No classes registered yet.</p>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {classes.map((c, idx) => (
                <div key={c.ID || c.id || idx} className="p-4 rounded-xl border border-slate-200 bg-slate-50 flex justify-between items-center">
                  <div>
                    <span className="font-bold text-slate-800">{c.class_name || c.ClassName}</span>
                  </div>
                  <div className="space-x-2">
                    <button onClick={() => handleEdit(c)} className="text-xs text-blue-600 hover:text-blue-800 font-bold bg-blue-50 px-2.5 py-1 rounded-lg cursor-pointer">Edit</button>
                    <button onClick={() => handleDelete(c.ID || c.id)} className="text-xs text-red-600 hover:text-red-800 font-bold bg-red-50 px-2.5 py-1 rounded-lg cursor-pointer">Delete</button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ClassManagement;
