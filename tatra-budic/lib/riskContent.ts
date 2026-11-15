/**
 * Obsah 7. zadania – Analýza rizík (projekt Tatra Budič / TABU).
 *
 * Zdroj všetkých textov a čísel pre PDF na odovzdanie do Teamsu (PDF sa generuje z týchto údajov,
 * generátor nie je súčasť repozitára). Web zobrazuje už len tlačidlo na hotové PDF –
 * pozri components/PdfDownloads.tsx; po zmene údajov tu sa PDF samo neprepíše.
 *
 * Skóre priority (pravdepodobnosť × dopad), pásma, matica 5 × 5 aj súhrnné počty sa DOPOČÍTAVAJÚ
 * z hodnôt `p` a `d` pri jednotlivých rizikách – stačí upraviť odhad a všetko ostatné sedí.
 * Termíny a počty dní sa berú z lib/schedule.ts, mená a roly z TEAM v lib/businessCaseContent.ts.
 *
 * Čísla z cudzích zdrojov majú odkaz [n] na SOURCES, odhady pravdepodobnosti a dopadu sú
 * odhady tímu (nie štatistika) a pri každom je krátke zdôvodnenie.
 */

import { SOURCES as BUSINESS_CASE_SOURCES, TEAM } from "./businessCaseContent";
import { PERIOD_END } from "./financeContent";
import {
  CRITICAL_PATH,
  SCHEDULE_END,
  TASKS,
  addDays,
  daysBetween,
  durationDays,
  formatDMY,
  shiftDays,
} from "./schedule";

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
  businessCaseSource("supabase"),
  {
    key: "vercelCron",
    title:
      "Vercel: Cron Jobs – Usage & Pricing – plán Hobby: cron najviac raz denne, presnosť ±59 minút",
    url: "https://vercel.com/docs/cron-jobs/usage-and-pricing",
  },
  {
    key: "gdpr",
    title:
      "GDPR, čl. 13 – informácie, ktoré sa majú poskytnúť, ak sa osobné údaje získavajú od dotknutej osoby (gdpr-text.com)",
    url: "https://gdpr-text.com/sk/read/article-13/",
  },
  {
    key: "supabaseRls",
    title:
      "Supabase: Hardening the Data API – „Enable RLS on every table and view exposed through the Data API“",
    url: "https://supabase.com/docs/guides/api/hardening-data-api",
  },
  {
    key: "uvz",
    title:
      "ÚVZ SR: Usmernenie pre uplatňovanie nariadenia (ES) č. 1924/2006 o výživových a zdravotných tvrdeniach (14. 12. 2007; usmernenie nemá formálne právne postavenie)",
    url: "https://www.uvzsr.sk/documents/d/uvz/usmernenie_pre_uplatnovanie_nariadenia_1924_2006_sk-pdf",
  },
  {
    key: "rollback",
    title:
      "Vercel: Instant Rollback – na plane Hobby návrat na bezprostredne predchádzajúce nasadenie; po návrate sa vypne automatické priraďovanie produkčných domén",
    url: "https://vercel.com/docs/instant-rollback",
  },
  {
    key: "tatra",
    title:
      "MediaGuru: Tatra Trucks – ochrana značky Tatra je kľúčovou prioritou (rozhovor s marketingovým manažérom Tatra Trucks)",
    url: "https://www.mediaguru.cz/tatra-trucks-ochrana-znacky-tatra-je-klicovou-prioritou",
  },
];

/** ref("supabase", "gdpr") → "[1][3]" */
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
// Stupnice a pásma priority
// ---------------------------------------------------------------------------

export type Level = 1 | 2 | 3 | 4 | 5;
export type BandKey = "low" | "medium" | "high" | "critical";

export interface BandInfo {
  key: BandKey;
  label: string;
  min: number;
  max: number;
  /** čo s rizikom robíme */
  action: string;
}

export const BANDS: BandInfo[] = [
  { key: "low", label: "nízka", min: 1, max: 4, action: "sledujeme, bez zvláštnych opatrení" },
  { key: "medium", label: "stredná", min: 5, max: 9, action: "opatrenie plánujeme a robíme v rámci bežnej práce" },
  { key: "high", label: "vysoká", min: 10, max: 14, action: "opatrenie má pevného garanta a termín" },
  { key: "critical", label: "kritická", min: 15, max: 25, action: "riešime hneď, o stave informujeme každý týždeň" },
];

export function bandOf(score: number): BandInfo {
  const found = BANDS.find((band) => score >= band.min && score <= band.max);
  if (!found) throw new Error(`Skóre mimo stupnice: ${score}`);
  return found;
}

export const PROBABILITY_SCALE: { value: Level; name: string; text: string }[] = [
  { value: 1, name: "veľmi nízka", text: "nastane len vo výnimočnom prípade (do ≈ 10 %)" },
  { value: 2, name: "nízka", text: "nastane ojedinele (≈ 10 – 30 %)" },
  { value: 3, name: "stredná", text: "môže nastať, ale aj nemusí (≈ 30 – 50 %)" },
  { value: 4, name: "vysoká", text: "nastane skôr áno než nie (≈ 50 – 80 %)" },
  { value: 5, name: "veľmi vysoká", text: "nastáva už teraz alebo takmer iste (nad ≈ 80 %)" },
];

export const IMPACT_SCALE: { value: Level; name: string; text: string }[] = [
  { value: 1, name: "zanedbateľný", text: "nikto si nevšimne, oprava do hodiny" },
  { value: 2, name: "malý", text: "zlyhá drobná funkcia, oprava do 1 dňa, výstupy zadaní nie sú dotknuté" },
  { value: 3, name: "stredný", text: "zlyhá dôležitá funkcia webu alebo musíme zúžiť rozsah, oprava trvá dni" },
  { value: 4, name: "vysoký", text: "nesplníme termín alebo časť zadania, prípadne sú dáta či KPI nepoužiteľné" },
  { value: 5, name: "kritický", text: "web nemožno odovzdať ani ukázať, alebo trvalo prídeme o dáta" },
];

// ---------------------------------------------------------------------------
// Dátumy a čísla z harmonogramu
// ---------------------------------------------------------------------------

function task(id: number) {
  const found = TASKS.find((item) => item.id === id);
  if (!found) throw new Error(`Chýba úloha #${id}`);
  return found;
}

const t6 = task(6);
const t7 = task(7);
const t8 = task(8);

const SHIFT_6 = shiftDays(t6); // o koľko sa #6 posunula oproti pôvodnému plánu
const DAYS_LEFT = daysBetween(t7.start, SCHEDULE_END) + 1; // dni, ktoré zostávajú na #7 a #8
const DAYS_T8 = durationDays(t8);
const END_TEXT = formatDMY(SCHEDULE_END);

const PANEL_MIN_DONE = addDays(t7.start, 7); // minimum admin panela hotové
const CHECK_DAY = addDays(t6.end, 7); // týždeň po pripojení databázy
const FREEZE_DAY = addDays(SCHEDULE_END, -2); // posledné 2 dni už len opravy chýb
const DELETE_DAY = "2026-12-31"; // dokedy zmažeme objednávky

const NBSP = " ";
const HORIZON_TEXT = formatDMY(PERIOD_END);

// ---------------------------------------------------------------------------
// Riziká
// ---------------------------------------------------------------------------

const [LEAD, ANALYST, DEV, DESIGNER] = TEAM;

export interface Owner {
  name: string;
  role: string;
}

export interface RiskInput {
  id: string;
  title: string;
  /** čo sa môže stať */
  what: string;
  /** aké to má dôsledky pre projekt */
  effect: string;
  p: Level;
  pWhy: string;
  d: Level;
  dWhy: string;
  /** ako riziku predchádzame */
  prevent: string[];
  /** čo urobíme, ak riziko nastane */
  ifHappens: string;
  /** včasné varovanie – podľa čoho zistíme, že riziko nastáva */
  trigger: string;
  owner: Owner;
  /** termín zavedenia opatrení, "RRRR-MM-DD" */
  due: string;
  /** odhad práce na opatrenia v hodinách (peňažný náklad je 0 €) */
  hours: number;
  /** odhad po zavedení opatrení */
  residual: { p: Level; d: Level; why: string };
}

export interface Risk extends RiskInput {
  score: number;
  band: BandInfo;
  residualScore: number;
  residualBand: BandInfo;
  dueText: string;
}

const RISK_INPUT: RiskInput[] = [
  {
    id: "R1",
    title: "Oneskorenie harmonogramu bez rezervy",
    what: `Kritická cesta ${CRITICAL_PATH.map((id) => `#${id}`).join(" → ")} nemá žiadnu rezervu a projekt končí ${END_TEXT}. Úloha #6 (API a databáza) sa už raz posunula o ${SHIFT_6} dní oproti pôvodnému plánu a nadväzujú na ňu administrátorský panel (#7) a testovanie s nasadením (#8).`,
    effect:
      "Ak sa #6 alebo #7 posunie ešte raz, testovanie sa stlačí do pár dní: chyby ostanú v odovzdanej verzii alebo musíme vypustiť funkcie administrátorského panelu.",
    p: 4,
    pWhy: `Už raz nastalo: #6 sa posunula o ${SHIFT_6} dní a na #7 a #8 zostáva dokopy ${DAYS_LEFT} dní bez akejkoľvek rezervy.`,
    d: 4,
    dWhy: "Oneskorenie na kritickej ceste posúva koniec projektu jeden k jednému; pri pevnom termíne by sme museli vypustiť funkcie alebo odovzdať neotestovaný web.",
    prevent: [
      `Rozsah #7 rozdelíme na minimum (prihlásenie a zoznam objednávok) a doplnky (správa produktov). Minimum musí byť hotové do ${formatDMY(PANEL_MIN_DONE)}, doplnky vypustíme, ak sa to nestihne.`,
      `Testovanie (#8) začneme už počas #7 na hotových častiach (formulár, API, stránky), aby na posledných ${DAYS_T8} dní nezostalo všetko naraz.`,
      "Každý pondelok 15 minút porovnáme stav s Ganttovým diagramom; pri odchýlke nad 2 dni vedúci rozhodne o vypustení funkcie.",
    ],
    ifHappens:
      "Administrátorský panel zredukujeme na čítanie objednávok a všetok zvyšný čas venujeme testovaniu a nasadeniu.",
    trigger: `V ${formatDMY(PANEL_MIN_DONE)} ešte nie je v paneli zobraziteľný zoznam objednávok.`,
    owner: LEAD,
    due: PANEL_MIN_DONE,
    hours: 2,
    residual: {
      p: 3,
      d: 3,
      why: "Rezervu v pevnom termíne nevytvoríme, ale vopred dohodnuté vypustenie funkcií zmenšuje dôsledok a včasné varovanie skracuje reakciu.",
    },
  },
  {
    id: "R2",
    title: "Objednávky sa potichu ukladajú len do pamäte",
    what: "Kód v lib/db.ts má pre prípad, že nie sú nastavené kľúče k Supabase, náhradné „ukážkové“ úložisko v pamäti. Ak v nasadení premenné chýbajú alebo majú iný názov (kód podporuje dve schémy názvov), formulár hlási úspech, no objednávka sa uloží len do pamäte servera a pri ďalšom nasadení alebo reštarte zmizne. Zoznam produktov a objednávok sa pri chybe databázy podobne potichu nahradí ukážkovými dátami.",
    effect:
      "Prichádzame o objednávky bez varovania, KPI konverzného pomeru (počet riadkov v tabuľke orders) je nepravdivé a pri prezentácii ukážeme úspešnú objednávku, ktorá v databáze neexistuje.",
    p: 3,
    pWhy: "Premenné sa nastavujú ručne alebo cez integráciu a chybu nikto nehlási – prejaví sa až pri kontrole tabuľky.",
    d: 4,
    dWhy: "Stratené objednávky sa nedajú dodatočne zrekonštruovať a KPI zo 3. zadania by stratilo zmysel.",
    prevent: [
      "V produkcii (premenná VERCEL_ENV = production) nesmie formulár pri chýbajúcich kľúčoch uložiť „ukážkovú“ objednávku, ale vráti chybu, ktorú už vie zobraziť (úprava lib/db.ts).",
      "Po každom nasadení urobíme testovaciu objednávku a skontrolujeme, že sa objavila v tabuľke orders v Supabase (postup doplníme do README); testovacie riadky potom zmažeme.",
    ],
    ifHappens:
      "Opravíme premenné prostredia a web nasadíme znova; KPI od posledného úspešného testu nezapočítame do vyhodnotenia.",
    trigger: "Testovacia objednávka sa po nasadení nezobrazí v tabuľke orders.",
    owner: DEV,
    due: t6.end,
    hours: 2,
    residual: {
      p: 2,
      d: 2,
      why: "Chyba sa už nedá prehliadnuť – formulár ukáže chybu a test po nasadení ju odhalí.",
    },
  },
  {
    id: "R3",
    title: "Pozastavenie databázy Supabase po týždni bez aktivity",
    what: `Bezplatný plán Supabase pozastaví projekt po týždni bez aktivity a nemá automatické zálohy ${ref("supabase")}. Náš web je školský projekt, ktorý po prezentáciách nikto pravidelne nenavštevuje. Po pozastavení formulár vráti chybu a zoznam objednávok v administrátorskom paneli (#7) by sa pri chybe databázy nahradil ukážkovými dátami (funkcia getOrders).`,
    effect:
      "Objednávky prestanú fungovať a panel zobrazuje nepravdivé dáta, kým niekto projekt ručne neobnoví v Supabase.",
    p: 4,
    pWhy: `Do ${HORIZON_TEXT} (koniec 12-mesačného obdobia z finančnej analýzy) budú týždne bez jedinej návštevy bežné; chránia nás len dni prezentácií.`,
    d: 3,
    dWhy: "Zlyhá hlavná funkcia webu (odoslanie objednávky) a údaje v paneli, ale ostatný web funguje.",
    prevent: [
      `Denná úloha (Vercel cron) zavolá jednoduchý endpoint, ktorý prečíta produkty z databázy; plán Hobby dovoľuje cron najviac raz denne s presnosťou ±59 minút ${ref("vercelCron")}, čo na to stačí.`,
      "Po 8 dňoch bez návštevy skontrolujeme v Supabase, že projekt nie je pozastavený; ak je, predpoklad o aktivite nesedí a prejdeme na ručnú kontrolu.",
      "Pravidelnú údržbu webu (kontrolu, že všetko beží) počítame už vo finančnej analýze, takže na ňu máme vyhradený čas aj po semestri.",
    ],
    ifHappens:
      "Projekt obnovíme v Supabase, otestujeme formulár a v paneli skontrolujeme, že nezobrazuje ukážkové dáta.",
    trigger: "Formulár vráti chybu servera alebo denná úloha skončí chybou vo Vercel logoch.",
    owner: DEV,
    due: CHECK_DAY,
    hours: 1,
    residual: {
      p: 2,
      d: 3,
      why: "Úloha by mohla zlyhať alebo nestačiť, preto pravdepodobnosť klesne len na nízku; dopad ostáva rovnaký, no výpadok odhalíme skôr.",
    },
  },
  {
    id: "R4",
    title: "Výpadok jediného programátora",
    what: `Všetku programátorskú prácu robí jeden člen tímu (rola ${DEV.role}). Na #7 a #8 zostáva ${DAYS_LEFT} dní a ak bude chorý alebo preťažený, vývoj sa zastaví – ostatní členovia sa venujú analýze a dizajnu, takže by prácu prevzali len pomaly.`,
    effect:
      "Úlohy #7 a #8 sa nestihnú v termíne, alebo web ostane v poslednej funkčnej verzii bez opráv.",
    p: 3,
    pWhy: "Na konci semestra býva viac povinností súčasne a stačí jedna absencia jediného programátora.",
    d: 4,
    dWhy: "Na kritickej ceste (#7 → #8) nie je náhrada, takže vývoj by stál celý.",
    prevent: [
      `Do ${formatDMY(CHECK_DAY)} overíme, že aspoň jeden ďalší člen (vedúci) vie nahrať zmenu do GitHub repozitára, vidí nasadenie vo Vercel a má prístup do Supabase podľa postupu v README.`,
      "Ak programátor nie je k dispozícii viac ako 3 dni, #7 zúžime na minimum (zoznam objednávok) – rozhodnutie je dohodnuté vopred, aby sa o ňom nediskutovalo.",
      "Rozpracované zmeny nahráva programátor na GitHub aspoň raz týždenne, aby sa nestratila práca ani prehľad o stave.",
    ],
    ifHappens:
      "Vedúci prevezme nasadenie a drobné opravy podľa README; väčšie funkcie vypustíme.",
    trigger: "Programátor 3 dni nereaguje alebo nahral zmeny naposledy pred viac ako týždňom.",
    owner: LEAD,
    due: CHECK_DAY,
    hours: 2,
    residual: {
      p: 2,
      d: 3,
      why: "Prevziať nasadenie a opravy vieme aj bez programátora; nové funkcie by sme však vypustili, preto dopad klesne len na stredný.",
    },
  },
  {
    id: "R5",
    title: "Zneužitie objednávkového formulára (spam)",
    what: "Formulár je verejný, bez captchy a bez limitu odoslaní; API /api/orders kontroluje len meno a e-mail. Dĺžka vstupov ani počet kusov nie sú obmedzené – pri pripojenej databáze skončí vstup dlhší ako 255 znakov chybou servera a bot môže poslať tisíce falošných objednávok.",
    effect: `Falošné objednávky skreslia dve z troch KPI (priemerný počet kusov a konverzný pomer, obe vychádzajú z tabuľky orders) a zahltia zoznam v administrátorskom paneli; 500 MB databázy na bezplatnom plane ${ref("supabase")} by sa zaplnilo až pri veľmi veľkom počte riadkov, mazať by sa však muselo ručne.`,
    p: 3,
    pWhy: "Verejný formulár bez ochrany nájdu automatické boty aj pri malom webe, ale návštevnosť je nízka.",
    d: 3,
    dWhy: "Dve KPI a zoznam objednávok by boli nepoužiteľné, no web aj databáza ostanú funkčné.",
    prevent: [
      "Server odmietne príliš dlhé vstupy a nezmyselné hodnoty: meno do 100 znakov, e-mail do 254, správa do 1 000 a počet kusov 1 – 20 (úprava app/api/orders/route.ts).",
      "Do formulára pridáme skryté pole (honeypot), ktoré človek nevyplní; objednávky s vyplneným poľom server zahodí.",
      "Pred vyhodnotením KPI tabuľku orders prejdeme a zjavné testovacie a spamové riadky z výpočtu vylúčime.",
    ],
    ifHappens:
      "Spamové riadky zmažeme v Supabase a pridáme prísnejšie obmedzenie, napríklad limit objednávok z jedného e-mailu za deň.",
    trigger: "V tabuľke orders pribudne za hodinu viac ako 20 objednávok.",
    owner: DEV,
    due: CHECK_DAY,
    hours: 2,
    residual: {
      p: 2,
      d: 2,
      why: "Jednoduché boty zastavia limity a honeypot, zostane len cielený útok, ktorý pri tomto webe nečakáme; spamové riadky vieme z KPI vylúčiť.",
    },
  },
  {
    id: "R6",
    title: "Osobné údaje bez poučenia a ochrany",
    what: `Formulár zbiera meno, e-mail a správu, no na stránke je len veta, že údaje použijeme v rámci univerzitného projektu. Chýba, kto údaje spracúva, na aký účel, ako dlho ich uchovávame a ako ich možno vymazať – pritom čl. 13 GDPR žiada pri získavaní údajov od osoby uviesť totožnosť a kontakt prevádzkovateľa, účel, dobu uchovania, práva vrátane vymazania a právo podať sťažnosť dozornému orgánu ${ref("gdpr")}. Schéma databázy v repozitári navyše nezapína ochranu na úrovni riadkov (RLS), ktorú Supabase odporúča pre každú tabuľku vystavenú cez Data API ${ref("supabaseRls")}.`,
    effect:
      "Návštevník alebo hodnotiteľ môže namietať, že údaje zbierame bez poučenia; e-maily v tabuľke orders nemajú druhú vrstvu ochrany, ak by sa nejaký kľúč dostal von. Právne následky by sme museli preveriť, istý je zásah do dôveryhodnosti projektu a nutnosť údaje dodatočne mazať a vysvetľovať.",
    p: 3,
    pWhy: "Poučenie chýba už dnes a formulár vyplnia aj skutoční spolužiaci a známi, nielen fiktívne údaje.",
    d: 3,
    dWhy: "Ide o školský projekt, nie o prevádzku firmy; hrozí hlavne strata dôvery a práca s dodatočným mazaním údajov.",
    prevent: [
      `Pod formulár pridáme krátke poučenie podľa čl. 13: kto údaje spracúva a kontakt (vedúci tímu), účel (ukážková objednávka v školskom projekte), doba uchovania (do ${formatDMY(DELETE_DAY)}), práva vrátane vymazania a sťažnosti ${ref("gdpr")}.`,
      "Pri formulári upozorníme, že ide o ukážku a stačia fiktívne údaje.",
      "Na tabuľke orders zapneme RLS bez politík; na serveri používame tajný kľúč, takže zápis z API má fungovať ďalej – overíme to testovacou objednávkou (viď R2).",
      `Po vyhodnotení KPI, najneskôr do ${formatDMY(DELETE_DAY)}, všetky objednávky zmažeme; ak formulár pobeží ďalej, mažeme ich vždy po 3 mesiacoch.`,
    ],
    ifHappens:
      "Na žiadosť o vymazanie riadok bez zbytočného odkladu zmažeme v Supabase a odpovieme e-mailom.",
    trigger: "Žiadosť o vymazanie alebo otázka, na čo údaje používame.",
    owner: ANALYST,
    due: t7.end,
    hours: 3,
    residual: {
      p: 2,
      d: 2,
      why: "Poučenie, krátka doba uchovania a vymazanie údajov znižujú pravdepodobnosť sporu aj jeho dôsledky.",
    },
  },
  {
    id: "R7",
    title: "Tvrdenia o produkte, ktoré nevieme podložiť",
    what: `Web tvrdí, že TABU je „prírodný energetický nápoj“ so „100 % prírodnými ingredienciami“, „bez umelých látok a náhleho poklesu výkonu“, a že guarana a zelený čaj „uvoľňujú energiu postupne, bez výkyvov“. Produkt zatiaľ neexistuje, receptúra nie je laboratórne overená a web neuvádza ani obsah kofeínu či cukru. Usmernenie ÚVZ SR k nariadeniu 1924/2006 považuje za zdravotné tvrdenie také, ktoré spája potravinu alebo jej zložku so zdravím či funkciou tela (napríklad „obsahuje antioxidanty“) ${ref("uvz")}; naše „postupné uvoľňovanie energie“ sa mu blíži. Výraz „prírodný“ usmernenie neposudzuje, jeho oprávnenosť preto sami potvrdiť nevieme.`,
    effect:
      "Návštevník by mohol web vziať za reálnu ponuku nápoja a veriť tvrdeniam, ktoré nemáme čím podložiť; pri skutočnom predaji by sme ich museli celé prepísať a podložiť.",
    p: 3,
    pWhy: "Tvrdenia sú na webe už dnes (úvodná sekcia, O nás, Výhody aj meta popis). Web síce uvádza, že ide o univerzitný projekt, ale pri tvrdeniach nie je napísané, že produkt neexistuje a zloženie je ilustračné.",
    d: 3,
    dWhy: "Poškodí dôveryhodnosť projektu; keďže nápoj nepredávame, ide hlavne o dôveryhodnosť, nie o priamu škodu.",
    prevent: [
      "Na viditeľné miesto (pod úvodnú sekciu a do päty) pridáme poznámku „Koncept – produkt zatiaľ neexistuje, zloženie a tvrdenia sú ilustračné“.",
      "Tvrdenia prepíšeme na cieľ alebo koncept: „100 % prírodné ingrediencie“ → „receptúra z prírodných extraktov (koncept)“; vety „bez umelých látok a náhleho poklesu výkonu“ a „bez výkyvov“ vypustíme z meta popisu, úvodu aj sekcie Výhody.",
      "Pred akýmkoľvek skutočným predajom dáme zloženie overiť v laboratóriu a znenie tvrdení právne skontrolovať; do tej doby nič nepredávame.",
    ],
    ifHappens:
      "Sporné tvrdenie hneď stiahneme z webu zmenou textu a novým nasadením.",
    trigger: "Otázka alebo komentár, či je nápoj skutočný a čo presne obsahuje.",
    owner: DESIGNER,
    due: PANEL_MIN_DONE,
    hours: 3,
    residual: {
      p: 2,
      d: 2,
      why: "Po poznámke o koncepte a opravených textoch je nepravdepodobné, že web niekto vezme za reálnu ponuku.",
    },
  },
  {
    id: "R8",
    title: "Chybné nasadenie v čase odovzdania",
    what: `Zmeny nahrávame cez webové rozhranie GitHubu bez lokálneho buildu a nasadenie na Vercel sa spustí automaticky pri každom pushi do vetvy main, takže chyba v kóde sa môže prejaviť až na ostrom webe. Na plane Hobby sa dá vrátiť len na bezprostredne predchádzajúce nasadenie ${ref("rollback")}.`,
    effect: `Nefunkčný web v čase odovzdania (${END_TEXT}) alebo prezentácie by znamenal nesplnené zadanie, aj keď je kód správny. Po návrate na staršiu verziu navyše Vercel vypne automatické priraďovanie produkčných domén, takže ďalšie nahratia sa neprejavia, kým rollback nezrušíme ${ref("rollback")}.`,
    p: 2,
    pWhy: "Chyba pri nasadení je možná pri každom nahratí, ale kritické je len niekoľko dní okolo odovzdania a prezentácie.",
    d: 4,
    dWhy: "Nefunkčný web v čase hodnotenia znamená nesplnené zadanie, aj keď je kód správny.",
    prevent: [
      "Zmeny nahráme najprv do novej vetvy; Vercel z nej vytvorí náhľad a do hlavnej vetvy ich zlúčime až po kontrole náhľadu.",
      `Od ${formatDMY(FREEZE_DAY)} (dva dni pred koncom) nahrávame už len opravy chýb a každé nasadenie kontrolujeme zvlášť, aby predchádzajúce nasadenie, na ktoré sa pri Hobby vieme vrátiť, bolo vždy funkčné.`,
      "Po každom nasadení prejdeme krátky zoznam: úvodná stránka, objednávka cez formulár (viď R2), sekcie Zadania a odkazy na PDF.",
    ],
    ifHappens: `Použijeme Instant Rollback na predchádzajúce nasadenie ${ref("rollback")}; potom chybu opravíme a rollback zrušíme povýšením (Promote) opraveného nasadenia, aby sa ďalšie nahratia opäť zobrazovali.`,
    trigger: "Build na Verceli zlyhá alebo kontrolný zoznam po nasadení neprejde.",
    owner: LEAD,
    due: t8.start,
    hours: 1,
    residual: {
      p: 1,
      d: 3,
      why: "Chybu zachytíme v náhľade skôr, než sa dostane na ostrý web, a návrat na predchádzajúcu verziu trvá okamžite.",
    },
  },
];

export const RISKS: Risk[] = RISK_INPUT.map((risk) => {
  const score = risk.p * risk.d;
  const residualScore = risk.residual.p * risk.residual.d;
  return {
    ...risk,
    score,
    band: bandOf(score),
    residualScore,
    residualBand: bandOf(residualScore),
    dueText: formatDMY(risk.due),
  };
});

// ---------------------------------------------------------------------------
// Matica 5 × 5 (pred opatreniami a po nich)
// ---------------------------------------------------------------------------

export type Phase = "before" | "after";

export interface MatrixCell {
  p: Level;
  d: Level;
  score: number;
  band: BandInfo;
  ids: string[];
}

const LEVELS: Level[] = [1, 2, 3, 4, 5];

/** Riadky matice zhora nadol: dopad 5 → 1; v každom riadku pravdepodobnosť 1 → 5. */
export function matrixRows(phase: Phase): MatrixCell[][] {
  return [...LEVELS].reverse().map((d) =>
    LEVELS.map((p) => ({
      p,
      d,
      score: p * d,
      band: bandOf(p * d),
      ids: RISKS.filter((risk) =>
        phase === "before" ? risk.p === p && risk.d === d : risk.residual.p === p && risk.residual.d === d,
      ).map((risk) => risk.id),
    })),
  );
}

// ---------------------------------------------------------------------------
// Súhrnné čísla
// ---------------------------------------------------------------------------

const countBand = (keys: BandKey[], phase: Phase) =>
  RISKS.filter((risk) => keys.includes(phase === "before" ? risk.band.key : risk.residualBand.key)).length;

export const STATS = {
  count: RISKS.length,
  top: RISKS.reduce((best, risk) => (risk.score > best.score ? risk : best), RISKS[0]),
  criticalBefore: countBand(["critical"], "before"),
  highBefore: countBand(["high"], "before"),
  highOrCriticalBefore: countBand(["high", "critical"], "before"),
  highOrCriticalAfter: countBand(["high", "critical"], "after"),
  topAfter: RISKS.reduce((best, risk) => (risk.residualScore > best.residualScore ? risk : best), RISKS[0]),
  hours: RISKS.reduce((sum, risk) => sum + risk.hours, 0),
};

const joinIds = (ids: string[]) => ids.join(", ");

// ---------------------------------------------------------------------------
// Hlavička a výsledok v skratke
// ---------------------------------------------------------------------------

export const META = {
  kicker: "7. zadanie",
  statusLine: "termín odovzdania 22. 11. 2026",
  title: "Analýza rizík",
  lead: `Riziká, ktoré môžu ohroziť úspešnú realizáciu webového konceptu Tatra Budič. Výrobu nápoja sme v 5. zadaní zamietli, preto riziká výroby tu neriešime. Vychádzame z toho, čo sme zistili priamo v našom kóde, harmonograme a v limitoch služieb, ktoré používame – nie zo všeobecného zoznamu rizík projektov. Každé riziko má popis a dôsledky, odhad pravdepodobnosti a dopadu na stupnici 1 – 5, prioritu ako ich súčin, stratégiu riešenia so zodpovednou osobou a termínom a zostatkovú prioritu po opatreniach. Čísla z cudzích zdrojov majú odkaz [n].`,
};

const byBand = (key: BandKey) => RISKS.filter((risk) => risk.band.key === key);
const lowerFirst = (text: string) => `${text.charAt(0).toLowerCase()}${text.slice(1)}`;
const named = (risks: Risk[]) =>
  risks.map((risk) => `${lowerFirst(risk.title)} (${risk.id})`).join(", ");

export const SUMMARY = {
  label: "Výsledok v skratke",
  title: `${STATS.count} rizík, z toho ${STATS.criticalBefore} kritické a ${STATS.highBefore} vysoké – opatrenia nás stoja ≈ ${STATS.hours}${NBSP}h práce a 0${NBSP}€ v hotovosti`,
  text: `Najvyššiu prioritu má ${lowerFirst(STATS.top.title)} (${STATS.top.id}, ${STATS.top.score} z 25): kritická cesta nemá rezervu a úloha #6 sa už posunula o ${SHIFT_6} dní. Vysokú prioritu majú: ${named(byBand("high"))}. Zvyšné riziká (${joinIds(byBand("medium").map((risk) => risk.id))}) sú stredné. Po zavedení opatrení by vo vysokom ani kritickom pásme nezostalo žiadne riziko; najvyššie ostane ${STATS.topAfter.id} (${STATS.topAfter.residualScore} z 25), lebo rezervu v pevnom termíne vytvoriť nevieme.`,
  stats: [
    {
      value: String(STATS.count),
      label: "rizík špecifických pre náš web, kód a tím (nie všeobecný zoznam)",
    },
    {
      value: `${STATS.top.score}${NBSP}/${NBSP}25`,
      label: `najvyššia priorita – ${STATS.top.id}, ${lowerFirst(STATS.top.title)}`,
    },
    {
      value: `${STATS.highOrCriticalBefore}${NBSP}→${NBSP}${STATS.highOrCriticalAfter}`,
      label: "rizík vo vysokom alebo kritickom pásme pred opatreniami a po nich",
    },
    {
      value: `≈ ${STATS.hours}${NBSP}h · 0${NBSP}€`,
      label: "odhad práce na všetky opatrenia; žiadne z nich nevyžaduje peňažný výdavok",
    },
  ],
};

// ---------------------------------------------------------------------------
// Metodika
// ---------------------------------------------------------------------------

export const METHOD = {
  title: "Ako riziká hodnotíme",
  lead: `Každé riziko ohodnotíme dvomi číslami na stupnici 1 – 5 (1 = veľmi nízka, 5 = veľmi vysoká): pravdepodobnosť, že nastane, a dopad, ak nastane. Hodnotíme obdobie do konca prevádzky webu, ${HORIZON_TEXT}. Priorita je ich súčin (1 – 25); čím vyššia, tým skôr riziko riešime. Hodnoty sú odhady tímu podľa stavu kódu, harmonogramu a overených limitov služieb, nie štatistika – preto je pri každej pravdepodobnosti a dopade krátke zdôvodnenie. Zostatková priorita je ten istý súčin po zavedení opatrení.`,
  probabilityTitle: "Pravdepodobnosť výskytu",
  impactTitle: "Dopad na projekt",
  bandsTitle: "Priorita = pravdepodobnosť × dopad",
};

export const MATRIX = {
  title: "Matica rizík",
  lead: "Každé riziko je v poli podľa svojej pravdepodobnosti (vodorovne) a dopadu (zvisle); farba poľa zodpovedá pásmu priority. Vľavo stav dnes, vpravo po zavedení opatrení.",
  beforeTitle: "Pred opatreniami",
  afterTitle: "Po opatreniach",
  xLabel: "pravdepodobnosť",
  yLabel: "dopad",
};

export const REGISTER = {
  title: "Register rizík",
  lead: "Hlavná tabuľka zadania. Riziká sú zoradené podľa priority od najvyššej; pri pravdepodobnosti a dopade je zdôvodnenie odhadu, v stĺpci Stratégia riešenia sú opatrenia, postup pri výskyte, signál včasného varovania, zodpovedný člen tímu, termín a odhadovaná práca. Zodpovednosť sme rozdelili podľa rolí v tíme.",
  // \u00AD = mäkký rozdeľovač: dlhé slovo sa v úzkom stĺpci zalomí, inak ostane celé
  columns: ["Riziko", "Pravdepo\u00ADdobnosť", "Dopad", "Priorita", "Stratégia riešenia"],
};

// ---------------------------------------------------------------------------
// Čo sme do registra nezaradili
// ---------------------------------------------------------------------------

export const NOT_INCLUDED = {
  title: "Čo sme do registra nezaradili a prečo",
  items: [
    {
      title: "Riziká výroby a predaja nápoja",
      text: "Výrobu sme v 5. zadaní zamietli ako finančne príliš náročnú, preto nehrozia riziká spojené s výrobcom plechoviek, minimálnou sériou, označením kofeínu, daňou zo sladených nápojov či vekovou hranicou pre predaj. Ak by sme sa k výrobe vrátili, bola by to nová analýza.",
    },
    {
      title: "Značka Tatra v názve",
      text: `Náš názov obsahuje slovo „Tatra“. Tatra Trucks uvádza, že pravidelne monitoruje trh a rieši neoprávnené používanie svojej značky, najčastejšie na propagačných predmetoch a materiáloch ${ref("tatra")}. Nepoužívame cudzie logo ani znak, register ochranných známok sme však nepreverili. Do registra ho preto nezaraďujeme, ale pred tlačeným propagačným materiálom alebo predajom by sme ho preverili.`,
    },
  ],
};

export const PDF_DOWNLOAD = {
  href: "/TABU-7-zadanie-analyza-rizik.pdf",
  title: "7. zadanie ako PDF",
  text: "Analýza rizík v jednom dokumente (A4, na šírku) – rovnaká matica a tabuľka ako na tejto stránke.",
  button: "Otvoriť PDF",
};
