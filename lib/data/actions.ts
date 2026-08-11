"use server";

import { createBooking, CreateBookingInput, CreateBookingResult } from "./appointments";

export async function submitBookingAction(input: CreateBookingInput): Promise<CreateBookingResult> {
  return createBooking(input);
}
