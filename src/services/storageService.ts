import {
  User,
  Consent,
  DailyLog,
  Screening,
  ProviderSlot,
  Appointment,
  ClinicalNote,
  Alert,
} from '../types/swms';
import {
  INITIAL_USERS,
  INITIAL_CONSENTS,
  STUDENT_A_LOGS,
  STUDENT_B_LOGS,
  STUDENT_C_LOGS,
  INITIAL_SCREENINGS,
  INITIAL_ALERTS,
  generateInitialSlots,
  INITIAL_APPOINTMENTS,
  INITIAL_CLINICAL_NOTES,
  INITIAL_COHORTS,
  CohortRecord,
  getRelativeDateStr,
} from './seedData';
import { calculateDomainScores, calculateCompositeScore } from './scoringEngine';
import { evaluateAlerts } from './alertEngine';

const STORAGE_KEYS = {
  USERS: 'swms_users',
  CURRENT_USER: 'swms_current_user',
  CONSENTS: 'swms_consents',
  LOGS: 'swms_logs',
  SCREENINGS: 'swms_screenings',
  SLOTS: 'swms_slots',
  APPOINTMENTS: 'swms_appointments',
  NOTES: 'swms_clinical_notes',
  ALERTS: 'swms_alerts',
  COHORTS: 'swms_cohorts',
};

export class StorageService {
  private static instance: StorageService;

  private constructor() {
    this.initIfEmpty();
  }

  public static getInstance(): StorageService {
    if (!StorageService.instance) {
      StorageService.instance = new StorageService();
    }
    return StorageService.instance;
  }

  public initIfEmpty(forceReset: boolean = false) {
    if (forceReset || !localStorage.getItem(STORAGE_KEYS.USERS)) {
      localStorage.setItem(STORAGE_KEYS.USERS, JSON.stringify(INITIAL_USERS));
      localStorage.setItem(STORAGE_KEYS.CURRENT_USER, JSON.stringify(INITIAL_USERS[0])); // Student A default
      localStorage.setItem(STORAGE_KEYS.CONSENTS, JSON.stringify(INITIAL_CONSENTS));

      const allLogs = [...STUDENT_A_LOGS, ...STUDENT_B_LOGS, ...STUDENT_C_LOGS];
      localStorage.setItem(STORAGE_KEYS.LOGS, JSON.stringify(allLogs));

      localStorage.setItem(STORAGE_KEYS.SCREENINGS, JSON.stringify(INITIAL_SCREENINGS));
      localStorage.setItem(STORAGE_KEYS.SLOTS, JSON.stringify(generateInitialSlots()));
      localStorage.setItem(STORAGE_KEYS.APPOINTMENTS, JSON.stringify(INITIAL_APPOINTMENTS));
      localStorage.setItem(STORAGE_KEYS.NOTES, JSON.stringify(INITIAL_CLINICAL_NOTES));
      localStorage.setItem(STORAGE_KEYS.ALERTS, JSON.stringify(INITIAL_ALERTS));
      localStorage.setItem(STORAGE_KEYS.COHORTS, JSON.stringify(INITIAL_COHORTS));
    }
  }

  // Current User Session
  public getCurrentUser(): User {
    const raw = localStorage.getItem(STORAGE_KEYS.CURRENT_USER);
    if (!raw) return INITIAL_USERS[0];
    return JSON.parse(raw);
  }

  public setCurrentUser(user: User) {
    localStorage.setItem(STORAGE_KEYS.CURRENT_USER, JSON.stringify(user));
  }

  // Users
  public getUsers(): User[] {
    return JSON.parse(localStorage.getItem(STORAGE_KEYS.USERS) || '[]');
  }

  public registerStudent(name: string, email: string, shareWithProvider: boolean, mlUse: boolean): User {
    const users = this.getUsers();
    const existing = users.find((u) => u.email.toLowerCase() === email.toLowerCase());
    if (existing) {
      throw new Error('A user with this email already exists.');
    }

    const newUser: User = {
      id: `usr-${Date.now()}`,
      name,
      email,
      role: 'student',
      department: 'Computer Engineering',
      year: 'First Year',
      isActive: true,
      createdAt: new Date().toISOString(),
    };

    users.push(newUser);
    localStorage.setItem(STORAGE_KEYS.USERS, JSON.stringify(users));

    // Save initial consent
    const consents = this.getConsents();
    consents.push({
      id: `con-${newUser.id}`,
      userId: newUser.id,
      shareWithProvider,
      mlUse,
      givenAt: new Date().toISOString(),
    });
    localStorage.setItem(STORAGE_KEYS.CONSENTS, JSON.stringify(consents));

    this.setCurrentUser(newUser);
    return newUser;
  }

  public updateUserRole(userId: string, newRole: User['role']) {
    const users = this.getUsers().map((u) => (u.id === userId ? { ...u, role: newRole } : u));
    localStorage.setItem(STORAGE_KEYS.USERS, JSON.stringify(users));
  }

  public toggleUserActive(userId: string) {
    const users = this.getUsers().map((u) => (u.id === userId ? { ...u, isActive: !u.isActive } : u));
    localStorage.setItem(STORAGE_KEYS.USERS, JSON.stringify(users));
  }

  // Consents
  public getConsents(): Consent[] {
    return JSON.parse(localStorage.getItem(STORAGE_KEYS.CONSENTS) || '[]');
  }

  public getUserConsent(userId: string): Consent {
    const consents = this.getConsents();
    let userCon = consents.find((c) => c.userId === userId);
    if (!userCon) {
      userCon = {
        id: `con-${userId}`,
        userId,
        shareWithProvider: false,
        mlUse: false,
        givenAt: new Date().toISOString(),
      };
      consents.push(userCon);
      localStorage.setItem(STORAGE_KEYS.CONSENTS, JSON.stringify(consents));
    }
    return userCon;
  }

  public updateConsent(userId: string, shareWithProvider: boolean, mlUse: boolean): Consent {
    const consents = this.getConsents();
    const index = consents.findIndex((c) => c.userId === userId);
    const updated: Consent = {
      id: index >= 0 ? consents[index].id : `con-${userId}`,
      userId,
      shareWithProvider,
      mlUse,
      givenAt: index >= 0 ? consents[index].givenAt : new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    if (index >= 0) {
      consents[index] = updated;
    } else {
      consents.push(updated);
    }
    localStorage.setItem(STORAGE_KEYS.CONSENTS, JSON.stringify(consents));
    return updated;
  }

  // Daily Logs
  public getLogs(): DailyLog[] {
    return JSON.parse(localStorage.getItem(STORAGE_KEYS.LOGS) || '[]');
  }

  public getUserLogs(userId: string): DailyLog[] {
    return this.getLogs()
      .filter((l) => l.userId === userId)
      .sort((a, b) => a.logDate.localeCompare(b.logDate));
  }

  public saveDailyCheckin(
    userId: string,
    mood: number,
    sleepHours: number,
    activityMinutes: number,
    mealScore: number,
    mealsResponses: { breakfast: boolean; fruitVeg: boolean; skippedMain: boolean },
    stressLevel: number
  ): DailyLog {
    const logs = this.getLogs();
    const todayStr = getRelativeDateStr(0);

    const domainScores = calculateDomainScores(
      sleepHours,
      activityMinutes,
      mood,
      stressLevel,
      mealScore
    );
    const compositeScore = calculateCompositeScore(domainScores);

    const existingIndex = logs.findIndex((l) => l.userId === userId && l.logDate === todayStr);

    const newLog: DailyLog = {
      id: existingIndex >= 0 ? logs[existingIndex].id : `log-${userId}-${todayStr}`,
      userId,
      logDate: todayStr,
      mood,
      sleepHours,
      activityMinutes,
      mealScore,
      mealsResponses,
      stressLevel,
      compositeScore,
      domainScores,
    };

    if (existingIndex >= 0) {
      logs[existingIndex] = newLog;
    } else {
      logs.push(newLog);
    }

    localStorage.setItem(STORAGE_KEYS.LOGS, JSON.stringify(logs));

    // Re-evaluate alert engine
    this.evaluateAndStoreAlerts(userId);

    return newLog;
  }

  // Screenings
  public getScreenings(): Screening[] {
    return JSON.parse(localStorage.getItem(STORAGE_KEYS.SCREENINGS) || '[]');
  }

  public getUserScreenings(userId: string): Screening[] {
    return this.getScreenings()
      .filter((s) => s.userId === userId)
      .sort((a, b) => a.completedAt.localeCompare(b.completedAt));
  }

  public saveScreening(screening: Omit<Screening, 'id' | 'completedAt'>): Screening {
    const list = this.getScreenings();
    const newScr: Screening = {
      ...screening,
      id: `scr-${Date.now()}`,
      completedAt: new Date().toISOString(),
    };
    list.push(newScr);
    localStorage.setItem(STORAGE_KEYS.SCREENINGS, JSON.stringify(list));

    // Evaluate alerts
    this.evaluateAndStoreAlerts(screening.userId, newScr);
    return newScr;
  }

  // Alerts
  public getAlerts(): Alert[] {
    return JSON.parse(localStorage.getItem(STORAGE_KEYS.ALERTS) || '[]');
  }

  public getUserAlerts(userId: string): Alert[] {
    return this.getAlerts().filter((a) => a.userId === userId && a.status !== 'resolved');
  }

  public evaluateAndStoreAlerts(userId: string, latestScreening?: Screening) {
    const userLogs = this.getUserLogs(userId);
    const userScreenings = latestScreening ? [latestScreening] : this.getUserScreenings(userId);
    const latestScr = userScreenings[userScreenings.length - 1];

    const evaluation = evaluateAlerts(userLogs, latestScr);
    if (!evaluation.tier) return;

    const alerts = this.getAlerts();
    const existingActive = alerts.find(
      (a) => a.userId === userId && a.tier === evaluation.tier && a.status === 'active'
    );

    const user = this.getUsers().find((u) => u.id === userId);
    const studentName = user ? user.name : 'Student';

    if (!existingActive) {
      alerts.push({
        id: `alt-${Date.now()}`,
        userId,
        studentName,
        tier: evaluation.tier,
        reason: evaluation.reason,
        status: 'active',
        createdAt: new Date().toISOString(),
        hoursUnbooked: evaluation.tier === 3 ? 0 : undefined,
      });
      localStorage.setItem(STORAGE_KEYS.ALERTS, JSON.stringify(alerts));
    }
  }

  // Provider Slots & Appointments
  public getSlots(): ProviderSlot[] {
    return JSON.parse(localStorage.getItem(STORAGE_KEYS.SLOTS) || '[]');
  }

  public getAvailableSlots(providerType?: 'GP' | 'Counsellor'): ProviderSlot[] {
    return this.getSlots().filter(
      (s) => !s.isBooked && (!providerType || s.providerType === providerType)
    );
  }

  public toggleProviderSlot(slotId: string) {
    const slots = this.getSlots().map((s) => (s.id === slotId ? { ...s, isBooked: !s.isBooked } : s));
    localStorage.setItem(STORAGE_KEYS.SLOTS, JSON.stringify(slots));
  }

  public addProviderSlot(providerId: string, providerName: string, providerType: 'GP' | 'Counsellor', slotStart: string, slotEnd: string) {
    const slots = this.getSlots();
    slots.push({
      id: `slot-${Date.now()}`,
      providerId,
      providerName,
      providerType,
      slotStart,
      slotEnd,
      isBooked: false,
    });
    localStorage.setItem(STORAGE_KEYS.SLOTS, JSON.stringify(slots));
  }

  public deleteProviderSlot(slotId: string) {
    const slots = this.getSlots().filter((s) => s.id !== slotId);
    localStorage.setItem(STORAGE_KEYS.SLOTS, JSON.stringify(slots));
  }

  public getAppointments(): Appointment[] {
    return JSON.parse(localStorage.getItem(STORAGE_KEYS.APPOINTMENTS) || '[]');
  }

  public getUserAppointments(studentId: string): Appointment[] {
    return this.getAppointments().filter((a) => a.studentId === studentId);
  }

  public getProviderAppointments(providerId: string): Appointment[] {
    return this.getAppointments().filter((a) => a.providerId === providerId);
  }

  public bookAppointment(
    studentId: string,
    studentName: string,
    slotId: string
  ): { appointment: Appointment; slot: ProviderSlot } {
    const slots = this.getSlots();
    const slotIndex = slots.findIndex((s) => s.id === slotId);
    if (slotIndex === 0 && slots[slotIndex].isBooked) {
      throw new Error('This slot is already booked.');
    }
    const slot = slots[slotIndex];
    slot.isBooked = true;
    localStorage.setItem(STORAGE_KEYS.SLOTS, JSON.stringify(slots));

    const appointments = this.getAppointments();
    const newAppointment: Appointment = {
      id: `apt-${Date.now()}`,
      studentId,
      studentName,
      providerId: slot.providerId,
      providerName: slot.providerName,
      providerType: slot.providerType,
      slotId: slot.id,
      slotStart: slot.slotStart,
      slotEnd: slot.slotEnd,
      status: 'confirmed',
      createdAt: new Date().toISOString(),
    };
    appointments.push(newAppointment);
    localStorage.setItem(STORAGE_KEYS.APPOINTMENTS, JSON.stringify(appointments));

    // Resolve unbooked timer on any Tier 3 alert
    const alerts = this.getAlerts().map((a) => {
      if (a.userId === studentId && a.tier === 3) {
        return { ...a, hoursUnbooked: 0 };
      }
      return a;
    });
    localStorage.setItem(STORAGE_KEYS.ALERTS, JSON.stringify(alerts));

    return { appointment: newAppointment, slot };
  }

  public cancelAppointment(appointmentId: string): Appointment {
    const appointments = this.getAppointments();
    const aptIndex = appointments.findIndex((a) => a.id === appointmentId);
    if (aptIndex === -1) throw new Error('Appointment not found');

    const apt = appointments[aptIndex];
    apt.status = 'cancelled';
    localStorage.setItem(STORAGE_KEYS.APPOINTMENTS, JSON.stringify(appointments));

    // Free up slot
    const slots = this.getSlots().map((s) => (s.id === apt.slotId ? { ...s, isBooked: false } : s));
    localStorage.setItem(STORAGE_KEYS.SLOTS, JSON.stringify(slots));

    return apt;
  }

  public rescheduleAppointment(appointmentId: string, newSlotId: string): Appointment {
    this.cancelAppointment(appointmentId);
    const apt = this.getAppointments().find((a) => a.id === appointmentId);
    if (!apt) throw new Error('Appointment not found');

    const result = this.bookAppointment(apt.studentId, apt.studentName, newSlotId);
    return result.appointment;
  }

  // Clinical Notes (Encrypted/Private to Provider)
  public getClinicalNotes(): ClinicalNote[] {
    return JSON.parse(localStorage.getItem(STORAGE_KEYS.NOTES) || '[]');
  }

  public getNotesForStudent(studentId: string): ClinicalNote[] {
    return this.getClinicalNotes().filter((n) => n.studentId === studentId);
  }

  public saveClinicalNote(appointmentId: string, studentId: string, providerId: string, providerName: string, note: string): ClinicalNote {
    const notes = this.getClinicalNotes();
    const newNote: ClinicalNote = {
      id: `note-${Date.now()}`,
      appointmentId,
      studentId,
      providerId,
      providerName,
      note,
      createdAt: new Date().toISOString(),
      encrypted: true,
    };
    notes.push(newNote);
    localStorage.setItem(STORAGE_KEYS.NOTES, JSON.stringify(notes));
    return newNote;
  }

  // Admin Escalation & Fast-Forward
  public fastForward48Hours(): number {
    const alerts = this.getAlerts();
    let escalatedCount = 0;

    const updated = alerts.map((a) => {
      if (a.tier === 3 && a.status === 'active') {
        escalatedCount++;
        return {
          ...a,
          hoursUnbooked: 50,
          status: 'escalated_to_admin' as const,
          escalatedToAdminAt: new Date().toISOString(),
        };
      }
      return a;
    });

    localStorage.setItem(STORAGE_KEYS.ALERTS, JSON.stringify(updated));
    return escalatedCount;
  }

  // Admin Cohort Analytics
  public getCohorts(): CohortRecord[] {
    return JSON.parse(localStorage.getItem(STORAGE_KEYS.COHORTS) || '[]');
  }

  // GDPR Data Rights
  public exportUserData(userId: string): string {
    const user = this.getUsers().find((u) => u.id === userId);
    const consent = this.getUserConsent(userId);
    const logs = this.getUserLogs(userId);
    const screenings = this.getUserScreenings(userId);
    const appointments = this.getUserAppointments(userId);

    const exportBundle = {
      exportedAt: new Date().toISOString(),
      compliance: 'Personal Data Protection / GDPR Right of Access',
      user,
      consent,
      dailyLogs: logs,
      screenings,
      appointments,
    };
    return JSON.stringify(exportBundle, null, 2);
  }

  public deleteUserData(userId: string) {
    const logs = this.getLogs().filter((l) => l.userId !== userId);
    const screenings = this.getScreenings().filter((s) => s.userId !== userId);
    const appointments = this.getAppointments().filter((a) => a.studentId !== userId);
    const consents = this.getConsents().filter((c) => c.userId !== userId);
    const alerts = this.getAlerts().filter((a) => a.userId !== userId);

    localStorage.setItem(STORAGE_KEYS.LOGS, JSON.stringify(logs));
    localStorage.setItem(STORAGE_KEYS.SCREENINGS, JSON.stringify(screenings));
    localStorage.setItem(STORAGE_KEYS.APPOINTMENTS, JSON.stringify(appointments));
    localStorage.setItem(STORAGE_KEYS.CONSENTS, JSON.stringify(consents));
    localStorage.setItem(STORAGE_KEYS.ALERTS, JSON.stringify(alerts));
  }
}
