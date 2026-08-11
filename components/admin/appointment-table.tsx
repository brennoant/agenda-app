"use client";

import { useState } from "react";
import { Appointment } from "@/lib/data/types";
import { cancelAppointmentAction, rescheduleAppointmentAction, updatePaymentAction } from "@/lib/data/actions";

function formatMoney(cents: number) {
  return (cents / 100).toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
}

const STATUS_BADGE: Record<Appointment["status"], string> = {
  agendado: "bg-emerald-50 text-emerald-700 border-emerald-200",
  reagendado: "bg-amber-50 text-amber-700 border-amber-200",
  cancelado: "bg-slate-100 text-slate-500 border-slate-200",
};

function StatusBadge({ status }: { status: Appointment["status"] }) {
  return (
    <span className={`inline-block rounded-full border px-2 py-0.5 text-xs font-medium whitespace-nowrap ${STATUS_BADGE[status]}`}>
      {status}
    </span>
  );
}

function PaymentForm({ appt, compact = false }: { appt: Appointment; compact?: boolean }) {
  return (
    <form
      action={async (formData) => {
        await updatePaymentAction(
          appt.id,
          formData.get("paymentStatus") as "pago" | "pendente",
          Number(formData.get("amountCents")) || 0
        );
      }}
      className={compact ? "flex flex-wrap items-center gap-1.5" : "flex items-center gap-1"}
    >
      <select
        name="paymentStatus"
        defaultValue={appt.paymentStatus}
        className={compact ? "rounded border border-slate-300 px-2 py-1.5 text-sm" : "rounded border px-1 py-0.5 text-xs"}
      >
        <option value="pendente">pendente</option>
        <option value="pago">pago</option>
      </select>
      <input
        name="amountCents"
        type="number"
        defaultValue={appt.amountCents}
        className={compact ? "w-24 rounded border border-slate-300 px-2 py-1.5 text-sm" : "w-20 rounded border px-1 py-0.5 text-xs"}
      />
      <button type="submit" className={compact ? "text-sm font-medium text-emerald-700 underline" : "text-xs text-emerald-700 underline"}>
        salvar
      </button>
    </form>
  );
}

function RescheduleForm({
  appt,
  compact = false,
  error,
  onResult,
}: {
  appt: Appointment;
  compact?: boolean;
  error?: string;
  onResult: (message: string | null) => void;
}) {
  return (
    <div>
      <form
        action={async (formData) => {
          const result = await rescheduleAppointmentAction(
            appt.id,
            String(formData.get("date")),
            String(formData.get("startTime"))
          );
          onResult(result.ok ? null : "Esse horário não está disponível.");
        }}
        className={compact ? "flex flex-wrap items-center gap-1.5" : "flex items-center gap-1"}
      >
        <input
          type="date"
          name="date"
          required
          className={compact ? "rounded border border-slate-300 px-2 py-1.5 text-sm" : "rounded border px-1 py-0.5 text-xs"}
        />
        <input
          type="time"
          name="startTime"
          required
          className={compact ? "rounded border border-slate-300 px-2 py-1.5 text-sm" : "rounded border px-1 py-0.5 text-xs"}
        />
        <button type="submit" className={compact ? "text-sm font-medium text-blue-700 underline" : "text-xs text-blue-700 underline"}>
          mover
        </button>
      </form>
      {error && <p className="mt-1 text-xs text-red-600">{error}</p>}
    </div>
  );
}

export function AppointmentTable({ appointments }: { appointments: Appointment[] }) {
  const [rescheduleError, setRescheduleError] = useState<{ id: string; message: string } | null>(null);

  if (appointments.length === 0) {
    return <p className="mt-4 text-sm text-slate-500">Nenhuma consulta marcada ainda.</p>;
  }

  return (
    <>
      {/* Mobile: stacked cards */}
      <div className="mt-4 space-y-3 md:hidden">
        {appointments.map((appt) => (
          <div key={appt.id} className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm">
            <div className="flex items-start justify-between gap-2">
              <div>
                <p className="font-medium text-slate-900">{appt.patientName}</p>
                <p className="text-sm text-slate-500">{appt.patientWhatsapp}</p>
              </div>
              <StatusBadge status={appt.status} />
            </div>
            <p className="mt-2 text-sm text-slate-700">
              {appt.date} às {appt.startTime}
            </p>

            <div className="mt-3 space-y-3 border-t border-slate-100 pt-3">
              <div>
                <p className="mb-1 text-xs font-medium text-slate-500">Pagamento — {formatMoney(appt.amountCents)}</p>
                <PaymentForm appt={appt} compact />
              </div>

              {appt.status !== "cancelado" && (
                <>
                  <div>
                    <p className="mb-1 text-xs font-medium text-slate-500">Reagendar</p>
                    <RescheduleForm
                      appt={appt}
                      compact
                      error={rescheduleError?.id === appt.id ? rescheduleError.message : undefined}
                      onResult={(message) => setRescheduleError(message ? { id: appt.id, message } : null)}
                    />
                  </div>
                  <form action={async () => { await cancelAppointmentAction(appt.id); }}>
                    <button type="submit" className="text-sm font-medium text-red-600 underline">
                      cancelar
                    </button>
                  </form>
                </>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Desktop: table */}
      <table className="mt-4 hidden w-full text-sm md:table">
        <thead>
          <tr className="border-b text-left text-slate-500">
            <th className="py-2">Paciente</th>
            <th>WhatsApp</th>
            <th>Data</th>
            <th>Horário</th>
            <th>Status</th>
            <th>Pagamento</th>
            <th>Reagendar</th>
            <th></th>
          </tr>
        </thead>
        <tbody>
          {appointments.map((appt) => (
            <tr key={appt.id} className="border-b align-top">
              <td className="py-2">{appt.patientName}</td>
              <td>{appt.patientWhatsapp}</td>
              <td>{appt.date}</td>
              <td>{appt.startTime}</td>
              <td>
                <StatusBadge status={appt.status} />
              </td>
              <td>
                <PaymentForm appt={appt} />
                <p className="mt-1 text-xs text-slate-500">{formatMoney(appt.amountCents)}</p>
              </td>
              <td>
                {appt.status !== "cancelado" && (
                  <RescheduleForm
                    appt={appt}
                    error={rescheduleError?.id === appt.id ? rescheduleError.message : undefined}
                    onResult={(message) => setRescheduleError(message ? { id: appt.id, message } : null)}
                  />
                )}
              </td>
              <td>
                {appt.status !== "cancelado" && (
                  <form action={async () => { await cancelAppointmentAction(appt.id); }}>
                    <button type="submit" className="text-xs text-red-600 underline">cancelar</button>
                  </form>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </>
  );
}
