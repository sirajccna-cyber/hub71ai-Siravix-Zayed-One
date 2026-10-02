import { createFileRoute, Link } from "@tanstack/react-router";
import { CheckCircle2, FileText, Home, GraduationCap, AlertTriangle, ShieldAlert, Building2 } from "lucide-react";
import { useLang, L } from "@/lib/i18n";
import { useApp } from "@/lib/store";
import { btn, Arrow, Container, SourceBadge } from "@/components/zayed/ui";
import { BusinessMap } from "@/components/zayed/Maps";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/company-command")({
  head: () => ({
    meta: [
      { title: "Company Move Command Center — Zayed One" },
      { name: "description", content: "Track every employee's Abu Dhabi relocation readiness, documents, housing and AI-identified blockers." },
      { property: "og:title", content: "Company Move Command Center — Zayed One" },
      { property: "og:description", content: "Enterprise relocation readiness for companies moving teams to Abu Dhabi." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Command,
});

function Command() {
  const { t } = useLang();
  const { journey } = useApp();
  const team = journey?.type === "company" && journey.team
    ? journey.team
    : { companyName: "Nova AI", totalRelocating: 20, ready: 8, documentation: 5, housing: 3, familySupport: 2, actionRequired: 2 };
  const total = team.totalRelocating;

  const metrics = [
    { k: "ready", v: team.ready, icon: CheckCircle2, label: L("Ready", "جاهز"), cls: "text-success", bar: "bg-success" },
    { k: "docs", v: team.documentation, icon: FileText, label: L("Documents", "المستندات"), cls: "text-turquoise", bar: "bg-turquoise" },
    { k: "housing", v: team.housing, icon: Home, label: L("Housing support", "دعم السكن"), cls: "text-gold", bar: "bg-gold" },
    { k: "family", v: team.familySupport, icon: GraduationCap, label: L("Family / school support", "دعم العائلة / المدرسة"), cls: "text-sand", bar: "bg-sand" },
    { k: "action", v: team.actionRequired, icon: AlertTriangle, label: L("Action required", "إجراء مطلوب"), cls: "text-destructive", bar: "bg-destructive" },
  ];

  const blockers = [
    { who: L("Employee 12", "الموظف 12"), what: L("Family of four — school planning required", "عائلة من أربعة أفراد — يلزم تخطيط مدرسي"), sev: "med", src: "ADEK" },
    { who: L("Employee 7", "الموظف 7"), what: L("Documentation incomplete — attested degree missing", "المستندات غير مكتملة — الشهادة المصدقة مفقودة"), sev: "high", src: "ICP" },
    { who: L("Founder", "المؤسس"), what: L("Company establishment step pending — licence before visas", "خطوة تأسيس الشركة معلّقة — الرخصة قبل التأشيرات"), sev: "high", src: "ADGM / ADDED" },
    ...(total > 12 ? [{ who: L("Housing cohort", "مجموعة السكن"), what: L(`${team.housing} employees need housing near the office`, `${team.housing} موظفين يحتاجون سكناً قرب المكتب`), sev: "med", src: "Commercial" }] : []),
  ];

  const roster = Array.from({ length: total }, (_, i) => {
    const s = i < team.ready ? "ready" : i < team.ready + team.documentation ? "docs" : i < team.ready + team.documentation + team.housing ? "housing" : i < total - team.actionRequired ? "family" : "action";
    return { id: i + 1, s };
  });
  const color: Record<string, string> = { ready: "bg-success", docs: "bg-turquoise", housing: "bg-gold", family: "bg-sand", action: "bg-destructive" };

  return (
    <div className="bg-hero">
      <Container className="space-y-10 py-10">
        <section className="relative overflow-hidden rounded-3xl bg-navy-gradient p-8 shadow-float md:p-12">
          <div className="absolute inset-0 geo-pattern opacity-30" />
          <div className="relative flex flex-col justify-between gap-6 md:flex-row md:items-end">
            <div>
              <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-[0.25em] text-gold"><Building2 className="h-4 w-4" />{t(L("Company Move Command Center", "مركز قيادة نقل الشركة"))}</div>
              <h1 className="mt-3 text-4xl font-semibold uppercase md:text-6xl">{team.companyName} — {t(L("Abu Dhabi Relocation", "الانتقال إلى أبوظبي"))}</h1>
            </div>
            <div className="text-end">
              <div className="text-xs uppercase tracking-widest opacity-70">{t(L("Employees relocating", "الموظفون المنتقلون"))}</div>
              <div className="font-display text-7xl text-gold-gradient" data-testid="total-relocating">{total}</div>
            </div>
          </div>
          <div className="relative mt-8 flex h-3 overflow-hidden rounded-full bg-card/10">
            {metrics.map((m) => <div key={m.k} className={m.bar} style={{ width: `${(m.v / Math.max(total, 1)) * 100}%` }} />)}
          </div>
        </section>

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
          {metrics.map((m) => (
            <div key={m.k} className="card-luxe p-5">
              <m.icon className={cn("h-6 w-6", m.cls)} />
              <div className="mt-4 font-display text-5xl font-semibold">{m.v}</div>
              <div className="mt-1 text-xs font-bold uppercase tracking-widest text-muted-foreground">{t(m.label)}</div>
            </div>
          ))}
        </div>

        <div className="grid gap-6 lg:grid-cols-[1.2fr_1fr]">
          <section className="card-luxe p-6 md:p-8">
            <div className="mb-5 flex items-center justify-between">
              <h2 className="text-2xl font-semibold">{t(L("AI-identified blockers", "العوائق التي حددها الذكاء الاصطناعي"))}</h2>
              <SourceBadge kind="estimate" />
            </div>
            <ul className="space-y-3">
              {blockers.map((b) => (
                <li key={b.who.en} className="flex items-start gap-4 rounded-2xl border border-border p-4">
                  <ShieldAlert className={cn("mt-0.5 h-5 w-5 shrink-0", b.sev === "high" ? "text-destructive" : "text-warning")} />
                  <div className="flex-1">
                    <div className="font-semibold">{t(b.who)}</div>
                    <div className="text-sm text-muted-foreground">{t(b.what)}</div>
                  </div>
                  <span className="rounded-full bg-muted px-2.5 py-1 text-[10px] font-bold uppercase">{b.src}</span>
                </li>
              ))}
            </ul>
          </section>
          <section className="card-luxe p-6 md:p-8">
            <h2 className="mb-5 text-2xl font-semibold">{t(L("Team readiness", "جاهزية الفريق"))}</h2>
            <div className="grid grid-cols-5 gap-2 sm:grid-cols-8 lg:grid-cols-5 xl:grid-cols-6">
              {roster.map((r) => (
                <div key={r.id} title={`#${r.id}`} className="flex aspect-square flex-col items-center justify-center rounded-xl bg-muted text-[10px] font-bold">
                  <span className={cn("mb-1 h-2.5 w-2.5 rounded-full", color[r.s])} />{r.id}
                </div>
              ))}
            </div>
            <Link to="/dashboard" className={cn(btn.primary, "mt-6")}>{t(L("Back to Our Abu Dhabi", "العودة إلى أبوظبي لشركتنا"))} <Arrow /></Link>
          </section>
        </div>

        <BusinessMap />
        <p className="text-center text-xs text-muted-foreground">{t(L("Demo indicators for presentation. Visa, licence and residency outcomes require official confirmation.", "مؤشرات تجريبية للعرض. تتطلب نتائج التأشيرات والتراخيص والإقامة تأكيداً رسمياً."))}</p>
      </Container>
    </div>
  );
}