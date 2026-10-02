import { Link } from "@tanstack/react-router";
import type { ComponentType } from "react";
import { LogOut, Instagram, Facebook, Youtube } from "lucide-react";
import { useLang, L } from "@/lib/i18n";
import { useAuth } from "@/lib/auth";
import { btn, Arrow } from "./ui";
import { cn } from "@/lib/utils";
import logoAsset from "@/assets/zayed-one-logo.png.asset.json";
import { openHowItWorks } from "./HowItWorks";

const NAV = [
  { id: "move", label: L("Move", "انتقل") },
  { id: "live", label: L("Live", "عِش") },
  { id: "work", label: L("Work", "اعمل") },
  { id: "build", label: L("Build", "ابنِ") },
  { id: "connect", label: L("Connect", "تواصل") },
];

const PROD_URL = "https://zayed-one.lovable.app/";

/** X (formerly Twitter) mark — not in lucide, drawn inline. */
const XIcon = ({ className }: { className?: string }) => (
  <svg viewBox="0 0 24 24" fill="currentColor" className={className} aria-hidden="true">
    <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231 5.451-6.231zm-1.161 17.52h1.833L7.084 4.126H5.117l11.966 15.644z" />
  </svg>
);

type SocialLink = { id: string; aria: string; href: string; Icon: ComponentType<{ className?: string }> };

/**
 * Social links config — update hrefs here as real accounts go live.
 * Instagram is live; Facebook/X/YouTube temporarily point to the Zayed One homepage.
 */
const SOCIAL_LINKS: SocialLink[] = [
  { id: "instagram", aria: "Instagram", href: "https://www.instagram.com/zayed.one/?hl=en", Icon: Instagram },
  { id: "facebook", aria: "Facebook", href: PROD_URL, Icon: Facebook },
  { id: "x", aria: "X", href: PROD_URL, Icon: XIcon },
  { id: "youtube", aria: "YouTube", href: PROD_URL, Icon: Youtube },
];

export function Logo() {
  const { t } = useLang();
  return (
    <Link to="/" className="flex min-w-0 items-center gap-3" aria-label={t(L("Zayed One home", "الصفحة الرئيسية لزايد ون"))}>
      <img src={logoAsset.url} alt="" className="h-12 w-12 shrink-0 rounded-lg object-cover shadow-luxe sm:h-14 sm:w-14" />
      <span className="leading-tight">
        <span className="block font-display text-lg font-semibold">{t(L("Zayed One", "زايد ون"))}</span>
        <span className="hidden text-[11px] text-muted-foreground sm:block">{t(L("Your Intelligent Gateway to Abu Dhabi.", "بوابتك الذكية إلى أبوظبي"))}</span>
      </span>
    </Link>
  );
}

export function LangToggle() {
  const { lang, setLang } = useLang();
  return (
    <div className="flex items-center rounded-full border border-border bg-card p-1 text-xs font-semibold" role="group" aria-label="Language">
      {(["en", "ar"] as const).map((l) => (
        <button
          key={l}
          onClick={() => setLang(l)}
          className={cn("rounded-full px-3 py-1.5 transition", lang === l ? "bg-navy-gradient" : "text-muted-foreground hover:text-foreground")}
          aria-pressed={lang === l}
        >
          {l === "en" ? "EN" : "العربية"}
        </button>
      ))}
    </div>
  );
}

function AuthControls() {
  const { t } = useLang();
  const { user, demo, loading, signOut, displayName } = useAuth();
  if (loading) return <div className="h-9 w-20" aria-hidden />;
  if (user) {
    const initials = displayName.split(/[\s@.]+/).filter(Boolean).slice(0, 2).map((s) => s[0]!.toUpperCase()).join("") || "U";
    return (
      <div className="flex items-center gap-2">
        <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-navy-gradient text-xs font-semibold" aria-hidden>{initials}</span>
        <span className="hidden max-w-[10rem] truncate text-sm font-medium md:block" title={user.email ?? ""}>{displayName}</span>
        <button onClick={signOut} className={cn(btn.ghost, "px-3 py-2")} aria-label={t(L("Log out", "تسجيل الخروج"))}>
          <LogOut className="h-4 w-4 rtl:rotate-180" /><span className="hidden sm:inline">{t(L("Log Out", "تسجيل الخروج"))}</span>
        </button>
      </div>
    );
  }
  return (
    <div className="flex items-center gap-2">
      {demo && <span className="rounded-full bg-gold-soft px-2.5 py-1 text-[11px] font-semibold uppercase tracking-wider text-navy">{t(L("Demo", "تجريبي"))}</span>}
      <Link to="/login" className="rounded-full px-3 py-2 text-sm font-semibold text-foreground hover:bg-gold-soft">{t(L("Log In", "دخول"))}</Link>
      <Link to="/signup" className={cn(btn.ghost, "hidden px-4 py-2 sm:inline-flex")}>{t(L("Sign Up", "إنشاء حساب"))}</Link>
    </div>
  );
}

export function Header() {
  const { t } = useLang();
  return (
    <header className="sticky top-0 z-40 border-b border-border/70 bg-background/80 backdrop-blur-xl">
      <div className="mx-auto flex h-18 max-w-7xl items-center justify-between gap-4 px-5 py-3 md:px-8">
        <Logo />
        <nav className="hidden items-center gap-1 lg:flex">
          {NAV.map((n) => n.id === "connect" ? (
            <Link key={n.id} to="/connect" className="rounded-full px-4 py-2 text-sm font-medium text-muted-foreground transition hover:bg-gold-soft hover:text-foreground">
              {t(n.label)}
            </Link>
          ) : (
            <Link key={n.id} to="/" hash={n.id} className="rounded-full px-4 py-2 text-sm font-medium text-muted-foreground transition hover:bg-gold-soft hover:text-foreground">
              {t(n.label)}
            </Link>
          ))}
          <Link to="/company-command" className="rounded-full px-4 py-2 text-sm font-medium text-muted-foreground transition hover:bg-gold-soft hover:text-foreground">
            {t(L("Command Center", "مركز القيادة"))}
          </Link>
        </nav>
        <div className="flex items-center gap-2">
          <LangToggle />
          <AuthControls />
          <Link to="/start" className={cn(btn.primary, "hidden px-5 py-2.5 xl:inline-flex")}>
            {t(L("Start Journey", "ابدأ الرحلة"))} <Arrow />
          </Link>
        </div>
      </div>
    </header>
  );
}

export function Footer() {
  const { t } = useLang();
  return (
    <footer className="mt-24 border-t border-border bg-navy-gradient pb-32 pt-14">
      <div className="mx-auto max-w-7xl px-5 md:px-8">
        <div className="flex flex-col justify-between gap-8 md:flex-row md:items-end">
          <div className="flex items-center gap-4">
            <img src={logoAsset.url} alt="" className="h-24 w-24 shrink-0 rounded-lg object-cover" />
            <div>
              <div className="font-display text-3xl text-gold-gradient">{t(L("Zayed One", "زايد ون"))}</div>
              <p className="mt-2 opacity-80">{t(L("Your Intelligent Gateway to Abu Dhabi.", "بوابتك الذكية إلى أبوظبي"))}</p>
              <p className="mt-1 text-sm opacity-60">{t(L("Discover. Decide. Move. Settle. Grow.", "اكتشف. قرّر. انتقل. استقر. انمُ."))}</p>
            </div>
          </div>
          <div className="max-w-md text-sm">
            <button onClick={openHowItWorks} className="mb-4 rounded-full border border-gold/50 px-4 py-1.5 text-xs font-semibold text-gold hover:bg-gold/10">{t(L("How Zayed One works", "كيف يعمل زايد ون"))}</button>
            <div className="social-row">
              <p className="mb-2 text-[11px] font-bold uppercase tracking-widest opacity-70">{t(L("Follow Zayed One", "تابع زايد ون"))}</p>
              <div className="flex items-center gap-2.5">
                {SOCIAL_LINKS.map((s) => (
                  <a
                    key={s.id}
                    href={s.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label={s.aria}
                    className="flex h-10 w-10 items-center justify-center rounded-full border border-white/20 transition hover:-translate-y-0.5 hover:border-gold hover:bg-gold hover:text-navy focus-visible:outline focus-visible:outline-2 focus-visible:outline-gold"
                  >
                    <s.Icon className="h-5 w-5" />
                  </a>
                ))}
              </div>
            </div>
            <p className="mt-5 opacity-70">{t(L("Hackathon prototype — not an official Abu Dhabi Government service.", "نموذج أولي للهاكاثون — ليس خدمة رسمية لحكومة أبوظبي."))}</p>
          </div>
        </div>
        <div className="mt-10 border-t border-white/10 pt-5 text-center text-[12px] tracking-wide opacity-85">
          {t(L("Powered By ", "مدعوم من "))}<span className="font-semibold text-gold">Siravix Technologies FZE</span>
        </div>
      </div>
    </footer>
  );
}