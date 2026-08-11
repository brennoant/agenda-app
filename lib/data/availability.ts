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
  const slots: AvailableSlot[] = [];

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

        const isBlocked = store.blockedSlots.some((b) => {
          if (b.date !== dateStr) return false;
          if (b.startTime === null) return true;
          return !(isBefore(slotEnd, b.startTime) || isBefore(b.endTime!, cursor));
        });

        const isBooked = store.appointments.some(
          (a) => a.date === dateStr && a.startTime === cursor && a.status === "agendado"
        );

        if (!isPast && !isBlocked && !isBooked) {
          slots.push({ date: dateStr, startTime: cursor, endTime: slotEnd });
        }

        cursor = slotEnd;
      }
    }
  }

  return slots;
}
