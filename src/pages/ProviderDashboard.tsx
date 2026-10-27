import React, { useState } from 'react';
import { User, Appointment, Alert, ProviderSlot, ClinicalNote, DailyLog } from '../types/swms';
import { StorageService } from '../services/storageService';
import { TrendCharts } from '../components/student/TrendCharts';
import {
  Calendar,
  Clock,
  User as UserIcon,
  AlertTriangle,
  Lock,
  Plus,
  Trash2,
  FileText,
  CheckCircle2,
  Shield,
  Stethoscope,
  Send,
  Eye,
  AlertCircle,
} from 'lucide-react';

interface ProviderDashboardProps {
  currentUser: User;
  activeSubTab?: 'dashboard' | 'availability' | 'students';
}

export const ProviderDashboard: React.FC<ProviderDashboardProps> = ({
  currentUser,
  activeSubTab = 'dashboard',
}) => {
  const storage = StorageService.getInstance();

  const [tab, setTab] = useState<'dashboard' | 'availability' | 'students'>(activeSubTab);
  const [appointments, setAppointments] = useState<Appointment[]>(
    storage.getProviderAppointments(currentUser.id)
  );
  const [slots, setSlots] = useState<ProviderSlot[]>(
    storage.getSlots().filter((s) => s.providerId === currentUser.id)
  );
  const [alerts, setAlerts] = useState<Alert[]>(
    storage.getAlerts().filter((a) => a.tier === 3)
  );

  // Selected student for S12 summary
  const allUsers = storage.getUsers();
  const studentUsers = allUsers.filter((u) => u.role === 'student');
  const [selectedStudentId, setSelectedStudentId] = useState<string>(studentUsers[1]?.id ?? 'usr-student-b'); // Student B default (consented)

  // Clinical note state
  const [newNoteText, setNewNoteText] = useState<string>('');
  const [savedNotes, setSavedNotes] = useState<ClinicalNote[]>(
    storage.getNotesForStudent(selectedStudentId)
  );
  const [noteSuccess, setNoteSuccess] = useState<boolean>(false);

  // New slot form state
  const [newSlotDate, setNewSlotDate] = useState<string>(
    new Date().toISOString().split('T')[0]
  );
  const [newSlotTime, setNewSlotTime] = useState<string>('11:00');

  const selectedStudent = allUsers.find((u) => u.id === selectedStudentId);
  const studentConsent = storage.getUserConsent(selectedStudentId);
  const studentLogs = storage.getUserLogs(selectedStudentId);
  const studentScreenings = storage.getUserScreenings(selectedStudentId);
  const latestScreening = studentScreenings[studentScreenings.length - 1];

  const handleStudentSelect = (id: string) => {
    setSelectedStudentId(id);
    setSavedNotes(storage.getNotesForStudent(id));
    setNewNoteText('');
  };

  const handleSaveNote = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newNoteText.trim()) return;

    const apt = appointments.find((a) => a.studentId === selectedStudentId);
    const aptId = apt ? apt.id : 'walk-in-consult';

    storage.saveClinicalNote(
      aptId,
      selectedStudentId,
      currentUser.id,
      currentUser.name,
      newNoteText.trim()
    );

    setSavedNotes(storage.getNotesForStudent(selectedStudentId));
    setNewNoteText('');
    setNoteSuccess(true);
    setTimeout(() => setNoteSuccess(false), 2500);
  };

  const handleAddSlot = (e: React.FormEvent) => {
    e.preventDefault();
    const [hh, mm] = newSlotTime.split(':');
    const endMinutes = parseInt(mm) + 30;
    const endH = endMinutes >= 60 ? parseInt(hh) + 1 : parseInt(hh);
    const endM = endMinutes >= 60 ? '00' : `${endMinutes}`;

    const startISO = `${newSlotDate}T${hh}:${mm}:00`;
    const endISO = `${newSlotDate}T${endH < 10 ? '0' + endH : endH}:${endM}:00`;

    storage.addProviderSlot(
      currentUser.id,
      currentUser.name,
      currentUser.providerType ?? 'GP',
      startISO,
      endISO
    );

    setSlots(storage.getSlots().filter((s) => s.providerId === currentUser.id));
  };

  const handleDeleteSlot = (slotId: string) => {
    storage.deleteProviderSlot(slotId);
    setSlots(storage.getSlots().filter((s) => s.providerId === currentUser.id));
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8 animate-fade-in">
      {/* Provider Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-[#e7e2d7] pb-4">
        <div>
          <span className="text-xs font-semibold text-indigo-700 tracking-wide uppercase">
            Provider Clinical Portal (S10, S11, S12)
          </span>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
            {currentUser.name}
          </h1>
          <p className="text-xs sm:text-sm text-slate-500">
            Specialty: {currentUser.providerType === 'GP' ? 'General Physician' : 'Mental Health Counsellor'} • Campus Health Service
          </p>
        </div>

        {/* Sub-tab switcher */}
        <div className="inline-flex rounded-xl bg-slate-100 p-1 border border-slate-200 text-xs font-semibold">
          <button
            onClick={() => setTab('dashboard')}
            className={`px-3 py-1.5 rounded-lg transition-all ${
              tab === 'dashboard' ? 'bg-white text-indigo-900 shadow-xs' : 'text-slate-600'
            }`}
          >
            S10: Schedule & Alerts
          </button>
          <button
            onClick={() => setTab('availability')}
            className={`px-3 py-1.5 rounded-lg transition-all ${
              tab === 'availability' ? 'bg-white text-indigo-900 shadow-xs' : 'text-slate-600'
            }`}
          >
            S11: Availability Manager
          </button>
          <button
            onClick={() => setTab('students')}
            className={`px-3 py-1.5 rounded-lg transition-all ${
              tab === 'students' ? 'bg-white text-indigo-900 shadow-xs' : 'text-slate-600'
            }`}
          >
            S12: Student Summaries & Notes
          </button>
        </div>
      </div>

      {/* S10: Schedule & Tier 3 Alerts */}
      {tab === 'dashboard' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Today's Appointments */}
          <div className="lg:col-span-2 space-y-4">
            <h2 className="text-lg font-bold text-slate-800 flex items-center gap-2">
              <Calendar className="w-5 h-5 text-indigo-600" /> Consultations Schedule
            </h2>

            {appointments.length === 0 ? (
              <div className="bg-white p-8 rounded-2xl border border-slate-200 text-center text-slate-500 text-sm">
                No consultations currently scheduled. Manage slots in the Availability Manager to open consultation hours.
              </div>
            ) : (
              <div className="space-y-3">
                {appointments.map((apt) => {
                  const sDate = new Date(apt.slotStart);
                  const isToday = sDate.toDateString() === new Date().toDateString();

                  return (
                    <div
                      key={apt.id}
                      className="bg-white rounded-2xl border border-slate-200 p-4 shadow-xs flex flex-col sm:flex-row justify-between sm:items-center gap-3"
                    >
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-slate-900 text-sm sm:text-base">
                            {apt.studentName}
                          </span>
                          {isToday && (
                            <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-teal-100 text-teal-800 border border-teal-200 uppercase">
                              Today
                            </span>
                          )}
                          <span className="text-xs text-slate-400">({apt.status})</span>
                        </div>
                        <div className="text-xs text-slate-500 flex items-center gap-2">
                          <Clock className="w-3.5 h-3.5 text-slate-400" />
                          <span>
                            {sDate.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })} at{' '}
                            {sDate.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}
                          </span>
                        </div>
                      </div>

                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => {
                            setSelectedStudentId(apt.studentId);
                            setTab('students');
                          }}
                          className="px-3 py-1.5 bg-indigo-50 hover:bg-indigo-100 text-indigo-800 border border-indigo-200 rounded-lg text-xs font-bold transition-colors inline-flex items-center gap-1"
                        >
                          <Eye className="w-3.5 h-3.5" /> View Health Summary
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Tier 3 Alerts Panel */}
          <div className="space-y-4">
            <h2 className="text-lg font-bold text-slate-800 flex items-center gap-2">
              <AlertTriangle className="w-5 h-5 text-rose-600" /> Tier 3 Priority Alerts
            </h2>

            {alerts.length === 0 ? (
              <div className="bg-white p-6 rounded-2xl border border-slate-200 text-slate-500 text-xs">
                No active Tier 3 alerts for consented students.
              </div>
            ) : (
              <div className="space-y-3">
                {alerts.map((alert) => (
                  <div
                    key={alert.id}
                    className="bg-rose-50 border border-rose-200 rounded-2xl p-4 text-xs space-y-2 text-rose-950 shadow-2xs"
                  >
                    <div className="flex items-center justify-between font-bold">
                      <span className="text-rose-900">{alert.studentName}</span>
                      <span className="px-2 py-0.5 rounded bg-rose-200 text-rose-900 text-[10px] uppercase font-mono">
                        Tier 3 High Risk
                      </span>
                    </div>
                    <p className="text-rose-800 leading-snug">{alert.reason}</p>
                    <div className="flex justify-between items-center pt-2 border-t border-rose-200/60 text-[11px] text-rose-700">
                      <span>Unbooked: {alert.hoursUnbooked ?? 0} hrs</span>
                      <button
                        onClick={() => {
                          setSelectedStudentId(alert.userId);
                          setTab('students');
                        }}
                        className="font-bold underline"
                      >
                        Review Student Profile
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* S11: Availability Manager Grid */}
      {tab === 'availability' && (
        <div className="space-y-6">
          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-4">
            <h2 className="text-lg font-bold text-slate-800">
              Add New 30-Minute Consultation Slot
            </h2>
            <form onSubmit={handleAddSlot} className="flex flex-wrap items-end gap-3 text-xs">
              <div>
                <label className="block text-slate-600 font-semibold mb-1">Date:</label>
                <input
                  type="date"
                  value={newSlotDate}
                  onChange={(e) => setNewSlotDate(e.target.value)}
                  className="p-2 border border-slate-300 rounded-lg text-slate-800 bg-white"
                  required
                />
              </div>

              <div>
                <label className="block text-slate-600 font-semibold mb-1">Start Time (10:00–16:00):</label>
                <select
                  value={newSlotTime}
                  onChange={(e) => setNewSlotTime(e.target.value)}
                  className="p-2 border border-slate-300 rounded-lg text-slate-800 bg-white"
                >
                  <option value="10:00">10:00 AM</option>
                  <option value="10:30">10:30 AM</option>
                  <option value="11:00">11:00 AM</option>
                  <option value="11:30">11:30 AM</option>
                  <option value="13:30">01:30 PM</option>
                  <option value="14:00">02:00 PM</option>
                  <option value="14:30">02:30 PM</option>
                  <option value="15:00">03:00 PM</option>
                  <option value="15:30">03:30 PM</option>
                </select>
              </div>

              <button
                type="submit"
                className="px-4 py-2 bg-indigo-700 hover:bg-indigo-800 text-white font-bold rounded-lg shadow-xs inline-flex items-center gap-1.5"
              >
                <Plus className="w-4 h-4" /> Add Slot to Calendar
              </button>
            </form>
          </div>

          {/* Current Slots Grid */}
          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-4">
            <h3 className="font-bold text-slate-800 text-sm">
              Your Open & Booked Slots (Total: {slots.length})
            </h3>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3">
              {slots.map((s) => {
                const start = new Date(s.slotStart);
                const dStr = start.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
                const tStr = start.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });

                return (
                  <div
                    key={s.id}
                    className={`p-3 rounded-xl border text-xs relative ${
                      s.isBooked
                        ? 'bg-amber-50 border-amber-300 text-amber-900'
                        : 'bg-indigo-50/40 border-indigo-200 text-slate-800'
                    }`}
                  >
                    <div className="font-bold">{dStr}</div>
                    <div className="text-slate-600 font-mono mt-0.5">{tStr}</div>
                    <div className="mt-2 flex justify-between items-center text-[10px]">
                      <span className="font-semibold uppercase tracking-wider">
                        {s.isBooked ? 'Booked' : 'Free'}
                      </span>
                      {!s.isBooked && (
                        <button
                          onClick={() => handleDeleteSlot(s.id)}
                          className="text-rose-600 hover:text-rose-800 p-0.5"
                          title="Remove slot"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* S12: Consented Student Summary + Notes */}
      {tab === 'students' && (
        <div className="space-y-6">
          {/* Student Selector Bar */}
          <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <span className="text-xs font-semibold text-slate-700">Select Student to Inspect:</span>
              <div className="flex gap-2">
                {studentUsers.map((stu) => {
                  const isSel = stu.id === selectedStudentId;
                  const con = storage.getUserConsent(stu.id);

                  return (
                    <button
                      key={stu.id}
                      onClick={() => handleStudentSelect(stu.id)}
                      className={`px-3 py-1 rounded-lg text-xs font-bold transition-all ${
                        isSel
                          ? 'bg-indigo-700 text-white shadow-xs'
                          : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                      }`}
                    >
                      {stu.name.split(' ')[0]} {con.shareWithProvider ? '✓ Consented' : '✕ No Consent'}
                    </button>
                  );
                })}
              </div>
            </div>

            <span className="text-xs text-slate-500 font-medium">
              Privacy Guard: Enforced by patient authorization flag
            </span>
          </div>

          {/* Section 5.6 Consent Guard: If share_with_provider == false */}
          {!studentConsent.shareWithProvider ? (
            <div className="bg-slate-50 border-2 border-dashed border-slate-300 rounded-3xl p-12 text-center space-y-4">
              <div className="w-14 h-14 rounded-2xl bg-slate-200 text-slate-500 flex items-center justify-center mx-auto">
                <Lock className="w-7 h-7" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-slate-800">
                  This student has not shared their data.
                </h3>
                <p className="text-xs sm:text-sm text-slate-500 max-w-md mx-auto mt-1">
                  In strict compliance with the SWMS Privacy-by-Design specification, patient health trends, screening scores, and logs are inaccessible to healthcare providers without affirmative student consent.
                </p>
              </div>
            </div>
          ) : (
            /* Consented View: 30-day trends, screenings, risk, and clinical notes */
            <div className="space-y-6">
              <div className="bg-emerald-50 border border-emerald-300 p-4 rounded-2xl flex items-center justify-between text-xs text-emerald-950">
                <div className="flex items-center gap-2 font-bold">
                  <CheckCircle2 className="w-4 h-4 text-emerald-700" />
                  Consent Active: Authorized sharing for {selectedStudent?.name} ({selectedStudent?.department})
                </div>
                <span className="text-slate-500 text-[11px]">
                  Granted: {new Date(studentConsent.givenAt).toLocaleDateString()}
                </span>
              </div>

              {/* 30-Day Trend Charts for Consented Student */}
              <TrendCharts logs={studentLogs} />

              {/* Latest Screening & Risk Summary */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-2 text-xs">
                  <span className="font-bold text-slate-800 text-sm block">
                    Latest Standardized Screening
                  </span>
                  {latestScreening ? (
                    <div className="space-y-1.5 text-slate-700">
                      <div>
                        Date: <strong>{latestScreening.weekStart}</strong>
                      </div>
                      <div>
                        PHQ Score: <strong>{latestScreening.phq9 ?? latestScreening.phq2}</strong> (Depression Scale)
                      </div>
                      <div>
                        GAD Score: <strong>{latestScreening.gad7 ?? latestScreening.gad2}</strong> (Anxiety Scale)
                      </div>
                      <div>
                        Self-Harm Item: <strong>{latestScreening.phq9Item9SelfHarm ?? 0}</strong>
                      </div>
                    </div>
                  ) : (
                    <p className="text-slate-500">No screening recorded yet.</p>
                  )}
                </div>

                {/* Section 5.6: Encrypted Clinical Notes Box */}
                <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="font-bold text-slate-800 text-sm flex items-center gap-1.5">
                      <Lock className="w-4 h-4 text-indigo-700" /> Private Clinical Consultation Notes
                    </span>
                    <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-indigo-50 text-indigo-700 border border-indigo-200">
                      AES Encrypted at Rest
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-500">
                    Clinical notes are linked to appointments and never shown to the student view or admin.
                  </p>

                  <form onSubmit={handleSaveNote} className="space-y-2">
                    <textarea
                      value={newNoteText}
                      onChange={(e) => setNewNoteText(e.target.value)}
                      placeholder="Record clinical impressions, coping strategies discussed, or follow-up plans..."
                      rows={3}
                      className="w-full text-xs p-3 border border-slate-300 rounded-xl bg-[#fbf9f5] focus:outline-none focus:ring-2 focus:ring-indigo-600"
                    />
                    <div className="flex justify-between items-center">
                      {noteSuccess ? (
                        <span className="text-xs text-emerald-700 font-bold flex items-center gap-1">
                          <CheckCircle2 className="w-3.5 h-3.5" /> Note encrypted & saved!
                        </span>
                      ) : <span />}
                      <button
                        type="submit"
                        className="px-4 py-1.5 bg-indigo-700 hover:bg-indigo-800 text-white rounded-lg text-xs font-bold inline-flex items-center gap-1"
                      >
                        <Send className="w-3 h-3" /> Save Note
                      </button>
                    </div>
                  </form>

                  {/* Existing Notes for Student */}
                  <div className="space-y-2 pt-2 border-t border-slate-100 max-h-40 overflow-y-auto">
                    {savedNotes.map((note) => (
                      <div
                        key={note.id}
                        className="p-2.5 rounded-lg bg-slate-50 border border-slate-200 text-xs text-slate-800 space-y-1"
                      >
                        <div className="flex justify-between text-[10px] text-slate-500 font-medium">
                          <span>{note.providerName}</span>
                          <span>{new Date(note.createdAt).toLocaleString()}</span>
                        </div>
                        <p>{note.note}</p>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
