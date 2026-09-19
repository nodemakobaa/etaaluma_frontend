import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { API_BASE_URL } from '../config/api';

const SubscriptionManagement = () => {
  const navigate = useNavigate();
  const { user } = useAuth();

  const [loading, setLoading] = useState(true);
  const [subData, setSubData] = useState({
    plan: 'Term-Based License',
    status: 'active',
    expiryDate: 'Loading...'
  });

  useEffect(() => {
    fetchSubscriptionDetails();
  }, []);

  const fetchSubscriptionDetails = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_BASE_URL}/school/subscription-info`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      const res = await response.json();
      if (response.ok && res.status === 'success' && res.data) {
        setSubData({
          plan: res.data.subscription_plan || 'Term-Based License',
          status: res.data.subscription_status || 'active',
          expiryDate: res.data.subscription_expiry ? res.data.subscription_expiry.split('T')[0] : '31 Dec 2026'
        });
      }
    } catch (err) {
      console.error('Failed to load subscription details:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-100 p-6 flex justify-center">
      <div className="max-w-4xl w-full space-y-6">
        <button
          onClick={() => navigate('/academic-dashboard')}
          className="text-slate-600 hover:text-slate-900 text-sm font-semibold flex items-center gap-2 cursor-pointer"
        >
          <span>←</span> Back to Dashboard
        </button>

        {/* Subscription Header */}
        <div className="bg-white p-6 md:p-8 rounded-2xl border border-slate-200 shadow-sm space-y-3">
          <div className="flex flex-wrap justify-between items-center gap-4 border-b border-slate-100 pb-4">
            <div>
              <h1 className="text-2xl font-bold text-slate-800">School Subscription & License</h1>
              <p className="text-slate-500 text-sm mt-1">
                Manage your school active subscription, renewals, and system license packages.
              </p>
            </div>
            <span className={`text-xs font-bold px-3 py-1.5 rounded-full border ${
              subData.status === 'expired' 
                ? 'bg-rose-100 text-rose-800 border-rose-300' 
                : 'bg-emerald-100 text-emerald-800 border-emerald-300'
            }`}>
              ● {loading ? 'Checking...' : subData.status === 'expired' ? 'Expired / Suspended' : 'Active License'}
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-4">
            <div className="bg-slate-50 p-4 rounded-xl border border-slate-200">
              <span className="text-xs font-semibold text-slate-500 block uppercase">School Reg No</span>
              <span className="text-lg font-bold text-slate-800 font-mono">{user?.registration_no || 'S3001'}</span>
            </div>
            <div className="bg-slate-50 p-4 rounded-xl border border-slate-200">
              <span className="text-xs font-semibold text-slate-500 block uppercase">Active Plan</span>
              <span className="text-lg font-bold text-purple-700">{loading ? '...' : subData.plan}</span>
            </div>
            <div className="bg-slate-50 p-4 rounded-xl border border-slate-200">
              <span className="text-xs font-semibold text-slate-500 block uppercase">License Expiry</span>
              <span className="text-lg font-bold text-emerald-700 font-mono">{loading ? '...' : subData.expiryDate}</span>
            </div>
          </div>
        </div>

        {/* Subscription Plans */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-white p-6 rounded-2xl border-2 border-emerald-500 shadow-sm space-y-4 relative">
            <span className="absolute top-4 right-4 bg-emerald-500 text-white text-[10px] font-bold uppercase px-2.5 py-1 rounded-full">
              Standard
            </span>
            <h3 className="text-lg font-bold text-slate-800">Term-Based License</h3>
            <p className="text-xs text-slate-500">Ideal for term-by-term fee collections and exams.</p>
            <div className="text-2xl font-extrabold text-slate-900">
              TZS 40,000 <span className="text-xs text-slate-500 font-normal">/ Term</span>
            </div>
            <ul className="text-xs text-slate-600 space-y-2 pt-2 border-t border-slate-100">
              <li>✓ Unlimited Student Result Processing</li>
              <li>✓ Automated NECTA Divisions & GPA Calculation</li>
              <li>✓ Unlimited Teacher Accounts</li>
              <li>✓ Official Single-Page Progress Reports (PDF/Print)</li>
            </ul>
            <button
              onClick={() => alert('Wasiliana na Msimamizi Mkuu (System Owner) kupitia +255 752 488 857 ili kufanya renewal.')}
              className="w-full bg-emerald-600 hover:bg-emerald-500 text-white font-bold py-2.5 rounded-xl text-xs transition shadow-sm cursor-pointer"
            >
              Renew Subscription
            </button>
          </div>

          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4">
            <h3 className="text-lg font-bold text-slate-800">Annual Unlimited License</h3>
            <p className="text-xs text-slate-500">Pay once per year and access uninterrupted service.</p>
            <div className="text-2xl font-extrabold text-slate-900">
              TZS 80,000 <span className="text-xs text-slate-500 font-normal">/ Year</span>
            </div>
            <ul className="text-xs text-slate-600 space-y-2 pt-2 border-t border-slate-100">
              <li>✓ All Term-Based Features Included</li>
              <li>✓ Priority Cloud Server Backup & Sync</li>
              <li>✓ Free Remote Training for Academic Staff</li>
              <li>✓ Free Technical Support via WhatsApp & Phone</li>
            </ul>
            <button
              onClick={() => alert('Wasiliana na Msimamizi Mkuu (System Owner) kupitia +255 752 488 857 ili kuboresha kifurushi chako.')}
              className="w-full bg-slate-800 hover:bg-slate-700 text-white font-bold py-2.5 rounded-xl text-xs transition shadow-sm cursor-pointer"
            >
              Upgrade to Annual
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SubscriptionManagement;