import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { Info, Sparkles as Spark, Building2, Users, RotateCcw } from "lucide-react";
import { useLang, L } from "@/lib/i18n";
import { useApp } from "@/lib/store";
import { applyWhatIf, buildJourney, buildJourneySync, analyzeProfile, DEMO_PERSONAS } from "@/lib/ai/zayedAI";
import { NextActions, Timeline, WhatIf, Opportunities } from "@/components/zayed/JourneyBlocks";
import { LifeMap, BusinessMap } from "@/components/zayed/Maps";
import { OfficialServices, PrivateServices } from "@/components/zayed/Services";
import { btn, Arrow, Container, EngineBadge } from "@/components/zayed/ui";
import { StepLoader } from "@/components/zayed/Loader";

export const Route = createFileRoute("/dashboard")({
  head: () => ({
    meta: [
      { title: "My Abu Dhabi dashboard — Zayed One" },
      { name: "description", content: "Your personalised Abu Dhabi journey, next 3 actions, What-If scenarios and verified services." },
      { property: "og:title", content: "My Abu Dhabi — Zayed One" },
      { property: "og:description", content: "Personalised next actions, journey timeline and What-If engine for your Abu Dhabi move." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Dashboard,
});

function Dashboard() {
  const { t } = useLang();
  const app = useApp();
  const [busy, setBusy] = useState(false);
  const [loadingDemo, setLoadingDemo] = useState(false);
  const j = app.journey;

  const loadDemo = async (id: string) => {
    const d = DEMO_PERSONAS.find((x) => x.id === id);
    if (!d) return;
    setLoadingDemo(true);
    try {
      const p = await analyzeProfile(d.text, d.mode);
      app.setMode(d.mode);
      app.setProfile(p);
      app.setJourney(await buildJourney(p));
    } catch {
      const p = { mode: d.mode, raw: d.text, facts: { priorities: [] } };
      app.setProfile(p);
      app.setJourney(buildJourneySync(p));
    } finally {
      setLoadingDemo(false);
    }
  };

  const onWhatIf = async (q: string) => {
    if (!app.profile) return;
    setBusy(true);
    try {
      const r = await applyWhatIf(app.profile, q, app.journey);
      app.setProfile(r.profile);
      app.setJourney(r.journey);
      app.pushHistory(q);
    } catch {
      /* keep current journey on any failure */
    } finally {
      setBusy(false);
    }
  };

  if (!app.ready || loadingDemo) return <Container className="py-24"><StepLoader steps={[L("Building your journey...", "جارٍ بناء رحلتك..."), L("Identifying your next actions...", "جارٍ تحديد خطواتك التالية...")]} /></Container>;

  if (!j) {
    return (
      <Container className="py-24 text-center">
        <h1 className="text-4xl font-semibold">{t(L("Your journey starts with your story.", "رحلتك تبدأ بقصتك."))}</h1>
        <p className="mt-3 text-muted-foreground">{t(L("Start onboarding or load a demo profile.", "ابدأ التسجيل أو حمّل ملفاً تجريبياً."))}</p>
        <div className="mt-8 flex flex-wrap justify-center gap-3">
          <Link to="/start" className={btn.primary}>{t(L("Start Journey", "ابدأ الرحلة"))} <Arrow /></Link>
          <button onClick={() => loadDemo("ai-eng")} className={btn.ghost}><Users className="h-4 w-4" />{t(L("Demo: person", "تجربة: فرد"))}</button>
          <button onClick={() => loadDemo("company")} className={btn.ghost}><Building2 className="h-4 w-4" />{t(L("Demo: company", "تجربة: شركة"))}</button>
        </div>
      </Container>
    );
  }

  const isCompany = j.type === "company";
  return (
    <div className="bg-hero">
      <Container className="space-y-14 py-10">
        <div className="flex flex-wrap items-center gap-3">
          <EngineBadge engine={j.engine} />
          <div className="flex items-center gap-2 rounded-full border border-gold/40 bg-card/70 px-4 py-2 text-xs text-muted-foreground backdrop-blur">
            <Info className="h-3.5 w-3.5 text-gold" />{t(j.engine === "openai" ? L("AI-generated guidance — indicative; official confirmation required.", "إرشادات مولّدة بالذكاء الاصطناعي — استرشادية ويلزم التأكيد الرسمي.") : L("Demo intelligence mode — guidance is indicative; official confirmation required.", "وضع الذكاء التجريبي — الإرشادات استرشادية ويلزم التأكيد الرسمي."))}
          </div>
        </div>

        <section className="relative overflow-hidden rounded-3xl bg-navy-gradient p-8 shadow-float md:p-12 fade-up">
          <div className="absolute inset-0 geo-pattern opacity-30" />
          <div className="relative grid gap-8 lg:grid-cols-[1.4fr_1fr]">
            <div>
              <div className="text-xs font-bold uppercase tracking-[0.25em] text-gold">{t(isCompany ? L("Company journey", "رحلة الشركة") : L("Personal journey", "الرحلة الشخصية"))}</div>
              <h1 className="mt-3 text-5xl font-semibold uppercase md:text-6xl">{t(j.title)}</h1>
              <p className="mt-4 max-w-xl text-lg opacity-85">{t(j.summary)}</p>
              <div className="mt-6 flex flex-wrap gap-3">
                {isCompany && <Link to="/company-command" className={btn.gold}>{t(L("Open Company Move Command Center", "افتح مركز قيادة نقل الشركة"))} <Arrow /></Link>}
                <Link to="/start" className="inline-flex items-center gap-2 rounded-full border border-card/30 px-5 py-2.5 text-sm font-semibold hover:bg-card/10"><RotateCcw className="h-4 w-4" />{t(L("New journey", "رحلة جديدة"))}</Link>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-2 self-start">
              {j.profile.slice(0, 6).map((f) => (
                <div key={f.label.en} className="rounded-2xl border border-card/15 bg-card/5 p-3">
                  <div className="text-[10px] font-bold uppercase tracking-widest text-gold">{t(f.label)}</div>
                  <div className="mt-1 text-sm font-semibold">{t(f.value)}</div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {j.whatIfNote && (
          <div className="flex flex-wrap items-start gap-3 rounded-2xl border border-gold bg-gold-soft p-4 text-navy fade-up" key={j.whatIfNote.en} data-testid="whatif-result">
            <Spark className="mt-0.5 h-5 w-5 shrink-0" />
            <div className="flex-1">
              <div className="text-xs font-bold uppercase tracking-widest">{t(L("Journey updated", "تم تحديث الرحلة"))}</div>
              <div className="mt-1 text-sm">{t(j.whatIfNote)}</div>
            </div>
            {j.changedCount ? (
              <span className="rounded-full bg-navy-gradient px-3 py-1.5 text-xs font-bold" data-testid="changed-count">
                {t(L(`${j.changedCount} ${j.changedCount === 1 ? "dependency" : "dependencies"} changed`, `تغيّرت ${j.changedCount} من التبعيات`))}
              </span>
            ) : null}
          </div>
        )}

        <NextActions journey={j} />

        {j.insights && (j.insights.risks.length > 0 || j.insights.verify.length > 0 || j.insights.unknowns.length > 0) && (
          <section className="grid gap-4 md:grid-cols-3" data-testid="insights">
            {([[L("Dependency risks", "مخاطر التبعيات"), j.insights.risks], [L("Needs official confirmation", "يتطلب تأكيداً رسمياً"), j.insights.verify], [L("Still unknown", "ما زال غير معروف"), j.insights.unknowns]] as const).map(([label, items]) => items.length ? (
              <div key={label.en} className="card-luxe p-5">
                <div className="text-[11px] font-bold uppercase tracking-widest text-turquoise">{t(label)}</div>
                <ul className="mt-3 space-y-2 text-sm">{items.map((x) => <li key={x.en} className="flex gap-2"><span className="text-gold">•</span>{t(x)}</li>)}</ul>
              </div>
            ) : null)}
          </section>
        )}
        <Timeline journey={j} />
        <WhatIf type={j.type} onApply={onWhatIf} busy={busy} />
        <Opportunities journey={j} />
        {isCompany ? <BusinessMap /> : <LifeMap journey={j} />}
        <OfficialServices ids={j.sources} />
        <PrivateServices />
      </Container>
    </div>
  );
}