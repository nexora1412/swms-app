import React, { useState } from 'react';
import { User, ProviderSlot, Appointment, ProviderType } from '../types/swms';
import { StorageService } from '../services/storageService';
import { EmailPreviewModal } from '../components/common/EmailPreviewModal';
import {
  Calendar,
  Clock,
  User as UserIcon,
  CheckCircle2,
  CalendarX2,
  RefreshCw,
  Mail,
  Stethoscope,
  HeartHandshake,
  AlertCircle,
} from 'lucide-react';

interface BookingPageProps {
  currentUser: User;
}

export const BookingPage: React.FC<BookingPageProps> = ({ currentUser }) => {
  const storage = StorageService.getInstance();

  const [providerFilter, setProviderFilter] = useState<'All' | ProviderType>('All');
  const [selectedSlot, setSelectedSlot] = useState<ProviderSlot | null>(null);
  const [appointments, setAppointments] = useState<Appointment[]>(
    storage.getUserAppointments(currentUser.id)
  );
  const [previewAppointment, setPreviewAppointment] = useState<Appointment | null>(null);
  const [reschedulingAptId, setReschedulingAptId] = useState<string | null>(null);

  const availableSlots = storage.getAvailableSlots(
    providerFilter === 'All' ? undefined : providerFilter
  );

  // Group slots by date
  const slotsByDate: Record<string, ProviderSlot[]> = {};
  availableSlots.forEach((slot) => {
    const dateStr = slot.slotStart.split('T')[0];
    if (!slotsByDate[dateStr]) slotsByDate[dateStr] = [];
    slotsByDate[dateStr].push(slot);
  });

  const handleBookSlot = (slot: ProviderSlot) => {
    if (reschedulingAptId) {
      // Reschedule existing
      const updated = storage.rescheduleAppointment(reschedulingAptId, slot.id);
      setAppointments(storage.getUserAppointments(currentUser.id));
      setReschedulingAptId(null);
      setSelectedSlot(null);
      setPreviewAppointment(updated);
    } else {
      // Book fresh
      const { appointment } = storage.bookAppointment(
        currentUser.id,
        currentUser.name,
        slot.id
      );
      setAppointments(storage.getUserAppointments(currentUser.id));
      setSelectedSlot(null);
      setPreviewAppointment(appointment);
    }
  };

  const handleCancelAppointment = (appointmentId: string) => {
    storage.cancelAppointment(appointmentId);
    setAppointments(storage.getUserAppointments(currentUser.id));
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-10 animate-fade-in">
      {/* Header */}
      <div className="border-b border-[#e7e2d7] pb-4">
        <span className="text-xs font-semibold text-teal-700 tracking-wide uppercase">
          Campus Consultations (S6 & S7)
        </span>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
          Wellness Consultations & Appointments
        </h1>
        <p className="text-xs sm:text-sm text-slate-500 mt-1">
          Confidential 30-minute consultations with university medical staff and counsellors. Free of charge for enrolled students.
        </p>
      </div>

      {/* Reschedule Notification Banner if in Rescheduling Mode */}
      {reschedulingAptId && (
        <div className="bg-amber-50 border-2 border-amber-300 rounded-2xl p-4 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <RefreshCw className="w-5 h-5 text-amber-700 animate-spin" />
            <p className="text-sm font-semibold text-amber-900">
              Select a new time slot below to reschedule your appointment. Your previous slot will be released.
            </p>
          </div>
          <button
            onClick={() => setReschedulingAptId(null)}
            className="px-3 py-1 bg-white border border-amber-300 text-amber-800 text-xs font-bold rounded-lg hover:bg-amber-100"
          >
            Cancel Rescheduling
          </button>
        </div>
      )}

      {/* S7: My Appointments Section */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-bold text-slate-800 flex items-center gap-2">
            <Calendar className="w-5 h-5 text-teal-700" /> My Scheduled Appointments
          </h2>
          <span className="text-xs text-slate-500 font-medium">
            {appointments.filter((a) => a.status === 'confirmed').length} Active
          </span>
        </div>

        {appointments.length === 0 ? (
          <div className="bg-white p-6 rounded-2xl border border-slate-200 text-center text-slate-500 text-sm">
            <p>You have no scheduled appointments yet. Browse available slots below to book a time.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {appointments.map((apt) => {
              const startObj = new Date(apt.slotStart);
              const isPast = startObj < new Date();
              const dateStr = startObj.toLocaleDateString('en-US', {
                weekday: 'short',
                month: 'short',
                day: 'numeric',
              });
              const timeStr = `${startObj.toLocaleTimeString('en-US', {
                hour: '2-digit',
                minute: '2-digit',
              })} – ${new Date(apt.slotEnd).toLocaleTimeString('en-US', {
                hour: '2-digit',
                minute: '2-digit',
              })}`;

              return (
                <div
                  key={apt.id}
                  className={`p-5 rounded-2xl border transition-all ${
                    apt.status === 'cancelled'
                      ? 'bg-slate-50 border-slate-200 opacity-60'
                      : 'bg-white border-slate-200 shadow-xs'
                  }`}
                >
                  <div className="flex justify-between items-start mb-3">
                    <span
                      className={`px-2 py-0.5 rounded text-[11px] font-bold uppercase tracking-wider ${
                        apt.status === 'confirmed'
                          ? 'bg-emerald-100 text-emerald-800 border border-emerald-200'
                          : 'bg-slate-200 text-slate-700'
                      }`}
                    >
                      {apt.status}
                    </span>
                    <button
                      onClick={() => setPreviewAppointment(apt)}
                      className="text-teal-700 hover:text-teal-900 inline-flex items-center gap-1 text-xs font-semibold"
                      title="View simulated email reminder"
                    >
                      <Mail className="w-3.5 h-3.5" /> Email Preview
                    </button>
                  </div>

                  <div className="space-y-1.5 text-xs text-slate-700">
                    <div className="font-bold text-sm text-slate-900 flex items-center gap-1.5">
                      <UserIcon className="w-4 h-4 text-teal-600" />
                      {apt.providerName}
                    </div>
                    <div className="text-slate-500 text-[11px] font-medium">
                      Specialty: {apt.providerType === 'GP' ? 'General Physician' : 'Mental Health Counsellor'}
                    </div>
                    <div className="flex items-center gap-1 text-slate-600 font-medium pt-1">
                      <Clock className="w-3.5 h-3.5 text-slate-400" />
                      {dateStr} • {timeStr}
                    </div>
                  </div>

                  {apt.status === 'confirmed' && !isPast && (
                    <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
                      <button
                        onClick={() => setReschedulingAptId(apt.id)}
                        className="text-teal-700 hover:text-teal-900 font-bold inline-flex items-center gap-1"
                      >
                        <RefreshCw className="w-3 h-3" /> Reschedule
                      </button>
                      <button
                        onClick={() => {
                          if (window.confirm('Cancel this consultation? Your slot will be made available to other students.')) {
                            handleCancelAppointment(apt.id);
                          }
                        }}
                        className="text-rose-600 hover:text-rose-800 font-medium"
                      >
                        Cancel
                      </button>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* S6: Booking Section */}
      <div className="space-y-5 pt-4 border-t border-[#e7e2d7]">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
          <div>
            <h2 className="text-lg font-bold text-slate-800">
              Book a Consultation (Next 7 Days)
            </h2>
            <p className="text-xs text-slate-500">
              Slots are 30 minutes, 10:00–16:00. Booked slots immediately lock for others.
            </p>
          </div>

          {/* Provider Filter */}
          <div className="flex items-center gap-2">
            <span className="text-xs text-slate-500 font-medium">Filter Provider:</span>
            <div className="inline-flex rounded-xl bg-slate-100 p-1 border border-slate-200 text-xs font-semibold">
              <button
                onClick={() => setProviderFilter('All')}
                className={`px-3 py-1 rounded-lg transition-all ${
                  providerFilter === 'All' ? 'bg-white text-teal-800 shadow-xs' : 'text-slate-600'
                }`}
              >
                All Providers
              </button>
              <button
                onClick={() => setProviderFilter('GP')}
                className={`px-3 py-1 rounded-lg inline-flex items-center gap-1 transition-all ${
                  providerFilter === 'GP' ? 'bg-white text-teal-800 shadow-xs' : 'text-slate-600'
                }`}
              >
                <Stethoscope className="w-3 h-3 text-indigo-600" /> GP Doctor
              </button>
              <button
                onClick={() => setProviderFilter('Counsellor')}
                className={`px-3 py-1 rounded-lg inline-flex items-center gap-1 transition-all ${
                  providerFilter === 'Counsellor' ? 'bg-white text-teal-800 shadow-xs' : 'text-slate-600'
                }`}
              >
                <HeartHandshake className="w-3 h-3 text-teal-600" /> Counsellor
              </button>
            </div>
          </div>
        </div>

        {/* Available Slot Days Accordion / List */}
        <div className="space-y-6">
          {Object.keys(slotsByDate).length === 0 ? (
            <div className="bg-white p-8 rounded-2xl border border-slate-200 text-center text-slate-500 text-sm">
              No free slots currently available matching this filter. Please check back or contact the campus clinic directly.
            </div>
          ) : (
            Object.keys(slotsByDate).map((dStr) => {
              const daySlots = slotsByDate[dStr];
              const dateObj = new Date(`${dStr}T00:00:00`);
              const formattedDay = dateObj.toLocaleDateString('en-US', {
                weekday: 'long',
                month: 'short',
                day: 'numeric',
              });

              return (
                <div key={dStr} className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs space-y-3">
                  <div className="flex items-center justify-between border-b border-slate-100 pb-2">
                    <span className="font-bold text-slate-800 text-sm flex items-center gap-2">
                      <Calendar className="w-4 h-4 text-teal-700" />
                      {formattedDay}
                    </span>
                    <span className="text-xs text-slate-500 font-medium">
                      {daySlots.length} slot{daySlots.length === 1 ? '' : 's'} available
                    </span>
                  </div>

                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-2.5">
                    {daySlots.map((slot) => {
                      const timeStr = new Date(slot.slotStart).toLocaleTimeString('en-US', {
                        hour: '2-digit',
                        minute: '2-digit',
                      });
                      const isGP = slot.providerType === 'GP';

                      return (
                        <button
                          key={slot.id}
                          onClick={() => handleBookSlot(slot)}
                          className={`p-3 rounded-xl border text-left transition-all hover:scale-[1.02] ${
                            isGP
                              ? 'border-indigo-100 hover:border-indigo-400 bg-indigo-50/40 hover:bg-indigo-50'
                              : 'border-teal-100 hover:border-teal-400 bg-teal-50/40 hover:bg-teal-50'
                          }`}
                        >
                          <div className="text-xs font-extrabold text-slate-900">{timeStr}</div>
                          <div className="text-[11px] text-slate-600 font-medium mt-0.5 truncate">
                            {slot.providerName}
                          </div>
                          <div className="text-[10px] text-slate-500">
                            {isGP ? 'Physician' : 'Counsellor'}
                          </div>
                        </button>
                      );
                    })}
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>

      {/* Simulated Email Preview Modal */}
      {previewAppointment && (
        <EmailPreviewModal
          appointment={previewAppointment}
          onClose={() => setPreviewAppointment(null)}
          onCancelAppointment={handleCancelAppointment}
        />
      )}
    </div>
  );
};
