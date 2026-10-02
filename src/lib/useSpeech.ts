import { useEffect, useRef, useState } from "react";

/* eslint-disable @typescript-eslint/no-explicit-any */
export function useSpeech(lang: "en" | "ar", onText: (t: string) => void) {
  const [supported, setSupported] = useState(false);
  const [listening, setListening] = useState(false);
  const rec = useRef<any>(null);
  useEffect(() => {
    const SR = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    setSupported(!!SR);
  }, []);
  const toggle = () => {
    const SR = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SR) return;
    if (listening) {
      rec.current?.stop();
      return;
    }
    try {
      const r = new SR();
      r.lang = lang === "ar" ? "ar-AE" : "en-US";
      r.interimResults = false;
      r.onresult = (e: any) => onText(Array.from(e.results).map((x: any) => x[0].transcript).join(" "));
      r.onend = () => setListening(false);
      r.onerror = () => setListening(false);
      rec.current = r;
      r.start();
      setListening(true);
    } catch {
      setListening(false);
    }
  };
  return { supported, listening, toggle };
}