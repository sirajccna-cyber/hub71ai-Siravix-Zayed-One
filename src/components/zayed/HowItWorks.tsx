import { useEffect, useState } from "react";
import { X, Cpu, Network, BadgeCheck, ShieldCheck } from "lucide-react";
import { useServerFn } from "@tanstack/react-start";
import { useLang, L } from "@/lib/i18n";
import { SETTLEMENT_GRAPH } from "@/data/settlementGraph";
import { OFFICIAL_SOURCES } from "@/lib/sources";
import { aiStatus } from "@/lib/ai/ai.functions";
import { cn } from "@/lib/utils";

const EVT = "zayed:how-it-works";
export const openHowItWorks = () => window.dispatchEvent(new Event(EVT));

const FLOW = [
  L("Your story", "قصتك"),
  L("OpenAI structured profile", "ملف منظم عبر OpenAI"),
  L("Settlement Graph", "خريطة الاستقرار"),
  L("OpenAI journey orchestration", "تنسيق الرحلة عبر OpenAI"),
  L("Next 3 Actions", "الخطوات الثلاث التالية"),
  L("Verified official handoff", "التحويل إلى الجهة الرسمية"),
];

export function HowItWorksDrawer() {
  const { t } = useLang();
  const [open, setOpen] = useState(false);
  const [live, setLive] = useState<boolean | null>(null);
  const status = useServerFn(aiStatus);
  useEffect(() => {
    const h = () => setOpen(true);
    window.addEventListener(EVT, h);
    return () => window.removeEventListener(EVT, h);
  }, []);
  useEffect(() => {
    if (!open || live !== null) return;
    status().then((r) => setLive(r.configured)).catch(() => setLive(false));
    const k = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
    window.addEventListener("keydown", k);
    return () => window.removeEventListener("keydown", k);
  }, [open, live, status]);
  if (!open) return null;

  const pillars = [
    { icon: Cpu, title: L("OpenAI Journey Engine", "محرك الرحلة من OpenAI"), body: L("Structured Outputs turn your story into a validated profile, orchestrate exactly 3 next actions and recalculate What-If scenarios.", "تحوّل المخرجات المنظمة قصتك إلى ملف موثّق، وتنسّق 3 خطوات تالية، وتعيد حساب سيناريوهات «ماذا لو».") },
    { icon: Network, title: L("Zayed One Settlement Graph", "خريطة زايد ون للاستقرار"), body: L(`${SETTLEMENT_GRAPH.length} curated dependency records linking residency, housing, schools, licences, visas and teams.`, `${SETTLEMENT_GRAPH.length} سجلاً منسّقاً للتبعيات تربط الإقامة والسكن والمدارس والرخص والتأشيرات والفرق.`) },
    { icon: BadgeCheck, title: L("Verified official source layer", "طبقة المصادر الرسمية الموثّقة"), body: L(`${OFFICIAL_SOURCES.length} official authorities — every action hands off to the right service for execution.`, `${OFFICIAL_SOURCES.length} جهة رسمية — كل خطوة تُحوَّل إلى الخدمة المناسبة للتنفيذ.`) },
    { icon: ShieldCheck, title: L("Deterministic fallback", "محرك احتياطي ثابت"), body: L("If AI is unavailable, slow or returns invalid output, a deterministic engine keeps the journey working.", "إذا تعذّر الذكاء الاصطناعي أو تأخر أو أعاد مخرجات غير صالحة، يحافظ المحرك الثابت على عمل الرحلة.") },
  ];

  return (
    <div className="fixed inset-0 z-50 flex justify-end bg-navy/40 backdrop-blur-sm" onClick={() => setOpen(false)} role="dialog" aria-modal="true" aria-label={t(L("How Zayed One works", "كيف يعمل زايد ون"))}>
      <aside className="h-full w-full max-w-xl overflow-y-auto bg-background p-6 shadow-float md:p-8 fade-up" onClick={(e) => e.stopPropagation()} data-testid="how-it-works">
        <div className="flex items-start justify-between gap-4">
          <div>
            <div className="eyebrow mb-2">{t(L("For judges & partners", "للحكام والشركاء"))}</div>
            <h2 className="text-3xl font-semibold">{t(L("How Zayed One works", "كيف يعمل زايد ون"))}</h2>
          </div>
          <button onClick={() => setOpen(false)} className="rounded-full border border-border p-2" aria-label={t(L("Close", "إغلاق"))}><X className="h-4 w-4" /></button>
        </div>

        <div className="mt-4 text-xs">
          <span className={cn("inline-flex items-center gap-1.5 rounded-full border px-3 py-1 font-bold uppercase tracking-widest", live ? "border-turquoise/50 bg-turquoise-soft text-turquoise" : "border-border text-muted-foreground")}>
            <span className={cn("h-1.5 w-1.5 rounded-full", live ? "bg-turquoise" : "bg-sand")} />
            {live === null ? "…" : live ? t(L("OpenAI engine configured", "محرك OpenAI مُعدّ")) : t(L("Demo fallback active", "الوضع الاحتياطي مفعّل"))}
          </span>
        </div>

        <ol className="mt-6 space-y-2">
          {FLOW.map((f, i) => (
            <li key={f.en} className="flex items-center gap-3">
              <span className="grid h-7 w-7 shrink-0 place-items-center rounded-full bg-navy-gradient text-xs font-bold">{i + 1}</span>
              <span className={cn("flex-1 rounded-xl border px-3 py-2 text-sm font-semibold", i === 2 ? "border-gold bg-gold-soft text-navy" : "border-border bg-card")}>{t(f)}</span>
            </li>
          ))}
        </ol>

        <div className="mt-8 grid gap-3">
          {pillars.map((p) => (
            <div key={p.title.en} className="card-luxe flex gap-4 p-4">
              <p.icon className="mt-0.5 h-5 w-5 shrink-0 text-gold" />
              <div><div className="font-semibold">{t(p.title)}</div><p className="mt-1 text-sm text-muted-foreground">{t(p.body)}</p></div>
            </div>
          ))}
        </div>

        <div className="mt-8 rounded-2xl border border-border bg-card/70 p-5 text-sm">
          <div className="text-[11px] font-bold uppercase tracking-widest text-turquoise">{t(L("Trust & dataset disclosure", "الثقة والإفصاح عن البيانات"))}</div>
          <ul className="mt-3 space-y-2 text-muted-foreground">
            <li>• {t(L("Official facts stay linked to the authorities that own them.", "تبقى الحقائق الرسمية مرتبطة بالجهات المالكة لها."))}</li>
            <li>• {t(L("The Settlement Graph is curated prototype intelligence, not official regulation.", "خريطة الاستقرار معرفة نموذجية منسّقة، وليست تنظيماً رسمياً."))}</li>
            <li>• {t(L("Regulatory eligibility always requires official confirmation.", "الأهلية التنظيمية تتطلب دائماً تأكيداً رسمياً."))}</li>
            <li>• {t(L("Estimates are always labelled as estimates.", "التقديرات تُوسم دائماً بأنها تقديرات."))}</li>
            <li>• {t(L("Hackathon prototype — no government partnership or endorsement is claimed.", "نموذج أولي للهاكاثون — لا ندّعي أي شراكة أو اعتماد حكومي."))}</li>
          </ul>
        </div>
      </aside>
    </div>
  );
}