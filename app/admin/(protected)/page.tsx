import { listAppointments } from "@/lib/data/appointments";
import { AppointmentTable } from "@/components/admin/appointment-table";

export default function AdminDashboardPage() {
  const appointments = listAppointments();
  return (
    <div>
      <h1 className="text-xl font-semibold text-slate-900 sm:text-2xl">Agenda</h1>
      <AppointmentTable appointments={appointments} />
    </div>
  );
}
