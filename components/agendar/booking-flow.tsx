"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { AvailableSlot } from "@/lib/data/types";
import { submitBookingAction } from "@/lib/data/actions";

function formatDate(date: string) {
  const d = new Date(date + "T00:00:00");
  return d.toLocaleDateString("pt-BR", { weekday: "long", day: "2-digit", month: "long" });
}

export function BookingFlow({ slots }: { slots: AvailableSlot[] }) {
  const router = useRouter();
  const [selected, setSelected] = useState<AvailableSlot | null>(null);
  const [name, setName] = useState("");
  const [whatsapp, setWhatsapp] = useState("");
  const [confirmed, setConfirmed] = useState<AvailableSlot | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const byDate = slots.reduce<Record<string, AvailableSlot[]>>((acc, slot) => {
    (acc[slot.date] ??= []).push(slot);
    return acc;
  }, {});

  if (confirmed) {
    return (
      <div className="mt-8 rounded-lg border border-emerald-200 bg-white p-6">
        <h2 className="text-lg font-semibold text-emerald-900">Consulta confirmada!</h2>
        <p className="mt-2 text-emerald-800">
          {formatDate(confirmed.date)} às {confirmed.startTime}
        </p>
        <p className="mt-4 text-sm text-emerald-700">
          Você receberá contato pelo WhatsApp informado para confirmar os detalhes.
        </p>
      </div>
    );
  }

  if (selected) {
    return (
      <form
        className="mt-8 space-y-4 rounded-lg border border-emerald-200 bg-white p-6"
        onSubmit={async (e) => {
          e.preventDefault();
          setSubmitting(true);
          setError(null);
          const result = await submitBookingAction({
            patientName: name,
            patientWhatsapp: whatsapp,
            date: selected.date,
            startTime: selected.startTime,
          });
          setSubmitting(false);
          if (!result.ok) {
            setError("Esse horário acabou de ser ocupado. Escolha outro, por favor.");
            setSelected(null);
            router.refresh();
            return;
          }
          setConfirmed(selected);
        }}
      >
        <p className="text-sm text-emerald-800">
          Horário escolhido: <strong>{formatDate(selected.date)} às {selected.startTime}</strong>
        </p>
        <div>
          <label className="text-sm font-medium text-emerald-900">Seu nome</label>
          <input
            required
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="mt-1 w-full rounded-md border px-3 py-2 text-sm"
          />
        </div>
        <div>
          <label className="text-sm font-medium text-emerald-900">Seu WhatsApp</label>
          <input
            required
            value={whatsapp}
            onChange={(e) => setWhatsapp(e.target.value)}
            placeholder="(11) 91234-5678"
            className="mt-1 w-full rounded-md border px-3 py-2 text-sm"
          />
        </div>
        <div className="flex gap-2">
          <button type="button" onClick={() => setSelected(null)} className="rounded-md border px-4 py-2 text-sm">
            Voltar
          </button>
          <button
            type="submit"
            disabled={submitting}
            className="rounded-md bg-emerald-700 px-4 py-2 text-sm font-medium text-white disabled:opacity-50"
          >
            {submitting ? "Confirmando..." : "Confirmar agendamento"}
          </button>
        </div>
      </form>
    );
  }

  return (
    <div className="mt-8 space-y-6">
      {error && <p className="rounded-md bg-red-50 p-3 text-sm text-red-700">{error}</p>}
      {Object.keys(byDate).length === 0 && (
        <p className="text-emerald-700">Nenhum horário disponível nos próximos dias.</p>
      )}
      {Object.entries(byDate).map(([date, daySlots]) => (
        <div key={date}>
          <h3 className="text-sm font-medium capitalize text-emerald-900">{formatDate(date)}</h3>
          <div className="mt-2 flex flex-wrap gap-2">
            {daySlots.map((slot) => (
              <button
                key={slot.startTime}
                onClick={() => setSelected(slot)}
                className="rounded-md border border-emerald-300 bg-white px-3 py-1.5 text-sm text-emerald-800 hover:bg-emerald-100"
              >
                {slot.startTime}
              </button>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}
