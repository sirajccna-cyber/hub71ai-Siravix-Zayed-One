import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Mic, Users, Building2, Pencil, Check, Info } from "lucide-react";
import { useLang, L } from "@/lib/i18n";
import { useApp } from "@/lib/store";
import { analyzeProfile, buildJourney, buildJourneySync, profileFields, DEMO_PERSONAS } from "@/lib/ai/zayedAI";
import { useSpeech } from "@/lib/useSpeech";
import { StepLoader } from "@/components/zayed/Loader";
import { btn, Arrow, Container, EngineBadge } from "@/components/zayed/ui";
import { cn } from "@/lib/utils";
import type { Profile } from "@/lib/types";

export const Route = createFileRoute("/start")({
  head: () => ({
    meta: [
      { title: "Start your journey — Zayed One" },
      { name: "description", content: "Tell Zayed One your story and get a personalised Abu Dhabi relocation journey." },
      { property: "og:title", content: "Start your Abu Dhabi journey — Zayed One" },
      { property: "og:description", content: "Natural-language onboarding for people and companies moving to Abu Dhabi." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: StartPage,
});

const ANALYZE = [L("1. Understanding your story", "1. فهم قصتك"), L("2. Extracting constraints", "2. استخراج القيود"), L("3. Mapping Abu Dhabi dependencies", "3. رسم تبعيات أبوظبي"), L("4. Building your Next 3 Actions", "4. بناء خطواتك الثلاث التالية")];
const BUILD = [L("3. Mapping Abu Dhabi dependencies", "3. رسم تبعيات أبوظبي"), L("4. Building your Next 3 Actions", "4. بناء خطواتك الثلاث التالية")];
const AUTORUN_KEY = "zayed.autorun";

function StartPage() {
  const { t, lang } = useLang();
  const app = useApp();
  const nav = useNavigate();
  const [text, setText] = useState("");
  const [phase, setPhase] = useState<"input" | "analyzing" | "confirm" | "building">("input");
  const [profile, setProfile] = useState<Profile | null>(null);
  const speech = useSpeech(lang, (x) => setText(x));
  const mode = app.mode;

  useEffect(() => {
    if (app.ready && app.draft) {
      const d = app.draft;
      setText(d);
      app.setDraft("");
      let auto = false;
      try { auto = sessionStorage.getItem(AUTORUN_KEY) === "1"; sessionStorage.removeItem(AUTORUN_KEY); } catch { /* ignore */ }
      if (auto) void analyze(d);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [app.ready]);

  const analyze = async (input = text) => {
    if (!input.trim()) return;
    setPhase("analyzing");
    try {
      const p = await analyzeProfile(input, mode);
      setProfile(p);
      setPhase("confirm");
    } catch {
      setPhase("input");
    }
  };

  const confirm = async () => {
    if (!profile) return;
    setPhase("building");
    let j;
    try { j = await buildJourney(profile); } catch { j = buildJourneySync(profile); }
    app.setProfile(profile);
    app.setJourney(j);
    nav({ to: "/dashboard" });
  };

  const placeholder = mode === "company"
    ? L("We are a UK AI company with 35 employees. We want to open an Abu Dhabi office. Initially six employees and two founders will relocate.", "نحن شركة ذكاء اصطناعي بريطانية تضم 35 موظفاً ونريد افتتاح مكتب في أبوظبي. سينتقل في البداية ستة موظفين ومؤسسان.")
    : L("I'm 36, work as a cybersecurity engineer in India, married with two children, and I'm considering Abu Dhabi for career growth and family life.", "عمري 36 عاماً، أعمل مهندس أمن سيبراني في الهند، متزوج ولدي طفلان، وأفكر في أبوظبي للنمو المهني وحياة العائلة.");

  const fields = profile ? profileFields(profile) : [];

  return (
    <div className="bg-hero">
      <Container className="max-w-4xl py-14">
        {phase === "input" && (
          <div className="fade-up">
            <div className="eyebrow mb-3">{t(L("Step 1 · Tell Zayed One your story", "الخطوة 1 · أخبر زايد ون قصتك"))}</div>
            <h1 className="text-4xl font-semibold md:text-5xl">{t(mode === "company" ? L("Tell us about your company's move.", "أخبرنا عن انتقال شركتك.") : L("Tell us about your move.", "أخبرنا عن انتقالك."))}</h1>

            <div className="mt-8 inline-flex rounded-full border border-border bg-card p-1">
              {([["person", Users, L("Person", "فرد")], ["company", Building2, L("Company", "شركة")]] as const).map(([m, Icon, label]) => (
                <button key={m} onClick={() => app.setMode(m)} className={cn("flex items-center gap-2 rounded-full px-5 py-2 text-sm font-semibold transition", mode === m ? "bg-navy-gradient" : "text-muted-foreground")}>
                  <Icon className="h-4 w-4" /> {t(label)}
                </button>
              ))}
            </div>

            <div className="card-luxe mt-6 p-3 shadow-float">
              <textarea value={text} onChange={(e) => setText(e.target.value)} rows={5} placeholder={t(placeholder)} className="w-full resize-none bg-transparent p-4 text-lg outline-none placeholder:text-muted-foreground/60" />
              <div className="flex items-center justify-between gap-2 px-2 pb-2">
                <span className="min-w-0 text-xs text-muted-foreground">{t(L("Arabic, English or both — all welcome.", "العربية أو الإنجليزية أو كلاهما — مرحّب بها."))}</span>
                <div className="flex gap-2">
                  {speech.supported && (
                    <button onClick={speech.toggle} className={cn("rounded-full border border-border p-3", speech.listening && "pulse-ring border-turquoise text-turquoise")} aria-label="Voice"><Mic className="h-5 w-5" /></button>
                  )}
                  <button onClick={() => analyze()} disabled={!text.trim()} className={cn(btn.primary, "whitespace-nowrap px-4 sm:px-6")}>{t(mode === "company" ? L("Plan Our Journey", "خطط لرحلتنا") : L("Plan My Journey", "خطط لرحلتي"))} <Arrow /></button>
                </div>
              </div>
            </div>

            <div className="mt-8">
              <div className="mb-3 text-sm font-semibold">{t(L("Or load a demo profile:", "أو حمّل ملفاً تجريبياً:"))}</div>
              <div className="grid gap-3 sm:grid-cols-2">
                {DEMO_PERSONAS.map((d) => (
                  <button key={d.id} onClick={() => { app.setMode(d.mode); setText(d.text); }} className="card-luxe flex items-center gap-3 p-4 text-start transition hover:-translate-y-0.5 hover:border-gold">
                    <span className={cn("grid h-10 w-10 shrink-0 place-items-center rounded-xl", d.mode === "company" ? "bg-turquoise-soft text-turquoise" : "bg-gold-soft")}>{d.mode === "company" ? <Building2 className="h-5 w-5" /> : <Users className="h-5 w-5" />}</span>
                    <span className="text-sm font-semibold">{t(d.label)}</span>
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}

        {phase === "analyzing" && <StepLoader steps={ANALYZE} />}
        {phase === "building" && <StepLoader steps={BUILD} />}

        {phase === "confirm" && profile && (
          <div className="fade-up">
            <div className="mb-3 flex flex-wrap items-center gap-3">
              <span className="eyebrow">{t(L("Step 2 · Confirm", "الخطوة 2 · التأكيد"))}</span>
              <EngineBadge engine={profile.engine} />
              {profile.engine === "openai" && <span className="text-xs font-semibold text-turquoise">{t(L("OpenAI reasoning complete", "اكتمل تحليل OpenAI"))}</span>}
            </div>
            <h1 className="text-4xl font-semibold md:text-5xl">{t(L("Zayed One understood:", "فهم زايد ون ما يلي:"))}</h1>
            <p className="mt-3 rounded-2xl bg-card/70 p-4 text-sm italic text-muted-foreground">“{profile.raw}”</p>
            <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3" data-testid="profile-confirm">
              {fields.map((f, i) => (
                <div key={f.label.en} className="card-luxe p-5 fade-up" style={{ animationDelay: `${i * 60}ms` }}>
                  <div className="text-[11px] font-bold uppercase tracking-widest text-turquoise">{t(f.label)}</div>
                  <div className="mt-2 font-display text-xl font-semibold">{t(f.value)}</div>
                </div>
              ))}
            </div>
            {profile.insights && (profile.insights.constraints.length > 0 || profile.insights.unknowns.length > 0) && (
              <div className="mt-6 grid gap-4 sm:grid-cols-2">
                {([[L("Constraints extracted", "القيود المستخرجة"), profile.insights.constraints], [L("Unknowns to confirm", "تفاصيل غير معروفة للتأكيد"), profile.insights.unknowns]] as const).map(([label, items]) => items.length ? (
                  <div key={label.en} className="rounded-2xl border border-border bg-card/70 p-4">
                    <div className="text-[11px] font-bold uppercase tracking-widest text-gold">{t(label)}</div>
                    <ul className="mt-2 space-y-1 text-sm">{items.map((x) => <li key={x.en}>• {t(x)}</li>)}</ul>
                  </div>
                ) : null)}
              </div>
            )}
            <p className="mt-6 flex items-center gap-2 text-xs text-muted-foreground"><Info className="h-4 w-4" />{t(L("Only details you shared are shown — nothing has been invented.", "تظهر فقط التفاصيل التي شاركتها — لم يُضَف شيء من عندنا."))}</p>
            {profile.aiReason === "not_configured" && (
              <p className="mt-2 text-[11px] text-muted-foreground/80">{t(L("Developer note: set OPENAI_API_KEY on the server to enable the live OpenAI Journey Engine. The deterministic engine is active.", "ملاحظة للمطوّر: اضبط OPENAI_API_KEY على الخادم لتفعيل محرك OpenAI المباشر. المحرك الاحتياطي مفعّل."))}</p>
            )}
            <div className="mt-8 flex flex-wrap gap-3">
              <button onClick={confirm} className={btn.primary}><Check className="h-4 w-4" /> {t(L("Confirm", "تأكيد"))}</button>
              <button onClick={() => setPhase("input")} className={btn.ghost}><Pencil className="h-4 w-4" /> {t(L("Edit", "تعديل"))}</button>
            </div>
          </div>
        )}
      </Container>
    </div>
  );
}