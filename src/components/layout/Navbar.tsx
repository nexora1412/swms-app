import React from 'react';
import { User } from '../../types/swms';
import { StorageService } from '../../services/storageService';
import { HeartPulse, ShieldAlert, RefreshCw, UserCheck, PhoneCall, HelpCircle } from 'lucide-react';

interface NavbarProps {
  currentUser: User;
  onUserChange: (user: User) => void;
  activeTab: string;
  onTabChange: (tab: string) => void;
  onOpenHelp: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  currentUser,
  onUserChange,
  activeTab,
  onTabChange,
  onOpenHelp,
}) => {
  const storage = StorageService.getInstance();
  const allUsers = storage.getUsers();

  const handleResetData = () => {
    if (window.confirm('Reset all demo data back to pristine seed state (Student A low mood, Student B healthy, Student C high risk)?')) {
      storage.initIfEmpty(true);
      window.location.reload();
    }
  };

  const getRoleBadge = (role: string) => {
    switch (role) {
      case 'student':
        return <span className="px-2 py-0.5 rounded-full text-xs font-semibold bg-teal-100 text-teal-800 border border-teal-200">Student View</span>;
      case 'provider':
        return <span className="px-2 py-0.5 rounded-full text-xs font-semibold bg-indigo-100 text-indigo-800 border border-indigo-200">Provider View</span>;
      case 'admin':
        return <span className="px-2 py-0.5 rounded-full text-xs font-semibold bg-purple-100 text-purple-800 border border-purple-200">Admin View</span>;
      default:
        return null;
    }
  };

  return (
    <header className="bg-white/95 backdrop-blur border-b border-[#e7e2d7] sticky top-0 z-40 shadow-xs">
      {/* Top Demo Bar */}
      <div className="bg-[#f3ede2] text-xs text-slate-700 py-1.5 px-4 border-b border-[#e2dacf]">
        <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <span className="font-semibold text-teal-800 flex items-center gap-1">
              <UserCheck className="w-3.5 h-3.5" /> Demo Switcher:
            </span>
            <div className="flex flex-wrap gap-1.5">
              {allUsers.map((u) => {
                const isSelected = u.id === currentUser.id;
                let shortLabel = u.name.split(' ')[0];
                if (u.id === 'usr-student-a') shortLabel = 'Student A (Tier 2)';
                if (u.id === 'usr-student-b') shortLabel = 'Student B (Healthy)';
                if (u.id === 'usr-student-c') shortLabel = 'Student C (High Risk)';
                if (u.id === 'usr-gp') shortLabel = 'GP Doctor';
                if (u.id === 'usr-counsellor') shortLabel = 'Counsellor';
                if (u.id === 'usr-admin') shortLabel = 'Admin';

                return (
                  <button
                    key={u.id}
                    onClick={() => {
                      storage.setCurrentUser(u);
                      onUserChange(u);
                    }}
                    className={`px-2 py-0.5 rounded text-xs transition-all ${
                      isSelected
                        ? 'bg-teal-700 text-white font-medium shadow-xs'
                        : 'bg-white hover:bg-slate-100 text-slate-700 border border-slate-200'
                    }`}
                    title={u.email}
                  >
                    {shortLabel}
                  </button>
                );
              })}
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleResetData}
              className="inline-flex items-center gap-1 text-slate-600 hover:text-slate-900 bg-white hover:bg-slate-50 border border-slate-200 px-2 py-0.5 rounded text-xs"
              title="Reset state to original demo personas"
            >
              <RefreshCw className="w-3 h-3" /> Reset Demo Seed
            </button>
          </div>
        </div>
      </div>

      {/* Main Navigation */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center gap-3">
            <button
              onClick={() => onTabChange('dashboard')}
              className="flex items-center gap-2.5 text-left focus:outline-none"
            >
              <div className="w-10 h-10 rounded-xl bg-teal-600 text-white flex items-center justify-center shadow-xs">
                <HeartPulse className="w-6 h-6" />
              </div>
              <div>
                <span className="font-bold text-lg text-slate-800 tracking-tight block">SWMS</span>
                <span className="text-[11px] text-slate-500 font-medium block -mt-1">
                  Student Wellness Management System
                </span>
              </div>
            </button>
            <div className="ml-2 hidden md:block">
              {getRoleBadge(currentUser.role)}
            </div>
          </div>

          {/* Navigation Links based on Role */}
          <nav className="flex items-center gap-1 sm:gap-2">
            {currentUser.role === 'student' && (
              <>
                <button
                  onClick={() => onTabChange('dashboard')}
                  className={`px-3 py-1.5 rounded-lg text-sm font-medium ${
                    activeTab === 'dashboard'
                      ? 'bg-teal-50 text-teal-800 border border-teal-200'
                      : 'text-slate-600 hover:bg-slate-100'
                  }`}
                >
                  Dashboard
                </button>
                <button
                  onClick={() => onTabChange('booking')}
                  className={`px-3 py-1.5 rounded-lg text-sm font-medium ${
                    activeTab === 'booking'
                      ? 'bg-teal-50 text-teal-800 border border-teal-200'
                      : 'text-slate-600 hover:bg-slate-100'
                  }`}
                >
                  Appointments
                </button>
                <button
                  onClick={() => onTabChange('burnout')}
                  className={`px-3 py-1.5 rounded-lg text-sm font-medium ${
                    activeTab === 'burnout'
                      ? 'bg-teal-50 text-teal-800 border border-teal-200'
                      : 'text-slate-600 hover:bg-slate-100'
                  }`}
                >
                  Burnout Risk
                </button>
                <button
                  onClick={() => onTabChange('privacy')}
                  className={`px-3 py-1.5 rounded-lg text-sm font-medium ${
                    activeTab === 'privacy'
                      ? 'bg-teal-50 text-teal-800 border border-teal-200'
                      : 'text-slate-600 hover:bg-slate-100'
                  }`}
                >
                  Privacy
                </button>
              </>
            )}

            {currentUser.role === 'provider' && (
              <>
                <button
                  onClick={() => onTabChange('provider_dashboard')}
                  className={`px-3 py-1.5 rounded-lg text-sm font-medium ${
                    activeTab === 'provider_dashboard'
                      ? 'bg-indigo-50 text-indigo-800 border border-indigo-200'
                      : 'text-slate-600 hover:bg-slate-100'
                  }`}
                >
                  Appointments & Alerts
                </button>
                <button
                  onClick={() => onTabChange('availability')}
                  className={`px-3 py-1.5 rounded-lg text-sm font-medium ${
                    activeTab === 'availability'
                      ? 'bg-indigo-50 text-indigo-800 border border-indigo-200'
                      : 'text-slate-600 hover:bg-slate-100'
                  }`}
                >
                  Availability Manager
                </button>
                <button
                  onClick={() => onTabChange('student_summary')}
                  className={`px-3 py-1.5 rounded-lg text-sm font-medium ${
                    activeTab === 'student_summary'
                      ? 'bg-indigo-50 text-indigo-800 border border-indigo-200'
                      : 'text-slate-600 hover:bg-slate-100'
                  }`}
                >
                  Consented Summaries
                </button>
              </>
            )}

            {currentUser.role === 'admin' && (
              <>
                <button
                  onClick={() => onTabChange('admin_analytics')}
                  className={`px-3 py-1.5 rounded-lg text-sm font-medium ${
                    activeTab === 'admin_analytics'
                      ? 'bg-purple-50 text-purple-800 border border-purple-200'
                      : 'text-slate-600 hover:bg-slate-100'
                  }`}
                >
                  Cohort Analytics
                </button>
                <button
                  onClick={() => onTabChange('admin_users')}
                  className={`px-3 py-1.5 rounded-lg text-sm font-medium ${
                    activeTab === 'admin_users'
                      ? 'bg-purple-50 text-purple-800 border border-purple-200'
                      : 'text-slate-600 hover:bg-slate-100'
                  }`}
                >
                  Users & Escalations
                </button>
              </>
            )}

            {/* Helpline Action */}
            <button
              onClick={onOpenHelp}
              className="ml-2 inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 transition-colors shadow-2xs"
            >
              <PhoneCall className="w-3.5 h-3.5 text-rose-600" />
              <span>Helpline 14416</span>
            </button>
          </nav>
        </div>
      </div>
    </header>
  );
};
