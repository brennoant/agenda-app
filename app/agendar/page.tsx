import { getAvailableSlots } from "@/lib/data/availability";
import { BookingFlow } from "@/components/agendar/booking-flow";

export const dynamic = "force-dynamic";

export default function AgendarPage() {
  const slots = getAvailableSlots(new Date().toISOString().slice(0, 10), 14);

  return (
    <main className="min-h-screen bg-emerald-50 px-4 py-10 sm:px-6 sm:py-16">
      <div className="mx-auto max-w-xl">
        <h1 className="font-display text-3xl font-medium text-emerald-950 sm:text-4xl">Agende sua consulta</h1>
        <p className="mt-1 text-emerald-700">Escolha um horário disponível abaixo.</p>
        <BookingFlow slots={slots} />
      </div>
    </main>
  );
}
