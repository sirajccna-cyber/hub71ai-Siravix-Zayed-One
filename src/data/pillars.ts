import { Plane, Home, Briefcase, Rocket, HeartHandshake, type LucideIcon } from "lucide-react";
import { L } from "@/lib/i18n";
import type { LText } from "@/lib/types";

export type PillarId = "move" | "live" | "work" | "build" | "connect";

/** A subcategory: guidance + official source ids (src/lib/sources.ts) + private group keys + community pointers (no URL). */
export type PillarSection = {
  id: string;
  title: LText;
  guidance: LText;
  confirm: LText;
  official: string[];
  privateGroups?: string[];
  community?: LText[];
  estimate?: LText;
};

export type Pillar = { id: PillarId; icon: LucideIcon; title: LText; value: LText; sections: PillarSection[] };

const CONFIRM_OFFICIAL = L("Eligibility, fees and requirements with the official authority.", "الأهلية والرسوم والمتطلبات لدى الجهة الرسمية.");

export const PILLARS: Pillar[] = [
  {
    id: "move", icon: Plane, title: L("Move", "الانتقال"),
    value: L("Understand the sequence: residency first, then identity, banking, housing and utilities.", "افهم التسلسل: الإقامة أولاً، ثم الهوية والحساب البنكي والسكن والمرافق."),
    sections: [
      { id: "residency", title: L("Residency", "الإقامة"), guidance: L("Your residency pathway usually depends on employment, business ownership or another eligible route. It unlocks Emirates ID and most next steps.", "يعتمد مسار إقامتك عادةً على العمل أو ملكية نشاط تجاري أو مسار مؤهل آخر، وهو يفتح الهوية الإماراتية ومعظم الخطوات التالية."), confirm: L("Which residency route fits your situation — official confirmation required.", "أي مسار إقامة يناسب وضعك — يتطلب تأكيداً رسمياً."), official: ["icp", "adro", "tamm"] },
      { id: "government", title: L("Government", "الحكومة"), guidance: L("Set up your digital identity early — UAE PASS gives access to most government services through TAMM.", "فعّل هويتك الرقمية مبكراً — يتيح UAE PASS الوصول إلى معظم الخدمات الحكومية عبر منصة تم."), confirm: CONFIRM_OFFICIAL, official: ["tamm", "uaepass"] },
      { id: "documents", title: L("Documents", "المستندات"), guidance: L("Degree, marriage and birth certificates may need attestation before you travel. Start this early — it often blocks family steps.", "قد تحتاج شهادات التخرج والزواج والميلاد إلى تصديق قبل السفر. ابدأ مبكراً — فهي غالباً ما تؤخر خطوات العائلة."), confirm: L("Which documents need attestation and where.", "أي المستندات تحتاج تصديقاً وأين."), official: ["icp", "tamm"] },
      { id: "housing", title: L("Housing", "السكن"), guidance: L("Choose an area after you know your workplace and school — commute and school runs shape daily life.", "اختر المنطقة بعد معرفة مكان العمل والمدرسة — فالتنقل اليومي يحدد نمط حياتك."), confirm: L("Tenancy registration requirements via TAMM.", "متطلبات تسجيل عقد الإيجار عبر منصة تم."), official: ["tamm"], privateGroups: ["housing"], estimate: L("Rents vary widely by area — treat any figure as an indicative estimate.", "تختلف الإيجارات كثيراً حسب المنطقة — اعتبر أي رقم تقديراً إرشادياً.") },
      { id: "banking", title: L("Banking", "البنوك"), guidance: L("Banks typically ask for residency and Emirates ID before opening a full account. Plan cash flow for the first weeks.", "تطلب البنوك عادةً الإقامة والهوية الإماراتية قبل فتح حساب كامل. خطط لسيولتك في الأسابيع الأولى."), confirm: L("Account requirements directly with your chosen bank.", "متطلبات فتح الحساب مباشرةً مع البنك الذي تختاره."), official: ["uaepass"], community: [L("Retail banks — compare directly", "البنوك التجارية — قارن مباشرة")] },
      { id: "transport", title: L("Transport", "التنقل"), guidance: L("Public transport, tolls and parking are managed by Abu Dhabi Mobility; driving licence transfer runs through Police services.", "تدير أبوظبي للتنقل النقل العام والتعرفة والمواقف، بينما يتم تحويل رخصة القيادة عبر خدمات الشرطة."), confirm: L("Whether your licence can be exchanged directly.", "ما إذا كان بالإمكان استبدال رخصتك مباشرة."), official: ["mobility", "police"], privateGroups: ["transport"] },
      { id: "utilities", title: L("Utilities", "المرافق"), guidance: L("Electricity and water connection follows your tenancy. The Department of Energy regulates the sector.", "يتبع توصيل الكهرباء والمياه عقد الإيجار، وتنظم دائرة الطاقة هذا القطاع."), confirm: L("Connection steps for your property.", "خطوات التوصيل لعقارك."), official: ["doe", "tamm"] },
    ],
  },
  {
    id: "live", icon: Home, title: L("Live", "الحياة"),
    value: L("Connect where you live with schools, healthcare and your everyday routine.", "اربط مكان سكنك بالمدارس والرعاية الصحية وروتينك اليومي."),
    sections: [
      { id: "neighbourhoods", title: L("Neighbourhoods", "الأحياء"), guidance: L("Shortlist two or three areas around your workplace and preferred schools before viewing homes.", "حدّد منطقتين أو ثلاثاً قرب عملك ومدارسك المفضلة قبل معاينة المنازل."), confirm: L("Commute times at the hours you'll travel.", "أوقات التنقل في الساعات التي ستتنقل فيها."), official: ["mobility"], privateGroups: ["housing"] },
      { id: "schools", title: L("Schools", "المدارس"), guidance: L("School choice depends on your child's age, curriculum and location. ADEK publishes school information.", "يعتمد اختيار المدرسة على عمر الطفل والمنهج والموقع. تنشر دائرة التعليم والمعرفة معلومات المدارس."), confirm: L("Seat availability and admission documents with the school.", "توفر المقاعد ووثائق القبول لدى المدرسة."), official: ["adek"], privateGroups: ["education"] },
      { id: "healthcare", title: L("Healthcare", "الرعاية الصحية"), guidance: L("Health insurance is linked to residency. Confirm your cover before choosing clinics.", "يرتبط التأمين الصحي بالإقامة. تأكد من تغطيتك قبل اختيار العيادات."), confirm: L("Insurance requirements for you and dependents.", "متطلبات التأمين لك ولمن تعولهم."), official: ["doh"], privateGroups: ["health"] },
      { id: "shopping", title: L("Shopping", "التسوق"), guidance: L("Malls, markets and delivery apps cover most needs from week one — no setup dependency.", "تغطي المراكز التجارية والأسواق وتطبيقات التوصيل معظم احتياجاتك من الأسبوع الأول."), confirm: L("Nothing official — personal preference.", "لا شيء رسمي — تفضيل شخصي."), official: [], privateGroups: ["lifestyle"] },
      { id: "daily-life", title: L("Daily Life", "الحياة اليومية"), guidance: L("Parks, beaches and culture make settling easier — plan family weekends early.", "تسهّل الحدائق والشواطئ والثقافة الاستقرار — خطط لعطلات العائلة مبكراً."), confirm: L("Local opening times and seasonal schedules.", "مواعيد العمل المحلية والجداول الموسمية."), official: ["tamm"], privateGroups: ["lifestyle"] },
    ],
  },
  {
    id: "work", icon: Briefcase, title: L("Work", "العمل"),
    value: L("Find roles, understand work permits and grow your career and network.", "اعثر على الوظائف وافهم تصاريح العمل وطوّر مسارك وشبكتك."),
    sections: [
      { id: "jobs", title: L("Jobs", "الوظائف"), guidance: L("A job offer is often the start of your residency pathway — your employer typically sponsors the work permit.", "غالباً ما يكون عرض العمل بداية مسار إقامتك — إذ يكفل صاحب العمل عادةً تصريح العمل."), confirm: L("Work permit and contract terms via MOHRE.", "تصريح العمل وشروط العقد عبر وزارة الموارد البشرية."), official: ["mohre"], privateGroups: ["jobs"] },
      { id: "career", title: L("Career", "المسار المهني"), guidance: L("Some professions (health, engineering, education) need local licensing — check before you arrive.", "تحتاج بعض المهن (الصحة والهندسة والتعليم) إلى ترخيص محلي — تحقق قبل وصولك."), confirm: L("Whether your profession requires a licence.", "ما إذا كانت مهنتك تتطلب ترخيصاً."), official: ["mohre", "doh"] },
      { id: "talent", title: L("Talent", "المواهب"), guidance: L("Employers can tap university graduates and specialist talent programmes in Abu Dhabi.", "يمكن لأصحاب العمل الاستفادة من الخريجين وبرامج المواهب المتخصصة في أبوظبي."), confirm: L("Hiring obligations for your company.", "التزامات التوظيف لشركتك."), official: ["mohre", "adro"], privateGroups: ["jobs"] },
      { id: "education", title: L("Education", "التعليم"), guidance: L("Universities and professional courses help you upskill or hire locally.", "تساعدك الجامعات والدورات المهنية على تطوير مهاراتك أو التوظيف محلياً."), confirm: L("Programme accreditation.", "اعتماد البرامج."), official: ["adek"], privateGroups: ["education"] },
      { id: "networking", title: L("Networking", "التواصل"), guidance: L("Professional groups and the Chamber connect you to peers, clients and partners.", "تربطك المجموعات المهنية والغرفة بالزملاء والعملاء والشركاء."), confirm: L("Membership terms.", "شروط العضوية."), official: ["chamber"], privateGroups: ["community"] },
    ],
  },
  {
    id: "build", icon: Rocket, title: L("Build", "تأسيس الأعمال"),
    value: L("Choose the right establishment route, then sequence licence, office, visas and hiring.", "اختر مسار التأسيس المناسب، ثم رتّب الترخيص والمكتب والتأشيرات والتوظيف."),
    sections: [
      { id: "company-setup", title: L("Company Setup", "تأسيس الشركات"), guidance: L("Your business activity decides mainland (ADDED) or a free zone such as ADGM. The licence unlocks office, visas and banking.", "يحدد نشاطك التجاري الخيار بين البر الرئيسي أو منطقة حرة مثل سوق أبوظبي العالمي. ويفتح الترخيص المكتب والتأشيرات والحساب البنكي."), confirm: L("Permitted activities and licence type — official confirmation required.", "الأنشطة المسموحة ونوع الترخيص — يتطلب تأكيداً رسمياً."), official: ["added", "adgm", "tamm"] },
      { id: "startup", title: L("Startup", "الشركات الناشئة"), guidance: L("Tech startups can explore Hub71 programmes for ecosystem access, partners and potential support.", "يمكن للشركات التقنية الناشئة استكشاف برامج هب71 للوصول إلى المنظومة والشركاء والدعم المحتمل."), confirm: L("Programme eligibility and intake dates.", "أهلية البرنامج ومواعيد القبول."), official: ["hub71", "adgm"] },
      { id: "investment", title: L("Investment", "الاستثمار"), guidance: L("ADIO supports companies investing and expanding in Abu Dhabi — a relevant option for larger moves.", "يدعم مكتب أبوظبي للاستثمار الشركات المستثمرة والمتوسعة — خيار مناسب للانتقالات الكبيرة."), confirm: L("Available support for your sector.", "الدعم المتاح لقطاعك."), official: ["adio"] },
      { id: "office", title: L("Office", "المكتب"), guidance: L("A registered office is usually tied to your licence. Location also shapes team housing and commute.", "يرتبط المكتب المسجل عادةً بترخيصك، ويؤثر موقعه على سكن الفريق وتنقله."), confirm: L("Office requirements for your licence type.", "متطلبات المكتب لنوع ترخيصك."), official: ["added", "adgm"], privateGroups: ["housing"] },
      { id: "hiring", title: L("Hiring", "التوظيف"), guidance: L("Employee visas follow company establishment. Plan relocating staff and local hires together.", "تأتي تأشيرات الموظفين بعد تأسيس الشركة. خطط للموظفين المنتقلين والتوظيف المحلي معاً."), confirm: L("Work permit quotas and employer obligations.", "حصص تصاريح العمل والتزامات صاحب العمل."), official: ["mohre", "icp", "fta"], privateGroups: ["jobs"] },
      { id: "partnerships", title: L("Partnerships", "الشراكات"), guidance: L("The Chamber and ecosystem programmes help you meet customers, partners and investors.", "تساعدك الغرفة وبرامج المنظومة على لقاء العملاء والشركاء والمستثمرين."), confirm: L("Membership and programme terms.", "شروط العضوية والبرامج."), official: ["chamber", "hub71"] },
    ],
  },
  {
    id: "connect", icon: HeartHandshake, title: L("Connect", "تواصل"),
    value: L("Connect faster through culture, community, faith, sport and family life.", "تواصل أسرع عبر الثقافة والمجتمع والإيمان والرياضة والحياة العائلية."),
    sections: [
      { id: "culture", title: L("Culture", "الثقافة"), guidance: L("Museums, heritage sites and cultural seasons are a great way to understand Abu Dhabi.", "المتاحف والمواقع التراثية والمواسم الثقافية طريقة رائعة لفهم أبوظبي."), confirm: L("Event dates and tickets with organisers.", "مواعيد الفعاليات والتذاكر لدى المنظمين."), official: ["tamm"], privateGroups: ["lifestyle"] },
      { id: "community", title: L("Community", "المجتمع"), guidance: L("Professional and cultural groups help newcomers build a network quickly.", "تساعد المجموعات المهنية والثقافية القادمين الجدد على بناء شبكة بسرعة."), confirm: L("Group activity and membership.", "نشاط المجموعة والعضوية."), official: [], privateGroups: ["community"] },
      { id: "faith", title: L("Faith", "الإيمان"), guidance: L("Abu Dhabi is home to mosques and places of worship for many faiths.", "تضم أبوظبي مساجد ودور عبادة لأديان متعددة."), confirm: L("Service times locally.", "مواعيد العبادة محلياً."), official: [], community: [L("Local places of worship", "دور العبادة المحلية"), L("Faith community groups", "مجموعات المجتمع الديني")] },
      { id: "sports", title: L("Sports", "الرياضة"), guidance: L("Clubs, beaches and parks make an active lifestyle easy year-round, especially in cooler months.", "تجعل الأندية والشواطئ والحدائق نمط الحياة النشط سهلاً، خاصة في الأشهر الأبرد."), confirm: L("Club membership and seasons.", "عضوية الأندية والمواسم."), official: [], privateGroups: ["lifestyle"] },
      { id: "events", title: L("Events", "الفعاليات"), guidance: L("Cultural, sporting and business events run throughout the year.", "تُقام الفعاليات الثقافية والرياضية والتجارية طوال العام."), confirm: L("Dates with organisers.", "المواعيد لدى المنظمين."), official: ["chamber"], privateGroups: ["lifestyle"] },
      { id: "volunteering", title: L("Volunteering", "التطوع"), guidance: L("Volunteering is a meaningful way to give back and meet people.", "التطوع طريقة هادفة لرد الجميل والتعرف على الناس."), confirm: L("Registration requirements for volunteers.", "متطلبات تسجيل المتطوعين."), official: ["tamm"], privateGroups: ["community"] },
      { id: "family", title: L("Family", "العائلة"), guidance: L("Family sponsorship follows your residency. Then plan schools, healthcare and childcare together.", "تأتي كفالة العائلة بعد إقامتك، ثم خطط للمدارس والرعاية الصحية ورعاية الأطفال معاً."), confirm: L("Sponsorship eligibility — official confirmation required.", "أهلية الكفالة — يتطلب تأكيداً رسمياً."), official: ["icp", "adek", "doh"] },
    ],
  },
];

export const getPillar = (id: PillarId) => PILLARS.find((p) => p.id === id)!;