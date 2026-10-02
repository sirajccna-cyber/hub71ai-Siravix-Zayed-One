<!-- LOVABLE:BEGIN -->
> [!IMPORTANT]
> This project is connected to [Lovable](https://lovable.dev). Avoid rewriting
> published git history — force pushing, or rebasing/amending/squashing commits
> that are already pushed — as it rewrites history on Lovable's side and the
> user will likely lose their project history.
>
> Commits you push to the connected branch sync back to Lovable and show up in
> the editor, so keep the branch in a working state.
<!-- LOVABLE:END -->

## Zayed One architecture
- All AI behaviour goes through `src/lib/ai/zayedAI.ts`, which tries the server-side OpenAI Journey Engine (`ai.functions.ts` + `openai.server.ts`, strict JSON schema, zod-validated, graph-id checked) and falls back to the deterministic engine on any failure — the demo must never depend on a live AI call.
- The Settlement Graph (`src/data/settlementGraph.ts`) is the single source of dependency data; Next Actions reference it by `graphId` so the UI can explain triggers, dependencies and unlocks.
- App state (mode, profile, journey) lives in React context + localStorage (`src/lib/store.tsx`); journeys are not stored in the database.
- Auth is optional Lovable Cloud auth via `src/lib/auth.tsx` (AuthProvider/useAuth) with /login and /signup; no route is gated and "Continue as Demo" must always work, so the demo never depends on auth.
- All copy is bilingual `LText {en, ar}` rendered via `useLang().t`; layout uses logical (start/end) utilities so RTL mirrors automatically.