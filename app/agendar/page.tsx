import { getAvailableSlots } from "@/lib/data/availability";
import { BookingFlow } from "@/components/agendar/booking-flow";
import { SiteHeader } from "@/components/agendar/site-header";

export const dynamic = "force-dynamic";

export default function AgendarPage() {
  const slots = getAvailableSlots(new Date().toISOString().slice(0, 10), 14);

  return (
    <main className="flex min-h-screen flex-col bg-cream">
      <SiteHeader />

      <div className="mx-auto w-full max-w-xl flex-1 px-4 py-10 sm:px-6 sm:py-16">
        <span className="rounded-full border border-sand bg-white px-3 py-1 text-xs font-medium text-stone sm:text-sm">
          Psicóloga Clínica · CRP 08/46944
        </span>

        <h1 className="mt-4 font-display text-3xl font-medium text-espresso italic sm:text-4xl">
          Agende sua consulta
        </h1>
        <p className="mt-1 text-stone">Escolha um horário disponível abaixo e confirme em poucos passos.</p>

        <BookingFlow slots={slots} />

        <p className="mt-10 text-xs text-stone">
          Dúvidas? Fale pelo WhatsApp ou em psimillastadler@hotmail.com.
        </p>
      </div>
    </main>
  );
}
