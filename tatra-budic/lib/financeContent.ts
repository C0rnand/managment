/**
 * Obsah 6. zadania – Finančná analýza (projekt Tatra Budič / TABU).
 *
 * Zdroj všetkých textov a čísel pre PDF na odovzdanie do Teamsu (PDF sa generuje z týchto údajov,
 * generátor nie je súčasť repozitára). Web zobrazuje už len tlačidlo na hotové PDF –
 * pozri components/PdfDownloads.tsx; po zmene údajov tu sa PDF samo neprepíše.
 *
 * Sumy sa NEPÍŠU ručne, ale dopočítavajú sa z konštánt nižšie (ceny, kurz, hodiny, objemy),
 * takže súčty v tabuľkách vždy sedia. Ceny predaja a výroby sú spoločné s business case
 * (UNIT v lib/businessCaseContent.ts), časový rámec s lib/schedule.ts.
 *
 * Čísla z cudzích zdrojov majú odkaz [n] na SOURCES, vlastné odhady sú označené slovom „odhad“.
 * Každá položka tabuľky je zaokrúhlená na celé eurá a súčty sú súčtom zaokrúhlených položiek.
 */

import {
  SOURCES as BUSINESS_CASE_SOURCES,
  TEAM,
  UNIT,
} from "./businessCaseContent";
import { SCHEDULE_END, SCHEDULE_START, TOTAL_DAYS, addDays, daysBetween, formatDMY } from "./schedule";

// ---------------------------------------------------------------------------
// Zdroje (poradie = číslo v hranatej zátvorke; zoradené podľa prvého výskytu v texte)
// ---------------------------------------------------------------------------

export interface Source {
  key: string;
  title: string;
  url: string;
}

const businessCaseSource = (key: string): Source => {
  const found = BUSINESS_CASE_SOURCES.find((source) => source.key === key);
  if (!found) throw new Error(`Neznámy zdroj: ${key}`);
  return found;
};

export const SOURCES: Source[] = [
  {
    key: "ecb",
    title: "ECB: Euro foreign exchange reference rates (12. 11. 2026) – 1 € = 1,1081 USD",
    url: "https://www.ecb.europa.eu/stats/shared/pdf/eurofxref.pdf",
  },
  {
    key: "minwage",
    title: "Podnikajte.sk: Minimálna mzda v roku 2026 – 915 € mesačne, 5,259 € za hodinu (1. stupeň)",
    url: "https://www.podnikajte.sk/pracovne-pravo-bozp/minimalna-mzda-2026-tabulka",
  },
  {
    key: "salary",
    title: "Platy.sk: JavaScript programátor – 10 % respondentov zarába menej ako 1 853 € hrubého mesačne (n = 197)",
    url: "https://www.platy.sk/en/salaryinfo/information-technology/javascript-programmer",
  },
  businessCaseSource("vat"),
  businessCaseSource("tax"),
  businessCaseSource("plechovka"),
  businessCaseSource("svachovka"),
  {
    key: "sknic",
    title: "SK-NIC: Registrátorské poplatky (od 1. 4. 2025) – obnova domény .sk na 1 rok za 10 € bez DPH",
    url: "https://sk-nic.sk/wp-content/uploads/dokumenty/Registratorske_poplatky_2025_04_01.pdf",
  },
  businessCaseSource("vercel"),
  businessCaseSource("supabase"),
  businessCaseSource("eu1169"),
  {
    key: "trade",
    title: "Právne noviny: Ako si založiť živnosť – správny poplatok za ohlásenie voľnej živnosti 7 € (elektronicky zadarmo)",
    url: "https://pravnenoviny.sk/ako-si-zalozit-zivnost-kompletny-sprievodca-pre-zacinajucich-podnikatelov/3/",
  },
  {
    key: "vercelPro",
    title: "Vercel: Pro plan – 20 USD mesačne za platformu (1 miesto na nasadzovanie a 20 USD kreditu), každé ďalšie miesto 20 USD mesačne",
    url: "https://vercel.com/docs/plans/pro-plan",
  },
  {
    key: "stripe",
    title: "Stripe: Pricing (EHP) – bežné európske karty 1,5 % + 0,25 € za transakciu",
    url: "https://stripe.com/ie/pricing",
  },
  {
    key: "levies",
    title: "Podnikajte.sk: Minimálne odvody SZČO od 1. 1. 2026 – ≈ 425 € mesačne (sociálne + zdravotné poistenie)",
    url: "https://www.podnikajte.sk/socialne-a-zdravotne-odvody/minimalne-odvody-szco-od-1-1-2026",
  },
];

/** ref("ecb", "minwage") → "[1][2]" */
function ref(...keys: string[]): string {
  return keys
    .map((key) => {
      const index = SOURCES.findIndex((source) => source.key === key);
      if (index < 0) throw new Error(`Chýba zdroj: ${key}`);
      return `[${index + 1}]`;
    })
    .join("");
}

// ---------------------------------------------------------------------------
// Formátovanie
// ---------------------------------------------------------------------------

const NBSP = " ";
const MINUS = "−";
const round = Math.round;

/** 12345 → "12 345" (pevná medzera), bez znamienka */
const group = (n: number) => String(Math.abs(round(n))).replace(/\B(?=(\d{3})+(?!\d))/g, NBSP);
/** −754 → "−754", 1450 → "1 450" */
const signed = (n: number) => `${round(n) < 0 ? MINUS : ""}${group(n)}`;
/** 1450 → "1 450 €" */
export const money = (n: number) => `${signed(n)}${NBSP}€`;
/** (970, 1225) → "970 – 1 225 €"; ak je niektoré záporné: "−754 až −1 807 €" */
const fromTo = (a: number, b: number) =>
  round(a) < 0 || round(b) < 0 ? `${signed(a)} až ${money(b)}` : `${signed(a)} – ${money(b)}`;
/** 2.2587 → "2,26" */
const dec2 = (n: number) => n.toFixed(2).replace(".", ",");
/** 0.3 → "0,30 €" */
const eur2 = (n: number) => `${dec2(n)}${NBSP}€`;
const roundTo = (n: number, step: number) => round(n / step) * step;

// ---------------------------------------------------------------------------
// Predpoklady a čísla, z ktorých sa skladajú tabuľky
// ---------------------------------------------------------------------------

// Obdobie: prvý rok od štartu projektu (začiatok harmonogramu), vývoj končí podľa Ganttu
const [startYear, startMonth, startDay] = SCHEDULE_START.split("-").map(Number);
const pad = (n: number) => String(n).padStart(2, "0");
export const PERIOD_START = SCHEDULE_START;
export const PERIOD_END = addDays(`${startYear + 1}-${pad(startMonth)}-${pad(startDay)}`, -1);
const periodText = `${formatDMY(PERIOD_START)} – ${formatDMY(PERIOD_END)}`;
const DEV_WEEKS = round(TOTAL_DAYS / 7); // 12 týždňov vývoja
const OP_MONTHS = round(daysBetween(SCHEDULE_END, PERIOD_END) / 30.4375); // 9 mesiacov prevádzky

// Kurz a ceny služieb v USD
const USD_PER_EUR = 1.1081; // ECB, 12. 11. 2026
const USD_RATE_TEXT = String(USD_PER_EUR).replace(".", ","); // "1,1081"
const VERCEL_PRO_USD = 20; // za mesiac, 1 miesto na nasadzovanie
const SUPABASE_PRO_USD = 25; // za mesiac
const DOMAIN_NET_EUR = 10; // SK-NIC, 1 rok bez DPH
const GATEWAY_PERCENT = 0.015; // Stripe, bežné európske karty
const GATEWAY_FIXED_EUR = 0.25;
const TRADE_FEE_EUR = 7; // ohlásenie voľnej živnosti papierovo (elektronicky 0 €)
const MIN_LEVIES_EUR_PER_MONTH = 425.03; // minimálne odvody SZČO od 1. 1. 2026

// Vlastná práca tímu
const TEAM_SIZE = TEAM.length;
const HOURS_PER_PERSON_WEEK = 5;
const MAINTENANCE_HOURS_PER_MONTH = 4; // spolu za celý tím
const MIN_WAGE_PER_HOUR = 5.26; // 5,259 € (1. stupeň, 2026)
const PROGRAMMER_MONTHLY_EUR = 1853; // dolná decila hrubého platu JS programátora
const HOURS_PER_MONTH = (40 * 52) / 12; // 173,3 h
const PROGRAMMER_PER_HOUR = PROGRAMMER_MONTHLY_EUR / HOURS_PER_MONTH; // 10,69 €/h

const devHours = TEAM_SIZE * HOURS_PER_PERSON_WEEK * DEV_WEEKS; // 240 h
const maintenanceHours = MAINTENANCE_HOURS_PER_MONTH * OP_MONTHS; // 36 h

// Produkt (spoločné s business case)
const PRICE = UNIT.priceEur; // 2,90 € s DPH
const VAT = UNIT.vatRate; // 23 %
const TAX_PER_CAN = UNIT.taxEurPerLitre * UNIT.canLitres; // 0,099 €
const NET_PER_CAN = PRICE / (1 + VAT) - TAX_PER_CAN; // ≈ 2,26 €
const CAN_COST_OPT = UNIT.readyCanLowEur; // 1,94 €
const CAN_COST_PES = UNIT.readyCanHighEur; // 2,45 €
const BATCH = UNIT.minBatchCans; // 500 ks
const SOLD_OPT = BATCH; // optimisticky sa predá celá séria
const SOLD_PES = round(BATCH * 0.6); // pesimisticky 60 % série
const CANS_PER_ORDER = 4; // cieľ KPI č. 1 (priemerne > 4 ks na objednávku)
const CAN_WEIGHT_KG = 0.27;

// Odhady, ktoré nemáme podložené cenovou ponukou (označené v texte „odhad“)
const POSTERS_EUR = 20;
const TRANSPORT = { opt: 60, pes: 120 };
const LAB = { opt: 200, pes: 400 };
const SAMPLES = { opt: 100, pes: 200 };

// ----------------------------- A. Web (realizujeme) -----------------------------

const domainEur = round(DOMAIN_NET_EUR * (1 + VAT)); // 12 €
const reserveEur = round(0.1 * (domainEur + POSTERS_EUR)); // 3 €
const cashA = domainEur + POSTERS_EUR + reserveEur; // 35 €
const perPersonA = round(cashA / TEAM_SIZE); // 9 €

const devLabour = { opt: round(devHours * MIN_WAGE_PER_HOUR), pes: round(devHours * PROGRAMMER_PER_HOUR) };
const maintLabour = {
  opt: round(maintenanceHours * MIN_WAGE_PER_HOUR),
  pes: round(maintenanceHours * PROGRAMMER_PER_HOUR),
};
const labourA = { opt: devLabour.opt + maintLabour.opt, pes: devLabour.pes + maintLabour.pes };
const totalA = { opt: cashA + labourA.opt, pes: cashA + labourA.pes };

// ----------------------- B. Výroba a predaj (nerealizujeme) -----------------------

const productionOpt = round(BATCH * CAN_COST_OPT); // 970 €
const productionPes = round(BATCH * CAN_COST_PES); // 1 225 €
const trade = { opt: 0, pes: TRADE_FEE_EUR };
const oneTime = {
  opt: productionOpt + TRANSPORT.opt + LAB.opt + trade.opt + SAMPLES.opt,
  pes: productionPes + TRANSPORT.pes + LAB.pes + trade.pes + SAMPLES.pes,
};

const vercelEur = round((VERCEL_PRO_USD * 12) / USD_PER_EUR); // 217 €
const supabaseEur = round((SUPABASE_PRO_USD * 12) / USD_PER_EUR); // 271 €
const ordersOpt = SOLD_OPT / CANS_PER_ORDER;
const ordersPes = SOLD_PES / CANS_PER_ORDER;
const gatewayPerOrder = GATEWAY_FIXED_EUR + GATEWAY_PERCENT * CANS_PER_ORDER * PRICE; // ≈ 0,42 €
const gateway = { opt: round(ordersOpt * gatewayPerOrder), pes: round(ordersPes * gatewayPerOrder) };
const recurring = {
  opt: vercelEur + supabaseEur + domainEur + gateway.opt,
  pes: vercelEur + supabaseEur + domainEur + gateway.pes,
};
const costsB = { opt: oneTime.opt + recurring.opt, pes: oneTime.pes + recurring.pes };

const grossOpt = round(SOLD_OPT * PRICE);
const grossPes = round(SOLD_PES * PRICE);
const vatOpt = round(grossOpt - grossOpt / (1 + VAT));
const vatPes = round(grossPes - grossPes / (1 + VAT));
const taxOpt = round(SOLD_OPT * TAX_PER_CAN);
const taxPes = round(SOLD_PES * TAX_PER_CAN);
const netB = { opt: grossOpt - vatOpt - taxOpt, pes: grossPes - vatPes - taxPes };
const resultB = { opt: netB.opt - costsB.opt, pes: netB.pes - costsB.pes };
const resultNoVatB = { opt: resultB.opt + vatOpt, pes: resultB.pes + vatPes };
const perPersonUpfront = { opt: roundTo(oneTime.opt / TEAM_SIZE, 10), pes: roundTo(oneTime.pes / TEAM_SIZE, 10) };
const perPersonLoss = { opt: roundTo(-resultB.opt / TEAM_SIZE, 10), pes: roundTo(-resultB.pes / TEAM_SIZE, 10) };

// Jednotková ekonomika (na 1 plechovku) a bod zlomu
const unitGateway = gatewayPerOrder / CANS_PER_ORDER; // ≈ 0,11 €
const unitTransport = { opt: TRANSPORT.opt / BATCH, pes: TRANSPORT.pes / BATCH };
const unitMargin = {
  opt: NET_PER_CAN - CAN_COST_OPT - unitTransport.opt - unitGateway,
  pes: NET_PER_CAN - CAN_COST_PES - unitTransport.pes - unitGateway,
};
const fixedCosts = {
  opt: LAB.opt + trade.opt + SAMPLES.opt + vercelEur + supabaseEur + domainEur,
  pes: LAB.pes + trade.pes + SAMPLES.pes + vercelEur + supabaseEur + domainEur,
};
const breakEvenCans = unitMargin.opt > 0 ? roundTo(fixedCosts.opt / unitMargin.opt, 100) : null;
const breakEvenBatches = breakEvenCans ? round(breakEvenCans / BATCH) : null;

const platformYear = vercelEur + supabaseEur + domainEur; // 500 €
const platformShare = round((platformYear / netB.opt) * 100);
const leviesYear = round(MIN_LEVIES_EUR_PER_MONTH * 12);
const leviesVsNet = Math.round((leviesYear / netB.opt) * 10) / 10;

// ---------------------------------------------------------------------------
// Typy tabuliek
// ---------------------------------------------------------------------------

export type Tone = "ok" | "conditional" | "no";
export type ItemTag = "Máme" | "Chýba" | "Riziko";

export interface FinRow {
  label: string;
  /** druh nákladu: „jednorazový · priamy · peňažný“ */
  kind?: string;
  opt: number;
  pes: number;
  unit?: "€" | "ks" | "€/ks";
  basis: string;
  style?: "normal" | "subtotal" | "total" | "result";
}

export interface FinGroup {
  title: string;
  rows: FinRow[];
}

export interface FinTable {
  id: string;
  title: string;
  lead: string;
  verdict: string;
  tone: Tone;
  groups: FinGroup[];
}

/** Text v bunke tabuľky podľa jednotky riadka. */
export function formatCell(row: FinRow, value: number): string {
  if (row.unit === "ks") return `${group(value)}${NBSP}ks`;
  if (row.unit === "€/ks") {
    const sign = value < -0.005 ? MINUS : row.style === "result" && value > 0.005 ? "+" : "";
    return `${sign}${dec2(Math.abs(value))}${NBSP}€`;
  }
  return money(value);
}

// ---------------------------------------------------------------------------
// Hlavička a výsledok v skratke
// ---------------------------------------------------------------------------

export const META = {
  kicker: "6. zadanie",
  statusLine: "termín odovzdania 22. 11. 2026",
  title: "Finančná analýza",
  lead: `Koľko nás Tatra Budič bude stáť za prvých 12 mesiacov (${periodText}), z čoho to zaplatíme a či je projekt z finančného hľadiska uskutočniteľný. Analyzujeme dve veci oddelene: webový koncept, ktorý realizujeme, a výrobu a predaj skutočného nápoja, ktorú sme v 5. zadaní zamietli. Sumy sú v eurách, každá položka je zaokrúhlená na celé eurá; čísla z cudzích zdrojov majú odkaz [n], vlastné odhady sú označené slovom „odhad“ a pri každej položke uvádzame predpoklad.`,
};

export const SUMMARY = {
  label: "Výsledok v skratke",
  title: `Web nás stojí ≈ ${money(cashA)} a zvládneme ho sami, výroba nápoja by bola stratová aj v najlepšom prípade`,
  text: `Webový koncept nie je určený na zisk: za 12 mesiacov nás stojí ≈ ${money(cashA)} v hotovosti, ktoré pokryjeme z vlastných zdrojov (≈ ${perPersonA} € na osobu), takže nepotrebuje externé financovanie. Výroba a predaj nápoja by skončili stratou ${fromTo(resultB.opt, resultB.pes)}, ešte pred prvým predajom by sme museli zaplatiť ${fromTo(oneTime.opt, oneTime.pes)} a na nulu by sme sa dostali až pri predaji ${breakEvenCans ? `≈ ${group(breakEvenCans)}${NBSP}ks ročne (≈ ${breakEvenBatches}-násobok série)` : "nekonečného množstva kusov"} – a to len pri najnižšej cene výroby. Preto výrobu – tak ako v 5. zadaní – nerealizujeme.`,
  stats: [
    {
      value: `≈ ${money(cashA)}`,
      label: "peňažné výdavky webu za 12 mesiacov, financované z vlastných zdrojov",
    },
    {
      value: `≈ ${fromTo(labourA.opt, labourA.pes)}`,
      label: "hodnota vlastnej práce tímu (nepeňažný náklad, nikto nie je platený)",
    },
    {
      value: fromTo(resultB.opt, resultB.pes),
      label: "výsledok výroby nápoja za rok – strata aj v optimistickom scenári",
    },
    {
      value: breakEvenCans ? `≈ ${group(breakEvenCans)}${NBSP}ks` : "nikdy",
      label: `ročný predaj, pri ktorom by sa výroba dostala na nulu – a to len pri najnižšej cene výroby (séria má ${BATCH} ks)`,
    },
  ],
};

// ---------------------------------------------------------------------------
// Predpoklady
// ---------------------------------------------------------------------------

export const ASSUMPTIONS = {
  title: "Východiská a predpoklady",
  rows: [
    {
      label: "Obdobie",
      value: `12 mesiacov: ${periodText}`,
      why: `od štartu projektu; vývoj webu trvá do ${formatDMY(SCHEDULE_END)} (Ganttov diagram), potom nasleduje ${OP_MONTHS} mesiacov prevádzky.`,
    },
    {
      label: "Kurz",
      value: `1 € = ${USD_RATE_TEXT} USD`,
      why: `ceny Vercelu a Supabase sú v dolároch, prepočítané referenčným kurzom ECB z 12. 11. 2026 ${ref("ecb")}.`,
    },
    {
      label: "Ocenenie vlastnej práce",
      value: `${dec2(MIN_WAGE_PER_HOUR)} – ${dec2(PROGRAMMER_PER_HOUR)} € / h`,
      why: `dolná hranica = minimálna hodinová mzda od 1. 1. 2026 ${ref("minwage")}; horná = dolná decila hrubého platu JavaScript programátora (${group(PROGRAMMER_MONTHLY_EUR)} € mesačne ÷ ${dec2(HOURS_PER_MONTH).replace(",00", "")} h) ${ref("salary")}; bez odvodov zamestnávateľa.`,
    },
    {
      label: "Čas tímu",
      value: `${devHours} h vývoja + ${maintenanceHours} h údržby`,
      why: `odhad: ${TEAM_SIZE} členovia × ${HOURS_PER_PERSON_WEEK} h týždenne × ${DEV_WEEKS} týždňov vývoja; po nasadení ${MAINTENANCE_HOURS_PER_MONTH} h mesačne pre celý tím × ${OP_MONTHS} mesiacov.`,
    },
    {
      label: "Predajná cena",
      value: `${eur2(PRICE)} / ks (330 ml) s DPH`,
      why: `DPH ${round(VAT * 100)} % ${ref("vat")} a daň zo sladených nápojov ${eur2(UNIT.taxEurPerLitre)} / l ≈ ${eur2(TAX_PER_CAN)} / ks ${ref("tax")}; čistý výnos ≈ ${eur2(NET_PER_CAN)} na plechovku.`,
    },
    {
      label: "Cena výroby",
      value: `${eur2(CAN_COST_OPT)} – ${eur2(CAN_COST_PES)} / ks, séria ${BATCH} ks`,
      why: `hotová plechovka s vlastnou potlačou u malého výrobcu, bez dopravy ${ref("plechovka")}; najmenšia nami nájdená séria 330 ml má ${BATCH} ks ${ref("svachovka")}.`,
    },
    {
      label: "Objem predaja",
      value: `${group(SOLD_PES)} – ${group(SOLD_OPT)} ks za rok`,
      why: `odhad: pesimisticky sa predá 60 % série, optimisticky celá séria; dopyt zatiaľ nemáme overený. Objednávka ≈ ${CANS_PER_ORDER} ks (cieľ KPI č. 1).`,
    },
  ],
};

// ---------------------------------------------------------------------------
// A. Projekt, ktorý realizujeme: web
// ---------------------------------------------------------------------------

export const TABLE_A: FinTable = {
  id: "web",
  title: "Projekt, ktorý realizujeme: web TABU s ukážkovými objednávkami",
  lead: `Web (Next.js na Verceli, databáza v Supabase) vyvíjame popri štúdiu a nič nepredáva – objednávky sú ukážkové, bez platby a doručenia. Peňažne nás preto stojí takmer nič; skutočným nákladom je čas tímu, ktorý uvádzame zvlášť ako nepeňažný náklad.`,
  verdict: "Stratový, ale zvládnuteľný",
  tone: "ok",
  groups: [
    {
      title: "Peňažné výdavky",
      rows: [
        {
          label: "Doména .sk",
          kind: "pravidelný · priamy",
          opt: domainEur,
          pes: domainEur,
          basis: `SK-NIC účtuje registrátorom ${DOMAIN_NET_EUR} € bez DPH za rok ${ref("sknic")}, s DPH ${round(VAT * 100)} % ≈ ${dec2(DOMAIN_NET_EUR * (1 + VAT))} €; cena u registrátora sa môže líšiť (odhad). Doména nie je povinná – web beží aj na adrese Vercelu zadarmo.`,
        },
        {
          label: "Hosting a nasadenie (Vercel Hobby)",
          kind: "pravidelný · priamy",
          opt: 0,
          pes: 0,
          basis: `Plán Hobby je zadarmo, ale len na nekomerčné použitie ${ref("vercel")} – pre web bez platieb stačí.`,
        },
        {
          label: "Databáza (Supabase Free)",
          kind: "pravidelný · priamy",
          opt: 0,
          pes: 0,
          basis: `Free plán: 500 MB, po týždni bez aktivity sa projekt pozastaví ${ref("supabase")}; pre ukážkové objednávky stačí.`,
        },
        {
          label: "Propagácia na kampuse",
          kind: "jednorazový · priamy",
          opt: POSTERS_EUR,
          pes: POSTERS_EUR,
          basis: "odhad: ≈ 20 plagátov A3 s QR kódom na web po ≈ 1 €; bez platenej reklamy. Slúži na meranie KPI (návštevnosť, formulár).",
        },
        {
          label: "Rezerva na nepredvídané výdavky",
          kind: "≈ 10 % ostatných položiek",
          opt: reserveEur,
          pes: reserveEur,
          basis: "odhad (napr. dotlač plagátov, poplatok za presun domény).",
        },
        {
          label: "Peňažné výdavky spolu",
          opt: cashA,
          pes: cashA,
          basis: "to jediné, čo reálne vyjde z peňaženky.",
          style: "subtotal",
        },
      ],
    },
    {
      title: "Vlastná práca tímu (nepeňažný náklad – nikto nie je platený)",
      rows: [
        {
          label: "Vývoj webu",
          kind: "jednorazový · priamy",
          opt: devLabour.opt,
          pes: devLabour.pes,
          basis: `odhad: ${devHours} h × ${dec2(MIN_WAGE_PER_HOUR)} € (optimistický) alebo × ${dec2(PROGRAMMER_PER_HOUR)} € (pesimistický) ${ref("minwage", "salary")}.`,
        },
        {
          label: "Správa a údržba po nasadení",
          kind: "pravidelný · nepriamy",
          opt: maintLabour.opt,
          pes: maintLabour.pes,
          basis: `odhad: ${maintenanceHours} h (opravy, kontrola databázy, vyhodnotenie KPI) × rovnaké sadzby.`,
        },
        {
          label: "Hodnota vlastnej práce spolu",
          opt: labourA.opt,
          pes: labourA.pes,
          basis: "oportunitný náklad – čas, ktorý by tím mohol využiť inak.",
          style: "subtotal",
        },
        {
          label: "Náklady spolu (peňažné + vlastná práca)",
          opt: totalA.opt,
          pes: totalA.pes,
          basis: "celková „cena“ projektu, keby sme všetko ocenili.",
          style: "total",
        },
      ],
    },
    {
      title: "Príjmy a zdroje financovania",
      rows: [
        {
          label: "Predaj",
          kind: "príjem",
          opt: 0,
          pes: 0,
          basis: "web nič nepredáva – objednávky sú ukážkové (5. zadanie).",
        },
        {
          label: "Granty a sponzori",
          kind: "zdroj financovania",
          opt: 0,
          pes: 0,
          basis: "nezabezpečené, s nimi nerátame.",
        },
        {
          label: "Vlastné zdroje členov tímu",
          kind: "zdroj financovania",
          opt: cashA,
          pes: cashA,
          basis: `kryjú všetky peňažné výdavky, ≈ ${perPersonA} € na osobu.`,
        },
      ],
    },
    {
      title: "Výsledok",
      rows: [
        {
          label: "Peňažný výsledok za 12 mesiacov",
          opt: -cashA,
          pes: -cashA,
          basis: "strata pokrytá vlastnými zdrojmi; dodatočné financovanie 0 €.",
          style: "result",
        },
        {
          label: "Výsledok vrátane hodnoty vlastnej práce",
          opt: -totalA.opt,
          pes: -totalA.pes,
          basis: "nie je to výdavok z peňaženky, ide o ocenený čas tímu.",
          style: "result",
        },
      ],
    },
  ],
};

// ---------------------------------------------------------------------------
// B. Výroba a predaj nápoja (nerealizujeme)
// ---------------------------------------------------------------------------

export const TABLE_B: FinTable = {
  id: "production",
  title: "Scenár, ktorý nerealizujeme: výroba a predaj nápoja",
  lead: `Pre porovnanie spočítame jednu pilotnú sériu ${BATCH} ks hotových plechoviek (najmenšia, akú sme našli ${ref("svachovka")}) a jej predaj cez web za ${eur2(PRICE)} počas 12 mesiacov. Optimistický scenár = najnižšie náklady a predá sa celá séria; pesimistický = najvyššie náklady a predá sa 60 % série. Vlastnú prácu tímu (rovnakú ako v časti A) tu nerátame – porovnávame len peniaze.`,
  verdict: "Stratový · treba dodatočné financovanie",
  tone: "no",
  groups: [
    {
      title: "Jednorazové náklady (platia sa pred prvým predajom)",
      rows: [
        {
          label: `Výroba pilotnej série ${BATCH} ks`,
          kind: "jednorazový · priamy",
          opt: productionOpt,
          pes: productionPes,
          basis: `${BATCH} ks × ${eur2(CAN_COST_OPT)} (optimistický) alebo × ${eur2(CAN_COST_PES)} (pesimistický) ${ref("plechovka")}; séria sa objednáva naraz a platí vopred.`,
        },
        {
          label: "Doprava série od výrobcu",
          kind: "jednorazový · priamy",
          opt: TRANSPORT.opt,
          pes: TRANSPORT.pes,
          basis: `odhad: ≈ ${round(BATCH * CAN_WEIGHT_KG)} kg tovaru (${BATCH} ks × ≈ ${dec2(CAN_WEIGHT_KG)} kg), kuriér alebo paleta; ponuku dopravcu sme nevyžiadali.`,
        },
        {
          label: "Laboratórna kontrola receptúry a označenia",
          kind: "jednorazový · priamy",
          opt: LAB.opt,
          pes: LAB.pes,
          basis: `odhad: overenie kofeínu (limit 150 mg/l), cukru a údajov na etikete ${ref("eu1169")}; cenovú ponuku laboratória sme nevyžiadali.`,
        },
        {
          label: "Živnosť – ohlásenie",
          kind: "jednorazový · priamy",
          opt: trade.opt,
          pes: trade.pes,
          basis: `správny poplatok ${TRADE_FEE_EUR} €, elektronicky zadarmo ${ref("trade")}; bez živnosti nemôžeme nápoj legálne predávať.`,
        },
        {
          label: "Vzorky a propagácia",
          kind: "jednorazový · priamy",
          opt: SAMPLES.opt,
          pes: SAMPLES.pes,
          basis: "odhad: vzorky zadarmo na ochutnávky na kampuse a plagáty.",
        },
        {
          label: "Jednorazové náklady spolu",
          opt: oneTime.opt,
          pes: oneTime.pes,
          basis: "hotovosť potrebná vopred, ešte pred prvým predajom.",
          style: "subtotal",
        },
      ],
    },
    {
      title: "Pravidelné náklady (12 mesiacov)",
      rows: [
        {
          label: "Vercel Pro",
          kind: "pravidelný · priamy",
          opt: vercelEur,
          pes: vercelEur,
          basis: `${VERCEL_PRO_USD} USD mesačne ${ref("vercelPro")} × 12 = ${VERCEL_PRO_USD * 12} USD ÷ ${USD_RATE_TEXT} ${ref("ecb")}; Hobby je len na nekomerčné použitie, predaj už komerčný je ${ref("vercel")}. Rátame 1 miesto na nasadzovanie.`,
        },
        {
          label: "Supabase Pro",
          kind: "pravidelný · priamy",
          opt: supabaseEur,
          pes: supabaseEur,
          basis: `${SUPABASE_PRO_USD} USD mesačne × 12 = ${SUPABASE_PRO_USD * 12} USD ÷ ${USD_RATE_TEXT} ${ref("supabase")}; Free plán sa po týždni bez aktivity pozastaví a nemá automatické zálohy – na skutočné objednávky nestačí.`,
        },
        {
          label: "Doména .sk",
          kind: "pravidelný · priamy",
          opt: domainEur,
          pes: domainEur,
          basis: "ako v časti A.",
        },
        {
          label: "Poplatky platobnej brány (Stripe)",
          kind: "variabilný · priamy",
          opt: gateway.opt,
          pes: gateway.pes,
          basis: `${dec2(GATEWAY_PERCENT * 100)} % + ${eur2(GATEWAY_FIXED_EUR)} za transakciu (bežné európske karty) ${ref("stripe")}; objednávka ≈ ${CANS_PER_ORDER} ks × ${eur2(PRICE)} = ${eur2(CANS_PER_ORDER * PRICE)}, poplatok ≈ ${eur2(gatewayPerOrder)}; ${ordersOpt} resp. ${ordersPes} objednávok.`,
        },
        {
          label: "Pravidelné náklady spolu",
          opt: recurring.opt,
          pes: recurring.pes,
          basis: "platené plány, doména a poplatky brány (pri väčšom predaji vyššie).",
          style: "subtotal",
        },
        {
          label: "Náklady spolu za 12 mesiacov",
          opt: costsB.opt,
          pes: costsB.pes,
          basis: "bez vlastnej práce tímu a bez odvodov (pozri časť C).",
          style: "total",
        },
      ],
    },
    {
      title: "Príjmy",
      rows: [
        {
          label: "Predané plechovky",
          kind: "objem",
          opt: SOLD_OPT,
          pes: SOLD_PES,
          unit: "ks",
          basis: "odhad: celá séria, resp. 60 % série; dopyt zatiaľ nemáme overený.",
        },
        {
          label: `Tržby s DPH (${eur2(PRICE)} / ks)`,
          kind: "príjem z predaja",
          opt: grossOpt,
          pes: grossPes,
          basis: "predaj priamo cez web, bez sprostredkovateľa.",
        },
        {
          label: `DPH ${round(VAT * 100)} %`,
          kind: "odvod štátu",
          opt: -vatOpt,
          pes: -vatPes,
          basis: `základná sadzba od 1. 1. 2026 ${ref("vat")}; rátame, že cena na webe je s DPH a my ju odvádzame.`,
        },
        {
          label: "Daň zo sladených nápojov",
          kind: "odvod štátu",
          opt: -taxOpt,
          pes: -taxPes,
          basis: `${eur2(UNIT.taxEurPerLitre)} / l × ${dec2(UNIT.canLitres)} l × počet kusov ${ref("tax")}.`,
        },
        {
          label: "Čisté tržby",
          opt: netB.opt,
          pes: netB.pes,
          basis: "to, čo nám z predaja reálne zostane.",
          style: "total",
        },
      ],
    },
    {
      title: "Výsledok",
      rows: [
        {
          label: "Hotovosť potrebná vopred",
          opt: oneTime.opt,
          pes: oneTime.pes,
          basis: `jednorazové náklady; na člena tímu ≈ ${money(perPersonUpfront.opt)} – ${money(perPersonUpfront.pes)}.`,
          style: "subtotal",
        },
        {
          label: "Výsledok za 12 mesiacov",
          opt: resultB.opt,
          pes: resultB.pes,
          basis: `čisté tržby − náklady; strata sa nevráti, na člena tímu ≈ ${money(perPersonLoss.opt)} – ${money(perPersonLoss.pes)}.`,
          style: "result",
        },
      ],
    },
  ],
};

export const TABLE_UNIT: FinTable = {
  id: "unit",
  title: "Kde skončí 2,90 € z jednej plechovky",
  lead: "Jednotková ekonomika zo scenára B: koľko z jednej predanej plechovky zostane na krytie fixných nákladov (laboratórium, propagácia, Vercel Pro, Supabase Pro, doména).",
  verdict: "",
  tone: "no",
  groups: [
    {
      title: "Na 1 plechovku",
      rows: [
        { label: "Predajná cena s DPH", opt: PRICE, pes: PRICE, unit: "€/ks", basis: "cena z webu." },
        {
          label: "DPH",
          opt: -(PRICE - PRICE / (1 + VAT)),
          pes: -(PRICE - PRICE / (1 + VAT)),
          unit: "€/ks",
          basis: `${round(VAT * 100)} % ${ref("vat")}.`,
        },
        {
          label: "Daň zo sladených nápojov",
          opt: -TAX_PER_CAN,
          pes: -TAX_PER_CAN,
          unit: "€/ks",
          basis: `${eur2(UNIT.taxEurPerLitre)} / l × ${dec2(UNIT.canLitres)} l ${ref("tax")}.`,
        },
        {
          label: "Čistý výnos",
          opt: NET_PER_CAN,
          pes: NET_PER_CAN,
          unit: "€/ks",
          basis: "po odpočítaní DPH a dane.",
          style: "subtotal",
        },
        {
          label: "Výroba hotovej plechovky",
          opt: -CAN_COST_OPT,
          pes: -CAN_COST_PES,
          unit: "€/ks",
          basis: `cena u malého výrobcu ${ref("plechovka")}.`,
        },
        {
          label: "Doprava od výrobcu (podiel na 1 ks)",
          opt: -unitTransport.opt,
          pes: -unitTransport.pes,
          unit: "€/ks",
          basis: `odhad: ${money(TRANSPORT.opt)} resp. ${money(TRANSPORT.pes)} ÷ ${BATCH} ks.`,
        },
        {
          label: "Poplatok platobnej brány",
          opt: -unitGateway,
          pes: -unitGateway,
          unit: "€/ks",
          basis: `${eur2(gatewayPerOrder)} na objednávku ÷ ${CANS_PER_ORDER} ks ${ref("stripe")}.`,
        },
        {
          label: "Zostane na krytie fixných nákladov",
          opt: unitMargin.opt,
          pes: unitMargin.pes,
          unit: "€/ks",
          basis: "pri cene výroby 2,45 € sa z každej predanej plechovky tratí.",
          style: "result",
        },
      ],
    },
  ],
};

/** Tri krátke poznámky pod tabuľkou scenára B. */
export const NOTES_B = [
  {
    title: "Peniaze chýbajú už v prvý deň",
    text: `Výrobu, laboratórium a ďalšie jednorazové položky platíme vopred, ešte pred prvým predajom: ${fromTo(oneTime.opt, oneTime.pes)} (≈ ${money(perPersonUpfront.opt)} – ${money(perPersonUpfront.pes)} na člena tímu). Z predaja sa nám vráti len časť.`,
  },
  {
    title: "Aj bez DPH by sme boli v strate",
    text: `Keby sme DPH neodvádzali (odhad: neplatca), výsledok by sa zlepšil o ${fromTo(vatPes, vatOpt)}, ale zostal by stratový: ${fromTo(resultNoVatB.opt, resultNoVatB.pes)}.`,
  },
  {
    title: "Bod zlomu je mimo dosahu",
    text: breakEvenCans
      ? `Z jednej plechovky zostane po variabilných nákladoch najviac ≈ ${eur2(unitMargin.opt)}, pri cene výroby ${eur2(CAN_COST_PES)} sa tratí ≈ ${eur2(-unitMargin.pes)}. Fixné náklady sú ≈ ${fromTo(fixedCosts.opt, fixedCosts.pes)}, takže v najlepšom prípade by sme museli predať ≈ ${group(breakEvenCans)} ks za rok (≈ ${breakEvenBatches} sérií po ${BATCH} ks) a pri vyššej cene výroby sa bod zlomu nedosiahne nikdy.`
      : `Z jednej plechovky sa po variabilných nákladoch tratí, takže bod zlomu sa nedosiahne nikdy.`,
  },
];

// ---------------------------------------------------------------------------
// C. Finančné vyhodnotenie
// ---------------------------------------------------------------------------

export const EVALUATION = {
  title: "Finančné vyhodnotenie",
  lead: "Porovnanie odhadovaných nákladov a príjmov so zdrojmi financovania – a odpoveď na otázku zadania: ziskový, stratový, alebo potrebuje dodatočné financovanie?",
  columns: ["Scenár", "Peňažné náklady", "Čisté príjmy", "Výsledok", "Financovanie", "Záver"],
  rows: [
    {
      name: "A · Web (realizujeme)",
      cost: money(cashA),
      income: money(0),
      result: money(-cashA),
      financing: `vlastné zdroje tímu, ≈ ${perPersonA} € na osobu; externé financovanie netreba`,
      verdict: "Stratový, ale zvládnuteľný – realizujeme",
      tone: "ok" as Tone,
    },
    {
      name: `B · Výroba a predaj (${BATCH} ks)`,
      cost: fromTo(costsB.opt, costsB.pes),
      income: fromTo(netB.pes, netB.opt),
      result: fromTo(resultB.opt, resultB.pes),
      financing: `vopred ${fromTo(oneTime.opt, oneTime.pes)}, strata sa nevráti – treba externé zdroje, ktoré nemáme`,
      verdict: "Stratový, bod zlomu mimo dosahu – nerealizujeme",
      tone: "no" as Tone,
    },
  ],
  verdict: `Obidva scenáre sú stratové. Web (A) je stratový len o ≈ ${money(cashA)} v hotovosti a tie zaplatíme sami, takže dodatočné financovanie nepotrebuje a vieme ho udržať aj po semestri. Výroba a predaj nápoja (B) by potrebovali ${fromTo(oneTime.opt, oneTime.pes)} vopred, skončili by stratou ${fromTo(resultB.opt, resultB.pes)} a nemáme zdroj, ktorý by ju pokryl – preto ju nerealizujeme.`,
  sustainabilityTitle: "Dlhodobá udržateľnosť a riziká",
  sustainability: [
    {
      tag: "Máme" as ItemTag,
      text: `Web po semestri: na bezplatných plánoch Vercel Hobby a Supabase Free ${ref("vercel", "supabase")} nás prevádzka stojí 0 € mesačne; v ďalšom roku by pribudla len doména (≈ ${domainEur} €). Preto ho vieme udržať ako portfólio bez externého financovania.`,
    },
    {
      tag: "Riziko" as ItemTag,
      text: `Supabase Free sa po týždni bez aktivity pozastaví ${ref("supabase")}. Preto rátame ≈ ${MAINTENANCE_HOURS_PER_MONTH} h mesačne na kontrolu; ak ju nikto robiť nebude, ukážkové objednávky prestanú fungovať.`,
    },
    {
      tag: "Riziko" as ItemTag,
      text: `Prechod k reálnemu predaju by znamenal platené plány a doménu za ≈ ${money(platformYear)} ročne ešte pred výrobou – to je ≈ ${platformShare} % čistých tržieb celej série v optimistickom scenári.`,
    },
    {
      tag: "Riziko" as ItemTag,
      text: `Do výpočtu sme nezahrnuli odvody: minimálne odvody živnostníka sú od 1. 1. 2026 ≈ ${money(MIN_LEVIES_EUR_PER_MONTH)} mesačne ${ref("levies")} (≈ ${money(leviesYear)} ročne); študenti a zamestnaní majú osobitné pravidlá, ktoré sme nepreverili. Po skončení štúdia by táto jediná položka bola ≈ ${String(leviesVsNet).replace(".", ",")}-krát vyššia než čisté tržby celej série.`,
    },
    {
      tag: "Chýba" as ItemTag,
      text: "Zdroj financovania: nemáme grant, sponzora ani rozpočet, takže by výrobu platili členovia tímu z vlastného vrecka.",
    },
  ],
  changeTitle: "Čo by zmenilo záver",
  change: [
    {
      title: "Zdroj peňazí",
      text: `Sponzor alebo grant, ktorý by pokryl ≈ ${money(oneTime.pes)} vopred a platené plány Vercel a Supabase.`,
    },
    {
      title: "Cena od výrobcu",
      text: `Ponuka výrazne pod čistým výnosom ≈ ${eur2(NET_PER_CAN)} na plechovku; najlepšia, ktorú sme našli, je ${eur2(CAN_COST_OPT)} za kus – po ďalších nákladoch nám z plechovky zostane ≈ ${eur2(unitMargin.opt)}.`,
    },
    {
      title: "Overený dopyt",
      text: "Predpredaj (platba vopred) by znížil potrebu predfinancovania. KPI z webu ukážu, či o plechovku niekto stojí – zatiaľ to nemáme overené.",
    },
  ],
};

export const PDF_DOWNLOAD = {
  href: "/TABU-6-zadanie-financna-analyza.pdf",
  title: "6. zadanie ako PDF",
  text: "Finančná analýza v jednom dokumente (A4) – rovnaké tabuľky a čísla ako na tejto stránke.",
  button: "Otvoriť PDF",
};
