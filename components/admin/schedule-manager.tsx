"use client";

import { WeeklyScheduleEntry } from "@/lib/data/types";
import { addScheduleEntryAction, removeScheduleEntryAction } from "@/lib/data/actions";

const WEEKDAY_LABELS = ["Domingo", "Segunda", "Terça", "Quarta", "Quinta", "Sexta", "Sábado"];

export function ScheduleManager({ schedule }: { schedule: WeeklyScheduleEntry[] }) {
  return (
    <div className="mt-4 space-y-6">
      <ul className="space-y-2">
        {schedule.map((entry) => (
          <li key={entry.id} className="flex flex-col gap-2 rounded-lg border border-slate-200 bg-white p-3 text-sm sm:flex-row sm:items-center sm:justify-between">
            <span>
              {WEEKDAY_LABELS[entry.weekday]}: {entry.startTime}–{entry.endTime} ({entry.sessionDurationMinutes} min/sessão)
            </span>
            <form action={async () => { await removeScheduleEntryAction(entry.id); }}>
              <button type="submit" className="text-sm text-red-600 underline sm:text-xs">remover</button>
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
        className="grid grid-cols-2 gap-3 rounded-lg border border-slate-200 bg-white p-4 sm:flex sm:flex-wrap sm:items-end sm:gap-2"
      >
        <div className="col-span-2 sm:col-span-1">
          <label className="block text-xs font-medium">Dia</label>
          <select name="weekday" className="w-full rounded border border-slate-300 px-2 py-2 text-sm sm:w-auto sm:py-1">
            {WEEKDAY_LABELS.map((label, i) => (
              <option key={i} value={i}>{label}</option>
            ))}
          </select>
        </div>
        <div>
          <label className="block text-xs font-medium">Início</label>
          <input type="time" name="startTime" required className="w-full rounded border border-slate-300 px-2 py-2 text-sm sm:w-auto sm:py-1" />
        </div>
        <div>
          <label className="block text-xs font-medium">Fim</label>
          <input type="time" name="endTime" required className="w-full rounded border border-slate-300 px-2 py-2 text-sm sm:w-auto sm:py-1" />
        </div>
        <div>
          <label className="block text-xs font-medium">Duração (min)</label>
          <input
            type="number"
            name="sessionDurationMinutes"
            defaultValue={50}
            min="1"
            required
            className="w-full rounded border border-slate-300 px-2 py-2 text-sm sm:w-20 sm:py-1"
          />
        </div>
        <button type="submit" className="col-span-2 rounded bg-emerald-700 px-3 py-2 text-sm font-medium text-white transition hover:bg-emerald-800 sm:col-span-1 sm:py-1.5">
          Adicionar
        </button>
      </form>
    </div>
  );
}
