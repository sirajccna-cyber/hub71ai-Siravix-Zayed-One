import { createContext, useContext, useEffect, useState, type ReactNode } from "react";
import { useNavigate } from "@tanstack/react-router";
import type { User } from "@supabase/supabase-js";
import { supabase } from "@/integrations/supabase/client";

type AuthCtx = {
  user: User | null;
  loading: boolean;
  demo: boolean;
  setDemo: (v: boolean) => void;
  signOut: () => Promise<void>;
  displayName: string;
};
const Ctx = createContext<AuthCtx | null>(null);
const DEMO_KEY = "zayed.demo";
const POST_AUTH_KEY = "zayed.postAuth";

/** Accept only same-origin relative paths. */
export function safePath(p: unknown): string {
  if (typeof p !== "string" || !p.startsWith("/") || p.startsWith("//") || p.startsWith("/login") || p.startsWith("/signup")) return "/dashboard";
  return p;
}
export function rememberPostAuth(path: string) {
  try { sessionStorage.setItem(POST_AUTH_KEY, safePath(path)); } catch { /* ignore */ }
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [demo, setDemoState] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    setDemoState(localStorage.getItem(DEMO_KEY) === "1");
    let alive = true;
    const { data } = supabase.auth.onAuthStateChange((event, session) => {
      if (!alive) return;
      setUser(session?.user ?? null);
      if (event === "SIGNED_IN" && session) {
        localStorage.removeItem(DEMO_KEY);
        setDemoState(false);
        let target: string | null = null;
        try { target = sessionStorage.getItem(POST_AUTH_KEY); sessionStorage.removeItem(POST_AUTH_KEY); } catch { /* ignore */ }
        if (target) navigate({ to: safePath(target) });
      }
    });
    supabase.auth
      .getSession()
      .then(({ data }) => alive && setUser(data.session?.user ?? null))
      .catch(() => {})
      .finally(() => alive && setLoading(false));
    return () => { alive = false; data.subscription.unsubscribe(); };
  }, [navigate]);

  const setDemo = (v: boolean) => {
    setDemoState(v);
    if (v) localStorage.setItem(DEMO_KEY, "1"); else localStorage.removeItem(DEMO_KEY);
  };
  const signOut = async () => {
    try { await supabase.auth.signOut(); } catch { /* never block */ }
    setUser(null);
    setDemo(false);
    navigate({ to: "/", replace: true });
  };
  const meta = (user?.user_metadata ?? {}) as { full_name?: string; name?: string };
  const displayName = meta.full_name || meta.name || user?.email || "";

  return <Ctx.Provider value={{ user, loading, demo, setDemo, signOut, displayName }}>{children}</Ctx.Provider>;
}

export function useAuth() {
  const c = useContext(Ctx);
  if (!c) throw new Error("useAuth outside AuthProvider");
  return c;
}