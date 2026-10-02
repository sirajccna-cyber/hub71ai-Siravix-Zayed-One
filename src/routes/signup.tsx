import { createFileRoute } from "@tanstack/react-router";
import { AuthForm } from "@/components/zayed/AuthForm";

export const Route = createFileRoute("/signup")({
  validateSearch: (s: Record<string, unknown>): { redirect?: string | undefined } => ({
    redirect: typeof s["redirect"] === "string" ? s["redirect"] : undefined,
  }),
  head: () => ({
    meta: [
      { title: "Create account — Zayed One" },
      { name: "description", content: "Create a Zayed One account to save your Abu Dhabi relocation journey." },
      { property: "og:title", content: "Create account — Zayed One" },
      { property: "og:description", content: "Save your Abu Dhabi relocation journey." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: () => <AuthForm mode="signup" redirect={Route.useSearch().redirect} />,
});