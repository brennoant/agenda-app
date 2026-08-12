import Link from "next/link";

export function SiteHeader() {
  return (
    <header className="border-b border-sand/70 bg-cream">
      <div className="mx-auto flex max-w-xl items-center justify-between px-4 py-4 sm:px-6">
        <span className="font-display text-lg font-medium text-espresso">Milla Stadler</span>
        <Link
          href="/admin/login"
          className="text-sm font-medium text-stone underline-offset-4 transition hover:text-espresso hover:underline"
        >
          Área do psicólogo
        </Link>
      </div>
    </header>
  );
}
