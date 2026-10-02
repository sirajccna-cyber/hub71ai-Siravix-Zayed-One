import { useState } from "react";
import { Check, Wand2, Sparkle, ExternalLink, Briefcase, GraduationCap, Rocket, Landmark, Heart, Palmtree, Building2, Users, TrendingUp, Globe2, Plane, LineChart, ChevronDown, Zap } from "lucide-react";
import { useLang, L } from "@/lib/i18n";
import type { Journey, LText } from "@/lib/types";
import { getSource } from "@/lib/sources";
import { chainFor, getNode, type GraphNode } from "@/data/settlementGraph";
import { cn } from "@/lib/utils";
import { btn, SourceBadge, GraphBadge } from "./ui";

/** Compact dependency chain: upstream → node → unlocks. */
export function DependencyChain({ nodes, focusId, className }: { nodes: GraphNode[]; focusId?: string | undefined; className?: string }) {
  const { t } = useLang();
  return (
    <ol className={cn("flex flex-wrap items-center gap-1.5", className)} data-testid="dependency-chain">
      {nodes.map((n, i) => (
        <li key={n.id} className="flex items-center gap-1.5">
          <span className={cn("rounded-full border px-2.5 py-1 text-[11px] font-semibold leading-tight", n.id === focusId ? "border-gold bg-gold-soft text-navy" : "border-border bg-card text-foreground")}>{t(n.requirement)}</span>
          {i < nodes.length - 1 && <span className="inline-block text-gold rtl:rotate-180" aria-hidden>→</span>}
        </li>
      ))}
    </ol>
  );
}

function WhyNextStep({ graphId }: { graphId: string }) {
  const { t } = useLang();
  const [open, setOpen] = useState(false);
  const { upstream, node, downstream } = chainFor(graphId);
  if (!node) return null;
  const src = node.sourceId ? getSource(node.sourceId) : undefined;
  return (
    <div className="mt-4 rounded-2xl border border-border/80 bg-background/60">
      <button onClick={() => setOpen((x) => !x)} className="flex w-full items-center justify-between gap-2 px-4 py-2.5 text-start text-xs font-bold uppercase tracking-widest" aria-expanded={open}>
        <span className="flex items-center gap-1.5"><Zap className="h-3.5 w-3.5 text-gold" />{t(L("Why this is your next step", "لماذا هذه خطوتك التالية"))}</span>
        <ChevronDown className={cn("h-4 w-4 transition", open && "rotate-180")} />
      </button>
      {open && (
        <div className="space-y-3 px-4 pb-4 text-sm fade-up" data-testid="why-next-step">
          <div><div className="text-[10px] font-bold uppercase tracking-widest text-turquoise">{t(L("Triggered by", "المحفّز"))}</div><div>{t(node.trigger)}</div></div>
          <div>
            <div className="text-[10px] font-bold uppercase tracking-widest text-turquoise">{t(L("Depends on", "يعتمد على"))}</div>
            <div>{upstream.length ? upstream.map((u) => t(u.requirement)).join(" · ") : t(L("Nothing — you can start now", "لا شيء — يمكنك البدء الآن"))}</div>
          </div>
          <div><div className="text-[10px] font-bold uppercase tracking-widest text-turquoise">{t(L("Unlocks", "يفتح"))}</div><div>{downstream.length ? downstream.map((u) => t(u.requirement)).join(" · ") : "—"}</div></div>
          <DependencyChain nodes={[...upstream, node, ...downstream.slice(0, 2)]} focusId={node.id} />
          <p className="text-xs text-muted-foreground">{t(node.rationale)}</p>
          {src && <div className="text-xs"><SourceBadge kind={node.verification === "official" ? "verified" : node.verification} /> <span className="ms-1 font-semibold">{t(src.name)}</span></div>}
        </div>
      )}
    </div>
  );
}

export function NextActions({ journey }: { journey: Journey }) {
  const { t } = useLang();
  const title = journey.type === "company" ? L("Your Company's Next 3 Actions", "خطوات شركتك الثلاث التالية") : L("Your Next 3 Actions", "خطواتك الثلاث التالية");
  return (
    <section>
      <div className="mb-6 flex flex-wrap items-end justify-between gap-4">
        <div>
          <div className="eyebrow mb-3">{t(L("Prioritised for you", "مرتبة حسب أولويتك"))}</div>
          <h2 className="text-3xl font-semibold md:text-4xl">{t(title)}</h2>
        </div>
        <GraphBadge className="max-w-sm" />
      </div>
      <div className="grid gap-5 md:grid-cols-3" data-testid="next-actions">
        {journey.nextActions.map((a, i) => {
          const sid = a.sourceId ?? getNode(a.graphId)?.sourceId;
          const src = sid ? getSource(sid) : undefined;
          return (
            <article key={(a.graphId ?? "") + a.title.en} className={cn("card-luxe relative flex flex-col p-6 fade-up", a.isNew && "ring-2 ring-gold")} style={{ animationDelay: `${i * 90}ms` }}>
              <div className="mb-5 flex items-center justify-between">
                <span className="font-display text-5xl text-gold-gradient">{i + 1}</span>
                {a.isNew && <span className="rounded-full bg-gold-soft px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider text-navy" data-testid="changed-pill">{t(L("New · Changed", "جديد · تغيّر"))}</span>}
              </div>
              <h3 className="text-lg font-semibold leading-snug">{t(a.title)}</h3>
              <p className="mt-3 text-sm text-muted-foreground"><span className="font-semibold text-foreground">{t(L("Why: ", "السبب: "))}</span>{t(a.why)}</p>
              {a.graphId && <WhyNextStep graphId={a.graphId} />}
              {src && (
                <a href={src.url} target="_blank" rel="noreferrer" className="mt-auto flex items-center justify-between gap-2 pt-5 text-sm font-semibold text-turquoise hover:underline">
                  <span className="flex items-center gap-2"><SourceBadge kind="verified" /> {t(src.name)}</span>
                  <ExternalLink className="h-4 w-4" />
                </a>
              )}
            </article>
          );
        })}
      </div>
    </section>
  );
}

export function Timeline({ journey }: { journey: Journey }) {
  const { t } = useLang();
  return (
    <section className="card-luxe overflow-hidden p-6 md:p-10">
      <div className="eyebrow mb-3">{t(L("Your journey", "رحلتك"))}</div>
      <h2 className="mb-8 text-2xl font-semibold md:text-3xl">{t(journey.type === "company" ? L("Our Abu Dhabi journey", "رحلة شركتنا إلى أبوظبي") : L("My Abu Dhabi journey", "رحلتي إلى أبوظبي"))}</h2>
      <ol className="relative flex flex-col gap-6 md:flex-row md:gap-0" data-testid="timeline">
        {journey.journeyStages.map((s, i) => (
          <li key={s.key} className="relative flex gap-4 md:flex-1 md:flex-col md:items-center md:text-center">
            {i < journey.journeyStages.length - 1 && (
              <span className={cn("absolute start-[15px] top-8 h-[calc(100%+0.5rem)] w-0.5 md:start-1/2 md:top-[15px] md:h-0.5 md:w-full", s.status === "complete" ? "bg-turquoise" : "bg-border")} />
            )}
            <span className={cn("relative z-10 grid h-8 w-8 shrink-0 place-items-center rounded-full border-2 bg-card text-xs font-bold", s.status === "complete" && "border-turquoise bg-turquoise text-card", s.status === "current" && "border-gold pulse-ring", s.status === "upcoming" && "border-border text-muted-foreground")}>
              {s.status === "complete" ? <Check className="h-4 w-4" /> : i + 1}
            </span>
            <div className="md:mt-4 md:px-2">
              <div className={cn("text-sm font-bold uppercase tracking-widest", s.status === "current" ? "text-foreground" : "text-muted-foreground")}>{t(s.title)}</div>
              <div className="mt-1 text-xs text-muted-foreground">{t(s.description)}</div>
              {s.status === "current" && <div className="mt-2 inline-block rounded-full bg-gold-soft px-2 py-0.5 text-[10px] font-bold uppercase">{t(L("You are here", "أنت هنا"))}</div>}
            </div>
          </li>
        ))}
      </ol>
    </section>
  );
}

export function WhatIf({ type, onApply, busy }: { type: "person" | "company"; onApply: (q: string) => void; busy: boolean }) {
  const { t } = useLang();
  const [q, setQ] = useState("");
  const chips: LText[] = type === "company"
    ? [L("What if only the founders relocate first?", "ماذا لو انتقل المؤسسون أولاً فقط؟"), L("What if 15 employees relocate instead?", "ماذا لو انتقل 15 موظفاً بدلاً من ذلك؟"), L("What if we hire locally?", "ماذا لو وظفنا محلياً؟"), L("What if we use a smaller office?", "ماذا لو استخدمنا مكتباً أصغر؟"), L("What if we expand to 100 employees?", "ماذا لو توسعنا إلى 100 موظف؟")]
    : [L("What if my spouse also gets a job?", "ماذا لو حصل زوجي/زوجتي على وظيفة أيضاً؟"), L("What if my salary changes?", "ماذا لو تغيّر راتبي؟"), L("What if my family joins later?", "ماذا لو انضمت عائلتي لاحقاً؟"), L("What if I work remotely?", "ماذا لو عملت عن بُعد؟"), L("What if I start a company?", "ماذا لو أسست شركة؟"), L("What if I do not buy a car?", "ماذا لو لم أشترِ سيارة؟")];
  return (
    <section className="relative overflow-hidden rounded-3xl bg-navy-gradient p-6 shadow-float md:p-10">
      <div className="pointer-events-none absolute inset-0 geo-pattern opacity-40" />
      <div className="relative">
        <div className="mb-2 flex items-center gap-2 text-gold"><Wand2 className="h-5 w-5" /><span className="text-xs font-bold uppercase tracking-[0.25em]">{t(L("Scenario engine", "محرك السيناريوهات"))}</span></div>
        <h2 className="text-4xl font-semibold md:text-5xl">{t(L("What if?", "ماذا لو؟"))}</h2>
        <p className="mt-2 max-w-xl opacity-75">{t(L("Change one circumstance and watch your journey, actions and plan adapt.", "غيّر ظرفاً واحداً وشاهد رحلتك وخطواتك وخطتك تتكيف."))}</p>
        <div className="mt-6 flex flex-wrap gap-2">
          {chips.map((c) => (
            <button key={c.en} disabled={busy} onClick={() => onApply(t(c))} className="rounded-full border border-gold/40 bg-card/5 px-4 py-2 text-sm transition hover:bg-gold hover:text-navy disabled:opacity-50">{t(c)}</button>
          ))}
        </div>
        <form onSubmit={(e) => { e.preventDefault(); if (q.trim()) { onApply(q); setQ(""); } }} className="mt-5 flex flex-col gap-2 sm:flex-row">
          <input value={q} onChange={(e) => setQ(e.target.value)} placeholder={t(L("Describe your own scenario…", "صف السيناريو الخاص بك…"))} className="flex-1 rounded-full bg-card px-5 py-3 text-sm text-foreground outline-none focus:ring-2 focus:ring-gold" />
          <button disabled={busy} className={btn.gold}>{t(L("Apply scenario", "طبّق السيناريو"))}</button>
        </form>
        {busy && (
          <div className="mt-5 flex items-center gap-3 text-gold"><Sparkle className="h-4 w-4 animate-spin" />{t(L("Updating your Abu Dhabi journey...", "جارٍ تحديث رحلتك في أبوظبي..."))}</div>
        )}
      </div>
    </section>
  );
}

const OPP_ICON: Record<string, typeof Briefcase> = { career: Briefcase, education: GraduationCap, startup: Rocket, investment: Landmark, family: Heart, lifestyle: Palmtree, market: Globe2, setup: Building2, hub71: Rocket, talent: Users, office: Building2, relocation: Plane, growth: TrendingUp };

export function Opportunities({ journey }: { journey: Journey }) {
  const { t } = useLang();
  return (
    <section>
      <div className="eyebrow mb-3">{t(L("Relevant to you", "ذات صلة بك"))}</div>
      <h2 className="mb-6 text-2xl font-semibold md:text-3xl">{t(journey.type === "company" ? L("Company opportunity areas", "مجالات الفرص للشركة") : L("Opportunities that matter to you", "فرص تهمّك"))}</h2>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {journey.opportunities.map((o) => {
          const Icon = OPP_ICON[o.key] ?? LineChart;
          return (
            <div key={o.key} className="card-luxe p-5 transition hover:-translate-y-1">
              <div className="mb-4 flex items-center justify-between">
                <span className="grid h-10 w-10 place-items-center rounded-xl bg-turquoise-soft text-turquoise"><Icon className="h-5 w-5" /></span>
                <span className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground">{t(o.category)}</span>
              </div>
              <h3 className="font-semibold leading-snug">{t(o.title)}</h3>
              <p className="mt-2 text-sm text-muted-foreground"><span className="font-medium text-foreground">{t(L("Why this matters: ", "لماذا يهمّك: "))}</span>{t(o.why)}</p>
            </div>
          );
        })}
      </div>
    </section>
  );
}