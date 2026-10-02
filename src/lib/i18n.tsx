import { createContext, useContext, useEffect, useState, type ReactNode } from "react";
import type { Lang, LText } from "./types";

type Ctx = { lang: Lang; setLang: (l: Lang) => void; t: (x: LText) => string; isAr: boolean };
const LangCtx = createContext<Ctx | null>(null);

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [lang, setLangState] = useState<Lang>("en");

  useEffect(() => {
    const saved = localStorage.getItem("zayed.lang");
    if (saved === "ar" || saved === "en") setLangState(saved);
  }, []);

  useEffect(() => {
    document.documentElement.lang = lang;
    document.documentElement.dir = lang === "ar" ? "rtl" : "ltr";
  }, [lang]);

  const setLang = (l: Lang) => {
    setLangState(l);
    localStorage.setItem("zayed.lang", l);
  };

  return (
    <LangCtx.Provider value={{ lang, setLang, t: (x) => x[lang], isAr: lang === "ar" }}>
      {children}
    </LangCtx.Provider>
  );
}

export function useLang() {
  const c = useContext(LangCtx);
  if (!c) throw new Error("useLang outside LanguageProvider");
  return c;
}

export const L = (en: string, ar: string): LText => ({ en, ar });