import { NextRequest, NextResponse } from "next/server";
import { createOrder } from "@/lib/db";

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const MIN_QUANTITY = 1;
const MAX_QUANTITY = 99;

function badRequest(error: string) {
  return NextResponse.json({ success: false, error }, { status: 400 });
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    // Honeypot: skryté pole "website" vyplnia len boti. Tvárime sa, že OK,
    // ale nič neukladáme. (Pole sa musí pridať do ContactForm.tsx.)
    if (typeof body.website === "string" && body.website.trim() !== "") {
      return NextResponse.json({ success: true }, { status: 201 });
    }

    const customer_name = String(body.customer_name ?? "").trim();
    const email = String(body.email ?? "").trim();
    const message = typeof body.message === "string" ? body.message.trim() : undefined;
    const quantity = Number(body.quantity);

    if (!customer_name || !email) {
      return badRequest("Meno a email sú povinné.");
    }
    if (customer_name.length > 255 || email.length > 255) {
      return badRequest("Meno alebo email je príliš dlhý.");
    }
    if (!EMAIL_PATTERN.test(email)) {
      return badRequest("Zadajte prosím platnú emailovú adresu.");
    }
    // Nesprávne množstvo sa už NEopravuje potichu na 1 – skreslilo by to KPI.
    if (!Number.isInteger(quantity) || quantity < MIN_QUANTITY || quantity > MAX_QUANTITY) {
      return badRequest(`Množstvo musí byť celé číslo od ${MIN_QUANTITY} do ${MAX_QUANTITY}.`);
    }
    if (message && message.length > 2000) {
      return badRequest("Správa je príliš dlhá (max. 2000 znakov).");
    }

    const order = await createOrder({
      customer_name,
      email,
      quantity,
      message: message || undefined,
    });

    // Platby nie sú implementované (v súlade so zadaním) – objednávka sa len
    // uloží (pozri lib/db.ts) a vráti sa potvrdenie.
    return NextResponse.json({ success: true, order }, { status: 201 });
  } catch (error) {
    console.error("Chyba pri vytváraní objednávky:", error);
    return NextResponse.json(
      { success: false, error: "Nastala chyba na serveri. Skúste to prosím znova." },
      { status: 500 }
    );
  }
}
