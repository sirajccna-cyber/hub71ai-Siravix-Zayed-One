import { Home, Briefcase, School, Hospital, ShoppingBasket, Trees, Bus, Landmark, Palette, Users, Building2, Rocket, Scale, Plane, GraduationCap, UserSearch, Coins, Laptop, MapPin } from "lucide-react";
import { useLang, L } from "@/lib/i18n";
import type { Journey, LText } from "@/lib/types";
import { SourceBadge } from "./ui";

const ICONS: Record<string, typeof Home> = { home: Home, work: Briefcase, school: School, health: Hospital, grocery: ShoppingBasket, park: Trees, transport: Bus, worship: Landmark, culture: Palette, community: Users };

type Node = { icon: typeof Home; name: LText; note: LText; minutes?: number | undefined };

function RadialMap({ center, nodes, title }: { center: Node; nodes: Node[]; title: LText }) {
  const { t } = useLang();
  const R = 40;
  return (
    <section className="card-luxe overflow-hidden p-6 md:p-10">
      <div className="mb-6 flex flex-wrap items-end justify-between gap-3">
        <div>
          <div className="eyebrow mb-2">{t(L("Stylised map", "خريطة توضيحية"))}</div>
          <h2 className="text-2xl font-semibold md:text-3xl">{t(title)}</h2>
        </div>
        <div className="flex items-center gap-2 text-xs text-muted-foreground"><SourceBadge kind="estimate" />{t(L("Indicative travel times", "أوقات تنقل استرشادية"))}</div>
      </div>
      <div className="relative mx-auto aspect-square w-full max-w-[640px] rounded-full bg-hero">
        <svg viewBox="0 0 100 100" className="absolute inset-0 h-full w-full" aria-hidden>
          {[15, 28, 42].map((r) => <circle key={r} cx="50" cy="50" r={r} fill="none" stroke="var(--gold)" strokeOpacity="0.25" strokeDasharray="0.8 1.2" strokeWidth="0.3" />)}
          {nodes.map((_, i) => {
            const a = (i / nodes.length) * Math.PI * 2 - Math.PI / 2;
            return <line key={i} x1="50" y1="50" x2={50 + Math.cos(a) * R} y2={50 + Math.sin(a) * R} stroke="var(--turquoise)" strokeOpacity="0.35" strokeWidth="0.3" />;
          })}
        </svg>
        <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 text-center">
          <div className="mx-auto grid h-16 w-16 place-items-center rounded-full bg-navy-gradient shadow-float pulse-ring"><center.icon className="h-7 w-7 text-gold" /></div>
          <div className="mt-2 max-w-[9rem] text-xs font-bold">{t(center.name)}</div>
        </div>
        {nodes.map((n, i) => {
          const a = (i / nodes.length) * Math.PI * 2 - Math.PI / 2;
          return (
            <div key={i} className="absolute w-24 -translate-x-1/2 -translate-y-1/2 text-center sm:w-28" style={{ left: `${50 + Math.cos(a) * R}%`, top: `${50 + Math.sin(a) * R}%` }}>
              <div className="mx-auto grid h-10 w-10 place-items-center rounded-full border border-border bg-card shadow-luxe sm:h-11 sm:w-11"><n.icon className="h-4 w-4 text-turquoise" /></div>
              <div className="mt-1 text-[10px] font-semibold leading-tight sm:text-[11px]">{t(n.name)}</div>
              {n.minutes !== undefined && <div className="text-[10px] font-bold text-gold">{n.minutes} {t(L("min", "د"))}</div>}
            </div>
          );
        })}
      </div>
    </section>
  );
}

export function LifeMap({ journey }: { journey: Journey }) {
  const [home, ...rest] = journey.mapPlaces;
  if (!home) return null;
  return (
    <RadialMap
      title={L("My Abu Dhabi Map", "خريطتي في أبوظبي")}
      center={{ icon: Home, name: home.name, note: home.note }}
      nodes={rest.map((p) => ({ icon: ICONS[p.type] ?? MapPin, name: p.name, note: p.note, minutes: p.minutes }))}
    />
  );
}

export function BusinessMap() {
  const nodes: Node[] = [
    { icon: Rocket, name: L("Hub71", "هب71"), note: L("", ""), minutes: 3 },
    { icon: Scale, name: L("ADGM · Al Maryah", "سوق أبوظبي العالمي"), note: L("", ""), minutes: 2 },
    { icon: Plane, name: L("Zayed Intl. Airport", "مطار زايد الدولي"), note: L("", ""), minutes: 30 },
    { icon: Building2, name: L("Masdar City", "مدينة مصدر"), note: L("", ""), minutes: 25 },
    { icon: GraduationCap, name: L("Khalifa Univ. · MBZUAI", "جامعة خليفة · MBZUAI"), note: L("", ""), minutes: 22 },
    { icon: UserSearch, name: L("Talent pools", "مصادر المواهب"), note: L("", "") },
    { icon: Home, name: L("Al Reem · Saadiyat homes", "سكن الريم · السعديات"), note: L("", ""), minutes: 10 },
    { icon: Coins, name: L("Investors", "المستثمرون"), note: L("", "") },
    { icon: Laptop, name: L("Coworking", "مساحات العمل المشتركة"), note: L("", ""), minutes: 5 },
    { icon: Briefcase, name: L("Business districts", "مناطق الأعمال"), note: L("", "") },
  ];
  return <RadialMap title={L("Our Abu Dhabi Business Map", "خريطة أعمالنا في أبوظبي")} center={{ icon: Building2, name: L("Our Office", "مكتبنا"), note: L("", "") }} nodes={nodes} />;
}