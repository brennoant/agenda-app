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
          <li key={b.id} className="flex items-center justify-between rounded border p-3 text-sm">
            <span>
              {b.date} {b.startTime ? `${b.startTime}–${b.endTime}` : "(dia inteiro)"} — {b.reason}
            </span>
            <form action={async () => { await unblockSlotAction(b.id); }}>
              <button type="submit" className="text-xs text-red-600 underline">remover</button>
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
        className="flex flex-wrap items-end gap-2 rounded border p-3"
      >
        <p className="w-full text-xs text-slate-500">
          Deixe início e fim em branco para bloquear o dia inteiro, ou preencha os dois para bloquear apenas um horário.
        </p>
        <div>
          <label className="block text-xs font-medium">Data</label>
          <input type="date" name="date" required className="rounded border px-2 py-1 text-sm" />
        </div>
        <div>
          <label className="block text-xs font-medium">Início (opcional)</label>
          <input type="time" name="startTime" className="rounded border px-2 py-1 text-sm" />
        </div>
        <div>
          <label className="block text-xs font-medium">Fim (opcional)</label>
          <input type="time" name="endTime" className="rounded border px-2 py-1 text-sm" />
        </div>
        <div>
          <label className="block text-xs font-medium">Motivo</label>
          <input type="text" name="reason" placeholder="Feriado, folga..." className="rounded border px-2 py-1 text-sm" />
        </div>
        <button type="submit" className="rounded bg-emerald-700 px-3 py-1.5 text-sm text-white">Bloquear</button>
        {error && <p className="w-full text-xs text-red-600">{error}</p>}
        {warning && <p className="w-full text-xs text-amber-700">{warning}</p>}
      </form>
    </div>
  );
}
