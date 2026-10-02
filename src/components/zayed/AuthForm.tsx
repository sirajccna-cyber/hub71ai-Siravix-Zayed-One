import { useEffect, useState, type FormEvent } from "react";
import { Link, useNavigate } from "@tanstack/react-router";
import { Loader2, Sparkles } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { lovable } from "@/integrations/lovable";
import { useLang, L } from "@/lib/i18n";
import { useAuth, rememberPostAuth, safePath } from "@/lib/auth";
import { btn, Arrow } from "./ui";
import { cn } from "@/lib/utils";
import logoAsset from "@/assets/zayed-one-logo.png.asset.json";

type Mode = "login" | "signup";
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function GoogleIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-4 w-4" aria-hidden>
      <path fill="#4285F4" d="M22.5 12.3c0-.8-.1-1.6-.2-2.3H12v4.4h5.9a5 5 0 0 1-2.2 3.3v2.7h3.6c2-1.9 3.2-4.7 3.2-8.1z" />
      <path fill="#34A853" d="M12 23c3 0 5.5-1 7.3-2.7l-3.6-2.7c-1 .7-2.2 1.1-3.7 1.1-2.9 0-5.3-1.9-6.2-4.5H2.1v2.8A11 11 0 0 0 12 23z" />
      <path fill="#FBBC05" d="M5.8 14.2a6.6 6.6 0 0 1 0-4.3V7.1H2.1a11 11 0 0 0 0 9.9l3.7-2.8z" />
      <path fill="#EA4335" d="M12 5.4c1.6 0 3.1.6 4.2 1.7l3.2-3.2A11 11 0 0 0 2.1 7.1l3.7 2.8C6.7 7.3 9.1 5.4 12 5.4z" />
    </svg>
  );
}

const T = {
  loginTitle: L("Welcome back", "مرحبًا بعودتك"),
  loginSub: L("Log in to continue your Abu Dhabi journey.", "سجّل الدخول لمتابعة رحلتك في أبوظبي."),
  signupTitle: L("Create your account", "أنشئ حسابك"),
  signupSub: L("Save your journey and pick up where you left off.", "احفظ رحلتك وتابع من حيث توقفت."),
  name: L("Full name", "الاسم الكامل"),
  email: L("Email", "البريد الإلكتروني"),
  password: L("Password", "كلمة المرور"),
  confirm: L("Confirm password", "تأكيد كلمة المرور"),
  login: L("Log In", "تسجيل الدخول"),
  create: L("Create Account", "إنشاء الحساب"),
  google: L("Continue with Google", "المتابعة باستخدام Google"),
  or: L("or", "أو"),
  noAccount: L("New to Zayed One?", "جديد على زايد ون؟"),
  createLink: L("Create account", "أنشئ حسابًا"),
  haveAccount: L("Already have an account?", "لديك حساب بالفعل؟"),
  loginLink: L("Log in", "سجّل الدخول"),
  demo: L("Continue as Demo", "المتابعة بالوضع التجريبي"),
  demoNote: L("No account needed — explore the full experience with sample data.", "دون حساب — استكشف التجربة كاملة ببيانات تجريبية."),
  errName: L("Please enter your full name.", "يرجى إدخال اسمك الكامل."),
  errEmail: L("Please enter a valid email address.", "يرجى إدخال بريد إلكتروني صحيح."),
  errPass: L("Password must be at least 8 characters.", "يجب ألا تقل كلمة المرور عن 8 أحرف."),
  errMatch: L("Passwords do not match.", "كلمتا المرور غير متطابقتين."),
  errLogin: L("Incorrect email or password.", "البريد الإلكتروني أو كلمة المرور غير صحيحة."),
  errUnconfirmed: L("Please confirm your email first — check your inbox.", "يرجى تأكيد بريدك الإلكتروني أولًا — تحقّق من صندوق الوارد."),
  errExists: L("An account with this email already exists. Try logging in.", "يوجد حساب بهذا البريد الإلكتروني. جرّب تسجيل الدخول."),
  errGeneric: L("Something went wrong. Please try again, or continue as demo.", "حدث خطأ ما. حاول مجددًا أو تابع بالوضع التجريبي."),
  errGoogle: L("Google sign-in isn't available right now. Use email or continue as demo.", "تسجيل الدخول عبر Google غير متاح حاليًا. استخدم البريد الإلكتروني أو تابع بالوضع التجريبي."),
  checkEmail: L("Account created. Check your email to confirm, then log in.", "تم إنشاء الحساب. تحقّق من بريدك لتأكيده ثم سجّل الدخول."),
};

export function AuthForm({ mode, redirect }: { mode: Mode; redirect?: string | undefined }) {
  const { t } = useLang();
  const { user, setDemo } = useAuth();
  const navigate = useNavigate();
  const target = safePath(redirect);
  const [f, setF] = useState({ name: "", email: "", password: "", confirm: "" });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [formError, setFormError] = useState("");
  const [notice, setNotice] = useState("");
  const [busy, setBusy] = useState<"" | "email" | "google">("");

  useEffect(() => {
    if (user) navigate({ to: target, replace: true });
  }, [user, target, navigate]);

  const field = (k: keyof typeof f, label: string, type: string, auto: string) => (
    <label className="block">
      <span className="mb-1.5 block text-sm font-medium">{label}</span>
      <input
        type={type}
        autoComplete={auto}
        value={f[k]}
        onChange={(e) => setF({ ...f, [k]: e.target.value })}
        aria-invalid={!!errors[k]}
        className={cn(
          "w-full rounded-xl border bg-background px-4 py-3 text-sm outline-none transition focus:border-gold focus:ring-2 focus:ring-gold/30",
          errors[k] ? "border-destructive" : "border-border",
        )}
      />
      {errors[k] && <span className="mt-1 block text-xs text-destructive">{errors[k]}</span>}
    </label>
  );

  const validate = () => {
    const e: Record<string, string> = {};
    if (mode === "signup" && f.name.trim().length < 2) e["name"] = t(T.errName);
    if (!EMAIL_RE.test(f.email.trim())) e["email"] = t(T.errEmail);
    if (f.password.length < 8) e["password"] = t(T.errPass);
    if (mode === "signup" && f.password !== f.confirm) e["confirm"] = t(T.errMatch);
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const submit = async (ev: FormEvent) => {
    ev.preventDefault();
    setFormError(""); setNotice("");
    if (!validate()) return;
    setBusy("email");
    try {
      if (mode === "login") {
        const { error } = await supabase.auth.signInWithPassword({ email: f.email.trim(), password: f.password });
        if (error) setFormError(t(/confirm/i.test(error.message) ? T.errUnconfirmed : /invalid/i.test(error.message) ? T.errLogin : T.errGeneric));
      } else {
        const { data, error } = await supabase.auth.signUp({
          email: f.email.trim(),
          password: f.password,
          options: { emailRedirectTo: window.location.origin + "/login", data: { full_name: f.name.trim() } },
        });
        if (error) setFormError(t(/already|registered/i.test(error.message) ? T.errExists : T.errGeneric));
        else if (!data.session) setNotice(t(T.checkEmail));
      }
    } catch {
      setFormError(t(T.errGeneric));
    } finally {
      setBusy("");
    }
  };

  const google = async () => {
    setFormError(""); setNotice("");
    setBusy("google");
    try {
      rememberPostAuth(target);
      const res = await lovable.auth.signInWithOAuth("google", { redirect_uri: window.location.origin });
      if (res.error) setFormError(t(T.errGoogle));
    } catch {
      setFormError(t(T.errGoogle));
    } finally {
      setBusy("");
    }
  };

  const continueDemo = () => {
    setDemo(true);
    navigate({ to: "/start" });
  };

  const isLogin = mode === "login";
  return (
    <div className="bg-hero geo-pattern px-5 py-14 md:py-20">
      <div className="mx-auto grid max-w-5xl items-center gap-10 md:grid-cols-2">
        <div className="hidden md:block">
          <img src={logoAsset.url} alt="" className="h-28 w-28 rounded-2xl object-cover shadow-luxe" />
          <h1 className="mt-6 font-display text-4xl font-semibold">{t(L("Zayed One", "زايد ون"))}</h1>
          <p className="mt-2 text-lg text-gold-gradient">{t(L("Your Intelligent Gateway to Abu Dhabi.", "بوابتك الذكية إلى أبوظبي"))}</p>
          <p className="mt-6 max-w-sm text-muted-foreground">
            {t(L("One personalised journey across residency, housing, work, family and business — saved to your account.", "رحلة واحدة مخصّصة تشمل الإقامة والسكن والعمل والأسرة والأعمال — محفوظة في حسابك."))}
          </p>
        </div>

        <div className="card-luxe rounded-3xl p-7 md:p-9">
          <div className="mb-6 flex items-center gap-3 md:hidden">
            <img src={logoAsset.url} alt="" className="h-12 w-12 rounded-lg object-cover" />
            <div>
              <div className="font-display text-lg font-semibold">{t(L("Zayed One", "زايد ون"))}</div>
              <div className="text-xs text-muted-foreground">{t(L("Your Intelligent Gateway to Abu Dhabi.", "بوابتك الذكية إلى أبوظبي"))}</div>
            </div>
          </div>
          <h2 className="text-2xl font-semibold">{t(isLogin ? T.loginTitle : T.signupTitle)}</h2>
          <p className="mt-1 text-sm text-muted-foreground">{t(isLogin ? T.loginSub : T.signupSub)}</p>

          <button type="button" onClick={google} disabled={!!busy} className={cn(btn.ghost, "mt-6 w-full py-3")}>
            {busy === "google" ? <Loader2 className="h-4 w-4 animate-spin" /> : <GoogleIcon />} {t(T.google)}
          </button>

          <div className="my-5 flex items-center gap-3 text-xs uppercase tracking-wider text-muted-foreground">
            <span className="h-px flex-1 bg-border" />{t(T.or)}<span className="h-px flex-1 bg-border" />
          </div>

          <form onSubmit={submit} noValidate className="space-y-4">
            {!isLogin && field("name", t(T.name), "text", "name")}
            {field("email", t(T.email), "email", "email")}
            {field("password", t(T.password), "password", isLogin ? "current-password" : "new-password")}
            {!isLogin && field("confirm", t(T.confirm), "password", "new-password")}
            {formError && <p role="alert" className="rounded-xl bg-destructive/10 px-4 py-3 text-sm text-destructive">{formError}</p>}
            {notice && <p role="status" className="rounded-xl bg-turquoise-soft px-4 py-3 text-sm text-turquoise">{notice}</p>}
            <button type="submit" disabled={!!busy} className={cn(btn.primary, "w-full")}>
              {busy === "email" && <Loader2 className="h-4 w-4 animate-spin" />} {t(isLogin ? T.login : T.create)} <Arrow />
            </button>
          </form>

          <p className="mt-5 text-center text-sm text-muted-foreground">
            {t(isLogin ? T.noAccount : T.haveAccount)}{" "}
            <Link to={isLogin ? "/signup" : "/login"} search={{ redirect }} className="font-semibold text-foreground underline decoration-gold underline-offset-4">
              {t(isLogin ? T.createLink : T.loginLink)}
            </Link>
          </p>

          <div className="mt-6 border-t border-border pt-5">
            <button type="button" onClick={continueDemo} className={cn(btn.gold, "w-full")}>
              <Sparkles className="h-4 w-4" /> {t(T.demo)}
            </button>
            <p className="mt-2 text-center text-xs text-muted-foreground">{t(T.demoNote)}</p>
          </div>
        </div>
      </div>
    </div>
  );
}