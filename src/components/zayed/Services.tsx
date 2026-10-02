import { ExternalLink } from "lucide-react";
import { useLang, L } from "@/lib/i18n";
import { OFFICIAL_SOURCES, PRIVATE_SERVICES } from "@/lib/sources";
import { SourceBadge, btn } from "./ui";

export function OfficialServices({ ids }: { ids?: string[] }) {
  const { t } = useLang();
  const list = ids ? OFFICIAL_SOURCES.filter((s) => ids.includes(s.id)) : OFFICIAL_SOURCES;
  return (
    <section>
      <div className="eyebrow mb-3">{t(L("Connect", "تواصل"))}</div>
      <h2 className="mb-2 text-2xl font-semibold md:text-3xl">{t(L("Verified official services", "الخدمات الرسمية الموثّقة"))}</h2>
      <p className="mb-6 max-w-2xl text-sm text-muted-foreground">{t(L("Official transactions remain with TAMM and the appropriate authorities. Always confirm with the source.", "تبقى المعاملات الرسمية لدى منصة تم والجهات المختصة. تأكد دائماً من المصدر."))}</p>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3" data-testid="official-services">
        {list.map((s) => (
          <article key={s.id} className="card-luxe flex flex-col p-5">
            <div className="mb-3 flex items-center justify-between"><SourceBadge kind="verified" /></div>
            <h3 className="font-display text-lg font-semibold">{t(s.name)}</h3>
            <p className="mt-2 text-sm text-muted-foreground">{t(s.why)}</p>
            <p className="mt-3 rounded-xl bg-muted p-3 text-xs"><span className="font-bold">{t(L("Confirm: ", "للتأكيد: "))}</span>{t(s.confirm)}</p>
            <a href={s.url} target="_blank" rel="noreferrer" className={`${btn.ghost} mt-4 self-start`}>
              {t(L("Open official service", "فتح الخدمة الرسمية"))} <ExternalLink className="h-3.5 w-3.5" />
            </a>
          </article>
        ))}
      </div>
    </section>
  );
}

export function PrivateServices() {
  const { t } = useLang();
  return (
    <section>
      <div className="eyebrow mb-3">{t(L("Everyday life", "الحياة اليومية"))}</div>
      <h2 className="mb-6 text-2xl font-semibold md:text-3xl">{t(L("Services around your move", "خدمات حول انتقالك"))}</h2>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {PRIVATE_SERVICES.map((g) => (
          <div key={g.key} className="card-luxe p-5">
            <div className="mb-3 flex items-center justify-between"><h3 className="font-semibold">{t(g.title)}</h3><SourceBadge kind={g.kind} /></div>
            <div className="flex flex-wrap gap-1.5">
              {g.items.map((i) =>
                i.url ? (
                  <a key={i.name.en} href={i.url} target="_blank" rel="noreferrer" className="rounded-full border border-border px-2.5 py-1 text-xs hover:border-gold hover:bg-gold-soft">{t(i.name)} ↗</a>
                ) : (
                  <span key={i.name.en} className="rounded-full bg-muted px-2.5 py-1 text-xs">{t(i.name)}</span>
                ),
              )}
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}