import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { Mic, Users, Building2, Plane, Home, Briefcase, Rocket, HeartHandshake, Layers, PlayCircle, Search, MessageSquare, Network } from "lucide-react";
import { openHowItWorks } from "@/components/zayed/HowItWorks";
import { useLang, L } from "@/lib/i18n";
import { useApp } from "@/lib/store";
import { detectMode } from "@/lib/ai/zayedAI";
import { useSpeech } from "@/lib/useSpeech";
import { btn, Arrow, Container, SectionTitle } from "@/components/zayed/ui";
import { cn } from "@/lib/utils";
import type { Mode } from "@/lib/types";
import { PILLARS } from "@/data/pillars";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Zayed One — Your Intelligent Gateway to Abu Dhabi" },
      { name: "description", content: "One intelligent journey for people and companies moving to Abu Dhabi: discover, decide, move, settle and grow." },
      { property: "og:title", content: "Zayed One — Your Intelligent Gateway to Abu Dhabi" },
      { property: "og:description", content: "AI orchestration for moving to Abu Dhabi — personalised journeys, next actions and verified services." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Index,
});


const EXAMPLES = [
  L("I'm an AI engineer in India with a wife and two children.", "أنا مهندس ذكاء اصطناعي في الهند، متزوج ولدي طفلان."),
  L("I run a startup in London and want to enter the Middle East.", "أدير شركة ناشئة في لندن وأريد دخول الشرق الأوسط."),
  L("Our company wants to relocate 20 employees.", "شركتنا تريد نقل 20 موظفاً."),
  L("I work remotely and want to understand whether Abu Dhabi suits my family.", "أعمل عن بُعد وأريد معرفة إن كانت أبوظبي تناسب عائلتي."),
];

const STORY = [
  L("Tell Zayed One your story", "أخبر زايد ون قصتك"),
  L("Zayed One understands you", "زايد ون يفهمك"),
  L("See what is relevant", "اطّلع على ما يهمّك"),
  L("See your Abu Dhabi journey", "شاهد رحلتك إلى أبوظبي"),
  L("Get your next 3 actions", "احصل على خطواتك الثلاث التالية"),
  L("Adapt with What-If", "تكيّف مع «ماذا لو»"),
  L("Connect to verified services", "تواصل مع الخدمات الموثّقة"),
];

function Skyline() {
  return (
    <svg viewBox="0 0 1200 200" className="pointer-events-none absolute inset-x-0 bottom-0 h-40 w-full opacity-40" preserveAspectRatio="none" aria-hidden>
      <path fill="var(--sand)" d="M0 200 L0 150 L60 150 L60 120 L90 120 L90 150 L140 150 L140 90 L160 70 L180 90 L180 150 L230 150 L230 110 L270 110 L270 60 L285 40 L300 60 L300 150 L360 150 L360 130 Q420 80 480 130 L480 150 L540 150 L540 70 L560 50 L580 70 L580 150 L620 150 L620 20 L635 0 L650 20 L650 150 L700 150 L700 100 L740 100 L740 150 L800 150 L800 80 L830 60 L860 80 L860 150 L920 150 Q960 110 1000 150 L1040 150 L1040 90 L1070 90 L1070 150 L1120 150 L1120 120 L1200 120 L1200 200 Z" />
    </svg>
  );
}

const COMPANY_DEMO = "We are a UK AI company with 20 employees. Five employees will relocate with their families. We want to open an Abu Dhabi office within 90 days.";
const PERSON_DEMO = "I'm 36, an AI engineer in Bangalore, India. Married with two children. I want career growth and to relocate my family to Abu Dhabi.";

const CHAINS = [
  { label: L("Person", "فرد"), nodes: [L("Employment / residency", "العمل / الإقامة"), L("Emirates ID", "الهوية الإماراتية"), L("Banking / housing", "البنوك / السكن"), L("Family sponsorship", "كفالة العائلة"), L("School / healthcare", "المدرسة / الصحة")] },
  { label: L("Company", "شركة"), nodes: [L("Company licence", "رخصة الشركة"), L("Founder residency", "إقامة المؤسس"), L("Employee visas", "تأشيرات الموظفين"), L("Team relocation", "نقل الفريق"), L("Housing / school support", "دعم السكن / المدارس")] },
];

function DependencyInsight() {
  const { t } = useLang();
  return (
    <Container className="py-20" >
      <div className="grid gap-10 lg:grid-cols-[1fr_1.2fr] lg:items-center" data-testid="dependency-insight">
        <div>
          <div className="eyebrow mb-3">{t(L("The insight", "الفكرة الجوهرية"))}</div>
          <h2 className="text-3xl font-semibold md:text-5xl">{t(L("The problem isn't finding information. It's knowing what depends on what.", "المشكلة ليست في إيجاد المعلومات، بل في معرفة ما يعتمد على ماذا."))}</h2>
          <p className="mt-5 text-muted-foreground">{t(L("Moving to Abu Dhabi is a chain of connected decisions. Residency affects banking and housing. Housing affects schools and commute. Company establishment affects founders, employees and families. Zayed One maps those dependencies and tells you what to do next.", "الانتقال إلى أبوظبي سلسلة من القرارات المترابطة. الإقامة تؤثر على البنوك والسكن. والسكن يؤثر على المدارس والتنقل. وتأسيس الشركة يؤثر على المؤسسين والموظفين والعائلات. يرسم زايد ون هذه التبعيات ويخبرك بما عليك فعله بعد ذلك."))}</p>
        </div>
        <div className="card-luxe space-y-6 p-6 md:p-8">
          {CHAINS.map((c, ci) => (
            <div key={c.label.en}>
              <div className="mb-3 text-[11px] font-bold uppercase tracking-widest text-turquoise">{t(c.label)}</div>
              <ol className="flex flex-wrap items-center gap-2">
                {c.nodes.map((n, i) => (
                  <li key={n.en} className="flex items-center gap-2 fade-up" style={{ animationDelay: `${ci * 500 + i * 180}ms` }}>
                    <span className={cn("rounded-full border px-3 py-1.5 text-xs font-semibold", i === 0 ? "border-gold bg-gold-soft text-navy" : "border-border bg-card")}>{t(n)}</span>
                    {i < c.nodes.length - 1 && <span className="inline-block text-gold rtl:rotate-180" aria-hidden>→</span>}
                  </li>
                ))}
              </ol>
            </div>
          ))}
          <div className="h-1 w-full overflow-hidden rounded-full bg-muted"><div className="h-full w-full shimmer-line" /></div>
        </div>
      </div>
    </Container>
  );
}

function Differentiation() {
  const { t } = useLang();
  const cols = [
    { icon: Search, title: L("Traditional portals", "البوابات التقليدية"), body: L("Search and execute individual services", "البحث عن الخدمات الفردية وتنفيذها"), hi: false },
    { icon: MessageSquare, title: L("Generic AI chat", "المحادثة العامة بالذكاء الاصطناعي"), body: L("Answer individual questions", "الإجابة عن أسئلة منفردة"), hi: false },
    { icon: Network, title: L("Zayed One", "زايد ون"), body: L("Maintains journey state, models dependencies, recalculates scenarios, and routes users to verified execution", "يحفظ حالة الرحلة، ويرسم التبعيات، ويعيد حساب السيناريوهات، ويوجّه المستخدمين إلى التنفيذ الرسمي الموثّق"), hi: true },
  ];
  return (
    <Container className="pb-16">
      <SectionTitle eyebrow={t(L("What makes it different", "ما الذي يميّزه"))} title={t(L("From answers to orchestration.", "من الإجابات إلى التنسيق."))} />
      <div className="grid gap-4 md:grid-cols-3" data-testid="differentiation">
        {cols.map((c) => (
          <div key={c.title.en} className={cn("rounded-3xl p-6", c.hi ? "bg-navy-gradient shadow-float" : "card-luxe")}>
            <c.icon className={cn("h-6 w-6", c.hi ? "text-gold" : "text-muted-foreground")} />
            <div className={cn("mt-4 text-xs font-bold uppercase tracking-widest", c.hi ? "text-gold" : "text-muted-foreground")}>{t(c.title)}</div>
            <p className="mt-2 font-display text-xl leading-snug">{t(c.body)}</p>
          </div>
        ))}
      </div>
      <p className="mt-4 text-sm text-muted-foreground">{t(L("TAMM and official services execute. Zayed One understands, organises and orchestrates around them.", "تنفّذ منصة تم والخدمات الرسمية المعاملات. ويقوم زايد ون بالفهم والتنظيم والتنسيق حولها."))}</p>
    </Container>
  );
}

function Index() {
  const { t, lang } = useLang();
  const { setMode, setDraft } = useApp();
  const nav = useNavigate();
  const [q, setQ] = useState("");
  const speech = useSpeech(lang, (x) => setQ(x));

  const start = (mode: Mode, text = "", auto = false) => {
    setMode(mode);
    setDraft(text);
    if (auto) { try { sessionStorage.setItem("zayed.autorun", "1"); } catch { /* ignore */ } }
    nav({ to: "/start" });
  };
  const [demoOpen, setDemoOpen] = useState(false);

  return (
    <>
      <section className="relative overflow-hidden bg-hero">
        <div className="absolute inset-0 geo-pattern opacity-50 [mask-image:linear-gradient(to_bottom,black,transparent)]" />
        <Skyline />
        <Container className="relative pb-24 pt-16 md:pt-24">
          <div className="mx-auto max-w-4xl text-center fade-up">
            <div className="mx-auto mb-6 inline-flex items-center gap-2 rounded-full border border-gold/40 bg-card/70 px-4 py-1.5 text-xs font-semibold backdrop-blur">
              <span className="h-1.5 w-1.5 rounded-full bg-turquoise" /> {t(L("Discover. Decide. Move. Settle. Grow.", "اكتشف. قرّر. انتقل. استقر. انمُ."))}
            </div>
            <h1 className="text-5xl font-semibold leading-[1.05] md:text-7xl">
              {lang === "en" ? (<>Your Intelligent Gateway to <span className="text-gold-gradient">Abu Dhabi.</span></>) : (<>بوابتك الذكية إلى <span className="text-gold-gradient">أبوظبي</span></>)}
            </h1>
            <p className="mx-auto mt-6 max-w-2xl text-lg text-muted-foreground">
              {t(L("Whether you're moving yourself, your family, your startup, or your company, Zayed One brings your Abu Dhabi journey together in one intelligent platform.", "سواء كنت تنقل نفسك أو عائلتك أو شركتك الناشئة أو مؤسستك، يجمع زايد ون رحلتك إلى أبوظبي في منصة ذكية واحدة."))}
            </p>
            <p className="mx-auto mt-2 max-w-2xl text-sm text-muted-foreground">{t(L("Discover opportunities, understand your path, and know exactly what to do next.", "اكتشف الفرص، وافهم مسارك، واعرف بالضبط ما عليك فعله بعد ذلك."))}</p>
          </div>

          <div className="mx-auto mt-12 grid max-w-5xl gap-5 md:grid-cols-2">
            {[
              { mode: "person" as Mode, icon: Users, title: L("I'm moving to Abu Dhabi", "سأنتقل إلى أبوظبي"), sub: L("For professionals, families, founders, students, remote workers and investors.", "للمهنيين والعائلات والمؤسسين والطلاب والعاملين عن بُعد والمستثمرين."), cta: L("Start My Journey", "ابدأ رحلتي") },
              { mode: "company" as Mode, icon: Building2, title: L("We're moving a company to Abu Dhabi", "سننقل شركتنا إلى أبوظبي"), sub: L("For startups, SMEs, regional offices and international companies.", "للشركات الناشئة والصغيرة والمتوسطة والمكاتب الإقليمية والشركات الدولية."), cta: L("Start Our Journey", "ابدأ رحلتنا") },
            ].map((c, i) => (
              <button key={c.mode} onClick={() => start(c.mode)} className={cn("group card-luxe relative overflow-hidden p-8 text-start transition hover:-translate-y-1 hover:shadow-float fade-up")} style={{ animationDelay: `${150 + i * 100}ms` }}>
                <div className={cn("absolute -end-10 -top-10 h-40 w-40 rounded-full opacity-30 blur-2xl", i ? "bg-turquoise" : "bg-gold")} />
                <span className={cn("relative grid h-14 w-14 place-items-center rounded-2xl", i ? "bg-turquoise-soft text-turquoise" : "bg-gold-soft text-navy")}><c.icon className="h-7 w-7" /></span>
                <h2 className="relative mt-6 text-2xl font-semibold uppercase tracking-wide md:text-[1.6rem]">{t(c.title)}</h2>
                <p className="relative mt-2 text-muted-foreground">{t(c.sub)}</p>
                <span className="relative mt-6 inline-flex items-center gap-2 font-semibold text-foreground">{t(c.cta)} <Arrow className="transition group-hover:translate-x-1 rtl:group-hover:-translate-x-1" /></span>
              </button>
            ))}
          </div>

          <form onSubmit={(e) => { e.preventDefault(); if (q.trim()) start(detectMode(q), q); }} className="mx-auto mt-10 max-w-4xl card-luxe p-3 shadow-float">
            <label className="block px-4 pt-3 text-xs font-bold uppercase tracking-widest text-turquoise">{t(L("Tell Zayed One what you're trying to achieve.", "أخبر زايد ون بما تريد تحقيقه في أبوظبي"))}</label>
            <div className="flex items-end gap-2">
              <textarea value={q} onChange={(e) => setQ(e.target.value)} rows={2} placeholder={t(EXAMPLES[0]!)} className="min-h-[64px] flex-1 resize-none bg-transparent px-4 py-3 text-lg outline-none placeholder:text-muted-foreground/60" />
              {speech.supported && (
                <button type="button" onClick={speech.toggle} className={cn("mb-2 rounded-full border border-border p-3", speech.listening && "pulse-ring border-turquoise text-turquoise")} aria-label="Voice input"><Mic className="h-5 w-5" /></button>
              )}
              <button type="submit" className={cn(btn.primary, "mb-2")}>{t(L("Begin", "ابدأ"))} <Arrow /></button>
            </div>
          </form>
          <div className="mx-auto mt-4 flex max-w-4xl flex-wrap justify-center gap-2">
            {EXAMPLES.map((e) => <button key={e.en} onClick={() => setQ(t(e))} className={btn.chip}>“{t(e)}”</button>)}
          </div>
          <div className="mx-auto mt-6 flex max-w-4xl flex-wrap items-center justify-center gap-2 text-xs" data-testid="demo-shortcut">
            <button onClick={() => setDemoOpen((x) => !x)} className="inline-flex items-center gap-1.5 rounded-full border border-border bg-card/70 px-3 py-1.5 font-semibold text-muted-foreground hover:text-foreground" aria-expanded={demoOpen}>
              <PlayCircle className="h-3.5 w-3.5" />{t(L("Demo", "عرض تجريبي"))}
            </button>
            {demoOpen && (
              <>
                <button onClick={() => start("company", COMPANY_DEMO, true)} className="rounded-full bg-navy-gradient px-3 py-1.5 font-semibold">{t(L("Company demo", "تجربة الشركة"))}</button>
                <button onClick={() => start("person", PERSON_DEMO, true)} className="rounded-full bg-gold-soft px-3 py-1.5 font-semibold text-navy">{t(L("Person / family demo", "تجربة الفرد / العائلة"))}</button>
              </>
            )}
            <button onClick={openHowItWorks} className="rounded-full px-3 py-1.5 font-semibold text-muted-foreground underline-offset-4 hover:underline">{t(L("How Zayed One works", "كيف يعمل زايد ون"))}</button>
          </div>
        </Container>
      </section>

      <DependencyInsight />
      <Differentiation />

      <Container className="py-20">
        <SectionTitle eyebrow={t(L("How it works", "كيف يعمل"))} title={t(L("One story in. One intelligent journey out.", "قصة واحدة. رحلة ذكية واحدة."))} />
        <ol className="grid gap-3 sm:grid-cols-2 lg:grid-cols-7">
          {STORY.map((s, i) => (
            <li key={s.en} className="card-luxe p-4">
              <div className="font-display text-2xl text-gold-gradient">0{i + 1}</div>
              <div className="mt-2 text-sm font-semibold leading-snug">{t(s)}</div>
            </li>
          ))}
        </ol>
      </Container>

      <Container className="pb-12">
        <SectionTitle eyebrow={t(L("Five master areas", "خمسة محاور رئيسية"))} title={t(L("Everything your move touches — connected.", "كل ما يمسّ انتقالك — مترابط."))} sub={t(L("Government, housing, jobs, business, education, healthcare, transport, community and growth — orchestrated into one journey.", "الحكومة والسكن والوظائف والأعمال والتعليم والصحة والتنقل والمجتمع والنمو — في رحلة واحدة."))} />
        <div className="grid gap-4 md:grid-cols-5">
          {PILLARS.map((a) => (
            <div key={a.id} id={a.id} className="card-luxe relative scroll-mt-28 p-6 transition hover:-translate-y-1 hover:border-gold focus-within:border-gold">
              <a.icon className="h-6 w-6 text-gold" />
              <h3 className="mt-4 text-2xl font-semibold uppercase tracking-wider">
                <Link to={`/${a.id}`} className="after:absolute after:inset-0 after:rounded-[inherit] focus-visible:outline-none">{t(a.title)}</Link>
              </h3>
              <ul className="relative z-10 mt-4 space-y-1.5 text-sm text-muted-foreground">
                {a.sections.map((x) => (
                  <li key={x.id}><Link to={`/${a.id}`} hash={x.id} className="rounded transition hover:text-foreground hover:underline focus-visible:outline-2 focus-visible:outline-gold">{t(x.title)}</Link></li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </Container>

      <Container className="py-20">
        <div className="relative overflow-hidden rounded-3xl bg-navy-gradient p-8 md:p-14">
          <div className="absolute inset-0 geo-pattern opacity-30" />
          <div className="relative grid gap-10 md:grid-cols-2 md:items-center">
            <div>
              <div className="mb-3 text-xs font-bold uppercase tracking-[0.25em] text-gold">{t(L("Zayed One & TAMM", "زايد ون ومنصة تم"))}</div>
              <h2 className="text-3xl font-semibold md:text-4xl">{t(L("We orchestrate. Official services execute.", "نحن ننظّم. والخدمات الرسمية تنفّذ."))}</h2>
              <p className="mt-4 opacity-80">{t(L("TAMM is Abu Dhabi's official government-service platform. Zayed One helps people and companies understand what they need, organize their journey, and connect the relevant government and life services around them. Official transactions remain with TAMM and the appropriate authorities.", "منصة تم هي منصة أبوظبي الرسمية للخدمات الحكومية. يساعد زايد ون الأفراد والشركات على فهم احتياجاتهم وتنظيم رحلتهم وربط الخدمات الحكومية والحياتية ذات الصلة. تبقى المعاملات الرسمية لدى منصة تم والجهات المختصة."))}</p>
            </div>
            <div className="space-y-3">
              <div className="rounded-2xl border border-gold/40 bg-card/5 p-5">
                <div className="flex items-center gap-2 text-gold"><Layers className="h-4 w-4" /><span className="text-xs font-bold uppercase tracking-widest">{t(L("Zayed One", "زايد ون"))}</span></div>
                <div className="mt-2 font-display text-2xl">{t(L("Understand + Organize + Orchestrate", "افهم + نظّم + نسّق"))}</div>
              </div>
              <div className="rounded-2xl border border-turquoise/40 bg-card/5 p-5">
                <div className="text-xs font-bold uppercase tracking-widest text-turquoise">{t(L("Official services", "الخدمات الرسمية"))}</div>
                <div className="mt-2 font-display text-2xl">{t(L("Execute", "تنفّذ"))}</div>
              </div>
            </div>
          </div>
        </div>
      </Container>

      <Container className="py-10 text-center">
        <p className="mx-auto max-w-3xl text-lg text-muted-foreground">{t(L("Abu Dhabi already has world-class services, infrastructure and quality of life. The challenge is piecing the journey together across many systems. Zayed One brings those decisions into one personalised journey.", "تمتلك أبوظبي بالفعل خدمات وبنية تحتية وجودة حياة عالمية. التحدي هو تجميع الرحلة عبر أنظمة متعددة. يجمع زايد ون هذه القرارات في رحلة شخصية واحدة."))}</p>
        <h2 className="mt-8 text-3xl font-semibold md:text-5xl">{t(L("One person or one company.", "فرد واحد أو شركة واحدة."))}<br /><span className="text-gold-gradient">{t(L("One intelligent Abu Dhabi journey.", "رحلة ذكية واحدة إلى أبوظبي."))}</span></h2>
        <div className="mt-8 flex flex-wrap justify-center gap-3">
          <button onClick={() => start("person")} className={btn.primary}>{t(L("Start My Journey", "ابدأ رحلتي"))} <Arrow /></button>
          <Link to="/company-command" className={btn.ghost}>{t(L("See Company Command Center", "شاهد مركز قيادة الشركة"))}</Link>
        </div>
      </Container>
    </>
  );
}