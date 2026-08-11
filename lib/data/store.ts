import { WeeklyScheduleEntry, BlockedSlot, Appointment } from "./types";

interface Store {
  weeklySchedule: WeeklyScheduleEntry[];
  blockedSlots: BlockedSlot[];
  appointments: Appointment[];
}

function createSeedStore(): Store {
  return {
    weeklySchedule: [
      { id: "ws-seed-1", weekday: 1, startTime: "14:00", endTime: "18:00", sessionDurationMinutes: 50 },
      { id: "ws-seed-2", weekday: 3, startTime: "14:00", endTime: "18:00", sessionDurationMinutes: 50 },
      { id: "ws-seed-3", weekday: 5, startTime: "09:00", endTime: "12:00", sessionDurationMinutes: 50 },
    ],
    blockedSlots: [],
    appointments: [],
  };
}

declare global {
  // eslint-disable-next-line no-var
  var __agendaStore: Store | undefined;
}

export function getStore(): Store {
  if (!globalThis.__agendaStore) {
    globalThis.__agendaStore = createSeedStore();
  }
  return globalThis.__agendaStore;
}

export function resetStore(): void {
  globalThis.__agendaStore = createSeedStore();
}

let idCounter = 0;
export function generateId(prefix: string): string {
  idCounter += 1;
  return `${prefix}-${Date.now()}-${idCounter}`;
}
