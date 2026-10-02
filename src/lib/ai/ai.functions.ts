/**
 * OpenAI Journey Engine — server functions.
 * Every response is validated with zod and against the Settlement Graph /
 * official source registry before it is returned. Any failure returns
 * { ok: false } so the client falls back to the deterministic engine.
 */
import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { getNode, graphFor, graphIdsFor } from "@/data/settlementGraph";
import { OFFICIAL_SOURCES } from "@/lib/sources";

type Fail = { ok: false; reason: string };

const LT = { type: "object", additionalProperties: false, required: ["en", "ar"], properties: { en: { type: "string" }, ar: { type: "string" } } } as const;
const LTn = { anyOf: [LT, { type: "null" }] } as const;
const S = { type: ["string", "null"] } as const;
const N = { type: ["number", "null"] } as const;
const B = { type: ["boolean", "null"] } as const;
const obj = (properties: Record<string, unknown>) => ({ type: "object", additionalProperties: false, required: Object.keys(properties), properties });
const arr = (items: unknown) => ({ type: "array", items });

const zLT = z.object({ en: z.string().min(1).max(400), ar: z.string().min(1).max(400) });
const zLTn = zLT.nullable();

const SOURCE_IDS = OFFICIAL_SOURCES.map((s) => s.id);
const SYSTEM_BASE = `You are the Zayed One Journey Engine, an orchestration layer that helps people and companies move to Abu Dhabi.
Rules: never invent details the user did not give (use null). Never guarantee visas, residency, licences, jobs or investment outcomes; use wording like "potential pathway", "relevant option", "official confirmation required". Write every bilingual field in concise English and professional Modern Standard Arabic. Keep each text under 160 characters.`;

async function run<T>(name: string, schema: Record<string, unknown>, system: string, user: string, parse: (x: unknown) => T): Promise<({ ok: true; model: string } & T) | Fail> {
  try {
    const { callStructured, AIError } = await import("./openai.server");
    try {
      const { json, model } = await callStructured({ system, user, name, schema });
      return { ok: true, model, ...parse(json) };
    } catch (e) {
      if (e instanceof AIError) return { ok: false, reason: e.reason };
      console.error("[zayed-ai] validation failed", name, e instanceof Error ? e.message.slice(0, 300) : e);
      return { ok: false, reason: "invalid_response" };
    }
  } catch (e) {
    console.error("[zayed-ai] unexpected", e);
    return { ok: false, reason: "error" };
  }
}

function graphContext(mode: "person" | "company") {
  return graphFor(mode)
    .map((g) => `${g.id} | ${g.requirement.en} | trigger: ${g.trigger.en} | dependsOn: ${g.dependsOn.join(",") || "-"} | unlocks: ${g.unlocks.join(",") || "-"} | source: ${g.sourceId ?? "-"} | ${g.verification}`)
    .join("\n");
}

const actionSchema = (ids: string[]) => obj({ graphId: { type: "string", enum: ids }, title: LT, why: LT, sourceId: { type: ["string", "null"], enum: [...SOURCE_IDS, null] } });
const zAction = z.object({ graphId: z.string(), title: zLT, why: zLT, sourceId: z.string().nullable() });

function cleanActions(mode: "person" | "company", raw: z.infer<typeof zAction>[]) {
  const valid = new Set(graphIdsFor(mode));
  const seen = new Set<string>();
  const out = raw.filter((a) => valid.has(a.graphId) && !seen.has(a.graphId) && seen.add(a.graphId)).map((a) => ({
    graphId: a.graphId,
    category: getNode(a.graphId)?.category ?? "move",
    title: a.title,
    why: a.why,
    ...(a.sourceId && SOURCE_IDS.includes(a.sourceId) ? { sourceId: a.sourceId } : {}),
  }));
  if (out.length < 3) throw new Error("fewer than 3 valid actions");
  return out.slice(0, 3);
}

/* ---------------- status ---------------- */
export const aiStatus = createServerFn({ method: "GET" }).handler(async () => {
  const { getProvider } = await import("./openai.server");
  return { configured: !!getProvider() };
});

/* ---------------- A. profile understanding ---------------- */
const factsShape = {
  age: N, country: LTn, city: LTn, profession: LTn, married: B, children: N, family: B, remote: B, founder: B, investor: B, budget: S,
  companyName: S, industry: LTn, employees: N, relocating: N, founders: N, families: B, timelineDays: N, goal: LTn, fundingStage: S,
};
const zFacts = z.object({
  age: z.number().int().min(0).max(120).nullable(), country: zLTn, city: zLTn, profession: zLTn, married: z.boolean().nullable(), children: z.number().int().min(0).max(20).nullable(),
  family: z.boolean().nullable(), remote: z.boolean().nullable(), founder: z.boolean().nullable(), investor: z.boolean().nullable(), budget: z.string().max(80).nullable(),
  companyName: z.string().max(80).nullable(), industry: zLTn, employees: z.number().int().min(0).max(1_000_000).nullable(), relocating: z.number().int().min(0).max(100_000).nullable(),
  founders: z.number().int().min(0).max(50).nullable(), families: z.boolean().nullable(), timelineDays: z.number().int().min(0).max(3650).nullable(), goal: zLTn, fundingStage: z.string().max(60).nullable(),
});
const zProfile = z.object({
  mode: z.enum(["person", "company"]),
  facts: zFacts,
  priorities: z.array(z.string().max(40)).max(8),
  constraints: z.array(zLT).max(6),
  unknowns: z.array(zLT).max(6),
  confidence: zLT,
});

export const aiAnalyze = createServerFn({ method: "POST" })
  .inputValidator((d: { text: string; mode: "person" | "company" }) => z.object({ text: z.string().min(1).max(2000), mode: z.enum(["person", "company"]) }).parse(d))
  .handler(async ({ data }) => {
    const schema = obj({
      mode: { type: "string", enum: ["person", "company"] },
      facts: obj(factsShape),
      priorities: arr({ type: "string", enum: ["career", "family", "schools", "lifestyle", "business", "investment", "housing", "cost"] }),
      constraints: arr(LT),
      unknowns: arr(LT),
      confidence: LT,
    });
    return run("zayed_profile", schema, `${SYSTEM_BASE}\nTask: extract a structured relocation profile. The user selected mode "${data.mode}". Constraints = hard limits stated (timeline, family, budget). Unknowns = important missing details Zayed One should ask about (max 4). Confidence = one short note on how certain the extraction is.`, data.text, (j) => {
      const p = zProfile.parse(j);
      return { mode: p.mode, facts: p.facts, priorities: p.priorities, constraints: p.constraints, unknowns: p.unknowns, confidence: p.confidence };
    });
  });

/* ---------------- B. journey orchestration ---------------- */
const zJourney = z.object({ summary: zLT, nextActions: z.array(zAction).min(3).max(5), currentStage: z.string(), risks: z.array(zLT).max(5), verify: z.array(zLT).max(5), sources: z.array(z.string()).max(10) });
const STAGES = { person: ["discover", "decide", "prepare", "move", "settle", "belong", "grow"], company: ["explore", "establish", "relocate", "operate", "connect", "grow"] };

export const aiJourney = createServerFn({ method: "POST" })
  .inputValidator((d: { mode: "person" | "company"; raw: string; facts: Record<string, unknown> }) =>
    z.object({ mode: z.enum(["person", "company"]), raw: z.string().max(2000), facts: z.record(z.unknown()) }).parse(d))
  .handler(async ({ data }) => {
    const ids = graphIdsFor(data.mode);
    const schema = obj({
      summary: LT,
      nextActions: arr(actionSchema(ids)),
      currentStage: { type: "string", enum: STAGES[data.mode] },
      risks: arr(LT),
      verify: arr(LT),
      sources: arr({ type: "string", enum: SOURCE_IDS }),
    });
    const system = `${SYSTEM_BASE}\nTask: orchestrate the user's Abu Dhabi journey using the Zayed One Settlement Graph below (id | requirement | trigger | dependsOn | unlocks | source | verification).
Choose EXACTLY 3 nextActions as graph ids. Respect dependencies: prefer nodes whose prerequisites are already satisfied or that unblock the most downstream items for THIS profile. Personalise title and why to the profile. Risks = up to 3 dependency risks or blockers. Verify = up to 3 items needing official confirmation. Sources = relevant official source ids.
SETTLEMENT GRAPH:\n${graphContext(data.mode)}`;
    const user = JSON.stringify({ story: data.raw, profile: data.facts });
    return run("zayed_journey", schema, system, user, (j) => {
      const p = zJourney.parse(j);
      return {
        summary: p.summary,
        nextActions: cleanActions(data.mode, p.nextActions),
        currentStage: STAGES[data.mode].includes(p.currentStage) ? p.currentStage : STAGES[data.mode][1]!,
        risks: p.risks,
        verify: p.verify,
        sources: p.sources.filter((s) => SOURCE_IDS.includes(s)),
      };
    });
  });

/* ---------------- C. what-if recalculation ---------------- */
const patchShape = { spouseWorks: B, familyLater: B, noCar: B, startCompany: B, salaryChange: B, remote: B, foundersFirst: B, hireLocal: B, smallOffice: B, scaleTo: N, relocating: N };
const zPatch = z.object({
  spouseWorks: z.boolean().nullable(), familyLater: z.boolean().nullable(), noCar: z.boolean().nullable(), startCompany: z.boolean().nullable(), salaryChange: z.boolean().nullable(), remote: z.boolean().nullable(),
  foundersFirst: z.boolean().nullable(), hireLocal: z.boolean().nullable(), smallOffice: z.boolean().nullable(), scaleTo: z.number().int().min(1).max(100_000).nullable(), relocating: z.number().int().min(0).max(100_000).nullable(),
});
const zWhatIf = z.object({ patch: zPatch, changedDependencies: z.array(z.string()).max(12), whatChanged: zLT, nextActions: z.array(zAction).min(3).max(5) });

export const aiWhatIf = createServerFn({ method: "POST" })
  .inputValidator((d: { mode: "person" | "company"; raw: string; facts: Record<string, unknown>; scenario: string; previous: string[] }) =>
    z.object({ mode: z.enum(["person", "company"]), raw: z.string().max(2000), facts: z.record(z.unknown()), scenario: z.string().min(1).max(500), previous: z.array(z.string()).max(5) }).parse(d))
  .handler(async ({ data }) => {
    const ids = graphIdsFor(data.mode);
    const schema = obj({ patch: obj(patchShape), changedDependencies: arr({ type: "string", enum: ids }), whatChanged: LT, nextActions: arr(actionSchema(ids)) });
    const system = `${SYSTEM_BASE}\nTask: recalculate the journey for a What-If scenario. Return a patch of profile flags that the scenario changes (null = unchanged; "relocating" = new number of relocating employees; "scaleTo" = growth target headcount). changedDependencies = Settlement Graph node ids whose status, priority or sequence changes because of this scenario (be precise, 2-6 typical). whatChanged = one concise sentence explaining what changed and why. nextActions = EXACTLY 3 updated graph-based actions.
SETTLEMENT GRAPH:\n${graphContext(data.mode)}`;
    const user = JSON.stringify({ story: data.raw, profile: data.facts, previousNextActions: data.previous, scenario: data.scenario });
    return run("zayed_whatif", schema, system, user, (j) => {
      const p = zWhatIf.parse(j);
      const valid = new Set(ids);
      return { patch: p.patch, changedDependencies: [...new Set(p.changedDependencies.filter((x) => valid.has(x)))], whatChanged: p.whatChanged, nextActions: cleanActions(data.mode, p.nextActions) };
    });
  });