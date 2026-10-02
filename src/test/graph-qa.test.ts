import { SETTLEMENT_GRAPH as G } from "@/data/settlementGraph";
import { OFFICIAL_SOURCES } from "@/lib/sources";
import { test, expect } from "vitest";
test("graph", () => {
  const ids = new Set(G.map((g: any) => g.id)); const src = new Set(OFFICIAL_SOURCES.map((s) => s.id));
  const bad = G.flatMap((g: any) => [...g.dependsOn, ...g.unlocks].filter((x: string) => !ids.has(x)).map((x: string) => g.id + "->" + x));
  const badSrc = G.filter((g: any) => g.sourceId && !src.has(g.sourceId)).map((g: any) => g.id);
  console.log("records", G.length, "bad refs", bad, "bad src", badSrc);
  expect(G.length).toBeGreaterThanOrEqual(60); expect(bad).toEqual([]); expect(badSrc).toEqual([]);
});