import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";
import { resetStore, getStore } from "./store";
import { getAvailableSlots } from "./availability";

describe("getAvailableSlots", () => {
  beforeEach(() => resetStore());
  afterEach(() => vi.useRealTimers());

  it("returns slots generated from the weekly schedule", () => {
    vi.setSystemTime(new Date("2026-08-10T08:00:00")); // segunda-feira
    const store = getStore();
    store.weeklySchedule = [];
    store.weeklySchedule.push({
      id: "ws-1", weekday: 1, startTime: "14:00", endTime: "15:00", sessionDurationMinutes: 30,
    });

    const slots = getAvailableSlots("2026-08-10", 1);

    expect(slots).toEqual([
      { date: "2026-08-10", startTime: "14:00", endTime: "14:30" },
      { date: "2026-08-10", startTime: "14:30", endTime: "15:00" },
    ]);
  });

  it("excludes slots covered by a full-day block", () => {
    vi.setSystemTime(new Date("2026-08-10T08:00:00"));
    const store = getStore();
    store.weeklySchedule = [];
    store.weeklySchedule.push({
      id: "ws-1", weekday: 1, startTime: "14:00", endTime: "15:00", sessionDurationMinutes: 30,
    });
    store.blockedSlots.push({ id: "b-1", date: "2026-08-10", startTime: null, endTime: null, reason: "Feriado" });

    expect(getAvailableSlots("2026-08-10", 1)).toEqual([]);
  });

  it("excludes slots already booked", () => {
    vi.setSystemTime(new Date("2026-08-10T08:00:00"));
    const store = getStore();
    store.weeklySchedule = [];
    store.weeklySchedule.push({
      id: "ws-1", weekday: 1, startTime: "14:00", endTime: "15:00", sessionDurationMinutes: 30,
    });
    store.appointments.push({
      id: "a-1", patientName: "Ana", patientWhatsapp: "11999999999",
      date: "2026-08-10", startTime: "14:00", endTime: "14:30",
      status: "agendado", paymentStatus: "pendente", amountCents: 0, createdAt: new Date().toISOString(),
    });

    expect(getAvailableSlots("2026-08-10", 1)).toEqual([
      { date: "2026-08-10", startTime: "14:30", endTime: "15:00" },
    ]);
  });

  it("excludes slots that are already in the past", () => {
    vi.setSystemTime(new Date("2026-08-10T14:15:00")); // já passou das 14:00
    const store = getStore();
    store.weeklySchedule = [];
    store.weeklySchedule.push({
      id: "ws-1", weekday: 1, startTime: "14:00", endTime: "15:00", sessionDurationMinutes: 30,
    });

    expect(getAvailableSlots("2026-08-10", 1)).toEqual([
      { date: "2026-08-10", startTime: "14:30", endTime: "15:00" },
    ]);
  });
});
