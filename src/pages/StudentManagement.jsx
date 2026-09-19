import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import ExcelJS from 'exceljs';
import { useAuth } from '../context/AuthContext';
import { API_BASE_URL } from '../config/api';

const StudentManagement = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [classes, setClasses] = useState([]);
  const [students, setStudents] = useState([]);

  // Form states
  const [fullName, setFullName] = useState('');
  const [sex, setSex] = useState('M');
  const [selectedClass, setSelectedClass] = useState('');
  const [uploadClass, setUploadClass] = useState('');
  const [filterClass, setFilterClass] = useState('');
  const [selectedFile, setSelectedFile] = useState(null);

  // Edit Student Modal States
  const [editingStudent, setEditingStudent] = useState(null);
  const [editName, setEditName] = useState('');
  const [editSex, setEditSex] = useState('M');
  const [updating, setUpdating] = useState(false);

  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });

  const token = user?.token || localStorage.getItem('token');

  const fetchClasses = async () => {
    if (!token) return;
    try {
      const res = await fetch(`${API_BASE_URL}/admin/classes`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (res.ok) {
        const classList = data.data || [];
        setClasses(classList);
        if (classList.length > 0) {
          const firstId = classList[0].id || classList[0].ID;
          setSelectedClass(firstId);
          setUploadClass(firstId);
          setFilterClass(firstId);
        }
      }
    } catch (err) {
      console.error(err);
    }
  };

  const fetchStudents = async (classId) => {
    if (!classId || !token) return;
    setLoading(true);
    try {
      const res = await fetch(`${API_BASE_URL}/admin/students?class_id=${classId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (res.ok && data.status === 'success') {
        const rawStudents = data.data || [];
        
        // Panga wanafunzi kwa Index No ili iwe Ascending (0001, 0002, 0003...)
        const sortedStudents = rawStudents.sort((a, b) => {
          return (a.index_no || '').localeCompare(b.index_no || '');
        });

        setStudents(sortedStudents);
      } else {
        setStudents([]);
      }
    } catch (err) {
      console.error(err);
      setStudents([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchClasses();
  }, [token]);

  useEffect(() => {
    if (filterClass) fetchStudents(filterClass);
  }, [filterClass]);

  const handleSingleSubmit = async (e) => {
    e.preventDefault();
    if (!fullName || !selectedClass) return;
    setSubmitting(true);
    setMessage({ type: '', text: '' });

    try {
      const res = await fetch(`${API_BASE_URL}/admin/students`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          full_name: fullName.trim(),
          sex: sex,
          class_id: Number(selectedClass),
        }),
      });
      const result = await res.json();
      if (res.ok && result.status === 'success') {
        setMessage({ type: 'success', text: 'Student registered successfully!' });
        setFullName('');
        setFilterClass(selectedClass);
        fetchStudents(selectedClass);
      } else {
        setMessage({ type: 'error', text: result.message || 'Failed to register student.' });
      }
    } catch (err) {
      setMessage({ type: 'error', text: 'Network connection error.' });
    } finally {
      setSubmitting(false);
    }
  };

  const handleDownloadSample = async () => {
    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet('Students Template');

    worksheet.columns = [
      { header: 'FULL NAME', key: 'full_name', width: 35 },
      { header: 'SEX', key: 'sex', width: 15 },
    ];

    const headerRow = worksheet.getRow(1);
    headerRow.font = { bold: true, color: { argb: 'FFFFFF' } };
    headerRow.fill = {
      type: 'pattern',
      pattern: 'solid',
      fgColor: { argb: '1E293B' },
    };

    worksheet.addRow({ full_name: 'JOHN DOS SANTOS', sex: 'M' });
    worksheet.addRow({ full_name: 'AMINA JUMA ALLY', sex: 'F' });

    const buffer = await workbook.xlsx.writeBuffer();
    const blob = new Blob([buffer], {
      type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    });
    const url = window.URL.createObjectURL(blob);
    const anchor = document.createElement('a');
    anchor.href = url;
    anchor.download = 'Student_Registration_Sample.xlsx';
    anchor.click();
    window.URL.revokeObjectURL(url);
  };

  const handleFileUpload = async (e) => {
    e.preventDefault();
    if (!selectedFile || !uploadClass) {
      setMessage({ type: 'error', text: 'Please select target class and a valid file.' });
      return;
    }

    setUploading(true);
    setMessage({ type: '', text: '' });

    const formData = new FormData();
    formData.append('file', selectedFile);
    formData.append('class_id', uploadClass);

    try {
      const res = await fetch(`${API_BASE_URL}/admin/students/upload-excel`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
        body: formData,
      });

      const result = await res.json();
      if (res.ok && result.status === 'success') {
        setMessage({ type: 'success', text: result.message || 'File uploaded successfully!' });
        setSelectedFile(null);
        setFilterClass(uploadClass);
        fetchStudents(uploadClass);
      } else {
        setMessage({ type: 'error', text: result.message || 'Upload failed.' });
      }
    } catch (err) {
      setMessage({ type: 'error', text: 'Network error during upload.' });
    } finally {
      setUploading(false);
    }
  };

  const handleStatusChange = async (studentId, newStatus) => {
    try {
      const res = await fetch(`${API_BASE_URL}/admin/students/${studentId}/status`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ status: newStatus }),
      });
      if (res.ok) {
        fetchStudents(filterClass);
      }
    } catch (err) {
      console.error(err);
    }
  };

  // Function ya kufungua Modal ya Edit
  const handleOpenEdit = (student) => {
    setEditingStudent(student);
    setEditName(student.full_name);
    setEditSex(student.sex);
  };

  // Function ya kusubmit mabadiliko ya mwanafunzi
  const handleUpdateStudent = async (e) => {
    e.preventDefault();
    if (!editingStudent) return;
    setUpdating(true);

    try {
      const res = await fetch(`${API_BASE_URL}/admin/students/${editingStudent.id || editingStudent.ID}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          full_name: editName.trim(),
          sex: editSex,
        }),
      });

      const result = await res.json();
      if (res.ok) {
        setMessage({ type: 'success', text: 'Student details updated successfully!' });
        setEditingStudent(null);
        fetchStudents(filterClass);
      } else {
        alert(result.message || 'Failed to update student');
      }
    } catch (err) {
      console.error(err);
    } finally {
      setUpdating(false);
    }
  };

  const handleDeleteStudent = async (studentId) => {
    if (!window.confirm('Are you sure you want to permanently delete this student?')) return;
    try {
      const res = await fetch(`${API_BASE_URL}/admin/students/${studentId}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        fetchStudents(filterClass);
      }
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="min-h-screen bg-slate-100 p-6 flex justify-center">
      <div className="max-w-6xl w-full space-y-6">
        <div className="flex justify-between items-center">
          <button
            onClick={() => navigate('/academic-dashboard')}
            className="text-slate-600 font-bold text-sm hover:underline"
          >
            ← Back to Dashboard
          </button>

          <button
            onClick={() => navigate('/iso-sheet')}
            className="bg-indigo-600 text-white px-4 py-2 rounded-xl text-xs font-bold hover:bg-indigo-700 shadow"
          >
            📄 Open ISO / Isal Sheet Page
          </button>
        </div>

        {message.text && (
          <div
            className={`p-4 rounded-xl text-sm font-bold ${
              message.type === 'success' ? 'bg-emerald-100 text-emerald-800' : 'bg-red-100 text-red-800'
            }`}
          >
            {message.text}
          </div>
        )}

        {/* 1. Single Student Registration Form */}
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
          <h2 className="text-lg font-bold mb-4">1. Register Single Student</h2>
          <form onSubmit={handleSingleSubmit} className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <select
              value={selectedClass}
              onChange={(e) => setSelectedClass(e.target.value)}
              className="p-2 border rounded-xl font-semibold"
              required
            >
              {classes.map((c) => (
                <option key={c.id || c.ID} value={c.id || c.ID}>
                  {c.class_name || c.ClassName}
                </option>
              ))}
            </select>

            <input
              type="text"
              placeholder="Full Name"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              className="p-2 border rounded-xl"
              required
            />

            <select
              value={sex}
              onChange={(e) => setSex(e.target.value)}
              className="p-2 border rounded-xl"
            >
              <option value="M">Male (M)</option>
              <option value="F">Female (F)</option>
            </select>

            <button
              type="submit"
              disabled={submitting}
              className="bg-emerald-600 text-white font-bold rounded-xl p-2 hover:bg-emerald-700"
            >
              {submitting ? 'Registering...' : 'Register Student'}
            </button>
          </form>
        </div>

        {/* 2. Bulk Import via Excel/CSV */}
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200 space-y-4">
          <div className="flex flex-wrap justify-between items-center gap-2 border-b pb-3">
            <div>
              <h2 className="text-lg font-bold">2. Bulk Import Students via Excel/CSV</h2>
              <p className="text-xs text-slate-500">
                Note: File must contain only two columns: <strong className="text-slate-700">FULL NAME</strong> and <strong className="text-slate-700">SEX (M/F)</strong>.
              </p>
            </div>
            
            <button
              type="button"
              onClick={handleDownloadSample}
              className="text-xs bg-emerald-50 text-emerald-700 hover:bg-emerald-100 border border-emerald-300 font-bold px-4 py-2 rounded-xl transition flex items-center gap-1"
            >
              📥 Download Sample Excel Template
            </button>
          </div>

          <form onSubmit={handleFileUpload} className="grid grid-cols-1 md:grid-cols-4 gap-4 items-center">
            <select
              value={uploadClass}
              onChange={(e) => setUploadClass(e.target.value)}
              className="p-2 border rounded-xl font-semibold bg-slate-50"
              required
            >
              {classes.map((c) => (
                <option key={c.id || c.ID} value={c.id || c.ID}>
                  {c.class_name || c.ClassName}
                </option>
              ))}
            </select>

            <input
              type="file"
              accept=".csv, .xlsx"
              onChange={(e) => setSelectedFile(e.target.files[0])}
              className="p-2 border rounded-xl text-sm md:col-span-2"
              required
            />

            <button
              type="submit"
              disabled={uploading}
              className="bg-indigo-600 text-white font-bold rounded-xl px-6 py-2 hover:bg-indigo-700 text-sm h-full"
            >
              {uploading ? 'Uploading...' : 'Upload File'}
            </button>
          </form>
        </div>

        {/* 3. Class Registration Register Table */}
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200 space-y-4">
          <div className="flex justify-between items-center">
            <h3 className="text-lg font-bold">Class Registration Register</h3>
            <select
              value={filterClass}
              onChange={(e) => setFilterClass(e.target.value)}
              className="p-2 border rounded-xl font-bold"
            >
              {classes.map((c) => (
                <option key={c.id || c.ID} value={c.id || c.ID}>
                  {c.class_name || c.ClassName}
                </option>
              ))}
            </select>
          </div>

          {loading ? (
            <p className="text-center p-4 text-slate-500 font-bold">Loading students...</p>
          ) : (
            <table className="w-full text-left border-collapse border border-slate-300 text-sm">
              <thead>
                <tr className="bg-slate-100">
                  <th className="p-2 border">Index No</th>
                  <th className="p-2 border">Full Name</th>
                  <th className="p-2 border">Sex</th>
                  <th className="p-2 border">Status</th>
                  <th className="p-2 border text-center">Action</th>
                </tr>
              </thead>
              <tbody>
                {students.length === 0 ? (
                  <tr>
                    <td colSpan="5" className="p-4 text-center text-slate-400">
                      No students found in this class.
                    </td>
                  </tr>
                ) : (
                  students.map((st) => (
                    <tr key={st.id || st.ID} className="border-b hover:bg-slate-50">
                      <td className="p-2 border font-mono font-bold text-indigo-600">{st.index_no}</td>
                      <td className="p-2 border uppercase font-semibold">{st.full_name}</td>
                      <td className="p-2 border">{st.sex}</td>
                      <td className="p-2 border">
                        <select
                          value={st.status || 'active'}
                          onChange={(e) => handleStatusChange(st.id || st.ID, e.target.value)}
                          className={`p-1 text-xs border rounded font-bold ${
                            st.status === 'inactive' ? 'bg-red-50 text-red-600' : 'bg-emerald-50 text-emerald-600'
                          }`}
                        >
                          <option value="active">Active</option>
                          <option value="inactive">Inactive</option>
                        </select>
                      </td>
                      <td className="p-2 border text-center space-x-3">
                        <button
                          onClick={() => handleOpenEdit(st)}
                          className="text-indigo-600 hover:underline font-bold text-xs"
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => handleDeleteStudent(st.id || st.ID)}
                          className="text-red-600 hover:underline font-bold text-xs"
                        >
                          Delete
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          )}
        </div>

        {/* 4. Modal ya Kuedit Student */}
        {editingStudent && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
            <div className="bg-white p-6 rounded-2xl max-w-md w-full space-y-4 shadow-xl">
              <h3 className="text-lg font-bold border-b pb-2">Edit Student Details</h3>
              <form onSubmit={handleUpdateStudent} className="space-y-4">
                <div>
                  <label className="text-xs font-bold text-slate-600">Full Name</label>
                  <input
                    type="text"
                    value={editName}
                    onChange={(e) => setEditName(e.target.value)}
                    className="w-full p-2 border rounded-xl mt-1 font-semibold uppercase"
                    required
                  />
                </div>

                <div>
                  <label className="text-xs font-bold text-slate-600">Sex</label>
                  <select
                    value={editSex}
                    onChange={(e) => setEditSex(e.target.value)}
                    className="w-full p-2 border rounded-xl mt-1 font-semibold"
                  >
                    <option value="F">Female (F)</option>
                    <option value="M">Male (M)</option>
                  </select>
                </div>

                <div className="flex justify-end gap-2 pt-2">
                  <button
                    type="button"
                    onClick={() => setEditingStudent(null)}
                    className="px-4 py-2 border rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-100"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={updating}
                    className="px-4 py-2 bg-indigo-600 text-white rounded-xl text-xs font-bold hover:bg-indigo-700"
                  >
                    {updating ? 'Saving...' : 'Save Changes'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

      </div>
    </div>
  );
};

export default StudentManagement;