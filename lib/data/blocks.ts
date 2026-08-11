import { getStore, generateId } from "./store";
import { BlockedSlot } from "./types";

export interface BlockSlotInput {
  date: string;
  startTime: string | null;
  endTime: string | null;
  reason: string;
}

export function listBlockedSlots(): BlockedSlot[] {
  return [...getStore().blockedSlots].sort((a, b) => a.date.localeCompare(b.date));
}

export function blockSlot(input: BlockSlotInput): BlockedSlot {
  const block: BlockedSlot = { id: generateId("block"), ...input };
  getStore().blockedSlots.push(block);
  return block;
}

export function unblockSlot(id: string): boolean {
  const store = getStore();
  const idx = store.blockedSlots.findIndex((b) => b.id === id);
  if (idx === -1) return false;
  store.blockedSlots.splice(idx, 1);
  return true;
}
