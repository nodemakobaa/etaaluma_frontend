import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { API_BASE_URL } from '../config/api';

const IsoSheetManagement = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [classes, setClasses] = useState([]);
  const [subjects, setSubjects] = useState([]);
  const [students, setStudents] = useState([]);

  const [filterClass, setFilterClass] = useState('');
  const [selectedSubject, setSelectedSubject] = useState('');
  const [loading, setLoading] = useState(false);

  const token = user?.token || localStorage.getItem('token');

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [resCls, resSub] = await Promise.all([
          fetch(`${API_BASE_URL}/admin/classes`, { headers: { Authorization: `Bearer ${token}` } }),
          fetch(`${API_BASE_URL}/admin/subjects`, { headers: { Authorization: `Bearer ${token}` } }),
        ]);

        const clsData = await resCls.json();
        const subData = await resSub.json();

        if (resCls.ok && clsData.data?.length > 0) {
          setClasses(clsData.data);
          setFilterClass(clsData.data[0].id || clsData.data[0].ID);
        }

        if (resSub.ok && subData.data?.length > 0) {
          setSubjects(subData.data);
          setSelectedSubject(subData.data[0].subject_name || subData.data[0].SubjectName || subData.data[0].name || '');
        }
      } catch (err) {
        console.error(err);
      }
    };
    fetchData();
  }, [token]);

  useEffect(() => {
    if (!filterClass) return;
    const fetchStudents = async () => {
      setLoading(true);
      try {
        const res = await fetch(`${API_BASE_URL}/admin/students?class_id=${filterClass}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        const data = await res.json();
        if (res.ok) {
          setStudents(data.data || []);
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchStudents();
  }, [filterClass, token]);

  const schoolName = user?.school_name || 'BUNGWA SECONDARY SCHOOL';
  const activeClassObj = classes.find((c) => String(c.id || c.ID) === String(filterClass));
  const activeClassName = activeClassObj ? (activeClassObj.class_name || activeClassObj.ClassName) : 'CLASS';

  return (
    <div className="min-h-screen bg-slate-100 p-6 flex justify-center">
      <div className="max-w-5xl w-full space-y-6">
        
        {/* Controls (Hidden on Print) */}
        <div className="print:hidden space-y-4">
          <button onClick={() => navigate('/academic-dashboard')} className="text-slate-600 font-bold text-sm hover:underline">
            ← Back to dashboard
          </button>

          <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200 flex flex-wrap justify-between items-center gap-4">
            <h2 className="text-xl font-bold">ISO / Isal Marks & Attendance Sheet</h2>

            <div className="flex gap-3">
              <select
                value={filterClass}
                onChange={(e) => setFilterClass(e.target.value)}
                className="p-2 border rounded-xl text-sm font-bold"
              >
                {classes.map((c) => (
                  <option key={c.id || c.ID} value={c.id || c.ID}>
                    {c.class_name || c.ClassName}
                  </option>
                ))}
              </select>

              <select
                value={selectedSubject}
                onChange={(e) => setSelectedSubject(e.target.value)}
                className="p-2 border rounded-xl text-sm font-bold"
              >
                {subjects.map((s, idx) => {
                  const subName = s.subject_name || s.SubjectName || s.name;
                  return (
                    <option key={idx} value={subName}>
                      {subName}
                    </option>
                  );
                })}
              </select>

              <button
                onClick={() => window.print()}
                className="bg-indigo-600 text-white px-4 py-2 rounded-xl text-xs font-bold hover:bg-indigo-700 shadow"
              >
                🖨️ Print Sheet
              </button>
            </div>
          </div>
        </div>

        {/* Printable Area */}
        <div className="bg-white p-8 rounded-2xl border border-slate-200 print:p-0 print:border-none">
          <div className="text-center border-b-2 border-black pb-3 mb-4">
            <h1 className="text-xl font-bold uppercase">{schoolName}</h1>
            <h2 className="text-base font-bold uppercase mt-1">
              CLASS: {activeClassName} | SUBJECT: <span className="underline">{selectedSubject || '...................'}</span>
            </h2>
            <div className="flex justify-between items-center text-xs font-bold mt-3">
              <span>DATE: _______________________</span>
              <span>TOTAL ACTIVE STUDENTS: {students.length}</span>
            </div>
          </div>

          {loading ? (
            <p className="text-center py-8 text-slate-400">Loading Sheet...</p>
          ) : (
            <table className="w-full border-collapse border border-black text-xs text-left">
              <thead>
                <tr className="bg-slate-100 print:bg-white border-b border-black text-center font-bold">
                  <th className="p-2 border border-black w-16">S/N</th>
                  <th className="p-2 border border-black text-left">STUDENT'S NAME</th>
                  <th className="p-2 border border-black w-16">SEX</th>
                  <th className="p-2 border border-black w-24">MARKS</th>
                  <th className="p-2 border border-black w-20">GRADE</th>
                  <th className="p-2 border border-black w-40">SIGNATURE</th>
                </tr>
              </thead>
              <tbody>
                {students.map((st, idx) => (
                  <tr key={st.id || st.ID} className="h-9">
                    <td className="p-2 border border-black text-center font-mono font-bold">
                      {String(idx + 1).padStart(4, '0')}
                    </td>
                    <td className="p-2 border border-black font-bold uppercase">{st.full_name}</td>
                    <td className="p-2 border border-black text-center font-bold">{st.sex}</td>
                    <td className="p-2 border border-black"></td>
                    <td className="p-2 border border-black"></td>
                    <td className="p-2 border border-black"></td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  );
};

export default IsoSheetManagement;