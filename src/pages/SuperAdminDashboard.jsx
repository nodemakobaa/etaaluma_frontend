import React, { useState, useEffect } from 'react';
import { API_BASE_URL } from '../config/api';

const SuperAdminDashboard = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [adminUser, setAdminUser] = useState(null);
  const [loading, setLoading] = useState(true);

  const [stats, setStats] = useState({
    total_schools: 0,
    total_teachers: 0,
    total_students: 0,
    recent_schools: []
  });

  // Modal State
  const [selectedSchool, setSelectedSchool] = useState(null);
  const [subscriptionForm, setSubscriptionForm] = useState({
    plan: 'Term-Based License',
    status: 'active',
    expiry: '2026-12-31'
  });
  const [savingSub, setSavingSub] = useState(false);

  useEffect(() => {
    const userData = localStorage.getItem('user');
    if (userData) {
      try {
        setAdminUser(JSON.parse(userData));
      } catch (e) {
        console.error("Error parsing user data:", e);
      }
    }
    fetchDashboardStats();
  }, []);

  const fetchDashboardStats = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_BASE_URL}/super-admin/stats`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      
      const data = await response.json();
      if (data.status === 'success' && data.data) {
        setStats(data.data);
      }
    } catch (error) {
      console.error("Error fetching stats:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleOpenManageModal = (school) => {
    setSelectedSchool(school);
    const existingExpiry = school.subscription_expiry ? school.subscription_expiry.split('T')[0] : '2026-12-31';
    setSubscriptionForm({
      plan: school.subscription_plan || 'Term-Based License',
      status: school.subscription_status || 'active',
      expiry: existingExpiry
    });
  };

  const handleSaveSubscription = async (e) => {
    e.preventDefault();
    setSavingSub(true);
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_BASE_URL}/super-admin/schools/${selectedSchool.registration_no}/subscription`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(subscriptionForm)
      });

      const resData = await response.json();
      if (response.ok && resData.status === 'success') {
        alert('School subscription and license updated successfully!');
        setSelectedSchool(null);
        fetchDashboardStats();
      } else {
        alert(resData.message || 'Failed to update subscription');
      }
    } catch (err) {
      alert('Unable to save changes to the server.');
    } finally {
      setSavingSub(false);
    }
  };

  const handleLogout = () => {
    localStorage.clear();
    window.location.href = '/login';
  };

  return (
    <div className="min-h-screen bg-gray-100 flex flex-col md:flex-row">
      {/* 1. SIDEBAR */}
      <aside className={`fixed inset-y-0 left-0 z-50 w-64 bg-slate-900 text-white transform ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'} transition-transform duration-300 ease-in-out md:relative md:translate-x-0 flex flex-col justify-between`}>
        <div>
          <div className="h-16 flex items-center justify-between px-6 bg-slate-950 font-bold text-xl tracking-wide text-indigo-400">
            <span>E-TAALUMA HQ</span>
            <button className="md:hidden text-gray-400" onClick={() => setSidebarOpen(false)}>
              ✕
            </button>
          </div>

          <nav className="mt-6 px-4 space-y-2">
            <a href="#dashboard" className="flex items-center gap-3 px-4 py-3 text-sm font-medium bg-indigo-600 text-white rounded-lg shadow">
              Dashboard
            </a>
            <a href="#schools" className="flex items-center gap-3 px-4 py-3 text-sm font-medium text-gray-300 hover:bg-slate-800 hover:text-white rounded-lg transition">
              All Schools
            </a>
            <a href="#teachers" className="flex items-center gap-3 px-4 py-3 text-sm font-medium text-gray-300 hover:bg-slate-800 hover:text-white rounded-lg transition">
              Teachers & Staff
            </a>
          </nav>
        </div>

        <div className="p-4 border-t border-slate-800">
          <button 
            onClick={handleLogout}
            className="w-full flex items-center justify-center gap-2 px-4 py-2 text-sm font-medium text-red-400 hover:bg-red-500/10 rounded-lg transition"
          >
            Logout
          </button>
        </div>
      </aside>

      {/* 2. MAIN CONTENT AREA */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Header */}
        <header className="h-16 bg-white border-b border-gray-200 flex items-center justify-between px-6">
          <button className="md:hidden text-gray-600" onClick={() => setSidebarOpen(true)}>
            ☰
          </button>
          <h1 className="text-lg font-semibold text-gray-800">Super Admin Control Center</h1>

          <div className="flex items-center gap-3">
            <div className="text-right hidden sm:block">
              <p className="text-sm font-medium text-gray-900">{adminUser?.school_name || "System Admin"}</p>
              <p className="text-xs text-indigo-600 font-semibold uppercase">{adminUser?.role || "super_admin"}</p>
            </div>
            <div className="w-10 h-10 rounded-full bg-indigo-600 text-white font-bold flex items-center justify-center shadow">
              SA
            </div>
          </div>
        </header>

        {/* Dashboard Main View */}
        <main className="flex-1 overflow-y-auto p-6 space-y-6">
          <div className="bg-gradient-to-r from-indigo-700 to-indigo-900 rounded-2xl p-6 text-white shadow-lg">
            <h2 className="text-2xl font-bold">Welcome back, System Owner! 👋</h2>
            <p className="mt-1 text-indigo-200 text-sm">
              Manage schools, verify licenses, and control system operations.
            </p>
          </div>

          {/* REAL STATS CARDS */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            <div className="bg-white p-5 rounded-xl border border-gray-200 shadow-sm flex items-center justify-between">
              <div>
                <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Registered Schools</p>
                <h3 className="text-2xl font-extrabold text-gray-900 mt-1">
                  {loading ? "..." : (stats.total_schools || 0)}
                </h3>
              </div>
              <div className="p-3 bg-indigo-50 text-indigo-600 rounded-lg text-xl">🏫</div>
            </div>

            <div className="bg-white p-5 rounded-xl border border-gray-200 shadow-sm flex items-center justify-between">
              <div>
                <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Total Teachers</p>
                <h3 className="text-2xl font-extrabold text-gray-900 mt-1">
                  {loading ? "..." : (stats.total_teachers || 0)}
                </h3>
              </div>
              <div className="p-3 bg-emerald-50 text-emerald-600 rounded-lg text-xl">🧑‍🏫</div>
            </div>

            <div className="bg-white p-5 rounded-xl border border-gray-200 shadow-sm flex items-center justify-between">
              <div>
                <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Total Students</p>
                <h3 className="text-2xl font-extrabold text-gray-900 mt-1">
                  {loading ? "..." : (stats.total_students || 0)}
                </h3>
              </div>
              <div className="p-3 bg-amber-50 text-amber-600 rounded-lg text-xl">🎓</div>
            </div>

            <div className="bg-white p-5 rounded-xl border border-gray-200 shadow-sm flex items-center justify-between">
              <div>
                <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Server Status</p>
                <span className="inline-block mt-2 px-2 py-1 text-xs font-bold text-green-700 bg-green-100 rounded-full">
                  Online (Active)
                </span>
              </div>
              <div className="p-3 bg-blue-50 text-blue-600 rounded-lg">
                <span className="w-3 h-3 bg-green-500 rounded-full animate-ping block"></span>
              </div>
            </div>
          </div>

          {/* REAL SCHOOLS TABLE */}
          <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
            <div className="p-5 border-b border-gray-100 flex items-center justify-between">
              <h3 className="font-bold text-gray-800">Registered Institutions & License Status</h3>
              <button onClick={fetchDashboardStats} className="text-xs font-semibold text-indigo-600 hover:text-indigo-800">
                Refresh Data
              </button>
            </div>
            
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-gray-50 text-xs font-semibold text-gray-500 uppercase tracking-wider border-b border-gray-200">
                    <th className="p-4">Reg No</th>
                    <th className="p-4">School Name</th>
                    <th className="p-4">Active Plan</th>
                    <th className="p-4">Status</th>
                    <th className="p-4">License Expiry</th>
                    <th className="p-4">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 text-sm text-gray-700">
                  {loading ? (
                    <tr>
                      <td colSpan="6" className="p-4 text-center text-gray-500">Loading database records...</td>
                    </tr>
                  ) : !stats.recent_schools || stats.recent_schools.length === 0 ? (
                    <tr>
                      <td colSpan="6" className="p-4 text-center text-gray-500">No registered schools found.</td>
                    </tr>
                  ) : (
                    stats.recent_schools.map((school) => (
                      <tr key={school.ID || school.id} className="hover:bg-gray-50/50 transition">
                        <td className="p-4 font-mono font-medium text-indigo-600">{school.registration_no}</td>
                        <td className="p-4 font-semibold text-gray-900">{school.school_name || "N/A"}</td>
                        <td className="p-4">
                          <span className="px-2.5 py-1 bg-purple-50 text-purple-700 border border-purple-200 text-xs font-semibold rounded-md">
                            {school.subscription_plan || "Trial Period"}
                          </span>
                        </td>
                        <td className="p-4">
                          <span className={`px-2 py-1 text-xs font-bold rounded-full ${
                            school.subscription_status === 'expired' 
                              ? 'bg-rose-100 text-rose-800' 
                              : 'bg-emerald-100 text-emerald-800'
                          }`}>
                            {school.subscription_status === 'expired' ? 'Expired' : 'Active'}
                          </span>
                        </td>
                        <td className="p-4 text-gray-600 font-mono text-xs">
                          {school.subscription_expiry ? school.subscription_expiry.split('T')[0] : "31 Dec 2026"}
                        </td>
                        <td className="p-4">
                          <button 
                            onClick={() => handleOpenManageModal(school)}
                            className="text-xs bg-indigo-50 text-indigo-600 hover:bg-indigo-100 px-3 py-1.5 rounded-lg font-bold transition border border-indigo-200 cursor-pointer"
                          >
                            Manage License
                          </button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </main>
      </div>

      {/* 3. MANAGE SCHOOL & SUBSCRIPTION MODAL */}
      {selectedSchool && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl space-y-5">
            <div className="flex justify-between items-center border-b border-gray-100 pb-3">
              <div>
                <h3 className="text-lg font-bold text-gray-800">Manage School License</h3>
                <p className="text-xs text-indigo-600 font-semibold">{selectedSchool.school_name} ({selectedSchool.registration_no})</p>
              </div>
              <button onClick={() => setSelectedSchool(null)} className="text-gray-400 hover:text-gray-600 text-lg">✕</button>
            </div>

            {/* School Quick Details */}
            <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-200 text-xs space-y-1.5 text-gray-600">
              <p><strong>Academic Head:</strong> {selectedSchool.academic_head || "N/A"}</p>
              <p><strong>Contact:</strong> {selectedSchool.school_contact || "N/A"} | {selectedSchool.school_email || "N/A"}</p>
              <p><strong>Location:</strong> {selectedSchool.location || "N/A"}</p>
            </div>

            {/* License Form */}
            <form onSubmit={handleSaveSubscription} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">Select Subscription Plan</label>
                <select 
                  value={subscriptionForm.plan}
                  onChange={(e) => setSubscriptionForm({...subscriptionForm, plan: e.target.value})}
                  className="w-full text-sm border border-gray-300 rounded-lg p-2.5 bg-white focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                >
                  <option value="Trial Period">Trial Period (Free)</option>
                  <option value="Term-Based License">Term-Based License (TZS 40,000 / Term)</option>
                  <option value="Annual Unlimited License">Annual Unlimited License (TZS 80,000 / Year)</option>
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">License Status</label>
                  <select 
                    value={subscriptionForm.status}
                    onChange={(e) => setSubscriptionForm({...subscriptionForm, status: e.target.value})}
                    className="w-full text-sm border border-gray-300 rounded-lg p-2.5 bg-white focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                  >
                    <option value="active">Active (Access Granted)</option>
                    <option value="expired">Expired (Block Operations)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">License Expiry Date</label>
                  <input 
                    type="date"
                    required
                    value={subscriptionForm.expiry}
                    onChange={(e) => setSubscriptionForm({...subscriptionForm, expiry: e.target.value})}
                    className="w-full text-sm border border-gray-300 rounded-lg p-2 bg-white focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                  />
                </div>
              </div>

              <div className="flex gap-3 pt-4 border-t border-gray-100">
                <button 
                  type="submit"
                  disabled={savingSub}
                  className="flex-1 bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-2.5 rounded-lg text-sm transition shadow-md disabled:opacity-50 cursor-pointer"
                >
                  {savingSub ? 'Saving Changes...' : 'Save License Settings'}
                </button>
                <button 
                  type="button"
                  onClick={() => setSelectedSchool(null)}
                  className="px-4 bg-gray-100 text-gray-700 font-semibold py-2.5 rounded-lg text-sm hover:bg-gray-200 transition cursor-pointer"
                >
                  Close
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default SuperAdminDashboard;