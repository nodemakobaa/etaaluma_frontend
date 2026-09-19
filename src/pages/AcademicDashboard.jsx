import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { API_BASE_URL } from '../config/api';

const AcademicDashboard = () => {
  const { user, login, logout } = useAuth();
  const navigate = useNavigate();

  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const [showProfileModal, setShowProfileModal] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [updating, setUpdating] = useState(false);
  const [loadingProfile, setLoadingProfile] = useState(false);
  const [updateMessage, setUpdateMessage] = useState({ type: '', text: '' });

  const [formData, setFormData] = useState({
    school_name: user?.school_name || '',
    school_type: user?.school_type || 'Government',
    location: user?.location || '',
    school_address: user?.school_address || '',
    academic_head: user?.academic_head || '',
    school_contact: user?.school_contact || '',
    school_email: user?.school_email || '',
  });

  const [currentLogoUrl, setCurrentLogoUrl] = useState(user?.school_logo || '');
  const [newLogoFile, setNewLogoFile] = useState(null);
  const [logoPreview, setLogoPreview] = useState(user?.school_logo || '');

  const fetchLatestSchoolProfile = async () => {
    const regNo = user?.registration_no || user?.school_registration_no;
    if (!regNo) return;

    setLoadingProfile(true);
    try {
      const res = await fetch(`${API_BASE_URL}/school/profile/${regNo}`, {
        headers: {
          Authorization: `Bearer ${user?.token || ''}`,
        },
      });
      const result = await res.json();

      if (res.ok && result.status === 'success' && result.data) {
        const school = result.data;
        setFormData({
          school_name: school.school_name || '',
          school_type: school.school_type || 'Government',
          location: school.location || '',
          school_address: school.school_address || '',
          academic_head: school.academic_head || '',
          school_contact: school.school_contact || '',
          school_email: school.school_email || '',
        });

        if (school.school_logo) {
          setCurrentLogoUrl(school.school_logo);
          setLogoPreview(school.school_logo);
        }

        const updatedUser = { ...user, ...school };
        if (login) login(updatedUser);
      }
    } catch (err) {
      console.error('Error fetching latest school profile:', err);
    } finally {
      setLoadingProfile(false);
    }
  };

  useEffect(() => {
    if (user?.registration_no || user?.school_registration_no) {
      fetchLatestSchoolProfile();
    }
  }, [user?.registration_no]);

  const handleInputChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleLogoChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setNewLogoFile(file);
      setLogoPreview(URL.createObjectURL(file));
    }
  };

  const handleLogout = async () => {
    setIsLoggingOut(true);
    try {
      await fetch(`${API_BASE_URL}/auth/logout`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${user?.token || ''}`,
        },
      });
    } catch (err) {
      console.error('Failed server logout:', err);
    } finally {
      if (logout) logout();
      setIsLoggingOut(false);
      navigate('/login');
    }
  };

  const handleUpdateProfile = async (e) => {
    e.preventDefault();
    setUpdating(true);
    setUpdateMessage({ type: '', text: '' });

    const data = new FormData();
    Object.keys(formData).forEach((key) => {
      data.append(key, formData[key]);
    });

    if (newLogoFile) {
      data.append('school_logo', newLogoFile);
    }

    const regNo = user?.registration_no || user?.school_registration_no;
    if (!regNo) {
      setUpdateMessage({ type: 'error', text: 'Registration number inahitajika.' });
      setUpdating(false);
      return;
    }

    try {
      const response = await fetch(`${API_BASE_URL}/school/update/${regNo}`, {
        method: 'PUT',
        headers: {
          Authorization: `Bearer ${user?.token || ''}`,
        },
        body: data,
      });

      const result = await response.json();

      if (response.ok && result.status === 'success') {
        setUpdateMessage({ type: 'success', text: result.message || 'Taarifa zimesasishwa kikamilifu!' });

        const updatedLogo = result.data?.school_logo || currentLogoUrl;
        setCurrentLogoUrl(updatedLogo);
        setLogoPreview(updatedLogo);
        setNewLogoFile(null);

        const updatedUserData = {
          ...user,
          ...formData,
          school_logo: updatedLogo,
        };
        if (login) login(updatedUserData);

        setIsEditing(false);
      } else {
        setUpdateMessage({ type: 'error', text: result.message || 'Imeshindikana kusasisha taarifa.' });
      }
    } catch (err) {
      setUpdateMessage({ type: 'error', text: 'Hitilafu ya mtandao! Imeshindikana kuunganisha na backend.' });
    } finally {
      setUpdating(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-100 flex flex-col">
      {/* Navigation Header */}
      <header className="bg-slate-900 text-white py-3 px-6 md:px-8 flex justify-between items-center shadow-md sticky top-0 z-40">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 rounded-full overflow-hidden border-2 border-emerald-500 bg-emerald-950 flex items-center justify-center shadow-sm shrink-0">
            {currentLogoUrl ? (
              <img src={currentLogoUrl} alt="School Logo" className="w-full h-full object-cover" />
            ) : (
              <span className="text-lg">🏫</span>
            )}
          </div>

          <div>
            <h1 className="text-sm font-bold leading-tight">{formData.school_name || user?.school_name || 'E-MatokeoHub'}</h1>
            <p className="text-[11px] text-slate-400">Reg No: {user?.registration_no || user?.school_registration_no || 'N/A'}</p>
          </div>
        </div>

        <div className="flex items-center space-x-3">
          <button
            onClick={() => {
              setShowProfileModal(true);
              setIsEditing(false);
              setUpdateMessage({ type: '', text: '' });
              fetchLatestSchoolProfile();
            }}
            className="bg-slate-800 hover:bg-slate-700 text-slate-200 hover:text-white px-3.5 py-2 rounded-xl text-xs font-semibold transition border border-slate-700 flex items-center space-x-2 cursor-pointer"
          >
            <span>🏫</span>
            <span className="hidden sm:inline">My School Profile</span>
          </button>

          <button
            onClick={handleLogout}
            disabled={isLoggingOut}
            className="bg-red-600 hover:bg-red-500 text-white px-3.5 py-2 rounded-xl text-xs font-bold transition shadow-sm flex items-center space-x-1 cursor-pointer disabled:opacity-50"
          >
            <span>{isLoggingOut ? 'Logging out...' : 'Logout'}</span>
          </button>
        </div>
      </header>

      {/* Main Dashboard Body */}
      <main className="flex-1 p-6 max-w-7xl mx-auto w-full space-y-6">
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <h2 className="text-2xl font-bold text-slate-800">
              Welcome back, {formData.school_name || user?.school_name}!
            </h2>
            <p className="text-slate-500 text-sm mt-1">
              Academic Management, Marks Entry, & NECTA Automated Reports.
            </p>
          </div>
          <span className="bg-emerald-100 text-emerald-800 text-xs font-semibold px-3 py-1.5 rounded-full border border-emerald-200">
            Active Session
          </span>
        </div>

        {/* Quick Action Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div
            onClick={() => navigate('/academic/teachers')}
            className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm hover:shadow-md transition cursor-pointer group"
          >
            <div className="w-12 h-12 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center text-2xl mb-4 group-hover:scale-110 transition-transform">
              👨‍🏫
            </div>
            <h3 className="font-bold text-slate-800 text-lg group-hover:text-blue-600 transition">
              Register Teachers
            </h3>
            <p className="text-slate-500 text-xs mt-1">
              Add new teachers and assign them accounts for entry of student marks.
            </p>
          </div>

          <div
            onClick={() => navigate('/academic/classes')}
            className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm hover:shadow-md transition cursor-pointer group"
          >
            <div className="w-12 h-12 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center text-2xl mb-4 group-hover:scale-110 transition-transform">
              🏫
            </div>
            <h3 className="font-bold text-slate-800 text-lg group-hover:text-emerald-600 transition">
              Create Classes
            </h3>
            <p className="text-slate-500 text-xs mt-1">
              Create classes and streams (e.g., Form 1A, Form 2B).
            </p>
          </div>

          <div
            onClick={() => navigate('/academic/subjects')}
            className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm hover:shadow-md transition cursor-pointer group"
          >
            <div className="w-12 h-12 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center text-2xl mb-4 group-hover:scale-110 transition-transform">
              📚
            </div>
            <h3 className="font-bold text-slate-800 text-lg group-hover:text-purple-600 transition">
              Add Subjects
            </h3>
            <p className="text-slate-500 text-xs mt-1">
              Register subjects taught at your school along with their subject codes.
            </p>
          </div>

            {/* Assign Subjects Card */}
          <div
            onClick={() => navigate('/assign-subjects')}
            className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm hover:shadow-md transition cursor-pointer space-y-3 group"
          >
            <div className="w-12 h-12 bg-indigo-50 text-indigo-600 rounded-xl flex items-center justify-center font-bold text-xl group-hover:bg-indigo-600 group-hover:text-white transition">
              📚
            </div>
            <div>
              <h3 className="font-bold text-slate-800 text-lg">Assign Subjects</h3>
              <p className="text-slate-500 text-xs mt-1">Allocate registered subjects and classes to teachers.</p>
            </div>
          </div>

          <div
            onClick={() => navigate('/register-students')}
            className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm hover:shadow-md transition cursor-pointer space-y-3 group"
          >
            <div className="w-12 h-12 bg-emerald-50 text-emerald-600 rounded-xl flex items-center justify-center font-bold text-xl group-hover:bg-emerald-600 group-hover:text-white transition">
              👨‍🎓
            </div>
            <div>
              <h3 className="font-bold text-slate-800 text-lg">Register Students</h3>
              <p className="text-slate-500 text-xs mt-1">Register single students or bulk upload via Excel template.</p>
            </div>
          </div>
          
          <div
            onClick={() => navigate('/exam-management')}
            className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm hover:shadow-md transition cursor-pointer space-y-3 group"
          >
            <div className="w-12 h-12 bg-amber-50 text-amber-600 rounded-xl flex items-center justify-center font-bold text-xl group-hover:bg-amber-600 group-hover:text-white transition">
              📝
            </div>
            <div>
              <h3 className="font-bold text-slate-800 text-lg">Manage Exams</h3>
              <p className="text-slate-500 text-xs mt-1">Create and manage exam schedules and configurations.</p>
            </div>
          </div>
          {/* iso Sheet Management Card */}
          <div
            onClick={() => navigate('/academic/iso-sheet-management')}
            className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm hover:shadow-md transition cursor-pointer space-y-3 group"
          >
            <div className="w-12 h-12 bg-blue-50 text-blue-600 rounded-xl flex items-center justify-center font-bold text-xl group-hover:bg-blue-600 group-hover:text-white transition">
              📄
            </div>
            <div>
              <h3 className="font-bold text-slate-800 text-lg">ISO Sheet Management</h3>
              <p className="text-slate-500 text-xs mt-1">Manage and update ISO sheets for academic records.</p>
            </div>
          </div>

            {/* View Marks Card */}
            <div
              onClick={() => navigate('/academic/view-marks')}
              className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm hover:shadow-md transition cursor-pointer space-y-3 group"
            >
              <div className="w-12 h-12 bg-purple-50 text-purple-600 rounded-xl flex items-center justify-center font-bold text-xl group-hover:bg-purple-600 group-hover:text-white transition">
                📊
              </div>
              <div>
                <h3 className="font-bold text-slate-800 text-lg">View Marks</h3>
                <p className="text-slate-500 text-xs mt-1">
                  Access and review student exam results and performance.
                </p>
              </div>
            </div>

            {/* Generate Results Card */}
            <div
              onClick={() => navigate('/academic/generate-results')}
              className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm hover:shadow-md transition cursor-pointer space-y-3 group"
            >
              <div className="w-12 h-12 bg-green-50 text-green-600 rounded-xl flex items-center justify-center font-bold text-xl group-hover:bg-green-600 group-hover:text-white transition">
                📈
              </div>
              <div>
                <h3 className="font-bold text-slate-800 text-lg">Generate Results</h3>
                <p className="text-slate-500 text-xs mt-1">
                  Create and export final exam results for students.
                </p>
              </div>
            </div>

            {/* Student Report Card */}
            <div
              onClick={() => navigate('/academic/student-report')}
              className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm hover:shadow-md transition cursor-pointer space-y-3 group"
            >
              <div className="w-12 h-12 bg-blue-50 text-blue-600 rounded-xl flex items-center justify-center font-bold text-xl group-hover:bg-blue-600 group-hover:text-white transition">
                📄
              </div>
              <div>
                <h3 className="font-bold text-slate-800 text-lg">Student Report</h3>
                <p className="text-slate-500 text-xs mt-1">
                  Generate and view individual student academic reports.
                </p>
              </div>
            </div>
            {/* Subscription Management Card */}
            <div
              onClick={() => navigate('/academic/subscription')}
              className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm hover:shadow-md transition cursor-pointer space-y-3 group"
            >
              <div className="w-12 h-12 bg-purple-50 text-purple-600 rounded-xl flex items-center justify-center font-bold text-xl group-hover:bg-purple-600 group-hover:text-white transition">
                📅
              </div>
              <div>
                <h3 className="font-bold text-slate-800 text-lg">Subscription Management</h3>
                <p className="text-slate-500 text-xs mt-1">
                  Manage and configure subscription plans for the school.
                </p>
              </div>
            </div>
        </div>
      </main>

      {/* School Profile Modal */}
      {showProfileModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-3xl shadow-xl border border-slate-200 w-full max-w-2xl my-8 overflow-hidden">
            <div className="bg-slate-900 text-white px-6 py-4 flex justify-between items-center">
              <div className="flex items-center space-x-2">
                <span className="text-xl">🏛️</span>
                <h3 className="font-bold text-lg">School Profile & Parameters</h3>
              </div>
              <button
                onClick={() => setShowProfileModal(false)}
                className="text-slate-400 hover:text-white transition text-2xl font-bold cursor-pointer"
              >
                &times;
              </button>
            </div>

            <div className="p-6 space-y-6">
              {updateMessage.text && (
                <div
                  className={`p-3.5 rounded-xl text-xs font-semibold text-center border ${
                    updateMessage.type === 'success'
                      ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                      : 'bg-red-50 text-red-600 border-red-200'
                  }`}
                >
                  {updateMessage.text}
                </div>
              )}

              <div className="flex flex-col sm:flex-row items-center gap-5 p-4 bg-slate-50 rounded-2xl border border-slate-200">
                <div className="w-24 h-24 rounded-2xl overflow-hidden border-2 border-emerald-500 bg-slate-200 flex items-center justify-center shadow-sm relative shrink-0">
                  {logoPreview ? (
                    <img src={logoPreview} alt="School Logo" className="w-full h-full object-cover" />
                  ) : (
                    <span className="text-3xl">🏫</span>
                  )}
                </div>

                <div className="flex-1 text-center sm:text-left space-y-1">
                  <h4 className="text-lg font-bold text-slate-800">{formData.school_name || user?.school_name}</h4>
                  <p className="text-xs text-slate-500 font-mono">REG NO: {user?.registration_no || user?.school_registration_no}</p>

                  {isEditing && (
                    <div className="pt-2">
                      <label className="text-xs font-bold text-emerald-600 hover:text-emerald-500 cursor-pointer bg-white px-3 py-1.5 rounded-lg border border-emerald-300 shadow-sm inline-block">
                        Chagua Logo Mpya
                        <input type="file" accept="image/*" onChange={handleLogoChange} className="hidden" />
                      </label>
                    </div>
                  )}
                </div>

                {!isEditing && (
                  <button
                    type="button"
                    onClick={() => setIsEditing(true)}
                    className="bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold px-4 py-2 rounded-xl transition shadow-sm cursor-pointer"
                  >
                    ✏️ Edit Profile
                  </button>
                )}
              </div>

              <form onSubmit={handleUpdateProfile} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[11px] font-bold text-slate-500 uppercase mb-1">School Name</label>
                    <input
                      type="text"
                      name="school_name"
                      value={formData.school_name}
                      onChange={handleInputChange}
                      disabled={!isEditing}
                      className="w-full px-3.5 py-2 rounded-xl text-sm border border-slate-300 disabled:bg-slate-100"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-slate-500 uppercase mb-1">School Type</label>
                    <input
                      type="text"
                      name="school_type"
                      value={formData.school_type}
                      onChange={handleInputChange}
                      disabled={!isEditing}
                      className="w-full px-3.5 py-2 rounded-xl text-sm border border-slate-300 disabled:bg-slate-100"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-slate-500 uppercase mb-1">Location</label>
                    <input
                      type="text"
                      name="location"
                      value={formData.location}
                      onChange={handleInputChange}
                      disabled={!isEditing}
                      className="w-full px-3.5 py-2 rounded-xl text-sm border border-slate-300 disabled:bg-slate-100"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-slate-500 uppercase mb-1">School Email</label>
                    <input
                      type="email"
                      name="school_email"
                      value={formData.school_email}
                      onChange={handleInputChange}
                      disabled={!isEditing}
                      className="w-full px-3.5 py-2 rounded-xl text-sm border border-slate-300 disabled:bg-slate-100"
                    />
                  </div>
                </div>

                {isEditing && (
                  <div className="flex justify-end gap-3 pt-4">
                    <button
                      type="button"
                      onClick={() => setIsEditing(false)}
                      className="px-4 py-2 bg-slate-200 text-slate-700 text-xs font-bold rounded-xl"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      disabled={updating}
                      className="px-4 py-2 bg-emerald-600 text-white text-xs font-bold rounded-xl disabled:opacity-50"
                    >
                      {updating ? 'Saving...' : 'Save Changes'}
                    </button>
                  </div>
                )}
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AcademicDashboard;
