"use client";

import { useState, type FormEvent } from "react";
import Reveal from "./Reveal";

type Status = "idle" | "loading" | "success" | "error";

const INITIAL_FORM = { customer_name: "", email: "", quantity: 1, message: "" };

const NOTES = [
  "Ide o ukážkovú objednávku bez reálnej platby – platobná brána zatiaľ nie je aktívna.",
  "Údaje z formulára použijeme len v rámci tohto univerzitného projektu.",
  "Na email sa ti ozveme obvykle do pár dní.",
];

export default function ContactForm() {
  const [form, setForm] = useState(INITIAL_FORM);
  const [status, setStatus] = useState<Status>("idle");
  const [errorMessage, setErrorMessage] = useState("");

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setStatus("loading");
    setErrorMessage("");

    try {
      const response = await fetch("/api/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(data.error || "Nastala neočakávaná chyba.");
      }

      setStatus("success");
      setForm(INITIAL_FORM);
    } catch (error) {
      setStatus("error");
      setErrorMessage(error instanceof Error ? error.message : "Nastala neočakávaná chyba.");
    }
  }

  return (
    <section id="kontakt" className="bg-white py-24">
      <div className="mx-auto grid max-w-6xl gap-12 px-6 sm:px-8 lg:grid-cols-[0.85fr_1.15fr] lg:gap-16">
        <Reveal>
          <h2 className="font-display text-4xl font-semibold tracking-tight text-forest-950">
            Objednaj si prvú plechovku
          </h2>
          <p className="mt-4 leading-relaxed text-forest-600">
            Napíš nám meno, email a koľko kusov by si chcel – ozveme sa ti.
          </p>

          <ul className="mt-8 space-y-4">
            {NOTES.map((note) => (
              <li key={note} className="flex gap-3 text-sm leading-relaxed text-forest-600">
                <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-emerald-500" aria-hidden="true" />
                {note}
              </li>
            ))}
          </ul>
        </Reveal>

        <Reveal delayMs={100} className="rounded-2xl border border-forest-100 bg-forest-50/50 p-6 sm:p-8">
          <form onSubmit={handleSubmit} noValidate className="space-y-5">
            <div className="grid gap-5 sm:grid-cols-2">
              <div>
                <label htmlFor="customer_name" className="text-sm text-forest-800">
                  Meno a priezvisko
                </label>
                <input
                  id="customer_name"
                  name="customer_name"
                  required
                  value={form.customer_name}
                  onChange={(event) => setForm({ ...form, customer_name: event.target.value })}
                  placeholder="Jana Nováková"
                  className="mt-1.5 w-full rounded-lg border border-forest-200 bg-white px-4 py-2.5 text-forest-900 outline-none transition-colors focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20"
                />
              </div>
              <div>
                <label htmlFor="email" className="text-sm text-forest-800">
                  Email
                </label>
                <input
                  id="email"
                  name="email"
                  type="email"
                  required
                  value={form.email}
                  onChange={(event) => setForm({ ...form, email: event.target.value })}
                  placeholder="jana@email.sk"
                  className="mt-1.5 w-full rounded-lg border border-forest-200 bg-white px-4 py-2.5 text-forest-900 outline-none transition-colors focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20"
                />
              </div>
            </div>

            <div>
              <label htmlFor="quantity" className="text-sm text-forest-800">
                Množstvo (ks)
              </label>
              <input
                id="quantity"
                name="quantity"
                type="number"
                min={1}
                required
                value={form.quantity}
                onChange={(event) => setForm({ ...form, quantity: Number(event.target.value) })}
                className="mt-1.5 w-28 rounded-lg border border-forest-200 bg-white px-4 py-2.5 text-forest-900 outline-none transition-colors focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20"
              />
            </div>

            <div>
              <label htmlFor="message" className="text-sm text-forest-800">
                Správa (voliteľné)
              </label>
              <textarea
                id="message"
                name="message"
                rows={4}
                value={form.message}
                onChange={(event) => setForm({ ...form, message: event.target.value })}
                placeholder="Máš otázku alebo nápad? Napíš nám."
                className="mt-1.5 w-full rounded-lg border border-forest-200 bg-white px-4 py-2.5 text-forest-900 outline-none transition-colors focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20"
              />
            </div>

            <button
              type="submit"
              disabled={status === "loading"}
              className="inline-flex items-center justify-center rounded-full bg-forest-950 px-7 py-3.5 text-sm font-medium text-white transition-colors hover:bg-forest-800 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {status === "loading" ? "Odosielam…" : "Odoslať objednávku"}
            </button>

            <div role="status" aria-live="polite">
              {status === "success" && (
                <p className="rounded-lg bg-emerald-50 px-4 py-3 text-sm text-emerald-800">
                  Ďakujeme! Tvoju predobjednávku sme prijali a čoskoro sa ti ozveme na email.
                </p>
              )}
              {status === "error" && (
                <p className="rounded-lg bg-red-50 px-4 py-3 text-sm text-red-700">{errorMessage}</p>
              )}
            </div>
          </form>
        </Reveal>
      </div>
    </section>
  );
}
