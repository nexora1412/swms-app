import { DailyLog, DomainScores, BurnoutRiskResult } from '../types/swms';

export interface DomainWeights {
  sleep: number;
  activity: number;
  mood: number;
  stress: number;
  meals: number;
}

// Configurable domain weights (20% each by default)
export const DOMAIN_WEIGHTS: DomainWeights = {
  sleep: 0.20,
  activity: 0.20,
  mood: 0.20,
  stress: 0.20,
  meals: 0.20,
};

/**
 * 6.1 Wellness Scoring Rules
 */
export function calculateSleepScore(hours: number): number {
  if (hours >= 7 && hours <= 9) return 100;
  if ((hours >= 6 && hours < 7) || (hours > 9 && hours <= 10)) return 75;
  if (hours >= 5 && hours < 6) return 50;
  return 25; // under 5h or over 10h
}

export function calculateActivityScore(minutes: number): number {
  const score = (minutes / 30) * 100;
  return Math.min(100, Math.max(0, Math.round(score)));
}

export function calculateMoodScore(mood: number): number {
  // mood: 1..5 -> (mood - 1) / 4 * 100
  const normalized = ((mood - 1) / 4) * 100;
  return Math.min(100, Math.max(0, Math.round(normalized)));
}

export function calculateStressScore(stress: number): number {
  // stress: 1 (relaxed) .. 5 (very stressed) -> (5 - stress) / 4 * 100
  const normalized = ((5 - stress) / 4) * 100;
  return Math.min(100, Math.max(0, Math.round(normalized)));
}

export function calculateMealScore(breakfast: boolean, fruitVeg: boolean, skippedMainMeal: boolean): number {
  let score = 0;
  if (breakfast) score += 35;
  if (fruitVeg) score += 35;
  if (!skippedMainMeal) score += 30;
  return score;
}

export function calculateDomainScores(
  sleepHours: number,
  activityMinutes: number,
  mood: number,
  stressLevel: number,
  mealScore: number
): DomainScores {
  return {
    sleep: calculateSleepScore(sleepHours),
    activity: calculateActivityScore(activityMinutes),
    mood: calculateMoodScore(mood),
    stress: calculateStressScore(stressLevel),
    meals: mealScore,
  };
}

export function calculateCompositeScore(
  domainScores: DomainScores,
  weights: DomainWeights = DOMAIN_WEIGHTS
): number {
  const total =
    domainScores.sleep * weights.sleep +
    domainScores.activity * weights.activity +
    domainScores.mood * weights.mood +
    domainScores.stress * weights.stress +
    domainScores.meals * weights.meals;
  return Math.round(total);
}

export interface WellnessBand {
  label: string;
  badgeColor: string;
  textColor: string;
  explanation: string;
}

export function getWellnessBand(score: number): WellnessBand {
  if (score >= 75) {
    return {
      label: 'Flourishing',
      badgeColor: 'bg-emerald-100 text-emerald-800 border-emerald-200',
      textColor: 'text-emerald-700',
      explanation: 'Your lifestyle indicators are strong and resilient. Keep maintaining your rhythm!',
    };
  }
  if (score >= 50) {
    return {
      label: 'Balanced',
      badgeColor: 'bg-teal-100 text-teal-800 border-teal-200',
      textColor: 'text-teal-700',
      explanation: 'Moderate wellness balance with steady baseline routines across your daily habits.',
    };
  }
  return {
    label: 'Needs Care',
    badgeColor: 'bg-amber-100 text-amber-800 border-amber-200',
    textColor: 'text-amber-700',
    explanation: 'Indicators suggest fatigue or stress accumulation. Gentle self-care and pacing are recommended.',
  };
}

/**
 * 6.3 Burnout Risk Model (Stand-in for ML Service)
 */
export function calculateBurnoutRisk(
  logs: DailyLog[],
  examWeekFlag: boolean = false
): BurnoutRiskResult {
  // Sort logs by date ascending
  const sorted = [...logs].sort((a, b) => a.logDate.localeCompare(b.logDate));
  const last7 = sorted.slice(-7);
  const last30 = sorted.slice(-30);

  let points = 0;
  const factors: { text: string; points: number }[] = [];

  if (last7.length > 0) {
    // 7-day average sleep under 6h (+2)
    const avgSleep = last7.reduce((sum, l) => sum + l.sleepHours, 0) / last7.length;
    if (avgSleep < 6) {
      points += 2;
      factors.push({
        text: `Sleep averaged ${avgSleep.toFixed(1)}h over the last 7 days (target: 7–9h)`,
        points: 2,
      });
    }

    // 7-day average activity under 20 min (+1)
    const avgActivity = last7.reduce((sum, l) => sum + l.activityMinutes, 0) / last7.length;
    if (avgActivity < 20) {
      points += 1;
      factors.push({
        text: `Physical activity averaged only ${Math.round(avgActivity)} mins/day (recommended: 30+ mins)`,
        points: 1,
      });
    }

    // 7-day average stress 4 or higher (+2)
    const avgStress = last7.reduce((sum, l) => sum + l.stressLevel, 0) / last7.length;
    if (avgStress >= 4) {
      points += 2;
      factors.push({
        text: `Academic stress remained elevated at ${avgStress.toFixed(1)}/5 throughout the week`,
        points: 2,
      });
    }

    // 7-day average mood 2.5 or lower (+2)
    const avgMood = last7.reduce((sum, l) => sum + l.mood, 0) / last7.length;
    if (avgMood <= 2.5) {
      points += 2;
      factors.push({
        text: `Mood self-ratings averaged ${avgMood.toFixed(1)}/5 across recent check-ins`,
        points: 2,
      });
    }
  }

  // Composite score falling over 30 days (+1)
  if (last30.length >= 10) {
    const firstHalf = last30.slice(0, Math.floor(last30.length / 2));
    const secondHalf = last30.slice(Math.floor(last30.length / 2));
    const avgFirst = firstHalf.reduce((sum, l) => sum + l.compositeScore, 0) / firstHalf.length;
    const avgSecond = secondHalf.reduce((sum, l) => sum + l.compositeScore, 0) / secondHalf.length;
    if (avgSecond < avgFirst - 5) {
      points += 1;
      factors.push({
        text: `Overall composite wellness score dropped from ~${Math.round(avgFirst)} to ~${Math.round(avgSecond)} over 30 days`,
        points: 1,
      });
    }
  }

  // Exam-week flag on (+1)
  if (examWeekFlag) {
    points += 1;
    factors.push({
      text: 'Intense academic milestone / exam period in progress',
      points: 1,
    });
  }

  // Fallback factor if none triggered
  if (factors.length === 0) {
    factors.push({
      text: 'Balanced sleep, regular activity, and steady mood observed',
      points: 0,
    });
  }

  // Top 3 factors by weight
  factors.sort((a, b) => b.points - a.points);
  const topFactors = factors.slice(0, 3).map((f) => f.text);

  let riskLevel: 'Low' | 'Moderate' | 'High' = 'Low';
  let probability = 0.12;

  if (points >= 5) {
    riskLevel = 'High';
    probability = Math.min(0.92, 0.70 + points * 0.03);
  } else if (points >= 3) {
    riskLevel = 'Moderate';
    probability = 0.35 + points * 0.05;
  } else {
    riskLevel = 'Low';
    probability = 0.10 + points * 0.05;
  }

  return {
    riskLevel,
    probability,
    points,
    topFactors,
    calculatedAt: new Date().toISOString(),
  };
}

/**
 * Generate friendly daily insight cards
 */
export function generateInsights(logs: DailyLog[]): string[] {
  if (logs.length === 0) return ['Complete your first check-in to see tailored insights.'];
  const latest = logs[logs.length - 1];
  const insights: string[] = [];

  if (latest.sleepHours < 6) {
    insights.push(`Your sleep was ${latest.sleepHours}h last night, below the recommended 7–9h. Try dimming screens 45 mins earlier tonight.`);
  } else if (latest.sleepHours >= 7 && latest.sleepHours <= 9) {
    insights.push(`Great sleep duration (${latest.sleepHours}h)! Optimal rest primes your cognitive focus.`);
  }

  if (latest.activityMinutes >= 30) {
    insights.push(`You logged ${latest.activityMinutes} minutes of active movement today. Fantastic energy booster!`);
  } else {
    insights.push(`A brief 15-minute walk outside can relieve study-induced eye strain and muscle tension.`);
  }

  if (latest.stressLevel >= 4) {
    insights.push(`Academic stress was high today (${latest.stressLevel}/5). Consider breaking assignments into 25-minute Pomodoro intervals.`);
  }

  return insights.slice(0, 3);
}
