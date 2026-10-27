export type UserRole = 'student' | 'provider' | 'admin';

export type ProviderType = 'GP' | 'Counsellor';

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  providerType?: ProviderType;
  department?: string;
  year?: string;
  isActive: boolean;
  createdAt: string;
}

export interface Consent {
  id: string;
  userId: string;
  shareWithProvider: boolean;
  mlUse: boolean;
  givenAt: string;
  updatedAt?: string;
}

export interface DomainScores {
  sleep: number;    // 0-100
  activity: number; // 0-100
  mood: number;     // 0-100
  stress: number;   // 0-100
  meals: number;    // 0-100
}

export interface DailyLog {
  id: string;
  userId: string;
  logDate: string; // YYYY-MM-DD
  mood: number; // 1 = very low, 5 = great
  sleepHours: number; // 0 - 14
  activityMinutes: number; // 0 - 240
  mealScore: number; // 0 - 100 derived from 3 KIDMED questions
  mealsResponses?: {
    breakfast: boolean;
    fruitVeg: boolean;
    skippedMain: boolean;
  };
  stressLevel: number; // 1 = relaxed, 5 = very stressed
  compositeScore: number; // 0 - 100
  domainScores: DomainScores;
}

export interface Screening {
  id: string;
  userId: string;
  weekStart: string; // YYYY-MM-DD
  phq2: number; // 0 - 6
  gad2: number; // 0 - 6
  phq9?: number; // 0 - 27
  gad7?: number; // 0 - 21
  phq9Item9SelfHarm?: number; // 0 - 3
  tierRaised?: 1 | 2 | 3;
  completedAt: string;
  notes?: string;
}

export interface ProviderSlot {
  id: string;
  providerId: string;
  providerName: string;
  providerType: ProviderType;
  slotStart: string; // ISO String
  slotEnd: string;   // ISO String
  isBooked: boolean;
}

export interface Appointment {
  id: string;
  studentId: string;
  studentName: string;
  providerId: string;
  providerName: string;
  providerType: ProviderType;
  slotId: string;
  slotStart: string;
  slotEnd: string;
  status: 'confirmed' | 'cancelled' | 'rescheduled';
  createdAt: string;
}

export interface ClinicalNote {
  id: string;
  appointmentId: string;
  studentId: string;
  providerId: string;
  providerName: string;
  note: string;
  createdAt: string;
  encrypted: boolean; // simulated at-rest encryption
}

export interface Alert {
  id: string;
  userId: string;
  studentName: string;
  tier: 1 | 2 | 3;
  reason: string;
  status: 'active' | 'resolved' | 'escalated_to_admin';
  createdAt: string;
  hoursUnbooked?: number; // for Tier 3 48h escalation
  escalatedToAdminAt?: string;
}

export interface BurnoutRiskResult {
  riskLevel: 'Low' | 'Moderate' | 'High';
  probability: number; // e.g. 0.15 - 0.95
  points: number;
  topFactors: string[];
  calculatedAt: string;
}
