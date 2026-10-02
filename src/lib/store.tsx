import { createContext, useContext, useEffect, useState, type ReactNode } from "react";
import type { Journey, Mode, Profile } from "./types";

type State = {
  mode: Mode;
  draft: string;
  profile: Profile | null;
  journey: Journey | null;
  history: string[];
};
type Ctx = State & {
  ready: boolean;
  setMode: (m: Mode) => void;
  setDraft: (d: string) => void;
  setProfile: (p: Profile | null) => void;
  setJourney: (j: Journey | null) => void;
  pushHistory: (h: string) => void;
  reset: () => void;
};
const initial: State = { mode: "person", draft: "", profile: null, journey: null, history: [] };
const AppCtx = createContext<Ctx | null>(null);
const KEY = "zayed.state.v1";

export function AppProvider({ children }: { children: ReactNode }) {
  const [s, setS] = useState<State>(initial);
  const [ready, setReady] = useState(false);
  useEffect(() => {
    try {
      const raw = localStorage.getItem(KEY);
      if (raw) setS({ ...initial, ...JSON.parse(raw) });
    } catch {
      /* ignore corrupt state */
    }
    setReady(true);
  }, []);
  useEffect(() => {
    if (ready) localStorage.setItem(KEY, JSON.stringify(s));
  }, [s, ready]);
  const patch = (p: Partial<State>) => setS((x) => ({ ...x, ...p }));
  return (
    <AppCtx.Provider
      value={{
        ...s,
        ready,
        setMode: (mode) => patch({ mode }),
        setDraft: (draft) => patch({ draft }),
        setProfile: (profile) => patch({ profile }),
        setJourney: (journey) => patch({ journey }),
        pushHistory: (h) => setS((x) => ({ ...x, history: [...x.history, h].slice(-8) })),
        reset: () => setS(initial),
      }}
    >
      {children}
    </AppCtx.Provider>
  );
}
export function useApp() {
  const c = useContext(AppCtx);
  if (!c) throw new Error("useApp outside AppProvider");
  return c;
}