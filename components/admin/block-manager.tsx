"use client";

import { useState } from "react";
import { BlockedSlot } from "@/lib/data/types";
import { blockSlotAction, unblockSlotAction } from "@/lib/data/actions";

export function BlockManager({ blocks }: { blocks: BlockedSlot[] }) {
  const [error, setError] = useState<string | null>(null);
  const [warning, setWarning] = useState<string | null>(null);

  return (
    <div className="mt-4 space-y-6">
      <ul className="space-y-2">
        {blocks.map((b) => (
          <li key={b.id} className="flex flex-col gap-2 rounded-lg border border-slate-200 bg-white p-3 text-sm sm:flex-row sm:items-center sm:justify-between">
            <span>
              {b.date} {b.startTime ? `${b.startTime}–${b.endTime}` : "(dia inteiro)"} — {b.reason}
            </span>
            <form action={async () => { await unblockSlotAction(b.id); }}>
              <button type="submit" className="text-sm text-red-600 underline sm:text-xs">remover</button>
            </form>
          </li>
        ))}
      </ul>

      <form
        action={async (formData) => {
          const startTime = String(formData.get("startTime") || "") || null;
          const endTime = String(formData.get("endTime") || "") || null;

          // Início e fim devem ser preenchidos juntos (bloqueio parcial) ou deixados
          // ambos em branco (bloqueio do dia inteiro). Um preenchido e o outro não
          // resulta em dado ambíguo: lib/data/blocks.ts rejeita essa combinação no
          // servidor, mas validamos aqui antes para dar feedback imediato ao usuário.
          if ((startTime === null) !== (endTime === null)) {
            setError("Preencha início e fim juntos, ou deixe os dois em branco para bloquear o dia inteiro.");
            return;
          }
          if (startTime !== null && endTime !== null && startTime >= endTime) {
            setError("O horário de início deve ser antes do horário de fim.");
            return;
          }

          setError(null);
          setWarning(null);
          const result = await blockSlotAction({
            date: String(formData.get("date")),
            startTime,
            endTime,
            reason: String(formData.get("reason")),
          });
          if (result.affectedAppointments.length > 0) {
            setWarning(
              `Atenção: ${result.affectedAppointments.length} consulta(s) já marcada(s) nesse período — elas não foram canceladas automaticamente.`
            );
          }
        }}
        className="grid grid-cols-2 gap-3 rounded-lg border border-slate-200 bg-white p-4 sm:flex sm:flex-wrap sm:items-end sm:gap-2"
      >
        <p className="col-span-2 text-xs text-slate-500">
          Deixe início e fim em branco para bloquear o dia inteiro, ou preencha os dois para bloquear apenas um horário.
        </p>
        <div className="col-span-2 sm:col-span-1">
          <label className="block text-xs font-medium">Data</label>
          <input type="date" name="date" required className="w-full rounded border border-slate-300 px-2 py-2 text-sm sm:w-auto sm:py-1" />
        </div>
        <div>
          <label className="block text-xs font-medium">Início (opcional)</label>
          <input type="time" name="startTime" className="w-full rounded border border-slate-300 px-2 py-2 text-sm sm:w-auto sm:py-1" />
        </div>
        <div>
          <label className="block text-xs font-medium">Fim (opcional)</label>
          <input type="time" name="endTime" className="w-full rounded border border-slate-300 px-2 py-2 text-sm sm:w-auto sm:py-1" />
        </div>
        <div className="col-span-2 sm:col-span-1">
          <label className="block text-xs font-medium">Motivo</label>
          <input
            type="text"
            name="reason"
            placeholder="Feriado, folga..."
            className="w-full rounded border border-slate-300 px-2 py-2 text-sm sm:w-auto sm:py-1"
          />
        </div>
        <button type="submit" className="col-span-2 rounded bg-emerald-700 px-3 py-2 text-sm font-medium text-white transition hover:bg-emerald-800 sm:col-span-1 sm:py-1.5">
          Bloquear
        </button>
        {error && <p className="col-span-2 text-xs text-red-600">{error}</p>}
        {warning && <p className="col-span-2 text-xs text-amber-700">{warning}</p>}
      </form>
    </div>
  );
}
