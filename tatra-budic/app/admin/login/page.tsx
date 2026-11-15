import { login } from "../actions";

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  const { error } = await searchParams;
  return (
    <main className="relative flex min-h-screen items-center justify-center overflow-hidden bg-forest-950 px-6 py-12">
      <div className="pointer-events-none absolute inset-0 bg-radial-glow" aria-hidden="true" />
      <div className="relative w-full max-w-sm">
        <a
          href="/"
          className="mb-8 inline-flex items-center gap-2.5 rounded-lg text-forest-300 transition-colors hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-400"
        >
          <img src="/logo-mark.svg" alt="" aria-hidden="true" className="h-9 w-9" />
          <span className="font-display text-lg font-semibold tracking-tight text-white">TABU</span>
          <span className="text-sm">späť na web</span>
        </a>

        <div className="glass-dark rounded-3xl p-8">
          <h1 className="font-display text-2xl font-semibold text-white">Administrácia</h1>
          <form action={login} className="mt-6 grid gap-4">
            <label className="grid gap-1.5 text-sm text-forest-200">
              Heslo
              <input
                type="password"
                name="password"
                autoComplete="current-password"
                autoFocus
                required
                className="rounded-xl border border-white/15 bg-white/10 px-4 py-3 text-base text-white placeholder:text-forest-400 focus:border-emerald-400 focus:outline-none focus:ring-2 focus:ring-emerald-400/40"
              />
            </label>
            {error && (
              <p role="alert" className="rounded-xl bg-red-500/15 px-4 py-2.5 text-sm text-red-200">
                Nesprávne heslo.
              </p>
            )}
            <button
              type="submit"
              className="rounded-full bg-emerald-500 px-5 py-3 text-sm font-semibold text-forest-950 transition-colors hover:bg-emerald-400 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-300 focus-visible:ring-offset-2 focus-visible:ring-offset-forest-950"
            >
              Prihlásiť sa
            </button>
          </form>
        </div>
      </div>
    </main>
  );
}
