import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { API_BASE_URL } from '../config/api';

const AssignSubjectManagement = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [teachers, setTeachers] = useState([]);
  const [subjects, setSubjects] = useState([]);
  const [classes, setClasses] = useState([]);
  const [assignments, setAssignments] = useState([]);

  const [selectedTeacher, setSelectedTeacher] = useState('');
  const [selectedSubject, setSelectedSubject] = useState('');
  const [selectedClass, setSelectedClass] = useState('');

  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });

  const token = user?.token || localStorage.getItem('token');

  // Handle Authentication and Session Expired Errors
  const handleAuthError = (res, result) => {
    if (
      res.status === 401 ||
      res.status === 403 ||
      result?.message?.toLowerCase().includes('unauthorized') ||
      result?.message?.toLowerCase().includes('token expired')
    ) {
      setMessage({
        type: 'error',
        text: 'Session expired. Please log in again to refresh your session.',
      });
      return true;
    }
    return false;
  };

  // Load all required dropdown options and initial assignments
  const fetchAllData = async () => {
    if (!token) {
      setMessage({ type: 'error', text: 'Authentication token not found. Please log in.' });
      setLoading(false);
      return;
    }

    try {
      const headers = {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      };

      const [resTeachers, resSubjects, resClasses, resAssignments] = await Promise.all([
        fetch(`${API_BASE_URL}/admin/teachers`, { headers }),
        fetch(`${API_BASE_URL}/admin/subjects`, { headers }),
        fetch(`${API_BASE_URL}/admin/classes`, { headers }),
        fetch(`${API_BASE_URL}/admin/assigned-subjects`, { headers }),
      ]);

      const [teachersData, subjectsData, classesData, assignmentsData] = await Promise.all([
        resTeachers.json().catch(() => ({})),
        resSubjects.json().catch(() => ({})),
        resClasses.json().catch(() => ({})),
        resAssignments.json().catch(() => ({})),
      ]);

      if (
        handleAuthError(resTeachers, teachersData) ||
        handleAuthError(resSubjects, subjectsData) ||
        handleAuthError(resClasses, classesData) ||
        handleAuthError(resAssignments, assignmentsData)
      ) {
        return;
      }

      if (resTeachers.ok) setTeachers(teachersData.data || []);
      if (resSubjects.ok) setSubjects(subjectsData.data || []);
      if (resClasses.ok) setClasses(classesData.data || []);
      if (resAssignments.ok) setAssignments(assignmentsData.data || []);
    } catch (err) {
      console.error('Error fetching data:', err);
      setMessage({ type: 'error', text: 'Failed to connect to backend server.' });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAllData();
  }, [token]);

  const handleAssign = async (e) => {
    e.preventDefault();
    
    const teacherId = Number(selectedTeacher);
    const subjectId = Number(selectedSubject);
    const classId = Number(selectedClass);

    if (!teacherId || !subjectId || !classId) {
      setMessage({ type: 'error', text: 'Please select a valid teacher, subject, and class.' });
      return;
    }

    setSubmitting(true);
    setMessage({ type: '', text: '' });

    try {
      const res = await fetch(`${API_BASE_URL}/admin/assign-subject`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          teacher_id: teacherId,
          subject_id: subjectId,
          class_id: classId,
        }),
      });

      const result = await res.json().catch(() => ({}));

      if (handleAuthError(res, result)) return;

      if (res.ok && (result.status === 'success' || result.success)) {
        setMessage({ type: 'success', text: 'Subject assigned successfully!' });
        setSelectedTeacher('');
        setSelectedSubject('');
        setSelectedClass('');
        fetchAllData(); // Refresh list
      } else {
        setMessage({
          type: 'error',
          text: result.message || result.error || 'Failed to assign subject.',
        });
      }
    } catch (err) {
      console.error('Assign error:', err);
      setMessage({ type: 'error', text: 'Network connection error.' });
    } finally {
      setSubmitting(false);
    }
  };

  const groupedAssignments = Object.values(
    assignments.reduce((groups, item) => {
      const teacherId =
        item.teacher_id ||
        item.TeacherID ||
        item.teacher?.id ||
        item.Teacher?.ID ||
        item.Teacher?.id ||
        'unknown';

      const teacherName =
        item.teacher?.full_name ||
        item.Teacher?.FullName ||
        item.teacher?.FullName ||
        item.Teacher?.full_name ||
        item.teacher_name ||
        'N/A';

      if (!groups[teacherId]) {
        groups[teacherId] = {
          teacherId,
          teacherName,
          assignments: [],
        };
      }

      groups[teacherId].assignments.push(item);
      return groups;
    }, {})
  );

  const handleRemove = async (id) => {
    if (!id) return;
    if (!window.confirm('Are you sure you want to unassign this subject from the teacher?')) return;

    try {
      const res = await fetch(`${API_BASE_URL}/admin/assigned-subjects/${id}`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
      });

      const result = await res.json().catch(() => ({}));

      if (handleAuthError(res, result)) return;

      if (res.ok && (result.status === 'success' || result.success)) {
        setMessage({ type: 'success', text: 'Assignment removed successfully.' });
        fetchAllData();
      } else {
        setMessage({ type: 'error', text: result.message || result.error || 'Failed to remove assignment.' });
      }
    } catch (err) {
      console.error('Remove error:', err);
      setMessage({ type: 'error', text: 'Network connection error.' });
    }
  };

  return (
    <div className="min-h-screen bg-slate-100 p-6 flex justify-center">
      <div className="max-w-5xl w-full space-y-6">
        <button
          onClick={() => navigate('/academic-dashboard')}
          className="text-slate-600 hover:text-slate-900 text-sm font-semibold flex items-center gap-2 cursor-pointer"
        >
          <span>←</span> Back to Dashboard
        </button>

        {/* Assignment Form Card */}
        <div className="bg-white p-6 md:p-8 rounded-2xl border border-slate-200 shadow-sm space-y-6">
          <div className="border-b border-slate-100 pb-4">
            <h2 className="text-2xl font-bold text-slate-800">Assign Subject to Teacher</h2>
            <p className="text-slate-500 text-sm mt-1">
              Map teachers to their respective subjects and assigned classes.
            </p>
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

          <form onSubmit={handleAssign} className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Select Teacher */}
            <div>
              <label className="block text-xs font-bold text-slate-600 uppercase mb-1">Select Teacher</label>
              <select
                required
                value={selectedTeacher}
                onChange={(e) => setSelectedTeacher(e.target.value)}
                className="w-full px-4 py-2.5 rounded-xl text-sm border border-slate-300 bg-white"
              >
                <option value="">-- Choose Teacher --</option>
                {teachers.map((t) => {
                  const tId = t.id || t.ID || t.teacher_id;
                  const tName = t.full_name || t.FullName || t.name;
                  const tUsername = t.username || t.Username || '';
                  return (
                    <option key={tId} value={tId}>
                      {tName} {tUsername ? `(${tUsername})` : ''}
                    </option>
                  );
                })}
              </select>
            </div>

            {/* Select Subject */}
            <div>
              <label className="block text-xs font-bold text-slate-600 uppercase mb-1">Select Subject</label>
              <select
                required
                value={selectedSubject}
                onChange={(e) => setSelectedSubject(e.target.value)}
                className="w-full px-4 py-2.5 rounded-xl text-sm border border-slate-300 bg-white"
              >
                <option value="">-- Choose Subject --</option>
                {subjects.map((s) => {
                  const sId = s.id || s.ID || s.subject_id;
                  const sName = s.subject_name || s.SubjectName || s.name;
                  const sCode = s.subject_code || s.SubjectCode || '';
                  return (
                    <option key={sId} value={sId}>
                      {sName} {sCode ? `(${sCode})` : ''}
                    </option>
                  );
                })}
              </select>
            </div>

            {/* Select Class */}
            <div>
              <label className="block text-xs font-bold text-slate-600 uppercase mb-1">Select Class</label>
              <select
                required
                value={selectedClass}
                onChange={(e) => setSelectedClass(e.target.value)}
                className="w-full px-4 py-2.5 rounded-xl text-sm border border-slate-300 bg-white"
              >
                <option value="">-- Choose Class --</option>
                {classes.map((c) => {
                  const cId = c.id || c.ID || c.class_id;
                  const cName = c.class_name || c.ClassName || c.name;
                  const cStream = c.stream || c.Stream || '';
                  return (
                    <option key={cId} value={cId}>
                      {cName} {cStream ? `(${cStream})` : ''}
                    </option>
                  );
                })}
              </select>
            </div>

            <div className="md:col-span-3 pt-2">
              <button
                type="submit"
                disabled={submitting}
                className="bg-purple-600 hover:bg-purple-500 text-white font-bold text-xs px-6 py-3 rounded-xl shadow-sm cursor-pointer disabled:opacity-50"
              >
                {submitting ? 'Assigning...' : 'Assign Subject'}
              </button>
            </div>
          </form>
        </div>

        {/* Assigned List Table */}
        <div className="bg-white p-6 md:p-8 rounded-2xl border border-slate-200 shadow-sm space-y-4">
          <h3 className="text-lg font-bold text-slate-800">Assigned Teaching Allocation ({groupedAssignments.length} Teachers)</h3>

          {loading ? (
            <p className="text-slate-500 text-sm">Loading allocations...</p>
          ) : assignments.length === 0 ? (
            <p className="text-slate-400 text-sm">No subject assignments created yet.</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm text-slate-600">
                <thead className="bg-slate-50 text-slate-700 uppercase text-xs font-bold">
                  <tr>
                    <th className="p-3">#</th>
                    <th className="p-3">Teacher</th>
                    <th className="p-3">Assigned Subject</th>
                    <th className="p-3">Class & Stream</th>
                    <th className="p-3 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {groupedAssignments.map((group, idx) => (
                    <tr key={group.teacherId || idx} className="align-top hover:bg-slate-50 transition">
                      <td className="p-3 font-semibold text-slate-800">{idx + 1}</td>
                      <td className="p-3 font-medium text-slate-900 whitespace-nowrap">{group.teacherName}</td>
                      <td className="p-3">
                        <div className="space-y-2">
                          {group.assignments.map((item, assignmentIndex) => {
                            const assignId = item.id || item.ID || item.assignment_id;
                            const subjectName =
                              item.subject?.subject_name ||
                              item.Subject?.SubjectName ||
                              item.subject?.SubjectName ||
                              item.Subject?.subject_name ||
                              item.subject_name ||
                              'N/A';
                            const subjectCode =
                              item.subject?.subject_code ||
                              item.Subject?.SubjectCode ||
                              item.subject?.SubjectCode ||
                              item.Subject?.subject_code ||
                              item.subject_code ||
                              '';
                            const className =
                              item.class?.class_name ||
                              item.Class?.ClassName ||
                              item.class?.ClassName ||
                              item.Class?.class_name ||
                              item.class_name ||
                              '';
                            const stream =
                              item.class?.stream ||
                              item.Class?.Stream ||
                              item.class?.Stream ||
                              item.Class?.stream ||
                              item.stream ||
                              '';

                            return (
                              <div key={assignId || assignmentIndex} className="flex items-center justify-between gap-3 bg-purple-50 rounded-lg px-3 py-2">
                                <span className="font-semibold text-purple-700">
                                  {subjectName} {subjectCode ? `(${subjectCode})` : ''}
                                </span>
                                <span className="text-xs text-slate-600 whitespace-nowrap">
                                  {className} {stream ? `- ${stream}` : ''}
                                </span>
                                <button
                                  onClick={() => handleRemove(assignId)}
                                  className="text-xs text-red-600 hover:text-red-800 font-bold whitespace-nowrap"
                                >
                                  Unassign
                                </button>
                              </div>
                            );
                          })}
                        </div>
                      </td>
                      <td className="p-3">
                        <div className="space-y-2">
                          {group.assignments.map((item, assignmentIndex) => {
                            const className =
                              item.class?.class_name ||
                              item.Class?.ClassName ||
                              item.class?.ClassName ||
                              item.Class?.class_name ||
                              item.class_name ||
                              '';
                            const stream =
                              item.class?.stream ||
                              item.Class?.Stream ||
                              item.class?.Stream ||
                              item.Class?.stream ||
                              item.stream ||
                              '';
                            return (
                              <div key={assignmentIndex} className="bg-slate-100 text-slate-800 text-xs px-2.5 py-2 rounded-lg font-mono">
                                {className} {stream ? `- ${stream}` : ''}
                              </div>
                            );
                          })}
                        </div>
                      </td>
                      <td className="p-3"></td>
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
}
       
export default AssignSubjectManagement;
