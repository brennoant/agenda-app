import { describe, it, expect, beforeEach } from "vitest";
import { resetStore } from "./store";
import { listBlockedSlots, blockSlot, unblockSlot } from "./blocks";

describe("blocked slots", () => {
  beforeEach(() => resetStore());

  it("adds and lists blocks sorted by date", () => {
    blockSlot({ date: "2026-08-15", startTime: null, endTime: null, reason: "Feriado" });
    blockSlot({ date: "2026-08-10", startTime: "14:00", endTime: "15:00", reason: "Compromisso" });

    expect(listBlockedSlots().map((b) => b.date)).toEqual(["2026-08-10", "2026-08-15"]);
  });

  it("removes a block", () => {
    const block = blockSlot({ date: "2026-08-15", startTime: null, endTime: null, reason: "Feriado" });

    expect(unblockSlot(block.id)).toBe(true);
    expect(listBlockedSlots()).toHaveLength(0);
  });

  it("rejects a block with startTime set but endTime missing", () => {
    expect(() =>
      blockSlot({ date: "2026-08-15", startTime: "14:00", endTime: null, reason: "Feriado" })
    ).toThrow();
  });

  it("rejects a block with endTime set but startTime missing", () => {
    expect(() =>
      blockSlot({ date: "2026-08-15", startTime: null, endTime: "15:00", reason: "Feriado" })
    ).toThrow();
  });

  it("rejects a block where startTime is not before endTime", () => {
    expect(() =>
      blockSlot({ date: "2026-08-15", startTime: "15:00", endTime: "14:00", reason: "Feriado" })
    ).toThrow();
    expect(() =>
      blockSlot({ date: "2026-08-15", startTime: "14:00", endTime: "14:00", reason: "Feriado" })
    ).toThrow();
  });
});
