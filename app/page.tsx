import Link from "next/link";

export default function HomePage() {
  return (
    <main className="relative flex min-h-screen flex-1 items-center overflow-hidden bg-emerald-50">
      <div aria-hidden className="pointer-events-none absolute inset-0">
        <div className="absolute -top-24 -left-16 h-72 w-72 rounded-full bg-emerald-200/60 blur-3xl sm:h-96 sm:w-96" />
        <div className="absolute top-1/3 -right-20 h-80 w-80 rounded-full bg-teal-200/50 blur-3xl sm:h-[28rem] sm:w-[28rem]" />
        <div className="absolute -bottom-32 left-1/4 h-72 w-72 rounded-full bg-emerald-100/70 blur-3xl" />
      </div>

      <div className="relative mx-auto flex w-full max-w-2xl flex-col items-center gap-6 px-6 py-20 text-center sm:gap-8 sm:py-28">
        <h1 className="font-display text-4xl leading-tight font-medium text-balance text-emerald-950 italic sm:text-5xl lg:text-6xl">
          Um espaço para cuidar da sua saúde mental.
        </h1>

        <p className="max-w-md text-base text-emerald-800 sm:text-lg">
          Escolha um horário e agende sua consulta em poucos minutos.
        </p>

        <div className="flex flex-wrap items-center justify-center gap-2">
          <span className="rounded-full border border-emerald-200 bg-white/70 px-3 py-1 text-xs font-medium text-emerald-800 backdrop-blur-sm sm:text-sm">
            Sessões de 50 minutos
          </span>
          <span className="rounded-full border border-emerald-200 bg-white/70 px-3 py-1 text-xs font-medium text-emerald-800 backdrop-blur-sm sm:text-sm">
            Atendimento 100% online
          </span>
        </div>

        <div className="mt-2 flex w-full flex-col items-center gap-3 sm:w-auto sm:flex-row sm:gap-4">
          <Link
            href="/agendar"
            className="w-full rounded-full bg-emerald-700 px-8 py-3.5 text-center text-base font-medium text-white shadow-sm shadow-emerald-900/10 transition hover:bg-emerald-800 active:bg-emerald-900 sm:w-auto"
          >
            Agendar consulta
          </Link>
          <Link
            href="/admin/login"
            className="text-sm font-medium text-emerald-700/80 underline-offset-4 transition hover:text-emerald-900 hover:underline"
          >
            Área da psicóloga
          </Link>
        </div>
      </div>
    </main>
  );
}
