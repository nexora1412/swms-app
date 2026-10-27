import React, { useState } from 'react';
import { User, DailyLog, Alert } from '../types/swms';
import { StorageService } from '../services/storageService';
import { getWellnessBand, generateInsights } from '../services/scoringEngine';
import { TrendCharts } from '../components/student/TrendCharts';
import { DailyCheckinModal } from '../components/student/DailyCheckinModal';
import { WeeklyScreeningModal } from '../components/student/WeeklyScreeningModal';
import {
  Sparkles,
  Calendar,
  AlertTriangle,
  ClipboardList,
  CheckCircle,
  Lightbulb,
  ArrowRight,
  ShieldCheck,
} from 'lucide-react';

interface StudentDashboardProps {
  currentUser: User;
  onNavigateTab: (tab: string) => void;
  onOpenHelp: () => void;
}

export const StudentDashboard: React.FC<StudentDashboardProps> = ({
  currentUser,
  onNavigateTab,
  onOpenHelp,
}) => {
  const storage = StorageService.getInstance();
  const [logs, setLogs] = useState<DailyLog[]>(storage.getUserLogs(currentUser.id));
  const [alerts, setAlerts] = useState<Alert[]>(storage.getUserAlerts(currentUser.id));
  const [showCheckin, setShowCheckin] = useState<boolean>(false);
  const [showScreening, setShowScreening] = useState<boolean>(false);

  // Latest log & score
  const latestLog = logs[logs.length - 1];
  const compositeScore = latestLog ? latestLog.compositeScore : 70;
  const band = getWellnessBand(compositeScore);
  const insights = generateInsights(logs);

  // Check if today's check-in is missing
  const todayStr = new Date().toISOString().split('T')[0];
  const hasLoggedToday = logs.some((l) => l.logDate === todayStr);

  // Active alerts (Tier 2 or Tier 3)
  const highTierAlert = alerts.find((a) => a.tier === 2 || a.tier === 3);

  const handleSaveCheckin = (
    mood: number,
    sleepHours: number,
    activityMinutes: number,
    mealScore: number,
    mealsResponses: { breakfast: boolean; fruitVeg: boolean; skippedMain: boolean },
    stressLevel: number
  ) => {
    storage.saveDailyCheckin(
      currentUser.id,
      mood,
      sleepHours,
      activityMinutes,
      mealScore,
      mealsResponses,
      stressLevel
    );
    setLogs(storage.getUserLogs(currentUser.id));
    setAlerts(storage.getUserAlerts(currentUser.id));
  };

  const handleSaveScreening = (screeningData: any) => {
    storage.saveScreening(screeningData);
    setAlerts(storage.getUserAlerts(currentUser.id));
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8 animate-fade-in">
      {/* Top Banner if Today's check-in is missing */}
      {!hasLoggedToday && (
        <div className="bg-gradient-to-r from-teal-50 to-emerald-50 border border-teal-200 rounded-2xl p-4 sm:p-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 shadow-2xs">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-teal-600 text-white flex items-center justify-center shrink-0">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <h4 className="font-bold text-slate-800 text-sm sm:text-base">
                Welcome back, {currentUser.name.split(' ')[0]}!
              </h4>
              <p className="text-xs text-slate-600">
                You haven't completed your daily check-in yet. Take 2 minutes to record your rhythms.
              </p>
            </div>
          </div>
          <button
            onClick={() => setShowCheckin(true)}
            className="px-5 py-2.5 bg-teal-700 hover:bg-teal-800 text-white rounded-xl text-xs sm:text-sm font-bold shadow-xs shrink-0 transition-colors"
          >
            Check in today
          </button>
        </div>
      )}

      {/* Active Tier 2 or Tier 3 Alert Banner */}
      {highTierAlert && (
        <div
          className={`rounded-2xl p-5 border flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 shadow-xs ${
            highTierAlert.tier === 3
              ? 'bg-rose-50 border-rose-300 text-rose-950'
              : 'bg-amber-50 border-amber-300 text-amber-950'
          }`}
        >
          <div className="flex items-start gap-3.5">
            <div
              className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 mt-0.5 ${
                highTierAlert.tier === 3 ? 'bg-rose-600 text-white' : 'bg-amber-600 text-white'
              }`}
            >
              <AlertTriangle className="w-5 h-5" />
            </div>
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <span className="font-extrabold text-sm sm:text-base">
                  {highTierAlert.tier === 3 ? 'Tier 3 Support Notice' : 'Tier 2 Wellness Nudge'}
                </span>
                <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-white/80 border border-current">
                  Confidential
                </span>
              </div>
              <p className="text-xs text-slate-700 leading-relaxed max-w-2xl">
                {highTierAlert.reason} Taking proactive time to talk with a campus professional can help relieve overload before it peaks.
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            <button
              onClick={() => onNavigateTab('booking')}
              className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-bold shadow-xs text-white transition-colors flex items-center gap-1.5 ${
                highTierAlert.tier === 3 ? 'bg-rose-700 hover:bg-rose-800' : 'bg-amber-700 hover:bg-amber-800'
              }`}
            >
              <Calendar className="w-4 h-4" /> Book a Consultation
            </button>
          </div>
        </div>
      )}

      {/* Header Profile & Quick Action Bar */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 pb-2 border-b border-[#e7e2d7]">
        <div>
          <span className="text-xs font-semibold text-teal-700 tracking-wide uppercase">
            Student Wellness Portal
          </span>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
            Dashboard Overview
          </h1>
          <p className="text-xs sm:text-sm text-slate-500">
            {currentUser.name} • {currentUser.department} ({currentUser.year})
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          <button
            onClick={() => setShowCheckin(true)}
            className="inline-flex items-center gap-1.5 px-4 py-2 bg-teal-700 hover:bg-teal-800 text-white rounded-xl text-xs sm:text-sm font-bold shadow-xs transition-colors"
          >
            <CheckCircle className="w-4 h-4" /> Check in today
          </button>
          <button
            onClick={() => setShowScreening(true)}
            className="inline-flex items-center gap-1.5 px-4 py-2 bg-white hover:bg-slate-50 text-slate-700 border border-slate-300 rounded-xl text-xs sm:text-sm font-semibold transition-colors"
          >
            <ClipboardList className="w-4 h-4 text-teal-600" /> Weekly Screening
          </button>
        </div>
      </div>

      {/* Composite Score Card & Insights Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Composite Wellness Score (0–100) */}
        <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-xs flex flex-col justify-between">
          <div className="flex justify-between items-start">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
              Composite Wellness Score
            </span>
            <span
              className={`px-2.5 py-1 rounded-full text-xs font-bold border ${band.badgeColor}`}
            >
              {band.label}
            </span>
          </div>

          <div className="my-6 text-center">
            <div className="text-6xl font-black text-slate-900 tracking-tight">
              {compositeScore}
              <span className="text-xl font-normal text-slate-400 ml-1">/100</span>
            </div>
            <p className="text-xs text-slate-500 mt-2 max-w-xs mx-auto">
              {band.explanation}
            </p>
          </div>

          <div className="pt-4 border-t border-slate-100 flex items-center justify-between text-xs text-slate-600">
            <span>5 Weighted Domains (20% each)</span>
            <button
              onClick={() => onNavigateTab('burnout')}
              className="text-teal-700 font-bold hover:underline inline-flex items-center gap-0.5"
            >
              Burnout Risk <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* Personalized Insight Cards */}
        <div className="lg:col-span-2 bg-[#fbf9f5] rounded-2xl p-6 border border-[#e7e2d7] shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center gap-2 mb-3">
              <Lightbulb className="w-5 h-5 text-amber-600" />
              <h3 className="font-bold text-slate-800 text-sm uppercase tracking-wider">
                Lifestyle & Habit Insights
              </h3>
            </div>
            <div className="space-y-3">
              {insights.map((text, idx) => (
                <div
                  key={idx}
                  className="bg-white p-3.5 rounded-xl border border-slate-200 text-xs sm:text-sm text-slate-700 shadow-2xs flex items-start gap-2.5"
                >
                  <span className="w-5 h-5 rounded-full bg-teal-100 text-teal-800 font-bold text-[11px] flex items-center justify-center shrink-0 mt-0.5">
                    {idx + 1}
                  </span>
                  <p className="leading-relaxed">{text}</p>
                </div>
              ))}
            </div>
          </div>

          <div className="mt-4 pt-3 border-t border-[#e2dacf] flex items-center justify-between text-xs text-slate-500">
            <span className="flex items-center gap-1">
              <ShieldCheck className="w-4 h-4 text-teal-700" />
              Self-guided suggestions derived from your daily check-in habits.
            </span>
          </div>
        </div>
      </div>

      {/* 5 Domain Line Charts Section */}
      <TrendCharts logs={logs} />

      {/* Modals */}
      {showCheckin && (
        <DailyCheckinModal
          userId={currentUser.id}
          existingLog={latestLog?.logDate === todayStr ? latestLog : undefined}
          onSave={handleSaveCheckin}
          onClose={() => setShowCheckin(false)}
        />
      )}

      {showScreening && (
        <WeeklyScreeningModal
          userId={currentUser.id}
          onSaveScreening={handleSaveScreening}
          onClose={() => setShowScreening(false)}
          onBookAppointment={() => onNavigateTab('booking')}
          onOpenHelp={onOpenHelp}
        />
      )}
    </div>
  );
};
