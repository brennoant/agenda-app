import { describe, it, expect, beforeEach } from "vitest";
import { resetStore } from "./store";
import { getWeeklySchedule, addScheduleEntry, removeScheduleEntry } from "./schedule";

describe("weekly schedule", () => {
  beforeEach(() => resetStore());

  it("adds and lists entries sorted by weekday", () => {
    addScheduleEntry({ weekday: 3, startTime: "10:00", endTime: "12:00", sessionDurationMinutes: 50 });
    addScheduleEntry({ weekday: 1, startTime: "14:00", endTime: "18:00", sessionDurationMinutes: 50 });

    const schedule = getWeeklySchedule().filter((e) => !e.id.startsWith("ws-seed"));

    expect(schedule.map((e) => e.weekday)).toEqual([1, 3]);
  });

  it("removes an entry", () => {
    const entry = addScheduleEntry({ weekday: 1, startTime: "14:00", endTime: "18:00", sessionDurationMinutes: 50 });

    expect(removeScheduleEntry(entry.id)).toBe(true);
    expect(getWeeklySchedule().some((e) => e.id === entry.id)).toBe(false);
  });

  it("returns false when removing an unknown id", () => {
    expect(removeScheduleEntry("does-not-exist")).toBe(false);
  });
});
