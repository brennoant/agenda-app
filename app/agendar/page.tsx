import { getAvailableSlots } from "@/lib/data/availability";
import { BookingFlow } from "@/components/agendar/booking-flow";

export default function AgendarPage() {
  const slots = getAvailableSlots(new Date().toISOString().slice(0, 10), 14);

  return (
    <main className="min-h-screen bg-emerald-50 px-4 py-10">
      <div className="mx-auto max-w-xl">
        <h1 className="text-2xl font-semibold text-emerald-900">Agende sua consulta</h1>
        <p className="mt-1 text-emerald-700">Escolha um horário disponível abaixo.</p>
        <BookingFlow slots={slots} />
      </div>
    </main>
  );
}
