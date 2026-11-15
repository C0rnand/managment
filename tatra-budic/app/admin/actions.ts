"use server";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { supabaseAdmin } from "@/lib/supabase";
import { requireAdmin } from "@/lib/requireAdmin";
import { ADMIN_COOKIE, SESSION_SECONDS, createSessionToken } from "@/lib/adminAuth";

export async function login(formData: FormData) {
  const password = String(formData.get("password") ?? "");
  await new Promise((r) => setTimeout(r, 600)); // spomalí hádanie hesla
  // Heslo sa overuje v databáze (tabuľka admin_settings, bcrypt) – žiadna nová env premenná.
  const { data, error } = await supabaseAdmin.rpc("admin_check_password", { p_password: password });
  if (error) console.error("[admin] overenie hesla zlyhalo:", error.message);
  if (error || data !== true) redirect("/admin/login?error=1");
  (await cookies()).set(ADMIN_COOKIE, await createSessionToken(), {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/admin",
    maxAge: SESSION_SECONDS,
  });
  redirect("/admin");
}

export async function logout() {
  (await cookies()).delete({ name: ADMIN_COOKIE, path: "/admin" });
  redirect("/admin/login");
}

// Označí objednávku ako testovaciu/spam (vylúči sa z KPI) alebo späť.
export async function toggleTest(formData: FormData) {
  await requireAdmin();
  const id = Number(formData.get("id"));
  const next = formData.get("next") === "true";
  const { error } = await supabaseAdmin.from("orders").update({ is_test: next }).eq("id", id);
  if (error) throw new Error(error.message);
  revalidatePath("/admin");
}

// Natrvalo zmaže objednávku (položky order_items sa zmažú kaskádovo).
// Na spam / testy je lepšie "Označiť ako test" – nevratné mazanie nechaj na naozaj zbytočné záznamy.
export async function deleteOrder(formData: FormData) {
  await requireAdmin();
  const id = Number(formData.get("id"));
  if (!Number.isInteger(id) || id <= 0) throw new Error("Neplatné ID objednávky");
  const { error } = await supabaseAdmin.from("orders").delete().eq("id", id);
  if (error) throw new Error(error.message);
  revalidatePath("/admin");
}
