import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";
import { resetStore, getStore } from "./store";
import {
  createBooking,
  cancelAppointment,
  rescheduleAppointment,
  updatePaymentStatus,
  listAppointments,
} from "./appointments";

function seedSchedule() {
  getStore().weeklySchedule.push({
    id: "ws-1", weekday: 1, startTime: "14:00", endTime: "15:00", sessionDurationMinutes: 30,
  });
}

describe("createBooking", () => {
  beforeEach(() => {
    resetStore();
    vi.setSystemTime(new Date("2026-08-10T08:00:00")); // segunda-feira
    seedSchedule();
  });
  afterEach(() => vi.useRealTimers());

  it("creates an appointment for an available slot", () => {
    const result = createBooking({
      patientName: "Ana", patientWhatsapp: "11999999999", date: "2026-08-10", startTime: "14:00",
    });

    expect(result.ok).toBe(true);
    expect(listAppointments()).toHaveLength(1);
  });

  it("rejects a second booking for the same slot", () => {
    createBooking({ patientName: "Ana", patientWhatsapp: "11999999999", date: "2026-08-10", startTime: "14:00" });
    const second = createBooking({ patientName: "Bia", patientWhatsapp: "11888888888", date: "2026-08-10", startTime: "14:00" });

    expect(second.ok).toBe(false);
    expect(listAppointments()).toHaveLength(1);
  });

  it("rejects a slot outside the weekly schedule", () => {
    const result = createBooking({ patientName: "Ana", patientWhatsapp: "11999999999", date: "2026-08-10", startTime: "20:00" });
    expect(result.ok).toBe(false);
  });
});

describe("cancelAppointment", () => {
  beforeEach(() => {
    resetStore();
    vi.setSystemTime(new Date("2026-08-10T08:00:00"));
    seedSchedule();
  });
  afterEach(() => vi.useRealTimers());

  it("frees the slot for new bookings", () => {
    const created = createBooking({ patientName: "Ana", patientWhatsapp: "11999999999", date: "2026-08-10", startTime: "14:00" });
    if (!created.ok) throw new Error("setup failed");

    cancelAppointment(created.appointment.id);
    const second = createBooking({ patientName: "Bia", patientWhatsapp: "11888888888", date: "2026-08-10", startTime: "14:00" });

    expect(second.ok).toBe(true);
  });
});

describe("rescheduleAppointment", () => {
  beforeEach(() => {
    resetStore();
    vi.setSystemTime(new Date("2026-08-10T08:00:00"));
    seedSchedule();
  });
  afterEach(() => vi.useRealTimers());

  it("moves the appointment to a new available slot", () => {
    const created = createBooking({ patientName: "Ana", patientWhatsapp: "11999999999", date: "2026-08-10", startTime: "14:00" });
    if (!created.ok) throw new Error("setup failed");

    const result = rescheduleAppointment(created.appointment.id, "2026-08-10", "14:30");

    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.appointment.startTime).toBe("14:30");
      expect(result.appointment.status).toBe("reagendado");
    }
  });

  it("still blocks the new slot after reschedule, but frees the original slot", () => {
    const created = createBooking({ patientName: "Ana", patientWhatsapp: "11999999999", date: "2026-08-10", startTime: "14:00" });
    if (!created.ok) throw new Error("setup failed");

    const rescheduled = rescheduleAppointment(created.appointment.id, "2026-08-10", "14:30");
    if (!rescheduled.ok) throw new Error("reschedule failed");

    // The vacated original slot (14:00) should now be free.
    const bookOriginalSlot = createBooking({ patientName: "Bia", patientWhatsapp: "11888888888", date: "2026-08-10", startTime: "14:00" });
    expect(bookOriginalSlot.ok).toBe(true);

    // The new slot (14:30), now occupied by the rescheduled ("reagendado") appointment,
    // must still be blocked from a second booking.
    const bookNewSlot = createBooking({ patientName: "Carla", patientWhatsapp: "11777777777", date: "2026-08-10", startTime: "14:30" });
    expect(bookNewSlot.ok).toBe(false);
  });
});

describe("updatePaymentStatus", () => {
  beforeEach(() => {
    resetStore();
    vi.setSystemTime(new Date("2026-08-10T08:00:00"));
    seedSchedule();
  });
  afterEach(() => vi.useRealTimers());

  it("updates payment status and amount", () => {
    const created = createBooking({ patientName: "Ana", patientWhatsapp: "11999999999", date: "2026-08-10", startTime: "14:00" });
    if (!created.ok) throw new Error("setup failed");

    updatePaymentStatus(created.appointment.id, "pago", 20000);

    const [appt] = listAppointments();
    expect(appt.paymentStatus).toBe("pago");
    expect(appt.amountCents).toBe(20000);
  });
});
