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
