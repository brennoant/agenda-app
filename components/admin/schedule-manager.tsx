"use client";

import { WeeklyScheduleEntry } from "@/lib/data/types";
import { addScheduleEntryAction, removeScheduleEntryAction } from "@/lib/data/actions";

const WEEKDAY_LABELS = ["Domingo", "Segunda", "Terça", "Quarta", "Quinta", "Sexta", "Sábado"];

export function ScheduleManager({ schedule }: { schedule: WeeklyScheduleEntry[] }) {
  return (
    <div className="mt-4 space-y-6">
      <ul className="space-y-2">
        {schedule.map((entry) => (
          <li key={entry.id} className="flex items-center justify-between rounded border p-3 text-sm">
            <span>
              {WEEKDAY_LABELS[entry.weekday]}: {entry.startTime}–{entry.endTime} ({entry.sessionDurationMinutes} min/sessão)
            </span>
            <form action={async () => { await removeScheduleEntryAction(entry.id); }}>
              <button type="submit" className="text-xs text-red-600 underline">remover</button>
            </form>
          </li>
        ))}
      </ul>

      <form
        action={async (formData) => {
          await addScheduleEntryAction({
            weekday: Number(formData.get("weekday")) as 0 | 1 | 2 | 3 | 4 | 5 | 6,
            startTime: String(formData.get("startTime")),
            endTime: String(formData.get("endTime")),
            sessionDurationMinutes: Number(formData.get("sessionDurationMinutes")),
          });
        }}
        className="flex flex-wrap items-end gap-2 rounded border p-3"
      >
        <div>
          <label className="block text-xs font-medium">Dia</label>
          <select name="weekday" className="rounded border px-2 py-1 text-sm">
            {WEEKDAY_LABELS.map((label, i) => (
              <option key={i} value={i}>{label}</option>
            ))}
          </select>
        </div>
        <div>
          <label className="block text-xs font-medium">Início</label>
          <input type="time" name="startTime" required className="rounded border px-2 py-1 text-sm" />
        </div>
        <div>
          <label className="block text-xs font-medium">Fim</label>
          <input type="time" name="endTime" required className="rounded border px-2 py-1 text-sm" />
        </div>
        <div>
          <label className="block text-xs font-medium">Duração (min)</label>
          <input type="number" name="sessionDurationMinutes" defaultValue={50} required className="w-20 rounded border px-2 py-1 text-sm" />
        </div>
        <button type="submit" className="rounded bg-emerald-700 px-3 py-1.5 text-sm text-white">Adicionar</button>
      </form>
    </div>
  );
}
