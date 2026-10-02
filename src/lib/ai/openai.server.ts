/**
 * Server-only OpenAI Journey Engine transport.
 * Uses the OpenAI Responses API with strict JSON-schema Structured Outputs.
 * Provider order: OPENAI_API_KEY (direct OpenAI) → Lovable AI Gateway (OpenAI model).
 * Keys are read inside the call and never leave the server.
 */

type Provider = { url: string; headers: Record<string, string>; model: string; label: string };

export function getProvider(): Provider | null {
  const openaiKey = process.env["OPENAI_API_KEY"];
  if (openaiKey) {
    return {
      url: "https://api.openai.com/v1/responses",
      headers: { Authorization: `Bearer ${openaiKey}` },
      model: process.env["OPENAI_MODEL"] || "gpt-5-mini",
      label: "openai",
    };
  }
  const lovableKey = process.env["LOVABLE_API_KEY"];
  if (lovableKey) {
    return {
      url: "https://ai.gateway.lovable.dev/v1/responses",
      headers: { "Lovable-API-Key": lovableKey, "X-Lovable-AIG-SDK": "fetch" },
      model: "openai/gpt-6-astra",
      label: "gateway",
    };
  }
  return null;
}

export class AIError extends Error {
  constructor(public reason: string, message?: string) {
    super(message ?? reason);
  }
}

/** Streams a structured-output Responses call and returns the parsed JSON. */
export async function callStructured(opts: { system: string; user: string; name: string; schema: Record<string, unknown> }): Promise<{ json: unknown; model: string }> {
  const p = getProvider();
  if (!p) throw new AIError("not_configured");
  const res = await fetch(p.url, {
    method: "POST",
    headers: { "Content-Type": "application/json", ...p.headers },
    body: JSON.stringify({
      model: p.model,
      input: [
        { role: "system", content: opts.system },
        { role: "user", content: opts.user },
      ],
      stream: true,
      store: false,
      reasoning: { effort: "low" },
      text: { format: { type: "json_schema", name: opts.name, schema: opts.schema, strict: true } },
    }),
  });
  if (!res.ok || !res.body) {
    const body = await res.text().catch(() => "");
    console.error("[zayed-ai] provider error", res.status, body.slice(0, 400));
    throw new AIError(`http_${res.status}`);
  }
  const reader = res.body.getReader();
  const dec = new TextDecoder();
  let buf = "";
  let text = "";
  let done = false;
  while (!done) {
    const r = await reader.read();
    if (r.done) break;
    buf += dec.decode(r.value, { stream: true });
    let idx: number;
    while ((idx = buf.indexOf("\n\n")) >= 0) {
      const chunk = buf.slice(0, idx);
      buf = buf.slice(idx + 2);
      for (const line of chunk.split("\n")) {
        if (!line.startsWith("data:")) continue;
        const data = line.slice(5).trim();
        if (!data || data === "[DONE]") continue;
        let ev: { type?: string; delta?: string; response?: { output_text?: string } };
        try { ev = JSON.parse(data); } catch { continue; }
        if (ev.type === "response.output_text.delta" && typeof ev.delta === "string") text += ev.delta;
        else if (ev.type === "response.completed") done = true;
        else if (ev.type === "response.failed" || ev.type === "error" || ev.type === "response.incomplete") {
          console.error("[zayed-ai] stream failure", data.slice(0, 400));
          throw new AIError("stream_failed");
        }
      }
    }
  }
  if (!text.trim()) throw new AIError("empty");
  try {
    return { json: JSON.parse(text), model: p.model };
  } catch {
    throw new AIError("invalid_json");
  }
}