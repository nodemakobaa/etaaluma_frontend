import { useEffect, useState } from 'react';
import { API_BASE_URL } from '../config/api';

const TeacherNotifications = () => {
  const [open, setOpen] = useState(false);
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(false);
  const token = localStorage.getItem('token') || '';

  const load = async () => {
    setLoading(true);
    try {
      const res = await fetch(`${API_BASE_URL}/teacher/notifications`, { headers: { Authorization: `Bearer ${token}` } });
      const data = await res.json();
      if (res.ok) setItems(data.data || []);
    } catch (e) { console.error('Failed to load notifications:', e); }
    finally { setLoading(false); }
  };

  useEffect(() => { load(); }, []);

  const unread = items.filter((n) => !n.is_read).length;
  const markRead = async (id) => {
    try {
      await fetch(`${API_BASE_URL}/teacher/notifications/${id}/read`, { method: 'PUT', headers: { Authorization: `Bearer ${token}` } });
      setItems((prev) => prev.map((n) => n.id === id ? { ...n, is_read: true } : n));
    } catch (e) { console.error('Failed to mark notification:', e); }
  };

  return (
    <div className="relative">
      <button onClick={() => { setOpen(!open); if (!open) load(); }} className="relative bg-white border border-slate-200 hover:bg-slate-50 px-3 py-2.5 rounded-xl shadow-sm">
        🔔
        {unread > 0 && <span className="absolute -top-1 -right-1 min-w-5 h-5 px-1 rounded-full bg-red-600 text-white text-[10px] font-bold flex items-center justify-center">{unread}</span>}
      </button>
      {open && (
        <div className="absolute right-0 top-12 z-50 w-80 max-w-[90vw] bg-white border border-slate-200 rounded-2xl shadow-xl overflow-hidden">
          <div className="px-4 py-3 border-b border-slate-100 flex justify-between items-center"><strong className="text-sm text-slate-800">Notifications</strong><button onClick={load} className="text-xs text-emerald-600 font-bold">Refresh</button></div>
          <div className="max-h-80 overflow-y-auto">
            {loading ? <p className="p-5 text-sm text-slate-500">Loading...</p> : items.length === 0 ? <p className="p-5 text-sm text-slate-500">No notifications.</p> : items.map((n) => (
              <button key={n.id} onClick={() => markRead(n.id)} className={`w-full text-left px-4 py-3 border-b border-slate-100 hover:bg-slate-50 ${!n.is_read ? 'bg-emerald-50/60' : ''}`}>
                <div className="flex justify-between gap-2"><strong className="text-xs text-slate-800">{n.title}</strong>{!n.is_read && <span className="text-[9px] font-bold text-emerald-600">NEW</span>}</div>
                <p className="text-xs text-slate-600 mt-1 leading-relaxed">{n.message}</p>
                <span className="text-[10px] text-slate-400 mt-1 block">{n.created_at ? new Date(n.created_at).toLocaleString() : ''}</span>
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default TeacherNotifications;
