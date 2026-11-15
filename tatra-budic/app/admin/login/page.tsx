import { login } from "../actions";

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  const { error } = await searchParams;
  return (
    <main style={{ maxWidth: 360, margin: "20vh auto", padding: 16, fontFamily: "system-ui" }}>
      <h1 style={{ fontSize: 22 }}>TABU – administrácia</h1>
      <form action={login} style={{ display: "grid", gap: 12, marginTop: 16 }}>
        <input
          type="password"
          name="password"
          placeholder="Heslo"
          autoFocus
          required
          style={{ padding: 10, fontSize: 16 }}
        />
        <button type="submit" style={{ padding: 10, fontSize: 16, cursor: "pointer" }}>
          Prihlásiť sa
        </button>
        {error && <p style={{ color: "#b00020", margin: 0 }}>Nesprávne heslo.</p>}
      </form>
    </main>
  );
}
