import { DailyLog, Screening, Alert } from '../types/swms';

export interface AlertEvaluationResult {
  tier: 1 | 2 | 3 | null;
  reason: string;
}

/**
 * 6.2 Alert Engine Rules
 */
export function evaluateAlerts(
  logs: DailyLog[],
  latestScreening?: Screening
): AlertEvaluationResult {
  const sortedLogs = [...logs].sort((a, b) => a.logDate.localeCompare(b.logDate));

  // Check Tier 3 from screening first (PHQ-9 or GAD-7 >= 15 is higher risk screen)
  if (latestScreening) {
    if ((latestScreening.phq9 && latestScreening.phq9 >= 15) || (latestScreening.gad7 && latestScreening.gad7 >= 15)) {
      return {
        tier: 3,
        reason: `Higher-risk clinical screening score detected (PHQ-9: ${latestScreening.phq9 ?? 'N/A'}, GAD-7: ${latestScreening.gad7 ?? 'N/A'}).`,
      };
    }
  }

  // Check Tier 2 from screening (PHQ-9 or GAD-7 >= 10)
  if (latestScreening) {
    if ((latestScreening.phq9 && latestScreening.phq9 >= 10) || (latestScreening.gad7 && latestScreening.gad7 >= 10)) {
      return {
        tier: 2,
        reason: `Elevated screening indicators (PHQ-9: ${latestScreening.phq9 ?? 'N/A'}, GAD-7: ${latestScreening.gad7 ?? 'N/A'}).`,
      };
    }
  }

  // Check Tier 2 from daily logs: 3 or more consecutive low-mood days (mood 1 or 2)
  if (sortedLogs.length >= 3) {
    const last3 = sortedLogs.slice(-3);
    const allLowMood = last3.every((l) => l.mood <= 2);
    if (allLowMood) {
      return {
        tier: 2,
        reason: 'Three consecutive days of low self-reported mood recorded.',
      };
    }
  }

  // Tier 1 is for any daily log
  if (sortedLogs.length > 0) {
    return {
      tier: 1,
      reason: 'Regular daily log active.',
    };
  }

  return { tier: null, reason: '' };
}

/**
 * Check if a Tier 3 alert has crossed 48 hours without a confirmed booking
 */
export function shouldEscalateToAdmin(alert: Alert, hasBookedIn48Hours: boolean): boolean {
  if (alert.tier !== 3) return false;
  if (alert.status === 'escalated_to_admin') return true;
  if (!hasBookedIn48Hours && (alert.hoursUnbooked ?? 0) >= 48) return true;
  return false;
}
