import { ArrowRight, BadgeCheck, Store, Users, Gauge } from "lucide-react";
import type { ReactNode } from "react";
import { cn } from "@/lib/utils";
import { useLang, L } from "@/lib/i18n";

export const btn = {
  primary:
    "inline-flex items-center justify-center gap-2 rounded-full bg-navy-gradient px-6 py-3 text-sm font-semibold shadow-float transition hover:-translate-y-0.5 hover:brightness-110 disabled:opacity-50",
  gold:
    "inline-flex items-center justify-center gap-2 rounded-full bg-gold px-6 py-3 text-sm font-semibold text-navy shadow-luxe transition hover:-translate-y-0.5 hover:brightness-105 disabled:opacity-50",
  ghost:
    "inline-flex items-center justify-center gap-2 rounded-full border border-border bg-card px-5 py-2.5 text-sm font-semibold text-foreground transition hover:border-gold hover:bg-gold-soft",
  chip:
    "inline-flex items-center gap-2 rounded-full border border-border bg-card px-4 py-2 text-sm text-foreground transition hover:border-turquoise hover:bg-turquoise-soft",
};

export const Arrow = ({ className }: { className?: string }) => <ArrowRight className={cn("h-4 w-4 rtl:rotate-180", className)} />;

export function Eyebrow({ children }: { children: ReactNode }) {
  return <div className="eyebrow mb-3">{children}</div>;
}

export function SectionTitle({ eyebrow, title, sub }: { eyebrow?: string; title: string; sub?: string }) {
  return (
    <div className="mb-8 max-w-2xl">
      {eyebrow && <Eyebrow>{eyebrow}</Eyebrow>}
      <h2 className="text-3xl font-semibold md:text-4xl">{title}</h2>
      {sub && <p className="mt-3 text-muted-foreground">{sub}</p>}
    </div>
  );
}

export type SourceKind = "verified" | "estimate" | "commercial" | "community";
const KIND = {
  verified: { cls: "bg-turquoise-soft text-turquoise", icon: BadgeCheck, label: L("Verified", "موثّق") },
  estimate: { cls: "bg-gold-soft text-navy", icon: Gauge, label: L("Estimate", "تقدير") },
  commercial: { cls: "bg-secondary text-navy", icon: Store, label: L("Commercial", "تجاري") },
  community: { cls: "bg-sand/40 text-navy", icon: Users, label: L("Community", "مجتمعي") },
};
export function SourceBadge({ kind }: { kind: SourceKind }) {
  const { t } = useLang();
  const k = KIND[kind];
  const Icon = k.icon;
  return (
    <span className={cn("inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider", k.cls)}>
      <Icon className="h-3 w-3" /> {t(k.label)}
    </span>
  );
}

export function Container({ children, className }: { children: ReactNode; className?: string }) {
  return <div className={cn("mx-auto w-full max-w-7xl px-5 md:px-8", className)}>{children}</div>;
}

/** LIVE OPENAI vs DEMO FALLBACK indicator. Only shows live when OpenAI actually powered the result. */
export function EngineBadge({ engine, className }: { engine?: "openai" | "fallback" | undefined; className?: string }) {
  const { t } = useLang();
  const live = engine === "openai";
  return (
    <span data-testid="engine-badge" data-engine={live ? "openai" : "fallback"} className={cn("inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-[10px] font-bold uppercase tracking-widest", live ? "border-turquoise/50 bg-turquoise-soft text-turquoise" : "border-border bg-card text-muted-foreground", className)}>
      <span className={cn("h-1.5 w-1.5 rounded-full", live ? "bg-turquoise" : "bg-sand")} />
      {live ? t(L("Live OpenAI · Journey generated with OpenAI", "OpenAI مباشر · رحلة مولّدة بواسطة OpenAI")) : t(L("Demo fallback", "الوضع التجريبي الاحتياطي"))}
    </span>
  );
}

export function GraphBadge({ className }: { className?: string }) {
  const { t } = useLang();
  return (
    <div className={cn("inline-flex flex-col rounded-2xl border border-gold/40 bg-card/70 px-4 py-2", className)} title={t(L("Curated Abu Dhabi relocation dependencies connecting official services, life needs and company moves.", "تبعيات انتقال منسّقة في أبوظبي تربط الخدمات الرسمية واحتياجات الحياة وانتقال الشركات."))}>
      <span className="text-[10px] font-bold uppercase tracking-widest text-foreground">◆ {t(L("Powered by the Zayed One Settlement Graph", "مدعوم بخريطة زايد ون للاستقرار"))}</span>
      <span className="text-[11px] text-muted-foreground">{t(L("Curated Abu Dhabi relocation dependencies connecting official services, life needs and company moves.", "تبعيات انتقال منسّقة في أبوظبي تربط الخدمات الرسمية واحتياجات الحياة وانتقال الشركات."))}</span>
    </div>
  );
}