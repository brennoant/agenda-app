import { getStore, generateId } from "./store";
import { BlockedSlot, Appointment } from "./types";
import { isBefore } from "./time";

export interface BlockSlotInput {
  date: string;
  startTime: string | null;
  endTime: string | null;
  reason: string;
}

export interface BlockSlotResult {
  block: BlockedSlot;
  // Non-cancelled appointments that overlap the newly-created block. Per spec,
  // blocking a date/time that already has an appointment must warn the
  // psychologist, not silently remove the appointment — the caller is
  // responsible for surfacing this list/count as a warning.
  affectedAppointments: Appointment[];
}

export function listBlockedSlots(): BlockedSlot[] {
  return [...getStore().blockedSlots].sort((a, b) => a.date.localeCompare(b.date));
}

export function blockSlot(input: BlockSlotInput): BlockSlotResult {
  // startTime/endTime must be both null (full-day block) or both set (partial-range
  // block) — never just one. availability.ts's isBlocked check special-cases
  // startTime === null as "full day" and otherwise does
  // `isBefore(cursor, b.endTime!) && isBefore(b.startTime, slotEnd)`, using a non-null
  // assertion on endTime. A block with startTime set but endTime null would silently
  // never match (isBefore(x, null) compares NaN < 0, i.e. always false — the block
  // would be stored but block nothing). A block with startTime null but endTime set
  // would hit the `startTime === null` branch and silently block the *entire* day
  // instead of the intended partial range. Reject the ambiguous combination here, at
  // the single write path into the store, rather than let either silently-wrong
  // behavior reach the schedule.
  if ((input.startTime === null) !== (input.endTime === null)) {
    throw new Error("startTime and endTime must be provided together, or both left empty for a full-day block");
  }
  if (input.startTime !== null && input.endTime !== null && !(input.startTime < input.endTime)) {
    throw new Error("startTime must be before endTime");
  }
  const block: BlockedSlot = { id: generateId("block"), ...input };
  getStore().blockedSlots.push(block);

  // Find existing non-cancelled appointments that overlap the range just blocked.
  // Blocking does not remove them (per spec) — the caller must warn about this.
  const affectedAppointments = getStore().appointments.filter((a) => {
    if (a.date !== block.date || a.status === "cancelado") return false;
    if (block.startTime === null) return true; // full-day block overlaps any time
    return isBefore(block.startTime, a.endTime) && isBefore(a.startTime, block.endTime!);
  });

  return { block, affectedAppointments };
}

export function unblockSlot(id: string): boolean {
  const store = getStore();
  const idx = store.blockedSlots.findIndex((b) => b.id === id);
  if (idx === -1) return false;
  store.blockedSlots.splice(idx, 1);
  return true;
}
