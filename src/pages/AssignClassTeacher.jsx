import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { API_BASE_URL } from '../config/api';

const AssignClassTeacher = () => {
  const navigate = useNavigate();
  const token = localStorage.getItem('token') || '';

  const [classes, setClasses] = useState([]);
  const [teachers, setTeachers] = useState([]);
  const [assignedList, setAssignedList] = useState([]);

  const [selectedClassID, setSelectedClassID] = useState('');
  const [selectedTeacherID, setSelectedTeacherID] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });

  const fetchData = async () => {
    try {
      const [classRes, teacherRes, assignedRes] = await Promise.all([
        fetch(`${API_BASE_URL}/admin/classes`, { headers: { Authorization: `Bearer ${token}` } }),
        fetch(`${API_BASE_URL}/admin/teachers`, { headers: { Authorization: `Bearer ${token}` } }),
        fetch(`${API_BASE_URL}/admin/assigned-class-teachers`, { headers: { Authorization: `Bearer ${token}` } }),
      ]);

      const classData = await classRes.json();
      const teacherData = await teacherRes.json();
      const assignedData = await assignedRes.json();

      setClasses(classData.data || classData || []);
      setTeachers(teacherData.data || teacherData || []);
      setAssignedList(assignedData.data || []);
    } catch (err) {
      console.error('Error loading data:', err);
    }
  };

  useEffect(() => {
    fetchData();
  }, [token]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!selectedClassID || !selectedTeacherID) {
      setMessage({ type: 'error', text: 'Please select both Class and Teacher.' });
      return;
    }

    setLoading(true);
    setMessage({ type: '', text: '' });

    try {
      const res = await fetch(`${API_BASE_URL}/admin/assign-class-teacher`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          class_id: Number(selectedClassID),
          teacher_id: Number(selectedTeacherID),
        }),
      });

      const result = await res.json();
      if (res.ok && result.status === 'success') {
        setMessage({ type: 'success', text: result.message || 'Class teacher assigned successfully!' });
        fetchData();
        setSelectedTeacherID('');
      } else {
        setMessage({ type: 'error', text: result.message || 'Failed to assign class teacher.' });
      }
    } catch (err) {
      setMessage({ type: 'error', text: 'Network error!' });
    } finally {
      setLoading(false);
    }
  };

  const handleUnassign = async (id) => {
    if (!window.confirm('Are you sure you want to unassign this class teacher?')) return;
    try {
      const res = await fetch(`${API_BASE_URL}/admin/assigned-class-teachers/${id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        setMessage({ type: 'success', text: 'Class teacher unassigned successfully!' });
        fetchData();
      } else {
        setMessage({ type: 'error', text: 'Failed to unassign.' });
      }
    } catch (err) {
      setMessage({ type: 'error', text: 'Network error during unassign.' });
    }
  };

  return (
    <div className="min-h-screen bg-slate-100 p-4 md:p-8 font-sans">
      <div className="max-w-4xl mx-auto space-y-6">
        <div className="flex items-center justify-between bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
          <div>
            <h1 className="text-xl font-bold text-slate-800">🎓 Assign Class Teachers</h1>
            <p className="text-xs text-slate-500 mt-0.5">Designate multiple teachers to manage specific classes.</p>
          </div>
          <button
            onClick={() => navigate('/academic-dashboard')}
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

        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
          <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-3 gap-4 items-end">
            <div>
              <label className="block text-[11px] font-bold text-slate-500 uppercase mb-1">Select Class</label>
              <select
                value={selectedClassID}
                onChange={(e) => setSelectedClassID(e.target.value)}
                required
                className="w-full px-3.5 py-2.5 rounded-xl text-sm border border-slate-300 bg-white"
              >
                <option value="">-- Select Class --</option>
                {classes.map((cls) => (
                  <option key={cls.id || cls.ID} value={cls.id || cls.ID}>
                    {cls.class_name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-[11px] font-bold text-slate-500 uppercase mb-1">Select Teacher</label>
              <select
                value={selectedTeacherID}
                onChange={(e) => setSelectedTeacherID(e.target.value)}
                required
                className="w-full px-3.5 py-2.5 rounded-xl text-sm border border-slate-300 bg-white"
              >
                <option value="">-- Select Teacher --</option>
                {teachers.map((tch) => (
                  <option key={tch.id || tch.ID} value={tch.id || tch.ID}>
                    {tch.full_name}
                  </option>
                ))}
              </select>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-2.5 px-4 rounded-xl shadow-sm transition cursor-pointer disabled:opacity-50"
            >
              {loading ? 'Assigning...' : 'Assign Class Teacher'}
            </button>
          </form>
        </div>

        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
          <h3 className="text-base font-bold text-slate-800 mb-4">Current Class Teachers</h3>
          <div className="overflow-x-auto">
            <table className="w-full border-collapse text-left text-xs">
              <thead>
                <tr className="bg-slate-50 text-slate-600 border-b border-slate-200">
                  <th className="p-3">No</th>
                  <th className="p-3">Class Name</th>
                  <th className="p-3">Class Teacher</th>
                  <th className="p-3 text-right">Action</th>
                </tr>
              </thead>
              <tbody>
                {assignedList.length > 0 ? (
                  assignedList.map((item, index) => (
                    <tr key={item.id} className="border-b border-slate-100 hover:bg-slate-50">
                      <td className="p-3">{index + 1}</td>
                      <td className="p-3 font-bold text-slate-800">{item.class_name}</td>
                      <td className="p-3 font-semibold text-emerald-700">{item.teacher_name}</td>
                      <td className="p-3 text-right">
                        <button
                          onClick={() => handleUnassign(item.id)}
                          className="px-3 py-1 bg-red-50 hover:bg-red-100 text-red-600 font-bold rounded-lg transition cursor-pointer"
                        >
                          Unassign
                        </button>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="4" className="p-6 text-center text-slate-400">No class teachers assigned yet.</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AssignClassTeacher;