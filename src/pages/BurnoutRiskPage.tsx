import React, { useState } from 'react';
import { User } from '../types/swms';
import { StorageService } from '../services/storageService';
import { calculateBurnoutRisk } from '../services/scoringEngine';
import {
  Flame,
  ShieldCheck,
  AlertTriangle,
  Heart,
  TrendingDown,
  Info,
  Calendar,
  Sparkles,
} from 'lucide-react';

interface BurnoutRiskPageProps {
  currentUser: User;
  onNavigateTab: (tab: string) => void;
}

export const BurnoutRiskPage: React.FC<BurnoutRiskPageProps> = ({
  currentUser,
  onNavigateTab,
}) => {
  const storage = StorageService.getInstance();
  const [examWeek, setExamWeek] = useState<boolean>(false);

  const logs = storage.getUserLogs(currentUser.id);
  const riskResult = calculateBurnoutRisk(logs, examWeek);

  const getRiskBadge = (level: string) => {
    switch (level) {
      case 'High':
        return {
          label: 'Elevated Risk',
          color: 'bg-rose-100 text-rose-800 border-rose-300',
          icon: <AlertTriangle className="w-5 h-5 text-rose-600" />,
          summary: 'High study load or accumulated fatigue signals detected. Proactive pacing is advised.',
        };
      case 'Moderate':
        return {
          label: 'Moderate Risk',
          color: 'bg-amber-100 text-amber-800 border-amber-300',
          icon: <Flame className="w-5 h-5 text-amber-600" />,
          summary: 'Some strain in rest or recovery routines. Taking micro-breaks will protect your stamina.',
        };
      default:
        return {
          label: 'Low Risk',
          color: 'bg-emerald-100 text-emerald-800 border-emerald-300',
          icon: <ShieldCheck className="w-5 h-5 text-emerald-600" />,
          summary: 'Your rest, daily movement, and energy levels demonstrate sustainable balance.',
        };
    }
  };

  const badgeInfo = getRiskBadge(riskResult.riskLevel);

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8 animate-fade-in">
      {/* Header */}
      <div className="border-b border-[#e7e2d7] pb-4">
        <span className="text-xs font-semibold text-teal-700 tracking-wide uppercase">
          Preventive Insights (S8)
        </span>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
          Burnout & Academic Fatigue Assessment
        </h1>
        <p className="text-xs sm:text-sm text-slate-500 mt-1">
          Predictive estimation based on multi-day lifestyle rhythms and academic periods.
        </p>
      </div>

      {/* Main Risk Status Card */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-sm space-y-6">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-teal-50 border border-teal-200 flex items-center justify-center">
              {badgeInfo.icon}
            </div>
            <div>
              <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                Current Estimated Status
              </span>
              <h2 className="text-xl sm:text-2xl font-black text-slate-900">
                {badgeInfo.label}
              </h2>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <span
              className={`px-3 py-1 rounded-full text-xs font-black uppercase tracking-wider border ${badgeInfo.color}`}
            >
              Risk Level: {riskResult.riskLevel}
            </span>
            <span className="text-xs font-mono text-slate-500 bg-slate-100 px-2 py-1 rounded">
              Confidence: {Math.round(riskResult.probability * 100)}%
            </span>
          </div>
        </div>

        <p className="text-slate-700 text-sm leading-relaxed bg-[#fbf9f5] p-4 rounded-xl border border-[#e7e2d7]">
          {badgeInfo.summary}
        </p>

        {/* Top 3 Plain-Language Contributing Factors */}
        <div className="space-y-3">
          <h3 className="text-xs font-extrabold text-slate-500 uppercase tracking-wider flex items-center gap-1.5">
            <TrendingDown className="w-4 h-4 text-teal-700" /> Top 3 Influencing Factors
          </h3>

          <div className="space-y-2.5">
            {riskResult.topFactors.map((factor, index) => (
              <div
                key={index}
                className="flex items-start gap-3 p-3.5 bg-white border border-slate-200 rounded-xl shadow-2xs text-xs sm:text-sm text-slate-800"
              >
                <span className="w-6 h-6 rounded-lg bg-teal-100 text-teal-800 font-bold text-xs flex items-center justify-center shrink-0 mt-0.5">
                  #{index + 1}
                </span>
                <span className="leading-snug">{factor}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Exam Period Simulation Toggle */}
        <div className="pt-4 border-t border-slate-100 flex items-center justify-between text-xs">
          <div className="flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-amber-600" />
            <span className="font-semibold text-slate-700">Simulate Mid-Term Exam Week (+1 risk pt):</span>
          </div>
          <button
            onClick={() => setExamWeek(!examWeek)}
            className={`px-3 py-1 rounded-lg text-xs font-bold transition-all ${
              examWeek
                ? 'bg-amber-600 text-white shadow-xs'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            {examWeek ? 'Exam Period Active' : 'Off (Regular Week)'}
          </button>
        </div>
      </div>

      {/* Suggested Proactive Actions */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="bg-[#fbf9f5] border border-[#e7e2d7] rounded-2xl p-5 space-y-3">
          <div className="flex items-center gap-2 text-teal-800 font-bold text-sm">
            <Heart className="w-4 h-4" /> Recommended Self-Care
          </div>
          <ul className="text-xs text-slate-700 space-y-2 list-disc list-inside">
            <li>Plan a fixed bedtime with phone off 30 minutes before sleep.</li>
            <li>Take 5-minute movement pauses every 45 minutes of desk study.</li>
            <li>Stay hydrated and aim for at least two complete nutritious meals.</li>
          </ul>
        </div>

        <div className="bg-white border border-slate-200 rounded-2xl p-5 space-y-3 flex flex-col justify-between">
          <div>
            <div className="flex items-center gap-2 text-slate-900 font-bold text-sm">
              <Calendar className="w-4 h-4 text-teal-600" /> Need Guidance?
            </div>
            <p className="text-xs text-slate-600 mt-1">
              Discussing academic pacing with our counsellors can give you tailored strategies without judgment.
            </p>
          </div>
          <button
            onClick={() => onNavigateTab('booking')}
            className="w-full py-2 bg-teal-700 hover:bg-teal-800 text-white font-bold text-xs rounded-xl shadow-xs transition-colors"
          >
            Schedule a Confidential Chat
          </button>
        </div>
      </div>

      {/* Mandatory Disclaimer Box */}
      <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4 flex items-start gap-3 text-slate-600 text-xs">
        <Info className="w-4 h-4 text-slate-400 shrink-0 mt-0.5" />
        <p>
          <strong>Notice:</strong> This is an estimate to support you, not a diagnosis. Rhythms and stress signals are calculated using simulated machine learning stand-in weights to promote preventive wellness and habit reflection.
        </p>
      </div>
    </div>
  );
};
