import { describe, it, expect } from "vitest";
import { addMinutes, isBefore } from "./time";

describe("addMinutes", () => {
  it("adds minutes within the same hour", () => {
    expect(addMinutes("14:00", 30)).toBe("14:30");
  });

  it("rolls over to the next hour", () => {
    expect(addMinutes("14:45", 30)).toBe("15:15");
  });
});

describe("isBefore", () => {
  it("compares HH:mm strings lexicographically", () => {
    expect(isBefore("09:00", "10:00")).toBe(true);
    expect(isBefore("10:00", "09:00")).toBe(false);
  });
});
