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

  it("handles partial blocks with strict overlap semantics (adjacent slots remain available)", () => {
    vi.setSystemTime(new Date("2026-08-10T08:00:00"));
    const store = getStore();
    store.weeklySchedule = [];
    store.weeklySchedule.push({
      id: "ws-1", weekday: 1, startTime: "14:00", endTime: "16:00", sessionDurationMinutes: 30,
    });
    // Block exactly 14:30-15:00 — should only exclude the 14:30-15:00 slot,
    // not the adjacent 14:00-14:30 slot (which ends where block starts)
    store.blockedSlots.push({ id: "b-1", date: "2026-08-10", startTime: "14:30", endTime: "15:00", reason: "Lunch" });

    const slots = getAvailableSlots("2026-08-10", 1);

    // Should return: 14:00-14:30 (adjacent, before block), NOT 14:30-15:00 (blocked), 15:00-15:30 (after block), 15:30-16:00
    expect(slots).toEqual([
      { date: "2026-08-10", startTime: "14:00", endTime: "14:30" },
      { date: "2026-08-10", startTime: "15:00", endTime: "15:30" },
      { date: "2026-08-10", startTime: "15:30", endTime: "16:00" },
    ]);
  });

  it("de-duplicates slots when multiple weekly_schedule rules overlap for the same weekday", () => {
    vi.setSystemTime(new Date("2026-08-10T08:00:00"));
    const store = getStore();
    store.weeklySchedule = [];
    // Add two overlapping rules for the same weekday — both generating the same 14:00-14:30 slot
    store.weeklySchedule.push({
      id: "ws-1", weekday: 1, startTime: "14:00", endTime: "14:30", sessionDurationMinutes: 30,
    });
    store.weeklySchedule.push({
      id: "ws-2", weekday: 1, startTime: "14:00", endTime: "14:30", sessionDurationMinutes: 30,
    });

    const slots = getAvailableSlots("2026-08-10", 1);

    // Should return exactly one slot, not two duplicates
    expect(slots).toEqual([
      { date: "2026-08-10", startTime: "14:00", endTime: "14:30" },
    ]);
    expect(slots).toHaveLength(1);
  });

  it("keeps a booked appointment excluded from availability even after a weekly-schedule change shifts the slot grid", () => {
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

    // Admin changes the rule's session duration from 30 to 20 minutes — this shifts the
    // slot grid so no slot start lines up exactly with the existing booking's 14:00 start
    // (14:20 would previously have slipped through an exact-time-equality isBooked check).
    store.weeklySchedule[0].sessionDurationMinutes = 20;

    const slots = getAvailableSlots("2026-08-10", 1);

    // The booked 14:00-14:30 range must still be fully excluded: both 14:00-14:20 and
    // 14:20-14:40 overlap it, only 14:40-15:00 should remain available.
    expect(slots).toEqual([
      { date: "2026-08-10", startTime: "14:40", endTime: "15:00" },
    ]);
  });
});
