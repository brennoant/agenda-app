import { listAppointments } from "@/lib/data/appointments";
import { AppointmentTable } from "@/components/admin/appointment-table";

export default function AdminDashboardPage() {
  const appointments = listAppointments();
  return (
    <div>
      <h1 className="text-xl font-semibold">Agenda</h1>
      <AppointmentTable appointments={appointments} />
    </div>
  );
}
