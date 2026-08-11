import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { isValidSessionToken } from "@/lib/auth";
import { logout } from "@/lib/auth-actions";

export default async function ProtectedAdminLayout({ children }: { children: React.ReactNode }) {
  const token = (await cookies()).get("admin_session")?.value;
  if (!isValidSessionToken(token)) {
    redirect("/admin/login");
  }

  return (
    <div className="min-h-screen bg-slate-50">
      <header className="flex flex-wrap items-center justify-between gap-x-4 gap-y-2 border-b bg-white px-4 py-3 sm:px-6 sm:py-4">
        <nav className="flex flex-wrap gap-x-4 gap-y-1 text-sm font-medium text-slate-700">
          <a href="/admin" className="whitespace-nowrap hover:text-slate-950">Agenda</a>
          <a href="/admin/disponibilidade" className="whitespace-nowrap hover:text-slate-950">Disponibilidade</a>
          <a href="/admin/bloqueios" className="whitespace-nowrap hover:text-slate-950">Bloqueios</a>
        </nav>
        <form action={logout}>
          <button type="submit" className="text-sm text-slate-500 hover:underline">
            Sair
          </button>
        </form>
      </header>
      <main className="mx-auto max-w-5xl p-4 sm:p-6 lg:p-8">{children}</main>
    </div>
  );
}
