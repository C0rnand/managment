import { NextRequest, NextResponse } from "next/server";
import { createOrder } from "@/lib/db";

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const customer_name = String(body.customer_name ?? "").trim();
    const email = String(body.email ?? "").trim();
    const message = typeof body.message === "string" ? body.message.trim() : undefined;
    const quantity = Number(body.quantity);

    if (!customer_name || !email) {
      return NextResponse.json(
        { success: false, error: "Meno a email sú povinné." },
        { status: 400 }
      );
    }

    if (!EMAIL_PATTERN.test(email)) {
      return NextResponse.json(
        { success: false, error: "Zadajte prosím platnú emailovú adresu." },
        { status: 400 }
      );
    }

    const order = await createOrder({
      customer_name,
      email,
      quantity: Number.isFinite(quantity) && quantity > 0 ? Math.floor(quantity) : 1,
      message: message || undefined,
    });

    // Poznámka: toto je ukážková funkcia bez reálnych platieb (v zmysle
    // zadania). Objednávka sa len uloží (pozri lib/db.ts) a vráti sa
    // potvrdenie – v produkcii by tu nasledovalo napr. odoslanie emailu.
    return NextResponse.json({ success: true, order }, { status: 201 });
  } catch (error) {
    console.error("Chyba pri vytváraní objednávky:", error);
    return NextResponse.json(
      { success: false, error: "Nastala chyba na serveri. Skúste to prosím znova." },
      { status: 500 }
    );
  }
}
