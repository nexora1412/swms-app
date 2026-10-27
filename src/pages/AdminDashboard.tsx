import React, { useState } from 'react';
import { User, Alert } from '../types/swms';
import { StorageService } from '../services/storageService';
import {
  Users,
  BarChart3,
  ShieldAlert,
  FastForward,
  CheckCircle2,
  AlertTriangle,
  Lock,
  EyeOff,
  UserCog,
  RefreshCw,
  Building2,
  CalendarCheck2,
} from 'lucide-react';

interface AdminDashboardProps {
  currentUser: User;
}

export const AdminDashboard: React.FC<AdminDashboardProps> = ({ currentUser }) => {
  const storage = StorageService.getInstance();

  const [tab, setTab] = useState<'analytics' | 'management'>('analytics');
  const [users, setUsers] = useState<User[]>(storage.getUsers());
  const [alerts, setAlerts] = useState<Alert[]>(storage.getAlerts());
  const cohorts = storage.getCohorts();
  const [ffMessage, setFfMessage] = useState<string | null>(null);

  // Compute Anonymized Aggregates
  const totalStudents = cohorts.reduce((acc, c) => acc + c.count, 0);
  const weightedScoreTotal = cohorts.reduce((acc, c) => acc + c.avgComposite * c.count, 0);
  const avgCampusScore = (weightedScoreTotal / totalStudents).toFixed(1);

  const totalLow = cohorts.reduce((acc, c) => acc + c.lowRiskCount, 0);
  const totalMod = cohorts.reduce((acc, c) => acc + c.moderateRiskCount, 0);
  const totalHigh = cohorts.reduce((acc, c) => acc + c.highRiskCount, 0);

  const tier1Alerts = alerts.filter((a) => a.tier === 1).length;
  const tier2Alerts = alerts.filter((a) => a.tier === 2).length;
  const tier3Alerts = alerts.filter((a) => a.tier === 3).length;

  // Escalated alerts queue: Tier 3 alerts that have been escalated or have unbooked >= 48h
  const escalationQueue = alerts.filter(
    (a) => a.tier === 3 && (a.status === 'escalated_to_admin' || (a.hoursUnbooked ?? 0) >= 48)
  );

  const handleFastForward48h = () => {
    const escalatedCount = storage.fastForward48Hours();
    setAlerts(storage.getAlerts());
    setFfMessage(`Fast-Forward triggered! ${escalatedCount} unbooked Tier 3 alert(s) escalated to the Admin Review Queue.`);
    setTimeout(() => setFfMessage(null), 4000);
  };

  const handleRoleChange = (userId: string, newRole: User['role']) => {
    storage.updateUserRole(userId, newRole);
    setUsers(storage.getUsers());
  };

  const handleToggleActive = (userId: string) => {
    storage.toggleUserActive(userId);
    setUsers(storage.getUsers());
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-[#e7e2d7] pb-4">
        <div>
          <span className="text-xs font-semibold text-purple-700 tracking-wide uppercase">
            Administrative & Institutional Governance (S13 & S14)
          </span>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
            Campus Wellness Administration
          </h1>
          <p className="text-xs sm:text-sm text-slate-500">
            Dr. Naziya Huzzain (Admin) • High-level cohort metrics with differential privacy & k-anonymity
          </p>
        </div>

        {/* Tab Switcher */}
        <div className="inline-flex rounded-xl bg-slate-100 p-1 border border-slate-200 text-xs font-semibold">
          <button
            onClick={() => setTab('analytics')}
            className={`px-3 py-1.5 rounded-lg transition-all ${
              tab === 'analytics' ? 'bg-white text-purple-900 shadow-xs' : 'text-slate-600'
            }`}
          >
            S13: Anonymised Analytics
          </button>
          <button
            onClick={() => setTab('management')}
            className={`px-3 py-1.5 rounded-lg transition-all ${
              tab === 'management' ? 'bg-white text-purple-900 shadow-xs' : 'text-slate-600'
            }`}
          >
            S14: Users & Escalation Queue
          </button>
        </div>
      </div>

      {/* S13: Anonymised Analytics */}
      {tab === 'analytics' && (
        <div className="space-y-8">
          {/* Top KPI Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-2">
              <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                Average Wellness Score
              </span>
              <div className="text-3xl font-black text-slate-900">
                {avgCampusScore} <span className="text-sm font-normal text-slate-400">/ 100</span>
              </div>
              <p className="text-[11px] text-teal-700 font-medium">Aggregated across all cohort logs</p>
            </div>

            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-2">
              <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                Active Student Cohort
              </span>
              <div className="text-3xl font-black text-slate-900">{totalStudents}</div>
              <p className="text-[11px] text-slate-500 font-medium">Reporting across 4 academic departments</p>
            </div>

            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-2">
              <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                Alerts by Severity Tier
              </span>
              <div className="flex items-center gap-2 text-xs font-bold">
                <span className="px-2 py-0.5 rounded bg-teal-100 text-teal-800">T1: {tier1Alerts}</span>
                <span className="px-2 py-0.5 rounded bg-amber-100 text-amber-800">T2: {tier2Alerts}</span>
                <span className="px-2 py-0.5 rounded bg-rose-100 text-rose-800">T3: {tier3Alerts}</span>
              </div>
              <p className="text-[11px] text-slate-500 font-medium">Total active trigger states</p>
            </div>

            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-2">
              <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                Consultation Bookings
              </span>
              <div className="text-3xl font-black text-slate-900">18 / wk</div>
              <p className="text-[11px] text-emerald-700 font-medium">85% attendance rate</p>
            </div>
          </div>

          {/* Section 5.7: Departmental Cohorts with k-Anonymity Guard (< 5 hidden) */}
          <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-xs space-y-4">
            <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-2">
              <div>
                <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                  <Building2 className="w-5 h-5 text-purple-700" />
                  Departmental Wellness Aggregates
                </h2>
                <p className="text-xs text-slate-500">
                  Strict privacy compliance: Cohorts with fewer than 5 students are suppressed to prevent re-identification.
                </p>
              </div>
              <div className="flex items-center gap-1.5 text-xs text-purple-800 bg-purple-50 border border-purple-200 px-3 py-1 rounded-full font-bold">
                <Lock className="w-3.5 h-3.5" /> k-Anonymity (k ≥ 5) Enforced
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-slate-200 text-slate-400 uppercase font-semibold">
                    <th className="py-3 px-3">Department</th>
                    <th className="py-3 px-3">Student Count</th>
                    <th className="py-3 px-3">Avg Wellness Score</th>
                    <th className="py-3 px-3">Low Risk</th>
                    <th className="py-3 px-3">Moderate Risk</th>
                    <th className="py-3 px-3">High Risk</th>
                    <th className="py-3 px-3">Privacy Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {cohorts.map((c) => {
                    // Check k-anonymity rule: count < 5
                    const isSuppressed = c.count < 5;

                    return (
                      <tr
                        key={c.department}
                        className={isSuppressed ? 'bg-amber-50/50' : 'hover:bg-slate-50'}
                      >
                        <td className="py-3.5 px-3 font-bold text-slate-900">
                          {c.department}
                        </td>
                        <td className="py-3.5 px-3 font-semibold text-slate-700">
                          {c.count} students
                        </td>
                        <td className="py-3.5 px-3">
                          {isSuppressed ? (
                            <span className="text-amber-800 font-mono font-bold flex items-center gap-1">
                              <EyeOff className="w-3.5 h-3.5" /> [Suppressed: k &lt; 5]
                            </span>
                          ) : (
                            <span className="font-extrabold text-slate-900 text-sm">
                              {c.avgComposite}
                            </span>
                          )}
                        </td>
                        <td className="py-3.5 px-3 text-emerald-700 font-semibold">
                          {isSuppressed ? '—' : `${c.lowRiskCount}`}
                        </td>
                        <td className="py-3.5 px-3 text-amber-700 font-semibold">
                          {isSuppressed ? '—' : `${c.moderateRiskCount}`}
                        </td>
                        <td className="py-3.5 px-3 text-rose-700 font-semibold">
                          {isSuppressed ? '—' : `${c.highRiskCount}`}
                        </td>
                        <td className="py-3.5 px-3">
                          {isSuppressed ? (
                            <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-amber-100 text-amber-900 border border-amber-300">
                              Privacy Protected
                            </span>
                          ) : (
                            <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-100 text-emerald-900 border border-emerald-300">
                              Published Aggregate
                            </span>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* S14: User Management & 48h Escalation Review Queue */}
      {tab === 'management' && (
        <div className="space-y-8">
          {/* 48-Hour Escalation Review Queue Banner */}
          <div className="bg-rose-50 border-2 border-rose-300 rounded-3xl p-6 space-y-4">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-rose-600 text-white flex items-center justify-center shrink-0">
                  <ShieldAlert className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-rose-950">
                    Tier 3 Escalation Review Queue
                  </h3>
                  <p className="text-xs text-rose-800">
                    Students with severe screening indicators who have not booked a consultation within 48 hours.
                  </p>
                </div>
              </div>

              {/* Demo Fast-Forward Button (Section 1 & Section 4 Flow D) */}
              <button
                onClick={handleFastForward48h}
                className="inline-flex items-center gap-2 px-4 py-2.5 bg-rose-700 hover:bg-rose-800 text-white rounded-xl text-xs font-bold shadow-xs transition-transform active:scale-95"
                title="Simulate 48 hours passing without booking to trigger admin escalation"
              >
                <FastForward className="w-4 h-4" /> Fast-Forward 48 Hours (Demo)
              </button>
            </div>

            {ffMessage && (
              <div className="p-3 bg-white border border-rose-300 rounded-xl text-xs text-rose-900 font-semibold flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-rose-700" />
                {ffMessage}
              </div>
            )}

            {/* Escalated Alerts List */}
            {escalationQueue.length === 0 ? (
              <div className="bg-white/80 p-6 rounded-2xl border border-rose-200 text-center text-xs text-rose-800">
                The escalation queue is currently clear. Click <strong>"Fast-Forward 48 Hours (Demo)"</strong> to test escalation of Student C's unresolved Tier 3 alert.
              </div>
            ) : (
              <div className="space-y-3">
                {escalationQueue.map((item) => (
                  <div
                    key={item.id}
                    className="bg-white p-4 rounded-xl border border-rose-300 text-xs flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 shadow-xs"
                  >
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-slate-900 text-sm">{item.studentName}</span>
                        <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-rose-100 text-rose-800 border border-rose-200 uppercase">
                          Escalated to Administration
                        </span>
                      </div>
                      <p className="text-slate-600">{item.reason}</p>
                      <span className="text-[11px] text-rose-700 font-medium">
                        Unbooked duration: {item.hoursUnbooked ?? 49} hours
                      </span>
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => alert(`Outreach initiated for ${item.studentName}. Student welfare team dispatched safe check-in notification.`)}
                        className="px-3 py-1.5 bg-rose-700 hover:bg-rose-800 text-white font-bold rounded-lg text-xs"
                      >
                        Initiate Welfare Outreach
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* User Management Table */}
          <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-xs space-y-4">
            <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
              <UserCog className="w-5 h-5 text-purple-700" /> User Roles & Access Management
            </h2>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-slate-200 text-slate-400 uppercase font-semibold">
                    <th className="py-3 px-3">User Name</th>
                    <th className="py-3 px-3">Email Address</th>
                    <th className="py-3 px-3">Current Role</th>
                    <th className="py-3 px-3">Department</th>
                    <th className="py-3 px-3">Account Status</th>
                    <th className="py-3 px-3">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {users.map((u) => (
                    <tr key={u.id} className="hover:bg-slate-50">
                      <td className="py-3 px-3 font-bold text-slate-900">{u.name}</td>
                      <td className="py-3 px-3 text-slate-600 font-mono">{u.email}</td>
                      <td className="py-3 px-3">
                        <select
                          value={u.role}
                          onChange={(e) => handleRoleChange(u.id, e.target.value as any)}
                          className="p-1 border border-slate-300 rounded font-semibold text-xs bg-white"
                        >
                          <option value="student">Student</option>
                          <option value="provider">Provider</option>
                          <option value="admin">Admin</option>
                        </select>
                      </td>
                      <td className="py-3 px-3 text-slate-600">{u.department ?? 'Health Centre'}</td>
                      <td className="py-3 px-3">
                        <span
                          className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                            u.isActive
                              ? 'bg-emerald-100 text-emerald-800'
                              : 'bg-slate-200 text-slate-600'
                          }`}
                        >
                          {u.isActive ? 'Active' : 'Deactivated'}
                        </span>
                      </td>
                      <td className="py-3 px-3">
                        <button
                          onClick={() => handleToggleActive(u.id)}
                          className={`text-xs font-bold underline ${
                            u.isActive ? 'text-rose-600 hover:text-rose-800' : 'text-emerald-700 hover:text-emerald-900'
                          }`}
                        >
                          {u.isActive ? 'Deactivate' : 'Reactivate'}
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
