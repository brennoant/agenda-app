import { describe, it, expect, beforeEach } from "vitest";
import { getStore, resetStore, generateId } from "./store";

describe("store", () => {
  beforeEach(() => resetStore());

  it("seeds a default weekly schedule and empty appointments/blocks", () => {
    const store = getStore();
    expect(store.weeklySchedule.length).toBeGreaterThan(0);
    expect(store.appointments).toEqual([]);
    expect(store.blockedSlots).toEqual([]);
  });

  it("returns the same store instance across calls", () => {
    expect(getStore()).toBe(getStore());
  });

  it("generateId produces unique ids", () => {
    expect(generateId("x")).not.toBe(generateId("x"));
  });
});
