import { useState, useRef, useEffect } from "react";
import { MessageCircle, Send, X, Mic } from "lucide-react";
import { useLang, L } from "@/lib/i18n";
import { useApp } from "@/lib/store";
import { askCopilot } from "@/lib/ai/zayedAI";
import { useSpeech } from "@/lib/useSpeech";
import type { LText } from "@/lib/types";
import { cn } from "@/lib/utils";

type Msg = { role: "user" | "ai"; text: LText | string };

export function AskZayed() {
  const { t, lang } = useLang();
  const { journey, mode } = useApp();
  const [open, setOpen] = useState(false);
  const [q, setQ] = useState("");
  const [busy, setBusy] = useState(false);
  const [msgs, setMsgs] = useState<Msg[]>([]);
  const end = useRef<HTMLDivElement>(null);
  const speech = useSpeech(lang, (x) => setQ(x));
  const isCompany = (journey?.type ?? mode) === "company";
  const prompts = isCompany
    ? [L("How should we establish in Abu Dhabi?", "كيف نؤسس شركتنا في أبوظبي؟"), L("How do we relocate 20 employees?", "كيف ننقل 20 موظفاً؟"), L("What if only the founders move first?", "ماذا لو انتقل المؤسسون أولاً؟"), L("Where should we locate our office?", "أين نضع مكتبنا؟")]
    : [L("What should I do next?", "ما الذي يجب أن أفعله الآن؟"), L("Where should my family live?", "أين يجب أن تسكن عائلتي؟"), L("What schools should I explore?", "ما المدارس التي يجب أن أستكشفها؟"), L("What if my spouse works?", "ماذا لو عمل زوجي/زوجتي؟")];

  useEffect(() => end.current?.scrollIntoView({ behavior: "smooth" }), [msgs, busy]);

  const send = async (text: string) => {
    if (!text.trim() || busy) return;
    setMsgs((m) => [...m, { role: "user", text }]);
    setQ("");
    setBusy(true);
    try {
      const a = await askCopilot(text, journey, mode);
      setMsgs((m) => [...m, { role: "ai", text: a }]);
    } catch {
      setMsgs((m) => [...m, { role: "ai", text: L("I couldn't answer that right now — please try again.", "تعذّرت الإجابة الآن — حاول مرة أخرى.") }]);
    } finally {
      setBusy(false);
    }
  };

  return (
    <>
      {open && (
        <div className="fixed inset-x-3 bottom-24 z-50 mx-auto flex max-h-[70vh] max-w-xl flex-col overflow-hidden rounded-3xl border border-border bg-card shadow-float fade-up">
          <div className="flex items-center justify-between bg-navy-gradient px-5 py-4">
            <div>
              <div className="font-display text-lg">{t(L("Ask Zayed One", "اسأل زايد ون"))}</div>
              <div className="text-xs opacity-70">{t(L("Demo intelligence mode · answers are indicative", "وضع الذكاء التجريبي · الإجابات استرشادية"))}</div>
            </div>
            <button onClick={() => setOpen(false)} aria-label="Close" className="rounded-full p-2 hover:bg-card/10"><X className="h-5 w-5" /></button>
          </div>
          <div className="flex-1 space-y-3 overflow-y-auto p-5">
            {msgs.length === 0 && (
              <div className="flex flex-wrap gap-2">
                {prompts.map((p) => (
                  <button key={p.en} onClick={() => send(t(p))} className="rounded-full border border-border bg-background px-3 py-1.5 text-sm hover:border-turquoise">{t(p)}</button>
                ))}
              </div>
            )}
            {msgs.map((m, i) => (
              <div key={i} className={cn("max-w-[85%] whitespace-pre-line rounded-2xl px-4 py-3 text-sm", m.role === "user" ? "ms-auto bg-navy-gradient" : "bg-muted text-foreground")}>
                {typeof m.text === "string" ? m.text : t(m.text)}
              </div>
            ))}
            {busy && <div className="h-1 w-32 rounded-full shimmer-line" />}
            <div ref={end} />
          </div>
          <form onSubmit={(e) => { e.preventDefault(); send(q); }} className="flex items-center gap-2 border-t border-border p-3">
            <input value={q} onChange={(e) => setQ(e.target.value)} placeholder={t(L("Ask anything about your move…", "اسأل أي شيء عن انتقالك…"))} className="flex-1 rounded-full bg-muted px-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-ring" />
            {speech.supported && (
              <button type="button" onClick={speech.toggle} className={cn("rounded-full p-2.5 text-muted-foreground hover:text-foreground", speech.listening && "pulse-ring text-turquoise")} aria-label="Voice"><Mic className="h-4 w-4" /></button>
            )}
            <button type="submit" className="rounded-full bg-gold p-2.5 text-navy" aria-label="Send"><Send className="h-4 w-4 rtl:-scale-x-100" /></button>
          </form>
        </div>
      )}
      <button
        onClick={() => setOpen((o) => !o)}
        className="fixed bottom-5 left-1/2 z-50 flex -translate-x-1/2 items-center gap-3 rounded-full bg-navy-gradient px-6 py-3.5 shadow-float transition hover:scale-[1.02]"
      >
        <span className="grid h-7 w-7 place-items-center rounded-full bg-gold text-navy"><MessageCircle className="h-4 w-4" /></span>
        <span className="text-sm font-semibold">{t(L("Ask Zayed One", "اسأل زايد ون"))}</span>
      </button>
    </>
  );
}