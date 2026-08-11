import { describe, it, expect, beforeEach } from "vitest";
import { resetStore, getStore } from "./store";
import { listBlockedSlots, blockSlot, unblockSlot } from "./blocks";

describe("blocked slots", () => {
  beforeEach(() => resetStore());

  it("adds and lists blocks sorted by date", () => {
    blockSlot({ date: "2026-08-15", startTime: null, endTime: null, reason: "Feriado" });
    blockSlot({ date: "2026-08-10", startTime: "14:00", endTime: "15:00", reason: "Compromisso" });

    expect(listBlockedSlots().map((b) => b.date)).toEqual(["2026-08-10", "2026-08-15"]);
  });

  it("removes a block", () => {
    const { block } = blockSlot({ date: "2026-08-15", startTime: null, endTime: null, reason: "Feriado" });

    expect(unblockSlot(block.id)).toBe(true);
    expect(listBlockedSlots()).toHaveLength(0);
  });

  it("reports no affected appointments when blocking an empty range", () => {
    const { affectedAppointments } = blockSlot({ date: "2026-08-15", startTime: null, endTime: null, reason: "Feriado" });
    expect(affectedAppointments).toHaveLength(0);
  });

  it("reports affected appointments when blocking a range that already has a non-cancelled appointment", () => {
    getStore().appointments.push({
      id: "a-1", patientName: "Ana", patientWhatsapp: "11999999999",
      date: "2026-08-15", startTime: "14:00", endTime: "14:30",
      status: "agendado", paymentStatus: "pendente", amountCents: 0, createdAt: new Date().toISOString(),
    });

    const { affectedAppointments } = blockSlot({ date: "2026-08-15", startTime: "14:15", endTime: "15:00", reason: "Feriado" });

    expect(affectedAppointments).toHaveLength(1);
    expect(affectedAppointments[0].id).toBe("a-1");
  });

  it("does not report a cancelled appointment as affected", () => {
    getStore().appointments.push({
      id: "a-1", patientName: "Ana", patientWhatsapp: "11999999999",
      date: "2026-08-15", startTime: "14:00", endTime: "14:30",
      status: "cancelado", paymentStatus: "pendente", amountCents: 0, createdAt: new Date().toISOString(),
    });

    const { affectedAppointments } = blockSlot({ date: "2026-08-15", startTime: "14:00", endTime: "14:30", reason: "Feriado" });

    expect(affectedAppointments).toHaveLength(0);
  });

  it("reports affected appointments on a full-day block", () => {
    getStore().appointments.push({
      id: "a-1", patientName: "Ana", patientWhatsapp: "11999999999",
      date: "2026-08-15", startTime: "09:00", endTime: "09:30",
      status: "reagendado", paymentStatus: "pendente", amountCents: 0, createdAt: new Date().toISOString(),
    });

    const { affectedAppointments } = blockSlot({ date: "2026-08-15", startTime: null, endTime: null, reason: "Feriado" });

    expect(affectedAppointments).toHaveLength(1);
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
