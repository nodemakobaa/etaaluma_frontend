import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { API_BASE_URL } from '../config/api';

const TeacherSettings = () => {
  const navigate = useNavigate();
  const token = localStorage.getItem('token') || '';
  const [form, setForm] = useState({ current_password: '', new_password: '', confirm_password: '' });
  const [message, setMessage] = useState({ type: '', text: '' });
  const [saving, setSaving] = useState(false);

  const submit = async (e) => {
    e.preventDefault();
    setMessage({ type: '', text: '' });
    setSaving(true);
    try {
      const res = await fetch(`${API_BASE_URL}/teacher/change-password`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify(form),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data.message || 'Failed to change password.');
      setMessage({ type: 'success', text: data.message || 'Password changed successfully.' });
      setForm({ current_password: '', new_password: '', confirm_password: '' });
    } catch (err) {
      setMessage({ type: 'error', text: err.message });
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-100 p-4 md:p-8">
      <div className="max-w-xl mx-auto">
        <button onClick={() => navigate('/teacher-dashboard')} className="text-slate-600 hover:text-slate-900 text-sm font-semibold mb-5">
          ← Back to Teacher Dashboard
        </button>
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 md:p-8">
          <h1 className="text-2xl font-black text-slate-800">Account Security</h1>
          <p className="text-sm text-slate-500 mt-1 mb-6">Change your teacher account password securely.</p>
          {message.text && <div className={`mb-5 p-3 rounded-xl text-sm ${message.type === 'success' ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' : 'bg-red-50 text-red-700 border border-red-200'}`}>{message.text}</div>}
          <form onSubmit={submit} className="space-y-4">
            {[
              ['current_password', 'Current Password'],
              ['new_password', 'New Password'],
              ['confirm_password', 'Confirm New Password'],
            ].map(([name, label]) => (
              <div key={name}>
                <label className="block text-xs font-bold text-slate-600 uppercase mb-1">{label}</label>
                <input type="password" required minLength={name === 'current_password' ? undefined : 8} value={form[name]} onChange={(e) => setForm({ ...form, [name]: e.target.value })} className="w-full px-4 py-3 rounded-xl border border-slate-300 outline-none focus:ring-2 focus:ring-emerald-500" />
              </div>
            ))}
            <button disabled={saving} className="w-full bg-emerald-600 hover:bg-emerald-500 text-white font-bold py-3 rounded-xl disabled:opacity-50">
              {saving ? 'Updating Password...' : 'Change Password'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default TeacherSettings;
