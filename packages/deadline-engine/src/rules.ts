/**
 * Deterministic Legal Deadline Calculation Rules Engine
 * Implements Chain of Command Master Build Instructions §17.
 * Mathematical & calendar correctness — never relies on raw LLM arithmetic.
 */

export interface DeadlineComputationMethod {
  kind: 'add_days' | 'add_business_days' | 'add_calendar_days_skip_weekends' | 'named_period';
  days: number;
  includeTrigger: boolean;
  rollforwardIfNonCourtDay: boolean;
}

export interface DeadlineRule {
  id: string;
  jurisdictionId: string;
  courtId?: string;
  triggerEventType: string;           // e.g. 'arraignment', 'service_of_motion'
  title: string;
  citation: string;                   // the statutory authority (required)
  authorityId: string;
  computation: DeadlineComputationMethod;
  notes?: string;
  effectiveFrom: string;
  effectiveTo?: string;
  version: number;
  verified: boolean;
}

export interface DeadlineResult {
  ruleId: string;
  ruleTitle: string;
  citation: string;
  triggerDate: string;
  dueDate: string;
  isCourtDay: boolean;
  skippedDays: { date: string; reason: 'weekend' | 'court_holiday' }[];
  methodSummary: string;
  verified: boolean;
  notes?: string;
}

export const STANDARD_US_COURT_HOLIDAYS_2026: Record<string, string> = {
  '2026-01-01': "New Year's Day",
  '2026-01-19': "Martin Luther King Jr. Day",
  '2026-02-16': "Presidents' Day / Washington's Birthday",
  '2026-05-25': "Memorial Day",
  '2026-06-19': "Juneteenth National Independence Day",
  '2026-07-03': "Independence Day (Observed)",
  '2026-07-04': "Independence Day",
  '2026-09-07': "Labor Day",
  '2026-10-12': "Columbus Day / Indigenous Peoples' Day",
  '2026-11-11': "Veterans Day",
  '2026-11-26': "Thanksgiving Day",
  '2026-12-25': "Christmas Day",
};

export function isWeekend(date: Date): boolean {
  const day = date.getUTCDay();
  return day === 0 || day === 6; // Sunday or Saturday
}

export function isHoliday(dateStr: string, holidays: Record<string, string> = STANDARD_US_COURT_HOLIDAYS_2026): boolean {
  return Boolean(holidays[dateStr]);
}

export function formatDateISO(date: Date): string {
  return date.toISOString().split('T')[0];
}

/**
 * Computes deterministic court deadline with calendar math and statutory provenance.
 */
export function computeDeadline(
  triggerDateISO: string,
  rule: DeadlineRule,
  holidays: Record<string, string> = STANDARD_US_COURT_HOLIDAYS_2026
): DeadlineResult {
  const trigger = new Date(`${triggerDateISO}T00:00:00Z`);
  if (isNaN(trigger.getTime())) {
    throw new Error(`Invalid trigger date provided: ${triggerDateISO}`);
  }

  const { kind, days, includeTrigger, rollforwardIfNonCourtDay } = rule.computation;
  const skippedDays: { date: string; reason: 'weekend' | 'court_holiday' }[] = [];

  const current = new Date(trigger.getTime());
  
  // If not including trigger day (standard legal convention: exclude day of the act)
  if (!includeTrigger) {
    current.setUTCDate(current.getUTCDate() + 1);
  }

  if (kind === 'add_business_days') {
    let daysAdded = 0;
    while (daysAdded < days) {
      const curISO = formatDateISO(current);
      if (isWeekend(current)) {
        skippedDays.push({ date: curISO, reason: 'weekend' });
      } else if (isHoliday(curISO, holidays)) {
        skippedDays.push({ date: curISO, reason: 'court_holiday' });
      } else {
        daysAdded++;
      }
      if (daysAdded < days) {
        current.setUTCDate(current.getUTCDate() + 1);
      }
    }
  } else {
    // Calendar days (add_days)
    current.setUTCDate(current.getUTCDate() + (days - (includeTrigger ? 1 : 0)));
  }

  // Rollforward if landing day is a non-court day
  if (rollforwardIfNonCourtDay) {
    while (true) {
      const curISO = formatDateISO(current);
      if (isWeekend(current)) {
        skippedDays.push({ date: curISO, reason: 'weekend' });
        current.setUTCDate(current.getUTCDate() + 1);
      } else if (isHoliday(curISO, holidays)) {
        skippedDays.push({ date: curISO, reason: 'court_holiday' });
        current.setUTCDate(current.getUTCDate() + 1);
      } else {
        break;
      }
    }
  }

  const dueISO = formatDateISO(current);

  return {
    ruleId: rule.id,
    ruleTitle: rule.title,
    citation: rule.citation,
    triggerDate: triggerDateISO,
    dueDate: dueISO,
    isCourtDay: !isWeekend(current) && !isHoliday(dueISO, holidays),
    skippedDays,
    methodSummary: `${rule.computation.days} ${rule.computation.kind.replace(/_/g, ' ')} (${includeTrigger ? 'including' : 'excluding'} trigger day)${rollforwardIfNonCourtDay ? '; rolled forward past weekend/court holidays' : ''}`,
    verified: rule.verified,
    notes: rule.notes,
  };
}

export const SEED_RULES: DeadlineRule[] = [
  {
    id: "rule-fed-crim-12",
    jurisdictionId: "us-federal",
    triggerEventType: "arraignment",
    title: "Pretrial Motion Filing Deadline",
    citation: "Fed. R. Crim. P. 12(c)(1)",
    authorityId: "auth-fed-crim-rule-12",
    computation: {
      kind: "add_calendar_days_skip_weekends",
      days: 14,
      includeTrigger: false,
      rollforwardIfNonCourtDay: true,
    },
    notes: "Court may set motion schedule at initial appearance or within 14 days of arraignment.",
    effectiveFrom: "2020-01-01",
    version: 1,
    verified: true,
  },
  {
    id: "rule-speedy-trial-indictment",
    jurisdictionId: "us-federal",
    triggerEventType: "arrest",
    title: "Speedy Trial Act - Indictment Deadline",
    citation: "18 U.S.C. § 3161(b)",
    authorityId: "auth-18-usc-3161",
    computation: {
      kind: "add_days",
      days: 30,
      includeTrigger: false,
      rollforwardIfNonCourtDay: true,
    },
    notes: "Indictment or information must be filed within 30 days from date of arrest or service of summons.",
    effectiveFrom: "2020-01-01",
    version: 1,
    verified: true,
  },
  {
    id: "rule-discovery-production-az",
    jurisdictionId: "us-az",
    triggerEventType: "arraignment",
    title: "State Disclosure to Defense",
    citation: "Ariz. R. Crim. P. 15.1(a)",
    authorityId: "auth-az-crim-rule-15-1",
    computation: {
      kind: "add_days",
      days: 30,
      includeTrigger: false,
      rollforwardIfNonCourtDay: true,
    },
    notes: "Prosecutor must disclose initial police reports and witness statements within 30 days of arraignment.",
    effectiveFrom: "2021-01-01",
    version: 1,
    verified: true,
  }
];
