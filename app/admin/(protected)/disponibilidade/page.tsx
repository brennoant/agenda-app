import { getWeeklySchedule } from "@/lib/data/schedule";
import { ScheduleManager } from "@/components/admin/schedule-manager";

export default function DisponibilidadePage() {
  const schedule = getWeeklySchedule();
  return (
    <div>
      <h1 className="text-xl font-semibold text-slate-900 sm:text-2xl">Disponibilidade</h1>
      <ScheduleManager schedule={schedule} />
    </div>
  );
}
