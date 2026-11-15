// Bez závislostí na next/headers – používa sa aj v middleware (Edge runtime).
// Heslo sa neoveruje tu, ale v databáze (pozri app/admin/actions.ts a
// database/004_admin_password.sql). Tento súbor len podpisuje a overuje cookie.
export const ADMIN_COOKIE = "tabu_admin";
export const SESSION_SECONDS = 60 * 60 * 8; // 8 hodín

const enc = new TextEncoder();

// Kľúč na podpis cookie sa odvodí zo Supabase secret kľúča, ktorý už je vo Verceli.
// Voliteľne ho možno prebiť premennou ADMIN_SESSION_SECRET.
async function signingKey(): Promise<CryptoKey> {
  const base =
    process.env.ADMIN_SESSION_SECRET ??
    process.env.SUPABASE_SECRET_KEY ??
    process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!base) throw new Error("Chýba SUPABASE_SERVICE_ROLE_KEY (alebo SUPABASE_SECRET_KEY)");
  const material = await crypto.subtle.digest("SHA-256", enc.encode("tabu-admin-session:" + base));
  return crypto.subtle.importKey("raw", material, { name: "HMAC", hash: "SHA-256" }, false, ["sign"]);
}

async function sign(data: string): Promise<string> {
  const sig = new Uint8Array(await crypto.subtle.sign("HMAC", await signingKey(), enc.encode(data)));
  let s = "";
  sig.forEach((b) => (s += String.fromCharCode(b)));
  return btoa(s).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
}

function safeEqual(a: string, b: string): boolean {
  if (a.length !== b.length) return false;
  let diff = 0;
  for (let i = 0; i < a.length; i++) diff |= a.charCodeAt(i) ^ b.charCodeAt(i);
  return diff === 0;
}

export async function createSessionToken(): Promise<string> {
  const exp = Math.floor(Date.now() / 1000) + SESSION_SECONDS;
  return `${exp}.${await sign(String(exp))}`;
}

export async function verifySessionToken(token?: string | null): Promise<boolean> {
  if (!token) return false;
  const [exp, sig] = token.split(".");
  if (!exp || !sig || Number(exp) < Date.now() / 1000) return false;
  return safeEqual(sig, await sign(exp));
}