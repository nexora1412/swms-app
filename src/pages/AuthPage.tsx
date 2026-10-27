import React, { useState } from 'react';
import { User } from '../types/swms';
import { StorageService } from '../services/storageService';
import { HeartPulse, UserPlus, LogIn } from 'lucide-react';

interface AuthPageProps {
  onLoginSuccess: (user: User) => void;
  onOpenHelp: () => void;
}

export const AuthPage: React.FC<AuthPageProps> = ({ onLoginSuccess, onOpenHelp }) => {
  const storage = StorageService.getInstance();
  const [isRegister, setIsRegister] = useState<boolean>(false);

  // Login form state
  const [email, setEmail] = useState<string>('student.a@demo.edu');
  const [password, setPassword] = useState<string>('demo123');
  const [loginError, setLoginError] = useState<string | null>(null);

  // Register form state
  const [regName, setRegName] = useState<string>('');
  const [regEmail, setRegEmail] = useState<string>('');
  const [regPassword, setRegPassword] = useState<string>('demo123');
  const [shareConsent, setShareConsent] = useState<boolean>(false); // default off per Privacy-by-Design
  const [mlConsent, setMlConsent] = useState<boolean>(false);       // default off per Privacy-by-Design
  const [regError, setRegError] = useState<string | null>(null);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setLoginError(null);
    const users = storage.getUsers();
    const user = users.find((u) => u.email.toLowerCase() === email.toLowerCase());

    if (!user) {
      setLoginError('No account found with this email. Check demo accounts below or register.');
      return;
    }
    if (!user.isActive) {
      setLoginError('This account has been deactivated by the administrator.');
      return;
    }

    storage.setCurrentUser(user);
    onLoginSuccess(user);
  };

  const handleRegister = (e: React.FormEvent) => {
    e.preventDefault();
    setRegError(null);
    if (!regName.trim() || !regEmail.trim()) {
      setRegError('Please provide both your full name and student email.');
      return;
    }

    try {
      const newUser = storage.registerStudent(
        regName.trim(),
        regEmail.trim(),
        shareConsent,
        mlConsent
      );
      onLoginSuccess(newUser);
    } catch (err: any) {
      setRegError(err.message || 'Failed to register account.');
    }
  };

  const quickLogin = (userEmail: string) => {
    setEmail(userEmail);
    setPassword('demo123');
    const user = storage.getUsers().find((u) => u.email.toLowerCase() === userEmail.toLowerCase());
    if (user) {
      storage.setCurrentUser(user);
      onLoginSuccess(user);
    }
  };

  return (
    <div className="min-h-screen bg-[#fbf9f5] flex flex-col justify-between p-4 sm:p-6 animate-fade-in">
      <div className="max-w-md w-full mx-auto my-auto pt-6 pb-12 space-y-8">
        {/* Brand Header */}
        <div className="text-center space-y-2">
          <div className="w-14 h-14 rounded-2xl bg-teal-700 text-white flex items-center justify-center mx-auto shadow-sm">
            <HeartPulse className="w-8 h-8" />
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
            SWMS Portal
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 max-w-xs mx-auto">
            Student Wellness Management System • NMIMS Shirpur
          </p>
        </div>

        {/* Auth Card */}
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-sm space-y-6">
          <div className="flex border-b border-slate-200 text-sm font-semibold">
            <button
              onClick={() => setIsRegister(false)}
              className={`flex-1 pb-3 text-center border-b-2 transition-all ${
                !isRegister
                  ? 'border-teal-700 text-teal-800'
                  : 'border-transparent text-slate-400 hover:text-slate-700'
              }`}
            >
              Sign In (S1)
            </button>
            <button
              onClick={() => setIsRegister(true)}
              className={`flex-1 pb-3 text-center border-b-2 transition-all ${
                isRegister
                  ? 'border-teal-700 text-teal-800'
                  : 'border-transparent text-slate-400 hover:text-slate-700'
              }`}
            >
              Register + Consent (S2)
            </button>
          </div>

          {!isRegister ? (
            /* S1: Login Form */
            <form onSubmit={handleLogin} className="space-y-4">
              {loginError && (
                <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs">
                  {loginError}
                </div>
              )}

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Email Address
                </label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="student.a@demo.edu"
                  className="w-full p-3 text-sm border border-slate-300 rounded-xl bg-[#fbf9f5] focus:outline-none focus:ring-2 focus:ring-teal-700"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Password (demo123)
                </label>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full p-3 text-sm border border-slate-300 rounded-xl bg-[#fbf9f5] focus:outline-none focus:ring-2 focus:ring-teal-700"
                  required
                />
              </div>

              <button
                type="submit"
                className="w-full py-3 bg-teal-700 hover:bg-teal-800 text-white rounded-xl font-bold text-sm shadow-xs transition-colors flex items-center justify-center gap-2"
              >
                <LogIn className="w-4 h-4" /> Sign In to SWMS
              </button>

              {/* Demo Account Fast-Fill Buttons */}
              <div className="pt-4 border-t border-slate-100 space-y-2">
                <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
                  One-Click Demo Personas:
                </span>
                <div className="grid grid-cols-2 gap-2 text-xs">
                  <button
                    type="button"
                    onClick={() => quickLogin('student.a@demo.edu')}
                    className="p-2 bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-lg text-left"
                  >
                    <div className="font-bold text-slate-800">Student A</div>
                    <div className="text-[10px] text-amber-700 font-medium">Tier 2 Alert State</div>
                  </button>
                  <button
                    type="button"
                    onClick={() => quickLogin('student.b@demo.edu')}
                    className="p-2 bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-lg text-left"
                  >
                    <div className="font-bold text-slate-800">Student B</div>
                    <div className="text-[10px] text-emerald-700 font-medium">Healthy & Consented</div>
                  </button>
                  <button
                    type="button"
                    onClick={() => quickLogin('student.c@demo.edu')}
                    className="p-2 bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-lg text-left"
                  >
                    <div className="font-bold text-slate-800">Student C</div>
                    <div className="text-[10px] text-rose-700 font-medium">High Risk (PHQ: 14)</div>
                  </button>
                  <button
                    type="button"
                    onClick={() => quickLogin('gp@demo.edu')}
                    className="p-2 bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-lg text-left"
                  >
                    <div className="font-bold text-slate-800">Dr. Kulkarni (GP)</div>
                    <div className="text-[10px] text-indigo-700 font-medium">Provider Portal</div>
                  </button>
                  <button
                    type="button"
                    onClick={() => quickLogin('counsellor@demo.edu')}
                    className="p-2 bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-lg text-left"
                  >
                    <div className="font-bold text-slate-800">Dr. Sen (Counsellor)</div>
                    <div className="text-[10px] text-indigo-700 font-medium">Provider Portal</div>
                  </button>
                  <button
                    type="button"
                    onClick={() => quickLogin('admin@demo.edu')}
                    className="p-2 bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-lg text-left"
                  >
                    <div className="font-bold text-slate-800">Admin (Supervisor)</div>
                    <div className="text-[10px] text-purple-700 font-medium">Analytics & Escalate</div>
                  </button>
                </div>
              </div>
            </form>
          ) : (
            /* S2: Register + Dual Consent Form */
            <form onSubmit={handleRegister} className="space-y-4">
              {regError && (
                <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs">
                  {regError}
                </div>
              )}

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Full Student Name
                </label>
                <input
                  type="text"
                  value={regName}
                  onChange={(e) => setRegName(e.target.value)}
                  placeholder="e.g. Saloni Patil"
                  className="w-full p-3 text-sm border border-slate-300 rounded-xl bg-[#fbf9f5] focus:outline-none focus:ring-2 focus:ring-teal-700"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Campus Email Address
                </label>
                <input
                  type="email"
                  value={regEmail}
                  onChange={(e) => setRegEmail(e.target.value)}
                  placeholder="newstudent@demo.edu"
                  className="w-full p-3 text-sm border border-slate-300 rounded-xl bg-[#fbf9f5] focus:outline-none focus:ring-2 focus:ring-teal-700"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Password
                </label>
                <input
                  type="password"
                  value={regPassword}
                  onChange={(e) => setRegPassword(e.target.value)}
                  className="w-full p-3 text-sm border border-slate-300 rounded-xl bg-[#fbf9f5] focus:outline-none focus:ring-2 focus:ring-teal-700"
                  required
                />
              </div>

              {/* S2 Consent Toggles (Section 5.1: Dual toggles, off by default) */}
              <div className="bg-[#fbf9f5] border border-[#e7e2d7] rounded-2xl p-4 space-y-3">
                <span className="text-xs font-bold text-slate-800 uppercase tracking-wider block">
                  Privacy-by-Design Consent
                </span>

                <div className="flex items-start justify-between gap-3 text-xs">
                  <div>
                    <span className="font-semibold text-slate-800">
                      Share wellness summary with provider
                    </span>
                    <p className="text-[11px] text-slate-500 mt-0.5">
                      Permits campus physicians or counsellors to view your trends when you book.
                    </p>
                  </div>
                  <input
                    type="checkbox"
                    checked={shareConsent}
                    onChange={(e) => setShareConsent(e.target.checked)}
                    className="w-5 h-5 accent-teal-700 mt-0.5 cursor-pointer shrink-0"
                  />
                </div>

                <div className="flex items-start justify-between gap-3 text-xs border-t border-[#e2dacf] pt-2">
                  <div>
                    <span className="font-semibold text-slate-800">
                      Allow data to improve burnout model
                    </span>
                    <p className="text-[11px] text-slate-500 mt-0.5">
                      Contributes de-identified signals to fine-tune predictive models.
                    </p>
                  </div>
                  <input
                    type="checkbox"
                    checked={mlConsent}
                    onChange={(e) => setMlConsent(e.target.checked)}
                    className="w-5 h-5 accent-teal-700 mt-0.5 cursor-pointer shrink-0"
                  />
                </div>

                <div className="text-[10px] text-slate-400 pt-1">
                  Both consent choices are OFF by default. You can change your consent anytime in Privacy Settings.
                </div>
              </div>

              <button
                type="submit"
                className="w-full py-3 bg-teal-700 hover:bg-teal-800 text-white rounded-xl font-bold text-sm shadow-xs transition-colors flex items-center justify-center gap-2"
              >
                <UserPlus className="w-4 h-4" /> Create Student Account
              </button>
            </form>
          )}

          <div className="pt-2 text-center">
            <button
              onClick={onOpenHelp}
              className="text-xs text-rose-700 hover:text-rose-900 font-semibold underline underline-offset-2"
            >
              Need immediate mental health crisis assistance? View emergency contacts (S15)
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
