import { getStore, generateId } from "./store";
import { WeeklyScheduleEntry, Weekday } from "./types";

export interface WeeklyScheduleInput {
  weekday: Weekday;
  startTime: string;
  endTime: string;
  sessionDurationMinutes: number;
}

export function getWeeklySchedule(): WeeklyScheduleEntry[] {
  return [...getStore().weeklySchedule].sort(
    (a, b) => a.weekday - b.weekday || a.startTime.localeCompare(b.startTime)
  );
}

// Finds the weekly-schedule rule that actually governs a given weekday + start
// time, by range-matching startTime into [r.startTime, r.endTime) rather than
// just matching on weekday. A weekday can have more than one rule (e.g. a
// morning block with shorter sessions and an afternoon block with longer
// ones), so matching on weekday alone and taking the first hit can silently
// pick the wrong rule's sessionDurationMinutes. Shared by createBooking and
// rescheduleAppointment so both derive a slot's duration the same way.
export function findRuleFor(
  weeklySchedule: WeeklyScheduleEntry[],
  weekday: number,
  startTime: string
): WeeklyScheduleEntry | undefined {
  return weeklySchedule.find(
    (r) => r.weekday === weekday && startTime >= r.startTime && startTime < r.endTime
  );
}

export function addScheduleEntry(input: WeeklyScheduleInput): WeeklyScheduleEntry {
  if (input.sessionDurationMinutes < 1) {
    throw new Error("sessionDurationMinutes must be at least 1");
  }
  const entry: WeeklyScheduleEntry = { id: generateId("ws"), ...input };
  getStore().weeklySchedule.push(entry);
  return entry;
}

export function removeScheduleEntry(id: string): boolean {
  const store = getStore();
  const idx = store.weeklySchedule.findIndex((e) => e.id === id);
  if (idx === -1) return false;
  store.weeklySchedule.splice(idx, 1);
  return true;
}
