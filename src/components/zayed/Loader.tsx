import { useEffect, useState } from "react";
import { Check } from "lucide-react";
import { useLang } from "@/lib/i18n";
import type { LText } from "@/lib/types";
import { cn } from "@/lib/utils";
import logoAsset from "@/assets/zayed-one-logo.png.asset.json";

export function StepLoader({ steps }: { steps: LText[] }) {
  const { t } = useLang();
  const [i, setI] = useState(0);
  useEffect(() => {
    const id = setInterval(() => setI((x) => Math.min(x + 1, steps.length - 1)), 650);
    return () => clearInterval(id);
  }, [steps.length]);
  return (
    <div className="card-luxe mx-auto max-w-lg p-8 fade-up">
      <img src={logoAsset.url} alt="" className="mx-auto mb-5 h-20 w-20 rounded-lg object-cover shadow-luxe" />
      <div className="mb-6 h-1 w-full overflow-hidden rounded-full bg-muted"><div className="h-full w-full shimmer-line" /></div>
      <ul className="space-y-4">
        {steps.map((s, k) => (
          <li key={s.en} className={cn("flex items-center gap-3 transition", k > i && "opacity-30")}>
            <span className={cn("grid h-6 w-6 place-items-center rounded-full border", k < i ? "border-turquoise bg-turquoise text-card" : k === i ? "border-gold pulse-ring" : "border-border")}>
              {k < i && <Check className="h-3.5 w-3.5" />}
            </span>
            <span className="font-medium">{t(s)}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}