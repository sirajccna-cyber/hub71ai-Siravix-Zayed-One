import { Link, useLocation } from "@tanstack/react-router";
import { useEffect } from "react";
import { ChevronRight, ExternalLink, Compass } from "lucide-react";
import { useLang, L } from "@/lib/i18n";
import { useApp } from "@/lib/store";
import { getSource, PRIVATE_SERVICES } from "@/lib/sources";
import { getPillar, PILLARS, type PillarId, type PillarSection } from "@/data/pillars";
import { btn, Arrow, Container, SourceBadge } from "./ui";
import { cn } from "@/lib/utils";

export function PillarPage({ id }: { id: PillarId }) {
  const { t } = useLang();
  const app = useApp();
  const p = getPillar(id);
  const hash = useLocation({ select: (l) => l.hash });

  useEffect(() => {
    if (!hash) return;
    const el = document.getElementById(hash);
    if (el) requestAnimationFrame(() => el.scrollIntoView({ behavior: "smooth", block: "start" }));
  }, [hash, id]);

  const Icon = p.icon;
  return (
    <div className="pb-24">
      <section className="bg-hero">
        <Container className="pt-10 pb-12">
          <nav aria-label="Breadcrumb" className="flex items-center gap-1.5 text-xs text-muted-foreground">
            <Link to="/" className="hover:text-foreground">{t(L("Home", "الرئيسية"))}</Link>
            <ChevronRight className="h-3 w-3 rtl:rotate-180" />
            <span>{t(L("Explore Abu Dhabi", "استكشف أبوظبي"))}</span>
            <ChevronRight className="h-3 w-3 rtl:rotate-180" />
            <span className="font-semibold text-foreground">{t(p.title)}</span>
          </nav>
          <div className="mt-6 flex items-center gap-4">
            <span className="grid h-14 w-14 place-items-center rounded-2xl bg-gold-soft"><Icon className="h-7 w-7 text-gold" /></span>
            <h1 className="text-4xl font-semibold uppercase tracking-wider md:text-5xl">{t(p.title)}</h1>
          </div>
          <p className="mt-4 max-w-2xl text-lg text-muted-foreground">{t(p.value)}</p>
          <p className="mt-2 max-w-2xl text-sm text-muted-foreground">{t(L("Zayed One helps you understand and organize. Official transactions remain with TAMM and the relevant authorities.", "يساعدك زايد ون على الفهم والتنظيم. تبقى المعاملات الرسمية لدى منصة تم والجهات المختصة."))}</p>
          <div className="mt-6 flex flex-wrap gap-2">
            {PILLARS.map((x) => (
              <Link key={x.id} to={`/${x.id}`} className={cn("rounded-full border px-4 py-1.5 text-xs font-semibold uppercase tracking-wider transition focus-visible:outline-2 focus-visible:outline-gold", x.id === id ? "border-transparent bg-navy-gradient" : "border-border bg-card hover:border-gold")}>{t(x.title)}</Link>
            ))}
          </div>
        </Container>
      </section>

      <Container className="mt-10 grid grid-cols-1 gap-10 lg:grid-cols-[220px_1fr]">
        <aside className="min-w-0 lg:sticky lg:top-28 lg:self-start">
          <div className="eyebrow mb-3">{t(L("What are you trying to do?", "ماذا تريد أن تفعل؟"))}</div>
          <ul className="flex gap-2 overflow-x-auto pb-2 lg:flex-col lg:overflow-visible">
            {p.sections.map((s) => (
              <li key={s.id} className="shrink-0">
                <Link to={`/${id}`} hash={s.id} className={cn("block rounded-xl px-3 py-2 text-sm transition hover:bg-gold-soft focus-visible:outline-2 focus-visible:outline-gold", hash === s.id ? "bg-gold-soft font-semibold" : "text-muted-foreground")}>{t(s.title)}</Link>
              </li>
            ))}
          </ul>
        </aside>
        <div className="min-w-0 space-y-8">
          {p.sections.map((s) => <Section key={s.id} s={s} />)}
          <div className="card-luxe flex flex-col items-start gap-4 p-6 md:flex-row md:items-center md:justify-between">
            <div>
              <h2 className="font-display text-2xl font-semibold">{t(L("Turn this into your personal journey.", "حوّل هذا إلى رحلتك الشخصية."))}</h2>
              <p className="mt-1 text-sm text-muted-foreground">{t(L("Tell Zayed One your story and get your Next 3 Actions.", "أخبر زايد ون بقصتك واحصل على خطواتك الثلاث التالية."))}</p>
            </div>
            <div className="flex flex-wrap gap-2">
              <Link to="/start" onClick={() => app.setMode("person")} className={btn.primary}>{t(L("Plan My Journey", "خطط لرحلتي"))} <Arrow /></Link>
              <Link to="/start" onClick={() => app.setMode("company")} className={btn.ghost}>{t(L("Plan Our Journey", "خطط لرحلتنا"))} <Arrow /></Link>
            </div>
          </div>
        </div>
      </Container>
    </div>
  );
}

function Section({ s }: { s: PillarSection }) {
  const { t } = useLang();
  const groups = PRIVATE_SERVICES.filter((g) => s.privateGroups?.includes(g.key));
  const officials = s.official.map(getSource).filter((x): x is NonNullable<typeof x> => !!x);
  return (
    <section id={s.id} className="card-luxe scroll-mt-28 p-6 md:p-8" data-testid="pillar-section">
      <h2 className="font-display text-2xl font-semibold">{t(s.title)}</h2>
      <p className="mt-2 max-w-3xl text-sm text-muted-foreground">{t(s.guidance)}</p>
      {s.estimate && <p className="mt-3 flex flex-wrap items-center gap-2 text-xs"><SourceBadge kind="estimate" /> {t(s.estimate)}</p>}
      <div className="mt-5 grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
        {officials.map((o) => (
          <a key={o.id} href={o.url} target="_blank" rel="noopener noreferrer" className="group flex flex-col rounded-2xl border border-border bg-card p-4 transition hover:border-gold focus-visible:outline-2 focus-visible:outline-gold">
            <SourceBadge kind="verified" />
            <span className="mt-2 font-semibold">{t(o.name)}</span>
            <span className="mt-1 text-xs text-muted-foreground">{t(o.why)}</span>
            <span className="mt-3 inline-flex items-center gap-1 text-xs font-semibold text-turquoise">{t(L("Open official service", "فتح الخدمة الرسمية"))} <ExternalLink className="h-3 w-3" /></span>
          </a>
        ))}
        {groups.map((g) => (
          <div key={g.key} className="rounded-2xl border border-border bg-muted/40 p-4">
            <SourceBadge kind={g.kind} />
            <span className="mt-2 block font-semibold">{t(g.title)}</span>
            <ul className="mt-2 flex flex-wrap gap-1.5">
              {g.items.slice(0, 4).map((i) => i.url
                ? <li key={i.name.en}><a href={i.url} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1 rounded-full border border-border bg-card px-2.5 py-1 text-xs hover:border-gold">{t(i.name)} <ExternalLink className="h-3 w-3" /></a></li>
                : <li key={i.name.en} className="rounded-full bg-card px-2.5 py-1 text-xs text-muted-foreground">{t(i.name)}</li>)}
            </ul>
          </div>
        ))}
        {s.community && (
          <div className="rounded-2xl border border-border bg-muted/40 p-4">
            <SourceBadge kind="community" />
            <ul className="mt-2 space-y-1 text-xs text-muted-foreground">{s.community.map((c) => <li key={c.en} className="flex items-center gap-1.5"><Compass className="h-3 w-3" />{t(c)}</li>)}</ul>
          </div>
        )}
      </div>
      <p className="mt-4 rounded-xl bg-muted p-3 text-xs"><span className="font-bold">{t(L("What to confirm: ", "ما يجب تأكيده: "))}</span>{t(s.confirm)}</p>
    </section>
  );
}