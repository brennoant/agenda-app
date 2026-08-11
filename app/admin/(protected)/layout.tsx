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
      <header className="flex items-center justify-between border-b bg-white px-6 py-4">
        <nav className="flex gap-4 text-sm font-medium">
          <a href="/admin">Agenda</a>
          <a href="/admin/disponibilidade">Disponibilidade</a>
          <a href="/admin/bloqueios">Bloqueios</a>
        </nav>
        <form action={logout}>
          <button type="submit" className="text-sm text-slate-500 hover:underline">
            Sair
          </button>
        </form>
      </header>
      <main className="p-6">{children}</main>
    </div>
  );
}
