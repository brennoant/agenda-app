import { login } from "@/lib/auth-actions";

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  const { error } = await searchParams;

  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-50">
      <form action={login} className="w-full max-w-sm space-y-4 rounded-lg border bg-white p-8 shadow-sm">
        <h1 className="text-lg font-semibold">Entrar</h1>
        {error && <p className="text-sm text-red-600">E-mail ou senha inválidos.</p>}
        <div className="space-y-1">
          <label htmlFor="email" className="text-sm font-medium">E-mail</label>
          <input id="email" name="email" type="email" required className="w-full rounded-md border px-3 py-2 text-sm" />
        </div>
        <div className="space-y-1">
          <label htmlFor="password" className="text-sm font-medium">Senha</label>
          <input id="password" name="password" type="password" required className="w-full rounded-md border px-3 py-2 text-sm" />
        </div>
        <button type="submit" className="w-full rounded-md bg-slate-900 py-2 text-sm font-medium text-white">
          Entrar
        </button>
      </form>
    </div>
  );
}
