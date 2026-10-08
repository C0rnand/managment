# Tatra Budič (TABU)

Prírodný energetický nápoj z bylín Vysokých Tatier. Univerzitný semestrálny
projekt – marketingová webstránka startupu postavená na Next.js 15.

**Live demo:** _(doplňte odkaz po nasadení na Vercel)_

> **v2 – redizajn.** Táto verzia nahrádza pôvodný jednoduchší dizajn
> prémiovejším vizuálom (video v hero sekcii, glassmorphism, nová typografia)
> a pridáva tri nové sekcie: **Náš tím**, **Realizácia projektu** a **KPI**.
> Pôvodné zadanie (názov, akronym, anotácia, kontaktný formulár, príprava na
> databázu) zostáva nezmenené a funkčné – pozri sekciu 8.

---

## 1. Názov projektu a akronym

### Návrhy akronymov

| Akronym | Rozpis | Poznámka |
| ------- | ------ | -------- |
| **TABU** | **TA**tra **BU**dič | Krátke, ľahko zapamätateľné, a zároveň skutočné slovenské slovo (tabu) – funguje ako "hovoriaca" značka. **Vybraný variant.** |
| TBE | Tatra Budič Energy | Zrozumiteľné, ale menej plynulé na vyslovenie a pôsobí viac anglicky. |
| TAEN | TAtra ENergy | Funkčné, ale stráca odkaz na slovo "budič". |
| NRGT | eNeRGy Tatra (štylizované) | Modernejšie/technické, no ťažšie čitateľné bez kontextu. |
| TBU | Tatra BUdič (kratší zápis) | Foneticky menej výrazné než TABU. |

**Vybraný akronym: TABU** – krátky, dobre sa vyslovuje aj v slovenčine, dá sa
použiť ako plnohodnotné meno produktu a slovná hračka so slovenským slovom
"tabu" mu dáva zapamätateľný, mierne provokatívny podtón, ktorý sedí
k energetickému nápoju cielenému na študentov a hráčov.

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
- `next/font` (Space Grotesk + Inter, self-hosted Google Fonts) – bez layout shiftu
- Žiadne ďalšie runtime závislosti – ľahký, rýchlo sa nasadzujúci projekt

## 3. Štruktúra projektu

```
tatra-budic/
├── app/
│   ├── api/
│   │   └── orders/
│   │       └── route.ts        # API endpoint pre objednávkový/kontaktný formulár
│   ├── globals.css             # Tailwind + glass/reveal utility triedy
│   ├── icon.svg                # favicon (automaticky rozpoznaný Next.js)
│   ├── layout.tsx              # root layout, fonty, metadata (SEO)
│   └── page.tsx                # domovská stránka – skladá sekcie
├── components/
│   ├── AboutUs.tsx              # "Odkiaľ sme prišli" – o startupe
│   ├── Benefits.tsx             # "Načo je to dobré" – výhody produktu
│   ├── ContactForm.tsx          # objednávkový / kontaktný formulár (client)
│   ├── Footer.tsx
│   ├── Header.tsx               # scroll-aware glass navbar + mobilné menu (client)
│   ├── Hero.tsx                 # úvodná sekcia s videom, názvom, akronymom, anotáciou
│   ├── HeroVideo.tsx            # <video> vrstva hero sekcie (client, rešpektuje reduced motion)
│   ├── KPISection.tsx           # "Ako meriame úspech" – 3 KPI dashboard karty
│   ├── MountainBackground.tsx   # dekoratívne SVG pozadie hôr (KPI sekcia)
│   ├── Ponuka.tsx               # "Naša ponuka" – 3 príchute (Classic/Exotic/Tropical)
│   ├── ProductSection.tsx       # prezentácia produktu (zloženie, cena)
│   ├── Reveal.tsx               # scroll-reveal wrapper (IntersectionObserver)
│   ├── Team.tsx                 # "Náš tím" – 4 členovia tímu
│   └── Timeline.tsx             # "Realizácia projektu" – iteratívny model
├── database/
│   └── schema.sql               # návrh DB schémy (PostgreSQL)
├── lib/
│   └── db.ts                    # dátová vrstva – pripravená na napojenie DB
├── public/
│   ├── logo-mark.svg            # vektorový brand mark (shield + tatranské vrchy + blesk)
│   ├── cans/
│   │   ├── classic.webp         # produktová fotka – Tatra Budič Classic (bez pozadia)
│   │   ├── exotic.webp          # produktová fotka – Tatra Budič Exotic (bez pozadia)
│   │   └── tropical.webp        # produktová fotka – Tatra Budič Tropical (bez pozadia)
│   └── media/
│       ├── hero-atmosphere.mp4  # ambientná slučka na pozadí hero sekcie (H.264)
│       ├── hero-atmosphere.webm # tá istá slučka (VP9, menší súbor)
│       ├── hero-poster.jpg/.webp# statický poster frame (LCP, no-JS, reduced motion)
│       └── grain.svg            # jemná textúra na tmavých sekciách
├── .env.example                 # vzor premenných prostredia pre DB
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

## 5. Sekcie webu

- **Hero** – názov projektu, akronym, anotácia, ambientné video na pozadí, CTA
- **Produkt** – zloženie, objem, cena (dáta z `lib/db.ts`, `getProducts()`)
- **Naša ponuka** *(nové)* – 3 príchute vedľa seba (Classic / Exotic / Tropical),
  každá s vlastnou ilustráciou plechovky a prísadami navyše
- **Výhody** – prírodné byliny, energia bez pádu, slovenská inšpirácia, udržateľnosť
- **O nás** – príbeh startupu, cieľová skupina, kľúčové štatistiky
- **Náš tím** *(nové)* – 4 členovia tímu s rolami a ikonami
- **Realizácia projektu** *(nové)* – iteratívny model vývoja, 3 iterácie, stav každej z nich
- **Ako meriame úspech** *(nové)* – 3 KPI karty v dashboard štýle (pozri sekciu 9)
- **Kontakt / objednávka** – formulár (meno, email, množstvo, správa) →
  `POST /api/orders`; **platby nie sú implementované** (v súlade so zadaním)

## 6. Médiá a značka — čo bolo použité a prečo

Do tejto verzie boli dodané dva podklady: logo/mockup etikety (PNG) a
animovaný GIF plechovky na skale s tatranským pozadím. Zadanie pýtalo
konkrétne rozhodnutie, nie automatické použitie oboch "ako sú" – tu je
rozbor:

**Logo / mockup etikety (PNG).** Ide o fotografický mockup (etiketa
položená na textúrovanej zelenej karte s vlastným stínom) – nie o vektor ani
o obrázok s priehľadným pozadím. Použiť ho priamo v navigácii ako logo by
znamenalo vložiť do menu malý zelený "sticker" so vlastným pozadím. Namiesto
toho:
- Vznikla nová **vlastná vektorová značka** (`public/logo-mark.svg`) – shield
  s tatranskými vrchmi a bleskom, vo farbách webu (smaragdová/biela/strieborná
  namiesto zlatej z mockupu, nech sedí so zvyškom UI). Používa sa v navigácii,
  vo footeri a ako favicon.
- Pôvodný mockup pôvodne slúžil aj ako zarámovaný "koncept etikety" v sekcii
  Produkt; tento náhľad bol neskôr z webu odstránený, aby sa sekcia sústredila
  len na zloženie produktu. Mockup tak zostáva len inšpiráciou pre
  `logo-mark.svg`, nie viditeľnou súčasťou webu.
- Tri **produktové fotky plechoviek** (`public/cans/classic.webp`,
  `exotic.webp`, `tropical.webp`) sú priamo dodané render obrázky (nie
  prekreslené) – pozadie (jednoliate čierne) bolo odstránené hromadným
  spracovaním (flood-fill priehľadnosti od okrajov snímky + mäkký prechod na
  hrane plechovky, aby rez nebol zubatý), orezané na samotnú plechovku a
  skomprimované do `.webp` (~62 kB/kus namiesto pôvodných ~1,5 MB `.jpg`).
  Zobrazujú sa v sekcii **Naša ponuka**, nie v sekcii Produkt – tá zostáva
  zameraná len na zloženie základnej (Classic) verzie.

**GIF (plechovka na skale, 1280×720, 240 snímok, 29 MB).** Pôvodný súbor mal
dva problémy: (1) drobné texty na etikete sú AI-generovaná "kaša" (napr.
"Ocarana · Green Tas · Agüne Herts", "FRENIUM EUROPEAN BLEND", objem sa medzi
snímkami mení z 500 ml na 300 ml) a (2) 29 MB GIF by v hero sekcii zničil
výkon stránky. Riešenie:
- GIF bol prekonvertovaný (`ffmpeg`) na krátku **ambientnú slučku** – zmenšený
  rozmer, 15 fps, mierne rozostrenie a stmavenie → `hero-atmosphere.webm`
  (≈230 kB) + `.mp4` fallback (≈280 kB), spolu **~100× menšie** než originál.
  Rozostrenie zotrie presne tie drobné texty, ktoré boli nezrozumiteľné,
  zatiaľ čo samotný nápis "TATRA BUDIČ" a siluety hôr zostávajú čitateľné.
- Video beží stlmené, na slučke, len ako atmosféra za hero textom (ktorý má
  vlastnú gradientovú podložku pre kontrast) – nikdy ako "čítateľný" produktový
  záber. Pri `prefers-reduced-motion` sa video zastaví na statickom poster
  frame (`hero-poster.jpg`).
- **Odporúčanie pred reálnym spustením:** pred ostrým nasadením dajte urobiť
  skutočný produktový fotenie/video etikety – súčasný klip je vhodný len ako
  dočasná atmosféra, nie ako dôkaz finálneho obalu.

## 7. Dizajnový systém (v2)

- **Farby:** `forest-*` (tmavá lesná zelená → biela, v Tailwind configu) pre
  branding; nová `ink-*` škála (skutočná čierna/strieborná, bez zeleného
  podtónu) pre sekciu Tím, aby "čierna + strieborná" z brífu dostala vlastný,
  odlíšený priestor od zeleno-čiernej značky. Akcent zostáva `emerald-*`.
- **Typografia:** nadpisy **Space Grotesk** (geometrický grotesk – rovnaký
  duch ako u Red Bull/Vercel/GymBeam), telo **Inter**. Predchádzajúca verzia
  používala pätkové písmo (Fraunces), ktoré viac pôsobilo ako "bylinný čaj" než
  startup s energy drinkom – zámena sedí lepšie k zadanej inšpirácii.
- **Glassmorphism:** `.glass-dark` / `.glass-light` v `globals.css` – použité
  na navbar (pri scrolle) a KPI karty; nie je nanútené všade, aby zostal efekt
  výrazný práve tam, kde dáva zmysel.
- **Scroll reveal:** `components/Reveal.tsx` – jeden tlmený efekt (fade + posun),
  nie kaskáda animácií na každom prvku; rešpektuje `prefers-reduced-motion`.
- **Farebný rytmus sekcií** je zámerný, nie striedanie pre efekt: Hero (video)
  → Produkt (biela) → Naša ponuka (svetlá) → Výhody (svetlá) → O nás (zelená tma)
  → Tím (čierna/striebro) → Realizácia (biela, čitateľná pre dlhší text)
  → KPI (zelená tma, dashboard) → Kontakt (biela, pokojná pre formulár).

## 8. Databáza

Aplikácia **funguje aj bez pripojenej databázy** – `lib/db.ts` používa dátové
úložisko v pamäti (mock dáta pre 3 produkty – Classic/Exotic/Tropical,
objednávky sa ukladajú počas behu servera). Je pripravená tak, aby sa dala
pripojiť na skutočnú PostgreSQL databázu len úpravou tohto jedného súboru –
presne to je aj náplň **Iterácie 2** v sekcii "Realizácia projektu" na webe.

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

### Možnosť B – Supabase (aj Neon funguje analogicky)

1. Vytvorte projekt na [supabase.com](https://supabase.com) (alebo [neon.tech](https://neon.tech)).
2. V **SQL Editor** spustite obsah `database/schema.sql`.
3. V **Project Settings → API** skopírujte URL a kľúče do `.env.local`
   (pozri `.env.example`).
4. `npm install @supabase/supabase-js`.
5. V `lib/db.ts` nahraďte telo funkcií verziou so Supabase klientom – kód je
   pripravený v komentári na začiatku súboru.

## 9. KPI – odôvodnenie

| KPI | Čo meriame | Cieľ | Spôsob merania |
| --- | --- | --- | --- |
| Zákaznícky dopyt po väčšom objeme | Priemerný počet plechoviek na objednávku | > 4 ks | `orders` tabuľka v PostgreSQL (Supabase/Neon) |
| Konverzný pomer objednávkového formulára | Odoslané objednávky ÷ návštevy sekcie Kontakt | ≥ 8 % | počet riadkov v `orders` vs. Vercel Analytics |
| Počet vracajúcich sa návštevníkov | Podiel návštevníkov, ktorí sa vrátia do 30 dní | ≥ 20 % | Vercel Analytics (alebo `localStorage` pri MVP) |

Prvé KPI bolo dané zadaním. Ďalšie dve boli vybrané tak, aby spolu pokrývali
tri odlišné otázky včasného startupu – **dopyt** (chcú si ľudia kúpiť viac?),
**presvedčivosť webu** (presvedčí návštevníka k objednaniu?) a **udržanie
záujmu** (vracajú sa?) – namiesto toho, aby všetky tri merali to isté.

## 10. Nasadenie na GitHub a Vercel

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
4. Ak pripájate databázu, doplňte premenné prostredia zo sekcie 8 v
   **Settings → Environment Variables** (alebo cez prepojenie Vercel Postgres,
   ktoré ich doplní automaticky).
5. Klik na **Deploy** – o pár desiatok sekúnd je stránka live na
   `<project>.vercel.app`.

Ďalšie nasadenia sa spustia automaticky pri každom `git push` do vetvy `main`.

## 11. Poznámky k zadaniu

- Platby **nie sú implementované** – formulár len uloží objednávku (v pamäti,
  prípadne v pripojenej databáze) a vráti potvrdenie.
- Obsah webu je v slovenčine; texty o produkte sú vymyslené pre účely tohto
  školského projektu. Mená a role v sekcii "Náš tím" zodpovedajú zadaniu.
- Dizajn vychádza z farebnej palety tmavá lesná zelená / smaragdová / čierna /
  biela / strieborná, s motívom Vysokých Tatier a prémiovou nápojovou identitou.
