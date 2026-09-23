import { getProducts } from "@/lib/db";

export default async function ProductSection() {
  const products = await getProducts();
  const product = products[0];
  const priceLabel = product.price.toFixed(2).replace(".", ",");

  return (
    <section id="produkt" className="bg-white py-24">
      <div className="mx-auto grid max-w-6xl gap-12 px-6 sm:px-8 lg:grid-cols-[1.1fr_0.9fr] lg:gap-16">
        <div>
          <h2 className="font-display text-4xl font-semibold text-forest-950">
            Čo je v plechovke
          </h2>
          <p className="mt-5 max-w-md text-base leading-relaxed text-forest-700">
            {product.description} Žiadne umelé farbivá, žiadny prudký pád výkonu –
            len byliny z podhoria Tatier a dve prísady, ktoré poznáte z čaju a kávy.
          </p>

          <div className="mt-8 flex items-baseline gap-3">
            <span className="font-display text-3xl font-semibold text-forest-950">
              {priceLabel} €
            </span>
            <span className="text-sm text-forest-500">za plechovku, 330 ml</span>
          </div>

          <a
            href="#kontakt"
            className="mt-8 inline-flex w-fit rounded-full bg-forest-950 px-7 py-3.5 text-sm font-medium text-white transition-colors hover:bg-forest-800"
          >
            Predobjednať
          </a>
        </div>

        <div className="rounded-lg border border-forest-200 p-6 sm:p-8">
          <p className="text-xs font-medium uppercase tracking-[0.2em] text-forest-500">
            Zloženie
          </p>
          <dl className="mt-4 divide-y divide-forest-100">
            {product.ingredients.map((ingredient) => (
              <div key={ingredient} className="flex items-center justify-between py-3">
                <dt className="capitalize text-forest-800">{ingredient}</dt>
                <dd aria-hidden="true" className="text-forest-300">•</dd>
              </div>
            ))}
          </dl>
          <div className="mt-2 grid grid-cols-2 gap-4 border-t border-forest-200 pt-5">
            <div>
              <p className="text-xs uppercase tracking-[0.2em] text-forest-500">Objem</p>
              <p className="mt-1 font-display text-lg font-semibold text-forest-950">330 ml</p>
            </div>
            <div>
              <p className="text-xs uppercase tracking-[0.2em] text-forest-500">Cena</p>
              <p className="mt-1 font-display text-lg font-semibold text-forest-950">{priceLabel} €</p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
