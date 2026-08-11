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
