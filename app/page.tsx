import Link from "next/link";

export default function HomePage() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center gap-4 bg-emerald-50 px-4 text-center">
      <h1 className="text-2xl font-semibold text-emerald-900">Agenda</h1>
      <p className="max-w-sm text-emerald-700">
        Protótipo de agendamento para atendimento psicológico.
      </p>
      <div className="flex gap-3">
        <Link href="/agendar" className="rounded-md bg-emerald-700 px-4 py-2 text-sm font-medium text-white">
          Agendar consulta
        </Link>
        <Link href="/admin/login" className="rounded-md border border-emerald-300 px-4 py-2 text-sm font-medium text-emerald-800">
          Área da psicóloga
        </Link>
      </div>
    </main>
  );
}
