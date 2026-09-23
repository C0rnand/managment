# Tatra Budič (TABU)

Prírodný energetický nápoj z bylín Vysokých Tatier. Univerzitný semestrálny
projekt – marketingová webstránka startupu postavená na Next.js 15.

**Live demo:** _(doplňte odkaz po nasadení na Vercel)_

---

## 1. Názov projektu a akronym

### Návrhy akronymov

Pri hľadaní skratky som zvažoval niekoľko možností poskladaných z názvu
"Tatra Budič":

| Akronym | Rozpis                          | Poznámka                                                                 |
| ------- | -------------------------------- | ------------------------------------------------------------------------- |
| **TABU**    | **TA**tra **BU**dič                  | Krátke, ľahko zapamätateľné, a zároveň skutočné slovenské slovo (tabu) – funguje ako "hovoriaca" značka. **Vybraný variant.** |
| TBE     | Tatra Budič Energy               | Zrozumiteľné, ale menej plynulé na vyslovenie a pôsobí viac anglicky.      |
| TAEN    | TAtra ENergy                     | Funkčné, ale stráca odkaz na slovo "budič".                               |
| NRGT    | eNeRGy Tatra (štylizované)       | Modernejšie/technické, no ťažšie čitateľné a nič nehovoriace bez kontextu. |
| TBU     | Tatra BUdič (kratší zápis)       | Fonetickycky menej výrazné než TABU.                                      |

**Vybraný akronym: TABU** – je krátky, dobre sa vyslovuje aj v slovenčine,
dá sa použiť ako plnohodnotné meno produktu (nielen skratka) a slovná hračka
so slovenským slovom "tabu" mu dáva navyše zapamätateľný, mierne provokatívny
podtón, ktorý sedí k energetickému nápoju cielenému na študentov a hráčov.

### Anotácia projektu (163 znakov, limit 200)

> TABU (Tatra Budič) je prírodný energetický nápoj z bylinných extraktov
> Vysokých Tatier, ktorý dodáva udržateľnú energiu bez umelých látok
> a náhleho poklesu výkonu.

Názov projektu, akronym aj anotácia sú viditeľné priamo na webe – v úvodnej
(hero) sekcii stránky.

---

## 2. Tech stack

- **Next.js 15** (App Router, Server Components, Route Handlers)
- **React 19**
- **TypeScript**
- **Tailwind CSS 3**
- `next/font` (Fraunces + Inter, self-hosted Google Fonts) – bez layout shiftu
- Žiadne ďalšie runtime závislosti – ľahký, rýchlo sa nasadzujúci projekt

## 3. Štruktúra projektu

```
tatra-budic/
├── app/
│   ├── api/
│   │   └── orders/
│   │       └── route.ts        # API endpoint pre objednávkový/kontaktný formulár
│   ├── globals.css             # Tailwind + globálne štýly
│   ├── icon.svg                # favicon (automaticky rozpoznaný Next.js)
│   ├── layout.tsx               # root layout, fonty, metadata (SEO)
│   └── page.tsx                 # domovská stránka – skladá sekcie
├── components/
│   ├── AboutUs.tsx               # "Odkiaľ sme prišli" – O startupe
│   ├── Benefits.tsx               # "Načo je to dobré" – výhody produktu
│   ├── ContactForm.tsx            # Objednávkový / kontaktný formulár (client)
│   ├── Footer.tsx
│   ├── Header.tsx                 # sticky navigácia + mobilné menu (client)
│   ├── Hero.tsx                   # úvodná sekcia s názvom, akronymom, anotáciou
│   ├── MountainBackground.tsx     # dekoratívne SVG pozadie hôr
│   └── ProductSection.tsx         # prezentácia produktu (async server component)
├── database/
│   └── schema.sql                 # návrh DB schémy (PostgreSQL)
├── lib/
│   └── db.ts                      # dátová vrstva – pripravená na napojenie DB
├── public/
│   └── product-can.svg            # ilustrácia plechovky
├── .env.example                   # vzor premenných prostredia pre DB
├── next.config.mjs
├── package.json
├── postcss.config.mjs
├── tailwind.config.ts
└── tsconfig.json
```

## 4. Spustenie projektu lokálne

Vyžaduje Node.js 18.18+ (odporúčané 20+).

```bash
npm install
npm run dev
```

Stránka pobeží na [http://localhost:3000](http://localhost:3000).

Iné užitočné príkazy:

```bash
npm run build   # produkčný build
npm run start   # spustenie produkčného buildu lokálne
npm run lint    # ESLint kontrola
```

## 5. Funkcie webu

- **Hero** – názov projektu, akronym, anotácia, hlavné CTA a ilustrácia produktu
- **Produkt** – zloženie, objem, cena, popis (dáta z `lib/db.ts`, `getProducts()`)
- **Výhody** – prírodné byliny, energia bez pádu, slovenská inšpirácia, udržateľnosť
- **O nás** – príbeh startupu, cieľová skupina, kľúčové štatistiky
- **Kontakt / objednávka** – formulár (meno, email, množstvo, správa), ktorý
  odosiela `POST` na `/api/orders`; **platby nie sú implementované** (v súlade
  so zadaním) – ide o ukážku funkčného zberu objednávok/kontaktov

## 6. Databáza

Aplikácia **funguje aj bez pripojenej databázy** – `lib/db.ts` používa dátové
úložisko v pamäti (mock dáta pre produkt, objednávky sa ukladajú počas behu
servera). Je ale pripravená tak, aby sa dala pripojiť na skutočnú PostgreSQL
databázu len úpravou tohto jedného súboru.

### Návrh schémy (`database/schema.sql`)

```sql
CREATE TABLE products (
    id          SERIAL PRIMARY KEY,
    name        VARCHAR(255) NOT NULL,
    description TEXT NOT NULL,
    ingredients TEXT[] NOT NULL DEFAULT '{}',
    image_url   VARCHAR(500),
    price       NUMERIC(10, 2) NOT NULL,
    created_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE orders (
    id            SERIAL PRIMARY KEY,
    customer_name VARCHAR(255) NOT NULL,
    email         VARCHAR(255) NOT NULL,
    quantity      INTEGER NOT NULL DEFAULT 1,
    message       TEXT,               -- rozšírenie nad rámec minimálnej schémy
    product_id    INTEGER REFERENCES products(id),
    created_at    TIMESTAMPTZ NOT NULL DEFAULT now()
);
```

### Možnosť A – Vercel Postgres

1. V projekte na [vercel.com](https://vercel.com) otvorte záložku **Storage**
   → **Create Database** → **Postgres**, prepojte ju s projektom.
2. Vercel automaticky doplní premenné `POSTGRES_URL` a pod. do nastavení
   projektu (a do `.env.local`, ak si databázu stiahnete cez `vercel env pull`).
3. Spustite `database/schema.sql` (napr. cez záložku "Query" v dashboarde,
   alebo `psql "$POSTGRES_URL" -f database/schema.sql`).
4. `npm install @vercel/postgres`.
5. V `lib/db.ts` nahraďte telo `getProducts` / `createOrder` verziou so
   `sql` klientom – presný kód nájdete priamo v komentári na začiatku súboru.

### Možnosť B – Supabase

1. Vytvorte projekt na [supabase.com](https://supabase.com).
2. V **SQL Editor** spustite obsah `database/schema.sql`.
3. V **Project Settings → API** skopírujte URL a kľúče do `.env.local`
   (pozri `.env.example`).
4. `npm install @supabase/supabase-js`.
5. V `lib/db.ts` nahraďte telo funkcií verziou so Supabase klientom – kód je
   pripravený v komentári na začiatku súboru.

## 7. Nasadenie na GitHub a Vercel

### Git – inicializácia a push

```bash
git init
git add .
git commit -m "initial commit"
git branch -M main
git remote add origin <repository-url>
git push -u origin main
```

### Nasadenie na Vercel

1. Choďte na [vercel.com](https://vercel.com) a prihláste sa cez GitHub.
2. **Add New… → Project** a vyberte tento repozitár.
3. Vercel automaticky rozpozná Next.js – nie je potrebná žiadna ďalšia
   konfigurácia (build command aj output sa nastavia samé).
4. Ak pripájate databázu, doplňte premenné prostredia zo sekcie 6 v
   **Settings → Environment Variables** (alebo cez prepojenie Vercel Postgres,
   ktoré ich doplní automaticky).
5. Klik na **Deploy** – o pár desiatok sekúnd je stránka live na
   `<project>.vercel.app`.

Ďalšie nasadenia sa spustia automaticky pri každom `git push` do vetvy `main`.

## 8. Poznámky k zadaniu

- Platby **nie sú implementované** – formulár len uloží objednávku (v pamäti,
  prípadne v pripojenej databáze) a vráti potvrdenie.
- Obsah webu je v slovenčine, texty (produkt, byliny, cena) sú vymyslené pre
  účely tohto školského projektu.
- Dizajn vychádza z farebnej palety tmavá lesná zelená / smaragdová / biela /
  svetlosivá, s motívom Vysokých Tatier a nádychom prémiovej nápojovej značky.
