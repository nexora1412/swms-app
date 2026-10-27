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
import { calculateDomainScores, calculateCompositeScore } from './scoringEngine';

// Date utility to format YYYY-MM-DD relative to today
export function getRelativeDateStr(offsetDays: number): string {
  const d = new Date();
  d.setDate(d.getDate() + offsetDays);
  return d.toISOString().split('T')[0];
}

// Generate 30 days of logs for a persona
function generateLogs(
  userId: string,
  generator: (dayIndex: number, dateStr: string) => {
    mood: number;
    sleepHours: number;
    activityMinutes: number;
    mealScore: number;
    stressLevel: number;
  }
): DailyLog[] {
  const logs: DailyLog[] = [];
  for (let i = 29; i >= 0; i--) {
    const dateStr = getRelativeDateStr(-i);
    const dayIndex = 29 - i; // 0 to 29
    const params = generator(dayIndex, dateStr);
    const domainScores = calculateDomainScores(
      params.sleepHours,
      params.activityMinutes,
      params.mood,
      params.stressLevel,
      params.mealScore
    );
    const compositeScore = calculateCompositeScore(domainScores);

    logs.push({
      id: `log-${userId}-${dateStr}`,
      userId,
      logDate: dateStr,
      mood: params.mood,
      sleepHours: params.sleepHours,
      activityMinutes: params.activityMinutes,
      mealScore: params.mealScore,
      mealsResponses: {
        breakfast: params.mealScore >= 65,
        fruitVeg: params.mealScore >= 35,
        skippedMain: params.mealScore < 70,
      },
      stressLevel: params.stressLevel,
      compositeScore,
      domainScores,
    });
  }
  return logs;
}

// Initial Users
export const INITIAL_USERS: User[] = [
  {
    id: 'usr-student-a',
    name: 'Pranali More (Student A)',
    email: 'student.a@demo.edu',
    role: 'student',
    department: 'Computer Engineering',
    year: 'Final Year',
    isActive: true,
    createdAt: getRelativeDateStr(-60),
  },
  {
    id: 'usr-student-b',
    name: 'Saloni Patil (Student B)',
    email: 'student.b@demo.edu',
    role: 'student',
    department: 'Computer Engineering',
    year: 'Final Year',
    isActive: true,
    createdAt: getRelativeDateStr(-60),
  },
  {
    id: 'usr-student-c',
    name: 'Rohan Deshmukh (Student C)',
    email: 'student.c@demo.edu',
    role: 'student',
    department: 'Data Science',
    year: 'Third Year',
    isActive: true,
    createdAt: getRelativeDateStr(-45),
  },
  {
    id: 'usr-gp',
    name: 'Dr. Ramesh Kulkarni',
    email: 'gp@demo.edu',
    role: 'provider',
    providerType: 'GP',
    isActive: true,
    createdAt: getRelativeDateStr(-120),
  },
  {
    id: 'usr-counsellor',
    name: 'Dr. Ananya Sen',
    email: 'counsellor@demo.edu',
    role: 'provider',
    providerType: 'Counsellor',
    isActive: true,
    createdAt: getRelativeDateStr(-120),
  },
  {
    id: 'usr-admin',
    name: 'Dr. Naziya Huzzain (Admin)',
    email: 'admin@demo.edu',
    role: 'admin',
    department: 'Wellness Board',
    isActive: true,
    createdAt: getRelativeDateStr(-180),
  },
];

// Initial Consents
export const INITIAL_CONSENTS: Consent[] = [
  {
    id: 'con-student-a',
    userId: 'usr-student-a',
    shareWithProvider: false, // Default off per privacy-by-design
    mlUse: false,
    givenAt: getRelativeDateStr(-60),
  },
  {
    id: 'con-student-b',
    userId: 'usr-student-b',
    shareWithProvider: true, // Consented persona
    mlUse: true,
    givenAt: getRelativeDateStr(-60),
  },
  {
    id: 'con-student-c',
    userId: 'usr-student-c',
    shareWithProvider: true, // Consented for clinical safety
    mlUse: true,
    givenAt: getRelativeDateStr(-45),
  },
];

// Generate Student A logs: healthy for 3 weeks (days 0-26), last 3 days (days 27-29) low mood
export const STUDENT_A_LOGS: DailyLog[] = generateLogs('usr-student-a', (dayIndex) => {
  if (dayIndex >= 27) {
    // Last 3 days: low mood (1 or 2) -> triggers Tier 2
    return {
      mood: dayIndex === 29 ? 1 : 2,
      sleepHours: 5.0,
      activityMinutes: 15,
      mealScore: 40,
      stressLevel: 4,
    };
  }
  // Days 0-26: healthy baseline
  const variance = (dayIndex % 3) * 0.2;
  return {
    mood: 4,
    sleepHours: 7.5 + variance,
    activityMinutes: 40,
    mealScore: 85,
    stressLevel: 2,
  };
});

// Generate Student B logs: stable, good sleep and activity throughout
export const STUDENT_B_LOGS: DailyLog[] = generateLogs('usr-student-b', (dayIndex) => {
  const sin = Math.sin(dayIndex / 4);
  return {
    mood: 4,
    sleepHours: 7.8 + sin * 0.5,
    activityMinutes: 45 + Math.round(sin * 10),
    mealScore: 90,
    stressLevel: 2,
  };
});

// Generate Student C logs: poor sleep, high stress, low activity, downward trend
export const STUDENT_C_LOGS: DailyLog[] = generateLogs('usr-student-c', (dayIndex) => {
  const deterioration = dayIndex / 30; // gets progressively worse
  return {
    mood: Math.max(1, Math.round(3 - deterioration * 1.5)),
    sleepHours: Math.max(4.0, 6.0 - deterioration * 1.5),
    activityMinutes: Math.max(5, Math.round(30 - deterioration * 22)),
    mealScore: Math.max(30, Math.round(75 - deterioration * 40)),
    stressLevel: Math.min(5, Math.round(3 + deterioration * 2)),
  };
});

// Screenings
export const INITIAL_SCREENINGS: Screening[] = [
  {
    id: 'scr-student-a',
    userId: 'usr-student-a',
    weekStart: getRelativeDateStr(-2),
    phq2: 2,
    gad2: 2,
    completedAt: getRelativeDateStr(-2),
  },
  {
    id: 'scr-student-b',
    userId: 'usr-student-b',
    weekStart: getRelativeDateStr(-4),
    phq2: 1,
    gad2: 1,
    completedAt: getRelativeDateStr(-4),
  },
  {
    id: 'scr-student-c',
    userId: 'usr-student-c',
    weekStart: getRelativeDateStr(-3),
    phq2: 4, // > 3 -> branched
    gad2: 4, // > 3 -> branched
    phq9: 14, // >= 10 -> Tier 2, nearing Tier 3
    gad7: 12,
    phq9Item9SelfHarm: 0,
    tierRaised: 2,
    completedAt: getRelativeDateStr(-3),
    notes: 'Branching triggered due to high initial distress score.',
  },
];

// Initial Alerts
export const INITIAL_ALERTS: Alert[] = [
  {
    id: 'alt-student-a',
    userId: 'usr-student-a',
    studentName: 'Pranali More (Student A)',
    tier: 2,
    reason: 'Three consecutive low-mood days logged (Mood score: 1–2).',
    status: 'active',
    createdAt: getRelativeDateStr(0),
    hoursUnbooked: 4,
  },
  {
    id: 'alt-student-c',
    userId: 'usr-student-c',
    studentName: 'Rohan Deshmukh (Student C)',
    tier: 3,
    reason: 'Elevated clinical screening (PHQ-9: 14) and prolonged severe sleep deprivation without appointment.',
    status: 'active', // ready for 48h demo escalation to admin review
    createdAt: getRelativeDateStr(-2),
    hoursUnbooked: 49, // > 48h unbooked
  },
];

// Generate 30-min Provider Slots for next 7 days (10:00 - 16:00)
export function generateInitialSlots(): ProviderSlot[] {
  const slots: ProviderSlot[] = [];
  const providers = [
    { id: 'usr-gp', name: 'Dr. Ramesh Kulkarni', type: 'GP' as const },
    { id: 'usr-counsellor', name: 'Dr. Ananya Sen', type: 'Counsellor' as const },
  ];

  for (let dayOffset = 0; dayOffset < 7; dayOffset++) {
    const dStr = getRelativeDateStr(dayOffset);
    providers.forEach((prov) => {
      // 10:00 to 16:00 (every 45 mins / 30 mins)
      const times = [
        '10:00', '10:30', '11:00', '11:30',
        '13:30', '14:00', '14:30', '15:00', '15:30'
      ];
      times.forEach((t, idx) => {
        const [hh, mm] = t.split(':');
        const endMinutes = parseInt(mm) + 30;
        const endH = endMinutes >= 60 ? parseInt(hh) + 1 : parseInt(hh);
        const endM = endMinutes >= 60 ? '00' : `${endMinutes}`;

        // Pre-book one slot for Student B
        const isPrebooked = dayOffset === 1 && prov.id === 'usr-counsellor' && t === '14:00';

        slots.push({
          id: `slot-${prov.id}-${dStr}-${idx}`,
          providerId: prov.id,
          providerName: prov.name,
          providerType: prov.type,
          slotStart: `${dStr}T${hh}:${mm}:00`,
          slotEnd: `${dStr}T${endH < 10 ? '0' + endH : endH}:${endM}:00`,
          isBooked: isPrebooked,
        });
      });
    });
  }
  return slots;
}

// Initial Appointments
export const INITIAL_APPOINTMENTS: Appointment[] = [
  {
    id: 'apt-student-b-1',
    studentId: 'usr-student-b',
    studentName: 'Saloni Patil (Student B)',
    providerId: 'usr-counsellor',
    providerName: 'Dr. Ananya Sen',
    providerType: 'Counsellor',
    slotId: 'slot-usr-counsellor-prebooked',
    slotStart: `${getRelativeDateStr(1)}T14:00:00`,
    slotEnd: `${getRelativeDateStr(1)}T14:30:00`,
    status: 'confirmed',
    createdAt: getRelativeDateStr(-1),
  },
];

// Initial Clinical Notes (Provider view only, encrypted/isolated)
export const INITIAL_CLINICAL_NOTES: ClinicalNote[] = [
  {
    id: 'note-student-b-1',
    appointmentId: 'apt-student-b-1',
    studentId: 'usr-student-b',
    providerId: 'usr-counsellor',
    providerName: 'Dr. Ananya Sen',
    note: 'Initial consultation: Student shows strong coping routines and healthy sleep habits. Discussed goal-setting for campus balance.',
    createdAt: getRelativeDateStr(-1),
    encrypted: true,
  },
];

// 16 Simulated Cohort Students for Admin Anonymised Aggregates
export interface CohortRecord {
  department: string;
  count: number;
  avgComposite: number;
  lowRiskCount: number;
  moderateRiskCount: number;
  highRiskCount: number;
}

export const INITIAL_COHORTS: CohortRecord[] = [
  {
    department: 'Computer Engineering',
    count: 14,
    avgComposite: 76.4,
    lowRiskCount: 9,
    moderateRiskCount: 4,
    highRiskCount: 1,
  },
  {
    department: 'Data Science',
    count: 9,
    avgComposite: 68.2,
    lowRiskCount: 5,
    moderateRiskCount: 3,
    highRiskCount: 1,
  },
  {
    department: 'Mechanical Engineering',
    count: 7,
    avgComposite: 72.8,
    lowRiskCount: 5,
    moderateRiskCount: 2,
    highRiskCount: 0,
  },
  {
    // Under 5 students -> Tests Section 5.7 k-anonymity suppression rule!
    department: 'Chemical Engineering',
    count: 3,
    avgComposite: 64.0,
    lowRiskCount: 1,
    moderateRiskCount: 2,
    highRiskCount: 0,
  },
];
