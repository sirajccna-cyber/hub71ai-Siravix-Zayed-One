/**
 * Zayed One AI adapter.
 * Each function first tries a live AI provider (when configured server-side),
 * then falls back to deterministic demo intelligence. The UI never depends on
 * a live call succeeding.
 */
import { L } from "../i18n";
import type { Facts, Journey, LText, Mode, Profile } from "../types";

export type AIMode = "live" | "demo";
export const getAIMode = (): AIMode => "demo";

const wait = (ms: number) => new Promise((r) => setTimeout(r, ms));

/* ---------------- text normalisation ---------------- */
const NUM_WORDS: Record<string, number> = {
  one: 1, two: 2, three: 3, four: 4, five: 5, six: 6, seven: 7, eight: 8, nine: 9, ten: 10,
  eleven: 11, twelve: 12, fifteen: 15, twenty: 20, thirty: 30, forty: 40, fifty: 50, hundred: 100,
};
const AR_NUM: Array<[string, number]> = [
  ["خمسة عشر", 15], ["عشرين", 20], ["عشرون", 20], ["عشرة", 10], ["ثلاثين", 30], ["مائة", 100], ["مئة", 100],
  ["واحد", 1], ["اثنين", 2], ["اثنان", 2], ["ثلاثة", 3], ["أربعة", 4], ["خمسة", 5], ["ستة", 6], ["سبعة", 7], ["ثمانية", 8], ["تسعة", 9],
];
function norm(s: string) {
  let x = s.toLowerCase().replace(/[٠-٩]/g, (d) => String(d.charCodeAt(0) - 1632));
  for (const [w, n] of Object.entries(NUM_WORDS)) x = x.replace(new RegExp(`\\b${w}\\b`, "g"), String(n));
  for (const [w, n] of AR_NUM) x = x.split(w).join(` ${n} `);
  return x.replace(/\s+/g, " ");
}

const COUNTRIES: Array<[RegExp, LText]> = [
  [/\bindia\b|الهند|mumbai|bangalore|bengaluru|delhi|hyderabad|chennai/, L("India", "الهند")],
  [/\buk\b|united kingdom|britain|england|london|manchester|المملكة المتحدة|بريطانيا|لندن/, L("United Kingdom", "المملكة المتحدة")],
  [/\busa\b|\bus\b|united states|america|new york|san francisco|أمريكا|الولايات المتحدة/, L("United States", "الولايات المتحدة")],
  [/germany|berlin|munich|ألمانيا/, L("Germany", "ألمانيا")],
  [/france|paris|فرنسا|باريس/, L("France", "فرنسا")],
  [/pakistan|karachi|lahore|باكستان/, L("Pakistan", "باكستان")],
  [/egypt|cairo|مصر|القاهرة/, L("Egypt", "مصر")],
  [/philippines|manila|الفلبين/, L("Philippines", "الفلبين")],
  [/canada|toronto|كندا/, L("Canada", "كندا")],
  [/singapore|سنغافورة/, L("Singapore", "سنغافورة")],
  [/jordan|amman|الأردن/, L("Jordan", "الأردن")],
  [/spain|madrid|إسبانيا/, L("Spain", "إسبانيا")],
  [/netherlands|amsterdam|هولندا/, L("Netherlands", "هولندا")],
  [/sweden|stockholm|السويد/, L("Sweden", "السويد")],
  [/\beurope\b|أوروبا/, L("Europe", "أوروبا")],
];
const CITIES: Array<[RegExp, LText]> = [
  [/london|لندن/, L("London", "لندن")], [/mumbai/, L("Mumbai", "مومباي")], [/bangalore|bengaluru/, L("Bengaluru", "بنغالورو")],
  [/delhi/, L("Delhi", "دلهي")], [/berlin/, L("Berlin", "برلين")], [/paris|باريس/, L("Paris", "باريس")], [/cairo|القاهرة/, L("Cairo", "القاهرة")],
];
const PROFESSIONS: Array<[RegExp, LText]> = [
  [/cyber ?security|أمن سيبراني|الأمن السيبراني/, L("Cybersecurity Engineer", "مهندس أمن سيبراني")],
  [/\bai engineer|machine learning|ml engineer|ذكاء اصطناعي/, L("AI Engineer", "مهندس ذكاء اصطناعي")],
  [/data scien/, L("Data Scientist", "عالم بيانات")],
  [/software|developer|مطور|برمج/, L("Software Engineer", "مهندس برمجيات")],
  [/product manager/, L("Product Manager", "مدير منتجات")],
  [/doctor|physician|طبيب/, L("Doctor", "طبيب")],
  [/nurse|ممرض/, L("Nurse", "ممرض/ة")],
  [/teacher|معلم|مدرس/, L("Teacher", "معلم")],
  [/founder|مؤسس/, L("Startup Founder", "مؤسس شركة ناشئة")],
  [/investor|مستثمر/, L("Investor", "مستثمر")],
  [/student|طالب/, L("Student", "طالب")],
  [/engineer|مهندس/, L("Engineer", "مهندس")],
  [/remote|عن بعد|عن بُعد/, L("Remote Professional", "محترف يعمل عن بُعد")],
];
const INDUSTRIES: Array<[RegExp, LText]> = [
  [/fintech|financial/, L("Fintech", "التقنية المالية")],
  [/cyber/, L("Cybersecurity", "الأمن السيبراني")],
  [/health/, L("Healthtech", "التقنية الصحية")],
  [/\bai\b|artificial intelligence|ذكاء اصطناعي/, L("Artificial Intelligence", "الذكاء الاصطناعي")],
  [/energy|climate/, L("Energy & Climate", "الطاقة والمناخ")],
  [/logistics/, L("Logistics", "الخدمات اللوجستية")],
  [/software|saas|tech|تقنية|تكنولوجيا/, L("Technology", "التكنولوجيا")],
];

const find = <T,>(list: Array<[RegExp, T]>, s: string) => list.find(([r]) => r.test(s))?.[1];
const num = (re: RegExp, s: string) => {
  const m = s.match(re);
  return m?.[1] ? parseInt(m[1], 10) : undefined;
};

export function detectMode(text: string): Mode {
  const s = norm(text);
  return /we are|we're|our company|our team|employees|staff|company with|نحن شركة|شركتنا|موظف/.test(s) ? "company" : "person";
}

/* ---------------- analyzeProfile ---------------- */
function extract(text: string, mode: Mode): Facts {
  const s = norm(text);
  const f: Facts = { priorities: [] };
  f.country = find(COUNTRIES, s);
  f.city = find(CITIES, s);
  if (/within (\d+) days|(\d+) days|خلال (\d+) يوم/.test(s)) {
    const d = num(/(\d+) ?(?:days|يوم)/, s);
    if (d) f.timelineDays = d;
  } else {
    const m = num(/(\d+) ?(?:months|أشهر|شهر)/, s);
    if (m) f.timelineDays = m * 30;
  }
  if (f.timelineDays) f.timing = L(`Within ${f.timelineDays} days`, `خلال ${f.timelineDays} يوماً`);
  else if (/next year|العام المقبل/.test(s)) f.timing = L("Next year", "العام المقبل");

  if (mode === "person") {
    f.age = num(/\b(?:i'?m|i am|aged)\s+(\d{2})\b/, s) ?? num(/(\d{2}) ?(?:years old|سنة|عاماً)/, s);
    f.profession = find(PROFESSIONS, s);
    f.married = /married|wife|husband|spouse|partner|متزوج|زوجتي|زوجي|زوجة/.test(s) || undefined;
    const kids = num(/(\d+) ?(?:children|kids|sons|daughters|أطفال|أبناء)/, s);
    f.children = kids ?? (/طفلين/.test(s) ? 2 : /\bchild\b|\bbaby\b|طفل/.test(s) ? 1 : undefined);
    f.family = /family|families|عائل|أسرة/.test(s) || !!f.married || !!f.children || undefined;
    f.remote = /remote|عن بعد|عن بُعد/.test(s) || undefined;
    f.founder = /founder|startup|my own company|مؤسس|شركة ناشئة/.test(s) || undefined;
    f.investor = /invest|مستثمر|استثمار/.test(s) || undefined;
    const b = s.match(/(\d[\d,.]*\s?k?)\s?(aed|usd|dirham|درهم|دولار)/);
    if (b) f.budget = b[0].toUpperCase();
    if (/career|job|growth|promotion|وظيف|مهني|عمل/.test(s)) f.priorities.push("career");
    if (f.children || /school|education|مدرس|تعليم/.test(s)) f.priorities.push("school");
    if (f.family || /housing|home|apartment|villa|سكن|منزل/.test(s)) f.priorities.push("housing");
    if (/lifestyle|beach|culture|settle|quality of life|نمط|استقرار/.test(s)) f.priorities.push("lifestyle");
    if (f.founder || /business|company/.test(s)) f.priorities.push("business");
  } else {
    const nm = text.match(/(?:called|named|company name is)\s+([A-Z][\w&.-]*(?:\s[A-Z][\w&.-]*)*)/);
    if (nm) f.companyName = nm[1];
    f.industry = find(INDUSTRIES, s);
    const sentences = s.split(/[.!?؛\n]|, and|\band\b(?= \d)/);
    for (const sen of sentences) {
      const n = num(/(\d+)/, sen);
      if (n === undefined) continue;
      if (/relocat|move|transfer|نقل|ينتقل|سينتقل/.test(sen)) {
        const r = num(/(\d+) ?(?:employees|staff|people|team|موظف)/, sen) ?? (/founder/.test(sen) ? undefined : n);
        if (r !== undefined && f.relocating === undefined) f.relocating = r;
      } else if (/employees|staff|people|team|موظف/.test(sen) && f.employees === undefined) {
        f.employees = num(/(\d+) ?(?:employees|staff|people|موظف)/, sen) ?? n;
      }
    }
    f.founders = num(/(\d+) ?(?:co-?founders|founders|مؤسس)/, s);
    f.families = /famil|dependents|spouse|children|عائل|أسر/.test(s) || undefined;
    const fs = s.match(/pre-?seed|seed|series [abc]/);
    if (fs) f.fundingStage = fs[0].replace(/\b\w/g, (c) => c.toUpperCase());
    if (/headquarter|\bhq\b|مقر إقليمي/.test(s)) f.goal = L("Regional headquarters", "مقر إقليمي");
    else if (/office|مكتب/.test(s)) f.goal = L("Open an Abu Dhabi office", "افتتاح مكتب في أبوظبي");
    else if (/middle east|mena|gcc|region|الشرق الأوسط/.test(s)) f.goal = L("MENA market entry", "دخول سوق الشرق الأوسط");
  }
  return f;
}

function analyzeDeterministic(text: string, mode: Mode): Profile {
  return { mode, raw: text, facts: extract(text, mode), engine: "fallback" };
}

export function profileFields(p: Profile): Array<{ label: LText; value: LText }> {
  const f = p.facts;
  const out: Array<{ label: LText; value: LText }> = [];
  const add = (label: LText, value?: LText) => value && out.push({ label, value });
  if (p.mode === "person") {
    add(L("Profession", "المهنة"), f.profession);
    add(L("Current country", "البلد الحالي"), f.country);
    add(L("City", "المدينة"), f.city);
    if (f.age) add(L("Age", "العمر"), L(String(f.age), String(f.age)));
    if (f.married || f.children) {
      const en = [f.married ? "Married" : "", f.children ? `${f.children} ${f.children === 1 ? "child" : "children"}` : ""].filter(Boolean).join(" + ");
      const ar = [f.married ? "متزوج" : "", f.children ? (f.children === 1 ? "طفل واحد" : f.children === 2 ? "طفلان" : `${f.children} أطفال`) : ""].filter(Boolean).join(" + ");
      add(L("Family", "العائلة"), L(en, ar));
    } else if (f.family) add(L("Family", "العائلة"), L("Moving with family", "الانتقال مع العائلة"));
    if (f.priorities.length) {
      const P: Record<string, LText> = { career: L("Career", "المسار المهني"), school: L("School", "المدرسة"), housing: L("Housing", "السكن"), lifestyle: L("Lifestyle", "نمط الحياة"), business: L("Business", "الأعمال") };
      add(L("Priorities", "الأولويات"), L(f.priorities.map((k) => P[k]?.en).join(" / "), f.priorities.map((k) => P[k]?.ar).join(" / ")));
    }
    if (f.remote) add(L("Work style", "أسلوب العمل"), L("Remote", "عن بُعد"));
    if (f.founder) add(L("Business interest", "الاهتمام بالأعمال"), L("Founder / startup", "مؤسس / شركة ناشئة"));
    if (f.budget) add(L("Budget", "الميزانية"), L(f.budget, f.budget));
    add(L("Timing", "التوقيت"), f.timing);
    add(L("Status", "الحالة"), L("Exploring Abu Dhabi", "يستكشف أبوظبي"));
  } else {
    if (f.companyName) add(L("Company", "الشركة"), L(f.companyName, f.companyName));
    add(L("Home country", "بلد المقر"), f.country);
    add(L("Industry", "القطاع"), f.industry);
    if (f.employees) {
      add(L("Company size", "حجم الشركة"), L(`${f.employees} employees`, `${f.employees} موظفاً`));
      add(L("Stage", "المرحلة"), f.employees <= 50 ? L("Startup / SME", "شركة ناشئة / صغيرة ومتوسطة") : f.employees <= 250 ? L("SME", "شركة متوسطة") : L("Enterprise", "مؤسسة كبرى"));
    }
    if (f.relocating !== undefined) add(L("Relocating", "المنتقلون"), L(`${f.relocating} employees`, `${f.relocating} موظفين`));
    if (f.founders) add(L("Founders", "المؤسسون"), L(`${f.founders} founders`, `${f.founders} مؤسسين`));
    if (f.families) add(L("Dependents", "المعالون"), L("Families included", "تشمل العائلات"));
    add(L("Goal", "الهدف"), f.goal);
    if (f.fundingStage) add(L("Funding stage", "مرحلة التمويل"), L(f.fundingStage, f.fundingStage));
    add(L("Timing", "التوقيت"), f.timing);
  }
  return out;
}

/* ---------------- buildJourney ---------------- */
type Action = Journey["nextActions"][number];

function personJourney(p: Profile): Journey {
  const f = p.facts;
  const prof = f.profession ?? L("professional", "محترف");
  const actions: Action[] = [];
  if (f.startCompany) actions.push({ graphId: "p.founder-path", isNew: true, category: "build", sourceId: "hub71", title: L("Explore Hub71 and licence routes for your startup", "استكشف هب71 ومسارات الترخيص لشركتك الناشئة"), why: L("You're considering starting a company — the establishment route shapes your residency and timeline.", "أنت تفكر في تأسيس شركة — ومسار التأسيس يحدد إقامتك وجدولك الزمني.") });
  if (f.spouseWorks) actions.push({ graphId: "p.spouse-career", isNew: true, category: "work", sourceId: "mohre", title: L("Plan a dual-career move for you and your spouse", "خطط لانتقال مهني مزدوج لك ولزوجك/زوجتك"), why: L("Two careers change commute, childcare and the best residential areas.", "وجود مسارين مهنيين يغيّر التنقل ورعاية الأطفال وأفضل مناطق السكن.") });
  if (f.familyLater) actions.push({ graphId: "p.family-sponsorship", isNew: true, category: "move", sourceId: "icp", title: L("Prepare a phased family arrival plan", "جهّز خطة لوصول العائلة على مراحل"), why: L("Family sponsorship and school enrolment timing should be aligned in advance.", "يجب مواءمة توقيت كفالة العائلة والتسجيل المدرسي مسبقاً.") });
  if (f.salaryChange) actions.push({ graphId: "p.budget", isNew: true, category: "live", title: L("Re-test your housing and school budget", "أعد تقييم ميزانية السكن والمدارس"), why: L("A salary change affects which neighbourhoods and schools fit comfortably.", "تغيّر الراتب يؤثر على الأحياء والمدارس المناسبة.") });
  if (f.noCar) actions.push({ graphId: "p.transport-plan", isNew: true, category: "move", sourceId: "mobility", title: L("Shortlist homes near public-transport routes", "اختر منازل قريبة من خطوط النقل العام"), why: L("Without a car, bus access and walkability become key housing criteria.", "بدون سيارة، يصبح الوصول للحافلات وسهولة المشي معياراً أساسياً للسكن.") });
  if (f.remote) actions.push({ graphId: "p.remote-residency", category: "move", sourceId: "adro", title: L("Confirm residency options for remote work", "تأكد من خيارات الإقامة للعمل عن بُعد"), why: L("Your income is earned remotely, so the residency pathway differs from employer sponsorship.", "دخلك من عمل عن بُعد، لذا يختلف مسار الإقامة عن كفالة صاحب العمل.") });
  actions.push({ graphId: "p.career-search", category: "work", sourceId: "adro", title: L(`Explore relevant ${prof.en.toLowerCase()} career opportunities`, `استكشف فرص العمل المناسبة لـ${prof.ar}`), why: L("Your main stated goal is career growth in Abu Dhabi.", "هدفك الرئيسي المعلن هو النمو المهني في أبوظبي.") });
  actions.push(f.children ? { graphId: "p.neighbourhood", category: "live", sourceId: "adek", title: L("Compare family-friendly residential areas", "قارن المناطق السكنية المناسبة للعائلات"), why: L("Housing should be coordinated with work, school and transport.", "يجب تنسيق السكن مع العمل والمدرسة والتنقل.") } : { graphId: "p.neighbourhood", category: "live", title: L("Shortlist neighbourhoods that fit your lifestyle", "حدد الأحياء التي تناسب نمط حياتك"), why: L("Where you live shapes commute, cost and community.", "مكان سكنك يحدد التنقل والتكلفة والمجتمع.") });
  actions.push({ graphId: "p.residency", category: "move", sourceId: "icp", title: L("Investigate your relevant residency pathway", "تحقق من مسار الإقامة المناسب لك"), why: L("Official confirmation determines the next administrative steps.", "التأكيد الرسمي يحدد الخطوات الإدارية التالية.") });

  const stagesKeys: Array<[string, LText, LText]> = [
    ["discover", L("Discover", "اكتشف"), L("Understand Abu Dhabi and your options", "افهم أبوظبي وخياراتك")],
    ["decide", L("Decide", "قرّر"), L("Compare pathways, costs and areas", "قارن المسارات والتكاليف والمناطق")],
    ["prepare", L("Prepare", "استعد"), L("Documents, job, residency", "المستندات والوظيفة والإقامة")],
    ["move", L("Move", "انتقل"), L("Arrival, Emirates ID, housing", "الوصول والهوية والسكن")],
    ["settle", L("Settle", "استقر"), L("Schools, banking, healthcare", "المدارس والبنوك والرعاية الصحية")],
    ["belong", L("Connect", "تواصل"), L("Community, culture, friends", "المجتمع والثقافة والأصدقاء")],
    ["grow", L("Grow", "انمُ"), L("Career, business, long-term future", "المهنة والأعمال والمستقبل")],
  ];
  const cur = f.familyLater ? 2 : 1;
  const children = f.children ?? 0;

  const opps: Journey["opportunities"] = [
    { key: "career", category: L("Career", "المهنة"), title: L(`${prof.en} roles in Abu Dhabi's tech & government sectors`, `وظائف ${prof.ar} في قطاعي التقنية والحكومة بأبوظبي`), why: L("Matches your profession and stated career-growth goal.", "تتوافق مع مهنتك وهدف النمو المهني.") },
  ];
  if (children) opps.push({ key: "education", category: L("Education", "التعليم"), title: L(`Schools for ${children} ${children === 1 ? "child" : "children"} across curricula`, "مدارس لأطفالك بمناهج متعددة"), why: L("You're moving with children — school choice drives housing decisions.", "أنت تنتقل مع أطفال — واختيار المدرسة يحدد قرار السكن.") });
  if (f.founder || f.startCompany) opps.push({ key: "startup", category: L("Startup", "الشركات الناشئة"), title: L("Hub71 founder programmes", "برامج هب71 للمؤسسين"), why: L("You've expressed interest in building a company.", "أبديت اهتماماً بتأسيس شركة.") });
  if (f.investor) opps.push({ key: "investment", category: L("Investment", "الاستثمار"), title: L("Investor pathways via ADIO", "مسارات المستثمرين عبر مكتب أبوظبي للاستثمار"), why: L("You mentioned investment interest.", "ذكرت اهتمامك بالاستثمار.") });
  if (f.family) opps.push({ key: "family", category: L("Family", "العائلة"), title: L("Family-friendly communities with parks and clinics", "مجتمعات مناسبة للعائلات مع حدائق وعيادات"), why: L("Your move includes family — daily-life proximity matters.", "انتقالك يشمل العائلة — والقرب من الخدمات اليومية مهم.") });
  opps.push({ key: "lifestyle", category: L("Lifestyle", "نمط الحياة"), title: L("Saadiyat culture district & Corniche beaches", "المنطقة الثقافية في السعديات وشواطئ الكورنيش"), why: L("Supports long-term settlement and wellbeing.", "تدعم الاستقرار طويل الأمد وجودة الحياة.") });

  const sources = ["tamm", "icp", "adro", "uaepass", "mohre", "doh", "mobility", "doe"];
  if (children) sources.splice(2, 0, "adek");
  if (f.founder || f.startCompany) sources.unshift("hub71", "added");

  const area = children ? L("Khalifa City", "مدينة خليفة") : L("Al Reem Island", "جزيرة الريم");
  return {
    type: "person",
    title: L("My Abu Dhabi", "أبوظبي الخاصة بي"),
    summary: L(
      `A ${prof.en.toLowerCase()}${f.country ? ` from ${f.country.en}` : ""}${f.family ? ", moving with family" : ""}, exploring Abu Dhabi for ${f.priorities.length ? f.priorities.join(", ") : "a new chapter"}.`,
      `${prof.ar}${f.country ? ` من ${f.country.ar}` : ""}${f.family ? "، ينتقل مع العائلة" : ""}، يستكشف أبوظبي لبداية فصل جديد.`,
    ),
    profile: profileFields(p),
    nextActions: actions.slice(0, 3),
    journeyStages: stagesKeys.map(([key, title, description], i) => ({ key, title, description, status: i < cur ? "complete" : i === cur ? "current" : "upcoming" })),
    opportunities: opps.slice(0, 6),
    mapPlaces: [
      { type: "home", name: L(`Home · ${area.en}`, `المنزل · ${area.ar}`), note: L("Suggested area", "منطقة مقترحة") },
      { type: "work", name: L("Work · Al Maryah Island", "العمل · جزيرة الماريه"), note: L("Business district", "منطقة الأعمال"), minutes: f.noCar ? 35 : 22 },
      ...(children ? [{ type: "school", name: L("School", "المدرسة"), note: L("ADEK-rated options", "خيارات مصنفة من ADEK"), minutes: 14 }] : []),
      { type: "health", name: L("Hospital", "المستشفى"), note: L("Licensed by DoH", "مرخص من دائرة الصحة"), minutes: 8 },
      { type: "grocery", name: L("Grocery", "البقالة"), note: L("Daily needs", "الاحتياجات اليومية"), minutes: 4 },
      { type: "park", name: L("Park", "الحديقة"), note: L("Family time", "وقت العائلة"), minutes: 5 },
      { type: "transport", name: L("Bus route", "خط الحافلات"), note: L("Abu Dhabi Mobility", "أبوظبي للتنقل"), minutes: 6 },
      { type: "worship", name: L("Place of worship", "دار العبادة"), note: L("Faith community", "مجتمع ديني"), minutes: 7 },
      { type: "culture", name: L("Saadiyat Cultural District", "المنطقة الثقافية في السعديات"), note: L("Museums", "المتاحف"), minutes: 25 },
      { type: "community", name: L("Community centre", "المركز المجتمعي"), note: L("Meet people", "تعرّف على الناس"), minutes: 10 },
    ],
    sources,
  };
}

function companyJourney(p: Profile): Journey {
  const f = p.facts;
  const name = f.companyName ?? "Nova AI";
  const reloc = f.relocating ?? 20;
  const actions: Action[] = [];
  if (f.foundersFirst) actions.push({ graphId: "c.founder-residency", isNew: true, category: "establish", sourceId: "icp", title: L("Prioritise founder residency and company establishment", "أعطِ الأولوية لإقامة المؤسسين وتأسيس الشركة"), why: L("Founders arriving first can complete licensing before the team follows.", "وصول المؤسسين أولاً يتيح إتمام الترخيص قبل انتقال الفريق.") });
  if (f.relocating !== undefined && f.relocating >= 15) actions.push({ graphId: "c.employee-visas", isNew: true, category: "relocate", sourceId: "mohre", title: L(`Scale the relocation plan to ${reloc} employees`, `وسّع خطة النقل لتشمل ${reloc} موظفاً`), why: L("More relocations mean larger visa quotas, housing blocks and school planning.", "زيادة عدد المنتقلين تعني حصص تأشيرات أكبر ووحدات سكنية وتخطيطاً مدرسياً.") });
  if (f.hireLocal) actions.push({ graphId: "c.local-hiring", isNew: true, category: "talent", sourceId: "mohre", title: L("Launch a local hiring plan", "أطلق خطة توظيف محلية"), why: L("Hiring in Abu Dhabi reduces relocation load and builds local presence.", "التوظيف في أبوظبي يقلل عبء النقل ويعزز الحضور المحلي.") });
  if (f.smallOffice) actions.push({ graphId: "c.office-lease", isNew: true, category: "office", sourceId: "hub71", title: L("Evaluate flexible coworking or Hub71 space", "قيّم مساحات العمل المشتركة أو مساحة هب71"), why: L("A smaller footprint can lower setup cost; licence office requirements must be confirmed.", "المساحة الأصغر تقلل التكلفة؛ ويجب تأكيد متطلبات المكتب للترخيص.") });
  if (f.scaleTo) actions.push({ graphId: "c.growth-scale", isNew: true, category: "growth", sourceId: "adio", title: L(`Plan a talent pipeline to reach ${f.scaleTo} employees`, `خطط لاستقطاب المواهب للوصول إلى ${f.scaleTo} موظف`), why: L("Growth affects visa quotas, office size and the establishment route.", "النمو يؤثر على حصص التأشيرات وحجم المكتب ومسار التأسيس.") });
  actions.push({ graphId: "c.establishment-route", category: "establish", sourceId: "adgm", title: L("Identify the appropriate establishment route", "حدد مسار التأسيس المناسب"), why: L("ADGM, mainland (ADDED) or Hub71 routes shape licensing, visas and office needs.", "مسارات سوق أبوظبي العالمي أو البر الرئيسي أو هب71 تحدد الترخيص والتأشيرات والمكتب.") });
  actions.push({ graphId: "c.licence", category: "office", sourceId: "added", title: L("Define office and licence requirements", "حدد متطلبات المكتب والترخيص"), why: L("Office size and licence activities must match before visas can be issued.", "يجب أن يتوافق حجم المكتب مع أنشطة الرخصة قبل إصدار التأشيرات.") });
  actions.push({ graphId: "c.relocation-waves", category: "relocate", sourceId: "icp", title: L("Build the founder and employee relocation plan", "ضع خطة نقل المؤسسين والموظفين"), why: L(`${reloc} people${f.families ? " and their families" : ""} need sequenced visas, housing and schools.`, `${reloc} أشخاص${f.families ? " وعائلاتهم" : ""} يحتاجون إلى تأشيرات وسكن ومدارس بترتيب مدروس.`) });

  const stages: Array<[string, LText, LText]> = [
    ["explore", L("Explore", "استكشف"), L("Market, incentives, ecosystem", "السوق والحوافز والمنظومة")],
    ["establish", L("Establish", "أسّس"), L("Entity, licence, office", "الكيان والرخصة والمكتب")],
    ["relocate", L("Relocate", "انقل"), L("Founders, team, families", "المؤسسون والفريق والعائلات")],
    ["operate", L("Operate", "شغّل"), L("Banking, tax, hiring", "البنوك والضرائب والتوظيف")],
    ["connect", L("Connect", "تواصل"), L("Partners, investors, network", "الشركاء والمستثمرون والشبكة")],
    ["grow", L("Grow", "انمُ"), L("Scale across MENA", "التوسع في المنطقة")],
  ];
  const cur = f.foundersFirst ? 1 : f.relocating && f.relocating >= 15 ? 2 : 1;
  const total = reloc;
  const ready = Math.round(total * 0.4), documentation = Math.round(total * 0.25), housing = Math.round(total * 0.15), familySupport = Math.round(total * 0.1);
  return {
    type: "company",
    title: L("Our Abu Dhabi", "أبوظبي لشركتنا"),
    summary: L(
      `${name}${f.country ? `, a ${f.country.en}` : ", a"} ${f.industry?.en ?? "technology"} company${f.employees ? ` with ${f.employees} employees` : ""}, relocating ${reloc} people${f.timing ? ` ${f.timing.en.toLowerCase()}` : ""}.`,
      `${name}، شركة ${f.industry?.ar ?? "تقنية"}${f.country ? ` من ${f.country.ar}` : ""}${f.employees ? ` تضم ${f.employees} موظفاً` : ""}، تنقل ${reloc} أشخاص${f.timing ? ` ${f.timing.ar}` : ""}.`,
    ),
    profile: profileFields(p),
    nextActions: actions.slice(0, 3),
    journeyStages: stages.map(([key, title, description], i) => ({ key, title, description, status: i < cur ? "complete" : i === cur ? "current" : "upcoming" })),
    opportunities: [
      { key: "market", category: L("Market Entry", "دخول السوق"), title: L("Abu Dhabi as a MENA gateway", "أبوظبي بوابة للشرق الأوسط"), why: L("Regional access for your target market.", "وصول إقليمي لسوقك المستهدف.") },
      { key: "setup", category: L("Business Setup", "تأسيس الأعمال"), title: L("ADGM, mainland or free-zone entity", "كيان في سوق أبوظبي العالمي أو البر الرئيسي أو منطقة حرة"), why: L("Choose the structure that fits your activities.", "اختر الهيكل المناسب لأنشطتك.") },
      { key: "hub71", category: L("Hub71 / Ecosystem", "هب71 / المنظومة"), title: L("Hub71 programme & founder community", "برنامج هب71 ومجتمع المؤسسين"), why: L(`Relevant for a ${f.industry?.en.toLowerCase() ?? "tech"} company entering the region.`, "مناسب لشركة تقنية تدخل المنطقة.") },
      { key: "talent", category: L("Talent", "المواهب"), title: L("Khalifa University & MBZUAI graduates", "خريجو جامعة خليفة وجامعة محمد بن زايد للذكاء الاصطناعي"), why: L("Local AI and engineering talent pipelines.", "مصادر محلية لمواهب الذكاء الاصطناعي والهندسة.") },
      { key: "office", category: L("Office", "المكتب"), title: L("Al Maryah Island / Masdar City offices", "مكاتب جزيرة الماريه / مدينة مصدر"), why: L("Business districts close to ADGM and Hub71.", "مناطق أعمال قريبة من سوق أبوظبي العالمي وهب71.") },
      { key: "investment", category: L("Investment", "الاستثمار"), title: L("ADIO incentives & regional investors", "حوافز مكتب أبوظبي للاستثمار والمستثمرون الإقليميون"), why: L("Potential support for expansion — confirmation required.", "دعم محتمل للتوسع — يتطلب تأكيداً رسمياً.") },
      { key: "relocation", category: L("Team Relocation", "نقل الفريق"), title: L(`${reloc} employees${f.families ? " + families" : ""}`, `${reloc} موظفين${f.families ? " + العائلات" : ""}`), why: L("Sequenced visas, housing and schools.", "تأشيرات وسكن ومدارس بترتيب مدروس.") },
      { key: "growth", category: L("Growth", "النمو"), title: L("Abu Dhabi Chamber & business councils", "غرفة أبوظبي ومجالس الأعمال"), why: L("Partnerships and network for long-term growth.", "شراكات وشبكة علاقات للنمو طويل الأمد.") },
    ],
    mapPlaces: [],
    sources: ["adgm", "hub71", "added", "adio", "mohre", "icp", "chamber", "fta", "tamm"],
    team: { companyName: name, totalRelocating: total, ready, documentation, housing, familySupport, actionRequired: Math.max(0, total - ready - documentation - housing - familySupport) },
  };
}

export const buildJourneySync = (p: Profile): Journey => ({ ...(p.mode === "person" ? personJourney(p) : companyJourney(p)), engine: "fallback" });

/* ---------------- deterministic What-If ---------------- */
function whatIfDeterministic(p: Profile, text: string): { profile: Profile; journey: Journey } {
  const s = norm(text);
  const f: Facts = { ...p.facts, priorities: [...p.facts.priorities] };
  let note = L(`Scenario considered: “${text}”. Your journey has been re-checked.`, `تمت دراسة السيناريو: «${text}». تمت مراجعة رحلتك.`);
  if (p.mode === "company") {
    const n = num(/(\d+)/, s);
    if (/founder|مؤسس/.test(s)) { f.foundersFirst = true; note = L("Founders relocate first — establishment is now the lead priority.", "ينتقل المؤسسون أولاً — أصبح التأسيس الأولوية الرئيسية."); }
    else if (/expand|grow|scale|توسع|نمو/.test(s) && n) { f.scaleTo = n; note = L(`Growth to ${n} employees added to your plan.`, `تمت إضافة النمو إلى ${n} موظف إلى خطتك.`); }
    else if (/local|محلي/.test(s)) { f.hireLocal = true; note = L("Local hiring added — relocation load reduced.", "تمت إضافة التوظيف المحلي — وانخفض عبء النقل."); }
    else if (/small|cowork|أصغر|مشترك/.test(s)) { f.smallOffice = true; note = L("Smaller office scenario — flexible space options added.", "سيناريو مكتب أصغر — تمت إضافة خيارات المساحات المرنة."); }
    else if (n) { f.relocating = n; f.foundersFirst = false; note = L(`Relocation updated to ${n} employees — team metrics and actions recalculated.`, `تم تحديث النقل إلى ${n} موظفاً — وأعيد حساب مؤشرات الفريق والخطوات.`); }
  } else {
    if (/spouse|wife|husband|partner|زوج/.test(s)) { f.spouseWorks = true; f.married = true; note = L("Dual-career household — commute and childcare now factored in.", "أسرة بمسارين مهنيين — تم احتساب التنقل ورعاية الأطفال."); }
    else if (/salary|income|راتب|دخل/.test(s)) { f.salaryChange = true; note = L("Salary change — housing and school budget flagged for review.", "تغيّر الراتب — تم وضع ميزانية السكن والمدارس للمراجعة."); }
    else if (/later|joins|لاحق/.test(s)) { f.familyLater = true; f.family = true; note = L("Family joins later — a phased arrival plan has been added.", "تنضم العائلة لاحقاً — أضيفت خطة وصول على مراحل."); }
    else if (/remote|عن بعد|عن بُعد/.test(s)) { f.remote = true; note = L("Remote work — residency pathway adjusted.", "العمل عن بُعد — تم تعديل مسار الإقامة."); }
    else if (/company|startup|business|شركة/.test(s)) { f.startCompany = true; f.founder = true; note = L("Starting a company — Hub71 and licensing added to your journey.", "تأسيس شركة — أضيف هب71 والترخيص إلى رحلتك."); }
    else if (/car|سيارة/.test(s)) { f.noCar = true; note = L("No car — homes near transit prioritised; commute estimates updated.", "بدون سيارة — أولوية للمنازل القريبة من النقل؛ وتم تحديث أوقات التنقل."); }
  }
  const profile = { ...p, facts: f };
  const journey = buildJourneySync(profile);
  journey.whatIfNote = note;
  return { profile, journey };
}

/* ---------------- askCopilot ---------------- */
export async function askCopilot(q: string, j: Journey | null, mode: Mode): Promise<LText> {
  await wait(900);
  const s = norm(q);
  const a = j?.nextActions ?? [];
  const list = (k: "en" | "ar") => a.map((x, i) => `${i + 1}. ${x.title[k]}`).join("\n");
  if (mode === "company" || j?.type === "company") {
    if (/founder|مؤسس/.test(s)) return L("A founders-first move is common: founders secure the entity, licence and bank account, then employees follow in sequenced waves. Use the What-If panel to apply this to your plan. Official confirmation with ICP and your licensing authority is required.", "انتقال المؤسسين أولاً نهج شائع: يؤمّن المؤسسون الكيان والرخصة والحساب البنكي، ثم ينتقل الموظفون على دفعات. استخدم لوحة «ماذا لو» لتطبيق ذلك. يلزم التأكيد الرسمي مع الهيئة الاتحادية للهوية وجهة الترخيص.");
    if (/office|مكتب|where|أين/.test(s)) return L("Potential office locations: Al Maryah Island (close to ADGM and Hub71), Masdar City (tech & sustainability), or flexible coworking while the team is small. Licence office requirements must be confirmed with your authority.", "مواقع محتملة للمكتب: جزيرة الماريه (قرب سوق أبوظبي العالمي وهب71)، مدينة مصدر (التقنية والاستدامة)، أو مساحات عمل مشتركة مرنة. يجب تأكيد متطلبات المكتب مع جهة الترخيص.");
    if (/relocat|employees|نقل|موظف/.test(s)) return L(`Relocate in waves: (1) founders and leads, (2) employees with complete documents, (3) families once housing and schools are confirmed. Open the Command Center to track readiness of all ${j?.team?.totalRelocating ?? 20} people.`, `انقل الفريق على دفعات: (1) المؤسسون والقادة، (2) الموظفون مكتملو المستندات، (3) العائلات بعد تأكيد السكن والمدارس. افتح مركز القيادة لمتابعة جاهزية ${j?.team?.totalRelocating ?? 20} شخصاً.`);
    if (/establish|setup|set up|licen|تأسيس|رخصة/.test(s)) return L("Three potential routes: ADGM (international common-law centre), mainland via ADDED, or the Hub71 ecosystem for eligible tech startups. The right route depends on your activities, clients and team — confirm with ADGM, ADDED or Hub71 directly.", "ثلاثة مسارات محتملة: سوق أبوظبي العالمي، أو البر الرئيسي عبر دائرة التنمية الاقتصادية، أو منظومة هب71 للشركات التقنية المؤهلة. يعتمد الاختيار على أنشطتك وعملائك وفريقك — تأكد مباشرة مع الجهة المعنية.");
  } else {
    if (/live|area|neighbour|where|أين|سكن|منطقة/.test(s)) return L("For families, potential areas include Khalifa City and Mohammed Bin Zayed City (space, schools), Al Reem Island (city living, close to business districts) and Saadiyat Island (culture and beaches). Compare commute to work and school before deciding.", "للعائلات، من المناطق المحتملة: مدينة خليفة ومدينة محمد بن زايد (مساحة ومدارس)، جزيرة الريم (حياة المدينة وقرب الأعمال)، وجزيرة السعديات (الثقافة والشواطئ). قارن وقت التنقل للعمل والمدرسة قبل القرار.");
    if (/school|مدرس/.test(s)) return L("Start with ADEK's school information to compare curricula (British, American, IB, Indian and more), ratings and fees. Enrolment windows fill early, so align school choice with your housing area.", "ابدأ بمعلومات دائرة التعليم والمعرفة لمقارنة المناهج (البريطاني، الأمريكي، البكالوريا الدولية، الهندي وغيرها) والتقييمات والرسوم. مواعيد التسجيل تمتلئ مبكراً، فنسّق اختيار المدرسة مع منطقة السكن.");
    if (/spouse|wife|husband|زوج/.test(s)) return L("If your spouse also works, check their work-permit pathway with MOHRE and look for homes balancing both commutes. Try the What-If panel to update your journey.", "إذا كان زوجك/زوجتك سيعمل أيضاً، تحقق من مسار تصريح العمل مع وزارة الموارد البشرية وابحث عن سكن يوازن بين التنقلين. جرّب لوحة «ماذا لو» لتحديث رحلتك.");
  }
  if (a.length) return L(`Based on your journey, focus on:\n${list("en")}\n\nEach step links to the relevant official service for confirmation.`, `بناءً على رحلتك، ركّز على:\n${list("ar")}\n\nكل خطوة مرتبطة بالخدمة الرسمية المعنية للتأكيد.`);
  return L("Tell me a little about your move — who is moving, from where, and what matters most — and I'll organise your Abu Dhabi journey.", "أخبرني قليلاً عن انتقالك — من سينتقل، ومن أين، وما الأهم بالنسبة لك — وسأنظم رحلتك إلى أبوظبي.");
}

/* ---------------- demo personas ---------------- */
export const DEMO_PERSONAS: Array<{ id: string; mode: Mode; label: LText; text: string }> = [
  { id: "ai-eng", mode: "person", label: L("AI Engineer · India · Family", "مهندس ذكاء اصطناعي · الهند · عائلة"), text: "I'm 36, an AI engineer in Bangalore, India. Married with two children. I want career growth and to relocate my family to Abu Dhabi." },
  { id: "remote", mode: "person", label: L("Remote professional · Family", "محترف عن بُعد · عائلة"), text: "I work remotely as a product manager and want to understand whether Abu Dhabi's lifestyle suits my family for long-term settlement. My wife and one child will move with me." },
  { id: "founder", mode: "company", label: L("Startup founder · Europe", "مؤسس شركة ناشئة · أوروبا"), text: "We are a small AI startup from Berlin, Germany with 8 employees and 2 founders. We want to expand into the Middle East. Initially the 2 founders will relocate." },
  { id: "company", mode: "company", label: L("Tech company · 20 employees", "شركة تقنية · 20 موظفاً"), text: "We are a UK AI company with 20 employees. Five employees will relocate with their families. We want to open an Abu Dhabi office within 90 days." },
];

/* =====================================================================
 * Unified adapter: live OpenAI Journey Engine first, deterministic fallback.
 * The UI only ever sees validated, well-formed Profile / Journey objects.
 * ===================================================================== */
import { aiAnalyze, aiJourney, aiWhatIf } from "./ai.functions";
import { touchedNodes } from "@/data/settlementGraph";

const AI_TIMEOUT_MS = 45000;
async function tryLive<T extends { ok: boolean }>(fn: () => Promise<T>): Promise<T | { ok: false; reason: string }> {
  try {
    return await Promise.race([fn(), new Promise<{ ok: false; reason: string }>((r) => setTimeout(() => r({ ok: false, reason: "timeout" }), AI_TIMEOUT_MS))]);
  } catch {
    return { ok: false, reason: "network" };
  }
}

const PRIORITY_LABEL: Record<string, string> = { career: "career growth", family: "family", schools: "schools", lifestyle: "lifestyle", business: "business", investment: "investment", housing: "housing", cost: "cost of living" };
const factsPlain = (f: Facts) => JSON.parse(JSON.stringify(f)) as Record<string, unknown>;

export async function analyzeProfile(text: string, modeHint?: Mode): Promise<Profile> {
  const mode = modeHint ?? detectMode(text);
  const base = analyzeDeterministic(text, mode);
  const r = await tryLive(() => aiAnalyze({ data: { text: text.slice(0, 2000), mode } }));
  if (r.ok && "facts" in r) {
    const merged: Facts = { ...base.facts };
    for (const [k, v] of Object.entries(r.facts)) if (v !== null && v !== undefined) (merged as Record<string, unknown>)[k] = v;
    const pri = r.priorities.map((x) => PRIORITY_LABEL[x] ?? x);
    merged.priorities = [...new Set([...base.facts.priorities, ...pri])];
    return { mode, raw: text, facts: merged, engine: "openai", insights: { constraints: r.constraints, unknowns: r.unknowns, risks: [], verify: [], confidence: r.confidence } };
  }
  await wait(1200);
  return { ...base, aiReason: "reason" in r ? r.reason : "unknown" };
}

export async function buildJourney(p: Profile): Promise<Journey> {
  const det = buildJourneySync(p);
  if (p.engine === "openai") {
    const r = await tryLive(() => aiJourney({ data: { mode: p.mode, raw: p.raw.slice(0, 2000), facts: factsPlain(p.facts) } }));
    if (r.ok && "nextActions" in r) {
      const idx = det.journeyStages.findIndex((s) => s.key === r.currentStage);
      return {
        ...det,
        engine: "openai",
        summary: r.summary,
        nextActions: r.nextActions,
        journeyStages: idx >= 0 ? det.journeyStages.map((s, i) => ({ ...s, status: i < idx ? "complete" : i === idx ? "current" : "upcoming" })) : det.journeyStages,
        sources: [...new Set([...r.sources, ...det.sources])],
        insights: { constraints: p.insights?.constraints ?? [], unknowns: p.insights?.unknowns ?? [], risks: r.risks, verify: r.verify, confidence: p.insights?.confidence },
      };
    }
  }
  await wait(900);
  return det;
}

export async function applyWhatIf(p: Profile, text: string, prev?: Journey | null): Promise<{ profile: Profile; journey: Journey }> {
  const prevIds = (prev?.nextActions ?? []).map((a) => a.graphId).filter((x): x is string => !!x);
  if (p.engine === "openai") {
    const r = await tryLive(() => aiWhatIf({ data: { mode: p.mode, raw: p.raw.slice(0, 2000), facts: factsPlain(p.facts), scenario: text.slice(0, 500), previous: prevIds } }));
    if (r.ok && "patch" in r) {
      const f: Facts = { ...p.facts };
      for (const [k, v] of Object.entries(r.patch)) if (v !== null) (f as Record<string, unknown>)[k] = v;
      const profile: Profile = { ...p, facts: f };
      const det = buildJourneySync(profile);
      const changed = r.changedDependencies.length || diffCount(prevIds, r.nextActions.map((a) => a.graphId));
      return {
        profile,
        journey: {
          ...det,
          ...(prev ? { summary: prev.summary, insights: prev.insights, sources: [...new Set([...prev.sources, ...det.sources])] } : {}),
          engine: "openai",
          nextActions: r.nextActions.map((a) => ({ ...a, isNew: !prevIds.includes(a.graphId) })),
          whatIfNote: r.whatChanged,
          changedCount: Math.max(1, changed),
        },
      };
    }
  }
  await wait(1100);
  const out = whatIfDeterministic(p, text);
  const nextIds = out.journey.nextActions.map((a) => a.graphId);
  out.journey.nextActions = out.journey.nextActions.map((a) => ({ ...a, isNew: !!a.graphId && !prevIds.includes(a.graphId) }));
  out.journey.changedCount = Math.max(1, diffCount(prevIds, nextIds));
  return out;
}

/** Number of Settlement Graph dependencies that differ between two action sets. */
function diffCount(before: Array<string | undefined>, after: Array<string | undefined>) {
  const a = touchedNodes(before);
  const b = touchedNodes(after);
  let n = 0;
  for (const x of b) if (!a.has(x)) n++;
  for (const x of a) if (!b.has(x)) n++;
  return n;
}