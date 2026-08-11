"use server";

import { revalidatePath } from "next/cache";
import {
  createBooking,
  CreateBookingInput,
  CreateBookingResult,
  cancelAppointment,
  rescheduleAppointment,
  updatePaymentStatus,
} from "./appointments";
import { addScheduleEntry, removeScheduleEntry, WeeklyScheduleInput } from "./schedule";
import { PaymentStatus } from "./types";

export async function submitBookingAction(input: CreateBookingInput): Promise<CreateBookingResult> {
  return createBooking(input);
}

export async function cancelAppointmentAction(id: string) {
  cancelAppointment(id);
  revalidatePath("/admin");
}

export async function rescheduleAppointmentAction(id: string, date: string, startTime: string) {
  const result = rescheduleAppointment(id, date, startTime);
  revalidatePath("/admin");
  return result;
}

export async function updatePaymentAction(id: string, paymentStatus: PaymentStatus, amountCents: number) {
  updatePaymentStatus(id, paymentStatus, amountCents);
  revalidatePath("/admin");
}

export async function addScheduleEntryAction(input: WeeklyScheduleInput) {
  addScheduleEntry(input);
  revalidatePath("/admin/disponibilidade");
}

export async function removeScheduleEntryAction(id: string) {
  removeScheduleEntry(id);
  revalidatePath("/admin/disponibilidade");
}
