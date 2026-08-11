"use client";

import { useState } from "react";
import { Appointment } from "@/lib/data/types";
import { cancelAppointmentAction, rescheduleAppointmentAction, updatePaymentAction } from "@/lib/data/actions";

function formatMoney(cents: number) {
  return (cents / 100).toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
}

export function AppointmentTable({ appointments }: { appointments: Appointment[] }) {
  const [rescheduleError, setRescheduleError] = useState<{ id: string; message: string } | null>(null);

  if (appointments.length === 0) {
    return <p className="mt-4 text-sm text-slate-500">Nenhuma consulta marcada ainda.</p>;
  }

  return (
    <table className="mt-4 w-full text-sm">
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
            <td>{appt.status}</td>
            <td>
              <form
                action={async (formData) => {
                  await updatePaymentAction(
                    appt.id,
                    formData.get("paymentStatus") as "pago" | "pendente",
                    Number(formData.get("amountCents")) || 0
                  );
                }}
                className="flex items-center gap-1"
              >
                <select name="paymentStatus" defaultValue={appt.paymentStatus} className="rounded border px-1 py-0.5 text-xs">
                  <option value="pendente">pendente</option>
                  <option value="pago">pago</option>
                </select>
                <input
                  name="amountCents"
                  type="number"
                  defaultValue={appt.amountCents}
                  className="w-20 rounded border px-1 py-0.5 text-xs"
                />
                <button type="submit" className="text-xs text-emerald-700 underline">salvar</button>
              </form>
              <p className="mt-1 text-xs text-slate-500">{formatMoney(appt.amountCents)}</p>
            </td>
            <td>
              {appt.status !== "cancelado" && (
                <>
                  <form
                    action={async (formData) => {
                      const result = await rescheduleAppointmentAction(
                        appt.id,
                        String(formData.get("date")),
                        String(formData.get("startTime"))
                      );
                      if (!result.ok) {
                        setRescheduleError({ id: appt.id, message: "Esse horário não está disponível." });
                      } else {
                        setRescheduleError(null);
                      }
                    }}
                    className="flex items-center gap-1"
                  >
                    <input type="date" name="date" required className="rounded border px-1 py-0.5 text-xs" />
                    <input type="time" name="startTime" required className="rounded border px-1 py-0.5 text-xs" />
                    <button type="submit" className="text-xs text-blue-700 underline">mover</button>
                  </form>
                  {rescheduleError?.id === appt.id && (
                    <p className="mt-1 text-xs text-red-600">{rescheduleError.message}</p>
                  )}
                </>
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
  );
}
