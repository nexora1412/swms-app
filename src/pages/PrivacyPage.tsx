import React, { useState } from 'react';
import { User, Consent } from '../types/swms';
import { StorageService } from '../services/storageService';
import {
  ShieldCheck,
  Lock,
  Download,
  Trash2,
  Check,
  AlertTriangle,
  FileText,
  UserCheck,
} from 'lucide-react';

interface PrivacyPageProps {
  currentUser: User;
  onDataDeleted: () => void;
}

export const PrivacyPage: React.FC<PrivacyPageProps> = ({
  currentUser,
  onDataDeleted,
}) => {
  const storage = StorageService.getInstance();
  const [consent, setConsent] = useState<Consent>(storage.getUserConsent(currentUser.id));
  const [saveSuccess, setSaveSuccess] = useState<boolean>(false);

  const handleToggleProvider = (val: boolean) => {
    const updated = storage.updateConsent(currentUser.id, val, consent.mlUse);
    setConsent(updated);
    flashSuccess();
  };

  const handleToggleML = (val: boolean) => {
    const updated = storage.updateConsent(currentUser.id, consent.shareWithProvider, val);
    setConsent(updated);
    flashSuccess();
  };

  const flashSuccess = () => {
    setSaveSuccess(true);
    setTimeout(() => setSaveSuccess(false), 2500);
  };

  const handleDownloadData = () => {
    const jsonString = storage.exportUserData(currentUser.id);
    const blob = new Blob([jsonString], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `swms_wellness_data_${currentUser.id}.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleDeleteData = () => {
    if (
      window.confirm(
        'Are you absolutely sure you want to delete all your wellness data? This will purge all your daily check-ins, screenings, alerts, and appointment histories permanently.'
      )
    ) {
      storage.deleteUserData(currentUser.id);
      alert('All your personal wellness data has been deleted.');
      onDataDeleted();
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8 animate-fade-in">
      {/* Header */}
      <div className="border-b border-[#e7e2d7] pb-4">
        <span className="text-xs font-semibold text-teal-700 tracking-wide uppercase">
          Privacy & Autonomy (S9)
        </span>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
          Privacy Settings & Data Rights
        </h1>
        <p className="text-xs sm:text-sm text-slate-500 mt-1">
          Full control over how your information is accessed, shared, exported, or deleted.
        </p>
      </div>

      {saveSuccess && (
        <div className="bg-emerald-50 border border-emerald-300 text-emerald-900 rounded-xl p-3.5 text-xs font-semibold flex items-center gap-2">
          <Check className="w-4 h-4 text-emerald-700" />
          Consent preferences updated and timestamped successfully.
        </div>
      )}

      {/* Consent Toggles Card */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-xs space-y-6">
        <div>
          <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
            <Lock className="w-5 h-5 text-teal-700" /> Privacy Toggles (Off by Default)
          </h2>
          <p className="text-xs text-slate-500 mt-1">
            Privacy-by-Design ensures nothing is shared without your explicit consent. You can modify these settings anytime.
          </p>
        </div>

        <div className="space-y-4 pt-2">
          {/* Toggle 1: Provider Sharing */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between p-4 rounded-2xl border border-slate-200 bg-[#fbf9f5] gap-4">
            <div className="space-y-1 max-w-lg">
              <span className="font-bold text-slate-900 text-sm">
                Share my wellness summary with my healthcare provider
              </span>
              <p className="text-xs text-slate-600 leading-relaxed">
                When enabled, campus doctors and counsellors can review your 30-day trends, screening scores, and burnout factors during consultations. If disabled, providers see only: <em>"This student has not shared their data."</em>
              </p>
            </div>
            <button
              onClick={() => handleToggleProvider(!consent.shareWithProvider)}
              className={`w-14 h-8 rounded-full transition-colors relative flex items-center px-1 self-start sm:self-center shrink-0 ${
                consent.shareWithProvider ? 'bg-teal-700' : 'bg-slate-300'
              }`}
            >
              <div
                className={`w-6 h-6 rounded-full bg-white shadow-md transform transition-transform ${
                  consent.shareWithProvider ? 'translate-x-6' : 'translate-x-0'
                }`}
              />
            </button>
          </div>

          {/* Toggle 2: ML Model Use */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between p-4 rounded-2xl border border-slate-200 bg-[#fbf9f5] gap-4">
            <div className="space-y-1 max-w-lg">
              <span className="font-bold text-slate-900 text-sm">
                Allow my data to be used to improve the burnout model
              </span>
              <p className="text-xs text-slate-600 leading-relaxed">
                Allows de-identified aggregate patterns to calibrate the campus burnout prediction model. No personally identifiable details are included.
              </p>
            </div>
            <button
              onClick={() => handleToggleML(!consent.mlUse)}
              className={`w-14 h-8 rounded-full transition-colors relative flex items-center px-1 self-start sm:self-center shrink-0 ${
                consent.mlUse ? 'bg-teal-700' : 'bg-slate-300'
              }`}
            >
              <div
                className={`w-6 h-6 rounded-full bg-white shadow-md transform transition-transform ${
                  consent.mlUse ? 'translate-x-6' : 'translate-x-0'
                }`}
              />
            </button>
          </div>
        </div>

        <div className="pt-2 text-xs text-slate-500 flex items-center justify-between">
          <span>Consent Record ID: {consent.id}</span>
          <span>Last Updated: {new Date(consent.updatedAt ?? consent.givenAt).toLocaleString()}</span>
        </div>
      </div>

      {/* Data Subject Rights (GDPR/DPDP) */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Export Data */}
        <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-xs space-y-4 flex flex-col justify-between">
          <div>
            <div className="flex items-center gap-2 text-teal-800 font-bold text-base">
              <Download className="w-5 h-5" /> Download My Data
            </div>
            <p className="text-xs text-slate-600 mt-2 leading-relaxed">
              Export a complete machine-readable JSON archive of all your daily logs, screenings, appointments, and active consent records.
            </p>
          </div>
          <button
            onClick={handleDownloadData}
            className="w-full inline-flex items-center justify-center gap-2 py-2.5 px-4 bg-teal-50 hover:bg-teal-100 text-teal-900 border border-teal-200 rounded-xl text-xs font-bold transition-colors"
          >
            <Download className="w-4 h-4" /> Export Complete Archive (JSON)
          </button>
        </div>

        {/* Delete Data */}
        <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-xs space-y-4 flex flex-col justify-between">
          <div>
            <div className="flex items-center gap-2 text-rose-700 font-bold text-base">
              <Trash2 className="w-5 h-5" /> Delete My Data
            </div>
            <p className="text-xs text-slate-600 mt-2 leading-relaxed">
              Permanently erase all your check-ins, screening history, and scheduled bookings. This operation cannot be undone.
            </p>
          </div>
          <button
            onClick={handleDeleteData}
            className="w-full inline-flex items-center justify-center gap-2 py-2.5 px-4 bg-rose-50 hover:bg-rose-100 text-rose-800 border border-rose-200 rounded-xl text-xs font-bold transition-colors"
          >
            <Trash2 className="w-4 h-4" /> Permanently Delete My Data
          </button>
        </div>
      </div>
    </div>
  );
};
