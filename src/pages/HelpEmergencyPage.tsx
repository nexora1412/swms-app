import React from 'react';
import {
  PhoneCall,
  ShieldAlert,
  HeartHandshake,
  AlertOctagon,
  Building,
  Clock,
  ArrowLeft,
  LifeBuoy,
} from 'lucide-react';

interface HelpEmergencyPageProps {
  onBack: () => void;
}

export const HelpEmergencyPage: React.FC<HelpEmergencyPageProps> = ({ onBack }) => {
  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8 animate-fade-in">
      {/* Back button */}
      <div>
        <button
          onClick={onBack}
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-slate-800"
        >
          <ArrowLeft className="w-4 h-4" /> Return to previous view
        </button>
      </div>

      {/* Critical Emergency Banner */}
      <div className="bg-rose-50 border-2 border-rose-300 rounded-3xl p-6 sm:p-8 space-y-4 shadow-xs">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-rose-600 text-white flex items-center justify-center shrink-0">
            <AlertOctagon className="w-7 h-7" />
          </div>
          <div>
            <h1 className="text-xl sm:text-2xl font-black text-rose-950">
              Immediate Support & Emergency Resources (S15)
            </h1>
            <p className="text-xs sm:text-sm text-rose-800 font-medium">
              SWMS is not a crisis service. If you or someone you know is in acute danger or distress, contact emergency helplines immediately.
            </p>
          </div>
        </div>

        <div className="bg-white/90 rounded-2xl p-4 border border-rose-200 text-xs text-rose-900 leading-relaxed font-medium">
          If you are experiencing immediate thoughts of suicide, severe despair, or a medical emergency, please reach out to the 24/7 dedicated crisis lines below or visit the nearest emergency medical room.
        </div>
      </div>

      {/* Primary Helplines Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Tele-MANAS */}
        <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-xs space-y-3 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-[11px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-emerald-100 text-emerald-800 border border-emerald-200">
                Government of India 24/7
              </span>
              <Clock className="w-4 h-4 text-slate-400" />
            </div>
            <h3 className="text-lg font-bold text-slate-900">
              Tele-MANAS Mental Health Support
            </h3>
            <p className="text-xs text-slate-500 mt-1">
              National tele-mental health assistance program offering free, confidential psychological counselling across multiple regional languages.
            </p>
          </div>

          <div className="pt-3 border-t border-slate-100">
            <a
              href="tel:14416"
              className="w-full inline-flex items-center justify-center gap-2 py-3 bg-teal-700 hover:bg-teal-800 text-white rounded-xl font-bold text-sm shadow-xs transition-colors"
            >
              <PhoneCall className="w-4 h-4" /> Dial 14416 / 1800 891 4416
            </a>
          </div>
        </div>

        {/* NMIMS Campus Counselling & Clinic */}
        <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-xs space-y-3 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-[11px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-indigo-100 text-indigo-800 border border-indigo-200">
                Campus Clinic & Student Welfare
              </span>
              <Building className="w-4 h-4 text-slate-400" />
            </div>
            <h3 className="text-lg font-bold text-slate-900">
              NMIMS Shirpur Health Centre
            </h3>
            <p className="text-xs text-slate-500 mt-1">
              On-campus general physician and student wellness counsellors located at the Student Health Wing (Ground Floor).
            </p>
          </div>

          <div className="pt-3 border-t border-slate-100">
            <a
              href="tel:02563286545"
              className="w-full inline-flex items-center justify-center gap-2 py-3 bg-indigo-700 hover:bg-indigo-800 text-white rounded-xl font-bold text-sm shadow-xs transition-colors"
            >
              <PhoneCall className="w-4 h-4" /> Call Clinic: (02563) 286545
            </a>
          </div>
        </div>

        {/* Vandrevala Foundation */}
        <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-xs space-y-3 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-[11px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-purple-100 text-purple-800 border border-purple-200">
                Non-Profit Helpline
              </span>
              <HeartHandshake className="w-4 h-4 text-slate-400" />
            </div>
            <h3 className="text-lg font-bold text-slate-900">
              Vandrevala Foundation Helpline
            </h3>
            <p className="text-xs text-slate-500 mt-1">
              24/7 mental health crisis support offering immediate telephonic and WhatsApp emotional support.
            </p>
          </div>

          <div className="pt-3 border-t border-slate-100">
            <a
              href="tel:9999666555"
              className="w-full inline-flex items-center justify-center gap-2 py-3 bg-slate-800 hover:bg-slate-900 text-white rounded-xl font-bold text-sm shadow-xs transition-colors"
            >
              <PhoneCall className="w-4 h-4" /> Dial +91 9999 666 555
            </a>
          </div>
        </div>

        {/* National Emergency Services */}
        <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-xs space-y-3 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-[11px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-rose-100 text-rose-800 border border-rose-200">
                National SOS / Ambulance
              </span>
              <ShieldAlert className="w-4 h-4 text-slate-400" />
            </div>
            <h3 className="text-lg font-bold text-slate-900">
              National Emergency Services
            </h3>
            <p className="text-xs text-slate-500 mt-1">
              For police, ambulance, and disaster rescue response across India.
            </p>
          </div>

          <div className="pt-3 border-t border-slate-100">
            <a
              href="tel:112"
              className="w-full inline-flex items-center justify-center gap-2 py-3 bg-rose-700 hover:bg-rose-800 text-white rounded-xl font-bold text-sm shadow-xs transition-colors"
            >
              <PhoneCall className="w-4 h-4" /> Dial 112 (Universal SOS) / 108
            </a>
          </div>
        </div>
      </div>

      {/* SWMS Role & Scope Clarification */}
      <div className="bg-[#fbf9f5] border border-[#e7e2d7] rounded-3xl p-6 space-y-3 text-xs text-slate-700">
        <h4 className="font-bold text-sm text-slate-900 flex items-center gap-2">
          <LifeBuoy className="w-4 h-4 text-teal-700" /> Purpose and Boundaries of SWMS
        </h4>
        <p className="leading-relaxed">
          The Student Wellness Management System (SWMS) is an academic project designed to empower students through habit logging, multi-domain wellness trends, standardized screening (PHQ/GAD), and confidential appointment scheduling.
        </p>
        <p className="leading-relaxed font-semibold text-slate-800">
          SWMS does not provide medical diagnoses, clinical prescriptions, or psychiatric evaluations. Always consult licensed health professionals regarding any clinical condition.
        </p>
      </div>
    </div>
  );
};
