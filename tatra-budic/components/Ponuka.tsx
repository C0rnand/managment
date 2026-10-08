import { getProducts } from "@/lib/db";
import Reveal from "./Reveal";

export default async function Ponuka() {
  const products = await getProducts();
  const baseIngredients = new Set(products[0]?.ingredients ?? []);

  return (
    <section id="ponuka" className="bg-forest-50 py-24">
      <div className="mx-auto max-w-6xl px-6 sm:px-8">
        <Reveal className="max-w-2xl">
          <h2 className="font-display text-4xl font-semibold tracking-tight text-forest-950">
            Naša ponuka
          </h2>
          <p className="mt-4 leading-relaxed text-forest-700">
            Jeden základný recept, tri príchute. Exotic a Tropical vychádzajú z rovnakého
            zloženia ako Classic – len s dvoma ovocnými prísadami navyše.
          </p>
        </Reveal>

        <div className="mt-14 grid gap-6 sm:grid-cols-3">
          {products.map((product, index) => {
            const extras = product.ingredients.filter(
              (ingredient) => !baseIngredients.has(ingredient)
            );

            return (
              <Reveal key={product.id} delayMs={index * 110} className="h-full">
                <article className="flex h-full flex-col rounded-2xl border border-forest-200 bg-white p-6 transition-shadow hover:shadow-lg">
                  <div className="flex items-center justify-center rounded-lg bg-forest-50 p-6">
                    <img
                      src={product.image_url}
                      alt={`Plechovka ${product.name}`}
                      className="h-56 w-auto drop-shadow-lg"
                    />
                  </div>

                  <h3 className="mt-6 font-display text-lg font-semibold text-forest-950">
                    {product.name}
                  </h3>
                  <p className="mt-2 flex-1 text-sm leading-relaxed text-forest-600">
                    {product.description}
                  </p>

                  <p className="mt-4 text-xs font-medium uppercase tracking-[0.15em] text-emerald-700">
                    {extras.length > 0 ? `+ ${extras.join(" a ")}` : "Pôvodný recept"}
                  </p>
                </article>
              </Reveal>
            );
          })}
        </div>
      </div>
    </section>
  );
}
