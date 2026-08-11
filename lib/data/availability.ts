import { getStore } from "./store";
import { AvailableSlot } from "./types";
import { addMinutes, isBefore } from "./time";

function dateToWeekday(dateStr: string): number {
  const [y, m, d] = dateStr.split("-").map(Number);
  return new Date(y, m - 1, d).getDay();
}

export function getAvailableSlots(fromDate: string, days: number): AvailableSlot[] {
  const store = getStore();
  const now = new Date();
  // Use Map to de-duplicate slots by (date, startTime) — defends against overlapping
  // weekly_schedule rules for the same weekday accidentally producing duplicate slots.
  const slotsMap = new Map<string, AvailableSlot>();

  for (let i = 0; i < days; i++) {
    const date = new Date(fromDate + "T00:00:00");
    date.setDate(date.getDate() + i);
    const dateStr = date.toISOString().slice(0, 10);
    const weekday = dateToWeekday(dateStr);

    const dayRules = store.weeklySchedule.filter((r) => r.weekday === weekday);

    for (const rule of dayRules) {
      let cursor = rule.startTime;
      while (isBefore(cursor, rule.endTime)) {
        const slotEnd = addMinutes(cursor, rule.sessionDurationMinutes);
        if (isBefore(rule.endTime, slotEnd)) break;

        const slotDateTime = new Date(`${dateStr}T${cursor}:00`);
        const isPast = slotDateTime.getTime() <= now.getTime();

        // Strict half-open interval overlap: slot [cursor, slotEnd) overlaps block [start, end)
        // iff cursor < end AND start < slotEnd. This ensures adjacent (touching) slots are NOT
        // incorrectly marked as overlapping — e.g., if a block is 14:30-15:00, then slot 14:00-14:30
        // (which ends exactly where the block starts) remains available.
        const isBlocked = store.blockedSlots.some((b) => {
          if (b.date !== dateStr) return false;
          if (b.startTime === null) return true;
          return isBefore(cursor, b.endTime!) && isBefore(b.startTime, slotEnd);
        });

        // Any non-cancelled appointment occupies its slot — this includes "reagendado"
        // (rescheduled appointments must still block their new slot), not just "agendado".
        // Uses the same half-open interval overlap as isBlocked above (not exact-time
        // equality) so a booking stays correctly excluded even if the weekly schedule
        // changes later and shifts the slot grid so no slot start lines up exactly with
        // the appointment's original startTime.
        const isBooked = store.appointments.some(
          (a) =>
            a.date === dateStr &&
            a.status !== "cancelado" &&
            isBefore(cursor, a.endTime) &&
            isBefore(a.startTime, slotEnd)
        );

        if (!isPast && !isBlocked && !isBooked) {
          const key = `${dateStr}|${cursor}`;
          slotsMap.set(key, { date: dateStr, startTime: cursor, endTime: slotEnd });
        }

        cursor = slotEnd;
      }
    }
  }

  return Array.from(slotsMap.values());
}
