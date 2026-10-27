import React from 'react';
import { Mail, CheckCircle2, Calendar, Clock, User, X, AlertCircle } from 'lucide-react';
import { Appointment } from '../../types/swms';

interface EmailPreviewModalProps {
  appointment: Appointment | null;
  onClose: () => void;
  onCancelAppointment: (id: string) => void;
}

export const EmailPreviewModal: React.FC<EmailPreviewModalProps> = ({
  appointment,
  onClose,
  onCancelAppointment,
}) => {
  if (!appointment) return null;

  const dateObj = new Date(appointment.slotStart);
  const formattedDate = dateObj.toLocaleDateString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
  const startTime = dateObj.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
  const endTime = new Date(appointment.slotEnd).toLocaleTimeString('en-US', {
    hour: '2-digit',
    minute: '2-digit',
  });

  return (
    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-fade-in">
      <div className="bg-white rounded-2xl max-w-lg w-full border border-slate-200 shadow-2xl overflow-hidden">
        {/* Email Header Simulation */}
        <div className="bg-teal-700 text-white px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Mail className="w-5 h-5 text-teal-200" />
            <span className="font-semibold text-sm tracking-wide">
              Simulated Email Preview (Notification Engine)
            </span>
          </div>
          <button
            onClick={onClose}
            className="text-teal-200 hover:text-white rounded-lg p-1 transition-colors"
            aria-label="Close preview"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Email Metadata */}
        <div className="bg-slate-50 border-b border-slate-200 px-6 py-3 text-xs space-y-1 font-mono text-slate-600">
          <div><strong className="text-slate-800">From:</strong> SWMS Wellness Booking &lt;appointments@demo.edu&gt;</div>
          <div><strong className="text-slate-800">To:</strong> {appointment.studentName}</div>
          <div><strong className="text-slate-800">Subject:</strong> Confirmed: Wellness Consultation with {appointment.providerName}</div>
        </div>

        {/* Email Body */}
        <div className="p-6 space-y-5 text-slate-700 text-sm">
          <div className="flex items-center gap-3 bg-emerald-50 text-emerald-800 border border-emerald-200 p-3.5 rounded-xl">
            <CheckCircle2 className="w-6 h-6 text-emerald-600 shrink-0" />
            <div>
              <p className="font-semibold text-base">Your consultation is scheduled</p>
              <p className="text-xs text-emerald-700">A calendar invite and private check-in room link have been generated.</p>
            </div>
          </div>

          <div className="bg-white border border-slate-200 rounded-xl p-4 space-y-2.5 shadow-xs">
            <div className="flex items-center gap-2 text-slate-700 font-medium">
              <User className="w-4 h-4 text-teal-600" />
              <span>Provider: <strong className="text-slate-900">{appointment.providerName}</strong> ({appointment.providerType})</span>
            </div>
            <div className="flex items-center gap-2 text-slate-700">
              <Calendar className="w-4 h-4 text-teal-600" />
              <span>Date: <strong>{formattedDate}</strong></span>
            </div>
            <div className="flex items-center gap-2 text-slate-700">
              <Clock className="w-4 h-4 text-teal-600" />
              <span>Time: <strong>{startTime} – {endTime}</strong> (30 minutes)</span>
            </div>
          </div>

          <div className="bg-amber-50 border border-amber-200 rounded-xl p-3 text-xs text-amber-800 flex items-start gap-2">
            <AlertCircle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
            <p>
              Consultations are confidential. If you gave consent, your provider can review your recent wellness trends to better tailor your discussion.
            </p>
          </div>

          <div className="pt-2 flex items-center justify-between border-t border-slate-100 text-xs">
            <button
              onClick={() => {
                if (window.confirm('Are you sure you want to cancel this appointment? The slot will be released.')) {
                  onCancelAppointment(appointment.id);
                  onClose();
                }
              }}
              className="text-rose-600 hover:text-rose-800 underline font-medium"
            >
              Cancel this appointment
            </button>
            <button
              onClick={onClose}
              className="px-4 py-2 bg-teal-700 hover:bg-teal-800 text-white rounded-lg font-medium shadow-xs"
            >
              Done & Return
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
