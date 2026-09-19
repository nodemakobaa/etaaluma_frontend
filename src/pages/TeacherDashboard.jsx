import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { API_BASE_URL } from '../config/api';
import TeacherNotifications from './TeacherNotifications';

const TeacherDashboard = () => {
  const navigate = useNavigate();

  // Mode iliyochaguliwa ('enter_marks' au 'view_marks')
  const [activeAction, setActiveAction] = useState(null);

  // States za User na Token
  const [user, setUser] = useState(null);
  const [token, setToken] = useState('');

  // States za Data
  const [assignedSubjects, setAssignedSubjects] = useState([]);
  const [allExams, setAllExams] = useState([]);

  // Filter States
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear().toString());
  const [selectedMonth, setSelectedMonth] = useState('');
  const [selectedAssignmentKey, setSelectedAssignmentKey] = useState('');
  const [selectedExamId, setSelectedExamId] = useState('');

  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  // 1. Load User & Token kutoka LocalStorage
  useEffect(() => {
    try {
      const savedUser = localStorage.getItem('school_user');
      const savedToken = localStorage.getItem('token');

      if (!savedUser && !savedToken) {
        navigate('/login');
        return;
      }

      const parsed = savedUser ? JSON.parse(savedUser) : {};
      const finalToken = parsed?.token || savedToken || '';

      setUser(parsed);
      setToken(finalToken);
    } catch (e) {
      console.error('Error in auth setup:', e);
      navigate('/login');
    }
  }, [navigate]);

  // Inafanya fetch pale tu mwalimu anapochagua Action (Enter au View Marks)
  const handleSelectAction = (actionType) => {
    setActiveAction(actionType);
    setSelectedAssignmentKey('');
    setSelectedExamId('');
    setErrorMsg('');
    fetchData();
  };

  const fetchData = async () => {
    setLoading(true);
    setErrorMsg('');

    try {
      // 1. Fetch Assigned Subjects (/api/v1/teacher/my-subjects)
      const subRes = await fetch(`${API_BASE_URL}/teacher/my-subjects`, {
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
      });

      // 2. Fetch Exams (/api/v1/teacher/exams)
      const examRes = await fetch(`${API_BASE_URL}/teacher/exams`, {
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
      });

      if (!subRes.ok || !examRes.ok) {
        throw new Error(`Server status: Subjects (${subRes.status}), Exams (${examRes.status})`);
      }

      const subData = await subRes.json();
      const examData = await examRes.json();

      setAssignedSubjects(subData.data || []);
      setAllExams(examData.data || []);
    } catch (err) {
      console.error('Network error fetching dashboard data:', err);
      setErrorMsg('Failed to connect to the server. Please check backend connection.');
    } finally {
      setLoading(false);
    }
  };

  // Orodha ya Miaka na Miezi kwa ajili ya Filter
  const availableYears = [...new Set(allExams.map((e) => e.year?.toString()).filter(Boolean))];
  const availableMonths = [
    ...new Set(
      allExams
        .filter((e) => !selectedYear || e.year?.toString() === selectedYear)
        .map((e) => e.month)
        .filter(Boolean)
    ),
  ];

  // Chuja Mitihani kulingana na Year na Month
  const filteredExams = allExams.filter((exam) => {
    const matchYear = !selectedYear || exam.year?.toString() === selectedYear;
    const matchMonth = !selectedMonth || exam.month?.toLowerCase() === selectedMonth.toLowerCase();
    return matchYear && matchMonth;
  });

  const selectedExam = allExams.find((exam) => String(exam.id || exam.ID) === String(selectedExamId));
  const isSelectedExamClosed = Boolean(selectedExam?.is_locked) ||
    Boolean(selectedExam?.marks_entry_deadline && new Date(selectedExam.marks_entry_deadline).getTime() <= Date.now());

  const handleSubmit = () => {
    if (!selectedAssignmentKey || !selectedExamId) {
      setErrorMsg('Please select both a Subject and an Exam.');
      return;
    }

    const subjectObj = assignedSubjects.find(
      (s) => `${s.subject_code}__${s.class_id}` === selectedAssignmentKey
    );

    if (!subjectObj) {
      setErrorMsg('Selected subject is invalid.');
      return;
    }

    const queryParams = `class_id=${subjectObj.class_id}&subject_code=${subjectObj.subject_code}&exam_id=${selectedExamId}`;

    if (activeAction === 'enter_marks') {
      navigate(`/teacher/enter-marks?${queryParams}`);
    } else if (activeAction === 'view_marks') {
      navigate(`/teacher/view-marks?${queryParams}`);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('school_user');
    localStorage.removeItem('token');
    navigate('/login');
  };

  return (
    <div className="min-h-screen bg-slate-100 p-4 md:p-8">
      {/* Header Section with School Branding & System Title */}
      <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200 mb-6">
        <div className="flex flex-col md:flex-row items-center justify-between gap-4">
          
          {/* Left: School Logo & Details */}
          <div className="flex items-center space-x-4 w-full md:w-auto">
            {user?.school_logo ? (
              <img
                src={user.school_logo}
                alt="School Logo"
                className="w-16 h-16 md:w-20 md:h-20 object-cover rounded-full border-2 border-emerald-500 shadow-sm flex-shrink-0"
              />
            ) : (
              <div className="w-16 h-16 md:w-20 md:h-20 rounded-full bg-emerald-100 border-2 border-emerald-500 flex items-center justify-center text-emerald-700 font-extrabold text-2xl shadow-sm flex-shrink-0">
                {user?.school_name ? user.school_name.charAt(0).toUpperCase() : 'S'}
              </div>
            )}

            <div>
              <h1 className="text-xl md:text-2xl font-black text-slate-800 uppercase tracking-tight">
                {user?.school_name || 'SCHOOL NAME'}
              </h1>
              
              <div className="mt-0.5 text-xs text-slate-500 font-medium">
                <span className="text-emerald-600 font-bold uppercase tracking-wider">E-Taaluma System</span>
              </div>

              <p className="text-slate-600 text-sm mt-1.5">
                Welcome back, <span className="font-bold text-slate-800">{user?.full_name || 'Teacher'}</span> 👋
              </p>
            </div>
          </div>

          {/* Right: Actions & Academic Badge */}
          <div className="flex items-center justify-between md:justify-end gap-3 w-full md:w-auto border-t md:border-t-0 pt-3 md:pt-0 border-slate-100">
            <div className="hidden sm:block text-right">
              <span className="bg-emerald-50 text-emerald-700 border border-emerald-200 text-xs font-bold px-3 py-1 rounded-full block">
                Academic Year: {new Date().getFullYear()}
              </span>
              <span className="text-[11px] text-slate-400 font-medium mt-1 block">Teacher Portal</span>
            </div>

            <TeacherNotifications />

            <button
              onClick={() => navigate('/teacher/settings')}
              className="bg-slate-50 hover:bg-slate-100 text-slate-700 border border-slate-200 px-4 py-2.5 rounded-xl text-xs font-bold transition cursor-pointer"
            >
              ⚙️ Account
            </button>

            <button
              onClick={handleLogout}
              className="bg-red-50 hover:bg-red-100 text-red-600 border border-red-200 px-4 py-2.5 rounded-xl text-xs font-bold transition cursor-pointer flex items-center gap-1.5"
            >
              🚪 <span>Logout</span>
            </button>
          </div>

        </div>
      </div>

      {/* Main Action Buttons Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5 mb-6">
        <button
          onClick={() => handleSelectAction('enter_marks')}
          className={`p-6 rounded-2xl border text-left transition-all cursor-pointer flex items-center justify-between shadow-sm ${
            activeAction === 'enter_marks'
              ? 'bg-emerald-600 text-white border-emerald-600 ring-2 ring-emerald-400'
              : 'bg-white hover:bg-emerald-50 text-slate-800 border-slate-200'
          }`}
        >
          <div>
            <div className="text-2xl mb-2">📝</div>
            <h3 className="font-bold text-lg">Enter Marks</h3>
            <p className={`text-xs mt-1 ${activeAction === 'enter_marks' ? 'text-emerald-100' : 'text-slate-500'}`}>
              Record student examination scores
            </p>
          </div>
          <span className="text-xl font-bold">→</span>
        </button>

        <button
          onClick={() => handleSelectAction('view_marks')}
          className={`p-6 rounded-2xl border text-left transition-all cursor-pointer flex items-center justify-between shadow-sm ${
            activeAction === 'view_marks'
              ? 'bg-emerald-600 text-white border-emerald-600 ring-2 ring-emerald-400'
              : 'bg-white hover:bg-emerald-50 text-slate-800 border-slate-200'
          }`}
        >
          <div>
            <div className="text-2xl mb-2">📊</div>
            <h3 className="font-bold text-lg">View Marks</h3>
            <p className={`text-xs mt-1 ${activeAction === 'view_marks' ? 'text-emerald-100' : 'text-slate-500'}`}>
              Check and analyze recorded scores
            </p>
          </div>
          <span className="text-xl font-bold">→</span>
        </button>

        <div className="p-6 rounded-2xl border border-dashed border-slate-300 bg-slate-50 flex items-center justify-center text-slate-400 text-sm font-medium">
          + More Actions Coming Soon
        </div>
      </div>

      {/* Form Section */}
      {activeAction && (
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200 space-y-6 transition-all">
          <div className="flex justify-between items-center border-b border-slate-100 pb-3">
            <h2 className="text-lg font-bold text-slate-800">
              {activeAction === 'enter_marks' ? 'Enter Marks Setup' : 'View Marks Setup'}
            </h2>
            <span className="text-xs bg-emerald-100 text-emerald-800 px-3 py-1 rounded-full font-bold">
              Step 2: Select Subject & Exam
            </span>
          </div>

          {errorMsg && (
            <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-xl text-xs font-semibold">
              {errorMsg}
            </div>
          )}

          {loading ? (
            <div className="py-8 text-center text-slate-400 font-medium text-sm">
              Connecting to server and loading subjects...
            </div>
          ) : (
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {/* Subject Selection */}
                <div>
                  <label className="block text-[11px] font-bold text-slate-500 uppercase mb-1">
                    Assigned Subject
                  </label>
                  <select
                    value={selectedAssignmentKey}
                    onChange={(e) => setSelectedAssignmentKey(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl text-sm font-semibold border border-slate-300 bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  >
                    <option value="">-- Select Subject --</option>
                    {assignedSubjects.map((sub, index) => (
                      <option
                        key={`${sub.subject_code}__${sub.class_id}__${index}`}
                        value={`${sub.subject_code}__${sub.class_id}`}
                      >
                        {sub.subject_name} ({sub.class_name})
                      </option>
                    ))}
                  </select>
                </div>

                {/* Filter Year */}
                <div>
                  <label className="block text-[11px] font-bold text-slate-500 uppercase mb-1">
                    Filter Year
                  </label>
                  <select
                    value={selectedYear}
                    onChange={(e) => {
                      setSelectedYear(e.target.value);
                      setSelectedMonth('');
                      setSelectedExamId('');
                    }}
                    className="w-full px-3.5 py-2.5 rounded-xl text-sm font-semibold border border-slate-300 bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  >
                    <option value="">All Years</option>
                    {availableYears.map((yr) => (
                      <option key={yr} value={yr}>
                        {yr}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Filter Month */}
                <div>
                  <label className="block text-[11px] font-bold text-slate-500 uppercase mb-1">
                    Filter Month
                  </label>
                  <select
                    value={selectedMonth}
                    onChange={(e) => {
                      setSelectedMonth(e.target.value);
                      setSelectedExamId('');
                    }}
                    className="w-full px-3.5 py-2.5 rounded-xl text-sm font-semibold border border-slate-300 bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  >
                    <option value="">All Months</option>
                    {availableMonths.map((mth) => (
                      <option key={mth} value={mth}>
                        {mth}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {selectedExam && (
                <div className={`rounded-xl border px-4 py-3 text-xs ${isSelectedExamClosed ? 'bg-red-50 border-red-200 text-red-700' : 'bg-emerald-50 border-emerald-200 text-emerald-700'}`}>
                  <div className="font-bold">{isSelectedExamClosed ? 'Marks Entry Closed' : 'Marks Entry Open'}</div>
                  <div className="mt-1">Deadline: {selectedExam.marks_entry_deadline ? new Date(selectedExam.marks_entry_deadline).toLocaleString([], { dateStyle: 'medium', timeStyle: 'short' }) : 'Not set'}</div>
                  {isSelectedExamClosed && activeAction === 'enter_marks' && (
                    <div className="mt-1 font-semibold">Time for entering this type of exam is already closed. Please go to VIEW MARKS to view marks for this type of exam.</div>
                  )}
                </div>
              )}

              {/* Exam Selection & Action Button */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-end pt-2">
                <div className="md:col-span-2">
                  <label className="block text-[11px] font-bold text-slate-500 uppercase mb-1">
                    Select Exam
                  </label>
                  <select
                    value={selectedExamId}
                    onChange={(e) => setSelectedExamId(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl text-sm font-semibold border border-slate-300 bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  >
                    <option value="">-- Select Exam --</option>
                    {filteredExams.length === 0 ? (
                      <option disabled value="">
                        No exams found for selected filters
                      </option>
                    ) : (
                      filteredExams.map((ex) => (
                        <option key={ex.id || ex.ID} value={ex.id || ex.ID}>
                          {ex.exam_type} - {ex.month} {ex.year} ({ex.term || 'N/A'})
                        </option>
                      ))
                    )}
                  </select>
                </div>

                <div>
                  <button
                    onClick={handleSubmit}
                    disabled={!selectedAssignmentKey || !selectedExamId || (activeAction === 'enter_marks' && isSelectedExamClosed)}
                    className="w-full bg-emerald-600 hover:bg-emerald-500 text-white font-bold py-2.5 px-4 rounded-xl shadow-sm transition cursor-pointer flex items-center justify-center space-x-2 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <span>{activeAction === 'enter_marks' ? 'Proceed to Enter Marks' : 'View Marks'}</span>
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default TeacherDashboard;
