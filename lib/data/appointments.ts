import { getStore, generateId } from "./store";
import { Appointment, PaymentStatus } from "./types";
import { getAvailableSlots } from "./availability";
import { addMinutes } from "./time";

export interface CreateBookingInput {
  patientName: string;
  patientWhatsapp: string;
  date: string;
  startTime: string;
}

export type CreateBookingResult =
  | { ok: true; appointment: Appointment }
  | { ok: false; error: "SLOT_UNAVAILABLE" };

export function createBooking(input: CreateBookingInput): CreateBookingResult {
  const store = getStore();
  const weekday = new Date(input.date + "T00:00:00").getDay();

  const rule = store.weeklySchedule.find(
    (r) => r.weekday === weekday && input.startTime >= r.startTime && input.startTime < r.endTime
  );
  if (!rule) return { ok: false, error: "SLOT_UNAVAILABLE" };

  const isAvailable = getAvailableSlots(input.date, 1).some(
    (s) => s.date === input.date && s.startTime === input.startTime
  );
  if (!isAvailable) return { ok: false, error: "SLOT_UNAVAILABLE" };

  const appointment: Appointment = {
    id: generateId("appt"),
    patientName: input.patientName,
    patientWhatsapp: input.patientWhatsapp,
    date: input.date,
    startTime: input.startTime,
    endTime: addMinutes(input.startTime, rule.sessionDurationMinutes),
    status: "agendado",
    paymentStatus: "pendente",
    amountCents: 0,
    createdAt: new Date().toISOString(),
  };

  store.appointments.push(appointment);
  return { ok: true, appointment };
}

export function listAppointments(): Appointment[] {
  return [...getStore().appointments].sort((a, b) =>
    a.date === b.date ? a.startTime.localeCompare(b.startTime) : a.date.localeCompare(b.date)
  );
}

export function cancelAppointment(id: string): boolean {
  const appt = getStore().appointments.find((a) => a.id === id);
  if (!appt) return false;
  appt.status = "cancelado";
  return true;
}

export function rescheduleAppointment(id: string, newDate: string, newStartTime: string): CreateBookingResult {
  const store = getStore();
  const appt = store.appointments.find((a) => a.id === id);
  if (!appt) return { ok: false, error: "SLOT_UNAVAILABLE" };

  const previousStatus = appt.status;
  appt.status = "cancelado"; // libera o horário atual antes de checar o novo

  const isAvailable = getAvailableSlots(newDate, 1).some(
    (s) => s.date === newDate && s.startTime === newStartTime
  );
  if (!isAvailable) {
    appt.status = previousStatus;
    return { ok: false, error: "SLOT_UNAVAILABLE" };
  }

  const weekday = new Date(newDate + "T00:00:00").getDay();
  const rule = store.weeklySchedule.find((r) => r.weekday === weekday);
  const duration = rule ? rule.sessionDurationMinutes : 50;

  appt.date = newDate;
  appt.startTime = newStartTime;
  appt.endTime = addMinutes(newStartTime, duration);
  appt.status = "reagendado";

  return { ok: true, appointment: appt };
}

export function updatePaymentStatus(id: string, paymentStatus: PaymentStatus, amountCents: number): boolean {
  const appt = getStore().appointments.find((a) => a.id === id);
  if (!appt) return false;
  appt.paymentStatus = paymentStatus;
  appt.amountCents = amountCents;
  return true;
}
