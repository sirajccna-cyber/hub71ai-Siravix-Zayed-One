export type Lang = "en" | "ar";
export type LText = { en: string; ar: string };
export type Mode = "person" | "company";

export type Facts = {
  // person
  age?: number | undefined;
  country?: LText | undefined;
  city?: LText | undefined;
  profession?: LText | undefined;
  married?: boolean | undefined;
  children?: number | undefined;
  family?: boolean | undefined;
  remote?: boolean | undefined;
  founder?: boolean | undefined;
  investor?: boolean | undefined;
  budget?: string | undefined;
  timing?: LText | undefined;
  priorities: string[];
  spouseWorks?: boolean | undefined;
  familyLater?: boolean | undefined;
  noCar?: boolean | undefined;
  startCompany?: boolean | undefined;
  salaryChange?: boolean | undefined;
  // company
  companyName?: string | undefined;
  industry?: LText | undefined;
  employees?: number | undefined;
  relocating?: number | undefined;
  founders?: number | undefined;
  families?: boolean | undefined;
  timelineDays?: number | undefined;
  goal?: LText | undefined;
  fundingStage?: string | undefined;
  foundersFirst?: boolean | undefined;
  hireLocal?: boolean | undefined;
  smallOffice?: boolean | undefined;
  scaleTo?: number | undefined;
};

export type Engine = "openai" | "fallback";
export type Insights = { constraints: LText[]; unknowns: LText[]; risks: LText[]; verify: LText[]; confidence?: LText | undefined };

export type Profile = {
  mode: Mode;
  raw: string;
  facts: Facts;
  engine?: Engine | undefined;
  /** Why live AI was not used (e.g. "not_configured"), for developer notes only. */
  aiReason?: string | undefined;
  insights?: Insights | undefined;
};

export type Journey = {
  type: Mode;
  title: LText;
  summary: LText;
  profile: Array<{ label: LText; value: LText }>;
  nextActions: Array<{ title: LText; why: LText; category: string; sourceId?: string; graphId?: string; isNew?: boolean }>;
  journeyStages: Array<{ key: string; title: LText; description: LText; status: "complete" | "current" | "upcoming" }>;
  opportunities: Array<{ category: LText; title: LText; why: LText; key: string }>;
  mapPlaces: Array<{ type: string; name: LText; note: LText; minutes?: number }>;
  sources: string[];
  whatIfNote?: LText | undefined;
  engine?: Engine | undefined;
  insights?: Insights | undefined;
  /** Number of Settlement Graph dependencies changed by the last What-If. */
  changedCount?: number | undefined;
  team?: {
    companyName: string;
    totalRelocating: number;
    ready: number;
    documentation: number;
    housing: number;
    familySupport: number;
    actionRequired: number;
  };
};