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
      <div className="mt-6 rounded-xl border border-emerald-200 bg-white p-5 shadow-sm sm:mt-8 sm:p-6">
        <h2 className="font-display text-xl font-medium text-emerald-950 sm:text-2xl">Consulta confirmada!</h2>
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
        className="mt-6 space-y-4 rounded-xl border border-emerald-200 bg-white p-5 shadow-sm sm:mt-8 sm:p-6"
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
            className="mt-1 w-full rounded-md border border-emerald-200 px-3 py-2.5 text-base text-emerald-950 focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 focus:outline-none sm:py-2 sm:text-sm"
          />
        </div>
        <div>
          <label className="text-sm font-medium text-emerald-900">Seu WhatsApp</label>
          <input
            required
            value={whatsapp}
            onChange={(e) => setWhatsapp(e.target.value)}
            placeholder="(11) 91234-5678"
            className="mt-1 w-full rounded-md border border-emerald-200 px-3 py-2.5 text-base text-emerald-950 focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 focus:outline-none sm:py-2 sm:text-sm"
          />
        </div>
        <div className="flex flex-col gap-2 sm:flex-row">
          <button
            type="button"
            onClick={() => setSelected(null)}
            className="order-2 rounded-md border border-emerald-200 px-4 py-2.5 text-sm text-emerald-800 sm:order-1"
          >
            Voltar
          </button>
          <button
            type="submit"
            disabled={submitting}
            className="order-1 rounded-md bg-emerald-700 px-4 py-2.5 text-sm font-medium text-white transition hover:bg-emerald-800 disabled:opacity-50 sm:order-2"
          >
            {submitting ? "Confirmando..." : "Confirmar agendamento"}
          </button>
        </div>
      </form>
    );
  }

  return (
    <div className="mt-6 space-y-6 sm:mt-8">
      {error && <p className="rounded-md bg-red-50 p-3 text-sm text-red-700">{error}</p>}
      {Object.keys(byDate).length === 0 && (
        <p className="text-emerald-700">Nenhum horário disponível nos próximos dias.</p>
      )}
      {Object.entries(byDate).map(([date, daySlots]) => (
        <div key={date}>
          <h3 className="text-sm font-medium capitalize text-emerald-900">{formatDate(date)}</h3>
          <div className="mt-2 grid grid-cols-3 gap-2 sm:flex sm:flex-wrap">
            {daySlots.map((slot) => (
              <button
                key={slot.startTime}
                onClick={() => setSelected(slot)}
                className="rounded-md border border-emerald-300 bg-white px-3 py-2.5 text-sm font-medium text-emerald-800 transition hover:border-emerald-400 hover:bg-emerald-100 sm:py-2 sm:font-normal"
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
