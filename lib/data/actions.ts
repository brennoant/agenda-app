"use server";

import { cookies } from "next/headers";
import { revalidatePath } from "next/cache";
import { isValidSessionToken } from "@/lib/auth";
import {
  createBooking,
  CreateBookingInput,
  CreateBookingResult,
  cancelAppointment,
  rescheduleAppointment,
  updatePaymentStatus,
} from "./appointments";
import { addScheduleEntry, removeScheduleEntry, WeeklyScheduleInput } from "./schedule";
import { blockSlot, unblockSlot, BlockSlotInput } from "./blocks";
import { PaymentStatus } from "./types";

async function requireAdminSession(): Promise<void> {
  const token = (await cookies()).get("admin_session")?.value;
  if (!isValidSessionToken(token)) {
    throw new Error("Unauthorized");
  }
}

export async function submitBookingAction(input: CreateBookingInput): Promise<CreateBookingResult> {
  return createBooking(input);
}

export async function cancelAppointmentAction(id: string) {
  await requireAdminSession();
  cancelAppointment(id);
  revalidatePath("/admin");
}

export async function rescheduleAppointmentAction(id: string, date: string, startTime: string) {
  await requireAdminSession();
  const result = rescheduleAppointment(id, date, startTime);
  revalidatePath("/admin");
  return result;
}

export async function updatePaymentAction(id: string, paymentStatus: PaymentStatus, amountCents: number) {
  await requireAdminSession();
  updatePaymentStatus(id, paymentStatus, amountCents);
  revalidatePath("/admin");
}

export async function addScheduleEntryAction(input: WeeklyScheduleInput) {
  await requireAdminSession();
  addScheduleEntry(input);
  revalidatePath("/admin/disponibilidade");
}

export async function removeScheduleEntryAction(id: string) {
  await requireAdminSession();
  removeScheduleEntry(id);
  revalidatePath("/admin/disponibilidade");
}

export async function blockSlotAction(input: BlockSlotInput) {
  await requireAdminSession();
  blockSlot(input);
  revalidatePath("/admin/bloqueios");
  revalidatePath("/agendar");
}

export async function unblockSlotAction(id: string) {
  await requireAdminSession();
  unblockSlot(id);
  revalidatePath("/admin/bloqueios");
  revalidatePath("/agendar");
}
